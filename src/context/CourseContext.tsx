
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Course, Video, Note } from '../types';
import { mockCourses, mockVideos, mockNotes } from '../data/mockData';
import { useToast } from "@/components/ui/use-toast";

interface CourseContextType {
  courses: Course[];
  featuredCourses: Course[];
  videos: Video[];
  notes: Note[];
  getCourse: (id: string) => Course | undefined;
  getCourseVideos: (courseId: string) => Video[];
  getCourseNotes: (courseId: string) => Note[];
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCourse: (id: string, courseData: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  isLoading: boolean;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [videos, setVideos] = useState<Video[]>(mockVideos);
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulate API loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);
  
  const featuredCourses = courses.filter(course => course.featured);
  
  const getCourse = (id: string) => {
    return courses.find(course => course.id === id);
  };
  
  const getCourseVideos = (courseId: string) => {
    return videos.filter(video => video.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  };
  
  const getCourseNotes = (courseId: string) => {
    return notes.filter(note => note.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  };
  
  const addCourse = (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCourse: Course = {
      ...courseData,
      id: (courses.length + 1).toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    
    setCourses([...courses, newCourse]);
    
    toast({
      title: "Course created",
      description: `"${newCourse.title}" has been added successfully`,
    });
  };
  
  const updateCourse = (id: string, courseData: Partial<Course>) => {
    setCourses(courses.map(course => 
      course.id === id ? 
      { 
        ...course, 
        ...courseData, 
        updatedAt: new Date().toISOString().split('T')[0] 
      } : course
    ));
    
    toast({
      title: "Course updated",
      description: "The course has been updated successfully",
    });
  };
  
  const deleteCourse = (id: string) => {
    const courseToDelete = courses.find(course => course.id === id);
    
    if (courseToDelete) {
      setCourses(courses.filter(course => course.id !== id));
      
      toast({
        title: "Course deleted",
        description: `"${courseToDelete.title}" has been removed`,
      });
    }
  };
  
  return (
    <CourseContext.Provider 
      value={{ 
        courses, 
        featuredCourses, 
        videos, 
        notes,
        getCourse, 
        getCourseVideos, 
        getCourseNotes, 
        addCourse,
        updateCourse,
        deleteCourse,
        isLoading
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
}
