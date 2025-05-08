
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = 'https://weiagpwgfmyjdglfpbeu.supabase.co';
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
    const { videoId, courseId } = await req.json();
    
    if (!videoId || !courseId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Video ID and Course ID are required" 
        }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Processing video ${videoId} for course ${courseId}`);
    
    // Get video details
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .select('title, description, course_id')
      .eq('id', videoId)
      .maybeSingle();
    
    if (videoError || !videoData) {
      console.error("Error fetching video data:", videoError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Error fetching video data" 
        }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get course details to help with search relevance
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('title, category')
      .eq('id', courseId)
      .maybeSingle();
      
    if (courseError) {
      console.error("Error fetching course data:", courseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Error fetching course data" 
        }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Construct search query based on video title and course information
    const searchQuery = `${videoData.title} ${courseData?.title || ''} ${courseData?.category || ''} tutorial`;
    const searchResults = await searchYouTubeVideos(searchQuery);
    
    if (!searchResults.success) {
      console.error("YouTube search failed:", searchResults.message);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: searchResults.message 
        }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the first result as our video
    const video = searchResults.videos[0];
    
    if (!video) {
      console.error("No videos found for the search query");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No relevant videos found" 
        }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Prepare video data
    const videoUrl = `https://www.youtube-nocookie.com/embed/${video.id}`;
    const videoTitle = video.title || videoData.title;
    const videoDescription = video.description || videoData.description;
    const videoThumbnail = video.thumbnail || '';
    
    console.log(`Updating video ${videoId} with YouTube URL: ${videoUrl}`);
    
    // Update the video record
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        url: videoUrl,
        title: videoTitle,
        description: videoDescription,
        thumbnail: videoThumbnail,
        download_info: {
          success: true,
          videoId: video.id,
          embedUrl: videoUrl,
          watchUrl: `https://www.youtube.com/watch?v=${video.id}`,
          playerUrl: videoUrl,
          downloadableUrl: `https://www.youtube.com/watch?v=${video.id}`,
          thumbnails: [videoThumbnail]
        }
      })
      .eq('id', videoId);
    
    if (updateError) {
      console.error("Error updating video:", updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Error updating video with YouTube data" 
        }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Video ${videoId} processed successfully`);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          videoUrl,
          title: videoTitle,
          description: videoDescription,
          thumbnail: videoThumbnail,
          downloadInfo: {
            success: true,
            videoId: video.id,
            embedUrl: videoUrl,
            watchUrl: `https://www.youtube.com/watch?v=${video.id}`,
            playerUrl: videoUrl,
            downloadableUrl: `https://www.youtube.com/watch?v=${video.id}`,
            thumbnails: [videoThumbnail]
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

/**
 * Search YouTube for videos matching the query
 */
async function searchYouTubeVideos(query: string) {
  if (!youtubeApiKey) {
    return { 
      success: false, 
      message: "YouTube API key not configured", 
      videos: [] 
    };
  }
  
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodedQuery}&key=${youtubeApiKey}&type=video&videoDuration=medium`;
    
    console.log(`Searching YouTube for: ${query}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`YouTube API error: ${response.status}`, errorText);
      return { 
        success: false, 
        message: `YouTube API error: ${response.status}`, 
        videos: [] 
      };
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return { 
        success: false, 
        message: "No videos found", 
        videos: [] 
      };
    }
    
    // Map the results to a simplified format
    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url
    }));
    
    return { 
      success: true, 
      message: "Videos found", 
      videos 
    };
  } catch (error) {
    console.error("Error searching YouTube:", error);
    return { 
      success: false, 
      message: `Error searching YouTube: ${error.message}`, 
      videos: [] 
    };
  }
}
