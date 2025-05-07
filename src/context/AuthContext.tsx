
import { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from '@/hooks/useAuthOperations';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const authOperations = useAuthOperations();
  
  // Initialize auth state from Supabase
  useEffect(() => {
    let mounted = true;
    
    // Define outside the async function to avoid race conditions
    const handleAuthChange = async (session: any) => {
      if (!mounted || !session?.user) {
        return;
      }
      
      try {
        // Get the user's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (!mounted) return;
        
        if (profile) {
          // Make sure to cast role as UserRole
          const userRole = profile.role as UserRole;
          
          setUser({
            id: session.user.id,
            name: profile.name || session.user.email?.split('@')[0] || '',
            email: profile.email || session.user.email || '',
            role: userRole,
            avatar: profile.avatar || null
          });
        } else {
          console.log("No profile found for user", session.user.id);
          // Use basic user data from auth if profile not found
          const userRole = (session.user.user_metadata?.role as UserRole) || 'student';
          
          setUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
            email: session.user.email || '',
            role: userRole,
            avatar: null
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (mounted) {
          setUser(null);
        }
      }
    };
    
    async function initializeAuth() {
      if (!mounted) return;
      
      try {
        // First, get existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await handleAuthChange(session);
        } else {
          setUser(null);
        }
        
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("Auth state changed:", event);
            
            if (newSession) {
              await handleAuthChange(newSession);
            } else {
              if (mounted) {
                setUser(null);
              }
            }
            
            // Always set loading to false after handling auth state change
            if (mounted) {
              setIsLoading(false);
            }
          }
        );
        
        // Always set loading to false after initialization
        if (mounted) {
          setIsLoading(false);
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    }
    
    initializeAuth();
    
    return () => {
      mounted = false;
    };
  }, []);
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading: isLoading || authOperations.isLoading,
        login: authOperations.login,
        logout: authOperations.logout,
        register: authOperations.register
      }}
    >
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
