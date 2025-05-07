
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
