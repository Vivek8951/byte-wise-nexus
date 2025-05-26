
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') || '';
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to search YouTube for relevant videos
async function searchYouTubeVideos(query: string, maxResults: number = 3) {
  if (!YOUTUBE_API_KEY) {
    console.log('YouTube API key not found, skipping video search');
    return [];
  }
  
  try {
    const searchQuery = encodeURIComponent(`${query} tutorial programming course`);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}&videoEmbeddable=true&videoCategoryId=27`
    );
    
    if (!response.ok) {
      console.error('YouTube API error:', response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    
    return data.items?.map((item: any) => ({
      title: item.snippet.title,
      description: item.snippet.description,
      videoId: item.id.videoId,
      youtubeUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      duration: '10:00' // Default duration, could be fetched with additional API call
    })) || [];
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key not found");
    }
    
    const { title } = await req.json();
    
    if (!title) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Generating course details for: "${title}"`);
    
    const prompt = `Generate a detailed description for a technical course titled "${title}". Also provide:
1. A category for the course (e.g., Web Development, Data Science, Programming, Cybersecurity, etc.)
2. A suggested duration for the course (e.g., "8 weeks")
3. A difficulty level (MUST be exactly one of: beginner, intermediate, advanced)
4. A fictional instructor name who would be qualified to teach this course
5. 3 video lesson titles that would be included in this course

Format the response as JSON with these keys:
description (string), category (string), duration (string), level (string), instructor (string), and videos (array of objects with title and description).`;

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-app.com",
        "X-Title": "Tech Learn Platform"
      },
      body: JSON.stringify({
        model: "microsoft/wizardlm-2-8x22b",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates course details in JSON format. Always ensure the level field is exactly 'beginner', 'intermediate', or 'advanced'."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      console.error("Error response from OpenRouter API:", await response.text());
      throw new Error(`Failed to get response from OpenRouter API: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // Extract the text response
    const generatedText = responseData.choices?.[0]?.message?.content;
    
    if (!generatedText) {
      throw new Error("Invalid response from OpenRouter API");
    }
    
    // Try to extract JSON from the response
    try {
      // Look for JSON pattern in the text
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      let courseDetails;
      
      if (jsonMatch) {
        courseDetails = JSON.parse(jsonMatch[0]);
        
        // Ensure level is valid
        if (!['beginner', 'intermediate', 'advanced'].includes(courseDetails.level)) {
          courseDetails.level = 'intermediate';
        }
        
        // Search for YouTube videos related to the course
        console.log('Searching for YouTube videos...');
        const youtubeVideos = await searchYouTubeVideos(title);
        
        // Enhance video data with YouTube results
        if (youtubeVideos.length > 0 && courseDetails.videos) {
          courseDetails.videos = courseDetails.videos.map((video: any, index: number) => {
            const youtubeVideo = youtubeVideos[index];
            if (youtubeVideo) {
              return {
                ...video,
                youtubeUrl: youtubeVideo.embedUrl, // Use embed URL
                thumbnail: youtubeVideo.thumbnail,
                duration: youtubeVideo.duration
              };
            }
            return video;
          });
        } else if (youtubeVideos.length > 0) {
          // If no videos in courseDetails, use YouTube results
          courseDetails.videos = youtubeVideos.map((video) => ({
            title: video.title,
            description: video.description,
            youtubeUrl: video.embedUrl,
            thumbnail: video.thumbnail,
            duration: video.duration
          }));
        }
        
      } else {
        // Fallback: Parse the response as plain text
        const lines = generatedText.split('\n').filter(line => line.trim());
        
        const description = lines.find(line => 
          !line.toLowerCase().startsWith('category') && 
          !line.toLowerCase().startsWith('duration') && 
          !line.toLowerCase().startsWith('level') && 
          !line.toLowerCase().startsWith('instructor') && 
          !line.toLowerCase().startsWith('video')
        ) || `Comprehensive course on ${title}`;
        
        const categoryLine = lines.find(line => line.toLowerCase().includes('category')) || '';
        const category = categoryLine.split(':')[1]?.trim() || 'Programming';
        
        const durationLine = lines.find(line => line.toLowerCase().includes('duration')) || '';
        const duration = durationLine.split(':')[1]?.trim() || '8 weeks';
        
        const levelLine = lines.find(line => line.toLowerCase().includes('level')) || '';
        const level = levelLine.split(':')[1]?.trim() || 'beginner';
        
        const instructorLine = lines.find(line => line.toLowerCase().includes('instructor')) || '';
        const instructor = instructorLine.split(':')[1]?.trim() || 'John Smith';
        
        // Search for YouTube videos for fallback
        const youtubeVideos = await searchYouTubeVideos(title);
        
        let videos;
        if (youtubeVideos.length > 0) {
          videos = youtubeVideos.map((video) => ({
            title: video.title,
            description: video.description,
            youtubeUrl: video.embedUrl,
            thumbnail: video.thumbnail,
            duration: video.duration
          }));
        } else {
          videos = [
            { title: `Introduction to ${title}`, description: `Getting started with ${title}` },
            { title: `${title} Advanced Techniques`, description: `Advanced concepts in ${title}` },
            { title: `${title} Projects`, description: `Practical projects using ${title}` }
          ];
        }
        
        courseDetails = {
          description,
          category,
          duration,
          level: level.toLowerCase().includes('begin') ? 'beginner' : 
                 level.toLowerCase().includes('adv') ? 'advanced' : 'intermediate',
          instructor,
          videos
        };
      }
      
      console.log('Generated course details:', courseDetails);
      
      return new Response(
        JSON.stringify({ success: true, courseDetails }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("Error parsing AI response:", error);
      console.log("Raw response:", generatedText);
      
      // Return a fallback response with YouTube search
      const youtubeVideos = await searchYouTubeVideos(title);
      
      let videos;
      if (youtubeVideos.length > 0) {
        videos = youtubeVideos.map((video) => ({
          title: video.title,
          description: video.description,
          youtubeUrl: video.embedUrl,
          thumbnail: video.thumbnail,
          duration: video.duration
        }));
      } else {
        videos = [
          { title: `Introduction to ${title}`, description: `Getting started with ${title}` },
          { title: `${title} Advanced Techniques`, description: `Advanced concepts in ${title}` },
          { title: `${title} Projects`, description: `Practical projects using ${title}` }
        ];
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          courseDetails: {
            description: `Learn everything about ${title} with this comprehensive course.`,
            category: "Programming",
            duration: "8 weeks",
            level: "intermediate",
            instructor: "John Smith",
            videos
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error in generate-course-details function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
