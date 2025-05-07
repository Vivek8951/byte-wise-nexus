
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { mockUsers } from '../data/mockData';
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<boolean>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  enrolledCourses?: string[];
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize users if not already in localStorage
    const storedUsers = localStorage.getItem('techlearn_users');
    if (!storedUsers) {
      // Convert mockUsers to StoredUsers with passwords
      const initialUsers = mockUsers.map(user => ({
        ...user,
        password: 'password' // Default password for mock users
      }));
      localStorage.setItem('techlearn_users', JSON.stringify(initialUsers));
      setUsers(initialUsers);
    } else {
      setUsers(JSON.parse(storedUsers));
    }
    
    // Check for saved user session
    const savedUser = localStorage.getItem('techlearn_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Remove password from user object before setting it in state
        const { password, ...userWithoutPassword } = parsedUser;
        setUser(userWithoutPassword);
      } catch (e) {
        localStorage.removeItem('techlearn_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simple delay to simulate backend call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = users.find(user => user.email === email && user.password === password);
    
    if (foundUser) {
      // Remove password before setting in state and localStorage
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('techlearn_user', JSON.stringify(foundUser));
      
      toast({
        title: "Login successful!",
        description: `Welcome back, ${foundUser.name}`,
      });
      
      setIsLoading(false);
      return true;
    }
    
    toast({
      title: "Login failed",
      description: "Invalid email or password",
      variant: "destructive",
    });
    
    setIsLoading(false);
    return false;
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'student') => {
    setIsLoading(true);
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
      toast({
        title: "Registration failed",
        description: "Email is already registered",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
    
    // Simple delay to simulate backend call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create new user
    const newUser: StoredUser = {
      id: `${Date.now()}`, // Generate a unique ID
      name,
      email,
      role,
      password,
      avatar: '/placeholder.svg',
      enrolledCourses: [],
    };
    
    // Add to users array and update localStorage
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('techlearn_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "Registration successful!",
      description: "You can now log in with your credentials",
    });
    
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('techlearn_user');
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
