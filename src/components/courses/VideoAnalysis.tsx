
import { useState, useEffect } from 'react';
import { 
  Play, 
  PauseIcon, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Video } from '@/types';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  
  // Function to analyze video content - in a real app this would use AI to analyze the video
  const analyzeVideo = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis with a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock video parts based on the video title and description
    const parts: VideoPart[] = [
      {
        id: `${video.id}_part1`,
        title: `Introduction to ${video.title}`,
        startTime: '00:00',
        description: `Overview of the concepts covered in this video about ${video.title.toLowerCase()}.`,
      },
      {
        id: `${video.id}_part2`,
        title: `Core Concepts`,
        startTime: '03:25',
        description: 'Detailed explanation of the main concepts and their applications.',
      },
      {
        id: `${video.id}_part3`,
        title: 'Example Walkthrough',
        startTime: '12:50',
        description: 'Step by step demonstration with practical examples.',
      },
      {
        id: `${video.id}_part4`,
        title: 'Common Challenges',
        startTime: '24:15',
        description: 'Discussion of common challenges and how to overcome them.',
      },
      {
        id: `${video.id}_part5`,
        title: 'Summary and Next Steps',
        startTime: '38:40',
        description: 'Recap of key points and preview of advanced topics.',
      },
    ];
    
    setVideoParts(parts);
    setIsAnalyzing(false);
    setIsExpanded(true);
  };
  
  useEffect(() => {
    // Check if we already have analysis stored for this video
    const storedAnalysis = localStorage.getItem(`video_analysis_${video.id}`);
    if (storedAnalysis) {
      setVideoParts(JSON.parse(storedAnalysis));
    }
  }, [video.id]);
  
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
              <>Analyzing<span className="animate-pulse">...</span></>
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
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
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
    </div>
  );
}
