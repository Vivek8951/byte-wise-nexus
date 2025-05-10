
import { Link, useNavigate } from "react-router-dom";
import { Course } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Users, BookOpen, Award } from "lucide-react";

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
            enrollment_date: new Date().toISOString(),
            is_completed: false,
            certificate_issued: false
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
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
  };

  // Function to render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={i < Math.floor(rating) ? "currentColor" : "none"}
            stroke="currentColor"
            className={`w-4 h-4 ${i < Math.floor(rating) ? "text-amber-500" : "text-gray-300"}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={i < Math.floor(rating) ? 0 : 1}
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        ))}
        <span className="ml-1 text-sm text-amber-500 font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Link to={`/courses/${course.id}`} className="group">
      <div className="bg-white dark:bg-gray-800 border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 h-full flex flex-col card-hover animate-fade-in">
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
              <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className={`${getLevelColor(course.level)} shadow-sm`}>
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="p-5 text-left flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {course.category}
            </Badge>
            {course.rating && renderStars(course.rating)}
          </div>
          
          <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </h3>
          
          <p className="text-muted-foreground line-clamp-2 mb-4 text-sm">
            {course.description}
          </p>
          
          <div className="mt-auto space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Award className="h-4 w-4" />
                <span className="font-medium text-foreground">
                  {course.instructor}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{course.enrolledCount || 0} enrolled</span>
              </div>
              <Button 
                size="sm"
                onClick={handleEnrollClick}
                className="transition-all hover:scale-105"
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
    <div className="bg-white dark:bg-gray-800 border rounded-xl overflow-hidden h-full">
      <Skeleton className="w-full aspect-video" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-7 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}
