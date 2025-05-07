
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
