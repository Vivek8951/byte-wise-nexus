import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PlayCircle, BookOpen, Check, CheckCircle, Clock, Award, User } from "lucide-react";
import { useCourses } from "@/context/CourseContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "@/components/ui/sonner";
import { BackButton } from "@/components/ui/back-button";
import { getQuiz } from "@/data/mockQuizData";
import { supabase } from "@/integrations/supabase/client";
import { SimpleVideoPlayer } from "@/components/courses";
import { processVideo } from "@/utils/supabaseStorage";
import { updateCourseProgress, getUserCourseProgress } from "@/data/mockProgressData";
import { generateCertificate, getCertificate } from "@/utils/certificateUtils";
import { CertificateModal } from "@/components/courses/CertificateModal";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { getCourse } = useCourses();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompletingCourse, setIsCompletingCourse] = useState(false);
  const [loadingVideoId, setLoadingVideoId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [certificateData, setCertificateData] = useState<any>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isProcessingCertificate, setIsProcessingCertificate] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchCourseData() {
      setIsLoading(true);
      try {
        // Fetch course details, videos, quizzes, materials, progress, and certificate
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();

        if (courseError) throw courseError;
        setCourse(courseData);

        // Fetch videos
        const { data: videoData, error: videoError } = await supabase
          .from('videos')
          .select('*')
          .eq('course_id', id)
          .order('order_num', { ascending: true });

        if (videoError) throw videoError;
        setVideos(videoData || []);
        if (videoData && videoData.length > 0) {
          setSelectedVideo(videoData[0]);
        }

        // Fetch quizzes
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('course_id', id)
          .order('order_num', { ascending: true });

        if (quizError) throw quizError;
        setQuizzes(quizData || []);

        // Fetch study materials
        const { data: materialsData, error: materialsError } = await supabase
          .from('notes')
          .select('*')
          .eq('course_id', id)
          .order('order_num', { ascending: true });

        if (materialsError) throw materialsError;
        setMaterials(materialsData || []);

        // Fetch user progress if logged in
        if (user) {
          const userProgress = await getUserCourseProgress(user.id, id);
          if (userProgress) {
            setProgress(userProgress.overallProgress);
          } else {
            // Initialize with default progress
            setProgress(0);
          }
          
          // Check if user has a certificate
          const certificate = await getCertificate(user.id, id);
          if (certificate) {
            setCertificateData(certificate);
          }
        }

      } catch (error: any) {
        console.error('Error fetching course data:', error);
        toast.error("Failed to load course data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourseData();
  }, [id, user]);

  const handleVideoSelect = async (video: any) => {
    setSelectedVideo(video);
    
    // Update progress when a new video is selected
    if (user && id && videos.length > 0) {
      try {
        // Calculate new progress based on video position
        const videoIndex = videos.findIndex(v => v.id === video.id);
        const newProgress = Math.round(((videoIndex + 1) / videos.length) * 100);
        
        // Only update if progress increased
        if (newProgress > progress) {
          await updateCourseProgress(user.id, id, {
            completedVideos: videos.slice(0, videoIndex + 1).map(v => v.id),
            overallProgress: newProgress
          });
          
          setProgress(newProgress);
        }
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  const handleMarkComplete = async () => {
    if (!user || !id) return;
    
    setIsCompletingCourse(true);
    setIsProcessingCertificate(true);
    setShowCertificate(true); // Show certificate modal with processing state
    
    try {
      await updateCourseProgress(user.id, id, { 
        completedVideos: videos.map(v => v.id),
        overallProgress: 100 
      });
      
      setProgress(100);
      
      // Generate certificate
      const certificate = await generateCertificate(user.id, id, "EduLMS");
      
      // Add a small delay to ensure UI shows the certificate
      setTimeout(() => {
        if (certificate) {
          setCertificateData(certificate);
          toast.success("Congratulations! You've completed this course and earned a certificate!");
        } else {
          toast.error("Course completed but there was an issue generating your certificate.");
          setShowCertificate(false); // Hide modal if there was an error
        }
        setIsProcessingCertificate(false);
      }, 1500); // Slight delay to ensure the certificate is loaded
      
    } catch (error) {
      console.error('Error marking course as complete:', error);
      toast.error("Failed to update course progress");
      setShowCertificate(false); // Hide modal if there was an error
      setIsProcessingCertificate(false);
    } finally {
      setIsCompletingCourse(false);
    }
  };

  const viewCertificate = () => {
    setShowCertificate(true);
  };

  const processSelectedVideo = async () => {
    if (!selectedVideo || !id) return;

    setIsProcessing(true);
    setLoadingVideoId(selectedVideo.id);

    try {
      const result = await processVideo(selectedVideo.id, id);

      if (result.success) {
        // Update the selected video with processed content and the YouTube thumbnail
        setSelectedVideo({
          ...selectedVideo,
          analyzed_content: result.data.analyzedContent,
          thumbnail: result.data.thumbnail || selectedVideo.thumbnail,
        });

        // Also update in the videos array
        setVideos(videos.map(v => 
          v.id === selectedVideo.id 
            ? { 
                ...v, 
                analyzed_content: result.data.analyzedContent,
                thumbnail: result.data.thumbnail || v.thumbnail
              } 
            : v
        ));

        toast.success("Video processing completed");
      } else {
        toast.error(result.message || "Failed to process video");
      }
    } catch (error: any) {
      console.error('Error processing video:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
      setLoadingVideoId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto my-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto my-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Course not found</h2>
          <p className="mt-2 text-muted-foreground">The course you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate('/courses')} className="mt-4">
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 px-4 max-w-7xl">
      <div className="flex flex-col space-y-6">
        {/* Header with back button and course title */}
        <div className="flex flex-col space-y-2">
          <BackButton href="/courses" className="self-start" />
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              {course.duration}
            </div>
            <div className="flex items-center">
              <Award className="mr-1 h-4 w-4" />
              {course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'All Levels'}
            </div>
            <div className="flex items-center">
              <User className="mr-1 h-4 w-4" />
              {course.instructor}
            </div>
            <Badge variant="outline">{course.category}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area - Video and tabs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="rounded-lg overflow-hidden border bg-card text-card-foreground shadow">
              {selectedVideo ? (
                <div className="space-y-4">
                  <AspectRatio ratio={16 / 9} className="bg-muted">
                    <SimpleVideoPlayer 
                      url={selectedVideo.url} 
                      title={selectedVideo.title} 
                    />
                  </AspectRatio>
                  <div className="p-4">
                    <h2 className="text-xl font-semibold">{selectedVideo.title}</h2>
                    <p className="text-muted-foreground mt-1">{selectedVideo.description}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[60vh] bg-muted">
                  <div className="text-center">
                    <PlayCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Select a video to start watching</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs for different content types */}
            <Tabs defaultValue="content" className="bg-card text-card-foreground rounded-lg border shadow">
              <TabsList className="p-0 border-b rounded-none border-border grid grid-cols-3">
                <TabsTrigger value="content" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Course Content</TabsTrigger>
                <TabsTrigger value="quiz" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Assessments</TabsTrigger>
                <TabsTrigger value="materials" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Materials</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="p-4 focus:outline-none">
                <h3 className="text-lg font-medium mb-4">Course Videos</h3>
                <div className="space-y-2">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className={`p-3 rounded-md cursor-pointer hover:bg-accent/50 ${selectedVideo?.id === video.id ? 'bg-accent' : ''}`}
                      onClick={() => handleVideoSelect(video)}
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center mr-3 flex-shrink-0">
                          <PlayCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm md:text-base truncate">{video.title}</h4>
                          <p className="text-xs md:text-sm text-muted-foreground truncate max-w-full">{video.description}</p>
                        </div>
                        {loadingVideoId === video.id ? (
                          <div className="ml-2 animate-spin h-5 w-5 border-t-2 border-primary rounded-full flex-shrink-0"></div>
                        ) : (
                          <Badge variant="outline" className="ml-2 flex-shrink-0">{Math.floor(parseInt(video.duration) / 60)} min</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Quiz content tab */}
              <TabsContent value="quiz" className="p-4 focus:outline-none">
                <h3 className="text-lg font-medium mb-4">Assessment Quizzes</h3>
                {quizzes.length > 0 ? (
                  <div className="space-y-4">
                    {quizzes.map((quiz) => (
                      <div key={quiz.id} className="border rounded-md p-4">
                        <h4 className="font-medium">{quiz.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{quiz.description}</p>
                        <Button variant="outline" onClick={() => {}}>
                          Start Quiz
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No quizzes available for this course.</p>
                )}
              </TabsContent>
              
              {/* Materials content tab */}
              <TabsContent value="materials" className="p-4 focus:outline-none">
                <h3 className="text-lg font-medium mb-4">Study Materials</h3>
                {materials.length > 0 ? (
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div key={material.id} className="flex items-center border rounded-md p-3">
                        <BookOpen className="h-5 w-5 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{material.title}</p>
                          <p className="text-sm text-muted-foreground">{material.description}</p>
                        </div>
                        <Button variant="outline" className="ml-auto" onClick={() => window.open(material.file_url, '_blank')}>
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No study materials available for this course.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar with course info and progress */}
          <div className="space-y-6">
            {/* Course progress card */}
            <div className="rounded-lg border bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 text-white shadow p-4">
              <h3 className="text-lg font-medium mb-2">Your Progress</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{progress}% Complete</span>
                    <span>{Math.round(videos.length * progress / 100)}/{videos.length} Videos</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-gray-700">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }} />
                  </Progress>
                </div>
                <Button 
                  onClick={handleMarkComplete} 
                  variant="outline" 
                  className="w-full border border-green-500 text-green-400 hover:bg-green-900/20"
                  disabled={isCompletingCourse || progress === 100}
                >
                  {isCompletingCourse ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500 mr-2" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" /> {progress === 100 ? "Completed!" : "Mark as Complete"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          
            {/* Course description card */}
            <div className="rounded-lg border bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 text-white shadow p-4">
              <h3 className="text-lg font-medium mb-2">About This Course</h3>
              <p className="text-gray-300">{course.description}</p>
              <Separator className="my-4 bg-gray-700" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Category</span>
                  <Badge className="bg-gray-700 hover:bg-gray-600 text-white">{course.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Level</span>
                  <span className="text-sm">{course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'All Levels'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Instructor</span>
                  <span className="text-sm">{course.instructor}</span>
                </div>
              </div>
            </div>
            
            {/* Certificate card */}
            <div className="rounded-lg border bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 text-white shadow p-4 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-blue-400 mb-2" />
              <h3 className="text-lg font-medium">Get Certified</h3>
              <p className="text-sm text-gray-300 mb-4">Complete this course to earn a certificate</p>
              <Button 
                variant="outline" 
                className="w-full border-blue-500 text-blue-400 hover:bg-blue-900/20" 
                disabled={progress < 100 || !certificateData}
                onClick={viewCertificate}
              >
                {progress < 100 ? 'Complete Course to Earn' : certificateData ? 'View Certificate' : 'Processing Certificate...'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Certificate Modal */}
      <CertificateModal 
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        certificateData={certificateData}
        isProcessing={isProcessingCertificate}
        appName="EduLMS"
      />
    </div>
  );
}
