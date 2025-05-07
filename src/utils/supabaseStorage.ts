
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

// Ensure storage bucket exists (this will be called once)
const ensureBucket = async (bucketName: string) => {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  
  if (!bucketExists) {
    console.warn(`Bucket "${bucketName}" does not exist. Please create it in the Supabase dashboard.`);
  }
};

// Initialize buckets
const initStorage = () => {
  ensureBucket('course-thumbnails');
  ensureBucket('course-materials');
};

// Call this once when the app starts
initStorage();

/**
 * Upload a file to Supabase storage
 */
export async function uploadFile(
  file: File, 
  bucketName: 'course-thumbnails' | 'course-materials',
  folder: string = ''
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      throw error;
    }
    
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

/**
 * Delete a file from Supabase storage
 */
export async function deleteFile(
  filePath: string,
  bucketName: 'course-thumbnails' | 'course-materials'
): Promise<boolean> {
  try {
    // Extract just the filename from the URL
    const fileName = filePath.split('/').pop() || '';
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}
