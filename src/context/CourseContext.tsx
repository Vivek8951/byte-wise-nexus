import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course, Video, Note } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CourseContextType {
  courses: Course[];
  videos: Video[];
  notes: Note[];
  isLoading: boolean;
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Course | null>;
  updateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  getCourse: (id: string) => Course | undefined;
  getCourseVideos: (courseId: string) => Video[];
  getCourseNotes: (courseId: string) => Note[];
  addVideo: (video: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Video | null>;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  refreshCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load courses from Supabase
  const loadCourses = async () => {
    try {
      setIsLoading(true);
      
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('order_num', { ascending: true });

      if (videosError) throw videosError;

      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .order('order_num', { ascending: true });

      if (notesError) throw notesError;

      // Transform data to match our types
      const transformedCourses: Course[] = coursesData.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        thumbnail: course.thumbnail || course.thumbnail_url,
        level: course.level as 'beginner' | 'intermediate' | 'advanced',
        duration: course.duration,
        instructor: course.instructor,
        enrolledCount: course.enrolled_count || 0,
        rating: course.rating || 0,
        featured: course.featured || false,
        createdAt: course.created_at,
        updatedAt: course.updated_at,
      }));

      const transformedVideos: Video[] = videosData.map(video => ({
        id: video.id,
        courseId: video.course_id,
        title: video.title,
        description: video.description,
        url: video.url,
        thumbnail: video.thumbnail,
        duration: video.duration,
        order: video.order_num,
      }));

      const transformedNotes: Note[] = notesData.map(note => ({
        id: note.id,
        courseId: note.course_id,
        title: note.title,
        description: note.description,
        fileUrl: note.file_url,
        fileType: note.file_type as 'pdf' | 'doc' | 'txt',
        order: note.order_num,
      }));

      setCourses(transformedCourses);
      setVideos(transformedVideos);
      setNotes(transformedNotes);
      
      console.log('Loaded courses:', transformedCourses.length);
      console.log('Loaded videos:', transformedVideos.length);
      console.log('Loaded notes:', transformedNotes.length);

    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: "Error loading courses",
        description: "Failed to load courses from the database",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh courses data
  const refreshCourses = async () => {
    await loadCourses();
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const addCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course | null> => {
    try {
      console.log('Adding course:', courseData);
      
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          thumbnail: courseData.thumbnail,
          level: courseData.level,
          duration: courseData.duration,
          instructor: courseData.instructor,
          enrolled_count: courseData.enrolledCount || 0,
          rating: courseData.rating || 0,
          featured: courseData.featured || false,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const newCourse: Course = {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        thumbnail: data.thumbnail,
        level: data.level as 'beginner' | 'intermediate' | 'advanced',
        duration: data.duration,
        instructor: data.instructor,
        enrolledCount: data.enrolled_count || 0,
        rating: data.rating || 0,
        featured: data.featured || false,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setCourses(prev => [newCourse, ...prev]);
      
      console.log('Course added successfully:', newCourse);
      
      return newCourse;
    } catch (error) {
      console.error('Error adding course:', error);
      toast({
        title: "Error adding course",
        description: "Failed to add course to the database",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          title: updates.title,
          description: updates.description,
          category: updates.category,
          thumbnail: updates.thumbnail,
          level: updates.level,
          duration: updates.duration,
          instructor: updates.instructor,
          enrolled_count: updates.enrolledCount,
          rating: updates.rating,
          featured: updates.featured,
        })
        .eq('id', id);

      if (error) throw error;

      setCourses(prev => prev.map(course => 
        course.id === id ? { ...course, ...updates } : course
      ));

      console.log('Course updated successfully');
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error updating course",
        description: "Failed to update course in the database",
        variant: "destructive"
      });
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      // Delete related videos and notes first
      await supabase.from('videos').delete().eq('course_id', id);
      await supabase.from('notes').delete().eq('course_id', id);
      
      // Delete the course
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;

      setCourses(prev => prev.filter(course => course.id !== id));
      setVideos(prev => prev.filter(video => video.courseId !== id));
      setNotes(prev => prev.filter(note => note.courseId !== id));

      console.log('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error deleting course",
        description: "Failed to delete course from the database",
        variant: "destructive"
      });
    }
  };

  const getCourse = (id: string): Course | undefined => {
    return courses.find(course => course.id === id);
  };

  const addVideo = async (videoData: Omit<Video, 'id' | 'createdAt' | 'updatedAt'>): Promise<Video | null> => {
    try {
      console.log('Adding video:', videoData);
      
      const { data, error } = await supabase
        .from('videos')
        .insert({
          course_id: videoData.courseId,
          title: videoData.title,
          description: videoData.description,
          url: videoData.url,
          thumbnail: videoData.thumbnail,
          duration: videoData.duration,
          order_num: videoData.order,
        })
        .select()
        .single();

      if (error) throw error;

      const newVideo: Video = {
        id: data.id,
        courseId: data.course_id,
        title: data.title,
        description: data.description,
        url: data.url,
        thumbnail: data.thumbnail,
        duration: data.duration,
        order: data.order_num,
      };

      setVideos(prev => [...prev, newVideo]);
      console.log('Video added successfully');
      return newVideo;
    } catch (error) {
      console.error('Error adding video:', error);
      toast({
        title: "Error adding video",
        description: "Failed to add video to the database",
        variant: "destructive"
      });
      return null;
    }
  };

  const addNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Adding note:', noteData);
      
      const { data, error } = await supabase
        .from('notes')
        .insert({
          course_id: noteData.courseId,
          title: noteData.title,
          description: noteData.description,
          file_url: noteData.fileUrl,
          file_type: noteData.fileType,
          order_num: noteData.order,
        })
        .select()
        .single();

      if (error) throw error;

      const newNote: Note = {
        id: data.id,
        courseId: data.course_id,
        title: data.title,
        description: data.description,
        fileUrl: data.file_url,
        fileType: data.file_type as 'pdf' | 'doc' | 'txt',
        order: data.order_num,
      };

      setNotes(prev => [...prev, newNote]);
      console.log('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error adding note",
        description: "Failed to add note to the database",
        variant: "destructive"
      });
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;

      setVideos(prev => prev.filter(video => video.id !== id));
      console.log('Video deleted successfully');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error deleting video",
        description: "Failed to delete video from the database",
        variant: "destructive"
      });
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== id));
      console.log('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error deleting note",
        description: "Failed to delete note from the database",
        variant: "destructive"
      });
    }
  };

  const getCourseVideos = (courseId: string): Video[] => {
    return videos.filter(video => video.courseId === courseId);
  };

  const getCourseNotes = (courseId: string): Note[] => {
    return notes.filter(note => note.courseId === courseId);
  };

  return (
    <CourseContext.Provider value={{
      courses,
      videos,
      notes,
      isLoading,
      addCourse,
      updateCourse,
      deleteCourse,
      getCourse,
      getCourseVideos,
      getCourseNotes,
      addVideo,
      addNote,
      deleteVideo,
      deleteNote,
      refreshCourses,
    }}>
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
