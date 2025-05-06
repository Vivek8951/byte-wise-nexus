
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { markQuizAsCompleted } from "@/data/mockProgressData";
import { toast } from "@/components/ui/sonner";
import { Book, Check, X } from "lucide-react";

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
  questions,
  onComplete
}: CourseQuizProps) {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        await markQuizAsCompleted(user.id, courseId, quizId, result.percentage);
        toast(`Quiz completed! Your score: ${result.percentage}%`);
        
        if (onComplete) {
          onComplete(result.percentage);
        }
      } catch (error) {
        console.error("Error saving quiz progress:", error);
        toast("Failed to save your quiz results", {
          description: "Please try again later"
        });
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
