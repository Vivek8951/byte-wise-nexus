
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Book, 
  Video as VideoIcon, 
  File,
  EyeOff,
  Eye,
  Sparkles,
  Loader2,
  Wand
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCourses } from "@/context/CourseContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CourseEditor } from "@/components/admin/CourseEditor";
import { Course, Video, Note } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { populateCourses } from "@/utils/supabaseStorage";

export default function AdminCourses() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    courses, 
    addCourse, 
    updateCourse, 
    deleteCourse, 
    getCourseVideos, 
    getCourseNotes,
    addVideo,
    addNote,
    deleteVideo,
    deleteNote,
    isLoading: coursesLoading 
  } = useCourses();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [isNewCourse, setIsNewCourse] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPopulating, setIsPopulating] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [courseCount, setCourseCount] = useState(5);
  const [clearExisting, setClearExisting] = useState(false);
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && isAuthenticated && user && user.role !== 'admin') {
      navigate("/dashboard");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive"
      });
    } else if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, user, navigate, toast]);
  
  if (authLoading || coursesLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (!user || user.role !== 'admin') {
    return null;
  }
  
  // Filter out duplicate courses by title for display
  const uniqueCourses = courses.filter((course, index, self) => 
    index === self.findIndex((c) => c.title === course.title)
  );
  
  const handleAddCourse = () => {
    setCurrentCourse(null);
    setIsNewCourse(true);
    setIsEditorOpen(true);
  };
  
  const handleEditCourse = (course: Course) => {
    setCurrentCourse(course);
    setIsNewCourse(false);
    setIsEditorOpen(true);
  };
  
  const handleSaveCourse = async (courseData: Partial<Course>, videosData: Partial<Video>[], notesData: Partial<Note>[]) => {
    try {
      if (isNewCourse) {
        // Add new course
        const newCourse = await addCourse(courseData as Omit<Course, 'id' | 'createdAt' | 'updatedAt'>);
        
        // Add videos and notes
        if (newCourse) {
          for (const video of videosData) {
            await addVideo({ 
              courseId: newCourse.id, 
              title: video.title || '',
              description: video.description || '',
              url: video.url || '',
              duration: video.duration || '',
              thumbnail: video.thumbnail,
              order: video.order || 0 
            });
          }
          
          for (const note of notesData) {
            await addNote({ 
              courseId: newCourse.id, 
              title: note.title || '',
              description: note.description || '',
              fileUrl: note.fileUrl || '',
              fileType: note.fileType || 'pdf',
              order: note.order || 0 
            });
          }
        }
        
        toast({
          title: "Course created",
          description: `"${courseData.title}" has been added successfully`,
        });
      } else if (currentCourse) {
        // Update existing course
        await updateCourse(currentCourse.id, courseData);
        
        // Get existing videos and notes to compare
        const existingVideos = getCourseVideos(currentCourse.id);
        const existingNotes = getCourseNotes(currentCourse.id);
        
        // Delete existing videos and notes first
        for (const video of existingVideos) {
          await deleteVideo(video.id);
        }
        
        for (const note of existingNotes) {
          await deleteNote(note.id);
        }
        
        // Add new videos and notes
        for (const video of videosData) {
          await addVideo({ 
            courseId: currentCourse.id, 
            title: video.title || '',
            description: video.description || '',
            url: video.url || '',
            duration: video.duration || '',
            thumbnail: video.thumbnail,
            order: video.order || 0 
          });
        }
        
        for (const note of notesData) {
          await addNote({ 
            courseId: currentCourse.id, 
            title: note.title || '',
            description: note.description || '',
            fileUrl: note.fileUrl || '',
            fileType: note.fileType || 'pdf',
            order: note.order || 0 
          });
        }
        
        toast({
          title: "Course updated",
          description: `"${courseData.title}" has been updated successfully`,
        });
      }
      
      setIsEditorOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving the course",
        variant: "destructive"
      });
    }
  };
  
  const confirmDeleteCourse = (course: Course) => {
    setCurrentCourse(course);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteCourse = async () => {
    if (currentCourse) {
      await deleteCourse(currentCourse.id);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Course deleted",
        description: `"${currentCourse.title}" has been removed`,
      });
    }
  };
  
  const toggleFeatured = async (course: Course) => {
    await updateCourse(course.id, { 
      featured: !course.featured
    });
    
    toast({
      title: course.featured ? "Course unfeatured" : "Course featured",
      description: `"${course.title}" has been ${course.featured ? 'removed from' : 'added to'} featured courses`,
    });
  };
  
  // Update this function to generate exactly the number of courses specified
  const handlePopulateCourses = async () => {
    setIsPopulating(true);
    try {
      const result = await populateCourses(courseCount, {
        clearExisting
      });
      
      if (result.success) {
        toast({
          title: "Courses generated",
          description: result.message,
        });
        // Refresh courses data
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsPopulating(false);
      setIsGenerateDialogOpen(false);
    }
  };
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold heading-gradient">Course Management</h1>
            <p className="text-muted-foreground">Manage and update course content</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsGenerateDialogOpen(true)}
              disabled={isPopulating}
              className="group relative overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 animate-fade-in"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-2">
                {isPopulating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 animate-pulse" />
                )}
                <span>{isPopulating ? "Generating..." : "Generate Courses with AI"}</span>
              </span>
            </Button>
            <Button 
              onClick={handleAddCourse}
              className="bg-primary hover:bg-primary/90 flex items-center gap-2 animate-fade-in shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <Plus className="h-4 w-4" /> New Course
            </Button>
          </div>
        </header>
        
        <div className="grid grid-cols-1 gap-6">
          {uniqueCourses.map(course => {
            const videos = getCourseVideos(course.id);
            const notes = getCourseNotes(course.id);
            
            return (
              <div 
                key={course.id} 
                className="bg-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all animate-fade-in"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 h-[200px] md:h-auto">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex justify-between">
                      <h2 className="text-xl font-bold">{course.title}</h2>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFeatured(course)}
                          title={course.featured ? "Remove from featured" : "Mark as featured"}
                        >
                          {course.featured ? (
                            <EyeOff className="h-4 w-4 text-amber-500" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCourse(course)}
                          className="text-blue-500"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDeleteCourse(course)}
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground line-clamp-2">{course.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs block">Category:</span>
                        <p className="font-medium">{course.category}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs block">Instructor:</span>
                        <p className="font-medium">{course.instructor}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs block">Level:</span>
                        <p className="capitalize font-medium">{course.level}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs block">Duration:</span>
                        <p className="font-medium">{course.duration}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 pt-2">
                      <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs">
                        <VideoIcon className="h-3 w-3" />
                        <span>{videos.length} Videos</span>
                      </div>
                      <div className="flex items-center gap-1 bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full text-xs">
                        <File className="h-3 w-3" />
                        <span>{notes.length} Documents</span>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-xs">
                        <Book className="h-3 w-3" />
                        <span>{course.enrolledCount || 0} Students</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {uniqueCourses.length === 0 && (
            <div className="text-center py-20 animate-fade-in">
              <Book className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get started by creating your first course. Add videos, documents and organize content for your students.
              </p>
              <Button onClick={handleAddCourse} className="bg-primary hover:bg-primary/90 shadow-sm">
                <Plus className="h-4 w-4 mr-2" /> Create First Course
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNewCourse ? "Create New Course" : "Edit Course"}</DialogTitle>
            <DialogDescription>
              {isNewCourse 
                ? "Fill in the details to create a new course." 
                : "Make changes to update this course."}
            </DialogDescription>
          </DialogHeader>
          <CourseEditor 
            course={currentCourse || undefined}
            onSave={handleSaveCourse}
            onCancel={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course "{currentCourse?.title}" and all of its content.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCourse} 
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] animate-scale-in bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand className="h-5 w-5 text-purple-400" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-400">
                Generate Courses with AI
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Let our AI create professional courses for your platform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="courseCount" className="text-right text-gray-300">
                Number of courses
              </Label>
              <div className="col-span-3">
                <Input
                  id="courseCount"
                  type="number"
                  min="1"
                  max="15"
                  value={courseCount}
                  onChange={(e) => setCourseCount(parseInt(e.target.value) || 5)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Maximum 15 courses per generation
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clearExisting" className="text-right text-gray-300">
                Clear existing
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch 
                  id="clearExisting" 
                  checked={clearExisting} 
                  onCheckedChange={setClearExisting} 
                />
                <Label htmlFor="clearExisting" className="text-sm text-gray-400">
                  Remove all existing courses before generating new ones
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              className="border-gray-600 text-white hover:bg-gray-800"
              onClick={() => setIsGenerateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePopulateCourses} 
              disabled={isPopulating}
              className="relative overflow-hidden group bg-gradient-to-br from-violet-600 to-purple-700 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 text-white"
            >
              {isPopulating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Generate Courses</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </>
  );
}
