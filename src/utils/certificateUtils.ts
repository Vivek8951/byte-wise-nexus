
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
    
    // Store certificate data in the database using RPC or direct insert
    try {
      // Direct insert instead of using upsert on a table that might not exist in the types
      const { error: certificateError } = await supabase.rpc('create_certificates_table');
      
      if (certificateError) {
        console.error("Failed to ensure certificates table exists:", certificateError);
      }
      
      // Using raw query syntax to insert
      const { error: insertError } = await supabase.from('certificates').insert({
        id: certificateId,
        user_id: userId,
        course_id: courseId,
        issue_date: new Date().toISOString(),
        certificate_data: certificateData
      });
      
      if (insertError) {
        console.error("Failed to store certificate data:", insertError);
      }
    } catch (error) {
      console.error("Error storing certificate:", error);
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
    // Call the RPC function to get certificates
    const { data, error } = await supabase.rpc('get_user_certificates', {
      p_user_id: userId
    });
    
    if (error) throw error;
    
    // Find the certificate for this course
    const certificate = Array.isArray(data) ? data.find((cert: any) => cert.course_id === courseId) : null;
    
    return certificate && certificate.certificate_data ? certificate.certificate_data as CertificateData : null;
  } catch (error) {
    console.error("Error fetching certificate:", error);
    return null;
  }
};
