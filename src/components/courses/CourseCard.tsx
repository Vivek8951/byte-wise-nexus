
import { Link } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import { Course } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  return (
    <Link to={`/courses/${course.id}`}>
      <Card className="course-card h-full overflow-hidden flex flex-col">
        <div className="relative">
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-48 object-cover"
          />
          {course.featured && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-tech-pink text-white dark:bg-tech-pink dark:text-white">
                Featured
              </Badge>
            </div>
          )}
        </div>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-center mb-2">
            <Badge className={`text-xs ${getLevelColor(course.level)}`}>
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </Badge>
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
              <span className="ml-1 text-sm">{course.rating}</span>
            </div>
          </div>
          <h3 className="font-bold text-lg tracking-tight line-clamp-2">{course.title}</h3>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-grow">
          <p className="text-muted-foreground text-sm line-clamp-2">
            {course.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{course.duration}</span>
          </div>
          <div>{course.enrolledCount?.toLocaleString() || 0} students</div>
        </CardFooter>
      </Card>
    </Link>
  );
}
