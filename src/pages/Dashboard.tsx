
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Book, Users, Play, FileText, Settings, Clock, ChevronRight, BarChart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCourses } from "@/context/CourseContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { CourseCard } from "@/components/courses/CourseCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    const totalStudents = 245; // Mock data
    const totalCourses = courses.length;
    const totalEnrollments = 742; // Mock data
    
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold heading-gradient">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage courses, users, and platform analytics</p>
          </header>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <Book className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCourses}</div>
                <p className="text-xs text-muted-foreground">
                  +2 added this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEnrollments}</div>
                <p className="text-xs text-muted-foreground">
                  +85 from last week
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>
                  User engagement and course popularity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-muted rounded-md">
                  <BarChart className="h-16 w-16 text-muted-foreground/50" />
                  <p className="ml-4 text-muted-foreground">Analytics chart will appear here</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest user and course activities
                  </CardDescription>
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
                    
                    <div className="flex items-center">
                      <div className="mr-4 rounded-full bg-primary/10 p-2">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">New course material added</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-between" variant="outline">
                    Add New Course
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button className="w-full justify-between" variant="outline">
                    Manage Users
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button className="w-full justify-between" variant="outline">
                    Platform Settings
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Courses</CardTitle>
                  <Button>Add New Course</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
        <Chatbot />
      </>
    );
  }
  
  // Student Dashboard
  const enrolledCourses = courses.filter(course => 
    user.enrolledCourses?.includes(course.id)
  );
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold heading-gradient">Student Dashboard</h1>
          <p className="text-muted-foreground">Track your learning progress and manage your courses</p>
        </header>
        
        <Tabs defaultValue="courses" className="mb-8">
          <TabsList>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="progress">Learning Progress</TabsTrigger>
            <TabsTrigger value="settings">Account Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="courses" className="mt-6">
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't enrolled in any courses yet. Start by exploring our course catalog.
                </p>
                <Button onClick={() => navigate("/courses")}>
                  Browse Courses
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="progress" className="mt-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Study Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12h 30m</div>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
                  <Book className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0 / {enrolledCourses.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Keep going!
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
                  <Play className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3 days</div>
                  <p className="text-xs text-muted-foreground">
                    Current streak
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {enrolledCourses.length > 0 ? (
              <div className="mt-6 space-y-6">
                <h3 className="text-lg font-medium mb-4">Course Progress</h3>
                
                {enrolledCourses.map(course => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full md:w-48 h-32 object-cover"
                      />
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{course.title}</h4>
                          <span className="text-sm text-muted-foreground">35%</span>
                        </div>
                        <Progress value={35} className="mb-4" />
                        <div className="flex justify-between">
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">7</span> of 20 lessons completed
                          </div>
                          <Button size="sm" onClick={() => navigate(`/courses/${course.id}`)}>
                            Continue
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No progress to track</h3>
                <p className="text-muted-foreground mb-4">
                  Enroll in courses to start tracking your learning progress.
                </p>
                <Button onClick={() => navigate("/courses")}>
                  Browse Courses
                </Button>
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
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recommended Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses
              .filter(course => !user.enrolledCourses?.includes(course.id))
              .slice(0, 3)
              .map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
          </div>
        </div>
      </div>
      <Footer />
      <Chatbot />
    </>
  );
}
