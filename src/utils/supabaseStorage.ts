
import { Course, Video, Note, VideoDownloadInfo } from "@/types";
import { supabase } from "@/integrations/supabase/client";

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
    .insert([course])
    .select()
    .single()
  
  return { data, error };
}

export const updateCourse = async (id: string, course: Partial<Course>): Promise<{ data: Course | null, error: any }> => {
  const { data, error } = await supabase
    .from('courses')
    .update(course)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error };
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
    .eq('courseId', courseId)
    .order('order', { ascending: true })
  
  if (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
  
  return data || [];
}

export const addVideo = async (video: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Video | null, error: any }> => {
  const { data, error } = await supabase
    .from('videos')
    .insert([video])
    .select()
    .single()
  
  return { data, error };
}

export const updateVideo = async (id: string, video: Partial<Video>): Promise<{ data: Video | null, error: any }> => {
  const { data, error } = await supabase
    .from('videos')
    .update(video)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error };
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
    .eq('courseId', courseId)
    .order('order', { ascending: true })
  
  if (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
  
  return data || [];
}

export const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Note | null, error: any }> => {
  const { data, error } = await supabase
    .from('notes')
    .insert([note])
    .select()
    .single()
  
  return { data, error };
}

export const updateNote = async (id: string, note: Partial<Note>): Promise<{ data: Note | null, error: any }> => {
  const { data, error } = await supabase
    .from('notes')
    .update(note)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error };
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
