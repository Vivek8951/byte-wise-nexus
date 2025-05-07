import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads a file to Supabase Storage
 * @param file File to upload
 * @param bucketName Storage bucket name
 * @param filePath Path where the file will be stored
 * @returns URL of the uploaded file, or null if upload failed
 */
export async function uploadFile(file: File, bucketName: string, filePath: string): Promise<string | null> {
  try {
    // Create bucket if it doesn't exist (will be no-op if bucket exists)
    const { error: bucketError } = await supabase.storage.createBucket(
      bucketName, 
      { public: true }
    );
    
    if (bucketError && bucketError.message !== 'Bucket already exists') {
      throw bucketError;
    }
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      throw error;
    }
    
    // Get public URL for the file
    const { data: urlData } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
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
    "css": [
      "https://www.youtube-nocookie.com/embed/1Rs2ND1ryYc", // CSS Tutorial
      "https://www.youtube-nocookie.com/embed/yfoY53QXEnI", // CSS Crash Course
      "https://www.youtube-nocookie.com/embed/OXGznpKZ_sA", // CSS Full Course
      "https://www.youtube-nocookie.com/embed/1PnVor36_40", // CSS Tutorial
      "https://www.youtube-nocookie.com/embed/Edsxf_NBFrw"  // CSS Layout
    ],
    "html": [
      "https://www.youtube-nocookie.com/embed/gieEQFIfgYc", // HTML Full Course
      "https://www.youtube-nocookie.com/embed/pQN-pnXPaVg", // HTML Tutorial
      "https://www.youtube-nocookie.com/embed/UB1O30fR-EE", // HTML Crash Course
      "https://www.youtube-nocookie.com/embed/FNGoExJlLQY", // HTML for Beginners
      "https://www.youtube-nocookie.com/embed/916GWv2Qs08"  // HTML5
    ],
    "web development": [
      "https://www.youtube-nocookie.com/embed/Q33KBiDriJY", // Web Dev for Beginners
      "https://www.youtube-nocookie.com/embed/PkZNo7MFNFg", // JavaScript
      "https://www.youtube-nocookie.com/embed/gieEQFIfgYc", // HTML
      "https://www.youtube-nocookie.com/embed/1Rs2ND1ryYc", // CSS
      "https://www.youtube-nocookie.com/embed/bMknfKXIFA8"  // React
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
 * Runs the populate-courses edge function to seed the database with AI-generated courses
 * @param numberOfCourses Number of courses to generate (default: 1, max: 30)
 * @returns Result of the operation
 */
export async function populateCourses(numberOfCourses: number = 1): Promise<{ success: boolean; message: string }> {
  try {
    // Validate input
    const coursesToGenerate = Math.min(Math.max(1, numberOfCourses), 30);
    
    const { data, error } = await supabase.functions.invoke("populate-courses", {
      body: { numberOfCourses: coursesToGenerate }
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

/**
 * Processes a video to extract content analysis for a specific course
 * @param videoId ID of the video to process
 * @param courseId ID of the course the video belongs to
 * @returns Result of the operation with analyzed content
 */
export async function processVideo(videoId: string, courseId: string): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    console.log(`Processing video ${videoId} for course ${courseId}`);
    const { data, error } = await supabase.functions.invoke("process-video", {
      body: { videoId, courseId }
    });
    
    if (error) {
      console.error("Error from edge function:", error);
      throw error;
    }
    
    if (data.status === "error") {
      console.error("Error processing video:", data.message);
      throw new Error(data.message || "Failed to process video");
    }
    
    console.log("Video processed successfully:", data);
    
    return {
      success: true,
      message: "Video processed successfully",
      data: {
        analyzedContent: data.analyzedContent,
        videoUrl: data.videoUrl,
        title: data.title,
        description: data.description
      }
    };
  } catch (error) {
    console.error("Error processing video:", error);
    return {
      success: false,
      message: error.message || "Failed to process video. Please try again."
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
    // First check if we already have a valid video URL
    const { data: existingVideo, error: videoError } = await supabase
      .from('videos')
      .select('url, title, description, thumbnail, download_info')
      .eq('id', videoId)
      .maybeSingle();
      
    if (videoError) {
      console.error('Error fetching video:', videoError);
      return { success: false, message: 'Error fetching video' };
    }
    
    if (existingVideo?.url) {
      return { 
        success: true, 
        videoUrl: existingVideo.url,
        title: existingVideo.title,
        description: existingVideo.description,
        thumbnail: existingVideo.thumbnail,
        downloadInfo: existingVideo.download_info
      };
    }
    
    // If no URL exists, process the video through the Edge Function
    const result = await processVideo(videoId, courseId);
    if (result.success && result.data && result.data.videoUrl) {
      return {
        success: true,
        videoUrl: result.data.videoUrl,
        title: result.data.title,
        description: result.data.description,
        thumbnail: result.data.thumbnail,
        downloadInfo: result.data.downloadInfo
      };
    } else {
      return { success: false, message: result.message || 'Failed to get video' };
    }
  } catch (error) {
    console.error('Error in getVideoForCourse:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}
