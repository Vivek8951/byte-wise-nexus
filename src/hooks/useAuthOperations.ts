import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from '@/types';

export const useAuthOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  return { login, register, logout, isLoading };
};
