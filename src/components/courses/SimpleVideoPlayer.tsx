
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useToast } from '@/components/ui/use-toast';
import { Video } from '@/types';
import { Loader2, AlertTriangle, Download } from 'lucide-react';
import { processVideo } from '@/utils/supabaseStorage';

interface SimpleVideoPlayerProps {
  video: Video;
  courseId: string;
  onProcessComplete?: () => void;
}

export function SimpleVideoPlayer({ video, courseId, onProcessComplete }: SimpleVideoPlayerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoData, setVideoData] = useState<Video>(video);
  const [downloadInfo, setDownloadInfo] = useState<any | null>(null);
  const { toast } = useToast();

  // Load video on component mount
  useEffect(() => {
    if (video.url) {
      setVideoData(video);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
    
    if (video.download_info) {
      setDownloadInfo(video.download_info);
    }
  }, [video]);
  
  const handleDownload = () => {
    if (downloadInfo && downloadInfo.downloadableUrl) {
      window.open(downloadInfo.downloadableUrl, '_blank');
      
      toast({
        title: "Download Started",
        description: "The video will open in a new tab where you can download it",
      });
    } else {
      toast({
        title: "Download Not Available",
        description: "Please generate video content first to enable downloads",
        variant: "destructive"
      });
    }
  };
  
  const handleProcessVideo = async () => {
    setIsProcessing(true);
    
    try {
      toast({
        title: "Loading video...",
        description: "Searching for the perfect video for this topic...",
      });
      
      const result = await processVideo(video.id, courseId);
      
      if (result.success) {
        toast({
          title: "Video loaded successfully",
          description: "The video has been loaded and is ready to play"
        });
        
        if (result.data) {
          const updatedVideo = {
            ...videoData,
            url: result.data.videoUrl || videoData.url,
            title: result.data.title || videoData.title,
            description: result.data.description || videoData.description,
            thumbnail: result.data.thumbnail || videoData.thumbnail,
          };
          
          setVideoData(updatedVideo);
          
          if (result.data.downloadInfo) {
            setDownloadInfo(result.data.downloadInfo);
          }
          
          // Notify parent component if needed
          if (onProcessComplete) {
            onProcessComplete();
          }
        }
      } else {
        toast({
          title: "Video loading failed",
          description: result.message || "Failed to load video. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error processing video:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading the video",
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
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : videoData.url ? (
            <iframe
              src={videoData.url}
              className="w-full h-full object-cover"
              allowFullScreen
              title={videoData.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : videoData.thumbnail ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 relative">
              <img 
                src={videoData.thumbnail} 
                alt={videoData.title || "Video thumbnail"} 
                className="w-full h-full object-cover absolute inset-0"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="text-center p-4">
                  <Button 
                    variant="outline" 
                    className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    onClick={handleProcessVideo}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Load Video
                  </Button>
                </div>
              </div>
            </div>
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
          
          {/* Video action buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {!videoData.url && !isProcessing ? (
              <Button 
                onClick={handleProcessVideo} 
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading video...
                  </>
                ) : (
                  'Load Video'
                )}
              </Button>
            ) : null}
            
            {downloadInfo && downloadInfo.downloadableUrl && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Video
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
