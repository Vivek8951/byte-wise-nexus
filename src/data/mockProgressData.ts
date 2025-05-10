
import { CourseProgress, CourseEnrollment } from '../types';
import { toast } from "@/components/ui/sonner";

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
  
  // Simulate API call
  return simulateApiCall(
    mockCourseProgress.find(
      progress => progress.userId === userId && progress.courseId === courseId
    )
  );
};

export const getUserEnrollments = async (userId: string): Promise<CourseEnrollment[]> => {
  console.log(`[API] Fetching all enrollments for user ${userId}`);
  
  // Simulate API call
  return simulateApiCall(
    mockEnrollments.filter(enrollment => enrollment.userId === userId)
  );
};

export const isUserEnrolled = async (userId: string, courseId: string): Promise<boolean> => {
  console.log(`[API] Checking if user ${userId} is enrolled in course ${courseId}`);
  
  // Simulate API call
  return simulateApiCall(
    mockEnrollments.some(
      enrollment => enrollment.userId === userId && enrollment.courseId === courseId
    )
  );
};

export const enrollUserInCourse = async (userId: string, courseId: string): Promise<CourseEnrollment> => {
  console.log(`[API] Enrolling user ${userId} in course ${courseId}`);
  
  // Check if already enrolled
  const alreadyEnrolled = mockEnrollments.some(
    e => e.userId === userId && e.courseId === courseId
  );
  
  if (alreadyEnrolled) {
    toast("You are already enrolled in this course");
    return simulateApiCall(
      mockEnrollments.find(e => e.userId === userId && e.courseId === courseId)!
    );
  }
  
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
