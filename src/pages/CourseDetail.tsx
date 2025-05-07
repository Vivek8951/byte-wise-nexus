
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  BookOpen, Clock, BarChart3, Calendar, Info, 
  FileText, CheckCircle, AlertTriangle, Video
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { useCourses } from "@/context/CourseContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CourseQuiz } from "@/components/courses/CourseQuiz";
import { VideoAnalysis } from "@/components/courses/VideoAnalysis";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/ui/back-button";
import { getQuiz } from "@/data/mockQuizData";
import { supabase } from "@/integrations/supabase/client";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { getCourse, getCourseVideos, getCourseNotes } = useCourses();
  const [course, setCourse] = useState(undefined);
  const [videos, setVideos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoIndex, setVideoIndex] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
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
      }
    }
  }, [id, getCourse, getCourseVideos, getCourseNotes, isAuthenticated, user]);
  
  const checkEnrollmentStatus = async (courseId, userId) => {
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', userId)
        .single();
      
      if (error) {
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
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
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
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton href="/courses" className="mb-6" />
          
          {/* Course header section with improved alignment */}
          <div className="md:flex md:items-start gap-8">
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold heading-gradient mb-4 text-left">{course?.title}</h1>
              <p className="text-muted-foreground mb-6 text-left">{course?.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4 text-left">
                <Badge variant="secondary"><BookOpen className="h-4 w-4 mr-2" /> {course?.category}</Badge>
                <Badge variant="secondary"><Clock className="h-4 w-4 mr-2" /> {course?.duration}</Badge>
                <Badge variant="secondary"><BarChart3 className="h-4 w-4 mr-2" /> {course?.level}</Badge>
                <Badge variant="secondary"><Calendar className="h-4 w-4 mr-2" /> Updated {course?.updatedAt}</Badge>
              </div>
            </div>
            
            <div className="md:w-1/3">
              <Card className="bg-card border rounded-lg overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-left">Course Details</CardTitle>
                  <CardDescription className="text-left">Quick overview of the course</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-left">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Instructor</h4>
                      <p className="text-sm text-muted-foreground">{course?.instructor}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2 text-left">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Lectures</h4>
                      <p className="text-sm text-muted-foreground">{videos?.length} videos</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2 text-left">
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Progress</h4>
                      <p className="text-sm text-muted-foreground">0% Complete</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2 text-left">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Level</h4>
                      <p className="text-sm text-muted-foreground">{course?.level}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Enrollment button section */}
          {!isEnrolled && (
            <div className="my-6 flex justify-center">
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg" 
                onClick={handleEnrollClick}
                disabled={isAuthenticated && user?.role === 'admin'}
              >
                {isAuthenticated && user?.role === 'admin' 
                  ? 'Admin cannot enroll in courses' 
                  : 'Enroll in this Course'}
              </Button>
            </div>
          )}
          
          {/* Tabs section with consistent text alignment - only shown when enrolled */}
          {isEnrolled && (
            <Tabs defaultValue="overview" className="w-full mt-8">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="lectures">Lectures</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 py-4 text-left">
                <h2 className="text-2xl font-bold">Course Overview</h2>
                <p>
                  Welcome to the {course?.title} course! In this course, you will learn...
                </p>
                
                <h3 className="text-xl font-semibold mt-4">What you'll learn</h3>
                <ul className="list-disc list-inside">
                  <li>Understand the basic principles of...</li>
                  <li>Apply these principles to real-world scenarios</li>
                  <li>Build your own...</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-4">Prerequisites</h3>
                <p>
                  Basic knowledge of...
                </p>
              </TabsContent>
              
              <TabsContent value="lectures" className="space-y-4 py-4">
                <h2 className="text-2xl font-bold text-left">Course Lectures</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Video Section */}
                  <div className="md:col-span-2">
                    {activeVideo ? (
                      <Card className="mb-6">
                        <AspectRatio ratio={16 / 9}>
                          <video
                            src={activeVideo.url}
                            controls
                            className="w-full h-full object-cover rounded-md"
                          />
                        </AspectRatio>
                        <div className="p-4 text-left">
                          <h3 className="text-lg font-semibold">{activeVideo.title}</h3>
                          <p className="text-muted-foreground text-sm">{activeVideo.description}</p>
                        </div>
                      </Card>
                    ) : (
                      <p className="text-left">No video selected.</p>
                    )}
                    
                    <div className="flex justify-between">
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
                    
                    {activeVideo && (
                      <div className="mt-6 text-left">
                        <VideoAnalysis video={activeVideo} />
                      </div>
                    )}
                  </div>
                  
                  {/* Video List */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-left">Videos</h3>
                    {videos.map((video, index) => (
                      <Card 
                        key={video.id} 
                        className={`flex items-center gap-4 p-4 rounded-md border cursor-pointer hover:bg-secondary text-left ${activeVideo?.id === video.id ? 'bg-secondary text-secondary-foreground' : ''}`}
                        onClick={() => handleVideoClick(video, index)}
                      >
                        <Video className="h-5 w-5" />
                        <div>
                          <h4 className="font-medium">{video.title}</h4>
                          <p className="text-sm text-muted-foreground">{formatDuration(video.duration)}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="resources" className="space-y-4 py-4">
                <h2 className="text-2xl font-bold text-left">Course Resources</h2>
                
                {notes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map(note => (
                      <Card key={note.id} className="bg-card border rounded-lg overflow-hidden">
                        <div className="p-4 text-left">
                          <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
                          <p className="text-muted-foreground line-clamp-2 mb-4 text-sm">{note.description}</p>
                          <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Download Resource
                          </a>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-left">No resources available for this course.</p>
                )}
              </TabsContent>
              
              <TabsContent value="quiz" className="space-y-4 py-4">
                <h2 className="text-2xl font-bold text-left">Course Quiz</h2>
                {id && (
                  <CourseQuiz 
                    courseId={id}
                    quizId="quiz-1"
                    title="Module Assessment Quiz"
                    description="Test your knowledge of the concepts covered in this course"
                    questions={getQuiz("quiz-1")?.questions || []}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
          
          {!isEnrolled && (
            <div className="my-10 p-6 border rounded-lg bg-muted/10 text-center space-y-4">
              <h2 className="text-2xl font-bold">Course Preview</h2>
              <p className="text-muted-foreground">Enroll in this course to access all lectures, resources, and quizzes.</p>
              <div>
                <h3 className="text-xl font-semibold mb-2">What you'll learn</h3>
                <ul className="list-disc list-inside text-left max-w-lg mx-auto">
                  <li>Understand the basic principles of...</li>
                  <li>Apply these principles to real-world scenarios</li>
                  <li>Build your own...</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
