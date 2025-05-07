
import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserRole } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Check for authentication status and redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords don't match. Please make sure your passwords match.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Log the role being sent to ensure it's correct
      console.log("Submitting registration with role:", role);
      const success = await register(name, email, password, role);
      if (success) {
        toast({
          title: "Registration successful!",
          description: "You can now log in with your credentials.",
        });
        navigate("/login");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tech-blue"></div>
        </div>
        <Footer />
      </>
    );
  }
  
  // If already authenticated, don't render the registration form
  if (isAuthenticated) {
    return null; // This will be replaced by the redirect in useEffect
  }
  
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-tech-purple rounded-full flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold heading-gradient">Create an account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Join TechLearn to access comprehensive computer science courses
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
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-tech-purple"
                />
              </div>
              
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-tech-purple"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-tech-purple"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Account Type</Label>
                <RadioGroup 
                  defaultValue="student" 
                  value={role} 
                  onValueChange={(value) => setRole(value as UserRole)} 
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student" className="cursor-pointer">Student</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="cursor-pointer">Administrator</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-tech-blue hover:bg-tech-darkblue transition-all duration-300 transform hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-tech-purple hover:text-tech-blue transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
