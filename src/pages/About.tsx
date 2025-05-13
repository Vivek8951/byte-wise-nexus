
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Book, Users, Award, CheckCircle, BookOpen } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function About() {
  useEffect(() => {
    document.title = "About Us - TechLearn";
    
    // Animation initializations for fade-in effects
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
    
    // Initial call and scroll listener
    animateElements();
    window.addEventListener('scroll', animateElements);
    
    return () => window.removeEventListener('scroll', animateElements);
  }, []);
  
  const values = [
    {
      icon: BookOpen,
      title: "Accessible Education",
      description: "We believe quality computer science education should be available to everyone regardless of background or location."
    },
    {
      icon: CheckCircle,
      title: "Practical Focus",
      description: "Our curriculum emphasizes real-world applications and industry-relevant skills."
    },
    {
      icon: Users,
      title: "Community Learning",
      description: "We foster a supportive community where students can learn collaboratively and build connections."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We maintain high standards in our course materials, instructors, and learning platform."
    }
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 py-20 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-in slide-in-from-bottom-5">
                About TechLearn
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8 animate-in slide-in-from-bottom-5 delay-150">
                Our mission is to make high-quality computer science education accessible, 
                engaging, and effective for students and professionals worldwide.
              </p>
            </div>
          </div>
        </section>
        
        {/* Our Story Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-on-scroll opacity-0">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Our Story</h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  TechLearn was founded in 2025 with a vision to transform how computer science is taught and learned. 
                  The founders noticed that many students struggled with traditional teaching methods and 
                  lacked practical experience.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  A team of educators and technology experts was assembled to create a platform that combines academic rigor with 
                  practical, industry-relevant learning. Today, TechLearn serves students worldwide, from college freshmen 
                  to seasoned professionals looking to upskill.
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  Our innovative approach integrates video lessons, interactive coding exercises, AI-powered assistance, and a 
                  supportive learning community to deliver an effective and engaging educational experience.
                </p>
              </div>
              <div className="relative animate-on-scroll opacity-0 delay-200">
                <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                    alt="Student learning on laptop"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Values Section */}
        <section className="py-20 bg-slate-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 animate-on-scroll opacity-0">
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Our Values</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                At TechLearn, our core values guide everything we do—from curriculum development to platform design and student support.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div 
                  key={value.title} 
                  className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow hover:shadow-xl transition-all duration-300 animate-on-scroll opacity-0"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="h-14 w-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
                    <value.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Start Your Learning Journey?</h2>
              <p className="text-lg opacity-90 mb-8">
                Join thousands of students already exploring our comprehensive computer science curriculum.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
          </div>
        </section>
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
