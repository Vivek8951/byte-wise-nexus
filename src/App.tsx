
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { CourseProvider } from "@/context/CourseContext";
import { ChatbotProvider } from "@/context/ChatbotContext";

// Pages
import Index from "@/pages/Index";
import About from "@/pages/About";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import AdminCourses from "@/pages/AdminCourses";
import AdminUsers from "@/pages/AdminUsers";
import Profile from "@/pages/Profile";
import StudentEnrollments from "@/pages/StudentEnrollments";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="dark" 
        enableSystem={true}
        disableTransitionOnChange={false}
      >
        <BrowserRouter>
          <AuthProvider>
            <CourseProvider>
              <ChatbotProvider>
                <div className="min-h-screen bg-background text-foreground">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:id" element={<CourseDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin/courses" element={<AdminCourses />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/enrollments" element={<StudentEnrollments />} />
                  </Routes>
                </div>
                <Toaster />
              </ChatbotProvider>
            </CourseProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
