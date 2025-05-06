
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Code, Database, Network, Server, Cpu, Layout, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Chatbot } from "@/components/chatbot/Chatbot";

export default function Index() {
  useEffect(() => {
    document.title = "TechLearn - Computer Science Education Platform";
  }, []);
  
  const features = [
    {
      icon: BookOpen,
      title: "Expert-Led Courses",
      description: "Learn from industry professionals and academics with years of experience in computer science."
    },
    {
      icon: Layout,
      title: "Structured Learning Paths",
      description: "Follow carefully designed learning paths to build your skills progressively."
    },
    {
      icon: Cpu,
      title: "AI Learning Assistant",
      description: "Get immediate help from our AI chatbot that answers questions and generates visual explanations."
    },
    {
      icon: Code,
      title: "Practical Coding Exercises",
      description: "Apply concepts with hands-on programming exercises and real-world projects."
    }
  ];
  
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
        
        {/* How It Works Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 heading-gradient">How TechLearn Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform makes learning computer science accessible, structured, and engaging
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center p-6 text-center">
                <div className="h-14 w-14 bg-tech-blue/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-tech-blue">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Create an Account</h3>
                <p className="text-muted-foreground">
                  Sign up for free and get access to our course catalog and learning tools.
                </p>
              </div>
              
              <div className="flex flex-col items-center p-6 text-center">
                <div className="h-14 w-14 bg-tech-purple/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-tech-purple">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Enroll in Courses</h3>
                <p className="text-muted-foreground">
                  Browse our catalog and enroll in courses that match your interests and career goals.
                </p>
              </div>
              
              <div className="flex flex-col items-center p-6 text-center">
                <div className="h-14 w-14 bg-tech-pink/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-tech-pink">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Learn & Grow</h3>
                <p className="text-muted-foreground">
                  Access videos, downloadable resources, and get help from our AI assistant whenever needed.
                </p>
              </div>
            </div>
          </div>
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
        
        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 heading-gradient">Platform Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to succeed in your computer science learning journey
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                  <div className="h-12 w-12 bg-tech-blue/10 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-tech-blue" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-tech-blue text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
              <p className="text-lg opacity-90 mb-8">
                Join thousands of students who are already advancing their careers with TechLearn.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-tech-blue hover:bg-gray-100">
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    Browse Courses <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
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
