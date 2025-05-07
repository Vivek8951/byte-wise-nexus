
import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  PauseIcon, 
  ChevronDown, 
  ChevronUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Video } from '@/types';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";

interface VideoAnalysisProps {
  video: Video;
}

interface VideoPart {
  id: string;
  title: string;
  startTime: string;
  description: string;
}

export function VideoAnalysis({ video }: VideoAnalysisProps) {
  const [videoParts, setVideoParts] = useState<VideoPart[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { toast } = useToast();
  
  // Function to analyze video content using AI
  const analyzeVideo = async () => {
    setIsAnalyzing(true);
    
    try {
      // Get video duration if available
      let duration = 0;
      if (videoRef.current) {
        duration = videoRef.current.duration;
      }
      
      // Simulate AI analysis with a delay (in a real app this would use an AI service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate video parts based on the video title, description and duration
      const videoTitle = video.title || 'Video';
      const videoDesc = video.description || 'Educational content';
      
      // Create timestamps based on video duration
      const totalDuration = duration > 0 ? duration : 45 * 60; // Default to 45 min if duration unknown
      const partDuration = totalDuration / 5;
      
      const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };
      
      const parts: VideoPart[] = [
        {
          id: `${video.id}_part1`,
          title: `Introduction to ${videoTitle}`,
          startTime: '00:00',
          description: `Overview of the concepts covered in this video about ${videoTitle.toLowerCase()}.`,
        },
        {
          id: `${video.id}_part2`,
          title: `Core Concepts`,
          startTime: formatTime(partDuration),
          description: 'Detailed explanation of the main concepts and their applications.',
        },
        {
          id: `${video.id}_part3`,
          title: 'Example Walkthrough',
          startTime: formatTime(partDuration * 2),
          description: 'Step by step demonstration with practical examples.',
        },
        {
          id: `${video.id}_part4`,
          title: 'Common Challenges',
          startTime: formatTime(partDuration * 3),
          description: 'Discussion of common challenges and how to overcome them.',
        },
        {
          id: `${video.id}_part5`,
          title: 'Summary and Next Steps',
          startTime: formatTime(partDuration * 4),
          description: 'Recap of key points and preview of advanced topics.',
        },
      ];
      
      setVideoParts(parts);
      setIsExpanded(true);
      
      toast({
        title: "Video Analysis Complete",
        description: "Your video has been analyzed and broken down into sections.",
      });
    } catch (error) {
      console.error("Error analyzing video:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing the video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Jump to specific part of the video when clicked
  const jumpToSection = (startTime: string) => {
    if (videoRef.current) {
      const [minutes, seconds] = startTime.split(':').map(Number);
      const timeInSeconds = minutes * 60 + seconds;
      videoRef.current.currentTime = timeInSeconds;
      videoRef.current.play().catch(err => console.error("Error playing video:", err));
    }
  };
  
  // Load video element for actual video analysis
  useEffect(() => {
    if (video.url && !videoRef.current) {
      const videoElement = document.createElement('video');
      videoElement.src = video.url;
      videoElement.preload = 'metadata';
      videoRef.current = videoElement;
    }
    
    // Check if we already have analysis stored for this video
    const storedAnalysis = localStorage.getItem(`video_analysis_${video.id}`);
    if (storedAnalysis) {
      setVideoParts(JSON.parse(storedAnalysis));
    }
    
    return () => {
      // Clean up video element
      if (videoRef.current) {
        videoRef.current = null;
      }
    };
  }, [video.id, video.url]);
  
  // Save analysis to localStorage when it changes
  useEffect(() => {
    if (videoParts.length > 0) {
      localStorage.setItem(`video_analysis_${video.id}`, JSON.stringify(videoParts));
    }
  }, [videoParts, video.id]);
  
  return (
    <div className="mt-6 border rounded-md p-4 bg-card animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Video Content Breakdown</h3>
        {videoParts.length === 0 ? (
          <Button 
            onClick={analyzeVideo} 
            disabled={isAnalyzing}
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Analyze Video
              </>
            )}
          </Button>
        ) : (
          <Button 
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" /> Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" /> Expand
              </>
            )}
          </Button>
        )}
      </div>
      
      {videoParts.length > 0 && (
        <Accordion 
          type="single" 
          collapsible 
          className="w-full"
          defaultValue={isExpanded ? videoParts[0].id : undefined}
        >
          {videoParts.map((part) => (
            <AccordionItem key={part.id} value={part.id}>
              <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                <div className="flex items-center gap-3">
                  <span className="text-tech-blue font-mono">{part.startTime}</span>
                  <span className="font-medium">{part.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <p className="text-muted-foreground">{part.description}</p>
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => jumpToSection(part.startTime)}
                  >
                    <Play className="h-3 w-3" /> Jump to section
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      
      {videoParts.length === 0 && !isAnalyzing && (
        <p className="text-sm text-muted-foreground">
          Analyze this video to break it down into navigable sections and key points.
        </p>
      )}
      
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-tech-blue mb-4" />
          <p className="text-sm text-muted-foreground text-center">
            Analyzing video content... <br/>
            <span className="text-xs">This may take a few moments</span>
          </p>
        </div>
      )}
    </div>
  );
}
