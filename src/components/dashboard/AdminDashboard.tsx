import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  BookOpen, Book, ChevronRight, FileText,
  Users, Plus, Download, Trash2, Loader2,
  Sparkles, Wand
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { CourseCard } from "@/components/courses/CourseCard";
import { Course } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { populateCourses } from "@/utils/supabaseStorage";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AdminDashboardProps {
  courses: Course[];
}

export function AdminDashboard({ courses }: AdminDashboardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [courseCount, setCourseCount] = useState(5);
  
  // Filter out duplicate courses by ID for display
  const uniqueCourses = courses.filter((course, index, self) => 
    index === self.findIndex((c) => c.id === course.id)
  );
  
  const handleGenerateCourses = async () => {
    if (courseCount <= 0) {
      toast({
        title: "Invalid course count",
        description: "Please specify at least 1 course",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      // Process in batches if generating more than 5 courses
      const batchSize = 5;
      const batches = Math.ceil(courseCount / batchSize);
      let totalGenerated = 0;
      
      for (let i = 0; i < batches; i++) {
        const remainingCourses = courseCount - totalGenerated;
        const currentBatchSize = Math.min(remainingCourses, batchSize);
        
        const result = await populateCourses(currentBatchSize, { 
          clearExisting: false
        });
        
        if (result.success) {
          totalGenerated += result.coursesGenerated || 0;
          
          // Show progress toast for multiple batches
          if (batches > 1 && i < batches - 1) {
            toast({
              title: "Progress",
              description: `Generated batch ${i + 1}/${batches} (${totalGenerated}/${courseCount} courses)`,
            });
          }
        } else {
          throw new Error(result.message || "Failed to generate courses");
        }
      }
      
      toast({
        title: "Success",
        description: `Generated ${totalGenerated} courses successfully`,
      });
      setIsGenerateDialogOpen(false);
      
      // Refresh courses data
      window.location.reload();
    } catch (error: any) {
      console.error("Course generation error:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <>
      <div className="flex items-center mb-6">
        <BackButton href="/" className="mr-4" />
        <div>
          <h1 className="text-3xl font-bold heading-gradient">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage courses and platform analytics</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800 text-white hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCourses.length}</div>
            <p className="text-xs text-gray-400">
              Available on platform
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800 text-white hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Plus className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full justify-between mb-2 bg-blue-600 hover:bg-blue-700 text-white border-none" 
              variant="outline"
              onClick={() => navigate("/admin/courses")}
            >
              Add New Course
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              className="w-full justify-between bg-purple-600 hover:bg-purple-700 text-white border-none" 
              variant="outline"
              onClick={() => navigate("/admin/users")}
            >
              Manage Users
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card className="bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">All Courses</CardTitle>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsGenerateDialogOpen(true)}
                  variant="outline"
                  className="group relative overflow-hidden border-none bg-gradient-to-br from-violet-600 to-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 animate-pulse"
                >
                  <span className="relative flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> 
                    <span>Generate Courses with AI</span>
                  </span>
                </Button>
                <Button 
                  onClick={() => navigate("/admin/courses")}
                  className="bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add New Course
                </Button>
              </div>
            </div>
            <CardDescription className="text-gray-400">Manage your existing courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniqueCourses.length > 0 ? (
                uniqueCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No courses available</h3>
                  <p className="text-gray-400 mb-4">
                    Start by creating your first course
                  </p>
                  <Button 
                    onClick={() => navigate("/admin/courses")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Course
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] animate-scale-in bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand className="h-5 w-5 text-purple-400" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-400">
                Generate Courses with AI
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Let our AI create professional courses for your platform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="courseCount" className="text-right text-gray-300">
                Number of courses
              </Label>
              <div className="col-span-3">
                <Input
                  id="courseCount"
                  type="number"
                  min="1"
                  value={courseCount}
                  onChange={(e) => setCourseCount(parseInt(e.target.value) || 5)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Specify the number of courses to generate
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={handleGenerateCourses} 
              disabled={isGenerating}
              className="relative overflow-hidden group bg-gradient-to-br from-violet-600 to-purple-700 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Generate Courses</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
