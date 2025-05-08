import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  BookOpen, Clock, BarChart3, Calendar, 
  Star, Users, Play, Download, Loader2, RefreshCw
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { useCourses } from "@/context/CourseContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useToast } from "@/components/ui/use-toast";
import { BackButton } from "@/components/ui/back-button";
import { getQuiz } from "@/data/mockQuizData";
import { supabase } from "@/integrations/supabase/client";
import { VideoPlayerWithAnalysis, SimpleVideoPlayer, CourseQuiz } from "@/components/courses";
import { processVideo } from "@/utils/supabaseStorage";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { getCourse, getCourseVideos, getCourseNotes } = useCourses();
  const [course, setCourse] = useState(undefined);
  const [videos, setVideos] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoIndex, setVideoIndex] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to view course details",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (id) {
      const fetchedCourse = getCourse(id);
      setCourse(fetchedCourse);
      
      const fetchedVideos = getCourseVideos(id);
      setVideos(fetchedVideos);
      
      const fetchedNotes = getCourseNotes(id);
      setNotes(fetchedNotes);
      
      if (fetchedVideos.length > 0) {
        setActiveVideo(fetchedVideos[0]);
      }

      // Check if user is enrolled in this course
      if (isAuthenticated && user) {
        checkEnrollmentStatus(id, user.id);
        // Fetch quizzes for this course
        fetchCourseQuizzes(id);
      }
    }
  }, [id, getCourse, getCourseVideos, getCourseNotes, isAuthenticated, user]);
  
  const fetchCourseQuizzes = async (courseId) => {
    setIsLoadingQuizzes(true);
    try {
      // First try to get quizzes from Supabase
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', courseId)
        .order('order_num', { ascending: true });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setQuizzes(data);
      } else {
        // Fall back to mock data if no quizzes in db
        const mockQuiz = getQuiz("quiz-1");
        if (mockQuiz) {
          setQuizzes([{
            id: "quiz-1",
            courseId: courseId,
            title: "Module Assessment Quiz",
            description: "Test your knowledge of the concepts covered in this course",
            questions: mockQuiz.questions,
            order_num: 1
          }]);
        }
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      // Use mock data as fallback
      const mockQuiz = getQuiz("quiz-1");
      if (mockQuiz) {
        setQuizzes([{
          id: "quiz-1",
          courseId: courseId,
          title: "Module Assessment Quiz",
          description: "Test your knowledge of the concepts covered in this course",
          questions: mockQuiz.questions,
          order_num: 1
        }]);
      }
    } finally {
      setIsLoadingQuizzes(false);
    }
  };
  
  const checkEnrollmentStatus = async (courseId, userId) => {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error checking enrollment status:", error);
        setIsEnrolled(false);
      } else {
        setIsEnrolled(data !== null);
      }
    } catch (error) {
      console.error("Error checking enrollment:", error);
      setIsEnrolled(false);
    }
  };

  const handleVideoClick = (video, index) => {
    setActiveVideo(video);
    setVideoIndex(index);
  };
  
  const handleNextVideo = () => {
    if (videoIndex < videos.length - 1) {
      setActiveVideo(videos[videoIndex + 1]);
      setVideoIndex(videoIndex + 1);
    }
  };
  
  const handlePrevVideo = () => {
    if (videoIndex > 0) {
      setActiveVideo(videos[videoIndex - 1]);
      setVideoIndex(videoIndex - 1);
    }
  };
  
  const formatDuration = (duration) => {
    if (!duration) return "00:00";
    const minutes = Math.floor(parseFloat(duration) / 60);
    const seconds = Math.floor(parseFloat(duration) % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const handleEnrollClick = async () => {
    // Redirect to login page if user is not authenticated
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to enroll in this course",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    if (user?.role === 'admin') {
      toast({
        title: "Admin cannot enroll",
        description: "As an admin, you cannot enroll in courses. You can only manage them.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create enrollment record in database
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: id,
          user_id: user.id,
          enrollment_date: new Date().toISOString(),
          is_completed: false,
          certificate_issued: false
        });
        
      if (error) throw error;
      
      // Create initial progress record
      await supabase
        .from('course_progress')
        .insert({
          course_id: id,
          user_id: user.id,
          last_accessed: new Date().toISOString(),
          overall_progress: 0,
          completed_videos: [],
          completed_quizzes: []
        });
        
      setIsEnrolled(true);
      
      toast({
        title: "Successfully enrolled!",
        description: `You are now enrolled in ${course?.title}`,
      });
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast({
        title: "Enrollment failed",
        description: "An error occurred while enrolling in the course",
        variant: "destructive",
      });
    }
  };
  
  const handleProcessAllVideos = async () => {
    if (!videos || videos.length === 0) return;
    
    setIsProcessingVideo(true);
    toast({
      title: "Processing videos",
      description: `Processing ${videos.length} videos. This may take a few minutes...`
    });
    
    try {
      // Process each video one by one
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        await processVideo(video.id, id);
        
        // Update progress
        toast({
          title: "Processing videos",
          description: `Processed ${i + 1} of ${videos.length} videos`
        });
      }
      
      // Refresh the videos data
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('course_id', id)
        .order('order_num', { ascending: true });
        
      if (!error && data) {
        // Map the fields to match our Video interface
        const updatedVideos = data.map(v => ({
          id: v.id,
          courseId: v.course_id,
          title: v.title,
          description: v.description,
          url: v.url,
          duration: v.duration,
          thumbnail: v.thumbnail,
          order: v.order_num,
          download_info: v.download_info
        }));
        
        setVideos(updatedVideos);
        if (updatedVideos.length > 0) {
          setActiveVideo(updatedVideos[videoIndex < updatedVideos.length ? videoIndex : 0]);
        }
      }
      
      // Also refresh quizzes as they might have been created during processing
      fetchCourseQuizzes(id);
      
      toast({
        title: "All videos processed",
        description: "Videos loaded successfully"
      });
    } catch (error) {
      console.error("Error processing videos:", error);
      toast({
        title: "Processing error",
        description: "An error occurred while processing videos",
        variant: "destructive"
      });
    } finally {
      setIsProcessingVideo(false);
    }
  };
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton href="/courses" className="mb-6" />
          
          {/* Course Header */}
          <div className="bg-[#0F1729] rounded-lg overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left side content */}
              <div className="md:w-2/3 p-8 text-left">
                <div className="mb-6">
                  <Badge className="bg-green-600 hover:bg-green-700 text-white mb-3">
                    {course?.level || "Beginner"}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {course?.title || "Modern Web Development"}
                  </h1>
                  <p className="text-gray-300 mb-6">
                    {course?.description || "Build responsive and dynamic web applications using modern frameworks and best practices."}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="text-white">4.7</span>
                      <span className="text-gray-400 ml-1">(2,100 students)</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-1" />
                      <span className="text-gray-300">{course?.duration || "11 weeks"}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-1" />
                      <span className="text-gray-300">
                        Updated {new Date(course?.updatedAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                      {course?.instructor?.charAt(0) || "A"}
                    </div>
                    <div>
                      <p className="text-white font-medium">{course?.instructor || "Alex Thompson"}</p>
                      <p className="text-gray-400 text-sm">Instructor</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right side content - Course details card */}
              <div className="md:w-1/3 bg-[#13192A] p-6">
                <div className="mb-8">
                  <AspectRatio ratio={16 / 9} className="bg-black mb-4 rounded-md overflow-hidden">
                    <img 
                      src={course?.thumbnail || "/placeholder.svg"} 
                      alt={course?.title || "Course thumbnail"} 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
                        <Play className="h-5 w-5" />
                      </Button>
                    </div>
                  </AspectRatio>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        <span>Course Content</span>
                      </div>
                      <span>{videos.length + notes.length} items</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center">
                        <Play className="h-5 w-5 mr-2" />
                        <span>Video Lectures</span>
                      </div>
                      <span>{videos.length} videos</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center">
                        <Download className="h-5 w-5 mr-2" />
                        <span>Downloadable Notes</span>
                      </div>
                      <span>{notes.length} files</span>
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-700 my-4" />
                  
                  <p className="text-gray-300 text-center mb-4">
                    {isEnrolled ? 'You are enrolled in this course' : 'Enroll to get full access to course content'}
                  </p>
                  
                  <Button 
                    className="w-full py-6" 
                    onClick={handleEnrollClick}
                    disabled={isEnrolled || (isAuthenticated && user?.role === 'admin')}
                  >
                    {isEnrolled ? 'Already Enrolled' : 'Enroll Now - Free'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Process all videos button for admins */}
          {isAuthenticated && user?.role === 'admin' && videos.length > 0 && (
            <div className="mt-4">
              <Button
                onClick={handleProcessAllVideos}
                variant="outline"
                disabled={isProcessingVideo}
                className="flex items-center gap-2"
              >
                {isProcessingVideo ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing Videos...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Load All Videos
                  </>
                )}
              </Button>
            </div>
          )}
          
          {/* Tabs section only shown when enrolled */}
          {(isEnrolled || (isAuthenticated && user?.role === 'admin')) && (
            <Tabs defaultValue="overview" className="w-full mt-8">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="lectures">Lectures</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 py-4">
                <h2 className="text-2xl font-bold text-left">Course Overview</h2>
                <p className="text-left">
                  Welcome to the {course?.title} course! In this course, you will learn...
                </p>
                
                <h3 className="text-xl font-semibold mt-4 text-left">What you'll learn</h3>
                <ul className="list-disc list-inside text-left">
                  <li>Understand the basic principles of {course?.category || "technology"}</li>
                  <li>Apply these principles to real-world scenarios</li>
                  <li>Build your own projects with the knowledge gained</li>
                  <li>Master advanced techniques through hands-on practice</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-4 text-left">Prerequisites</h3>
                <p className="text-left">
                  Basic knowledge of programming concepts is recommended but not required.
                  This course is designed to accommodate learners of all levels.
                </p>
              </TabsContent>
              
              <TabsContent value="lectures" className="space-y-4 py-4">
                <h2 className="text-2xl font-bold text-left">Course Lectures</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Video Section - Updated to use SimpleVideoPlayer */}
                  <div className="md:col-span-2">
                    {activeVideo ? (
                      <SimpleVideoPlayer 
                        video={activeVideo} 
                        courseId={id}
                        onProcessComplete={() => fetchCourseQuizzes(id)}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <p className="text-center">No video selected</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-4">
                      <Button 
                        variant="outline" 
                        onClick={handlePrevVideo} 
                        disabled={videoIndex === 0}
                      >
                        Previous
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleNextVideo} 
                        disabled={videoIndex === videos.length - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                  
                  {/* Video List */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-left">Videos</h3>
                    <div className="space-y-2">
                      {videos.length > 0 ? videos.map((video, index) => (
                        <div 
                          key={video.id}
                          className={`flex bg-[#0F1729] border border-gray-800 rounded-lg overflow-hidden cursor-pointer hover:border-gray-600 transition-colors ${activeVideo?.id === video.id ? 'border-blue-500' : ''}`}
                          onClick={() => handleVideoClick(video, index)}
                        >
                          <div className="w-32 h-24 relative flex-shrink-0">
                            <img 
                              src={video.thumbnail || "/placeholder.svg"} 
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play className="h-6 w-6 text-white" />
                            </div>
                            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                              {formatDuration(video.duration)}
                            </div>
                          </div>
                          <div className="p-3 text-left flex-1">
                            <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                            <p className="text-xs text-gray-400 mt-1">Lecture {index + 1}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="p-6 text-center bg-card rounded-lg border">
                          <p>No videos available for this course.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Resources tab */}
              <TabsContent value="resources" className="space-y-4 py-4">
                <h2 className="text-2xl font-bold text-left">Course Resources</h2>
                
                {notes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map(note => (
                      <div key={note.id} className="bg-card border rounded-lg overflow-hidden">
                        <div className="p-4 text-left">
                          <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
                          <p className="text-muted-foreground line-clamp-2 mb-4 text-sm">{note.description}</p>
                          <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Download Resource
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-card rounded-lg border">
                    <p>No resources available for this course.</p>
                  </div>
                )}
              </TabsContent>
              
              {/* Quiz tab */}
              <TabsContent value="quiz" className="space-y-4 py-4">
                <h2 className="text-2xl font-bold text-left">Course Quiz</h2>
                
                {isLoadingQuizzes ? (
                  <div className="flex justify-center items-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                    <span>Loading quiz...</span>
                  </div>
                ) : quizzes.length > 0 ? (
                  <CourseQuiz 
                    courseId={id}
                    quizId={quizzes[0].id}
                    title={quizzes[0].title}
                    description={quizzes[0].description}
                    questions={quizzes[0].questions}
                  />
                ) : (
                  <div className="p-6 text-center bg-card rounded-lg border">
                    <p>No quizzes available for this course yet.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          
          {/* Course preview section when not enrolled */}
          {!isEnrolled && !(isAuthenticated && user?.role === 'admin') && (
            <div className="mt-8">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="content">Course Content</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-4 py-4">
                  <div className="space-y-4">
                    {videos.length > 0 ? (
                      videos.slice(0, 3).map((video, index) => (
                        <div key={video.id} className="bg-[#0F1729] rounded-lg overflow-hidden border border-gray-800">
                          <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <h3 className="font-semibold">{video.title}</h3>
                            <span className="text-sm text-gray-400">{formatDuration(video.duration)}</span>
                          </div>
                          <div className="p-4 text-gray-300 text-sm">
                            <p>{video.description}</p>
                            <div className="mt-2 flex justify-between items-center">
                              <span>Lecture {index + 1}</span>
                              <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <Play className="h-3 w-3" />
                                <span>Preview</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center bg-card rounded-lg border">
                        <p>No preview content available for this course.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="overview" className="space-y-4 py-4">
                  <h2 className="text-2xl font-bold text-left">Course Overview</h2>
                  <p className="text-left">
                    This course provides a comprehensive introduction to {course?.category || "technology"}. 
                    You'll learn fundamental concepts and advanced techniques to master this subject.
                  </p>
                  
                  <h3 className="text-xl font-semibold mt-4 text-left">What you'll learn</h3>
                  <ul className="list-disc list-inside text-left">
                    <li>Core principles and best practices</li>
                    <li>Practical implementation techniques</li>
                    <li>Problem-solving approaches</li>
                    <li>Industry-standard methodologies</li>
                    <li>Real-world application examples</li>
                  </ul>
                  
                  <h3 className="text-xl font-semibold mt-4 text-left">Prerequisites</h3>
                  <p className="text-left">
                    No prior experience is required for this beginner-level course. Just bring your enthusiasm to learn!
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
