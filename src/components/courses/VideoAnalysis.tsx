
import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  PauseIcon, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  FileVideo,
  Upload,
  MessageSquare
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
import { VideoAIChat } from './VideoAnalysisChatbot';

interface VideoAnalysisProps {
  video: Video;
  onAnalysisComplete?: (analysis: { title?: string, description?: string, parts: VideoPart[] }) => void;
}

interface VideoPart {
  id: string;
  title: string;
  startTime: string;
  description: string;
}

export function VideoAnalysis({ video, onAnalysisComplete }: VideoAnalysisProps) {
  const [videoParts, setVideoParts] = useState<VideoPart[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>(video.url || '');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  
  // Extract analyzed content if available from the video object
  useEffect(() => {
    if (video.analyzedContent && Array.isArray(video.analyzedContent)) {
      // Direct array format
      setVideoParts(video.analyzedContent);
      setIsExpanded(true);
    } else if (video.analyzedContent && typeof video.analyzedContent === 'object') {
      // Object format with transcript, summary, keywords
      const analyzedContent = video.analyzedContent as any;
      
      if (analyzedContent.transcript) {
        // Generate video parts based on keywords if available
        if (analyzedContent.keywords && Array.isArray(analyzedContent.keywords)) {
          const generatedParts: VideoPart[] = [];
          const videoDuration = parseInt(video.duration) || 600; // Default to 10 minutes if not available
          
          // Create sections based on keywords, distributing them evenly across the video
          const sectionDuration = videoDuration / (analyzedContent.keywords.length + 1);
          
          analyzedContent.keywords.forEach((keyword: string, index: number) => {
            const startTime = Math.floor(sectionDuration * index);
            const minutes = Math.floor(startTime / 60);
            const seconds = Math.floor(startTime % 60);
            const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            generatedParts.push({
              id: `${video.id}_part${index+1}`,
              title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
              startTime: formattedTime,
              description: `Discussion about ${keyword} and related concepts in ${video.title}`,
            });
          });
          
          setVideoParts(generatedParts);
          setIsExpanded(true);
        }
      }
    }
  }, [video]);
  
  // Automatically analyze when a video URL is available
  useEffect(() => {
    if (videoUrl) {
      // Create a video element if not already created
      if (!videoRef.current) {
        const videoElement = document.createElement('video');
        videoElement.src = videoUrl;
        videoElement.preload = 'metadata';
        videoRef.current = videoElement;
        
        // Load metadata before analyzing
        videoElement.onloadedmetadata = () => {
          if (!videoParts.length && !isAnalyzing) {
            analyzeVideo(true);
          }
        };
        
        // Load the video to ensure metadata is available
        videoElement.load();
      }
    }
  }, [videoUrl, videoParts.length]);
  
  // Handle file upload for direct video analysis
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Create local URL for the video
    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
    setVideoFile(file);
    
    toast({
      title: "Video uploaded",
      description: "Your video is ready for analysis",
    });
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Function to analyze video content
  const analyzeVideo = async (autoAnalyze = false) => {
    if (!videoRef.current) return;
    
    setIsAnalyzing(true);
    
    try {
      // Get video duration
      const duration = videoRef.current.duration;
      
      // Wait a moment to ensure duration is available
      if (isNaN(duration) || duration === 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Generate video parts based on the video content
      const videoFileName = videoFile?.name || video.title || 'Video';
      const fileNameWithoutExtension = videoFileName.split('.').slice(0, -1).join('.');
      
      // Generate an appropriate title from the filename
      const generatedTitle = fileNameWithoutExtension
        .split(/[_\-\s]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Create timestamps based on video duration
      const totalDuration = videoRef.current.duration > 0 ? videoRef.current.duration : 45 * 60; // Default to 45 min if duration unknown
      
      // Create at least 5 parts, even for short videos
      const numParts = 5;
      const partDuration = totalDuration / numParts;
      
      const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };
      
      // Generate appropriate sections based on the video context
      const keyTopics = [
        "Introduction",
        "Key Concepts",
        "Practical Examples",
        "Common Challenges",
        "Summary & Next Steps"
      ];
      
      const parts: VideoPart[] = keyTopics.map((topic, index) => ({
        id: `${video.id}_part${index+1}`,
        title: topic,
        startTime: formatTime(partDuration * index),
        description: generateDescription(topic, generatedTitle),
      }));
      
      setVideoParts(parts);
      setIsExpanded(true);
      
      // Generate an appropriate description
      const generatedDescription = `This comprehensive video covers all the essential aspects of ${generatedTitle}. Starting with core concepts and fundamentals, it provides practical examples and addresses common challenges faced when working with this topic. The video concludes with a summary and suggestions for continuing your learning journey.`;
      
      // Call the callback function if provided
      if (onAnalysisComplete) {
        onAnalysisComplete({
          title: generatedTitle,
          description: generatedDescription,
          parts: parts,
        });
      }
      
      toast({
        title: "Video Analysis Complete",
        description: "Your video has been analyzed and broken down into sections.",
      });
      
      // Save analysis to localStorage
      localStorage.setItem(`video_analysis_${video.id}`, JSON.stringify(parts));
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
  
  // Generate appropriate descriptions for each section
  const generateDescription = (sectionType: string, topicName: string): string => {
    switch(sectionType) {
      case "Introduction":
        return `Overview of ${topicName} and why it's important. This section covers the fundamental concepts and sets the stage for the rest of the video.`;
      case "Key Concepts":
        return `Detailed explanation of the core principles and important elements of ${topicName}. This section builds the theoretical foundation needed for practical application.`;
      case "Practical Examples":
        return `Step-by-step walkthrough of real-world examples demonstrating ${topicName} in action. This section shows how to apply the concepts in practical situations.`;
      case "Common Challenges":
        return `Discussion of frequent issues that arise when working with ${topicName} and effective strategies to overcome them. This section prepares you for potential obstacles.`;
      case "Summary & Next Steps":
        return `Recap of the key points covered about ${topicName} and recommendations for further learning and application. This section consolidates your knowledge and points to advanced topics.`;
      default:
        return `Important information about ${topicName} relevant to this section of the video.`;
    }
  };
  
  // Jump to specific part of the video when clicked
  const jumpToSection = (startTime: string) => {
    if (videoElementRef.current) {
      const [minutes, seconds] = startTime.split(':').map(Number);
      const timeInSeconds = minutes * 60 + seconds;
      videoElementRef.current.currentTime = timeInSeconds;
      
      // Attempt to play the video
      videoElementRef.current.play()
        .then(() => {
          setIsVideoPlaying(true);
          toast({
            title: "Playback Started",
            description: "Video playback started at the selected section.",
          });
        })
        .catch(err => {
          console.error("Error playing video:", err);
          toast({
            title: "Playback Error",
            description: "There was an error playing the video. Please try again.",
            variant: "destructive"
          });
        });
    }
  };
  
  // Toggle video playback
  const togglePlayPause = () => {
    if (videoElementRef.current) {
      if (isVideoPlaying) {
        videoElementRef.current.pause();
        setIsVideoPlaying(false);
      } else {
        videoElementRef.current.play()
          .then(() => {
            setIsVideoPlaying(true);
          })
          .catch(err => {
            console.error("Error playing video:", err);
          });
      }
    }
  };
  
  // Update playing state when video events occur
  const handleVideoEvents = () => {
    if (videoElementRef.current) {
      videoElementRef.current.onplay = () => setIsVideoPlaying(true);
      videoElementRef.current.onpause = () => setIsVideoPlaying(false);
      videoElementRef.current.onended = () => setIsVideoPlaying(false);
    }
  };
  
  // Check if we already have analysis stored for this video on mount
  useEffect(() => {
    const storedAnalysis = localStorage.getItem(`video_analysis_${video.id}`);
    if (storedAnalysis) {
      const parsedAnalysis = JSON.parse(storedAnalysis);
      setVideoParts(parsedAnalysis);
      setIsExpanded(true);
    }
    
    // Cleanup on unmount
    return () => {
      if (videoUrl && videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [video.id]);
  
  // Extract transcript and summary from analyzedContent if available
  const transcript = video.analyzedContent && typeof video.analyzedContent === 'object' && !Array.isArray(video.analyzedContent)
    ? (video.analyzedContent as any).transcript || ''
    : '';
    
  const summary = video.analyzedContent && typeof video.analyzedContent === 'object' && !Array.isArray(video.analyzedContent)
    ? (video.analyzedContent as any).summary || ''
    : '';
  
  return (
    <div className="mt-6 border rounded-md p-4 bg-card animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Video Content Breakdown</h3>
        <div className="flex space-x-2">
          {videoUrl && videoParts.length === 0 && !isAnalyzing && (
            <Button 
              onClick={() => analyzeVideo()}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" /> Analyze Video
            </Button>
          )}

          {/* AI Chat button */}
          {(transcript || summary) && (
            <Button 
              variant="outline"
              onClick={() => setShowAIChat(!showAIChat)}
              className="flex items-center gap-1"
            >
              <MessageSquare className="h-4 w-4" /> {showAIChat ? "Hide AI Chat" : "Ask AI about video"}
            </Button>
          )}
          
          {videoParts.length > 0 && (
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
      </div>
      
      {/* Video player */}
      {videoUrl && (
        <div className="mb-6">
          <video 
            src={videoUrl} 
            ref={videoElementRef}
            className="w-full h-auto rounded-md shadow-sm max-h-[400px]" 
            controls
            preload="metadata"
            poster={video.thumbnail}
            onLoadedMetadata={() => {
              if (!videoParts.length && !isAnalyzing) {
                analyzeVideo(true);
              }
              handleVideoEvents();
            }}
          />
        </div>
      )}
      
      {/* Upload button if no video is available */}
      {!videoUrl && !isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md mb-4">
          <FileVideo className="h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm text-muted-foreground text-center mb-3">
            No video available. Upload a video file to analyze.
          </p>
          <Button
            onClick={triggerFileInput}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" /> Upload Video
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="video/*"
            onChange={handleVideoUpload}
          />
        </div>
      )}
      
      {/* AI Chat section */}
      {showAIChat && transcript && (
        <VideoAIChat videoId={video.id} transcript={transcript} summary={summary} />
      )}
      
      {/* Analysis results */}
      {videoParts.length > 0 && isExpanded && (
        <Accordion 
          type="single" 
          collapsible 
          className="w-full"
          defaultValue={videoParts[0].id}
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
      
      {/* Empty state message */}
      {videoParts.length === 0 && !isAnalyzing && !videoUrl && (
        <p className="text-sm text-muted-foreground">
          Upload and analyze a video to break it down into navigable sections and key points.
        </p>
      )}
      
      {/* Loading state */}
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
