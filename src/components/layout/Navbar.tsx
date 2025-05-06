
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, X, Book, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
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
          
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-tech-blue">
            <Book className="h-6 w-6" />
            <span>TechLearn</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/" className="font-medium transition-colors hover:text-tech-blue">Home</Link>
          <Link to="/courses" className="font-medium transition-colors hover:text-tech-blue">Courses</Link>
          {user && <Link to="/dashboard" className="font-medium transition-colors hover:text-tech-blue">Dashboard</Link>}
          {user?.role === 'admin' && (
            <Link to="/admin" className="font-medium transition-colors hover:text-tech-blue">Admin</Link>
          )}
        </nav>
        
        <div className="flex items-center gap-4">
          {!isSearchOpen ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
              <ThemeToggle />
              
              {user ? (
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                  </Button>
                  <Link to="/dashboard">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tech-purple text-white">
                      {user.name.charAt(0)}
                    </div>
                  </Link>
                  <Button variant="ghost" onClick={logout} className="hidden md:inline-flex">Logout</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link to="/register" className="hidden md:inline-flex">
                    <Button>Sign Up</Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
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
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto bg-background p-6 pb-32 shadow-md animate-in slide-in-from-top md:hidden">
          <nav className="flex flex-col gap-6 text-lg">
            <Link 
              to="/" 
              className="flex items-center gap-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/courses" 
              className="flex items-center gap-2 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Courses
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}
            {user ? (
              <Button variant="outline" onClick={() => { logout(); setIsMenuOpen(false); }}>
                Logout
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
