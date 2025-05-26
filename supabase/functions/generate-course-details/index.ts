
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
    console.log('YouTube API key not found, using fallback videos');
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
    
    if (!data.items || data.items.length === 0) {
      console.log('No YouTube videos found for query:', query);
      return [];
    }
    
    // Get video details including duration
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!detailsResponse.ok) {
      console.error('YouTube video details API error:', detailsResponse.status);
      return data.items.map((item: any) => ({
        title: item.snippet.title,
        description: item.snippet.description.substring(0, 200) + '...',
        videoId: item.id.videoId,
        youtubeUrl: `https://www.youtube-nocookie.com/embed/${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        duration: '10:00'
      }));
    }
    
    const detailsData = await detailsResponse.json();
    
    return detailsData.items.map((item: any) => {
      // Parse duration from PT1H2M3S format
      const duration = item.contentDetails.duration;
      let formattedDuration = '10:00';
      
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (match) {
        const hours = match[1] ? parseInt(match[1]) : 0;
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const seconds = match[3] ? parseInt(match[3]) : 0;
        
        if (hours > 0) {
          formattedDuration = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
          formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
      }
      
      return {
        title: item.snippet.title,
        description: item.snippet.description.substring(0, 200) + '...',
        videoId: item.id.videoId,
        youtubeUrl: `https://www.youtube-nocookie.com/embed/${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        duration: formattedDuration
      };
    });
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
    
    // Create a comprehensive prompt for better course generation
    const prompt = `Generate detailed course information for a technical course titled "${title}". Provide a comprehensive response in valid JSON format with these exact fields:

{
  "description": "A detailed 2-3 sentence course description that explains what students will learn and the practical skills they'll gain. Make it professional and informative.",
  "category": "The most appropriate category from: Web Development, Data Science, Programming, Machine Learning, Mobile Development, Cybersecurity, Cloud Computing, DevOps, Computer Science, Design, Artificial Intelligence, Database Management, Networking, Operating Systems, Algorithms, Software Engineering, Game Development, Blockchain, Digital Marketing, UX/UI Design",
  "duration": "Duration in weeks format (e.g., '8 weeks', '12 weeks')",
  "level": "One of: beginner, intermediate, or advanced",
  "instructor": "A realistic instructor name with proper title (e.g., 'Dr. Sarah Johnson', 'Prof. Michael Chen', 'Maya Patel')"
}

Important: Return ONLY the JSON object, no additional text or markdown formatting.`;

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
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a professional course content creator. Generate high-quality educational course details in valid JSON format. Always ensure responses are coherent, professional, and properly formatted."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.4,
        top_p: 0.9
      })
    });
    
    if (!response.ok) {
      console.error("Error response from OpenRouter API:", await response.text());
      throw new Error(`Failed to get response from OpenRouter API: ${response.status}`);
    }
    
    const responseData = await response.json();
    const generatedText = responseData.choices?.[0]?.message?.content;
    
    if (!generatedText) {
      throw new Error("Invalid response from OpenRouter API");
    }
    
    console.log("Generated response:", generatedText);
    
    // Parse the JSON response
    let courseDetails;
    try {
      // Clean the response to extract JSON
      let jsonString = generatedText.trim();
      
      // Find JSON block if wrapped in markdown
      const jsonMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/) || jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[1] || jsonMatch[0];
      }
      
      courseDetails = JSON.parse(jsonString);
      
      // Validate and fix required fields
      if (!courseDetails.description) {
        courseDetails.description = `Master ${title} with this comprehensive course covering fundamental concepts, practical applications, and real-world projects. Learn industry-standard practices and gain hands-on experience through guided exercises and expert instruction.`;
      }
      
      if (!courseDetails.category) {
        courseDetails.category = title.toLowerCase().includes('machine') ? 'Machine Learning' : 
                                 title.toLowerCase().includes('web') ? 'Web Development' : 
                                 title.toLowerCase().includes('data') ? 'Data Science' : 'Programming';
      }
      
      if (!courseDetails.duration) {
        courseDetails.duration = "10 weeks";
      }
      
      if (!['beginner', 'intermediate', 'advanced'].includes(courseDetails.level)) {
        courseDetails.level = 'intermediate';
      }
      
      if (!courseDetails.instructor) {
        const instructors = ['Dr. Sarah Johnson', 'Prof. Michael Chen', 'Maya Patel', 'James Wilson', 'Emma Clark'];
        courseDetails.instructor = instructors[Math.floor(Math.random() * instructors.length)];
      }
      
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      
      // Fallback course details
      courseDetails = {
        description: `Master ${title} with this comprehensive course covering fundamental concepts, practical applications, and real-world projects. Learn industry-standard practices and gain hands-on experience through guided exercises and expert instruction.`,
        category: title.toLowerCase().includes('machine') ? 'Machine Learning' : 
                 title.toLowerCase().includes('web') ? 'Web Development' : 
                 title.toLowerCase().includes('data') ? 'Data Science' : 'Programming',
        duration: "10 weeks",
        level: "intermediate",
        instructor: "Dr. Sarah Johnson"
      };
    }
    
    // Search for YouTube videos related to the course
    console.log('Searching for YouTube videos...');
    const youtubeVideos = await searchYouTubeVideos(title, 3);
    
    // Add YouTube videos to course details
    if (youtubeVideos.length > 0) {
      courseDetails.videos = youtubeVideos.map((video) => ({
        title: video.title,
        description: video.description,
        youtubeUrl: video.youtubeUrl,
        thumbnail: video.thumbnail,
        duration: video.duration
      }));
    } else {
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
    
  } catch (error) {
    console.error("Error in generate-course-details function:", error);
    
    // Return a fallback response
    const { title } = await req.json().catch(() => ({ title: 'Sample Course' }));
    
    return new Response(
      JSON.stringify({
        success: true,
        courseDetails: {
          description: `Master ${title} with this comprehensive course covering fundamental concepts, practical applications, and real-world projects. Learn industry-standard practices and gain hands-on experience through guided exercises and expert instruction.`,
          category: "Programming",
          duration: "10 weeks",
          level: "intermediate",
          instructor: "Dr. Sarah Johnson",
          videos: [
            { title: `Introduction to ${title}`, description: `Comprehensive introduction to ${title} concepts and applications`, youtubeUrl: "", thumbnail: "", duration: "15:00" },
            { title: `${title} Best Practices`, description: `Industry standard practices and methodologies for ${title}`, youtubeUrl: "", thumbnail: "", duration: "20:00" },
            { title: `${title} Real-world Projects`, description: `Hands-on projects to apply ${title} skills in practical scenarios`, youtubeUrl: "", thumbnail: "", duration: "25:00" }
          ]
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
