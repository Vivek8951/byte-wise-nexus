
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

// Courses data generator
const techCourses = [
  // Web Development
  {
    title: "Introduction to Web Development",
    description: "Learn the fundamentals of web development including HTML, CSS, and JavaScript to build responsive websites.",
    category: "Web Development", 
    instructor: "Sarah Johnson",
    duration: "8 weeks",
    level: "beginner"
  },
  {
    title: "Advanced JavaScript Frameworks",
    description: "Deep dive into modern JavaScript frameworks like React, Vue, and Angular with real-world projects.",
    category: "Web Development", 
    instructor: "David Chen",
    duration: "10 weeks",
    level: "advanced" 
  },
  {
    title: "Full-Stack Web Development",
    description: "Learn both frontend and backend technologies to become a versatile full-stack developer.",
    category: "Web Development", 
    instructor: "Maya Patel",
    duration: "12 weeks",
    level: "intermediate"
  },
  
  // Programming Languages
  {
    title: "Python for Beginners",
    description: "Start your programming journey with Python, one of the most beginner-friendly and versatile languages.",
    category: "Programming", 
    instructor: "James Wilson",
    duration: "6 weeks",
    level: "beginner"
  },
  {
    title: "Advanced Python Programming",
    description: "Take your Python skills to the next level with advanced concepts, data structures, and algorithms.",
    category: "Programming", 
    instructor: "Emma Clark",
    duration: "8 weeks",
    level: "advanced"
  },
  {
    title: "Java Programming Masterclass",
    description: "Comprehensive Java course covering core concepts, object-oriented programming, and enterprise applications.",
    category: "Programming", 
    instructor: "Michael Brown",
    duration: "10 weeks",
    level: "intermediate"
  },
  
  // Data Science & AI
  {
    title: "Introduction to Data Science",
    description: "Learn the foundations of data science including data analysis, visualization, and basic machine learning.",
    category: "Data Science", 
    instructor: "Sophia Lee",
    duration: "8 weeks",
    level: "beginner"
  },
  {
    title: "Machine Learning Engineering",
    description: "Build and deploy machine learning models to solve real-world problems with Python and scikit-learn.",
    category: "Data Science", 
    instructor: "Daniel Kim",
    duration: "12 weeks",
    level: "intermediate"
  },
  {
    title: "Deep Learning and Neural Networks",
    description: "Explore deep learning architectures, neural networks, and applications in computer vision and NLP.",
    category: "Data Science", 
    instructor: "Priya Sharma",
    duration: "10 weeks",
    level: "advanced"
  },
  
  // Mobile Development
  {
    title: "iOS App Development with Swift",
    description: "Learn to build native iOS applications using Swift and the iOS SDK with hands-on projects.",
    category: "Mobile Development", 
    instructor: "Ryan Martinez",
    duration: "9 weeks",
    level: "intermediate"
  },
  {
    title: "Android App Development",
    description: "Create native Android applications using Kotlin and Android Studio with focus on material design.",
    category: "Mobile Development", 
    instructor: "Angela Yu",
    duration: "9 weeks",
    level: "intermediate"
  },
  {
    title: "Cross-Platform Mobile Development",
    description: "Build mobile apps for both iOS and Android using frameworks like React Native and Flutter.",
    category: "Mobile Development", 
    instructor: "Tyler Johnson",
    duration: "8 weeks",
    level: "intermediate"
  },
  
  // Cybersecurity
  {
    title: "Cybersecurity Fundamentals",
    description: "Learn essential security concepts including threat modeling, encryption, network security, web security, and ethical hacking techniques to protect systems from attacks.",
    category: "Cybersecurity", 
    instructor: "Kevin Mitnick",
    duration: "7 weeks",
    level: "beginner"
  },
  {
    title: "Ethical Hacking",
    description: "Master ethical hacking techniques to identify and fix security vulnerabilities in systems and networks.",
    category: "Cybersecurity", 
    instructor: "Lisa Romano",
    duration: "8 weeks",
    level: "intermediate"
  },
  {
    title: "Network Security",
    description: "Learn to secure network infrastructure, implement firewalls, VPNs, and intrusion detection systems.",
    category: "Cybersecurity", 
    instructor: "Omar Farooq",
    duration: "6 weeks",
    level: "intermediate"
  },
  
  // Cloud Computing
  {
    title: "AWS Cloud Practitioner",
    description: "Introduction to Amazon Web Services cloud computing platform and essential services.",
    category: "Cloud Computing", 
    instructor: "Jennifer Smith",
    duration: "5 weeks",
    level: "beginner"
  },
  {
    title: "Azure Solutions Architect",
    description: "Design and implement solutions on Microsoft Azure with focus on security, scalability, and reliability.",
    category: "Cloud Computing", 
    instructor: "Thomas Wright",
    duration: "8 weeks",
    level: "advanced"
  },
  {
    title: "Google Cloud Engineer",
    description: "Learn to deploy, manage, and operate applications on Google Cloud Platform infrastructure.",
    category: "Cloud Computing", 
    instructor: "Aisha Khan",
    duration: "7 weeks",
    level: "intermediate"
  },
  
  // DevOps
  {
    title: "DevOps Engineering",
    description: "Master the practices, tools, and philosophies for efficient software delivery and infrastructure management.",
    category: "DevOps", 
    instructor: "Carlos Mendez",
    duration: "9 weeks",
    level: "intermediate"
  },
  {
    title: "Docker and Kubernetes",
    description: "Learn containerization with Docker and orchestration with Kubernetes for modern application deployment.",
    category: "DevOps", 
    instructor: "Nina Patel",
    duration: "6 weeks",
    level: "intermediate"
  },
  {
    title: "CI/CD Pipeline Implementation",
    description: "Implement continuous integration and continuous deployment pipelines for automated software delivery.",
    category: "DevOps", 
    instructor: "Alex Johnson",
    duration: "5 weeks",
    level: "intermediate"
  },
  
  // Data Structures and Algorithms
  {
    title: "Algorithms and Data Structures",
    description: "Master fundamental data structures and algorithms essential for efficient problem solving and software development.",
    category: "Computer Science", 
    instructor: "Robert Sedgewick",
    duration: "10 weeks",
    level: "intermediate"
  },
  {
    title: "Advanced Algorithms",
    description: "Study complex algorithms, computational complexity, and optimization techniques for challenging problems.",
    category: "Computer Science", 
    instructor: "Ada Lovelace",
    duration: "8 weeks",
    level: "advanced"
  },
  {
    title: "Competitive Programming",
    description: "Sharpen your problem-solving skills through algorithmic challenges and competition strategies.",
    category: "Computer Science", 
    instructor: "Wei Zhang",
    duration: "6 weeks",
    level: "advanced"
  },
  
  // UI/UX Design
  {
    title: "UI/UX Design Fundamentals",
    description: "Learn the principles of user interface and user experience design to create intuitive digital products.",
    category: "Design", 
    instructor: "Emily Rodriguez",
    duration: "7 weeks",
    level: "beginner"
  },
  {
    title: "Advanced UI Design with Figma",
    description: "Master UI design workflows using Figma to create beautiful and functional interfaces.",
    category: "Design", 
    instructor: "Jordan Lee",
    duration: "6 weeks",
    level: "intermediate"
  },
  {
    title: "UX Research and Testing",
    description: "Learn techniques for user research, usability testing, and implementing user-centered design processes.",
    category: "Design", 
    instructor: "Naomi Campbell",
    duration: "5 weeks",
    level: "intermediate"
  }
];

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
    const { count = 5, specificTopic, clearExisting = false } = await req.json();
    
    console.log(`Received request to generate ${count} courses`);
    console.log(`Clear existing courses: ${clearExisting}`);
    
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
    }
    
    console.log(`Generating ${count} courses`);
    
    // Get existing course titles to avoid duplicates
    const { data: existingCourses, error: fetchError } = await supabase
      .from('courses')
      .select('title');
    
    if (fetchError) {
      throw new Error(`Error fetching existing courses: ${fetchError.message}`);
    }
    
    const existingTitles = new Set(existingCourses?.map(course => course.title.toLowerCase()) || []);
    
    // Filter courses by specific topic if provided
    let filteredCourses = [...techCourses];
    if (specificTopic) {
      const topicLower = specificTopic.toLowerCase();
      filteredCourses = techCourses.filter(course => 
        course.title.toLowerCase().includes(topicLower) || 
        course.category.toLowerCase().includes(topicLower) || 
        course.description.toLowerCase().includes(topicLower)
      );
    }
    
    // Filter out courses that already exist
    const uniqueCourses = filteredCourses.filter(course => 
      !existingTitles.has(course.title.toLowerCase())
    );
    
    // If we don't have enough unique courses, take random ones from the full list
    // that we haven't used yet
    if (uniqueCourses.length < count && filteredCourses.length > uniqueCourses.length) {
      const remainingCourses = filteredCourses.filter(course => 
        !uniqueCourses.some(uc => uc.title === course.title) && 
        !existingTitles.has(course.title.toLowerCase())
      );
      
      // Shuffle remaining courses
      for (let i = remainingCourses.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingCourses[i], remainingCourses[j]] = [remainingCourses[j], remainingCourses[i]];
      }
      
      // Add courses until we reach the count or run out of courses
      while (uniqueCourses.length < count && remainingCourses.length > 0) {
        uniqueCourses.push(remainingCourses.pop()!);
      }
    }
    
    // Limit to requested count
    const coursesToAdd = uniqueCourses.slice(0, count);
    
    if (coursesToAdd.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No unique courses available to add. Try a different topic or clear existing courses." 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Add courses to database with YouTube content
    for (const course of coursesToAdd) {
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
    }
    
    console.log(`Successfully added ${coursesToAdd.length} courses`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully generated ${coursesToAdd.length} courses`, 
        count: coursesToAdd.length
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
