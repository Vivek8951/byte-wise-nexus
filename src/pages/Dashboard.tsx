
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BookOpen, Book, ChevronRight, FileText,
  Users, Plus, BarChart as BarChartIcon
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { useAuth } from "@/context/AuthContext";
import { useCourses } from "@/context/CourseContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackButton } from "@/components/ui/back-button";
import { CourseCard } from "@/components/courses/CourseCard";
import { isUserEnrolled, getUserEnrollments } from "@/data/mockProgressData";
import { toast } from "@/components/ui/sonner";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { courses, isLoading: coursesLoading } = useCourses();
  const navigate = useNavigate();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);
  
  // Set page title based on user role
  useEffect(() => {
    if (user) {
      document.title = user.role === 'admin' 
        ? "Admin Dashboard - TechLearn" 
        : "Student Dashboard - TechLearn";
    }
  }, [user]);
  
  // Show loading screen while data is being fetched
  if (authLoading || coursesLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tech-blue"></div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (!user) {
    return null;
  }
  
  // Admin Dashboard
  if (user.role === 'admin') {
    const totalCourses = courses.length;
    
    return (
      <>
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <BackButton href="/" className="mr-4" />
            <div>
              <h1 className="text-3xl font-bold heading-gradient">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage courses and platform analytics</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCourses}</div>
                <p className="text-xs text-muted-foreground">
                  Available on platform
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full justify-between mb-2" 
                  variant="outline"
                  onClick={() => navigate("/admin/courses")}
                >
                  Add New Course
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button 
                  className="w-full justify-between" 
                  variant="outline"
                  onClick={() => navigate("/admin/users")}
                >
                  Manage Users
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full bg-primary/10 p-2">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">New student registration</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full bg-primary/10 p-2">
                      <Book className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Course content updated</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">All Courses</CardTitle>
                  <Button 
                    onClick={() => navigate("/admin/courses")}
                    className="bg-tech-blue hover:bg-tech-darkblue"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add New Course
                  </Button>
                </div>
                <CardDescription>Manage your existing courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.length > 0 ? (
                    courses.map(course => (
                      <CourseCard key={course.id} course={course} />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No courses available</h3>
                      <p className="text-muted-foreground mb-4">
                        Start by creating your first course
                      </p>
                      <Button 
                        onClick={() => navigate("/admin/courses")}
                        className="bg-tech-blue hover:bg-tech-darkblue"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Course
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
        <Chatbot />
      </>
    );
  }
  
  // Student Dashboard
  // We'll use the mock data API to simulate user enrollments since we don't have actual data
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  
  useEffect(() => {
    async function fetchEnrollments() {
      if (user) {
        try {
          const enrollments = await getUserEnrollments(user.id);
          setEnrolledCourseIds(enrollments.map(e => e.courseId));
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
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <BackButton href="/" className="mr-4" />
          <div>
            <h1 className="text-3xl font-bold heading-gradient">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your learning journey</p>
          </div>
        </div>
        
        <Tabs defaultValue="enrolled" className="mb-8">
          <TabsList>
            <TabsTrigger value="enrolled">My Courses</TabsTrigger>
            <TabsTrigger value="available">Available Courses</TabsTrigger>
            <TabsTrigger value="settings">Account Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="enrolled" className="mt-6">
            {enrolledCourses.length > 0 ? (
              <div className="space-y-6">
                {enrolledCourses.map(course => (
                  <Card key={course.id} className="overflow-hidden transition-all hover:shadow-lg">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses
                .filter(course => !enrolledCourseIds.includes(course.id))
                .map(course => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all">
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
            
            {courses.filter(course => !enrolledCourseIds.includes(course.id)).length === 0 && (
              <div className="text-center py-12 bg-muted/20 rounded-lg">
                <BarChartIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No more courses available</h3>
                <p className="text-muted-foreground mb-4">
                  You've enrolled in all available courses.
                </p>
              </div>
            )}
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
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}

// Import additional functions and hooks at the beginning of the file
import { useState } from "react";
import { enrollUserInCourse } from "@/data/mockProgressData";
