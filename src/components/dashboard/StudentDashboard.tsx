import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, BarChart as BarChartIcon, Clock, Award, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackButton } from "@/components/ui/back-button";
import { CourseCard } from "@/components/courses/CourseCard";
import { isUserEnrolled, getUserEnrollments, enrollUserInCourse } from "@/data/mockProgressData";
import { toast } from "@/components/ui/sonner";
import { User, Course } from "@/types";

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
    totalHoursLearned: 0,
    certificatesEarned: 0,
  });
  
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
            totalHoursLearned: Math.floor(Math.random() * 50) + 10, // Mock data
            certificatesEarned: enrollments.filter(e => e.certificateIssued).length,
          });
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
      try {
        await enrollUserInCourse(user.id, courseId);
        toast.success("Successfully enrolled in course!");
        setEnrolledCourseIds(prev => [...prev, courseId]);
      } catch (error) {
        console.error("Error enrolling in course:", error);
        toast.error("Failed to enroll in course. Please try again.");
      }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">In Progress</p>
                <h3 className="text-2xl font-bold text-tech-blue">{dashboardStats.coursesInProgress}</h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Play className="h-5 w-5 text-tech-blue" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                <h3 className="text-2xl font-bold text-green-600">{dashboardStats.coursesCompleted}</h3>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <Award className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Hours Learned</p>
                <h3 className="text-2xl font-bold text-orange-500">{dashboardStats.totalHoursLearned}</h3>
              </div>
              <div className="bg-orange-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Certificates</p>
                <h3 className="text-2xl font-bold text-purple-600">{dashboardStats.certificatesEarned}</h3>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="enrolled" className="mb-8">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
          <TabsTrigger value="enrolled" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">My Courses</TabsTrigger>
          <TabsTrigger value="available" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Available Courses</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Account Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="enrolled" className="mt-6">
          {enrolledCourses.length > 0 ? (
            <div className="space-y-6">
              {enrolledCourses.map(course => (
                <Card key={course.id} className="overflow-hidden transition-all hover:shadow-lg border-t-4 border-t-tech-blue">
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
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{course.description}</p>
                        </div>
                        <span className="bg-tech-blue/10 text-tech-blue px-3 py-1 rounded-full text-sm font-medium">
                          {course.level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <BookOpen className="h-4 w-4 mr-1" />
                          <span>{course.duration}</span>
                        </div>
                        <Button 
                          onClick={() => navigate(`/courses/${course.id}`)}
                          className="bg-tech-blue hover:bg-tech-darkblue transition-colors"
                        >
                          Continue Learning
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                You haven't enrolled in any courses yet. Start by exploring our available courses.
              </p>
              <Button onClick={() => navigate("/courses")} className="bg-tech-blue hover:bg-tech-darkblue">
                Browse Courses
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="available" className="mt-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Recommended for you</h2>
            <p className="text-muted-foreground">Courses selected based on your interests and goals</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses.map(course => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all border border-gray-100">
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-lg">{course.title}</h4>
                    <span className="bg-tech-blue/10 text-tech-blue px-3 py-1 rounded-full text-sm font-medium">
                      {course.level}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{course.duration}</span>
                    </div>
                    <Button 
                      onClick={() => enrollInCourse(course.id)}
                      className="bg-tech-blue hover:bg-tech-darkblue"
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
              className="border-tech-blue text-tech-blue hover:bg-tech-blue/10"
            >
              Explore All Courses
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Profile Information</h4>
                    <p className="text-sm text-muted-foreground">
                      Update your name, email, and profile details
                    </p>
                  </div>
                  <Button variant="outline">
                    Edit
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-muted-foreground">
                      Change your password and security settings
                    </p>
                  </div>
                  <Button variant="outline">
                    Change
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notification Preferences</h4>
                    <p className="text-sm text-muted-foreground">
                      Control how and when you receive notifications
                    </p>
                  </div>
                  <Button variant="outline">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
