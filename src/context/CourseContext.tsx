
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Course, Video, Note } from '../types';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './AuthContext';
import { Json } from '@/integrations/supabase/types';

interface CourseContextType {
  courses: Course[];
  featuredCourses: Course[];
  videos: Video[];
  notes: Note[];
  getCourse: (id: string) => Course | undefined;
  getCourseVideos: (courseId: string) => Video[];
  getCourseNotes: (courseId: string) => Note[];
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Course | null>;
  updateCourse: (id: string, courseData: Partial<Course>) => Promise<boolean>;
  deleteCourse: (id: string) => Promise<boolean>;
  addVideo: (video: Omit<Video, 'id'>) => Promise<Video | null>;
  updateVideo: (id: string, videoData: Partial<Video>) => Promise<boolean>;
  deleteVideo: (id: string) => Promise<boolean>;
  addNote: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  updateNote: (id: string, noteData: Partial<Note>) => Promise<boolean>;
  deleteNote: (id: string) => Promise<boolean>;
  isLoading: boolean;
  refetchData: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Helper function to safely convert Json to any[]
  const safeJsonToArray = (json: Json | null): any[] => {
    if (!json) return [];
    if (Array.isArray(json)) return json as any[];
    return [];
  };
  
  // Extract fetch logic to a reusable function
  const fetchCoursesData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Fetch courses
      console.log("Fetching courses data from Supabase...");
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (coursesError) {
        throw coursesError;
      }
      
      // Map Supabase data to our interfaces
      const mappedCourses: Course[] = coursesData.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        duration: course.duration,
        level: course.level as 'beginner' | 'intermediate' | 'advanced',
        rating: course.rating || 0,
        enrolledCount: course.enrolled_count || 0,
        featured: course.featured || false,
        createdAt: course.created_at,
        updatedAt: course.updated_at
      }));
      
      setCourses(mappedCourses);
      
      // Fetch videos (only if we have courses)
      console.log("Fetching videos data from Supabase...");
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('order_num', { ascending: true });
      
      if (videosError) {
        throw videosError;
      }
      
      const mappedVideos: Video[] = videosData.map(video => ({
        id: video.id,
        courseId: video.course_id,
        title: video.title,
        description: video.description,
        url: video.url,
        duration: video.duration,
        thumbnail: video.thumbnail,
        order: video.order_num,
        analyzedContent: safeJsonToArray(video.analyzed_content)
      }));
      
      setVideos(mappedVideos);
      
      // Fetch notes
      console.log("Fetching notes data from Supabase...");
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .order('order_num', { ascending: true });
      
      if (notesError) {
        throw notesError;
      }
      
      const mappedNotes: Note[] = notesData.map(note => ({
        id: note.id,
        courseId: note.course_id,
        title: note.title,
        description: note.description,
        fileUrl: note.file_url,
        fileType: note.file_type as 'pdf' | 'doc' | 'txt',
        order: note.order_num
      }));
      
      setNotes(mappedNotes);
      console.log("Successfully loaded all data!");
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load courses data. Trying backup data...",
        variant: "destructive",
      });
      
      // Use local storage as fallback if available
      const storedCourses = localStorage.getItem('techlearn_courses');
      const storedVideos = localStorage.getItem('techlearn_videos');
      const storedNotes = localStorage.getItem('techlearn_notes');
      
      if (storedCourses && storedVideos && storedNotes) {
        setCourses(JSON.parse(storedCourses));
        setVideos(JSON.parse(storedVideos));
        setNotes(JSON.parse(storedNotes));
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Refetch data function to export
  const refetchData = useCallback(async () => {
    await fetchCoursesData();
  }, [fetchCoursesData]);
  
  // Initial data fetch
  useEffect(() => {
    fetchCoursesData();
    
    // Set up data caching
    const handleBeforeUnload = () => {
      localStorage.setItem('techlearn_courses', JSON.stringify(courses));
      localStorage.setItem('techlearn_videos', JSON.stringify(videos));
      localStorage.setItem('techlearn_notes', JSON.stringify(notes));
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [fetchCoursesData]);
  
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
  
  // Course CRUD operations
  const addCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course | null> => {
    try {
      // Insert into Supabase
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          thumbnail: courseData.thumbnail,
          instructor: courseData.instructor,
          duration: courseData.duration,
          level: courseData.level,
          rating: courseData.rating || 0,
          enrolled_count: courseData.enrolledCount || 0,
          featured: courseData.featured || false
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Map the returned data to our Course interface
      const newCourse: Course = {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        thumbnail: data.thumbnail,
        instructor: data.instructor,
        duration: data.duration,
        level: data.level as 'beginner' | 'intermediate' | 'advanced',
        rating: data.rating || 0,
        enrolledCount: data.enrolled_count || 0,
        featured: data.featured || false,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      // Update local state
      setCourses(prevCourses => [...prevCourses, newCourse]);
      
      toast({
        title: "Course created",
        description: `"${newCourse.title}" has been added successfully`,
      });
      
      return newCourse;
    } catch (error) {
      console.error("Error adding course:", error);
      toast({
        title: "Error adding course",
        description: "Failed to add the course",
        variant: "destructive",
      });
      return null;
    }
  };
  
  const updateCourse = async (id: string, courseData: Partial<Course>): Promise<boolean> => {
    try {
      // Transform data for Supabase (snake_case column names)
      const supabaseData: any = {};
      
      if (courseData.title) supabaseData.title = courseData.title;
      if (courseData.description) supabaseData.description = courseData.description;
      if (courseData.category) supabaseData.category = courseData.category;
      if (courseData.thumbnail) supabaseData.thumbnail = courseData.thumbnail;
      if (courseData.instructor) supabaseData.instructor = courseData.instructor;
      if (courseData.duration) supabaseData.duration = courseData.duration;
      if (courseData.level) supabaseData.level = courseData.level;
      if (courseData.rating !== undefined) supabaseData.rating = courseData.rating;
      if (courseData.enrolledCount !== undefined) supabaseData.enrolled_count = courseData.enrolledCount;
      if (courseData.featured !== undefined) supabaseData.featured = courseData.featured;
      
      // Always update the updated_at timestamp
      supabaseData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('courses')
        .update(supabaseData)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === id ? 
          { ...course, ...courseData, updatedAt: supabaseData.updated_at } : course
        )
      );
      
      toast({
        title: "Course updated",
        description: "Course has been updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error updating course:", error);
      toast({
        title: "Error updating course",
        description: "Failed to update the course",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const deleteCourse = async (id: string): Promise<boolean> => {
    try {
      // Supabase will cascade delete videos and notes due to ON DELETE CASCADE
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setCourses(prevCourses => prevCourses.filter(course => course.id !== id));
      setVideos(prevVideos => prevVideos.filter(video => video.courseId !== id));
      setNotes(prevNotes => prevNotes.filter(note => note.courseId !== id));
      
      toast({
        title: "Course deleted",
        description: "Course has been removed successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error deleting course",
        description: "Failed to delete the course",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Video CRUD operations
  const addVideo = async (videoData: Omit<Video, 'id'>): Promise<Video | null> => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .insert({
          course_id: videoData.courseId,
          title: videoData.title,
          description: videoData.description,
          url: videoData.url,
          duration: videoData.duration,
          thumbnail: videoData.thumbnail,
          order_num: videoData.order,
          analyzed_content: videoData.analyzedContent || null
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
        thumbnail: data.thumbnail,
        order: data.order_num,
        analyzedContent: safeJsonToArray(data.analyzed_content)
      };
      
      // Update local state
      setVideos(prevVideos => [...prevVideos, newVideo]);
      
      return newVideo;
    } catch (error) {
      console.error("Error adding video:", error);
      toast({
        title: "Error",
        description: "Failed to add the video",
        variant: "destructive",
      });
      return null;
    }
  };
  
  const updateVideo = async (id: string, videoData: Partial<Video>): Promise<boolean> => {
    try {
      const supabaseData: any = {};
      
      if (videoData.courseId) supabaseData.course_id = videoData.courseId;
      if (videoData.title) supabaseData.title = videoData.title;
      if (videoData.description) supabaseData.description = videoData.description;
      if (videoData.url) supabaseData.url = videoData.url;
      if (videoData.duration) supabaseData.duration = videoData.duration;
      if (videoData.thumbnail) supabaseData.thumbnail = videoData.thumbnail;
      if (videoData.order !== undefined) supabaseData.order_num = videoData.order;
      if (videoData.analyzedContent) supabaseData.analyzed_content = videoData.analyzedContent;
      
      supabaseData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('videos')
        .update(supabaseData)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === id ? { ...video, ...videoData } : video
        )
      );
      
      return true;
    } catch (error) {
      console.error("Error updating video:", error);
      return false;
    }
  };
  
  const deleteVideo = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setVideos(prevVideos => prevVideos.filter(video => video.id !== id));
      
      return true;
    } catch (error) {
      console.error("Error deleting video:", error);
      return false;
    }
  };
  
  // Note/Document CRUD operations
  const addNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          course_id: noteData.courseId,
          title: noteData.title,
          description: noteData.description,
          file_url: noteData.fileUrl,
          file_type: noteData.fileType,
          order_num: noteData.order
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
      
      // Update local state
      setNotes(prevNotes => [...prevNotes, newNote]);
      
      return newNote;
    } catch (error) {
      console.error("Error adding note:", error);
      return null;
    }
  };
  
  const updateNote = async (id: string, noteData: Partial<Note>): Promise<boolean> => {
    try {
      const supabaseData: any = {};
      
      if (noteData.courseId) supabaseData.course_id = noteData.courseId;
      if (noteData.title) supabaseData.title = noteData.title;
      if (noteData.description) supabaseData.description = noteData.description;
      if (noteData.fileUrl) supabaseData.file_url = noteData.fileUrl;
      if (noteData.fileType) supabaseData.file_type = noteData.fileType;
      if (noteData.order !== undefined) supabaseData.order_num = noteData.order;
      
      supabaseData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('notes')
        .update(supabaseData)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === id ? { ...note, ...noteData } : note
        )
      );
      
      return true;
    } catch (error) {
      console.error("Error updating note:", error);
      return false;
    }
  };
  
  const deleteNote = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      
      return true;
    } catch (error) {
      console.error("Error deleting note:", error);
      return false;
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
        addVideo,
        updateVideo,
        deleteVideo,
        addNote,
        updateNote,
        deleteNote,
        isLoading,
        refetchData
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
