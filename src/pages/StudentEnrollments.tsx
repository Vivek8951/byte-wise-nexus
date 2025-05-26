
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Award, PlayCircle } from 'lucide-react';

const StudentEnrollments = () => {
  const enrollments = [
    {
      id: 1,
      title: "Introduction to React",
      instructor: "Sarah Johnson",
      progress: 75,
      status: "In Progress",
      duration: "8 weeks",
      nextLesson: "React Hooks",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Advanced JavaScript",
      instructor: "Michael Chen",
      progress: 100,
      status: "Completed",
      duration: "10 weeks",
      nextLesson: null,
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "TypeScript Fundamentals",
      instructor: "Emily Davis",
      progress: 45,
      status: "In Progress",
      duration: "6 weeks",
      nextLesson: "Type Definitions",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">My Enrollments</h1>
            <div className="text-sm text-muted-foreground">
              {enrollments.length} courses enrolled
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="space-y-4">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>by {course.instructor}</CardDescription>
                  </div>
                  <Badge variant={course.status === "Completed" ? "default" : "secondary"}>
                    {course.status}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>

                  {course.nextLesson && (
                    <div className="flex items-center gap-2 text-sm">
                      <PlayCircle className="h-4 w-4" />
                      <span>Next: {course.nextLesson}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {course.status === "Completed" ? (
                      <Button variant="outline" className="flex-1">
                        <Award className="h-4 w-4 mr-2" />
                        View Certificate
                      </Button>
                    ) : (
                      <Button className="flex-1">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Continue Learning
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {enrollments.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No enrollments yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your learning journey by enrolling in a course
              </p>
              <Button>Browse Courses</Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentEnrollments;
