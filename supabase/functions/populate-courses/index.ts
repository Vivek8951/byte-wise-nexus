
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
// Hugging Face API key
const huggingFaceApiKey = Deno.env.get('HUGGING_FACE_API_KEY') || '';

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
  "Algorithms"
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
  "Nina Patel",
  "Alex Johnson",
  "Robert Sedgewick",
  "Ada Lovelace",
  "Wei Zhang",
  "Emily Rodriguez",
  "Jordan Lee",
  "Naomi Campbell"
];

// Generate a course with AI using Hugging Face API
async function generateCourseWithAI(category: string) {
  // Default course in case AI generation fails
  let course = {
    title: `Introduction to ${category}`,
    description: `Learn the fundamentals of ${category} with hands-on projects and real-world applications.`,
    category: category,
    instructor: instructorNames[Math.floor(Math.random() * instructorNames.length)],
    duration: `${Math.floor(Math.random() * 10) + 4} weeks`,
    level: courseLevels[Math.floor(Math.random() * courseLevels.length)] as "beginner" | "intermediate" | "advanced"
  };
  
  if (huggingFaceApiKey) {
    try {
      const prompt = `Generate a tech course about ${category}. Return the result as JSON with the following fields:
      {
        "title": "course title",
        "description": "detailed course description in 1-2 sentences",
        "instructor": "instructor name",
        "duration": "course duration in weeks",
        "level": "difficulty level (beginner, intermediate, or advanced)"
      }`;
      
      const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${huggingFaceApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 250,
            temperature: 0.7,
            return_full_text: false
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("Hugging Face API response:", result);
        
        // Extract JSON content from the response
        let jsonContent;
        try {
          // The API might return the response in various formats, so we need to handle them
          if (Array.isArray(result) && result[0]?.generated_text) {
            // Try to extract JSON from the generated text
            const matches = result[0].generated_text.match(/\{[\s\S]*\}/);
            if (matches) {
              jsonContent = JSON.parse(matches[0]);
            }
          } else if (typeof result === 'object') {
            jsonContent = result;
          }
          
          if (jsonContent) {
            // Validate and use AI-generated content
            if (jsonContent.title && jsonContent.description) {
              course = {
                title: jsonContent.title,
                description: jsonContent.description,
                category: category,
                instructor: jsonContent.instructor || course.instructor,
                duration: jsonContent.duration || course.duration,
                level: (jsonContent.level === "beginner" || jsonContent.level === "intermediate" || jsonContent.level === "advanced") 
                  ? jsonContent.level as "beginner" | "intermediate" | "advanced"
                  : course.level
              };
            }
          }
        } catch (error) {
          console.error("Error parsing AI response:", error);
        }
      }
    } catch (error) {
      console.error("Error generating course with AI:", error);
    }
  }
  
  return course;
}

async function searchYouTubeForCourse(course: any) {
  if (!youtubeApiKey) {
    console.log("YouTube API key not configured, using placeholder thumbnails");
    return {
      videoIds: [],
      thumbnail: `https://source.unsplash.com/random/800x600/?${encodeURIComponent(course.category.toLowerCase())}`,
    };
  }

  try {
    const query = encodeURIComponent(`${course.title} ${course.category} course tutorial`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${query}&type=video&videoDuration=medium&key=${youtubeApiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error("No videos found");
    }
    
    // Get video IDs for course videos
    const videoIds = data.items.map((item: any) => item.id.videoId);
    
    // Get thumbnail from the first video (highest quality available)
    const thumbnail = 
      data.items[0].snippet.thumbnails.high?.url || 
      data.items[0].snippet.thumbnails.medium?.url || 
      data.items[0].snippet.thumbnails.default?.url ||
      `https://source.unsplash.com/random/800x600/?${encodeURIComponent(course.category.toLowerCase())}`;
    
    return { videoIds, thumbnail };
  } catch (error) {
    console.error("Error searching YouTube:", error);
    return {
      videoIds: [],
      thumbnail: `https://source.unsplash.com/random/800x600/?${encodeURIComponent(course.category.toLowerCase())}`,
    };
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
    const coursesToGenerate = Math.min(Math.max(parseInt(count.toString()) || 5, 1), 15);
    console.log(`Will generate ${coursesToGenerate} courses`);
    
    // Clear all existing courses if requested
    if (clearExisting) {
      // Delete all videos and notes (will cascade due to foreign key constraints)
      const { error: deleteVideosError } = await supabase
        .from('videos')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      const { error: deleteNotesError } = await supabase
        .from('notes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Delete all courses
      const { error: deleteCoursesError } = await supabase
        .from('courses')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteCoursesError) {
        throw new Error(`Error deleting existing courses: ${deleteCoursesError.message}`);
      }
      
      console.log("Deleted existing courses successfully");
    }
    
    console.log(`Generating ${coursesToGenerate} courses with AI`);
    
    // Get existing course titles to avoid duplicates
    const { data: existingCourses, error: fetchError } = await supabase
      .from('courses')
      .select('title');
    
    if (fetchError) {
      throw new Error(`Error fetching existing courses: ${fetchError.message}`);
    }
    
    const existingTitles = new Set(existingCourses?.map(course => course.title.toLowerCase()) || []);
    
    // Generate AI courses in batches to improve reliability
    const batchSize = 5;
    const batches = Math.ceil(coursesToGenerate / batchSize);
    let totalCoursesGenerated = 0;
    
    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const batchCoursesToGenerate = Math.min(batchSize, coursesToGenerate - totalCoursesGenerated);
      if (batchCoursesToGenerate <= 0) break;
      
      console.log(`Generating batch ${batchIndex + 1} with ${batchCoursesToGenerate} courses`);
      
      // Select random categories without repeating
      const shuffledCategories = [...courseCategories].sort(() => 0.5 - Math.random());
      const selectedCategories = shuffledCategories.slice(0, batchCoursesToGenerate);
      
      // Generate courses for this batch
      const aiCoursesPromises = selectedCategories.map(category => generateCourseWithAI(category));
      const batchAiCourses = await Promise.all(aiCoursesPromises);
      
      // Filter out courses that already exist
      const batchUniqueCourses = batchAiCourses.filter(course => 
        !existingTitles.has(course.title.toLowerCase())
      );
      
      // Add courses to database with YouTube content
      for (const course of batchUniqueCourses) {
        // Add course titles to the existing set to avoid duplicates in future batches
        existingTitles.add(course.title.toLowerCase());
        
        // Search YouTube for related videos and get a thumbnail
        console.log(`Searching YouTube for: ${course.title} ${course.category}`);
        const { videoIds, thumbnail } = await searchYouTubeForCourse(course);
        
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
            thumbnail: thumbnail, // Use YouTube thumbnail
            featured: Math.random() > 0.7, // 30% chance to be featured
          })
          .select()
          .single();
        
        if (courseError || !newCourse) {
          console.error("Error adding course:", courseError);
          continue; // Skip to next course if there's an error
        }
        
        // Add videos using YouTube data
        for (let i = 0; i < Math.min(videoIds.length, 3); i++) {
          const videoId = videoIds[i];
          const videoUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
          
          // Get video details from YouTube API
          let videoTitle = `${course.title} - Part ${i + 1}`;
          let videoDescription = `Video lesson for ${course.title}`;
          let videoDuration = `${5 + Math.floor(Math.random() * 20)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
          let videoThumbnail = thumbnail;
          
          if (youtubeApiKey) {
            try {
              const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${youtubeApiKey}`;
              const detailsResponse = await fetch(videoDetailsUrl);
              
              if (detailsResponse.ok) {
                const videoDetails = await detailsResponse.json();
                if (videoDetails.items && videoDetails.items.length > 0) {
                  videoTitle = videoDetails.items[0].snippet.title;
                  videoDescription = videoDetails.items[0].snippet.description.slice(0, 255); // Limit description length
                  videoThumbnail = videoDetails.items[0].snippet.thumbnails.high?.url || thumbnail;
                  
                  // Parse duration from PT1H2M3S format to hours:minutes:seconds
                  const duration = videoDetails.items[0].contentDetails.duration;
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
                }
              }
            } catch (error) {
              console.error("Error fetching video details:", error);
              // Continue with default values
            }
          }
          
          const { error: videoError } = await supabase
            .from('videos')
            .insert({
              course_id: newCourse.id,
              title: videoTitle,
              description: videoDescription,
              url: videoUrl,
              thumbnail: videoThumbnail,
              duration: videoDuration,
              order_num: i + 1,
            });
          
          if (videoError) {
            console.error("Error adding video:", videoError);
          }
        }
        
        // Add a few notes/documents
        const documentTypes = ['pdf', 'doc'];
        const noteTitles = [
          'Course Notes', 
          'Study Guide', 
          'Practice Exercises', 
          'Reference Material',
          'Additional Resources'
        ];
        
        for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) { // 1-2 documents
          const { error: noteError } = await supabase
            .from('notes')
            .insert({
              course_id: newCourse.id,
              title: noteTitles[i % noteTitles.length],
              description: `Supplementary material for ${course.title}`,
              file_url: `sample_${i + 1}.${documentTypes[i % documentTypes.length]}`,
              file_type: documentTypes[i % documentTypes.length],
              order_num: i + 1,
            });
          
          if (noteError) {
            console.error("Error adding note:", noteError);
          }
        }
        
        totalCoursesGenerated++;
      }
      
      console.log(`Batch ${batchIndex + 1} completed, ${totalCoursesGenerated} courses generated so far`);
      
      // Small delay between batches to avoid overwhelming the APIs
      if (batchIndex < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`Successfully added ${totalCoursesGenerated} courses`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully generated ${totalCoursesGenerated} courses with AI`, 
        count: totalCoursesGenerated
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
