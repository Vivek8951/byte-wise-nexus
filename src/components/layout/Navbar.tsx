
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Bell, ChevronDown, LogOut, User as UserIcon, Settings, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Handle scroll for navbar glass effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  const handleLogout = async () => {
    try {
      await logout();
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
      navigate('/');
      toast({
        title: "Logged out successfully",
        description: "Hope to see you again soon!",
      });
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

  // Active link styles
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <header 
      className={`sticky top-0 z-40 w-full border-b transition-all duration-500 ${
        scrolled ? 'bg-background/80 backdrop-blur-lg shadow-md' : 'bg-background'
      }`}
    >
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
            className="flex items-center gap-2 font-bold text-xl text-[#0056D2] hover:scale-105 transition-transform duration-300"
          >
            <Layers className="h-6 w-6 animate-pulse" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TechLearn</span>
          </Link>
          
          <div className="hidden md:flex items-center ml-6 space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium rounded-full group">
                  Explore 
                  <ChevronDown className="ml-1 h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 animate-in fade-in-80 zoom-in-95">
                <DropdownMenuLabel>Course Categories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/courses?category=algorithms")} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Data Structures & Algorithms
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/courses?category=systems")} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Operating Systems
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/courses?category=databases")} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Database Management
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/courses?category=networking")} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Networking
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/courses?category=ai")} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Artificial Intelligence
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/courses?category=web")} className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Web Development
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant={isActivePath("/courses") ? "secondary" : "ghost"} 
              className="text-sm font-medium rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => navigate("/courses")}
            >
              All Courses
            </Button>

            {user && (
              <Button 
                variant={isActivePath("/dashboard") || isActivePath("/admin/courses") ? "secondary" : "ghost"} 
                className="text-sm font-medium rounded-full"
                onClick={goToDashboard}
              >
                My Learning
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {user ? (
            <div className="flex items-center gap-3">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:scale-110 transition-transform duration-300 relative"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="sr-only">Notifications</span>
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-pulse">3</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 hover:scale-110 transition-all duration-300"
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 animate-in slide-in-from-top-5">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <span className="font-normal text-sm text-muted-foreground">Signed in as</span>
                    <span className="font-medium">{user.name}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={goToDashboard} className="flex items-center gap-2 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                    {user.role === 'admin' ? <Layers className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                    <span>{user.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    disabled={isLoading}
                    className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer transition-colors hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{isLoading ? 'Logging out...' : 'Log out'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" className="hover:scale-105 transition-transform duration-300 rounded-full">Login</Button>
              </Link>
              <Link to="/register" className="hidden md:inline-flex">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 text-white rounded-full shadow-md hover:shadow-lg">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Menu - with simplified navigation */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto bg-white dark:bg-gray-900 p-6 pb-32 shadow-xl animate-in slide-in-from-top-5 md:hidden">
          <nav className="flex flex-col gap-6 text-lg">
            <Link to="/courses">
              <Button variant="ghost" className="w-full justify-start hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">All Courses</Button>
            </Link>
            {user && (
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={goToDashboard}
              >
                My Learning
              </Button>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin/courses">
                <Button variant="ghost" className="w-full justify-start hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Manage Courses
                </Button>
              </Link>
            )}
            {user ? (
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-red-100 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950 dark:hover:text-red-400 transition-all"
                onClick={handleLogout}
                disabled={isLoading}
              >
                <LogOut className="h-4 w-4" />
                {isLoading ? 'Logging out...' : 'Logout'}
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login">
                  <Button variant="outline" className="w-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-colors">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
