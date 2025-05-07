
import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Check for authentication status and redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Simple validation
    if (!email.trim() || !password) {
      setError("Please enter both email and password");
      setIsSubmitting(false);
      return;
    }
    
    try {
      console.log("Attempting login with:", email);
      const success = await login(email, password);
      
      if (success) {
        console.log("Login successful, redirecting...");
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      const errorMsg = err?.message || "An error occurred during login";
      console.error("Login error:", errorMsg);
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If still loading auth state, show loading indicator
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <Skeleton className="h-10 w-48 mt-6 mx-auto" />
              <Skeleton className="h-4 w-64 mt-2 mx-auto" />
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
                
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            
            <Skeleton className="h-5 w-64 mx-auto" />
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-tech-purple rounded-full flex items-center justify-center animate-fade-in">
              <User className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold heading-gradient animate-fade-in">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground animate-fade-in">
              Sign in to your account to continue learning
            </p>
          </div>
          
          <div className="bg-card rounded-lg p-6 shadow-sm border animate-fade-in">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-tech-purple"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-tech-purple hover:text-tech-blue transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-tech-purple"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-tech-blue hover:bg-tech-darkblue transition-all duration-300 transform hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-tech-purple hover:text-tech-blue transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
