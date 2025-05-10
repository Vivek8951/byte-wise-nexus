
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Code, Database, Network, Server, Cpu, Layout, BookOpen, Award, Users, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Chatbot } from "@/components/chatbot/Chatbot";

export default function Index() {
  useEffect(() => {
    document.title = "TechLearn - Computer Science Education Platform";
    
    // Animation initializations
    const animateElements = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top <= window.innerHeight * 0.8;
        
        if (isVisible) {
          element.classList.add('animate-fade-in');
        }
      });
    };
    
    // Initial call
    animateElements();
    
    // Add scroll listener
    window.addEventListener('scroll', animateElements);
    
    return () => window.removeEventListener('scroll', animateElements);
  }, []);
  
  const features = [
    {
      icon: BookOpen,
      title: "Expert-Led Courses",
      description: "Learn from industry professionals and academics with years of experience in computer science.",
      color: "from-blue-500 to-blue-700"
    },
    {
      icon: Layout,
      title: "Structured Learning Paths",
      description: "Follow carefully designed learning paths to build your skills progressively.",
      color: "from-purple-500 to-purple-700"
    },
    {
      icon: Cpu,
      title: "AI Learning Assistant",
      description: "Get immediate help from our AI chatbot that answers questions and generates visual explanations.",
      color: "from-green-500 to-green-700"
    },
    {
      icon: Code,
      title: "Practical Coding Exercises",
      description: "Apply concepts with hands-on programming exercises and real-world projects.",
      color: "from-orange-500 to-orange-700"
    }
  ];
  
  const stats = [
    { value: "25+", label: "Expert Instructors", icon: Users },
    { value: "150+", label: "Comprehensive Courses", icon: BookOpen },
    { value: "10k+", label: "Active Students", icon: Award },
    { value: "24/7", label: "Support Available", icon: Clock }
  ];
  
  const categories = [
    { id: 'algorithms', name: 'Data Structures & Algorithms', icon: Code, color: "from-blue-400 to-blue-600" },
    { id: 'systems', name: 'Operating Systems', icon: Server, color: "from-green-400 to-green-600" },
    { id: 'databases', name: 'Database Management', icon: Database, color: "from-amber-400 to-amber-600" },
    { id: 'networking', name: 'Networking', icon: Network, color: "from-red-400 to-red-600" },
    { id: 'ai', name: 'Artificial Intelligence', icon: Cpu, color: "from-purple-400 to-purple-600" },
    { id: 'web', name: 'Web Development', icon: Layout, color: "from-cyan-400 to-cyan-600" },
  ];
  
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      content: "TechLearn's algorithms course helped me ace my technical interviews. The interactive exercises and clear explanations made complex concepts easy to understand.",
      image: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      name: "David Chen",
      role: "Computer Science Student",
      content: "As a student, I found TechLearn's courses to be more comprehensive than my university curriculum. The AI assistant helped me whenever I got stuck.",
      image: "https://randomuser.me/api/portraits/men/22.jpg"
    },
    {
      name: "Michelle Patel",
      role: "Data Scientist",
      content: "The database management course was exactly what I needed to advance in my career. The practical examples are relevant to real-world scenarios.",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    }
  ];
  
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 py-24 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10 animate-pulse"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-in slide-in-from-bottom-5">
                Master Computer Science with Expert-Led Courses
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8 animate-in slide-in-from-bottom-5 delay-150">
                Comprehensive learning platform with preloaded courses, downloadable resources,
                and AI-powered assistance for computer science students.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in slide-in-from-bottom-5 delay-300">
                <Link to="/courses">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 hover:scale-105 transition-transform duration-300 shadow-lg">
                    Explore Courses
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 hover:scale-105 transition-transform duration-300">
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Floating elements - decorative */}
            <div className="hidden md:block">
              <div className="absolute top-12 left-12 w-16 h-16 bg-white/10 rounded-full animate-bounce delay-150"></div>
              <div className="absolute bottom-24 right-24 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute top-36 right-36 w-8 h-8 bg-white/20 rounded-full animate-ping"></div>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-12 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center p-4 text-center animate-on-scroll opacity-0">
                  <div className="mb-3 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                    <stat.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-on-scroll opacity-0">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">How TechLearn Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform makes learning computer science accessible, structured, and engaging
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center p-6 text-center animate-on-scroll opacity-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Create an Account</h3>
                <p className="text-muted-foreground">
                  Sign up for free and get access to our course catalog and learning tools.
                </p>
              </div>
              
              <div className="flex flex-col items-center p-6 text-center animate-on-scroll opacity-0 delay-150 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Enroll in Courses</h3>
                <p className="text-muted-foreground">
                  Browse our catalog and enroll in courses that match your interests and career goals.
                </p>
              </div>
              
              <div className="flex flex-col items-center p-6 text-center animate-on-scroll opacity-0 delay-300 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <div className="h-16 w-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                  <span className="text-2xl font-bold text-white">3</span>
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
        <section className="py-20 bg-slate-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-on-scroll opacity-0">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Explore Categories</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover courses in different computer science domains from beginner to advanced levels
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category, index) => (
                <Link to={`/courses?category=${category.id}`} key={category.id}>
                  <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-on-scroll opacity-0" style={{animationDelay: `${index * 100}ms`}}>
                    <div className={`rounded-full p-4 bg-gradient-to-r ${category.color} mb-4`}>
                      <category.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-medium text-center">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-on-scroll opacity-0">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Platform Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to succeed in your computer science learning journey
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow hover:shadow-xl transition-all duration-300 animate-on-scroll opacity-0 hover:-translate-y-1" style={{animationDelay: `${index * 100}ms`}}>
                  <div className={`h-14 w-14 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mb-6`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonial Section */}
        <section className="py-20 bg-slate-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-on-scroll opacity-0">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">What Our Students Say</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Hear from students who have transformed their careers with TechLearn
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 animate-on-scroll opacity-0" style={{animationDelay: `${index * 150}ms`}}>
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full mr-4 border-2 border-blue-500"
                    />
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="italic text-gray-600 dark:text-gray-300">"{testimonial.content}"</p>
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="text-yellow-400" size={16} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center animate-on-scroll opacity-0">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
              <p className="text-lg opacity-90 mb-8">
                Join thousands of students who are already advancing their careers with TechLearn.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg">
                    Create Free Account
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 hover:scale-105 transition-all duration-300">
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

function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
