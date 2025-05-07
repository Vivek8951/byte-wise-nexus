
import { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import { useAuthOperations } from '@/hooks/useAuthOperations';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
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
    async function initializeAuth() {
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
                  .single();
                
                if (profile) {
                  setUser({
                    id: session.user.id,
                    name: profile.name || session.user.email?.split('@')[0] || '',
                    email: profile.email || session.user.email || '',
                    role: profile.role || 'student',
                    avatar: profile.avatar_url
                  });
                } else {
                  console.log("No profile found for user", session.user.id);
                  // Use basic user data from auth if profile not found
                  setUser({
                    id: session.user.id,
                    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
                    email: session.user.email || '',
                    role: session.user.user_metadata?.role || 'student'
                  });
                }
              } catch (error) {
                console.error("Error fetching user profile:", error);
                setUser(null);
              }
            } else {
              setUser(null);
            }
          }
        );
        
        // Then check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profile) {
              setUser({
                id: session.user.id,
                name: profile.name || session.user.email?.split('@')[0] || '',
                email: profile.email || session.user.email || '',
                role: profile.role || 'student',
                avatar: profile.avatar_url
              });
            } else {
              setUser({
                id: session.user.id,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
                email: session.user.email || '',
                role: session.user.user_metadata?.role || 'student'
              });
            }
          } catch (error) {
            console.error("Error fetching user profile during initialization:", error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    initializeAuth();
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
