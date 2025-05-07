
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { markQuizAsCompleted } from "@/data/mockProgressData";
import { toast } from "@/components/ui/sonner";
import { Book, Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface CourseQuizProps {
  courseId: string;
  quizId: string;
  title: string;
  description: string;
  questions: Question[];
  onComplete?: (score: number) => void;
}

export function CourseQuiz({
  courseId,
  quizId,
  title,
  description,
  questions: initialQuestions,
  onComplete
}: CourseQuizProps) {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(initialQuestions ? false : true);

  // Fetch questions if not provided or fetch from video analysis content
  useEffect(() => {
    const loadQuestionsForCourse = async () => {
      if (initialQuestions && initialQuestions.length > 0) {
        setQuestions(initialQuestions);
        setSelectedAnswers(Array(initialQuestions.length).fill(-1));
        setIsLoadingQuestions(false);
        return;
      }
      
      setIsLoadingQuestions(true);
      
      try {
        // Try to fetch questions from the videos table's analyzed_content
        const { data: videos, error: videosError } = await supabase
          .from('videos')
          .select('analyzed_content')
          .eq('course_id', courseId)
          .not('analyzed_content', 'is', null);
        
        if (videosError) {
          throw videosError;
        }
        
        // Extract questions from analyzed_content
        const quizQuestions: Question[] = [];
        
        videos.forEach((video, videoIndex) => {
          if (video.analyzed_content) {
            const analyzedContent = video.analyzed_content;
            
            // Check if analyzedContent is an object with a questions property
            if (typeof analyzedContent === 'object' && analyzedContent !== null && 'questions' in analyzedContent) {
              const contentQuestions = analyzedContent.questions;
              
              if (Array.isArray(contentQuestions)) {
                // Handle array of questions
                contentQuestions.forEach((q: any, qIndex: number) => {
                  if (q.question && q.options) {
                    const options = Array.isArray(q.options) 
                      ? q.options.map((opt: any) => String(opt)) 
                      : [];
                    
                    const correctAnswer = typeof q.correctAnswer === 'number' 
                      ? q.correctAnswer 
                      : (typeof q.correctOption === 'number' 
                        ? q.correctOption
                        : 0);
                    
                    quizQuestions.push({
                      id: `video_${videoIndex}_q_${qIndex}`,
                      text: String(q.question),
                      options: options,
                      correctAnswer: correctAnswer
                    });
                  }
                });
              } else if (typeof contentQuestions === 'object' && contentQuestions !== null) {
                // Handle single question object
                const q = contentQuestions;
                if (q.question && q.options) {
                  const options = Array.isArray(q.options) 
                    ? q.options.map((opt: any) => String(opt)) 
                    : [];
                  
                  const correctAnswer = typeof q.correctAnswer === 'number' 
                    ? q.correctAnswer 
                    : (typeof q.correctOption === 'number' 
                      ? q.correctOption
                      : 0);
                  
                  quizQuestions.push({
                    id: `video_${videoIndex}_q_single`,
                    text: String(q.question),
                    options: options,
                    correctAnswer: correctAnswer
                  });
                }
              }
            }
          }
        });
        
        if (quizQuestions.length > 0) {
          // Use the questions from analyzed content
          setQuestions(quizQuestions);
          setSelectedAnswers(Array(quizQuestions.length).fill(-1));
        } else {
          // If no questions found, create default questions
          const defaultQuestions: Question[] = [
            {
              id: "default_q1",
              text: `What is the main topic covered in this course?`,
              options: [
                "The fundamentals and key concepts",
                "Only advanced topics",
                "Unrelated material",
                "Historical context only"
              ],
              correctAnswer: 0
            },
            {
              id: "default_q2",
              text: "How should you approach learning this subject?",
              options: [
                "Skip all the basics",
                "Practice regularly with examples",
                "Memorize without understanding",
                "Ignore the practical applications"
              ],
              correctAnswer: 1
            },
            {
              id: "default_q3",
              text: "What is a good way to test your understanding?",
              options: [
                "Never review the material",
                "Only read, never practice",
                "Apply concepts to solve problems",
                "Skip all exercises"
              ],
              correctAnswer: 2
            }
          ];
          
          setQuestions(defaultQuestions);
          setSelectedAnswers(Array(defaultQuestions.length).fill(-1));
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        toast("Failed to load quiz questions. Using default questions instead.");
        
        // Use fallback questions
        const fallbackQuestions: Question[] = [
          {
            id: "fallback_q1",
            text: "Which approach is best for mastering this subject?",
            options: [
              "Regular practice and application",
              "Skimming through content quickly",
              "Memorizing without understanding",
              "Avoiding difficult concepts"
            ],
            correctAnswer: 0
          },
          {
            id: "fallback_q2",
            text: "What's an effective way to reinforce your learning?",
            options: [
              "Avoid taking notes",
              "Teaching concepts to others",
              "Only focusing on theory",
              "Skipping practical exercises"
            ],
            correctAnswer: 1
          }
        ];
        
        setQuestions(fallbackQuestions);
        setSelectedAnswers(Array(fallbackQuestions.length).fill(-1));
      } finally {
        setIsLoadingQuestions(false);
      }
    };
    
    loadQuestionsForCourse();
  }, [courseId, initialQuestions]);

  const handleAnswer = (answerIndex: number) => {
    if (isSubmitted) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestion(index);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((selected, index) => {
      if (selected === questions[index].correctAnswer) {
        correct += 1;
      }
    });
    return {
      score: correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100)
    };
  };

  const handleSubmit = async () => {
    if (!user) {
      toast("Please log in to submit your quiz");
      return;
    }

    setIsLoading(true);
    setIsSubmitted(true);
    
    const result = calculateScore();
    
    // Record quiz completion
    if (user) {
      try {
        // First try to save to Supabase if connected
        try {
          await supabase
            .from('quiz_attempts')
            .insert({
              user_id: user.id,
              course_id: courseId,
              quiz_id: quizId,
              score: result.percentage,
              completed_at: new Date().toISOString()
            });
            
          // Update user's course progress
          const { data: progressData } = await supabase
            .from('course_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .maybeSingle();
          
          if (progressData) {
            // Update existing progress
            const completedQuizzes = Array.isArray(progressData.completed_quizzes)
              ? [...progressData.completed_quizzes]
              : [];
            
            if (!completedQuizzes.includes(quizId)) {
              completedQuizzes.push(quizId);
            }
            
            await supabase
              .from('course_progress')
              .update({
                completed_quizzes: completedQuizzes,
                last_accessed: new Date().toISOString(),
                overall_progress: Math.min(
                  100, 
                  progressData.overall_progress + (result.percentage >= 70 ? 10 : 0)
                )
              })
              .eq('user_id', user.id)
              .eq('course_id', courseId);
          } else {
            // Create new progress record
            await supabase
              .from('course_progress')
              .insert({
                user_id: user.id,
                course_id: courseId,
                completed_quizzes: [quizId],
                completed_videos: [],
                overall_progress: result.percentage >= 70 ? 10 : 0,
                last_accessed: new Date().toISOString()
              });
          }
        } catch (supabaseError) {
          console.error("Error saving to Supabase:", supabaseError);
          // Fall back to mock data service
          await markQuizAsCompleted(user.id, courseId, quizId, result.percentage);
        }
        
        toast(`Quiz completed! Your score: ${result.percentage}%`);
        
        if (onComplete) {
          onComplete(result.percentage);
        }
      } catch (error) {
        console.error("Error saving quiz progress:", error);
        toast("Failed to save your quiz results. Please try again later");
      }
    }
    
    setIsLoading(false);
  };

  const renderQuestionStatus = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {questions.map((_, index) => (
          <Button
            key={index}
            variant={index === currentQuestion ? "default" : selectedAnswers[index] >= 0 ? "outline" : "ghost"}
            size="sm"
            onClick={() => navigateToQuestion(index)}
            className={`w-8 h-8 p-0 ${
              isSubmitted && selectedAnswers[index] === questions[index].correctAnswer 
                ? "border-green-500 text-green-500" 
                : isSubmitted && selectedAnswers[index] >= 0 
                  ? "border-red-500 text-red-500" 
                  : ""
            }`}
          >
            {index + 1}
          </Button>
        ))}
      </div>
    );
  };

  const renderResults = () => {
    const result = calculateScore();
    
    return (
      <div className="flex flex-col items-center py-6 space-y-4">
        <div className="text-3xl font-bold">
          {result.percentage}%
        </div>
        <p className="text-center">
          You answered {result.score} out of {result.total} questions correctly
        </p>
        <div className="flex gap-4 mt-4">
          <Button variant="outline" onClick={() => {
            setIsSubmitted(false);
            setSelectedAnswers(Array(questions.length).fill(-1));
            setCurrentQuestion(0);
          }}>
            Try Again
          </Button>
          <Button onClick={() => onComplete && onComplete(result.percentage)}>
            Continue Learning
          </Button>
        </div>
      </div>
    );
  };

  if (isLoadingQuestions) {
    return (
      <Card className="w-full p-8">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading quiz questions...</p>
        </div>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Quiz Available</CardTitle>
          <CardDescription>There are no quiz questions available for this course yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Book className="h-5 w-5 text-tech-purple" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
        {renderQuestionStatus()}
      </CardHeader>
      
      <CardContent>
        {isSubmitted && currentQuestion === questions.length - 1 ? (
          renderResults()
        ) : (
          <div>
            <h3 className="text-lg font-medium mb-4">
              Question {currentQuestion + 1}: {currentQ.text}
            </h3>
            
            <RadioGroup 
              value={selectedAnswers[currentQuestion]?.toString()} 
              onValueChange={(value) => handleAnswer(parseInt(value))}
            >
              {currentQ.options.map((option, index) => (
                <div 
                  key={index} 
                  className={`flex items-center space-x-2 p-3 rounded-md border ${
                    isSubmitted && index === currentQ.correctAnswer 
                      ? "border-green-500 bg-green-50" 
                      : isSubmitted && index === selectedAnswers[currentQuestion]
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                  }`}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${currentQuestion}-${index}`} />
                  <Label 
                    htmlFor={`option-${currentQuestion}-${index}`} 
                    className="flex-grow cursor-pointer"
                  >
                    {option}
                  </Label>
                  {isSubmitted && index === currentQ.correctAnswer && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {isSubmitted && index !== currentQ.correctAnswer && index === selectedAnswers[currentQuestion] && (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigateToQuestion(currentQuestion - 1)} 
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        
        <div>
          {currentQuestion === questions.length - 1 ? (
            !isSubmitted ? (
              <Button 
                onClick={handleSubmit} 
                disabled={selectedAnswers.some(ans => ans === -1) || isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Quiz"}
              </Button>
            ) : null
          ) : (
            <Button 
              onClick={() => navigateToQuestion(currentQuestion + 1)} 
              disabled={selectedAnswers[currentQuestion] === -1}
            >
              Next
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
