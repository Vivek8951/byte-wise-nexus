
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCourses } from "@/context/CourseContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, User as UserIcon, Book, FileText, CheckCircle } from 'lucide-react';
import { User } from '@/types';
import { format } from 'date-fns';

interface UserDetailsProps {
  userId: string;
  onClose: () => void;
}

export function UserDetails({ userId, onClose }: UserDetailsProps) {
  const { courses } = useCourses();
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;
        
        // Fetch user enrollments
        const { data: userEnrollments, error: enrollmentsError } = await supabase
          .from('course_enrollments')
          .select('*')
          .eq('user_id', userId);

        if (enrollmentsError) throw enrollmentsError;
        
        // Fetch quiz attempts
        const { data: userQuizAttempts, error: quizError } = await supabase
          .from('quiz_attempts')
          .select('*, quizzes(title)')
          .eq('user_id', userId);

        if (quizError) throw quizError;
        
        // Fetch course progress
        const { data: userProgress, error: progressError } = await supabase
          .from('course_progress')
          .select('*')
          .eq('user_id', userId);

        if (progressError) throw progressError;
        
        setUser({
          ...profile,
          enrolledCourses: userEnrollments.map(e => e.course_id)
        });
        setEnrollments(userEnrollments);
        setQuizAttempts(userQuizAttempts);
        setProgress(userProgress);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  if (loading || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading user details...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tech-blue"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCourseById = (courseId: string) => {
    return courses.find(course => course.id === courseId) || { title: 'Unknown Course' };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            {user.name}
          </CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="enrollments">
          <TabsList className="mb-4">
            <TabsTrigger value="enrollments">Course Enrollments</TabsTrigger>
            <TabsTrigger value="progress">Learning Progress</TabsTrigger>
            <TabsTrigger value="quizzes">Quiz Attempts</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollments">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                    <TableHead>Completion Status</TableHead>
                    <TableHead>Certificate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.length > 0 ? (
                    enrollments.map(enrollment => (
                      <TableRow key={`${enrollment.user_id}-${enrollment.course_id}`}>
                        <TableCell>{getCourseById(enrollment.course_id).title}</TableCell>
                        <TableCell>{formatDate(enrollment.enrollment_date)}</TableCell>
                        <TableCell>
                          {enrollment.is_completed ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" /> Completed
                            </span>
                          ) : (
                            'In Progress'
                          )}
                        </TableCell>
                        <TableCell>
                          {enrollment.certificate_issued ? 
                            'Issued' : 'Not Issued'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Not enrolled in any courses
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="progress">
            <div className="space-y-6">
              {progress.length > 0 ? (
                progress.map(courseProgress => {
                  const course = getCourseById(courseProgress.course_id);
                  return (
                    <div key={`progress-${courseProgress.user_id}-${courseProgress.course_id}`} className="border p-4 rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{course.title}</h4>
                        <span>{courseProgress.overall_progress}%</span>
                      </div>
                      <Progress value={courseProgress.overall_progress} className="mb-4" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <div>
                          <span>{courseProgress.completed_videos ? 
                            (Array.isArray(courseProgress.completed_videos) ? 
                              courseProgress.completed_videos.length : 
                              0) : 
                            0}
                          </span> videos completed
                        </div>
                        <div>
                          Last accessed: {formatDate(courseProgress.last_accessed)}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  No progress data available
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="quizzes">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Completion Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizAttempts.length > 0 ? (
                    quizAttempts.map(attempt => (
                      <TableRow key={attempt.id}>
                        <TableCell>
                          {attempt.quizzes?.title || 'Unknown Quiz'}
                        </TableCell>
                        <TableCell>{getCourseById(attempt.course_id).title}</TableCell>
                        <TableCell>
                          {attempt.score}%
                        </TableCell>
                        <TableCell>{formatDate(attempt.completed_at)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No quiz attempts
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
