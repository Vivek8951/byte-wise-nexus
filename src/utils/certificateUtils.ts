
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { CourseEnrollment, User } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { Json } from "@/integrations/supabase/types";

export interface CertificateData {
  userId: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  completionDate: string;
  certificateId: string;
  appName?: string;
}

export const generateCertificate = async (
  userId: string,
  courseId: string,
  appName: string = "Tech Learn"
): Promise<CertificateData | null> => {
  try {
    console.log("Generating certificate for user:", userId, "course:", courseId);
    
    // Check if certificate already exists
    const existingCert = await getCertificate(userId, courseId);
    if (existingCert) {
      console.log("Certificate already exists, returning:", existingCert);
      return {
        ...existingCert,
        appName: "Tech Learn" // Ensure app name is always correct
      };
    }
    
    // Fetch user details
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error("Error fetching user data:", userError);
      throw userError;
    }
    
    if (!userData || !userData.name) {
      console.error("User data or name not found");
      throw new Error("User data not found");
    }
    
    // Fetch course details
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single();
    
    if (courseError) {
      console.error("Error fetching course data:", courseError);
      throw courseError;
    }
    
    if (!courseData || !courseData.title) {
      console.error("Course data or title not found");
      throw new Error("Course data not found");
    }
    
    // Generate a unique certificate ID
    const certificateId = `CERT-${userId.substring(0, 4)}-${courseId.substring(0, 4)}-${Date.now().toString(36)}`;
    
    // Create completion date in readable format - use current date
    const completionDate = format(new Date(), "MMMM dd, yyyy");
    
    // Create certificate data
    const certificateData: CertificateData = {
      userId,
      userName: userData.name,
      courseId,
      courseTitle: courseData.title,
      completionDate,
      certificateId,
      appName: "Tech Learn" // Always use "Tech Learn"
    };
    
    console.log("Created certificate data:", certificateData);
    
    // Update the enrollment record to mark certificate as issued
    const { error: updateError } = await supabase
      .from('course_enrollments')
      .update({ 
        is_completed: true,
        certificate_issued: true 
      })
      .eq('user_id', userId)
      .eq('course_id', courseId);
    
    if (updateError) {
      console.error("Error updating enrollment:", updateError);
      // Continue anyway to try to store the certificate
    }
    
    // Store certificate data in the database
    try {
      const { error: insertError } = await supabase.from('certificates').insert({
        id: certificateId,
        user_id: userId,
        course_id: courseId,
        issue_date: new Date().toISOString(),
        certificate_data: certificateData as unknown as Json
      });
      
      if (insertError) {
        console.error("Failed to store certificate data:", insertError);
        // Continue anyway as we can still return the certificate data
      }
    } catch (error) {
      console.error("Error storing certificate:", error);
      // Continue anyway as we can still return the certificate data
    }
    
    return certificateData;
  } catch (error) {
    console.error("Error generating certificate:", error);
    toast({
      title: "Error",
      description: "Failed to generate certificate. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};

export const getCertificate = async (
  userId: string,
  courseId: string
): Promise<CertificateData | null> => {
  try {
    console.log("Getting certificate for user:", userId, "course:", courseId);
    
    // Query the certificates table directly
    const { data, error } = await supabase
      .from('certificates')
      .select('certificate_data, id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching certificate:", error);
      throw error;
    }
    
    // Return certificate data if it exists, ensuring app name is correct
    if (data && data.certificate_data) {
      const certData = data.certificate_data as unknown as CertificateData;
      certData.appName = "Tech Learn"; // Ensure app name is always correct
      console.log("Found certificate:", certData);
      return certData;
    }
    
    console.log("No certificate found");
    return null;
  } catch (error) {
    console.error("Error fetching certificate:", error);
    return null;
  }
};
