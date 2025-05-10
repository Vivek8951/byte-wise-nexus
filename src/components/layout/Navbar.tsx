
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Search, X, Book, Bell, ChevronDown, LogOut, User as UserIcon, Settings, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
      className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
        scrolled ? 'glass-effect' : 'bg-background dark:bg-background'
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
            className="flex items-center gap-2 font-bold text-xl text-[#0056D2] hover-scale"
          >
            <Book className="h-6 w-6" />
            <span>TechLearn</span>
          </Link>
          
          <div className="hidden md:flex items-center ml-6 space-x-1">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={isActivePath("/") ? "secondary" : "ghost"} 
                    className="text-sm font-medium rounded-full"
                    onClick={() => navigate("/")}
                  >
                    Home
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Back to home page</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium rounded-full">
                  Explore <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuLabel>Course Categories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/courses?category=algorithms")}>
                  Data Structures & Algorithms
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/courses?category=systems")}>
                  Operating Systems
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/courses?category=databases")}>
                  Database Management
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/courses?category=networking")}>
                  Networking
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/courses?category=ai")}>
                  Artificial Intelligence
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/courses?category=web")}>
                  Web Development
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant={isActivePath("/courses") ? "secondary" : "ghost"} 
              className="text-sm font-medium rounded-full"
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
                <div className="flex items-center gap-3">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover-scale relative">
                          <Bell className="h-5 w-5" />
                          <span className="sr-only">Notifications</span>
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">3</span>
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
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0056D2] text-white hover:bg-[#004ebd] hover-scale"
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <span className="font-normal text-sm text-muted-foreground">Signed in as</span>
                        <span className="font-medium">{user.name}</span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={goToDashboard} className="flex items-center gap-2 cursor-pointer">
                        {user.role === 'admin' ? <Layers className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                        <span>{user.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout} 
                        disabled={isLoading}
                        className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer"
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
                    <Button variant="ghost" className="hover-scale rounded-full">Login</Button>
                  </Link>
                  <Link to="/register" className="hidden md:inline-flex">
                    <Button className="bg-[#0056D2] hover:bg-[#003d96] hover-scale text-white rounded-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 animate-fade-in">
              <Input 
                type="search" 
                placeholder="Search courses..." 
                className="w-[200px] md:w-[300px] rounded-full"
                autoFocus
              />
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsSearchOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Menu - with simplified navigation */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto bg-white dark:bg-gray-900 p-6 pb-32 shadow-md animate-in slide-in-from-top md:hidden">
          <nav className="flex flex-col gap-6 text-lg">
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start">Home</Button>
            </Link>
            <Link to="/courses">
              <Button variant="ghost" className="w-full justify-start">All Courses</Button>
            </Link>
            {user && (
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={goToDashboard}
              >
                My Learning
              </Button>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin/courses">
                <Button variant="ghost" className="w-full justify-start">
                  Manage Courses
                </Button>
              </Link>
            )}
            {user ? (
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-red-100 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950 dark:hover:text-red-400"
                onClick={handleLogout}
                disabled={isLoading}
              >
                <LogOut className="h-4 w-4" />
                {isLoading ? 'Logging out...' : 'Logout'}
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login">
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="w-full bg-[#0056D2] hover:bg-[#003d96] text-white">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
