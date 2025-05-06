
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Code, Database, Network, Server, Cpu, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { CourseCard } from "@/components/courses/CourseCard";
import { useCourses } from "@/context/CourseContext";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Index() {
  const { featuredCourses, isLoading } = useCourses();
  
  useEffect(() => {
    document.title = "TechLearn - Computer Science Education Platform";
  }, []);
  
  const categories = [
    { id: 'algorithms', name: 'Data Structures & Algorithms', icon: Code },
    { id: 'systems', name: 'Operating Systems', icon: Server },
    { id: 'databases', name: 'Database Management', icon: Database },
    { id: 'networking', name: 'Networking', icon: Network },
    { id: 'ai', name: 'Artificial Intelligence', icon: Cpu },
    { id: 'web', name: 'Web Development', icon: Layout },
  ];
  
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-tech-blue to-tech-purple py-20 text-white overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Master Computer Science with Expert-Led Courses
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                Comprehensive learning platform with preloaded courses, downloadable resources,
                and AI-powered assistance for computer science students.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/courses">
                  <Button size="lg" className="bg-white text-tech-blue hover:bg-gray-100">
                    Explore Courses
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10"></div>
        </section>
        
        {/* Categories Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 heading-gradient">Explore Categories</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover courses in different computer science domains from beginner to advanced levels
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map(category => (
                <Link to={`/courses?category=${category.id}`} key={category.id}>
                  <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <category.icon className="h-10 w-10 text-tech-blue mb-4" />
                    <h3 className="font-medium text-center">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        
        {/* Featured Courses Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold heading-gradient">Featured Courses</h2>
                <p className="text-muted-foreground mt-2">
                  Popular courses curated by experts in the field
                </p>
              </div>
              <Link to="/courses">
                <Button variant="ghost" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="h-80 rounded-lg bg-muted animate-pulse" />
                ))
              ) : (
                featuredCourses.slice(0, 3).map(course => (
                  <CourseCard key={course.id} course={course} />
                ))
              )}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 heading-gradient">Platform Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to succeed in your computer science learning journey
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="h-12 w-12 bg-tech-blue/10 rounded-full flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-tech-blue" />
                </div>
                <h3 className="text-xl font-bold mb-2">Comprehensive Courses</h3>
                <p className="text-muted-foreground">
                  Access high-quality video lectures, downloadable notes, and interactive quizzes across essential computer science subjects.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="h-12 w-12 bg-tech-purple/10 rounded-full flex items-center justify-center mb-4">
                  <Layout className="h-6 w-6 text-tech-purple" />
                </div>
                <h3 className="text-xl font-bold mb-2">Role-Based Learning</h3>
                <p className="text-muted-foreground">
                  Customized dashboards for both students and administrators with progress tracking and content management.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <div className="h-12 w-12 bg-tech-pink/10 rounded-full flex items-center justify-center mb-4">
                  <Cpu className="h-6 w-6 text-tech-pink" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Learning Assistant</h3>
                <p className="text-muted-foreground">
                  Get help from our AI chatbot that can answer questions, generate diagrams, and summarize content for enhanced learning.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
