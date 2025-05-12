
import { Course, Video, Note, VideoDownloadInfo } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export const uploadContent = async (file: File, storagePath: string): Promise<{ data: { path: string } | null, error: any }> => {
  const { data, error } = await supabase
    .storage
    .from('content')
    .upload(`${storagePath}/${file.name}`, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  return { data, error };
}

// Function that was missing - used in VideoUploader.tsx
export const uploadFile = async (file: File, bucketName: string, filePath: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }
    
    // Get the public URL
    const { data: urlData } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error('Unexpected error uploading file:', error);
    return null;
  }
}

export const deleteContent = async (filePath: string): Promise<{ data: any | null, error: any }> => {
  const { data, error } = await supabase
    .storage
    .from('content')
    .remove([filePath])
  
  return { data, error };
}

export const getPublicUrl = (storagePath: string): string => {
  const { data } = supabase
    .storage
    .from('content')
    .getPublicUrl(storagePath)
  
  return data.publicUrl;
}

export const createCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Course | null, error: any }> => {
  const { data, error } = await supabase
    .from('courses')
    .insert([{
      title: course.title,
      description: course.description,
      category: course.category,
      thumbnail: course.thumbnail,
      instructor: course.instructor,
      duration: course.duration,
      level: course.level,
      rating: course.rating,
      enrolled_count: course.enrolledCount,
      featured: course.featured
    }])
    .select()
    .single()
  
  if (error) {
    return { data: null, error };
  }
  
  // Map the snake_case to camelCase for our Course interface
  const mappedData: Course = {
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.category,
    thumbnail: data.thumbnail,
    instructor: data.instructor,
    duration: data.duration,
    level: data.level as 'beginner' | 'intermediate' | 'advanced',
    rating: data.rating,
    enrolledCount: data.enrolled_count,
    featured: data.featured || false,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
  
  return { data: mappedData, error: null };
}

export const updateCourse = async (id: string, course: Partial<Course>): Promise<{ data: Course | null, error: any }> => {
  // Transform data for Supabase (camelCase to snake_case)
  const supabaseData: any = {};
  
  if (course.title) supabaseData.title = course.title;
  if (course.description) supabaseData.description = course.description;
  if (course.category) supabaseData.category = course.category;
  if (course.thumbnail) supabaseData.thumbnail = course.thumbnail;
  if (course.instructor) supabaseData.instructor = course.instructor;
  if (course.duration) supabaseData.duration = course.duration;
  if (course.level) supabaseData.level = course.level;
  if (course.rating !== undefined) supabaseData.rating = course.rating;
  if (course.enrolledCount !== undefined) supabaseData.enrolled_count = course.enrolledCount;
  if (course.featured !== undefined) supabaseData.featured = course.featured;
  
  const { data, error } = await supabase
    .from('courses')
    .update(supabaseData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    return { data: null, error };
  }
  
  // Map snake_case to camelCase
  const mappedData: Course = {
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.category,
    thumbnail: data.thumbnail,
    instructor: data.instructor,
    duration: data.duration,
    level: data.level as 'beginner' | 'intermediate' | 'advanced',
    rating: data.rating,
    enrolledCount: data.enrolled_count,
    featured: data.featured || false,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
  
  return { data: mappedData, error: null };
}

export const deleteCourse = async (id: string): Promise<{ data: any | null, error: any }> => {
  const { data, error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)
  
  return { data, error };
}

// Function that was missing - used in VideoPlayerWithAnalysis.tsx
export const processVideo = async (videoId: string, courseId: string): Promise<{
  success: boolean;
  message?: string;
  data?: {
    videoUrl?: string;
    title?: string;
    description?: string;
    thumbnail?: string;
    analyzedContent?: any[];
    downloadInfo?: VideoDownloadInfo;
  };
}> => {
  try {
    const { data, error } = await supabase.functions.invoke("process-video", {
      body: { videoId, courseId },
    });

    if (error) {
      console.error("Error processing video:", error);
      return {
        success: false,
        message: `Error processing video: ${error.message || "Unknown error"}`
      };
    }

    return {
      success: true,
      data: data || {}
    };
  } catch (error: any) {
    console.error("Unexpected error processing video:", error);
    return {
      success: false,
      message: `Unexpected error: ${error.message || "Unknown error"}`
    };
  }
}

// Function that was missing - used in VideoPlayerWithAnalysis.tsx
export const getVideoForCourse = async (videoId: string, courseId: string): Promise<{
  success: boolean;
  message?: string;
  videoUrl?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  downloadInfo?: any;
}> => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('course_id', courseId)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching video:", error);
      return {
        success: false,
        message: `Database error: ${error.message}`
      };
    }
    
    if (!data) {
      return {
        success: false,
        message: "Video not found"
      };
    }
    
    return {
      success: true,
      videoUrl: data.url,
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail,
      downloadInfo: data.download_info
    };
  } catch (error: any) {
    console.error("Unexpected error getting video:", error);
    return {
      success: false,
      message: `Unexpected error: ${error.message}`
    };
  }
}

export const getVideoByCourseId = async (courseId: string): Promise<Video[]> => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('course_id', courseId)
    .order('order_num', { ascending: true })
  
  if (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
  
  // Convert database format to our Video interface format
  const videos: Video[] = data?.map(video => ({
    id: video.id,
    courseId: video.course_id,
    title: video.title,
    description: video.description,
    url: video.url,
    duration: video.duration,
    thumbnail: video.thumbnail || undefined,
    order: video.order_num,
    analyzedContent: video.analyzed_content as any[] || undefined,
    download_info: video.download_info as VideoDownloadInfo || undefined
  })) || [];
  
  return videos;
}

export const addVideo = async (video: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Video | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .insert({
        course_id: video.courseId,
        title: video.title,
        description: video.description,
        url: video.url,
        duration: video.duration,
        thumbnail: video.thumbnail,
        order_num: video.order,
        analyzed_content: video.analyzedContent || null,
        download_info: video.download_info || null
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Map to our Video interface
    const newVideo: Video = {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      description: data.description,
      url: data.url,
      duration: data.duration,
      thumbnail: data.thumbnail || undefined,
      order: data.order_num,
      analyzedContent: data.analyzed_content as any[] || undefined,
      download_info: data.download_info as VideoDownloadInfo || undefined
    };
    
    return { data: newVideo, error: null };
  } catch (error) {
    console.error("Error adding video:", error);
    return { data: null, error };
  }
}

export const updateVideo = async (id: string, video: Partial<Video>): Promise<{ data: Video | null, error: any }> => {
  try {
    const supabaseData: any = {};
    
    if (video.courseId) supabaseData.course_id = video.courseId;
    if (video.title) supabaseData.title = video.title;
    if (video.description) supabaseData.description = video.description;
    if (video.url) supabaseData.url = video.url;
    if (video.duration) supabaseData.duration = video.duration;
    if (video.thumbnail) supabaseData.thumbnail = video.thumbnail;
    if (video.order !== undefined) supabaseData.order_num = video.order;
    if (video.analyzedContent) supabaseData.analyzed_content = video.analyzedContent;
    if (video.download_info) supabaseData.download_info = video.download_info;
    
    const { data, error } = await supabase
      .from('videos')
      .update(supabaseData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Map to our Video interface
    const updatedVideo: Video = {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      description: data.description,
      url: data.url,
      duration: data.duration,
      thumbnail: data.thumbnail || undefined,
      order: data.order_num,
      analyzedContent: data.analyzed_content as any[] || undefined,
      download_info: data.download_info as VideoDownloadInfo || undefined
    };
    
    return { data: updatedVideo, error: null };
  } catch (error) {
    console.error("Error updating video:", error);
    return { data: null, error };
  }
}

export const deleteVideo = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error("Error deleting video:", error);
  }
}

export const getNoteByCourseId = async (courseId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('course_id', courseId)
    .order('order_num', { ascending: true })
  
  if (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
  
  // Convert database format to our Note interface format
  const notes: Note[] = data?.map(note => ({
    id: note.id,
    courseId: note.course_id,
    title: note.title,
    description: note.description,
    fileUrl: note.file_url,
    fileType: note.file_type as 'pdf' | 'doc' | 'txt',
    order: note.order_num
  })) || [];
  
  return notes;
}

export const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Note | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        course_id: note.courseId,
        title: note.title,
        description: note.description,
        file_url: note.fileUrl,
        file_type: note.fileType,
        order_num: note.order
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Map to Note interface
    const newNote: Note = {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      description: data.description,
      fileUrl: data.file_url,
      fileType: data.file_type as 'pdf' | 'doc' | 'txt',
      order: data.order_num
    };
    
    return { data: newNote, error: null };
  } catch (error) {
    console.error("Error adding note:", error);
    return { data: null, error };
  }
}

export const updateNote = async (id: string, note: Partial<Note>): Promise<{ data: Note | null, error: any }> => {
  try {
    const supabaseData: any = {};
    
    if (note.courseId) supabaseData.course_id = note.courseId;
    if (note.title) supabaseData.title = note.title;
    if (note.description) supabaseData.description = note.description;
    if (note.fileUrl) supabaseData.file_url = note.fileUrl;
    if (note.fileType) supabaseData.file_type = note.fileType;
    if (note.order !== undefined) supabaseData.order_num = note.order;
    
    const { data, error } = await supabase
      .from('notes')
      .update(supabaseData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Map to Note interface
    const updatedNote: Note = {
      id: data.id,
      courseId: data.course_id,
      title: data.title,
      description: data.description,
      fileUrl: data.file_url,
      fileType: data.file_type as 'pdf' | 'doc' | 'txt',
      order: data.order_num
    };
    
    return { data: updatedNote, error: null };
  } catch (error) {
    console.error("Error updating note:", error);
    return { data: null, error };
  }
}

export const deleteNote = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error("Error deleting note:", error);
  }
}

export const populateCourses = async (
  courseCount = 5, 
  options: { clearExisting?: boolean } = {}
): Promise<{ success: boolean; message: string; coursesGenerated?: number }> => {
  const { clearExisting = false } = options;
  
  // Validate input
  if (courseCount <= 0 || courseCount > 15) {
    return {
      success: false,
      message: "Please specify between 1 and 15 courses to generate"
    };
  }

  try {
    // Clear existing courses if specified
    if (clearExisting) {
      const { error: deleteVideosError } = await supabase
        .from('videos')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      const { error: deleteNotesError } = await supabase
        .from('notes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      const { error: deleteCoursesError } = await supabase
        .from('courses')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteCoursesError || deleteVideosError || deleteNotesError) {
        throw new Error("Failed to clear existing courses");
      }
    }
    
    console.log(`Generating ${courseCount} courses with AI`);
    
    // Call the Supabase Edge Function to generate courses
    const { data, error } = await supabase.functions.invoke('populate-courses', {
      body: {
        courseCount,
        clearExisting,
      },
    });

    if (error) {
      console.error("Error calling course generation function:", error);
      return {
        success: false,
        message: `Error calling course generation: ${error.message}`,
      };
    }
    
    if (!data || !data.success) {
      console.error("Course generation failed:", data?.message || "Unknown error");
      return {
        success: false,
        message: data?.message || "Course generation failed with an unknown error",
      };
    }

    return {
      success: true,
      message: `Successfully generated ${data.coursesGenerated || courseCount} courses`,
      coursesGenerated: data.coursesGenerated || courseCount
    };
  } catch (error: any) {
    console.error("Error generating courses:", error);
    return {
      success: false,
      message: `Error generating courses: ${error.message}`,
    };
  }
}
