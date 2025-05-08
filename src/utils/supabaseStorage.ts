import { supabase } from '@/integrations/supabase/client';
import { Course, Video, Note, VideoDownloadInfo } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a file to Supabase Storage
 * @param file File to upload
 * @param bucketName Storage bucket name
 * @param filePath Path where the file will be stored
 * @returns URL of the uploaded file, or null if upload failed
 */
export async function uploadFile(file: File, bucketName: string, filePath?: string): Promise<string | null> {
  try {
    // Generate a unique file path if not provided
    const path = filePath || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

/**
 * Downloads a file from Supabase Storage
 * @param bucketName Storage bucket name
 * @param filePath Path to the file
 * @returns Downloaded file as a Blob, or null if download failed
 */
export async function downloadFile(bucketName: string, filePath: string): Promise<Blob | null> {
  try {
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .download(filePath);
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error downloading file:", error);
    return null;
  }
}

/**
 * Deletes a file from Supabase Storage
 * @param bucketName Storage bucket name
 * @param filePath Path to the file
 * @returns true if deletion was successful, false otherwise
 */
export async function deleteFile(bucketName: string, filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}

/**
 * Get a high-quality themed thumbnail URL for a specific course topic
 * @param courseTitle Title of the course
 * @param lectureTitle Optional lecture title for more specific thumbnails
 * @returns Thumbnail URL from professional educational content
 */
export function getCourseThumbnailUrl(courseTitle: string, lectureTitle?: string): string {
  // High-quality educational thumbnails
  const defaultThumbnails = [
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1000", // Tech/coding
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1000", // Programming
    "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?q=80&w=1000", // Data Science
    "https://images.unsplash.com/photo-1581092219224-9775e73d0786?q=80&w=1000", // Modern Learning
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000"  // Web development
  ];
  
  // Topic-specific thumbnails
  const topicThumbnails: Record<string, string[]> = {
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
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000",
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
  
  // Normalize input text for matching
  const normalizedCourseTitle = courseTitle?.toLowerCase() || "";
  const normalizedLectureTitle = lectureTitle?.toLowerCase() || "";
  
  // First try to match with lecture title
  for (const [topic, thumbnails] of Object.entries(topicThumbnails)) {
    if (normalizedLectureTitle.includes(topic)) {
      // Select deterministically based on the lecture title
      const hash = Array.from(lectureTitle || "").reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const index = hash % thumbnails.length;
      return thumbnails[index];
    }
  }
  
  // Then try to match with course title
  for (const [topic, thumbnails] of Object.entries(topicThumbnails)) {
    if (normalizedCourseTitle.includes(topic)) {
      // Select deterministically based on the course title
      const hash = Array.from(courseTitle || "").reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const index = hash % thumbnails.length;
      return thumbnails[index];
    }
  }
  
  // Return a default thumbnail if no matches
  const hash = Array.from(courseTitle || "default").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const index = hash % defaultThumbnails.length;
  return defaultThumbnails[index];
}

/**
 * Get a YouTube video URL for a specific course topic
 * @param courseTitle Title of the course
 * @param lectureTitle Optional lecture title for more specific videos
 * @returns YouTube embed URL
 */
export function getYouTubeVideoUrl(courseTitle: string, lectureTitle?: string): string {
  // Default programming education videos (general)
  const defaultVideos = [
    "https://www.youtube-nocookie.com/embed/PkZNo7MFNFg", // JavaScript
    "https://www.youtube-nocookie.com/embed/rfscVS0vtbw", // Python
    "https://www.youtube-nocookie.com/embed/bMknfKXIFA8", // React
    "https://www.youtube-nocookie.com/embed/1Rs2ND1ryYc", // CSS
    "https://www.youtube-nocookie.com/embed/gieEQFIfgYc"  // HTML
  ];
  
  // Topic-specific videos
  const topicVideos: Record<string, string[]> = {
    "react": [
      "https://www.youtube-nocookie.com/embed/w7ejDZ8SWv8", // React Crash Course
      "https://www.youtube-nocookie.com/embed/bMknfKXIFA8", // Full React Course
      "https://www.youtube-nocookie.com/embed/QFaFIcGhPoM", // React for Beginners
      "https://www.youtube-nocookie.com/embed/RVFAyFWO4go", // React Hooks
      "https://www.youtube-nocookie.com/embed/4UZrsTqkcW4"  // React Components
    ],
    "javascript": [
      "https://www.youtube-nocookie.com/embed/PkZNo7MFNFg", // JavaScript Full Course
      "https://www.youtube-nocookie.com/embed/W6NZfCO5SIk", // JavaScript Tutorial
      "https://www.youtube-nocookie.com/embed/jS4aFq5-91M", // JavaScript Programming
      "https://www.youtube-nocookie.com/embed/hdI2bqOjy3c", // JavaScript Crash Course
      "https://www.youtube-nocookie.com/embed/8dWL3wF_OMw"  // JavaScript Concepts
    ],
    "python": [
      "https://www.youtube-nocookie.com/embed/rfscVS0vtbw", // Python Full Course
      "https://www.youtube-nocookie.com/embed/_uQrJ0TkZlc", // Python for Beginners
      "https://www.youtube-nocookie.com/embed/Z1RJmh_OqeA", // Python Programming
      "https://www.youtube-nocookie.com/embed/kqtD5dpn9C8", // Python Tutorial
      "https://www.youtube-nocookie.com/embed/8DvywoWv6fI"  // Python for AI
    ],
    "data": [
      "https://www.youtube-nocookie.com/embed/UA-CET52dHw", // Data Structures
      "https://www.youtube-nocookie.com/embed/B31LgI4Y4DQ", // Data Science
      "https://www.youtube-nocookie.com/embed/9XoBuOoNYP4", // Data Analysis
      "https://www.youtube-nocookie.com/embed/fPq_naES_hA", // Data Visualization
      "https://www.youtube-nocookie.com/embed/5Uh6gUb2-p0"  // Big Data
    ],
    "machine learning": [
      "https://www.youtube-nocookie.com/embed/NWONeJKn6kc", // Machine Learning Tutorial
      "https://www.youtube-nocookie.com/embed/7eh4d6sabA0", // Deep Learning
      "https://www.youtube-nocookie.com/embed/i_LwzRVP7bg", // ML Fundamentals
      "https://www.youtube-nocookie.com/embed/YRnxUOmJlKQ", // AI Intro
      "https://www.youtube-nocookie.com/embed/JcI5Vnw0b2c"  // Practical ML
    ],
    "web development": [
      "https://www.youtube-nocookie.com/embed/Q33KBiDriJY", // Web Dev for Beginners
      "https://www.youtube-nocookie.com/embed/PkZNo7MFNFg", // JavaScript
      "https://www.youtube-nocookie.com/embed/gieEQFIfgYc", // HTML
      "https://www.youtube-nocookie.com/embed/1Rs2ND1ryYc", // CSS
      "https://www.youtube-nocookie.com/embed/bMknfKXIFA8"  // React
    ],
    "algorithms": [
      "https://www.youtube-nocookie.com/embed/0IAPZzGSbME", // Data Structures & Algorithms
      "https://www.youtube-nocookie.com/embed/pkkFqlG0Hds", // Sorting Algorithms
      "https://www.youtube-nocookie.com/embed/09_LlHjoEiY", // Graph Algorithms
      "https://www.youtube-nocookie.com/embed/8hly31xKli0", // Algorithm Design
      "https://www.youtube-nocookie.com/embed/HtSuA80QTyo"  // Dynamic Programming
    ]
  };
  
  // Normalize input text for matching
  const normalizedCourseTitle = courseTitle?.toLowerCase() || "";
  const normalizedLectureTitle = lectureTitle?.toLowerCase() || "";
  
  // First try to match lecture title with topics
  for (const [topic, videos] of Object.entries(topicVideos)) {
    if (normalizedLectureTitle.includes(topic)) {
      // Return a consistent video based on the lecture title's first character code
      const index = Math.abs(lectureTitle?.charCodeAt(0) || 0) % videos.length;
      return videos[index];
    }
  }
  
  // Then try to match course title with topics
  for (const [topic, videos] of Object.entries(topicVideos)) {
    if (normalizedCourseTitle.includes(topic)) {
      // Return a consistent video based on the course title's first character code
      const index = Math.abs(courseTitle?.charCodeAt(0) || 0) % videos.length;
      return videos[index];
    }
  }
  
  // Return a default video if no matches
  const index = Math.abs(courseTitle?.charCodeAt(0) || 0) % defaultVideos.length;
  return defaultVideos[index];
}

/**
 * Helper function to safely convert JSON to VideoDownloadInfo
 * @param data Any JSON data that might be a VideoDownloadInfo object
 * @returns VideoDownloadInfo object or null
 */
export function safeJsonToDownloadInfo(data: any): VideoDownloadInfo | null {
  if (!data) return null;
  
  // Check if data has the required properties to be a valid VideoDownloadInfo
  if (typeof data === 'object' && 
      'success' in data && 
      'videoId' in data && 
      'embedUrl' in data && 
      'watchUrl' in data && 
      'playerUrl' in data && 
      'downloadableUrl' in data && 
      'thumbnails' in data) {
    return data as VideoDownloadInfo;
  }
  
  return null;
}

/**
 * Processes a video to extract content analysis for a specific course
 * @param videoId ID of the video to process
 * @param courseId ID of the course the video belongs to
 * @returns Result of the operation with analyzed content
 */
export async function processVideo(videoId: string, courseId: string) {
  try {
    // Call Supabase Edge function to process video
    const { data, error } = await supabase.functions.invoke('process-video', {
      body: { videoId, courseId },
    });

    if (error) {
      console.error("Error calling process-video function:", error);
      return { 
        success: false, 
        message: error.message || "Failed to process video" 
      };
    }

    // Parse download info properly
    if (data && data.data && data.data.downloadInfo) {
      const downloadInfo = safeJsonToDownloadInfo(data.data.downloadInfo);
      data.data.downloadInfo = downloadInfo;
    }

    return { 
      success: true, 
      message: "Video processed successfully",
      data: data.data
    };
  } catch (error) {
    console.error("Error processing video:", error);
    return { 
      success: false, 
      message: error.message || "An unexpected error occurred" 
    };
  }
}

/**
 * Gets a video for a course immediately without processing
 * @param videoId ID of the video to get
 * @param courseId ID of the course the video belongs to
 * @returns Video URL and basic details
 */
export async function getVideoForCourse(videoId: string, courseId: string) {
  try {
    // First check if video already has a URL
    const { data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .maybeSingle();

    if (error) throw error;

    if (video && video.url) {
      // Video already has a URL, return it
      const downloadInfo = safeJsonToDownloadInfo(video.download_info);
      
      return {
        success: true,
        videoUrl: video.url,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        downloadInfo: downloadInfo
      };
    }

    // Video doesn't have a URL yet, process it to generate content
    const result = await processVideo(videoId, courseId);
    
    if (result.success && result.data) {
      return {
        success: true,
        videoUrl: result.data.videoUrl,
        title: result.data.title,
        description: result.data.description,
        thumbnail: result.data.thumbnail,
        downloadInfo: safeJsonToDownloadInfo(result.data.downloadInfo)
      };
    } else {
      return {
        success: false,
        message: result.message || "Failed to get video content"
      };
    }
  } catch (error) {
    console.error("Error getting video for course:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred"
    };
  }
}

/**
 * Runs the populate-courses edge function to seed the database with AI-generated courses
 * @param numberOfCourses Number of courses to generate (default: 5, max: 30)
 * @param options Additional options for course generation
 * @returns Result of the operation
 */
export async function populateCourses(numberOfCourses: number = 5, options: { specificTopic?: string } = {}): Promise<{ success: boolean; message: string }> {
  try {
    // Validate input
    const coursesToGenerate = Math.min(Math.max(1, numberOfCourses), 30);
    
    const { data, error } = await supabase.functions.invoke("populate-courses", {
      body: { 
        numberOfCourses: coursesToGenerate,
        specificTopic: options.specificTopic
      }
    });
    
    if (error) {
      throw error;
    }
    
    return { 
      success: true, 
      message: `Successfully added ${data?.coursesAdded || 0} courses to the platform.`
    };
  }
  catch (error) {
    console.error("Error populating courses:", error);
    return { 
      success: false, 
      message: error.message || "Failed to populate courses. Please try again."
    };
  }
}
