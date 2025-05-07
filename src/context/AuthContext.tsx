
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { fetchUserProfile } from "@/utils/authUtils";
import { AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { login, logout, register, isLoading: operationLoading } = useAuthOperations();
  
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          try {
            // Use setTimeout to avoid Supabase auth deadlocks
            setTimeout(async () => {
              const profile = await fetchUserProfile(session.user.id);
              setUser(profile);
              setIsLoading(false);
            }, 0);
          } catch (error) {
            console.error("Error fetching user profile:", error);
            setUser(null);
            setIsLoading(false);
          }
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );
    
    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Initial session check:", data.session?.user?.id);
        
        if (data.session?.user) {
          const profile = await fetchUserProfile(data.session.user.id);
          setUser(profile);
        }
      } catch (error) {
        console.error("Error setting up initial auth:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const authContextValue: AuthContextType = {
    user, 
    login, 
    logout, 
    register, 
    isLoading: isLoading || operationLoading, 
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
