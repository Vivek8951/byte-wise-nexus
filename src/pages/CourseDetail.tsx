import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PlayCircle, BookOpen, Check, CheckCircle, Clock, Award, User, Download } from "lucide-react";
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
  const [materials, setMaterials] = useState<any[]>([]);
  const [certificateData, setCertificateData] = useState<any>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isProcessingCertificate, setIsProcessingCertificate] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchCourseData() {
      setIsLoading(true);
      try {
        // Fetch course details, videos, materials, progress, and certificate
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
    
    if (user && id && videos.length > 0) {
      try {
        const videoIndex = videos.findIndex(v => v.id === video.id);
        const newProgress = Math.round(((videoIndex + 1) / videos.length) * 100);
        
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
    setShowCertificate(true);
    
    try {
      await updateCourseProgress(user.id, id, { 
        completedVideos: videos.map(v => v.id),
        overallProgress: 100 
      });
      
      setProgress(100);
      
      const certificate = await generateCertificate(user.id, id, "Tech Learn");
      
      if (certificate) {
        setCertificateData(certificate);
        toast.success("Congratulations! You've completed this course and earned a certificate!");
        setIsProcessingCertificate(false);
      } else {
        toast.error("Course completed but there was an issue generating your certificate.");
        setIsProcessingCertificate(false);
      }
    } catch (error) {
      console.error('Error marking course as complete:', error);
      toast.error("Failed to update course progress");
      setShowCertificate(false);
      setIsProcessingCertificate(false);
    } finally {
      setIsCompletingCourse(false);
    }
  };

  const viewCertificate = () => {
    if (certificateData) {
      certificateData.appName = "Tech Learn";
      setShowCertificate(true);
    } else {
      if (user && id && progress === 100) {
        setIsProcessingCertificate(true);
        setShowCertificate(true);
        
        generateCertificate(user.id, id, "Tech Learn")
          .then(certificate => {
            if (certificate) {
              setCertificateData(certificate);
              toast.success("Your certificate is ready!");
            } else {
              toast.error("Failed to generate certificate");
            }
            setIsProcessingCertificate(false);
          })
          .catch(error => {
            console.error("Error generating certificate:", error);
            toast.error("Failed to generate certificate");
            setIsProcessingCertificate(false);
          });
      } else {
        toast.error("Please complete the course first to get your certificate");
      }
    }
  };

  const processSelectedVideo = async () => {
    if (!selectedVideo || !id) return;

    setIsProcessing(true);
    setLoadingVideoId(selectedVideo.id);

    try {
      const result = await processVideo(selectedVideo.id, id);

      if (result.success) {
        setSelectedVideo({
          ...selectedVideo,
          analyzed_content: result.data.analyzedContent,
          thumbnail: result.data.thumbnail || selectedVideo.thumbnail,
        });

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
        <div className="flex flex-col space-y-4">
          <BackButton href="/courses" className="self-start" />
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {course.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-950 rounded-md">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-950 rounded-md">
                  <Award className="h-4 w-4" />
                  {course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'All Levels'}
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-950 rounded-md">
                  <User className="h-4 w-4" />
                  {course.instructor}
                </div>
                <Badge variant="outline" className="border-primary/20 text-primary">
                  {course.category}
                </Badge>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/courses')} 
              variant="outline"
              className="hover:bg-accent"
            >
              Browse Courses
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area - Video and tabs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="rounded-lg overflow-hidden border bg-card shadow-md">
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

            {/* Tabs for course content and materials only */}
            <Tabs defaultValue="content" className="bg-card rounded-lg border shadow-md">
              <TabsList className="p-0 border-b rounded-none border-border grid grid-cols-2 w-full">
                <TabsTrigger value="content" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Course Content
                </TabsTrigger>
                <TabsTrigger value="materials" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Study Materials
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="p-4 focus:outline-none">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-primary" />
                  Course Videos
                </h3>
                <div className="space-y-3">
                  {videos.map((video, index) => (
                    <div
                      key={video.id}
                      className={`p-4 rounded-md cursor-pointer border transition-all hover:shadow-md ${
                        selectedVideo?.id === video.id 
                          ? 'bg-primary/5 border-primary/30 shadow-sm' 
                          : 'bg-card hover:bg-accent/50 border-border'
                      }`}
                      onClick={() => handleVideoSelect(video)}
                    >
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3 flex-shrink-0">
                          <PlayCircle className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <h4 className="font-medium text-sm md:text-base truncate">{video.title}</h4>
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">{video.description}</p>
                        </div>
                        <div className="ml-2 flex flex-col items-end gap-1">
                          {loadingVideoId === video.id ? (
                            <div className="animate-spin h-5 w-5 border-t-2 border-primary rounded-full flex-shrink-0"></div>
                          ) : (
                            <Badge variant="outline" className="flex-shrink-0">
                              {Math.floor(parseInt(video.duration) / 60)} min
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Materials content tab */}
              <TabsContent value="materials" className="p-4 focus:outline-none">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Study Materials
                </h3>
                {materials.length > 0 ? (
                  <div className="space-y-3">
                    {materials.map((material, index) => (
                      <div key={material.id} className="flex items-center border rounded-md p-4 hover:shadow-md transition-shadow bg-card">
                        <div className="h-10 w-10 rounded-md bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mr-3">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <p className="font-medium">{material.title}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{material.description}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-auto hover:bg-accent" 
                          onClick={() => window.open(material.file_url, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No study materials available for this course.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar with course info and progress */}
          <div className="space-y-6">
            {/* Course progress card */}
            <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800 shadow-md p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Your Progress
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{progress}% Complete</span>
                    <span>{Math.round(videos.length * progress / 100)}/{videos.length} Videos</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
                <Button 
                  onClick={handleMarkComplete} 
                  className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 shadow-md"
                  disabled={isCompletingCourse || progress === 100}
                >
                  {isCompletingCourse ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" /> 
                      {progress === 100 ? "Completed!" : "Mark as Complete"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          
            {/* Course description card */}
            <div className="rounded-lg border bg-card shadow-md p-6">
              <h3 className="text-lg font-medium mb-3">About This Course</h3>
              <p className="text-muted-foreground leading-relaxed">{course.description}</p>
              <Separator className="my-4" />
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <Badge variant="outline" className="border-primary/20 text-primary">
                    {course.category}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Level</span>
                  <span className="text-sm font-medium">
                    {course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'All Levels'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Instructor</span>
                  <span className="text-sm font-medium">{course.instructor}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium">{course.duration}</span>
                </div>
              </div>
            </div>
            
            {/* Certificate section */}
            <div className="rounded-lg border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800 shadow-md p-6 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-amber-600 mb-3" />
              <h3 className="text-lg font-medium mb-2">Get Certified</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete this course to earn a certificate of completion
              </p>
              <Button 
                variant="outline" 
                className="w-full border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 shadow-sm" 
                disabled={progress < 100}
                onClick={viewCertificate}
              >
                {progress < 100 ? 'Complete Course First' : 'View & Download Certificate'}
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
        appName="Tech Learn"
      />
    </div>
  );
}
