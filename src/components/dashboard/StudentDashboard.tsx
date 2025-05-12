import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Award, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseCard } from "@/components/courses/CourseCard";
import { isUserEnrolled, getUserEnrollments, enrollUserInCourse, updateCourseProgress } from "@/data/mockProgressData";
import { toast } from "@/components/ui/sonner";
import { User, Course } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { CertificateModal } from "@/components/courses/CertificateModal";

interface StudentDashboardProps {
  user: User;
  courses: Course[];
}

export function StudentDashboard({ user, courses }: StudentDashboardProps) {
  const navigate = useNavigate();
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    coursesInProgress: 0,
    coursesCompleted: 0,
    certificatesEarned: 0,
  });
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  
  useEffect(() => {
    async function fetchEnrollments() {
      if (user) {
        try {
          const enrollments = await getUserEnrollments(user.id);
          setEnrolledCourseIds(enrollments.map(e => e.courseId));
          
          // Calculate dashboard stats based on enrollments
          setDashboardStats({
            coursesInProgress: enrollments.filter(e => !e.isCompleted).length,
            coursesCompleted: enrollments.filter(e => e.isCompleted).length,
            certificatesEarned: enrollments.filter(e => e.certificateIssued).length,
          });
          
          // Fetch certificates directly from the table
          try {
            const { data: certsData, error: certsError } = await supabase
              .from('certificates')
              .select('*')
              .eq('user_id', user.id);
            
            if (certsError) {
              console.error("Error fetching certificates:", certsError);
              return;
            }
            
            if (certsData) {
              setCertificates(certsData);
            }
          } catch (certError) {
            console.error("Error fetching certificates:", certError);
          }
        } catch (error) {
          console.error("Error fetching enrollments:", error);
          setEnrolledCourseIds([]);
        }
      }
    }
    
    fetchEnrollments();
  }, [user]);
  
  const enrolledCourses = courses.filter(course => 
    enrolledCourseIds.includes(course.id)
  );
  
  const recommendedCourses = courses
    .filter(course => !enrolledCourseIds.includes(course.id))
    .slice(0, 4);
  
  const enrollInCourse = async (courseId: string) => {
    if (user) {
      setLoading(true);
      try {
        await enrollUserInCourse(user.id, courseId);
        toast.success("Successfully enrolled in course!");
        setEnrolledCourseIds(prev => [...prev, courseId]);
        
        // Update dashboard stats
        setDashboardStats(prev => ({
          ...prev,
          coursesInProgress: prev.coursesInProgress + 1
        }));
      } catch (error) {
        console.error("Error enrolling in course:", error);
        toast.error("Failed to enroll in course. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkComplete = async (courseId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update progress to 100%
      await updateCourseProgress(user.id, courseId, { overallProgress: 100 });
      
      // Update local state
      setDashboardStats(prev => ({
        ...prev,
        coursesInProgress: Math.max(0, prev.coursesInProgress - 1),
        coursesCompleted: prev.coursesCompleted + 1,
        certificatesEarned: prev.certificatesEarned + 1,
      }));
      
      toast.success("Course marked as complete! Certificate issued.");
    } catch (error) {
      console.error("Error marking course as complete:", error);
      toast.error("Failed to update course status. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const viewCertificate = (certificate: any) => {
    if (certificate && certificate.certificate_data) {
      // Ensure the certificate data includes the correct app name
      let certData = certificate.certificate_data;
      certData.appName = "Tech Learn"; // Override app name to ensure consistency
      
      setSelectedCertificate(certData);
      setShowCertificate(true);
      
      // Auto-download will happen via the Certificate component's useEffect
    } else {
      toast.error("Certificate data not available");
    }
  };
  
  return (
    <>
      <div className="flex items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Learning</h1>
          <p className="text-muted-foreground">Track your progress and continue learning</p>
        </div>
      </div>
      
      {/* Dashboard stats cards - Coursera-like */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-950 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 border-gray-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300 mb-1">In Progress</p>
                <h3 className="text-2xl font-bold text-white">{dashboardStats.coursesInProgress}</h3>
              </div>
              <div className="bg-blue-900/50 p-2 rounded-full">
                <Play className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-900 to-gray-950 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 border-gray-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-green-300 mb-1">Completed</p>
                <h3 className="text-2xl font-bold text-white">{dashboardStats.coursesCompleted}</h3>
              </div>
              <div className="bg-green-900/50 p-2 rounded-full">
                <Award className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-900 to-gray-950 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 border-gray-800 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-purple-300 mb-1">Certificates</p>
                <h3 className="text-2xl font-bold text-white">{certificates.length}</h3>
              </div>
              <div className="bg-purple-900/50 p-2 rounded-full">
                <Award className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="enrolled" className="mb-8">
        <TabsList className="bg-slate-800 dark:bg-slate-800 p-1 rounded-md">
          <TabsTrigger value="enrolled" className="data-[state=active]:bg-blue-600 text-white">My Courses</TabsTrigger>
          <TabsTrigger value="available" className="data-[state=active]:bg-blue-600 text-white">Available Courses</TabsTrigger>
          <TabsTrigger value="certificates" className="data-[state=active]:bg-blue-600 text-white">My Certificates</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600 text-white">Account Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="enrolled" className="mt-6">
          {enrolledCourses.length > 0 ? (
            <div className="space-y-6">
              {enrolledCourses.map(course => (
                <Card key={course.id} className="overflow-hidden transition-all hover:shadow-lg bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 border-t-4 border-t-blue-600 text-white">
                  <div className="flex flex-col md:flex-row">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full md:w-48 h-36 object-cover"
                    />
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-lg mb-1">{course.title}</h4>
                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{course.description}</p>
                        </div>
                        <span className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                          {course.level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-sm text-gray-400">
                          <BookOpen className="h-4 w-4 mr-1" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleMarkComplete(course.id)}
                            variant="outline" 
                            className="border-green-500 text-green-400 hover:bg-green-950/50"
                            disabled={loading}
                          >
                            Mark Complete
                          </Button>
                          <Button 
                            onClick={() => navigate(`/courses/${course.id}`)}
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                          >
                            Continue
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2 text-white">No courses yet</h3>
              <p className="text-gray-400 mb-4 max-w-md mx-auto">
                You haven't enrolled in any courses yet. Start by exploring our available courses.
              </p>
              <Button onClick={() => navigate("/courses")} className="bg-blue-600 hover:bg-blue-700 animate-pulse">
                Browse Courses
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="available" className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Recommended for you</h2>
            <p className="text-gray-400">Courses selected based on your interests and goals</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses.map(course => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 text-white">
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-lg">{course.title}</h4>
                    <span className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                      {course.level}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-sm text-gray-400">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{course.duration}</span>
                    </div>
                    <Button 
                      onClick={() => enrollInCourse(course.id)}
                      className="bg-blue-600 hover:bg-blue-700 transition-colors"
                      disabled={loading}
                    >
                      Enroll Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate("/courses")}
              className="border-blue-500 text-blue-400 hover:bg-blue-950/50 animate-pulse"
            >
              Explore All Courses
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="certificates" className="mt-6">
          {certificates && certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <Card 
                  key={cert.id} 
                  className="overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 text-white hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
                >
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="mb-4">
                      <Award className="h-12 w-12 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      {cert.certificate_data?.courseTitle || "Course Certificate"}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Completed on: {cert.certificate_data?.completionDate || "N/A"}
                    </p>
                    <Button 
                      onClick={() => viewCertificate(cert)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Download Certificate
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-lg">
              <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2 text-white">No certificates yet</h3>
              <p className="text-gray-400 mb-4 max-w-md mx-auto">
                Complete courses to earn certificates that showcase your achievements.
              </p>
              <Button onClick={() => navigate("/courses")} className="bg-blue-600 hover:bg-blue-700">
                Explore Courses
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <Card className="bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 text-white">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Profile Information</h4>
                    <p className="text-sm text-gray-400">
                      Update your name, email, and profile details
                    </p>
                  </div>
                  <Button variant="outline" className="border-blue-500 text-blue-300 hover:bg-blue-900/30">
                    Edit
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-gray-400">
                      Change your password and security settings
                    </p>
                  </div>
                  <Button variant="outline" className="border-blue-500 text-blue-300 hover:bg-blue-900/30">
                    Change
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notification Preferences</h4>
                    <p className="text-sm text-gray-400">
                      Control how and when you receive notifications
                    </p>
                  </div>
                  <Button variant="outline" className="border-blue-500 text-blue-300 hover:bg-blue-900/30">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Certificate Modal */}
      <CertificateModal 
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        certificateData={selectedCertificate}
        appName="Tech Learn"
      />
    </>
  );
}
