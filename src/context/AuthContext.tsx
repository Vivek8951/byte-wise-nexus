
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User, UserRole } from '../types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Fetch and set user data from Supabase
  const fetchUserProfile = async (userId: string) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      if (!data) return null;
      
      // Fetch enrolled courses
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('course_id')
        .eq('user_id', userId);
      
      const enrolledCourses = enrollments?.map(enrollment => enrollment.course_id) || [];
      
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        avatar: data.avatar,
        enrolledCourses
      };
    } catch (err) {
      console.error("Error in fetchUserProfile:", err);
      return null;
    }
  };
  
  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        
        if (!isMounted) return;
        
        // Always update session state
        setSession(currentSession);
        
        if (currentSession?.user) {
          // When we have a session and user, get their profile
          // Use setTimeout to prevent recursion issues
          setTimeout(async () => {
            if (!isMounted) return;
            
            const profile = await fetchUserProfile(currentSession.user.id);
            setUser(profile);
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );
    
    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Initial session check:", data.session?.user?.id);
        
        if (!isMounted) return;
        
        setSession(data.session);
        
        if (data.session?.user) {
          const profile = await fetchUserProfile(data.session.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error("Error setting up initial auth:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
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
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
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
      }
      
      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      });
      
      return true;
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
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
      return;
    }
    
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const authContextValue: AuthContextType = {
    user, 
    login, 
    logout, 
    register, 
    isLoading, 
    isAuthenticated: !!user 
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
