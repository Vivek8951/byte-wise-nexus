
import React, { useState, useRef, useEffect } from 'react';

interface SimpleVideoPlayerProps {
  url: string;
  title?: string;
  autoPlay?: boolean;
  thumbnail?: string;
}

export function SimpleVideoPlayer({ url, title, autoPlay = false, thumbnail }: SimpleVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showThumbnail, setShowThumbnail] = useState(!!thumbnail);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Function to convert YouTube watch URLs to embed URLs
  const convertToEmbedUrl = (videoUrl: string): string => {
    if (!videoUrl) return '';
    
    // If it's already an embed URL, return as is
    if (videoUrl.includes('youtube.com/embed') || videoUrl.includes('youtube-nocookie.com/embed')) {
      return videoUrl;
    }
    
    // Extract video ID from watch URL
    const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
    
    return videoUrl;
  };

  const embedUrl = convertToEmbedUrl(url);

  useEffect(() => {
    // Reset state when URL changes
    setIsPlaying(autoPlay);
    setCurrentTime(0);
    setIsLoading(true);
    setShowThumbnail(!!thumbnail);
    
    // For YouTube embeds, we don't need to handle video events
    if (isYouTubeEmbed) {
      setIsLoading(false);
    }
    
    // If the video is ready, play it if autoPlay is true
    if (videoRef.current && !isYouTubeEmbed) {
      if (autoPlay) {
        videoRef.current.play().catch(() => {
          // Autoplay was prevented - do nothing, this is expected on many browsers
        });
      }
    }
  }, [url, autoPlay, thumbnail]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // Hide thumbnail when starting to play
        if (showThumbnail) {
          setShowThumbnail(false);
        }
        videoRef.current.play().catch(() => {
          // Play was prevented - handle if needed
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const handleThumbnailClick = () => {
    setShowThumbnail(false);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Play was prevented - handle if needed
      });
      setIsPlaying(true);
    }
  };

  // Check if the URL is a YouTube embed
  const isYouTubeEmbed = embedUrl?.includes('youtube.com/embed') || embedUrl?.includes('youtube-nocookie.com/embed');
  
  // Extract YouTube video ID for higher quality thumbnails if not provided
  const extractYouTubeVideoId = () => {
    if (!isYouTubeEmbed) return null;
    
    const match = embedUrl.match(/embed\/([\w-]+)/);
    return match ? match[1] : null;
  };
  
  const youtubeVideoId = extractYouTubeVideoId();
  
  // Get YouTube thumbnail if we have a video ID and no specific thumbnail provided
  const getYouTubeThumbnail = () => {
    if (!youtubeVideoId) return thumbnail;
    
    // If a custom thumbnail is provided, use that
    if (thumbnail) return thumbnail;
    
    // Otherwise use the YouTube high quality thumbnail
    return `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
  };
  
  const effectiveThumbnail = isYouTubeEmbed ? getYouTubeThumbnail() : thumbnail;

  // If no URL is provided, show placeholder
  if (!embedUrl) {
    return (
      <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </div>
    );
  }

  if (isYouTubeEmbed) {
    return (
      <div className="relative w-full h-full">
        {effectiveThumbnail && showThumbnail ? (
          <div 
            className="relative w-full h-full cursor-pointer" 
            onClick={handleThumbnailClick}
          >
            <img 
              src={effectiveThumbnail} 
              alt={title || "Video thumbnail"} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity">
              <div className="bg-primary rounded-full p-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            src={`${embedUrl}?autoplay=${showThumbnail ? 0 : (autoPlay ? 1 : 0)}&rel=0&modestbranding=1`}
            title={title || "YouTube video player"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full aspect-video"
          ></iframe>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      
      {effectiveThumbnail && showThumbnail ? (
        <div 
          className="relative w-full h-full cursor-pointer" 
          onClick={handleThumbnailClick}
        >
          <img 
            src={effectiveThumbnail} 
            alt={title || "Video thumbnail"} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity">
            <div className="bg-primary rounded-full p-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={embedUrl}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          autoPlay={autoPlay}
          muted={isMuted}
          controls
          poster={effectiveThumbnail}
        />
      )}
    </div>
  );
}
