
import { Link } from "react-router-dom";
import { Book, Github, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-tech-blue">
              <Book className="h-6 w-6" />
              <span>TechLearn</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              The modern platform for computer science education, providing high-quality 
              courses for students and professionals.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-muted-foreground hover:text-foreground transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/courses?category=algorithms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Data Structures & Algorithms
                </Link>
              </li>
              <li>
                <Link to="/courses?category=systems" className="text-muted-foreground hover:text-foreground transition-colors">
                  Operating Systems
                </Link>
              </li>
              <li>
                <Link to="/courses?category=databases" className="text-muted-foreground hover:text-foreground transition-colors">
                  Database Management
                </Link>
              </li>
              <li>
                <Link to="/courses?category=networking" className="text-muted-foreground hover:text-foreground transition-colors">
                  Networking
                </Link>
              </li>
              <li>
                <Link to="/courses?category=ai" className="text-muted-foreground hover:text-foreground transition-colors">
                  Artificial Intelligence
                </Link>
              </li>
              <li>
                <Link to="/courses?category=web" className="text-muted-foreground hover:text-foreground transition-colors">
                  Web Development
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="#" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                  <span>Twitter</span>
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t pt-8">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {currentYear} TechLearn. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
