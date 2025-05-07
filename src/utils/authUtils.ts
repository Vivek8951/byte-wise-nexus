
import { User, UserRole } from '@/types';
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches a user profile from the database
 */
export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Fetch enrolled courses
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('user_id', userId);
    
    const enrolledCourses = enrollments?.map(enrollment => enrollment.course_id) || [];
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      avatar: data.avatar,
      enrolledCourses
    };
  } catch (err) {
    console.error("Error in fetchUserProfile:", err);
    return null;
  }
};
