export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  enrolledCourses?: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  rating?: number;
  enrolledCount?: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  courseId: string;
  title: string;
  description: string;
  url: string;
  duration: string;
  thumbnail?: string;
  order: number;
  analyzedContent?: any[]; 
  download_info?: any; // This property is now properly defined in the interface
}

export interface Note {
  id: string;
  courseId: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'txt';
  order: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  order: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizAttempt {
  userId: string;
  quizId: string;
  courseId: string;
  score: number;
  completedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imageUrl?: string;
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  completedVideos: string[];
  completedQuizzes: string[];
  lastAccessed: string;
  overallProgress: number; // Percentage from 0-100
}

export interface CourseEnrollment {
  userId: string;
  courseId: string;
  enrollmentDate: string;
  isCompleted: boolean;
  certificateIssued: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface BackendConfig {
  apiUrl: string;
  aiEndpoint: string;
}
