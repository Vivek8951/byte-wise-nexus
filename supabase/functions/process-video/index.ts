import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";
import { installDbFunctions } from "./install-db-function.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = 'https://weiagpwgfmyjdglfpbeu.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get API keys from environment variables
const HUGGING_FACE_API_KEY = Deno.env.get('HUGGING_FACE_API_KEY') || '';

// High-quality educational thumbnails
const COURSE_THUMBNAILS = {
  "react": [
    "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=1000", 
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000",
    "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?q=80&w=1000"
  ],
  "javascript": [
    "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=1000",
    "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1000", 
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1000"
  ],
  "python": [
    "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?q=80&w=1000",
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1000",
    "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1000"
  ],
  "data": [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000",
    "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=1000",
    "https://images.unsplash.com/photo-1535350356005-fd52b3b524fb?q=80&w=1000"
  ],
  "machine learning": [
    "https://images.unsplash.com/photo-1527474305487-b87b222841cc?q=80&w=1000",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000",
    "https://images.unsplash.com/photo-1677442135143-9269c0225de2?q=80&w=1000"
  ],
  "web": [
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000",
    "https://images.unsplash.com/photo-1573867639040-6dd25fa5f597?q=80&w=1000",
    "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1000"
  ],
  "algorithm": [
    "https://images.unsplash.com/photo-1564865878688-9a244444042a?q=80&w=1000",
    "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?q=80&w=1000",
    "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=1000"
  ]
};

// YouTube video links by category - these are real, publicly available educational videos
const EDUCATIONAL_VIDEOS_BY_CATEGORY = {
  "web development": [
    "https://www.youtube-nocookie.com/embed/PkZNo7MFNFg", // Learn JavaScript - Full Course for Beginners
    "https://www.youtube-nocookie.com/embed/QFaFIcGhPoM", // React JS Crash Course
    "https://www.youtube-nocookie.com/embed/gieEQFIfgYc", // HTML Full Course - Build a Website Tutorial
    "https://www.youtube-nocookie.com/embed/1Rs2ND1ryYc", // CSS Tutorial - Zero to Hero
    "https://www.youtube-nocookie.com/embed/DLX62G4lc44"  // Node.js Tutorial for Beginners
  ],
  "data science": [
    "https://www.youtube-nocookie.com/embed/LHBE6Q9XlzI", // Python for Data Science - Course for Beginners
    "https://www.youtube-nocookie.com/embed/QUT1VHiLmmI", // Data Science Full Course
    "https://www.youtube-nocookie.com/embed/_uQrJ0TkZlc", // Python Tutorial - Python Full Course for Beginners
    "https://www.youtube-nocookie.com/embed/ua-CiDNNj30", // Machine Learning Tutorial - Full Course for Beginners
    "https://www.youtube-nocookie.com/embed/JL_grPUnXzY"  // R Programming Tutorial - Learn the Basics of Statistical Computing
  ],
  "design": [
    "https://www.youtube-nocookie.com/embed/WZQYt5HZ0-E", // UI/UX Design Course
    "https://www.youtube-nocookie.com/embed/1rBFLQsfNGs", // Adobe Illustrator Tutorial - Complete Beginners Course
    "https://www.youtube-nocookie.com/embed/BDpBAFvdjYo", // Graphic Design Tutorial for Beginners
    "https://www.youtube-nocookie.com/embed/pF2kaoKmUXQ", // Web Design: How to Create an Effective Landing Page
    "https://www.youtube-nocookie.com/embed/LsNW4FPHuZE"  // Figma Tutorial - A Free UI Design/Prototyping Tool
  ],
  "business": [
    "https://www.youtube-nocookie.com/embed/MJFrBxHx7LQ", // Introduction to Entrepreneurship
    "https://www.youtube-nocookie.com/embed/NpPMiY-42HQ", // Marketing 101: A Guide to Winning Customers
    "https://www.youtube-nocookie.com/embed/xID8VAX8HLs", // Business Plan Writing 101
    "https://www.youtube-nocookie.com/embed/F8PZ6nNymy0", // The Complete Digital Marketing Course for Beginners
    "https://www.youtube-nocookie.com/embed/rokGy0huYEA"  // How to Start a Business with No Money
  ],
  "technology": [
    "https://www.youtube-nocookie.com/embed/fYFR6A9RxsA", // AWS Certified Cloud Practitioner Training
    "https://www.youtube-nocookie.com/embed/iVmPLujIVmQ", // Docker Tutorial for Beginners
    "https://www.youtube-nocookie.com/embed/0oEsMwSxBsk", // Git and GitHub for Beginners
    "https://www.youtube-nocookie.com/embed/_uQrJ0TkZlc", // Python Tutorial - Python Full Course for Beginners
    "https://www.youtube-nocookie.com/embed/8JJ101D3knE"  // Linux Crash Course for Beginners
  ],
  "programming": [
    "https://www.youtube-nocookie.com/embed/GhQdlIFylQ8", // C++ Tutorial for Beginners
    "https://www.youtube-nocookie.com/embed/XUj5JbQihlU", // Java Tutorial for Beginners
    "https://www.youtube-nocookie.com/embed/Z1RJmh_OqeA", // PHP Tutorial for Beginners
    "https://www.youtube-nocookie.com/embed/fBNz5xF-Kx4", // Node.js Tutorial for Beginners
    "https://www.youtube-nocookie.com/embed/rfscVS0vtbw"  // Python Tutorial - Python Full Course for Beginners
  ],
  "react": [
    "https://www.youtube-nocookie.com/embed/w7ejDZ8SWv8", // React JS Crash Course 2021
    "https://www.youtube-nocookie.com/embed/4UZrsTqkcW4", // Full React Tutorial
    "https://www.youtube-nocookie.com/embed/QFaFIcGhPoM", // React JS Crash Course
    "https://www.youtube-nocookie.com/embed/bMknfKXIFA8", // React Course - Beginner's Tutorial for React JavaScript Library 2022
    "https://www.youtube-nocookie.com/embed/RVFAyFWO4go"  // React JS Tutorial for Beginners - Full Course in 12 Hours 2023
  ],
  "javascript": [
    "https://www.youtube-nocookie.com/embed/PkZNo7MFNFg", // Learn JavaScript - Full Course for Beginners
    "https://www.youtube-nocookie.com/embed/W6NZfCO5SIk", // JavaScript Tutorial for Beginners: Learn JavaScript in 1 Hour
    "https://www.youtube-nocookie.com/embed/jS4aFq5-91M", // JavaScript Programming - Full Course
    "https://www.youtube-nocookie.com/embed/hdI2bqOjy3c", // JavaScript Crash Course For Beginners
    "https://www.youtube-nocookie.com/embed/8dWL3wF_OMw"  // Essential JavaScript Concepts
  ],
  "data structures": [
    "https://www.youtube-nocookie.com/embed/0IAPZzGSbME", // Data Structures & Algorithms
    "https://www.youtube-nocookie.com/embed/pkkFqlG0Hds", // Sorting Algorithms
    "https://www.youtube-nocookie.com/embed/09_LlHjoEiY", // Graph Algorithms
    "https://www.youtube-nocookie.com/embed/8hly31xKli0", // Algorithm Design
    "https://www.youtube-nocookie.com/embed/HtSuA80QTyo"  // Dynamic Programming
  ],
  "algorithms": [
    "https://www.youtube-nocookie.com/embed/0IAPZzGSbME", // Data Structures & Algorithms
    "https://www.youtube-nocookie.com/embed/pkkFqlG0Hds", // Sorting Algorithms
    "https://www.youtube-nocookie.com/embed/09_LlHjoEiY", // Graph Algorithms
    "https://www.youtube-nocookie.com/embed/8hly31xKli0", // Algorithm Design
    "https://www.youtube-nocookie.com/embed/HtSuA80QTyo"  // Dynamic Programming
  ]
};

// Add more specific video categories
const LECTURE_SPECIFIC_VIDEOS = {
  "react components": [
    "https://www.youtube-nocookie.com/embed/Tn6-PIqc4UM", // React Components
    "https://www.youtube-nocookie.com/embed/Y2hgEGPzTZY", // React Components in Depth
    "https://www.youtube-nocookie.com/embed/Cla1WwguArA", // Components and Props
    "https://www.youtube-nocookie.com/embed/9U3IhLAnSxM", // Functional Components vs Class Components
    "https://www.youtube-nocookie.com/embed/KnEbCS3H74I"  // React Components & State
  ],
  "jsx": [
    "https://www.youtube-nocookie.com/embed/9D1x7-2FmTA", // React JSX
    "https://www.youtube-nocookie.com/embed/7HSd1sk07uU", // JSX in Depth
    "https://www.youtube-nocookie.com/embed/C8-Xi0ltbdw", // JSX vs HTML
    "https://www.youtube-nocookie.com/embed/wdJGWNOIaAY", // React JSX Tutorial
    "https://www.youtube-nocookie.com/embed/NCwa_xi0Uuc"  // JSX Explained
  ],
  "props": [
    "https://www.youtube-nocookie.com/embed/PHaECbrKgs0", // React Props
    "https://www.youtube-nocookie.com/embed/ae55rTTBib0", // Props Deep Dive
    "https://www.youtube-nocookie.com/embed/m7OWXtbiXX8", // Props vs State
    "https://www.youtube-nocookie.com/embed/Qbi-89gDOL0", // Props Tutorial
    "https://www.youtube-nocookie.com/embed/KvapBXwpWTI"  // Advanced Props
  ],
  "hooks": [
    "https://www.youtube-nocookie.com/embed/O6P86uwfdR0", // React Hooks
    "https://www.youtube-nocookie.com/embed/TNhaISOUy6Q", // useState and useEffect
    "https://www.youtube-nocookie.com/embed/j1ZRyw7OtZs", // Custom Hooks
    "https://www.youtube-nocookie.com/embed/-MlNBTSg_Ww", // Hooks Deep Dive
    "https://www.youtube-nocookie.com/embed/f687hBjwFcM"  // React Hooks Tutorial
  ],
  "effects": [
    "https://www.youtube-nocookie.com/embed/0ZJgIjIuY7U", // useEffect Hook
    "https://www.youtube-nocookie.com/embed/Bg7GxSakhMo", // Side Effects in React
    "https://www.youtube-nocookie.com/embed/j0ycGQKqMT4", // useEffect Explained
    "https://www.youtube-nocookie.com/embed/QQYeipc_cik", // useEffect Dependencies
    "https://www.youtube-nocookie.com/embed/dH6i3GurZW8"  // Clean up in useEffect
  ]
};

/**
 * Gets a high-quality themed thumbnail URL for a specific course topic
 * @param courseTitle Title of the course
 * @param courseCategory Category of the course
 * @param videoTitle Optional video title for more specific thumbnails
 * @returns Thumbnail URL that matches the course content
 */
function getCourseThumbnailUrl(courseTitle: string, courseCategory: string, videoTitle?: string): string {
  // Default high-quality educational thumbnails
  const defaultThumbnails = [
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1000", // Tech/coding
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1000", // Programming
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000", // Data Science
    "https://images.unsplash.com/photo-1581092219224-9775e73d0786?q=80&w=1000", // Modern Learning
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000"  // Web development
  ];
  
  // Normalize input text for matching
  const normalizedCourseTitle = courseTitle?.toLowerCase() || "";
  const normalizedCategory = courseCategory?.toLowerCase() || "";
  const normalizedVideoTitle = videoTitle?.toLowerCase() || "";
  
  // Try to find a category match in our thumbnails
  for (const [category, thumbnails] of Object.entries(COURSE_THUMBNAILS)) {
    // Check if the video title contains the category
    if (videoTitle && normalizedVideoTitle.includes(category)) {
      const index = videoTitle.charCodeAt(0) % thumbnails.length;
      return thumbnails[index];
    }
    
    // Check if the course title contains the category
    if (normalizedCourseTitle.includes(category)) {
      const index = courseTitle.charCodeAt(0) % thumbnails.length;
      return thumbnails[index];
    }
    
    // Check if the course category contains the category
    if (normalizedCategory.includes(category)) {
      const index = courseCategory.charCodeAt(0) % thumbnails.length;
      return thumbnails[index];
    }
  }
  
  // Get the first letter of the course title to make selections deterministic
  const hash = courseTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return defaultThumbnails[hash % defaultThumbnails.length];
}

// Function to call Hugging Face API to get relevant YouTube videos
async function getYouTubeVideoWithHuggingFace(courseTitle: string, videoTitle: string): Promise<string | null> {
  try {
    if (!HUGGING_FACE_API_KEY) {
      console.log("No Hugging Face API key provided, using predefined videos");
      return null;
    }
    
    // Formulate prompt for Hugging Face model
    const prompt = `Find a YouTube educational video about "${courseTitle} - ${videoTitle}". 
                   Return only the YouTube embed URL in this format: https://www.youtube-nocookie.com/embed/VIDEO_ID`;
    
    console.log(`Calling Hugging Face API to find video for: ${courseTitle} - ${videoTitle}`);
    
    // Call Hugging Face API using text-generation endpoint
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.3,
          top_p: 0.9,
          do_sample: true
        }
      })
    });

    if (!response.ok) {
      console.error(`Hugging Face API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log("Hugging Face response:", data);
    
    // Extract YouTube URL from response
    const generatedText = data[0]?.generated_text || "";
    const urlRegex = /https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]+)/;
    const match = generatedText.match(urlRegex);
    
    if (match && match[0]) {
      const videoUrl = match[0].replace("youtube.com", "youtube-nocookie.com"); // Ensure privacy-enhanced mode
      console.log(`Found valid YouTube URL via Hugging Face: ${videoUrl}`);
      return videoUrl;
    } else {
      console.log("No valid YouTube URL found in Hugging Face response");
      return null;
    }
    
  } catch (error) {
    console.error("Error calling Hugging Face API for video:", error);
    return null;
  }
}

// Function to download video and generate thumbnail 
async function downloadVideoAndGenerateThumbnail(videoUrl, courseTitle, videoTitle) {
  try {
    if (!videoUrl) return { success: false, message: "No video URL provided" };
    
    // Extract video ID from YouTube embed URL
    const videoIdMatch = videoUrl.match(/embed\/([a-zA-Z0-9_-]+)/);
    if (!videoIdMatch || !videoIdMatch[1]) {
      return { success: false, message: "Invalid YouTube URL format" };
    }
    
    const videoId = videoIdMatch[1];
    
    // Generate YouTube thumbnail URL (multiple resolutions available)
    const thumbnailOptions = [
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // High quality
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,     // High quality
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,     // Medium quality
      `https://img.youtube.com/vi/${videoId}/default.jpg`        // Default
    ];
    
    // Get downloadable video URL
    // Note: Due to YouTube's terms of service, we can't directly download videos
    // Instead, we'll provide a URL to a service that can show the video in a downloadable format
    const playerUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Generate a "Download" link that points to a theoretical video file
    // This is just for UI consistency - actual YouTube downloads would require a separate service
    const downloadableUrl = `https://vid.puffyan.us/watch?v=${videoId}`;
    
    return {
      success: true,
      videoId: videoId,
      embedUrl: videoUrl,
      watchUrl: watchUrl,
      playerUrl: playerUrl,
      downloadableUrl: downloadableUrl,
      thumbnails: thumbnailOptions,
    };
  } catch (error) {
    console.error("Error downloading video:", error);
    return { success: false, message: "Failed to process video" };
  }
}

// Function to call Hugging Face API for thumbnail generation
async function generateThumbnailWithHuggingFace(title, description) {
  try {
    if (!HUGGING_FACE_API_KEY) {
      console.log("No Hugging Face API key provided, using default thumbnail");
      return null;
    }
    
    const prompt = `Create a thumbnail image for an educational video about ${title}. ${description ? `The video is about: ${description}` : ''}`;
    
    console.log("Calling Hugging Face API to generate a thumbnail");
    
    const response = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: "blurry, text, watermark, logo, ugly, poor quality",
          guidance_scale: 7.5
        }
      })
    });
    
    if (!response.ok) {
      console.error(`Hugging Face API error: ${response.status}`);
      return null;
    }
    
    // Get the image data
    const imageData = await response.arrayBuffer();
    
    // Convert ArrayBuffer to base64
    const base64 = btoa(
      new Uint8Array(imageData)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return null;
  }
}

// Generate content analysis using Hugging Face API
async function generateContentAnalysisWithHuggingFace(transcript: string, courseTitle: string, videoTitle: string): Promise<any | null> {
  try {
    if (!HUGGING_FACE_API_KEY) {
      console.log("No Hugging Face API key provided, using default analysis");
      return null;
    }
    
    const prompt = `
      Analyze this educational video transcript about "${courseTitle} - ${videoTitle}":
      
      ${transcript}
      
      Generate a comprehensive analysis including:
      1. A concise summary (max 150 words)
      2. 5 key questions with multiple-choice answers (4 options each, mark the correct one)
      3. 5-7 important keywords from the content
      
      Format your response as a JSON object with these keys:
      "summary": "...",
      "questions": [...],
      "keywords": [...]
    `;
    
    console.log(`Calling Hugging Face API to analyze content for: ${courseTitle} - ${videoTitle}`);
    
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      console.error(`Hugging Face API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log("Hugging Face content analysis response received");
    
    try {
      // Parse the JSON from the generated text
      const generatedText = data[0]?.generated_text || "";
      
      // Extract JSON object if present
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const analysisData = JSON.parse(jsonStr);
        
        if (analysisData.summary && analysisData.questions && analysisData.keywords) {
          analysisData.transcript = transcript;
          return analysisData;
        }
      }
      
      console.log("Could not parse valid content analysis from response");
      return null;
    } catch (parseError) {
      console.error("Error parsing content analysis:", parseError);
      return null;
    }
    
  } catch (error) {
    console.error("Error analyzing content with Hugging Face API:", error);
    return null;
  }
}

// Get relevant YouTube video URL based on course category, title and video title
async function getRelevantVideoUrl(category: string, courseTitle: string, videoTitle: string = ""): Promise<string> {
  try {
    // First try to get a video recommendation using Hugging Face API
    const huggingFaceRecommendation = await getYouTubeVideoWithHuggingFace(courseTitle, videoTitle);
    if (huggingFaceRecommendation) {
      return huggingFaceRecommendation;
    }
    
    console.log("Falling back to predefined video catalog");
    
    // Normalize inputs by converting to lowercase 
    const normalizedCategory = category.toLowerCase();
    const normalizedCourseTitle = courseTitle.toLowerCase();
    const normalizedVideoTitle = videoTitle.toLowerCase();
    
    // First check for specific lecture topics
    for (const [topic, videos] of Object.entries(LECTURE_SPECIFIC_VIDEOS)) {
      if (normalizedVideoTitle.includes(topic)) {
        // Return a consistent video based on the video title
        const index = videoTitle.charCodeAt(0) % videos.length;
        return videos[index];
      }
    }
    
    // Next check for specific keywords in video title
    const keywords = ["react", "javascript", "web", "data", "programming", "design", "business", "technology", "props", "hooks", "effects", "jsx", "components"];
    for (const keyword of keywords) {
      if (normalizedVideoTitle.includes(keyword)) {
        // Try to match with a specific category
        if (EDUCATIONAL_VIDEOS_BY_CATEGORY[keyword]) {
          const videos = EDUCATIONAL_VIDEOS_BY_CATEGORY[keyword];
          // Return a consistent video based on the first character of the title
          const index = videoTitle.charCodeAt(0) % videos.length;
          return videos[index];
        }
      }
    }
    
    // Then check for course title keywords
    for (const keyword of keywords) {
      if (normalizedCourseTitle.includes(keyword)) {
        // Try to match with a specific category
        if (EDUCATIONAL_VIDEOS_BY_CATEGORY[keyword]) {
          const videos = EDUCATIONAL_VIDEOS_BY_CATEGORY[keyword];
          // Return a consistent video based on the first character of the course title
          const index = courseTitle.charCodeAt(0) % videos.length;
          return videos[index];
        }
      }
    }
    
    // Find best matching category if no keyword match
    let bestMatchCategory = "technology"; // Default category
    let bestMatchScore = 0;
    
    for (const cat of Object.keys(EDUCATIONAL_VIDEOS_BY_CATEGORY)) {
      // Check if category contains our category name or vice versa
      if (normalizedCategory.includes(cat) || cat.includes(normalizedCategory)) {
        const score = cat.length; // Longer match = better match
        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatchCategory = cat;
        }
      }
      
      // Also check if title contains category keywords
      if (normalizedCourseTitle.includes(cat)) {
        const score = cat.length + 1; // Title match slightly preferred
        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatchCategory = cat;
        }
      }
    }
    
    // Get videos for best matching category
    const videos = EDUCATIONAL_VIDEOS_BY_CATEGORY[bestMatchCategory] || 
                  EDUCATIONAL_VIDEOS_BY_CATEGORY["technology"]; // Fallback
    
    // Return a video from the category (consistently based on course title's first char)
    const charCode = courseTitle.charCodeAt(0) || 0;
    const index = charCode % videos.length;
    return videos[index];
  } catch (error) {
    console.error("Error getting relevant video:", error);
    return EDUCATIONAL_VIDEOS_BY_CATEGORY["technology"][0]; // Default fallback
  }
}

// Generate a mock transcript based on course and video details
async function generateMockTranscript(courseTitle: string, courseCategory: string, videoTitle: string): Promise<string> {
  try {
    // Try to generate transcript using Hugging Face
    if (HUGGING_FACE_API_KEY) {
      const prompt = `Create a detailed educational transcript for a video titled "${videoTitle}" 
                      that would be part of a course on "${courseTitle}" in the field of ${courseCategory}.
                      The transcript should be approximately 500 words and include technical terminology
                      appropriate for the subject matter. Format it as a natural lecture transcript.`;
      
      const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.7,
            return_full_text: false
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const transcript = data[0]?.generated_text || "";
        
        if (transcript.length > 100) {
          return transcript;
        }
      }
    }
    
    // Fallback to basic transcript
    return `Welcome to this lecture on ${videoTitle || courseTitle}. In this comprehensive ${courseCategory} course, 
    we'll explore fundamental concepts and advanced techniques. Today's video covers key principles that will help you 
    master ${courseTitle.toLowerCase()}. We'll start by discussing the core theoretical framework, then move into 
    practical applications with several code examples and case studies. By the end of this lecture, you'll have 
    a solid understanding of ${courseCategory} principles as they apply to ${courseTitle.toLowerCase()}.`;
    
  } catch (error) {
    console.error("Error generating transcript:", error);
    return "Welcome to this educational video. We'll cover important concepts and practical applications.";
  }
}

// Generate content analysis using courseId, videoTitle and transcript
async function generateContentAnalysis(transcript: string, courseId: string, videoTitle?: string): Promise<any> {
  try {
    console.log("Generating content analysis");
    
    // Get course title to make content more specific
    const { data: courseData } = await supabase
      .from('courses')
      .select('title, category')
      .eq('id', courseId)
      .maybeSingle();
      
    const courseTitle = courseData?.title || "Technology course";
    const courseCategory = courseData?.category || "technology";
    
    // Try to get content analysis from Hugging Face first
    const huggingFaceAnalysis = await generateContentAnalysisWithHuggingFace(transcript, courseTitle, videoTitle || "");
    if (huggingFaceAnalysis) {
      return huggingFaceAnalysis;
    }
    
    // Create a more focused, relevant analysis based on course details (fallback)
    const analysisData = {
      summary: `This video provides an in-depth exploration of ${videoTitle || courseTitle} concepts within the ${courseCategory} domain. The instructor expertly breaks down complex topics into digestible segments, covering both theoretical foundations and practical applications. Key focus areas include core principles, implementation strategies, and real-world examples that demonstrate the practical value of these concepts in professional settings.`,
      questions: [
        {
          question: `Which of the following best describes a core concept covered in this ${courseCategory} lecture?`,
          options: [
            `Fundamental principles of ${courseTitle}`,
            `Ancient history of computing`,
            `Cooking techniques`,
            `Automotive repair`
          ],
          correctAnswer: 0
        },
        {
          question: `What type of examples does the instructor use to illustrate concepts in ${courseTitle}?`,
          options: [
            `Fictional scenarios`,
            `Real-world case studies`,
            `Personal anecdotes only`,
            `Political debates`
          ],
          correctAnswer: 1
        },
        {
          question: `Which skill would you develop most from this ${courseCategory} course?`,
          options: [
            `Musical composition`,
            `Gardening techniques`,
            `${courseCategory.charAt(0).toUpperCase() + courseCategory.slice(1)} expertise`,
            `Literary analysis`
          ],
          correctAnswer: 2
        },
        {
          question: `What is the primary focus of this lecture on ${courseTitle}?`,
          options: [
            `Entertainment only`,
            `Historical perspectives`,
            `Both theoretical foundations and practical applications`,
            `Philosophical debate`
          ],
          correctAnswer: 2
        },
        {
          question: `Why is understanding ${courseTitle.toLowerCase()} important in the field of ${courseCategory}?`,
          options: [
            `It's not important`,
            `It's only relevant for academics`,
            `It provides essential foundational knowledge for professional practice`,
            `It's only important for certification exams`
          ],
          correctAnswer: 2
        }
      ],
      keywords: [
        courseTitle.split(' ')[0],
        courseCategory,
        "fundamentals",
        "practical applications",
        "professional development",
        "core concepts",
        "best practices"
      ],
      transcript: transcript
    };
    
    console.log("Content analysis generated successfully");
    return analysisData;
  } catch (error) {
    console.error("Error generating content analysis:", error);
    
    // Return basic analysis as fallback
    return {
      summary: "This educational video covers important concepts and practical applications.",
      questions: [
        {
          question: "What is the main focus of this video?",
          options: [
            "Educational content",
            "Entertainment",
            "News reporting",
            "Personal vlogging"
          ],
          correctAnswer: 0
        }
      ],
      keywords: ["education", "learning", "tutorial"],
      transcript: "Welcome to this educational video."
    };
  }
}

// Process video function that orchestrates all steps
async function processVideo(videoId: string, courseId: string) {
  try {
    console.log(`Processing video ${videoId} for course ${courseId}`);
    
    // Fetch video data
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();
      
    if (videoError) {
      throw new Error(`Error fetching video: ${videoError.message}`);
    }
    
    // Fetch course data to get category
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('title, category')
      .eq('id', courseId)
      .single();
      
    if (courseError) {
      throw new Error(`Error fetching course: ${courseError.message}`);
    }
    
    // Get a relevant YouTube video URL using Hugging Face API
    const videoUrl = await getRelevantVideoUrl(courseData.category, courseData.title, video.title);
    console.log(`Selected YouTube video URL: ${videoUrl}`);
    
    // Download video and generate thumbnail
    const downloadInfo = await downloadVideoAndGenerateThumbnail(videoUrl, courseData.title, video.title);
    
    // Get high-quality thumbnail URL based on course content
    let thumbnailUrl = getCourseThumbnailUrl(courseData.title, courseData.category, video.title);
    
    // If YouTube thumbnails are available, use those as a fallback
    if (downloadInfo.success && (!thumbnailUrl || thumbnailUrl.includes('unsplash.com')) && 
        downloadInfo.thumbnails && downloadInfo.thumbnails.length > 0) {
      thumbnailUrl = downloadInfo.thumbnails[0];
    }
    
    // Generate transcript based on course and video details
    const transcript = await generateMockTranscript(courseData.title, courseData.category, video.title);
    
    // Generate content analysis that's relevant to the course
    const contentAnalysis = await generateContentAnalysis(transcript, courseId, video.title);
    
    // Update video record with analysis data and YouTube URL
    const analyzedContent = {
      transcript: transcript,
      summary: contentAnalysis.summary,
      questions: contentAnalysis.questions,
      keywords: contentAnalysis.keywords
    };
    
    console.log(`Updating video ${videoId} with YouTube URL: ${videoUrl}`);
    
    const { error: updateError } = await supabase
      .from('videos')
      .update({ 
        analyzed_content: analyzedContent,
        url: videoUrl, // Update with relevant YouTube URL
        thumbnail: thumbnailUrl, // Add thumbnail URL
        download_info: downloadInfo.success ? downloadInfo : null // Add download info
      })
      .eq('id', videoId);
      
    if (updateError) {
      throw new Error(`Error updating video: ${updateError.message}`);
    }
    
    // Generate quiz for the course from this video if none exists
    const { data: existingQuizzes } = await supabase
      .from('quizzes')
      .select('id')
      .eq('course_id', courseId);
      
    if (!existingQuizzes || existingQuizzes.length === 0) {
      // Create a quiz for this course based on the video content
      const quizQuestions = contentAnalysis.questions.map((q: any) => ({
        ...q,
        id: crypto.randomUUID()
      }));
      
      if (quizQuestions.length > 0) {
        await supabase
          .from('quizzes')
          .insert({
            title: `${courseData.title} Quiz`,
            description: `Test your knowledge about ${courseData.title}`,
            course_id: courseId,
            questions: quizQuestions,
            order_num: 1
          });
      }
    }
    
    console.log(`Video ${videoId} processed successfully`);
    
    return {
      status: "success",
      videoId: videoId,
      analyzedContent: analyzedContent,
      videoUrl: videoUrl,
      title: video.title,
      description: video.description,
      thumbnail: thumbnailUrl,
      downloadInfo: downloadInfo.success ? downloadInfo : null
    };
  } catch (error) {
    console.error("Error processing video:", error);
    return {
      status: "error",
      message: error.message
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Install db functions on first run
    await installDbFunctions();
    
    const { videoId, courseId } = await req.json();
    
    if (!videoId || !courseId) {
      return new Response(
        JSON.stringify({ error: "Missing videoId or courseId" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const result = await processVideo(videoId, courseId);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
