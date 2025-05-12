
import { Link } from "react-router-dom";
import { Book, Github, Twitter, Linkedin, Facebook, Instagram } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-[#0056D2] hover:scale-105 transition-transform duration-300 mb-4">
              <Book className="h-6 w-6" />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TechLearn</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-md">
              The modern platform for computer science education, providing high-quality 
              courses for students and professionals. Our mission is to make tech education 
              accessible, engaging, and effective for everyone.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:scale-110 transform duration-300"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:scale-110 transform duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:scale-110 transform duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:scale-110 transform duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:scale-110 transform duration-300"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors animated-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-muted-foreground hover:text-foreground transition-colors animated-link">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors animated-link">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors animated-link">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Categories</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/courses?category=algorithms" className="text-muted-foreground hover:text-foreground transition-colors animated-link">
                  Data Structures & Algorithms
                </Link>
              </li>
              <li>
                <Link to="/courses?category=systems" className="text-muted-foreground hover:text-foreground transition-colors animated-link">
                  Operating Systems
                </Link>
              </li>
              <li>
                <Link to="/courses?category=databases" className="text-muted-foreground hover:text-foreground transition-colors animated-link">
                  Database Management
                </Link>
              </li>
              <li>
                <Link to="/courses?category=networking" className="text-muted-foreground hover:text-foreground transition-colors animated-link">
                  Networking
                </Link>
              </li>
              <li>
                <Link to="/courses?category=ai" className="text-muted-foreground hover:text-foreground transition-colors animated-link">
                  Artificial Intelligence
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} TechLearn. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <Link to="#" className="hover:text-foreground transition-colors animated-link">
                Privacy Policy
              </Link>
              <Link to="#" className="hover:text-foreground transition-colors animated-link">
                Terms of Service
              </Link>
              <Link to="#" className="hover:text-foreground transition-colors animated-link">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
