
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { User } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { fetchUserProfile } from "@/utils/authUtils";
import { AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { login, logout, register, isLoading: operationLoading } = useAuthOperations();
  
  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        
        if (!mounted) return;
        
        // Always update session state
        setSession(currentSession);
        
        if (currentSession?.user) {
          try {
            // When we have a session and user, get their profile
            const profile = await fetchUserProfile(currentSession.user.id);
            if (mounted) {
              setUser(profile);
              setIsLoading(false);
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
            if (mounted) setIsLoading(false);
          }
        } else {
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
        }
      }
    );
    
    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Initial session check:", data.session?.user?.id);
        
        if (!mounted) return;
        
        setSession(data.session);
        
        if (data.session?.user) {
          const profile = await fetchUserProfile(data.session.user.id);
          if (mounted) setUser(profile);
        }
      } catch (error) {
        console.error("Error setting up initial auth:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      mounted = false;
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
