
import { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from '@/hooks/useAuthOperations';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null; // Updated to allow null
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
    
    async function initializeAuth() {
      if (!mounted) return;
      setIsLoading(true);
      
      try {
        // First, set up the auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state changed:", event);
            
            if (session && session.user) {
              try {
                // Get the user's profile
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .maybeSingle();
                
                if (mounted) {
                  if (profile) {
                    // Make sure to cast role as UserRole
                    const userRole = profile.role as UserRole;
                    
                    setUser({
                      id: session.user.id,
                      name: profile.name || session.user.email?.split('@')[0] || '',
                      email: profile.email || session.user.email || '',
                      role: userRole,
                      avatar: profile.avatar || null // Updated to handle null
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
                      avatar: null // Set default avatar to null
                    });
                  }
                  setIsLoading(false);
                }
              } catch (error) {
                console.error("Error fetching user profile:", error);
                if (mounted) {
                  setUser(null);
                  setIsLoading(false);
                }
              }
            } else {
              if (mounted) {
                setUser(null);
                setIsLoading(false);
              }
            }
          }
        );
        
        // Then check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user && mounted) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            
            if (mounted) {
              if (profile) {
                // Make sure to cast role as UserRole
                const userRole = profile.role as UserRole;
                
                setUser({
                  id: session.user.id,
                  name: profile.name || session.user.email?.split('@')[0] || '',
                  email: profile.email || session.user.email || '',
                  role: userRole,
                  avatar: profile.avatar || null // Updated to handle null
                });
              } else {
                const userRole = (session.user.user_metadata?.role as UserRole) || 'student';
                
                setUser({
                  id: session.user.id,
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
                  email: session.user.email || '',
                  role: userRole,
                  avatar: null // Set default avatar to null
                });
              }
              setIsLoading(false);
            }
          } catch (error) {
            console.error("Error fetching user profile during initialization:", error);
            if (mounted) {
              setUser(null);
              setIsLoading(false);
            }
          }
        } else {
          if (mounted) {
            setIsLoading(false);
          }
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
