
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, X, Book, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      await logout();
      // Close mobile menu if open
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
      navigate('/');
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  // Function to navigate to appropriate dashboard based on user role
  const goToDashboard = () => {
    if (user?.role === 'admin') {
      navigate('/admin/courses');
    } else {
      navigate('/dashboard');
    }
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <Link 
            to={user ? (user.role === 'admin' ? "/admin/courses" : "/dashboard") : "/"}
            className="flex items-center gap-2 font-bold text-xl text-tech-blue hover-scale"
          >
            <Book className="h-6 w-6" />
            <span>TechLearn</span>
          </Link>
        </div>
        
        {/* Empty middle section - no navigation links */}
        <div className="flex-1 md:flex"></div>
        
        <div className="flex items-center gap-4">
          {!isSearchOpen ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover-scale"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
              <ThemeToggle />
              
              {user ? (
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="rounded-full hover-scale">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                  </Button>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-tech-purple text-white hover-scale"
                    onClick={goToDashboard}
                  >
                    {user.name.charAt(0)}
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="hidden md:inline-flex hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors"
                  >
                    {isLoading ? 'Logging out...' : 'Logout'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" className="hover-scale">Login</Button>
                  </Link>
                  <Link to="/register" className="hidden md:inline-flex">
                    <Button className="bg-tech-blue hover:bg-tech-darkblue hover-scale">Sign Up</Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 animate-fade-in">
              <Input 
                type="search" 
                placeholder="Search courses..." 
                className="w-[200px] md:w-[300px]"
                autoFocus
              />
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Menu - with simplified navigation */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto bg-background p-6 pb-32 shadow-md animate-in slide-in-from-top md:hidden">
          <nav className="flex flex-col gap-6 text-lg">
            {user?.role === 'admin' && (
              <Link 
                to="/admin/courses" 
                className="flex items-center gap-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Manage Courses
              </Link>
            )}
            {user ? (
              <Button 
                variant="outline" 
                className="hover:bg-red-100 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950 dark:hover:text-red-400"
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? 'Logging out...' : 'Logout'}
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-tech-blue hover:bg-tech-darkblue">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
