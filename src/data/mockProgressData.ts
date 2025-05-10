import { CourseProgress, CourseEnrollment } from '../types';
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

// This simulates data that would normally come from a backend server
export const mockCourseProgress: CourseProgress[] = [
  {
    userId: '2',
    courseId: '1',
    completedVideos: ['1', '2'],
    completedQuizzes: ['quiz-1'],
    lastAccessed: '2023-06-22',
    overallProgress: 40,
  },
  {
    userId: '2',
    courseId: '3',
    completedVideos: ['6', '7'],
    completedQuizzes: [],
    lastAccessed: '2023-07-10',
    overallProgress: 25,
  },
  {
    userId: '3',
    courseId: '2',
    completedVideos: ['4', '5'],
    completedQuizzes: ['quiz-2'],
    lastAccessed: '2023-08-05',
    overallProgress: 60,
  },
  {
    userId: '3',
    courseId: '4',
    completedVideos: ['8'],
    completedQuizzes: [],
    lastAccessed: '2023-09-12',
    overallProgress: 15,
  },
];

export const mockEnrollments: CourseEnrollment[] = [
  {
    userId: '2',
    courseId: '1',
    enrollmentDate: '2023-05-15',
    isCompleted: false,
    certificateIssued: false,
  },
  {
    userId: '2',
    courseId: '3',
    enrollmentDate: '2023-06-02',
    isCompleted: false,
    certificateIssued: false,
  },
  {
    userId: '3',
    courseId: '2',
    enrollmentDate: '2023-05-20',
    isCompleted: false,
    certificateIssued: false,
  },
  {
    userId: '3',
    courseId: '4',
    enrollmentDate: '2023-06-10',
    isCompleted: false,
    certificateIssued: false,
  },
];

// Simulate API calls with timeouts to make it feel more like real backend requests
const simulateApiCall = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 800); // 800ms delay to simulate network request
  });
};

export const getUserCourseProgress = async (userId: string, courseId: string): Promise<CourseProgress | undefined> => {
  console.log(`[API] Fetching progress for user ${userId} on course ${courseId}`);
  
  try {
    // First try to get progress from Supabase
    const { data: dbProgress, error } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();
    
    if (error && !error.message.includes('No rows found')) {
      console.error("Error fetching course progress:", error);
    }
    
    if (dbProgress) {
      // Map Supabase data to our CourseProgress interface
      // Convert JSON array to string array for completedVideos and completedQuizzes
      const completedVideos = Array.isArray(dbProgress.completed_videos) 
        ? dbProgress.completed_videos.map(id => String(id)) 
        : [];
      
      const completedQuizzes = Array.isArray(dbProgress.completed_quizzes) 
        ? dbProgress.completed_quizzes.map(id => String(id)) 
        : [];
      
      return {
        userId: dbProgress.user_id,
        courseId: dbProgress.course_id,
        completedVideos: completedVideos,
        completedQuizzes: completedQuizzes,
        lastAccessed: dbProgress.last_accessed,
        overallProgress: dbProgress.overall_progress || 0,
      };
    }
  } catch (error) {
    console.error("Error fetching progress from database:", error);
  }
  
  // Fallback to mock data if we couldn't get from Supabase
  return simulateApiCall(
    mockCourseProgress.find(
      progress => progress.userId === userId && progress.courseId === courseId
    )
  );
};

export const getUserEnrollments = async (userId: string): Promise<CourseEnrollment[]> => {
  console.log(`[API] Fetching all enrollments for user ${userId}`);
  
  try {
    // First try to get enrollments from Supabase
    const { data: dbEnrollments, error } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error fetching enrollments:", error);
      throw error;
    }
    
    if (dbEnrollments && dbEnrollments.length > 0) {
      // Map Supabase data to our CourseEnrollment interface
      return dbEnrollments.map(enrollment => ({
        userId: enrollment.user_id,
        courseId: enrollment.course_id,
        enrollmentDate: enrollment.enrollment_date,
        isCompleted: enrollment.is_completed || false,
        certificateIssued: enrollment.certificate_issued || false,
      }));
    }
  } catch (error) {
    console.error("Error fetching enrollments from database:", error);
  }
  
  // Fallback to mock data
  return simulateApiCall(
    mockEnrollments.filter(enrollment => enrollment.userId === userId)
  );
};

export const isUserEnrolled = async (userId: string, courseId: string): Promise<boolean> => {
  console.log(`[API] Checking if user ${userId} is enrolled in course ${courseId}`);
  
  try {
    // First check in Supabase
    const { data: dbEnrollment, error } = await supabase
      .from('course_enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();
    
    if (error && !error.message.includes('No rows found')) {
      console.error("Error checking enrollment:", error);
    }
    
    if (dbEnrollment) {
      return true;
    }
  } catch (error) {
    console.error("Error checking enrollment in database:", error);
  }
  
  // Fallback to mock data
  return simulateApiCall(
    mockEnrollments.some(
      enrollment => enrollment.userId === userId && enrollment.courseId === courseId
    )
  );
};

export const enrollUserInCourse = async (userId: string, courseId: string): Promise<CourseEnrollment> => {
  console.log(`[API] Enrolling user ${userId} in course ${courseId}`);
  
  try {
    // First try to enroll in Supabase
    const { data: dbEnrollment, error } = await supabase
      .from('course_enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        enrollment_date: new Date().toISOString(),
        is_completed: false,
        certificate_issued: false
      })
      .select('*')
      .single();
    
    if (error) {
      console.error("Error enrolling in Supabase:", error);
    }
    
    if (dbEnrollment) {
      // Map Supabase data to our CourseEnrollment interface
      return {
        userId: dbEnrollment.user_id,
        courseId: dbEnrollment.course_id,
        enrollmentDate: dbEnrollment.enrollment_date,
        isCompleted: dbEnrollment.is_completed || false,
        certificateIssued: dbEnrollment.certificate_issued || false,
      };
    }
  } catch (error) {
    console.error("Error enrolling in course in database:", error);
  }
  
  // Check if already enrolled in mock data
  const alreadyEnrolled = mockEnrollments.some(
    e => e.userId === userId && e.courseId === courseId
  );
  
  if (alreadyEnrolled) {
    toast("You are already enrolled in this course");
    return simulateApiCall(
      mockEnrollments.find(e => e.userId === userId && e.courseId === courseId)!
    );
  }
  
  // Fallback to mock enrollment
  const newEnrollment: CourseEnrollment = {
    userId,
    courseId,
    enrollmentDate: new Date().toISOString().split('T')[0],
    isCompleted: false,
    certificateIssued: false,
  };
  
  mockEnrollments.push(newEnrollment);
  
  // Initialize progress tracking
  const newProgress: CourseProgress = {
    userId,
    courseId,
    completedVideos: [],
    completedQuizzes: [],
    lastAccessed: new Date().toISOString().split('T')[0],
    overallProgress: 0,
  };
  
  mockCourseProgress.push(newProgress);
  
  // Simulate API call
  return simulateApiCall(newEnrollment);
};

export const updateCourseProgress = async (
  userId: string, 
  courseId: string,
  data: Partial<CourseProgress>
): Promise<CourseProgress | undefined> => {
  console.log(`[API] Updating progress for user ${userId} on course ${courseId}`, data);
  
  try {
    // First try to update in Supabase
    const supabaseData: any = {
      user_id: userId,
      course_id: courseId,
      last_accessed: new Date().toISOString()
    };
    
    if (data.completedVideos) supabaseData.completed_videos = data.completedVideos;
    if (data.completedQuizzes) supabaseData.completed_quizzes = data.completedQuizzes;
    if (data.overallProgress !== undefined) supabaseData.overall_progress = data.overallProgress;
    
    const { data: dbProgress, error } = await supabase
      .from('course_progress')
      .upsert(supabaseData)
      .select('*')
      .single();
    
    if (error) {
      console.error("Error updating course progress in Supabase:", error);
    }
    
    if (dbProgress) {
      // If progress is 100%, update the enrollment record
      if (dbProgress.overall_progress >= 100) {
        const { error: enrollError } = await supabase
          .from('course_enrollments')
          .update({
            is_completed: true,
            certificate_issued: true
          })
          .eq('user_id', userId)
          .eq('course_id', courseId);
        
        if (enrollError) {
          console.error("Error updating enrollment status:", enrollError);
        }
      }
      
      // Map Supabase data to our CourseProgress interface
      // Convert JSON array to string array for completedVideos and completedQuizzes
      const completedVideos = Array.isArray(dbProgress.completed_videos)
        ? dbProgress.completed_videos.map(id => String(id))
        : [];
        
      const completedQuizzes = Array.isArray(dbProgress.completed_quizzes)
        ? dbProgress.completed_quizzes.map(id => String(id))
        : [];
      
      return {
        userId: dbProgress.user_id,
        courseId: dbProgress.course_id,
        completedVideos: completedVideos,
        completedQuizzes: completedQuizzes,
        lastAccessed: dbProgress.last_accessed,
        overallProgress: dbProgress.overall_progress || 0,
      };
    }
  } catch (error) {
    console.error("Error updating progress in database:", error);
  }
  
  // Fallback to mock data
  let progressIndex = mockCourseProgress.findIndex(
    p => p.userId === userId && p.courseId === courseId
  );
  
  // If no progress record exists, create one
  if (progressIndex === -1) {
    const newProgress: CourseProgress = {
      userId,
      courseId,
      completedVideos: [],
      completedQuizzes: [],
      lastAccessed: new Date().toISOString().split('T')[0],
      overallProgress: 0,
    };
    mockCourseProgress.push(newProgress);
    progressIndex = mockCourseProgress.length - 1;
  }
  
  // Calculate overall progress based on videos completed
  let calculatedProgress = data.overallProgress;
  
  if (data.completedVideos && !data.overallProgress) {
    // This is a simplified calculation - in a real app you'd consider total videos in course
    calculatedProgress = Math.min(Math.floor((data.completedVideos.length / 10) * 100), 100);
  }
  
  // Update progress
  mockCourseProgress[progressIndex] = {
    ...mockCourseProgress[progressIndex],
    ...data,
    overallProgress: calculatedProgress !== undefined ? calculatedProgress : mockCourseProgress[progressIndex].overallProgress,
    lastAccessed: new Date().toISOString().split('T')[0],
  };
  
  // Check if course is completed (progress >= 100%)
  if (mockCourseProgress[progressIndex].overallProgress >= 100) {
    const enrollmentIndex = mockEnrollments.findIndex(
      e => e.userId === userId && e.courseId === courseId
    );
    
    if (enrollmentIndex !== -1) {
      mockEnrollments[enrollmentIndex].isCompleted = true;
      
      // Generate certificate if not already issued
      if (!mockEnrollments[enrollmentIndex].certificateIssued) {
        mockEnrollments[enrollmentIndex].certificateIssued = true;
        toast.success("Congratulations! You've completed this course and earned a certificate!");
      }
    } else {
      // If no enrollment record exists, create one
      const newEnrollment: CourseEnrollment = {
        userId,
        courseId,
        enrollmentDate: new Date().toISOString().split('T')[0],
        isCompleted: true,
        certificateIssued: true,
      };
      mockEnrollments.push(newEnrollment);
      toast.success("Congratulations! You've completed this course and earned a certificate!");
    }
  }
  
  // Simulate API call
  return simulateApiCall(mockCourseProgress[progressIndex]);
};

// Track video completion
export const markVideoAsCompleted = async (
  userId: string,
  courseId: string,
  videoId: string
): Promise<CourseProgress | undefined> => {
  console.log(`[API] Marking video ${videoId} as completed for user ${userId} on course ${courseId}`);
  
  const userProgress = mockCourseProgress.find(
    p => p.userId === userId && p.courseId === courseId
  );
  
  if (!userProgress) {
    // Create a new progress entry if one doesn't exist
    const newProgress: CourseProgress = {
      userId,
      courseId,
      completedVideos: [videoId],
      completedQuizzes: [],
      lastAccessed: new Date().toISOString().split('T')[0],
      overallProgress: 10, // Starting progress
    };
    mockCourseProgress.push(newProgress);
    return simulateApiCall(newProgress);
  }
  
  // Only add if not already completed
  if (!userProgress.completedVideos.includes(videoId)) {
    return updateCourseProgress(userId, courseId, {
      completedVideos: [...userProgress.completedVideos, videoId],
    });
  }
  
  return simulateApiCall(userProgress);
};

// Track quiz completion
export const markQuizAsCompleted = async (
  userId: string,
  courseId: string,
  quizId: string,
  score: number
): Promise<CourseProgress | undefined> => {
  console.log(`[API] Marking quiz ${quizId} as completed with score ${score} for user ${userId} on course ${courseId}`);
  
  const userProgress = mockCourseProgress.find(
    p => p.userId === userId && p.courseId === courseId
  );
  
  if (!userProgress) {
    // Create a new progress entry if one doesn't exist
    const newProgress: CourseProgress = {
      userId,
      courseId,
      completedVideos: [],
      completedQuizzes: [quizId],
      lastAccessed: new Date().toISOString().split('T')[0],
      overallProgress: 10, // Starting progress
    };
    mockCourseProgress.push(newProgress);
    return simulateApiCall(newProgress);
  }
  
  // Only add if not already completed
  if (!userProgress.completedQuizzes.includes(quizId)) {
    return updateCourseProgress(userId, courseId, {
      completedQuizzes: [...userProgress.completedQuizzes, quizId],
    });
  }
  
  return simulateApiCall(userProgress);
};

// Get all user progress (for admin dashboard)
export const getAllUserProgress = async (): Promise<CourseProgress[]> => {
  console.log('[API] Fetching all user progress data');
  
  // Simulate API call
  return simulateApiCall([...mockCourseProgress]);
};

// Get all enrollments (for admin dashboard)
export const getAllEnrollments = async (): Promise<CourseEnrollment[]> => {
  console.log('[API] Fetching all enrollment data');
  
  // Simulate API call
  return simulateApiCall([...mockEnrollments]);
};
