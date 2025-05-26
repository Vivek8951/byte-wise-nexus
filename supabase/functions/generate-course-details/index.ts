
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const OPENROUTER_API_KEY = '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';
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
      duration: '10:00'
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
    
    const prompt = `Generate detailed course information for a technical course titled "${title}". Provide a comprehensive response in valid JSON format with these exact fields:

{
  "description": "A detailed 2-3 sentence course description that explains what students will learn and the practical skills they'll gain",
  "category": "The most appropriate category (e.g., Web Development, Data Science, Programming, Machine Learning, etc.)",
  "duration": "Duration in weeks format (e.g., '8 weeks')",
  "level": "One of: beginner, intermediate, or advanced",
  "instructor": "A realistic instructor name with proper credentials",
  "videos": [
    {
      "title": "Video lesson title",
      "description": "Brief description of video content"
    }
  ]
}

Make sure the response is valid JSON and the description is professional and informative.`;

    // Call OpenRouter API with improved parameters
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-app.com",
        "X-Title": "Tech Learn Platform"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional course content creator. Generate high-quality educational course details in valid JSON format. Always ensure responses are coherent and professional."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
        top_p: 0.9
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
    
    console.log("Generated response:", generatedText);
    
    // Try to extract JSON from the response
    try {
      // Clean the response to extract JSON
      let jsonString = generatedText.trim();
      
      // Find JSON block if wrapped in markdown
      const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/) || jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[1] || jsonMatch[0];
      }
      
      const courseDetails = JSON.parse(jsonString);
      
      // Validate required fields
      if (!courseDetails.description || !courseDetails.category || !courseDetails.instructor) {
        throw new Error("Missing required fields in AI response");
      }
      
      // Ensure level is valid
      if (!['beginner', 'intermediate', 'advanced'].includes(courseDetails.level)) {
        courseDetails.level = 'intermediate';
      }
      
      // Search for YouTube videos related to the course
      console.log('Searching for YouTube videos...');
      const youtubeVideos = await searchYouTubeVideos(title);
      
      // Enhance video data with YouTube results
      if (youtubeVideos.length > 0) {
        courseDetails.videos = youtubeVideos.slice(0, 3).map((video, index) => ({
          title: video.title,
          description: video.description.substring(0, 200) + '...',
          youtubeUrl: video.embedUrl,
          thumbnail: video.thumbnail,
          duration: video.duration
        }));
      } else if (!courseDetails.videos || courseDetails.videos.length === 0) {
        // Fallback videos if no YouTube results
        courseDetails.videos = [
          { 
            title: `Introduction to ${title}`, 
            description: `Getting started with the fundamentals of ${title}`,
            youtubeUrl: "",
            thumbnail: "",
            duration: "15:00"
          },
          { 
            title: `${title} Advanced Concepts`, 
            description: `Deep dive into advanced topics and practical applications`,
            youtubeUrl: "",
            thumbnail: "",
            duration: "22:00"
          },
          { 
            title: `${title} Hands-on Project`, 
            description: `Build a real-world project using ${title} techniques`,
            youtubeUrl: "",
            thumbnail: "",
            duration: "30:00"
          }
        ];
      }
      
      console.log('Generated course details:', courseDetails);
      
      return new Response(
        JSON.stringify({ success: true, courseDetails }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Raw response:", generatedText);
      
      // Return a fallback response with YouTube search
      const youtubeVideos = await searchYouTubeVideos(title);
      
      let videos;
      if (youtubeVideos.length > 0) {
        videos = youtubeVideos.slice(0, 3).map((video) => ({
          title: video.title,
          description: video.description.substring(0, 200) + '...',
          youtubeUrl: video.embedUrl,
          thumbnail: video.thumbnail,
          duration: video.duration
        }));
      } else {
        videos = [
          { title: `Introduction to ${title}`, description: `Comprehensive introduction to ${title} concepts and applications` },
          { title: `${title} Best Practices`, description: `Industry standard practices and methodologies for ${title}` },
          { title: `${title} Real-world Projects`, description: `Hands-on projects to apply ${title} skills in practical scenarios` }
        ];
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          courseDetails: {
            description: `Master ${title} with this comprehensive course covering fundamental concepts, practical applications, and real-world projects. Learn industry-standard practices and gain hands-on experience through guided exercises and expert instruction.`,
            category: title.includes('Machine') ? 'Machine Learning' : title.includes('Web') ? 'Web Development' : title.includes('Data') ? 'Data Science' : 'Programming',
            duration: "10 weeks",
            level: "intermediate",
            instructor: "Dr. Sarah Johnson",
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
