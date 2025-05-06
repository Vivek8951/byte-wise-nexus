
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imageUrl?: string;
}
