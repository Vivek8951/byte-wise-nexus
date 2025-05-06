
import { CourseProgress, CourseEnrollment } from '../types';

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

export const getUserCourseProgress = (userId: string, courseId: string): CourseProgress | undefined => {
  return mockCourseProgress.find(
    progress => progress.userId === userId && progress.courseId === courseId
  );
};

export const getUserEnrollments = (userId: string): CourseEnrollment[] => {
  return mockEnrollments.filter(enrollment => enrollment.userId === userId);
};

export const isUserEnrolled = (userId: string, courseId: string): boolean => {
  return mockEnrollments.some(
    enrollment => enrollment.userId === userId && enrollment.courseId === courseId
  );
};

export const enrollUserInCourse = (userId: string, courseId: string): CourseEnrollment => {
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
  
  return newEnrollment;
};

export const updateCourseProgress = (
  userId: string, 
  courseId: string,
  data: Partial<CourseProgress>
): CourseProgress | undefined => {
  const progressIndex = mockCourseProgress.findIndex(
    p => p.userId === userId && p.courseId === courseId
  );
  
  if (progressIndex === -1) return undefined;
  
  mockCourseProgress[progressIndex] = {
    ...mockCourseProgress[progressIndex],
    ...data,
    lastAccessed: new Date().toISOString().split('T')[0],
  };
  
  return mockCourseProgress[progressIndex];
};

