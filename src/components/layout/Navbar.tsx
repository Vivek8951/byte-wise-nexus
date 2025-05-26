
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  BookOpen, 
  Users,
  BarChart3,
  GraduationCap,
  Home
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold text-primary hover:text-primary/90 transition-colors"
          >
            <GraduationCap className="h-8 w-8" />
            <span>TechLearn</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/courses" 
              className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Browse Courses
            </Link>
            <Link 
              to="/about" 
              className="text-foreground hover:text-primary transition-colors"
            >
              About
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                
                {user?.role === 'admin' && (
                  <>
                    <Link 
                      to="/admin/courses" 
                      className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      Courses
                    </Link>
                    <Link 
                      to="/admin/users" 
                      className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Users
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {user.role} Account
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/admin/courses")}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>Manage Courses</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/admin/users")}>
                        <Users className="mr-2 h-4 w-4" />
                        <span>Manage Users</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
              <Link
                to="/courses"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Courses
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  {user?.role === 'admin' && (
                    <>
                      <Link
                        to="/admin/courses"
                        className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Courses
                      </Link>
                      <Link
                        to="/admin/users"
                        className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Users
                      </Link>
                    </>
                  )}
                </>
              )}
              
              {isAuthenticated && user ? (
                <div className="border-t border-border pt-4 pb-3">
                  <div className="flex items-center px-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <div className="text-base font-medium text-foreground">
                        {user.name || "User"}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/dashboard");
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-border pt-4 pb-3 space-y-2 px-3">
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
