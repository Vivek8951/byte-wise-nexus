
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, courseId, youtubeUrl } = await req.json();
    let effectiveVideoId = videoId;
    
    // If we received a full YouTube URL instead of just the ID
    if (youtubeUrl && !effectiveVideoId) {
      // Extract video ID from URL (supports multiple YouTube URL formats)
      const urlMatch = youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
      effectiveVideoId = urlMatch ? urlMatch[1] : null;
      
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
    
    if (!effectiveVideoId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Video ID is required" 
        }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Processing YouTube video ${effectiveVideoId} for course ${courseId}`);
    
    // Get video details directly from the YouTube API if possible
    if (youtubeApiKey) {
      try {
        const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${effectiveVideoId}&key=${youtubeApiKey}`;
        const detailsResponse = await fetch(videoDetailsUrl);
        
        if (!detailsResponse.ok) {
          throw new Error(`YouTube API error: ${detailsResponse.status}`);
        }
        
        const videoDetails = await detailsResponse.json();
        
        if (!videoDetails.items || videoDetails.items.length === 0) {
          throw new Error("No video found with the provided ID");
        }
        
        const snippet = videoDetails.items[0].snippet;
        const contentDetails = videoDetails.items[0].contentDetails;
        
        // Get the best thumbnail available
        const thumbnails = snippet.thumbnails;
        const videoThumbnail = 
          thumbnails.maxres?.url || 
          thumbnails.high?.url || 
          thumbnails.medium?.url || 
          thumbnails.default?.url ||
          `https://img.youtube.com/vi/${effectiveVideoId}/hqdefault.jpg`;
        
        // Parse duration from PT1H2M3S format to hours:minutes:seconds
        let videoDuration = "0:00";
        const duration = contentDetails.duration;
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (match) {
          const hours = match[1] ? parseInt(match[1]) : 0;
          const minutes = match[2] ? parseInt(match[2]) : 0;
          const seconds = match[3] ? parseInt(match[3]) : 0;
          
          if (hours > 0) {
            videoDuration = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          } else {
            videoDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          }
        }
        
        const embedUrl = `https://www.youtube-nocookie.com/embed/${effectiveVideoId}`;
        
        // If this is part of an actual course (not just testing), update the database
        if (courseId && courseId !== 'new' && videoId) {
          const { error: updateError } = await supabase
            .from('videos')
            .update({
              title: snippet.title,
              description: snippet.description.slice(0, 500), // Limit length
              url: embedUrl,
              thumbnail: videoThumbnail,
              duration: videoDuration,
              download_info: {
                success: true,
                videoId: effectiveVideoId,
                embedUrl,
                watchUrl: `https://www.youtube.com/watch?v=${effectiveVideoId}`,
                playerUrl: embedUrl,
                downloadableUrl: `https://www.youtube.com/watch?v=${effectiveVideoId}`,
                thumbnails: [videoThumbnail]
              }
            })
            .eq('id', videoId);
          
          if (updateError) {
            console.error("Error updating video:", updateError);
            throw updateError;
          }
        }
        
        // Return the processed information
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              title: snippet.title,
              description: snippet.description.slice(0, 500), // Limit length
              videoUrl: embedUrl,
              thumbnail: videoThumbnail,
              duration: videoDuration,
              embedUrl,
              watchUrl: `https://www.youtube.com/watch?v=${effectiveVideoId}`,
              downloadInfo: {
                success: true,
                videoId: effectiveVideoId,
                embedUrl,
                watchUrl: `https://www.youtube.com/watch?v=${effectiveVideoId}`,
                playerUrl: embedUrl,
                downloadableUrl: `https://www.youtube.com/watch?v=${effectiveVideoId}`,
                thumbnails: [videoThumbnail]
              }
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Error fetching YouTube video details:", error);
        // Continue with fallback process if the API call fails
      }
    }
    
    // Fallback: return a response with basic information
    const embedUrl = `https://www.youtube-nocookie.com/embed/${effectiveVideoId}`;
    const thumbnailUrl = `https://img.youtube.com/vi/${effectiveVideoId}/hqdefault.jpg`;
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          videoUrl: embedUrl,
          thumbnail: thumbnailUrl,
          embedUrl,
          watchUrl: `https://www.youtube.com/watch?v=${effectiveVideoId}`,
          downloadInfo: {
            success: true,
            videoId: effectiveVideoId,
            embedUrl,
            watchUrl: `https://www.youtube.com/watch?v=${effectiveVideoId}`,
            playerUrl: embedUrl,
            downloadableUrl: `https://www.youtube.com/watch?v=${effectiveVideoId}`,
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
