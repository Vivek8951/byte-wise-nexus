
import { Link, useNavigate } from "react-router-dom";
import { Course } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEnrollClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

    // Check if user is already enrolled (from Supabase)
    try {
      const { data: existingEnrollment, error: enrollCheckError } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', user?.id)
        .eq('course_id', course.id)
        .single();

      if (enrollCheckError && !enrollCheckError.message.includes('No rows found')) {
        console.error("Error checking enrollment:", enrollCheckError);
      }

      // If not enrolled, create enrollment
      if (!existingEnrollment) {
        const { error: enrollError } = await supabase
          .from('course_enrollments')
          .insert({
            user_id: user?.id,
            course_id: course.id,
            enrollment_date: new Date().toISOString()
          });

        if (enrollError) {
          console.error("Error enrolling in course:", enrollError);
          toast({
            title: "Enrollment failed",
            description: "Could not enroll in this course. Please try again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Successfully enrolled",
          description: "You have been enrolled in this course.",
        });
      }

      // Navigate to course detail page
      navigate(`/courses/${course.id}`);
    } catch (error) {
      console.error("Error in enrollment process:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Link to={`/courses/${course.id}`} className="group">
      <div className="bg-card border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30 h-full flex flex-col">
        <div className="relative">
          {course.thumbnail ? (
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full aspect-video object-cover object-center"
              loading="lazy"
            />
          ) : (
            <div className="w-full aspect-video bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No thumbnail</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className={`${getLevelColor(course.level)}`}>
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="p-4 text-left flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="bg-card">
              {course.category}
            </Badge>
            {course.rating && (
              <div className="flex items-center text-amber-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 mr-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
                {course.rating.toFixed(1)}
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          
          <p className="text-muted-foreground line-clamp-2 mb-4 text-sm">
            {course.description}
          </p>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between text-sm mb-4">
              <div className="font-medium">
                {course.instructor}
              </div>
              <div className="text-muted-foreground">
                {course.duration}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {course.enrolledCount || 0} students enrolled
              </div>
              <Button 
                size="sm" 
                onClick={handleEnrollClick}
                className="transition-all"
                disabled={isAuthenticated && user?.role === 'admin'}
              >
                {isAuthenticated && user?.role === 'admin' ? 'Cannot Enroll' : 'Enroll Now'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Add a skeleton loader version of the card for better loading states
export function CourseCardSkeleton() {
  return (
    <div className="bg-card border rounded-lg overflow-hidden h-full">
      <Skeleton className="w-full aspect-video" />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-10" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}
