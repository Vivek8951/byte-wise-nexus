
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useToast } from '@/components/ui/use-toast';
import { Video } from '@/types';
import { Loader2, AlertTriangle, Play } from 'lucide-react';
import { VideoAnalysis } from './VideoAnalysis';
import { processVideo } from '@/utils/supabaseStorage';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface VideoPlayerWithAnalysisProps {
  video: Video;
  courseId: string;
  onAnalysisComplete?: () => void;
}

export function VideoPlayerWithAnalysis({ video, courseId, onAnalysisComplete }: VideoPlayerWithAnalysisProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoData, setVideoData] = useState<Video>(video);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const { toast } = useToast();

  // Helper function to safely convert Json to any[]
  const safeJsonToArray = (json: Json | null): any[] => {
    if (!json) return [];
    if (Array.isArray(json)) return json as any[];
    return [];
  };

  // Check if video has analysis data
  useEffect(() => {
    const checkAnalysis = async () => {
      // First check if the video passed as prop has analyzedContent
      if (video.analyzedContent) {
        setHasAnalysis(true);
        return;
      }
      
      // If not, try to fetch the latest data from Supabase
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('analyzed_content, url, title, description')
          .eq('id', video.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data && data.analyzed_content) {
          setVideoData({
            ...video,
            analyzedContent: safeJsonToArray(data.analyzed_content),
            url: data.url || video.url,
            title: data.title || video.title,
            description: data.description || video.description
          });
          setHasAnalysis(true);
        } else if (data && data.url) {
          // If we have a URL but no analysis yet
          setVideoData({
            ...video,
            url: data.url,
            title: data.title || video.title,
            description: data.description || video.description
          });
          setHasAnalysis(false);
        } else {
          setHasAnalysis(false);
        }
      } catch (error) {
        console.error("Error checking video analysis:", error);
        setHasAnalysis(false);
      }
    };
    
    checkAnalysis();
  }, [video]);
  
  const handleGenerateAnalysis = async () => {
    setIsProcessing(true);
    
    try {
      toast({
        title: "Processing video",
        description: "This may take a minute...",
      });
      
      const result = await processVideo(video.id, courseId);
      
      if (result.success) {
        toast({
          title: "Video processed successfully",
          description: "The video has been analyzed and content has been generated"
        });
        
        // Update the video data with the new analysis and URL
        if (result.data) {
          const updatedVideo = {
            ...video,
            analyzedContent: safeJsonToArray(result.data.analyzedContent),
            url: result.data.videoUrl || video.url,
            title: result.data.title || video.title,
            description: result.data.description || video.description
          };
          
          setVideoData(updatedVideo);
          setHasAnalysis(true);
          
          // Notify parent component if needed
          if (onAnalysisComplete) {
            onAnalysisComplete();
          }
        }
      } else {
        toast({
          title: "Processing failed",
          description: result.message || "Failed to process video. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error processing video:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while processing the video",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <AspectRatio ratio={16/9}>
          {videoData.url ? (
            <iframe
              src={videoData.url}
              className="w-full h-full object-cover"
              allowFullScreen
              title={videoData.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center p-4">
                <AlertTriangle className="mx-auto h-10 w-10 text-yellow-400 mb-2" />
                <p>Video not available. Click generate to fetch a relevant video.</p>
              </div>
            </div>
          )}
        </AspectRatio>
        
        <div className="p-4 space-y-2">
          <h3 className="text-lg font-medium">{videoData.title}</h3>
          <p className="text-muted-foreground text-sm">{videoData.description}</p>
        </div>
      </Card>
      
      {!hasAnalysis && (
        <div className="flex justify-center p-4">
          <Button 
            onClick={handleGenerateAnalysis} 
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Video...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Generate Video Analysis
              </>
            )}
          </Button>
        </div>
      )}
      
      <VideoAnalysis video={videoData} />
    </div>
  );
}

// Helper function to handle video events
function handleVideoEvents(videoElement: HTMLVideoElement) {
  videoElement.onplay = () => {}; // Handle play event
  videoElement.onpause = () => {}; // Handle pause event
  videoElement.onended = () => {}; // Handle ended event
}
