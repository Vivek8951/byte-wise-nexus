
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://weiagpwgfmyjdglfpbeu.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// YouTube API key from environment
const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY') || '';

// Function to extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  if (!url) return null;
  
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, courseId, youtubeUrl } = await req.json();
    
    console.log('Processing video request:', { videoId, courseId, youtubeUrl });
    
    // Extract video ID from URL or use provided ID
    let effectiveVideoId = videoId;
    
    if (youtubeUrl && !effectiveVideoId) {
      effectiveVideoId = extractVideoId(youtubeUrl);
      
      if (!effectiveVideoId) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "Invalid YouTube URL. Could not extract video ID." 
          }), 
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // If we have a YouTube URL but no extracted ID, try to extract from the URL in the database
    if (!effectiveVideoId && videoId) {
      // Get the current video data to extract ID from existing URL
      const { data: videoData } = await supabase
        .from('videos')
        .select('url')
        .eq('id', videoId)
        .single();
        
      if (videoData?.url) {
        effectiveVideoId = extractVideoId(videoData.url);
      }
    }
    
    if (!effectiveVideoId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Video ID is required or could not be extracted from URL" 
        }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Processing YouTube video ${effectiveVideoId} for course ${courseId}`);
    
    // Create embed URL
    const embedUrl = `https://www.youtube-nocookie.com/embed/${effectiveVideoId}`;
    const watchUrl = `https://www.youtube.com/watch?v=${effectiveVideoId}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${effectiveVideoId}/hqdefault.jpg`;
    
    let videoDetails = {
      title: "YouTube Video",
      description: "A YouTube video",
      duration: "0:00"
    };
    
    // Try to get video details from YouTube API if available
    if (youtubeApiKey) {
      try {
        const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${effectiveVideoId}&key=${youtubeApiKey}`;
        const detailsResponse = await fetch(videoDetailsUrl);
        
        if (detailsResponse.ok) {
          const videoApiData = await detailsResponse.json();
          
          if (videoApiData.items && videoApiData.items.length > 0) {
            const snippet = videoApiData.items[0].snippet;
            const contentDetails = videoApiData.items[0].contentDetails;
            
            videoDetails.title = snippet.title;
            videoDetails.description = snippet.description?.slice(0, 500) || "";
            
            // Parse duration from PT1H2M3S format
            const duration = contentDetails.duration;
            const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (match) {
              const hours = match[1] ? parseInt(match[1]) : 0;
              const minutes = match[2] ? parseInt(match[2]) : 0;
              const seconds = match[3] ? parseInt(match[3]) : 0;
              
              if (hours > 0) {
                videoDetails.duration = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
              } else {
                videoDetails.duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
              }
            }
          }
        }
      } catch (error) {
        console.log("YouTube API request failed, using fallback data:", error);
      }
    }
    
    // Update the video in the database with embed URL
    if (videoId && courseId && courseId !== 'new') {
      const { error: updateError } = await supabase
        .from('videos')
        .update({
          url: embedUrl, // Store embed URL for direct playback
          title: videoDetails.title,
          description: videoDetails.description,
          thumbnail: thumbnailUrl,
          duration: videoDetails.duration,
          download_info: {
            success: true,
            videoId: effectiveVideoId,
            embedUrl,
            watchUrl,
            playerUrl: embedUrl,
            downloadableUrl: watchUrl,
            thumbnails: [thumbnailUrl]
          }
        })
        .eq('id', videoId);
      
      if (updateError) {
        console.error("Error updating video:", updateError);
        throw updateError;
      }
      
      console.log("Video updated successfully with embed URL");
    }
    
    // Return the processed information
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          title: videoDetails.title,
          description: videoDetails.description,
          videoUrl: embedUrl, // Return embed URL for immediate use
          thumbnail: thumbnailUrl,
          duration: videoDetails.duration,
          embedUrl,
          watchUrl,
          downloadInfo: {
            success: true,
            videoId: effectiveVideoId,
            embedUrl,
            watchUrl,
            playerUrl: embedUrl,
            downloadableUrl: watchUrl,
            thumbnails: [thumbnailUrl]
          }
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing video:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Error processing video: ${error.message}` 
      }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
