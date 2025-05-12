import { Course, Video, Note } from "@/types";
import { getSupabase } from "./supabase";

export const uploadContent = async (file: File, storagePath: string): Promise<{ data: { path: string } | null, error: any }> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .storage
    .from('content')
    .upload(`${storagePath}/${file.name}`, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  return { data, error };
}

export const deleteContent = async (filePath: string): Promise<{ data: any | null, error: any }> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .storage
    .from('content')
    .remove([filePath])
  
  return { data, error };
}

export const getPublicUrl = (storagePath: string): string => {
  const supabase = getSupabase();
  const { data } = supabase
    .storage
    .from('content')
    .getPublicUrl(storagePath)
  
  return data.publicUrl;
}

export const createCourse = async (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ data: Course | null, error: any }> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('courses')
    .insert([course])
    .select()
    .single()
  
  return { data, error };
}

export const updateCourse = async (id: string, course: Partial<Course>): Promise<{ data: Course | null, error: any }> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('courses')
    .update(course)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error };
}

export const deleteCourse = async (id: string): Promise<{ data: any | null, error: any }> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)
  
  return { data, error };
}

export const getVideoByCourseId = async (courseId: string): Promise<Video[]> => {
  const supabase = getSupabase();
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
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('videos')
    .insert([video])
    .select()
    .single()
  
  return { data, error };
}

export const updateVideo = async (id: string, video: Partial<Video>): Promise<{ data: Video | null, error: any }> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('videos')
    .update(video)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error };
}

export const deleteVideo = async (id: string): Promise<void> => {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error("Error deleting video:", error);
  }
}

export const getNoteByCourseId = async (courseId: string): Promise<Note[]> => {
  const supabase = getSupabase();
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
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('notes')
    .insert([note])
    .select()
    .single()
  
  return { data, error };
}

export const updateNote = async (id: string, note: Partial<Note>): Promise<{ data: Note | null, error: any }> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('notes')
    .update(note)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error };
}

export const deleteNote = async (id: string): Promise<void> => {
  const supabase = getSupabase();
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
  const supabase = getSupabase();
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
};
