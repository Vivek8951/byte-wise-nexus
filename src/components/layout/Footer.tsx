
import { Link } from "react-router-dom";
import { Book, Github, Twitter, Linkedin, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-slate-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter Section */}
        <div className="mb-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-8 rounded-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Stay Updated with TechLearn</h3>
              <p className="text-muted-foreground max-w-md">
                Subscribe to our newsletter for the latest course updates, tech news, and special offers.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="md:w-[300px]" 
              />
              <Button className="bg-[#0056D2] hover:bg-[#003d96] text-white">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-[#0056D2] mb-4">
              <Book className="h-6 w-6" />
              <span>TechLearn</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-md">
              The modern platform for computer science education, providing high-quality 
              courses for students and professionals. Our mission is to make tech education 
              accessible, engaging, and effective for everyone.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
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
            <h3 className="text-lg font-bold mb-4">Categories</h3>
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
          
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>123 Education St, San Francisco, CA 94103</span>
              </li>
              <li>
                <a 
                  href="mailto:info@techlearn.com" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>info@techlearn.com</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:+11234567890" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>+1 (123) 456-7890</span>
                </a>
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
              <Link to="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link to="#" className="hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
