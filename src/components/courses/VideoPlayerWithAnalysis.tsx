
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useToast } from '@/components/ui/use-toast';
import { Video, VideoDownloadInfo } from '@/types';
import { Loader2, AlertTriangle, Play, Download } from 'lucide-react';
import { VideoAnalysis } from './VideoAnalysis';
import { processVideo, getVideoForCourse } from '@/utils/supabaseStorage';
import { supabase } from '@/integrations/supabase/client';

interface VideoPlayerWithAnalysisProps {
  video: Video;
  courseId: string;
  onAnalysisComplete?: () => void;
}

export function VideoPlayerWithAnalysis({ video, courseId, onAnalysisComplete }: VideoPlayerWithAnalysisProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoData, setVideoData] = useState<Video>(video);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<VideoDownloadInfo | null>(null);
  const { toast } = useToast();

  // Helper function to safely convert Json to any[]
  const safeJsonToArray = (json: any | null): any[] => {
    if (!json) return [];
    if (Array.isArray(json)) return json as any[];
    return [];
  };

  // Helper function to safely convert Json to VideoDownloadInfo
  const safeJsonToDownloadInfo = (json: any | null): VideoDownloadInfo | null => {
    if (!json) return null;
    
    // Check if json has the required properties to be a valid VideoDownloadInfo
    if (typeof json === 'object' && 
        'success' in json && 
        'videoId' in json && 
        'embedUrl' in json && 
        'watchUrl' in json && 
        'playerUrl' in json && 
        'downloadableUrl' in json && 
        'thumbnails' in json) {
      return json as VideoDownloadInfo;
    }
    
    return null;
  };

  // Load video immediately on component mount
  useEffect(() => {
    const loadVideo = async () => {
      setIsLoading(true);
      
      try {
        // Always try to get the latest video data from Supabase
        const { data, error } = await supabase
          .from('videos')
          .select('url, title, description, analyzed_content, thumbnail, download_info')
          .eq('id', video.id)
          .maybeSingle();
        
        if (error) throw error;
        
        // If we have data from Supabase, use it
        if (data) {
          const updateData: Partial<Video> = {
            ...video,
            title: data.title || video.title,
            description: data.description || video.description,
            thumbnail: data.thumbnail || video.thumbnail,
          };
          
          // If we have analyzed content, use it
          if (data.analyzed_content) {
            updateData.analyzedContent = safeJsonToArray(data.analyzed_content);
            setHasAnalysis(true);
          }
          
          // If we have download info, use it
          if (data.download_info) {
            const parsedDownloadInfo = safeJsonToDownloadInfo(data.download_info);
            if (parsedDownloadInfo) {
              updateData.download_info = parsedDownloadInfo;
              setDownloadInfo(parsedDownloadInfo);
            }
          }
          
          // If we have a URL, use it
          if (data.url) {
            updateData.url = data.url;
          }
          
          setVideoData(prevData => ({...prevData, ...updateData}));
          
          // If no URL yet, try to get one immediately
          if (!data.url) {
            const result = await getVideoForCourse(video.id, courseId);
            
            if (result.success && result.videoUrl) {
              setVideoData(prevData => ({
                ...prevData,
                url: result.videoUrl,
                title: result.title || prevData.title,
                description: result.description || prevData.description,
                ...(result.thumbnail && { thumbnail: result.thumbnail })
              }));
              
              if (result.downloadInfo) {
                const parsedDownloadInfo = safeJsonToDownloadInfo(result.downloadInfo);
                if (parsedDownloadInfo) {
                  setDownloadInfo(parsedDownloadInfo);
                }
              }
            }
          }
        } else {
          // If no data at all, try to get a video URL immediately
          const result = await getVideoForCourse(video.id, courseId);
          
          if (result.success && result.videoUrl) {
            setVideoData(prevData => ({
              ...prevData,
              url: result.videoUrl,
              title: result.title || prevData.title,
              description: result.description || prevData.description,
              ...(result.thumbnail && { thumbnail: result.thumbnail })
            }));
            
            if (result.downloadInfo) {
              const parsedDownloadInfo = safeJsonToDownloadInfo(result.downloadInfo);
              if (parsedDownloadInfo) {
                setDownloadInfo(parsedDownloadInfo);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading video:", error);
        toast({
          title: "Error",
          description: "Failed to load video. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVideo();
  }, [video.id, courseId, video]);

  // Check if video has analysis data
  useEffect(() => {
    const checkAnalysis = async () => {
      // First check if the video passed as prop has analyzedContent
      if (video.analyzedContent && video.analyzedContent.length > 0) {
        setHasAnalysis(true);
        return;
      }
      
      // If not, try to fetch the latest data from Supabase
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('analyzed_content, download_info, thumbnail')
          .eq('id', video.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          const updates: Partial<Video> = {};
          
          if (data.analyzed_content) {
            const analyzedContent = safeJsonToArray(data.analyzed_content);
            updates.analyzedContent = analyzedContent;
            
            if (analyzedContent.length > 0) {
              setHasAnalysis(true);
            }
          }
          
          if (data.download_info) {
            const parsedDownloadInfo = safeJsonToDownloadInfo(data.download_info);
            if (parsedDownloadInfo) {
              updates.download_info = parsedDownloadInfo;
              setDownloadInfo(parsedDownloadInfo);
            }
          }
          
          if (data.thumbnail) {
            updates.thumbnail = data.thumbnail;
          }
          
          if (Object.keys(updates).length > 0) {
            setVideoData(prevData => ({
              ...prevData,
              ...updates
            }));
          }
        } else {
          setHasAnalysis(false);
        }
      } catch (error) {
        console.error("Error checking video analysis:", error);
        setHasAnalysis(false);
      }
    };
    
    checkAnalysis();
  }, [video.id, video.analyzedContent]);
  
  const handleDownload = () => {
    if (downloadInfo && downloadInfo.downloadableUrl) {
      // Open in new tab for the user to download
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
  
  const handleGenerateAnalysis = async () => {
    setIsProcessing(true);
    
    try {
      toast({
        title: "Generating content...",
        description: "This may take a minute as we search for relevant content...",
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
            ...videoData,
            analyzedContent: result.data.analyzedContent || [],
            url: result.data.videoUrl || videoData.url,
            title: result.data.title || videoData.title,
            description: result.data.description || videoData.description,
            thumbnail: result.data.thumbnail || videoData.thumbnail,
          };
          
          setVideoData(updatedVideo);
          setHasAnalysis(!!result.data.analyzedContent);
          
          if (result.data.downloadInfo) {
            const parsedDownloadInfo = safeJsonToDownloadInfo(result.data.downloadInfo);
            if (parsedDownloadInfo) {
              setDownloadInfo(parsedDownloadInfo);
            }
          }
          
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
                  <Play className="mx-auto h-16 w-16 text-white opacity-80" />
                  <p className="mt-2 text-white text-lg font-medium">Click generate to fetch video</p>
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
      
      <div className="flex justify-center p-4">
        <Button 
          onClick={handleGenerateAnalysis} 
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating content...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {hasAnalysis ? "Regenerate Video Content" : "Generate Video Analysis"}
            </>
          )}
        </Button>
      </div>
      
      <VideoAnalysis video={videoData} />
    </div>
  );
}
