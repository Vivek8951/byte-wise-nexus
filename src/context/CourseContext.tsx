
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
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load data from localStorage or use mockData
    const loadData = () => {
      const storedCourses = localStorage.getItem('techlearn_courses');
      const storedVideos = localStorage.getItem('techlearn_videos');
      const storedNotes = localStorage.getItem('techlearn_notes');
      
      if (storedCourses && storedVideos && storedNotes) {
        setCourses(JSON.parse(storedCourses));
        setVideos(JSON.parse(storedVideos));
        setNotes(JSON.parse(storedNotes));
      } else {
        // Initialize with mock data
        setCourses(mockCourses);
        setVideos(mockVideos);
        setNotes(mockNotes);
        
        // Store in localStorage
        localStorage.setItem('techlearn_courses', JSON.stringify(mockCourses));
        localStorage.setItem('techlearn_videos', JSON.stringify(mockVideos));
        localStorage.setItem('techlearn_notes', JSON.stringify(mockNotes));
      }
      
      setIsLoading(false);
    };
    
    // Simulate API loading
    setTimeout(loadData, 1000);
  }, []);
  
  const saveData = () => {
    localStorage.setItem('techlearn_courses', JSON.stringify(courses));
    localStorage.setItem('techlearn_videos', JSON.stringify(videos));
    localStorage.setItem('techlearn_notes', JSON.stringify(notes));
  };
  
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
      const newCourse: Course = {
        ...courseData,
        id: `course_${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        enrolledCount: 0,
        rating: 0,
      };
      
      const updatedCourses = [...courses, newCourse];
      setCourses(updatedCourses);
      localStorage.setItem('techlearn_courses', JSON.stringify(updatedCourses));
      
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
      const updatedCourses = courses.map(course => 
        course.id === id ? 
        { 
          ...course, 
          ...courseData, 
          updatedAt: new Date().toISOString().split('T')[0] 
        } : course
      );
      
      setCourses(updatedCourses);
      localStorage.setItem('techlearn_courses', JSON.stringify(updatedCourses));
      
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
      const courseToDelete = courses.find(course => course.id === id);
      
      if (courseToDelete) {
        // Delete course videos and notes
        const courseVideos = videos.filter(video => video.courseId === id);
        const courseNotes = notes.filter(note => note.courseId === id);
        
        // Update videos array removing course videos
        const updatedVideos = videos.filter(video => video.courseId !== id);
        setVideos(updatedVideos);
        localStorage.setItem('techlearn_videos', JSON.stringify(updatedVideos));
        
        // Update notes array removing course notes
        const updatedNotes = notes.filter(note => note.courseId !== id);
        setNotes(updatedNotes);
        localStorage.setItem('techlearn_notes', JSON.stringify(updatedNotes));
        
        // Remove course
        const updatedCourses = courses.filter(course => course.id !== id);
        setCourses(updatedCourses);
        localStorage.setItem('techlearn_courses', JSON.stringify(updatedCourses));
        
        return true;
      }
      
      return false;
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
      const newVideo: Video = {
        ...videoData,
        id: `video_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      };
      
      const updatedVideos = [...videos, newVideo];
      setVideos(updatedVideos);
      localStorage.setItem('techlearn_videos', JSON.stringify(updatedVideos));
      
      return newVideo;
    } catch (error) {
      console.error("Error adding video:", error);
      return null;
    }
  };
  
  const updateVideo = async (id: string, videoData: Partial<Video>): Promise<boolean> => {
    try {
      const updatedVideos = videos.map(video => 
        video.id === id ? { ...video, ...videoData } : video
      );
      
      setVideos(updatedVideos);
      localStorage.setItem('techlearn_videos', JSON.stringify(updatedVideos));
      
      return true;
    } catch (error) {
      console.error("Error updating video:", error);
      return false;
    }
  };
  
  const deleteVideo = async (id: string): Promise<boolean> => {
    try {
      const updatedVideos = videos.filter(video => video.id !== id);
      setVideos(updatedVideos);
      localStorage.setItem('techlearn_videos', JSON.stringify(updatedVideos));
      
      return true;
    } catch (error) {
      console.error("Error deleting video:", error);
      return false;
    }
  };
  
  // Note/Document CRUD operations
  const addNote = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    try {
      const newNote: Note = {
        ...noteData,
        id: `note_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      };
      
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      localStorage.setItem('techlearn_notes', JSON.stringify(updatedNotes));
      
      return newNote;
    } catch (error) {
      console.error("Error adding note:", error);
      return null;
    }
  };
  
  const updateNote = async (id: string, noteData: Partial<Note>): Promise<boolean> => {
    try {
      const updatedNotes = notes.map(note => 
        note.id === id ? { ...note, ...noteData } : note
      );
      
      setNotes(updatedNotes);
      localStorage.setItem('techlearn_notes', JSON.stringify(updatedNotes));
      
      return true;
    } catch (error) {
      console.error("Error updating note:", error);
      return false;
    }
  };
  
  const deleteNote = async (id: string): Promise<boolean> => {
    try {
      const updatedNotes = notes.filter(note => note.id !== id);
      setNotes(updatedNotes);
      localStorage.setItem('techlearn_notes', JSON.stringify(updatedNotes));
      
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
