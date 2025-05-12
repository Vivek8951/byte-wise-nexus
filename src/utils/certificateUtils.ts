
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { CourseEnrollment, User } from "@/types";
import { toast } from "@/components/ui/sonner";

interface CertificateData {
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  completionDate: string;
  certificateId: string;
}

export const generateCertificate = async (
  userId: string,
  courseId: string,
): Promise<CertificateData | null> => {
  try {
    // Fetch user details
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Fetch course details
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single();
    
    if (courseError) throw courseError;
    
    // Generate a unique certificate ID
    const certificateId = `CERT-${userId.substring(0, 4)}-${courseId.substring(0, 4)}-${Date.now().toString(36)}`;
    
    // Create completion date in readable format
    const completionDate = format(new Date(), "MMMM dd, yyyy");
    
    // Create certificate data
    const certificateData: CertificateData = {
      userId,
      userName: userData.name,
      courseId,
      courseTitle: courseData.title,
      completionDate,
      certificateId,
    };
    
    // Update the enrollment record to mark certificate as issued
    const { error: updateError } = await supabase
      .from('course_enrollments')
      .update({ 
        is_completed: true,
        certificate_issued: true 
      })
      .eq('user_id', userId)
      .eq('course_id', courseId);
    
    if (updateError) throw updateError;
    
    // Store certificate data in the database
    // We're using upsert in case the certificate already exists
    const { error: certificateError } = await supabase
      .from('certificates')
      .upsert({
        id: certificateId,
        user_id: userId,
        course_id: courseId,
        issue_date: new Date().toISOString(),
        certificate_data: certificateData
      });
    
    if (certificateError) {
      console.error("Failed to store certificate data:", certificateError);
      // Continue anyway as the enrollment is already marked
    }
    
    return certificateData;
  } catch (error) {
    console.error("Error generating certificate:", error);
    toast.error("Failed to generate certificate. Please try again.");
    return null;
  }
};

export const getCertificate = async (
  userId: string,
  courseId: string
): Promise<CertificateData | null> => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('certificate_data')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();
    
    if (error) throw error;
    
    return data?.certificate_data;
  } catch (error) {
    console.error("Error fetching certificate:", error);
    return null;
  }
};
