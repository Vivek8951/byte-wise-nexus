
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BookOpen, Book, ChevronRight, FileText,
  Users, Plus, BarChart as BarChartIcon, 
  Play, Award, Clock, Settings
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useCourses } from "@/context/CourseContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackButton } from "@/components/ui/back-button";
import { CourseCard } from "@/components/courses/CourseCard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { courses, isLoading: coursesLoading } = useCourses();
  const navigate = useNavigate();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);
  
  // Set page title based on user role
  useEffect(() => {
    if (user) {
      document.title = user.role === 'admin' 
        ? "Admin Dashboard - TechLearn" 
        : "Student Dashboard - TechLearn";
    }
  }, [user]);
  
  // Show loading screen while data is being fetched
  if (authLoading || coursesLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tech-blue"></div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {user.role === 'admin' ? (
          <AdminDashboard courses={courses} />
        ) : (
          <StudentDashboard user={user} courses={courses} />
        )}
      </main>
      <Footer />
    </>
  );
}
