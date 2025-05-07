
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
  };
  
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        setIsLoading(true);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Use setTimeout to prevent recursion issues
          setTimeout(async () => {
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
      const { data } = await supabase.auth.getSession();
      console.log("Initial session check:", data.session?.user?.id);
      setSession(data.session);
      
      if (data.session?.user) {
        try {
          const profile = await fetchUserProfile(data.session.user.id);
          setUser(profile);
        } catch (error) {
          console.error("Error setting up initial auth:", error);
        }
      }
      
      setIsLoading(false);
    };
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Session is automatically handled by onAuthStateChange
        toast({
          title: "Login successful!",
          description: `Welcome back!`,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      // Let the error propagate up to the component
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'student') => {
    setIsLoading(true);
    
    try {
      // Make sure role is properly set
      console.log("Registering with role:", role);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role // This will be stored in user metadata
          }
        }
      });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
      
      // Important: Even if signUp succeeds, we now need to explicitly create
      // a profile record to ensure the role is set correctly
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            name,
            email,
            role: role // Make sure role is explicitly set here
          });
            
        if (profileError) {
          console.error("Error creating profile:", profileError);
          toast({
            title: "Profile creation failed",
            description: "Your account was created but profile setup failed",
            variant: "destructive",
          });
        }
      }
      
      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      });
      
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
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

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      isLoading, 
      isAuthenticated: !!user 
    }}>
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
