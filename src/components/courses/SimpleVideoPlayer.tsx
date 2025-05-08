
import React, { useState, useRef, useEffect } from 'react';

interface SimpleVideoPlayerProps {
  url: string;
  title?: string;
  autoPlay?: boolean;
}

export function SimpleVideoPlayer({ url, title, autoPlay = false }: SimpleVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Reset state when URL changes
    setIsPlaying(autoPlay);
    setCurrentTime(0);
    setIsLoading(true);
    
    // If the video is ready, play it if autoPlay is true
    if (videoRef.current) {
      if (autoPlay) {
        videoRef.current.play().catch(() => {
          // Autoplay was prevented - do nothing, this is expected on many browsers
        });
      }
    }
  }, [url, autoPlay]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
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

  // Check if the URL is a YouTube embed
  const isYouTubeEmbed = url?.includes('youtube.com/embed') || url?.includes('youtube-nocookie.com/embed');

  if (isYouTubeEmbed) {
    return (
      <div className="relative w-full h-full">
        <iframe
          src={`${url}?autoplay=${autoPlay ? 1 : 0}`}
          title={title || "YouTube video player"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full aspect-video"
        ></iframe>
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
      
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        autoPlay={autoPlay}
        muted={isMuted}
        controls
      />
    </div>
  );
}
