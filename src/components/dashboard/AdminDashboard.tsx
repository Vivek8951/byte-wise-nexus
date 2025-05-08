
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, Book, ChevronRight, FileText,
  Users, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { CourseCard } from "@/components/courses/CourseCard";
import { Course } from "@/types";

interface AdminDashboardProps {
  courses: Course[];
}

export function AdminDashboard({ courses }: AdminDashboardProps) {
  const navigate = useNavigate();
  const totalCourses = courses.length;
  // Filter out duplicate courses by title for display
  const uniqueCourses = courses.filter((course, index, self) => 
    index === self.findIndex((c) => c.id === course.id)
  );
  
  return (
    <>
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
            <div className="text-2xl font-bold">{uniqueCourses.length}</div>
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
              {uniqueCourses.length > 0 ? (
                uniqueCourses.map(course => (
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
    </>
  );
}
