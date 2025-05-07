import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Book, Calendar, BarChart, Clock, Download, Play, Star, Users, FileText } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { useAuth } from "@/context/AuthContext";
import { useCourses } from "@/context/CourseContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { CourseCard } from "@/components/courses/CourseCard";
import { VideoAnalysis } from "@/components/courses/VideoAnalysis";
import { Video } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { courses, getCourse, getCourseVideos, getCourseNotes, updateVideo } = useCourses();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  const course = id ? getCourse(id) : undefined;
  const videos = id ? getCourseVideos(id) : [];
  const notes = id ? getCourseNotes(id) : [];
  
  useEffect(() => {
    if (course) {
      document.title = `${course.title} - TechLearn`;
    }
    
    // Check if user is enrolled in this course
    const checkEnrollment = async () => {
      if (user && id) {
        try {
          const { data, error } = await supabase
            .from('course_enrollments')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', id)
            .maybeSingle();
          
          setIsEnrolled(!!data);
        } catch (error) {
          console.error("Error checking enrollment:", error);
        }
      }
    };
    
    checkEnrollment();
  }, [course, user, id]);
  
  if (!course) {
    return (
      <>
        <Navbar />
        <div className="min-h-[50vh] flex items-center justify-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/courses")}>
              Browse Courses
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (!user || !id) return;
    
    try {
      // Create enrollment record
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: user.id,
          course_id: id,
          enrollment_date: new Date().toISOString(),
          is_completed: false,
          certificate_issued: false
        });
      
      if (error) {
        throw error;
      }
      
      // Create initial progress record
      await supabase
        .from('course_progress')
        .insert({
          user_id: user.id,
          course_id: id,
          completed_videos: [],
          completed_quizzes: [],
          last_accessed: new Date().toISOString(),
          overall_progress: 0
        });
      
      // Update course enrollment count
      if (course) {
        const newCount = (course.enrolledCount || 0) + 1;
        await supabase
          .from('courses')
          .update({ enrolled_count: newCount })
          .eq('id', id);
      }
      
      setIsEnrolled(true);
      toast({
        title: "Enrolled Successfully",
        description: `You are now enrolled in ${course?.title}`,
      });
    } catch (error) {
      console.error("Error enrolling:", error);
      toast({
        title: "Enrollment Failed",
        description: "There was an error processing your enrollment",
        variant: "destructive"
      });
    }
  };
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  // Function to play a video
  const playVideo = (video: Video) => {
    if (!isEnrolled) {
      toast({
        title: "Enrollment Required",
        description: "Please enroll in this course to watch the videos.",
      });
      return;
    }
    
    setActiveVideo(video);
    toast({
      title: "Video Playback",
      description: "Video playback started",
    });
  };
  
  // Handle video analysis completion
  const handleVideoAnalysisComplete = async (videoId: string, analysis: { title?: string, description?: string, parts: any[] }) => {
    if (analysis && analysis.parts && analysis.parts.length > 0) {
      await updateVideo(videoId, {
        analyzedContent: analysis.parts,
        description: analysis.description || ""
      });
    }
  };
  
  return (
    <>
      <Navbar />
      <main>
        {/* Course Hero Section */}
        <section className="bg-muted/50">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge>{course.category}</Badge>
                  <Badge className={getLevelColor(course.level)}>
                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                  </Badge>
                </div>
                
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                
                <p className="text-lg text-muted-foreground mb-6">
                  {course.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-yellow-400 stroke-yellow-400 mr-1" />
                    <span className="font-medium">{course.rating}</span>
                    <span className="text-muted-foreground ml-1">
                      ({course.enrolledCount?.toLocaleString()} students)
                    </span>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.duration}</span>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center mb-8">
                  <Avatar className="h-10 w-10 mr-3">
                    <div className="bg-tech-blue text-white rounded-full flex items-center justify-center h-full w-full font-medium">
                      {course.instructor.charAt(0)}
                    </div>
                  </Avatar>
                  <div>
                    <p className="font-medium">{course.instructor}</p>
                    <p className="text-sm text-muted-foreground">Instructor</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Card className="overflow-hidden">
                  <div className="relative">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <Button className="gap-2" onClick={handleEnroll}>
                        <Play className="h-4 w-4" />
                        {isEnrolled ? "Continue Learning" : "Enroll Now"}
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Book className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span>Course Content</span>
                        </div>
                        <span>{videos.length + notes.length} items</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Play className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span>Video Lectures</span>
                        </div>
                        <span>{videos.length} videos</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span>Downloadable Notes</span>
                        </div>
                        <span>{notes.length} files</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          {isEnrolled 
                            ? "You're already enrolled in this course"
                            : "Enroll to get full access to course content"}
                        </p>
                        
                        {!isEnrolled && (
                          <Button className="w-full" onClick={handleEnroll}>
                            Enroll Now - Free
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        {/* Course Content Section */}
        <section className="container mx-auto px-4 py-8">
          <Tabs defaultValue="content" className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="content">Course Content</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {isEnrolled && <TabsTrigger value="discussions">Discussions</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="content">
              <div className="space-y-8">
                {videos.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Video Lectures</h2>
                    <div className="space-y-6">
                      {videos.map((video, index) => (
                        <div key={video.id}>
                          <Card className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="flex flex-col md:flex-row">
                                <div className="relative w-full md:w-48 h-32">
                                  <img 
                                    src={video.thumbnail || '/placeholder.svg'} 
                                    alt={video.title} 
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <Button 
                                      variant="outline" 
                                      className="bg-white/20 backdrop-blur-sm" 
                                      size="icon"
                                      onClick={() => playVideo(video)}
                                      disabled={!isEnrolled}
                                    >
                                      <Play className="h-5 w-5" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="p-4 flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h4 className="font-medium">{video.title}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {video.description}
                                      </p>
                                    </div>
                                    <Badge variant="outline">{video.duration}</Badge>
                                  </div>
                                  <div className="mt-4 flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">
                                      Lecture {index + 1}
                                    </span>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="gap-1"
                                      disabled={!isEnrolled}
                                      onClick={() => playVideo(video)}
                                    >
                                      <Play className="h-3 w-3" />
                                      Watch
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          {/* Display VideoAnalysis component when a video is active */}
                          {isEnrolled && activeVideo && activeVideo.id === video.id && (
                            <VideoAnalysis 
                              video={video} 
                              onAnalysisComplete={(analysis) => handleVideoAnalysisComplete(video.id, analysis)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {notes.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Downloadable Notes</h2>
                    <div className="space-y-4">
                      {notes.map((note, index) => (
                        <Card key={note.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                  <h4 className="font-medium">{note.title}</h4>
                                  <Badge>{note.fileType.toUpperCase()}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {note.description}
                                </p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="gap-1"
                                disabled={!isEnrolled}
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="overview">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">About This Course</h2>
                  <p className="text-muted-foreground">
                    {course.description}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-4">What You'll Learn</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <li className="flex items-start">
                      <div className="mr-2 mt-1">
                        <svg className="h-4 w-4 text-tech-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Core concepts and principles of {course.category}</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1">
                        <svg className="h-4 w-4 text-tech-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Practical implementation of theoretical concepts</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1">
                        <svg className="h-4 w-4 text-tech-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Problem-solving techniques and approaches</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1">
                        <svg className="h-4 w-4 text-tech-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Real-world application of {course.title}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="mr-2 mt-1">
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <span>Basic understanding of computer science concepts</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1">
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <span>Familiarity with programming fundamentals</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-4">Instructor</h3>
                  <div className="flex items-start">
                    <Avatar className="h-12 w-12 mr-4">
                      <div className="bg-tech-blue text-white rounded-full flex items-center justify-center h-full w-full font-medium">
                        {course.instructor.charAt(0)}
                      </div>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{course.instructor}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Expert in {course.category}
                      </p>
                      <p className="text-sm">
                        Experienced educator with extensive background in teaching computer science concepts
                        and helping students master complex technical topics.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {isEnrolled && (
              <TabsContent value="discussions">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">Course Discussions</h2>
                  <p className="text-muted-foreground">
                    Engage with other students and the instructor in discussions about course content.
                  </p>
                  
                  <div className="bg-muted/50 p-8 rounded-lg text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No discussions yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Be the first to start a discussion about this course
                    </p>
                    <Button>Start a Discussion</Button>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </section>
        
        {/* Related Courses Section */}
        <section className="container mx-auto px-4 py-8 border-t">
          <h2 className="text-2xl font-bold mb-6">Related Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses
              .filter(c => c.id !== course.id && c.category === course.category)
              .slice(0, 3)
              .map(relatedCourse => (
                <CourseCard key={relatedCourse.id} course={relatedCourse} />
              ))}
          </div>
        </section>
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
