
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User, UserRole } from '@/types';

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>;
  isLoading: boolean;
  isAuthenticated: boolean;
}
