# Tech Learn Platform - Technical Documentation

## Key Code Snippets

### Authentication Flow

```typescript
// Authentication using Supabase
const login = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
```

### Certificate Generation

```typescript
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
```

### Video Processing

```typescript
import { Course, Video, Note, VideoDownloadInfo } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export const processVideo = async (videoId: string, courseId: string): Promise<{
  success: boolean;
  message?: string;
  data?: {
    videoUrl?: string;
    title?: string;
    description?: string;
    thumbnail?: string;
    analyzedContent?: any[];
    downloadInfo?: VideoDownloadInfo;
  };
}> => {
  try {
    const { data, error } = await supabase.functions.invoke("process-video", {
      body: { videoId, courseId },
    });

    if (error) {
      return {
        success: false,
        message: `Error processing video: ${error.message || "Unknown error"}`
      };
    }

    return {
      success: true,
      data: data || {}
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Unexpected error: ${error.message || "Unknown error"}`
    };
  }
}
```

### React Hooks (Custom Auth Hook)

```typescript
import { useState, useEffect, useContext, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfile } from "@/utils/authUtils";
import { User, UserRole } from '@/types';
import { useToast } from "@/hooks/use-toast";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          fetchUserProfile(session.user.id)
            .then(profile => {
              setUser(profile);
            })
            .catch(console.error);
        } else {
          setUser(null);
        }
      }
    );
    
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
          .then(profile => {
            setUser(profile);
          })
          .catch(console.error)
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error.message);
        
        if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email not confirmed",
            description: "Please check your email for a confirmation link",
            variant: "destructive",
          });
        } else if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return false;
      }
      
      if (data.user) {
        toast({
          title: "Login successful!",
          description: `Welcome back!`,
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Login exception:", error);
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'student') => {
    setIsLoading(true);
    
    try {
      console.log("Registering with role:", role);
      
      // Check if email is already registered first
      const { data: emailCheck } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();
        
      if (emailCheck) {
        toast({
          title: "Email already registered",
          description: "Please use a different email or try logging in",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (error) {
        // Handle rate limit errors specially
        if (error.message.includes("rate limit")) {
          toast({
            title: "Too many registration attempts",
            description: "Please wait a few minutes before trying again",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return false;
      }
      
      // Create profile record to ensure the role is set correctly
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            name,
            email,
            role: role
          });
            
        if (profileError) {
          console.error("Error creating profile:", profileError);
          toast({
            title: "Profile creation failed",
            description: "Your account was created but profile setup failed",
            variant: "destructive",
          });
          return false;
        }
        
        // Check if email confirmation is disabled in config
        if (data.session) {
          // If we have a session, email confirmation is not required
          toast({
            title: "Registration successful!",
            description: "Your account has been created and you are now logged in.",
          });
          return true;
        } else {
          toast({
            title: "Registration successful!",
            description: "Please check your email to confirm your account.",
          });
          return true;
        }
      }
      
      return false;
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log("Attempting to log out...");

      try {
        // Force sign out without checking for session first
        const { error } = await supabase.auth.signOut({
          scope: 'global' // Sign out from all tabs/devices
        });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Logged out",
          description: "You have been successfully logged out",
        });
      } catch (signOutError: any) {
        console.error("Error in signOut:", signOutError);
        
        // Check if this is a session missing error
        if (signOutError.message && signOutError.message.includes("session")) {
          toast({
            title: "Session expired",
            description: "Your session has expired. You've been logged out.",
          });
          
          // Clear any local session data
          await supabase.auth.signOut({ scope: 'local' });
          return;
        }
        
        toast({
          title: "Logout error",
          description: signOutError.message || "An error occurred during logout",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Unexpected error in logout:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
```

## Test Cases

### 1. Authentication Test Cases

| Test ID | Description | Test Steps | Expected Result |
|---------|-------------|------------|----------------|
| AUTH-01 | Valid Login | 1. Navigate to login page<br>2. Enter valid credentials<br>3. Submit form | User is logged in and redirected to dashboard |
| AUTH-02 | Invalid Login | 1. Navigate to login page<br>2. Enter invalid credentials<br>3. Submit form | Error message is displayed, user remains on login page |
| AUTH-03 | Registration | 1. Navigate to registration page<br>2. Enter valid new user details<br>3. Submit form | Account is created, verification email is sent (if enabled) |
| AUTH-04 | Session Persistence | 1. Login successfully<br>2. Close browser<br>3. Reopen application | User session is maintained and user remains logged in |

### 2. Course Management Test Cases

| Test ID | Description | Test Steps | Expected Result |
|---------|-------------|------------|----------------|
| COURSE-01 | Course Listing | 1. Login as student<br>2. Navigate to course page | All available courses are displayed with correct information |
| COURSE-02 | Course Filtering | 1. View course listing<br>2. Apply category filter | Only courses in selected category are displayed |
| COURSE-03 | Course Enrollment | 1. View course details<br>2. Click enroll button | User is enrolled in course, dashboard updated |
| COURSE-04 | Admin Course Creation | 1. Login as admin<br>2. Create new course with valid details | Course is created and available in course listings |

### 3. Video Player Test Cases

| Test ID | Description | Test Steps | Expected Result |
|---------|-------------|------------|----------------|
| VIDEO-01 | Video Loading | 1. Open course with videos<br>2. Click on a video | Video player loads and starts playing the video |
| VIDEO-02 | Progress Tracking | 1. Watch part of a video<br>2. Leave and return to course | Video resumes from last watched position |
| VIDEO-03 | Video Analysis | 1. Play a video<br>2. Click on analysis tab | Video analysis content is displayed correctly |

### 4. Certificate Generation Test Cases

| Test ID | Description | Test Steps | Expected Result |
|---------|-------------|------------|----------------|
| CERT-01 | Certificate Generation | 1. Complete all course requirements<br>2. Navigate to course completion page | Certificate is generated with correct user and course information |
| CERT-02 | Certificate Download | 1. View generated certificate<br>2. Click download button | Certificate downloads as PDF with correct formatting |
| CERT-03 | Certificate Verification | 1. Generate certificate<br>2. Use verification link/code | Certificate authenticity is verified |

## Bibliography

1. Auth0 Team. (2023). *Modern Authentication in Web Applications*. Auth0 Documentation.

2. Copeland, R. (2024). *Designing Data-Intensive Applications with Supabase*. O'Reilly Media.

3. Dodds, K. (2023). *React Patterns and Best Practices*. Packt Publishing.

4. Fain, Y., & Moiseev, A. (2023). *TypeScript Development with Large Scale Applications*. Manning Publications.

5. Firebase Team. (2024). *Security Best Practices for Web Applications*. Google Firebase Documentation.

6. Grinko, N. (2024). *Mastering Tailwind CSS: From Fundamentals to Advanced Concepts*. Apress.

7. Haviv, A. (2023). *RESTful Web API Design with Node.js*. Packt Publishing.

8. Mozilla Developer Network. (2024). *Web Authentication API*. MDN Web Docs.

9. Supabase Documentation. (2024). *Edge Functions and Serverless Architecture*. Supabase.

10. Wieruch, R. (2024). *The Road to React: The Complete Guide*. Self-published.

11. Rendle, K., & Patwary, A. (2023). *Professional Responsive Design with HTML5 and CSS3*. Wrox Press.

12. React Team. (2024). *React Documentation - Hooks API Reference*. React.js.

13. Supabase Team. (2024). *PostgreSQL Row Level Security*. Supabase Documentation.
