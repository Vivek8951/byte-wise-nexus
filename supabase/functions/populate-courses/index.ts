
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

// YouTube API key
const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY') || '';
// OpenRouter API key
const openRouterApiKey = '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';

// Course categories for AI generation
const courseCategories = [
  "Web Development",
  "Data Science", 
  "Programming", 
  "Mobile Development",
  "Cybersecurity", 
  "Cloud Computing", 
  "DevOps", 
  "Computer Science",
  "Design",
  "Artificial Intelligence",
  "Machine Learning",
  "Database Management",
  "Networking",
  "Operating Systems",
  "Algorithms",
  "Software Engineering",
  "Game Development",
  "Blockchain",
  "Digital Marketing",
  "UX/UI Design"
];

// Course difficulty levels
const courseLevels = ["beginner", "intermediate", "advanced"];

// Instructor names for variety
const instructorNames = [
  "Dr. Sarah Johnson", 
  "Prof. David Chen", 
  "Maya Patel", 
  "James Wilson", 
  "Emma Clark",
  "Michael Brown",
  "Sophia Lee",
  "Daniel Kim",
  "Priya Sharma",
  "Ryan Martinez",
  "Angela Yu",
  "Tyler Johnson",
  "Kevin Mitnick",
  "Lisa Romano",
  "Omar Farooq",
  "Jennifer Smith",
  "Thomas Wright",
  "Aisha Khan",
  "Carlos Mendez",
  "Nina Patel"
];

// Generate a course with AI using OpenRouter
async function generateCourseWithAI(category: string) {
  // Enhanced default course data
  let course = {
    title: `Complete ${category} Course`,
    description: `Master ${category} with comprehensive hands-on training, real-world projects, and industry best practices. This course covers everything from fundamentals to advanced concepts, designed for practical application in modern development environments.`,
    category: category,
    instructor: instructorNames[Math.floor(Math.random() * instructorNames.length)],
    duration: `${Math.floor(Math.random() * 8) + 6} weeks`,
    level: courseLevels[Math.floor(Math.random() * courseLevels.length)] as "beginner" | "intermediate" | "advanced"
  };
  
  if (openRouterApiKey) {
    try {
      const prompt = `Create a comprehensive tech course about ${category}. The course should be practical and industry-relevant. Return ONLY valid JSON with these exact fields:
      {
        "title": "engaging course title",
        "description": "detailed 2-3 sentence course description highlighting practical skills and outcomes",
        "instructor": "instructor full name with title",
        "duration": "X weeks format",
        "level": "beginner, intermediate, or advanced"
      }`;
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://your-app.com",
          "X-Title": "Tech Learn Platform"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional course creator. Generate high-quality course details in valid JSON format only."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("OpenRouter API response:", result);
        
        // Extract JSON content from the response
        let jsonContent;
        try {
          if (result.choices && result.choices[0]?.message?.content) {
            const text = result.choices[0].message.content;
            const jsonStart = text.indexOf('{');
            const jsonEnd = text.lastIndexOf('}') + 1;
            
            if (jsonStart !== -1 && jsonEnd !== -1) {
              const jsonStr = text.substring(jsonStart, jsonEnd);
              jsonContent = JSON.parse(jsonStr);
            }
          }
          
          if (jsonContent && jsonContent.title && jsonContent.description) {
            // Validate and clean the AI-generated content
            course = {
              title: jsonContent.title.substring(0, 100), // Limit title length
              description: jsonContent.description.substring(0, 500), // Limit description length
              category: category,
              instructor: jsonContent.instructor || course.instructor,
              duration: jsonContent.duration || course.duration,
              level: (jsonContent.level === "beginner" || jsonContent.level === "intermediate" || jsonContent.level === "advanced") 
                ? jsonContent.level as "beginner" | "intermediate" | "advanced"
                : course.level
            };
          }
        } catch (error) {
          console.error("Error parsing AI response:", error);
          // Keep default course data if parsing fails
        }
      }
    } catch (error) {
      console.error("Error generating course with AI:", error);
      // Keep default course data if AI generation fails
    }
  }
  
  return course;
}

// Search YouTube for related videos and get a thumbnail
async function searchYouTubeForCourse(course: any) {
  if (!youtubeApiKey) {
    console.log("YouTube API key not configured, using placeholder thumbnails");
    return {
      videoIds: [],
      videos: [],
      thumbnail: `https://source.unsplash.com/random/800x600/?${encodeURIComponent(course.category.toLowerCase())}`,
    };
  }

  try {
    const query = encodeURIComponent(`${course.title} ${course.category} course tutorial`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${query}&type=video&videoDuration=medium&videoEmbeddable=true&key=${youtubeApiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error("No videos found");
    }
    
    // Get video IDs for fetching detailed information
    const videoIds = data.items.map((item: any) => item.id.videoId);
    
    // Get detailed video information including duration
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds.join(',')}&key=${youtubeApiKey}`;
    const detailsResponse = await fetch(detailsUrl);
    
    if (!detailsResponse.ok) {
      throw new Error(`YouTube video details API error: ${detailsResponse.status}`);
    }
    
    const detailsData = await detailsResponse.json();
    
    // Process video data
    const videos = detailsData.items.map((item: any) => {
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
        url: `https://www.youtube-nocookie.com/embed/${item.id}`,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        duration: formattedDuration
      };
    });
    
    // Get thumbnail from the first video (highest quality available)
    const thumbnail = 
      detailsData.items[0]?.snippet?.thumbnails?.high?.url || 
      detailsData.items[0]?.snippet?.thumbnails?.medium?.url || 
      detailsData.items[0]?.snippet?.thumbnails?.default?.url ||
      `https://source.unsplash.com/random/800x600/?${encodeURIComponent(course.category.toLowerCase())}`;
    
    return { videoIds, videos, thumbnail };
  } catch (error) {
    console.error("Error searching YouTube:", error);
    return {
      videoIds: [],
      videos: [],
      thumbnail: `https://source.unsplash.com/random/800x600/?${encodeURIComponent(course.category.toLowerCase())}`,
    };
  }
}

// Improved function to safely clear existing courses
async function clearExistingCourses() {
  try {
    console.log("Starting to clear existing courses...");
    
    // First, get all course IDs to track progress
    const { data: existingCourses, error: fetchError } = await supabase
      .from('courses')
      .select('id');
    
    if (fetchError) {
      console.error("Error fetching existing courses:", fetchError);
      throw new Error(`Error fetching existing courses: ${fetchError.message}`);
    }
    
    const courseIds = existingCourses?.map(course => course.id) || [];
    console.log(`Found ${courseIds.length} courses to delete`);
    
    if (courseIds.length === 0) {
      console.log("No courses to delete");
      return;
    }
    
    // Delete videos for each course individually to avoid timeout
    for (const courseId of courseIds) {
      const { error: deleteVideosError } = await supabase
        .from('videos')
        .delete()
        .eq('course_id', courseId);
        
      if (deleteVideosError) {
        console.error(`Error deleting videos for course ${courseId}:`, deleteVideosError);
      }
    }
    
    // Delete notes for each course individually
    for (const courseId of courseIds) {
      const { error: deleteNotesError } = await supabase
        .from('notes')
        .delete()
        .eq('course_id', courseId);
        
      if (deleteNotesError) {
        console.error(`Error deleting notes for course ${courseId}:`, deleteNotesError);
      }
    }
    
    // Finally, delete all courses in batches to avoid timeout
    const batchSize = 10;
    for (let i = 0; i < courseIds.length; i += batchSize) {
      const batch = courseIds.slice(i, i + batchSize);
      const { error: deleteCoursesError } = await supabase
        .from('courses')
        .delete()
        .in('id', batch);
      
      if (deleteCoursesError) {
        console.error(`Error deleting course batch:`, deleteCoursesError);
        throw new Error(`Error deleting courses: ${deleteCoursesError.message}`);
      }
      
      console.log(`Deleted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(courseIds.length / batchSize)}`);
    }
    
    console.log("Successfully cleared all existing courses");
  } catch (error) {
    console.error("Error in clearExistingCourses:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { count = 5, clearExisting = false } = await req.json();
    
    console.log(`Received request to generate ${count} courses`);
    console.log(`Clear existing courses: ${clearExisting}`);
    
    // Ensure count is within reasonable limits
    const coursesToGenerate = Math.min(Math.max(parseInt(count.toString()) || 5, 1), 50);
    console.log(`Will generate ${coursesToGenerate} courses`);
    
    // Get existing course titles to avoid duplicates
    const { data: existingCourses, error: fetchError } = await supabase
      .from('courses')
      .select('title');
    
    if (fetchError) {
      throw new Error(`Error fetching existing courses: ${fetchError.message}`);
    }
    
    const existingTitles = new Set(existingCourses?.map(course => course.title.toLowerCase()) || []);
    
    console.log(`Generating ${coursesToGenerate} courses with AI`);
    
    // Select random categories without repeating
    const shuffledCategories = [...courseCategories].sort(() => 0.5 - Math.random());
    const selectedCategories = shuffledCategories.slice(0, coursesToGenerate);
    
    // Generate courses
    let totalCoursesGenerated = 0;
    
    for (const category of selectedCategories) {
      try {
        // Generate course with AI
        const course = await generateCourseWithAI(category);
        
        // Skip if course already exists
        if (existingTitles.has(course.title.toLowerCase())) {
          console.log(`Course "${course.title}" already exists, skipping`);
          continue;
        }
        
        // Add course title to existing set
        existingTitles.add(course.title.toLowerCase());
        
        // Search YouTube for related videos and get a thumbnail
        console.log(`Searching YouTube for: ${course.title} ${course.category}`);
        const { videos, thumbnail } = await searchYouTubeForCourse(course);
        
        // Add the course
        const { data: newCourse, error: courseError } = await supabase
          .from('courses')
          .insert({
            title: course.title,
            description: course.description,
            instructor: course.instructor,
            category: course.category,
            level: course.level,
            duration: course.duration,
            thumbnail: thumbnail,
            featured: Math.random() > 0.7, // 30% chance to be featured
          })
          .select()
          .single();
        
        if (courseError || !newCourse) {
          console.error("Error adding course:", courseError);
          continue;
        }
        
        // Add videos using YouTube data
        if (videos && videos.length > 0) {
          for (let i = 0; i < videos.length; i++) {
            const video = videos[i];
            
            const { error: videoError } = await supabase
              .from('videos')
              .insert({
                course_id: newCourse.id,
                title: video.title,
                description: video.description,
                url: video.url,
                thumbnail: video.thumbnail,
                duration: video.duration,
                order_num: i + 1,
              });
            
            if (videoError) {
              console.error("Error adding video:", videoError);
            }
          }
        } else {
          // Add default videos if no YouTube videos found
          const defaultVideos = [
            { title: `Introduction to ${course.title}`, description: `Getting started with ${course.title}`, url: "", duration: "15:00" },
            { title: `${course.title} Advanced Topics`, description: `Advanced concepts in ${course.title}`, url: "", duration: "20:00" }
          ];
          
          for (let i = 0; i < defaultVideos.length; i++) {
            const video = defaultVideos[i];
            
            const { error: videoError } = await supabase
              .from('videos')
              .insert({
                course_id: newCourse.id,
                title: video.title,
                description: video.description,
                url: video.url,
                thumbnail: thumbnail,
                duration: video.duration,
                order_num: i + 1,
              });
            
            if (videoError) {
              console.error("Error adding video:", videoError);
            }
          }
        }
        
        // Add a course document
        const { error: noteError } = await supabase
          .from('notes')
          .insert({
            course_id: newCourse.id,
            title: `${course.title} Course Materials`,
            description: `Comprehensive study materials for ${course.title}`,
            file_url: `course_materials_${newCourse.id}.pdf`,
            file_type: 'pdf',
            order_num: 1,
          });
        
        if (noteError) {
          console.error("Error adding note:", noteError);
        }
        
        totalCoursesGenerated++;
        console.log(`Successfully added course: ${course.title}`);
        
      } catch (error) {
        console.error(`Error processing category ${category}:`, error);
        continue;
      }
    }
    
    console.log(`Successfully added ${totalCoursesGenerated} courses`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully generated ${totalCoursesGenerated} courses with AI`, 
        count: totalCoursesGenerated,
        coursesGenerated: totalCoursesGenerated
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in populate-courses function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Error generating courses: ${error instanceof Error ? error.message : String(error)}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
