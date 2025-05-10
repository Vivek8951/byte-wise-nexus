
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import { ChatbotProvider } from "./context/ChatbotContext";
import { Toaster } from "./components/ui/toaster";
import { Button } from "./components/ui/button";
import { ArrowUp } from "lucide-react";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import AdminCourses from "./pages/AdminCourses";
import AdminUsers from "./pages/AdminUsers";
import NotFound from "./pages/NotFound";

function App() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Update the favicon dynamically to match Coursera's blue theme
  useEffect(() => {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = '/favicon.ico'; // Keep using the existing favicon
    }
    
    // Add meta theme color to match Coursera's blue
    const metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    metaThemeColor.content = '#0056D2'; // Coursera blue
    document.head.appendChild(metaThemeColor);

    // Update CSS variables to match Coursera's color scheme
    document.documentElement.style.setProperty('--tech-blue', '#0056D2');
    document.documentElement.style.setProperty('--tech-darkblue', '#00419E');
    document.documentElement.style.setProperty('--tech-purple', '#9B87F5');

    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  // Scroll to top button logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <Router>
        <AuthProvider>
          <CourseProvider>
            <ChatbotProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/admin/courses" element={<AdminCourses />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Scroll to top button */}
              {showScrollTop && (
                <Button
                  variant="outline"
                  size="icon"
                  className="fixed bottom-6 right-6 h-10 w-10 rounded-full shadow-md border bg-background/80 backdrop-blur-sm z-50 animate-fade-in hover:scale-110 transition-transform"
                  onClick={scrollToTop}
                  aria-label="Scroll to top"
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              )}
            </ChatbotProvider>
          </CourseProvider>
        </AuthProvider>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
