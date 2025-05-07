import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResendDialog, setShowResendDialog] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Only redirect if authenticated and not loading
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
    
    try {
      console.log("Attempting login with:", email);
      await login(email, password);
      // The redirect will happen automatically via the useEffect
    } catch (err: any) {
      const errorMsg = err?.message || "An error occurred during login";
      console.error("Login error:", errorMsg);
      
      if (errorMsg.includes("Email not confirmed")) {
        setError("Your email has not been confirmed yet. Please check your inbox for a confirmation link or request a new one.");
        setShowResendDialog(true);
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResendConfirmation = async () => {
    setIsSubmitting(true);
    setResendSuccess(false);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) {
        setError(error.message);
      } else {
        setResendSuccess(true);
        setTimeout(() => {
          setShowResendDialog(false);
        }, 5000); // Close dialog after 5 seconds
      }
    } catch (err: any) {
      setError(err?.message || "Failed to resend confirmation email");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const closeDialog = () => {
    setShowResendDialog(false);
    setResendSuccess(false);
  };
  
  // If still loading auth state, show loading indicator
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
      
      <Dialog open={showResendDialog} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Verification Required</DialogTitle>
            <DialogDescription>
              Your email address needs to be verified before you can log in.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {resendSuccess ? (
              <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-md text-sm">
                Confirmation email sent! Please check your inbox and spam folder.
              </div>
            ) : (
              <>
                <p>
                  We've sent a confirmation link to <strong>{email}</strong>. Please check your inbox and spam folder.
                </p>
                <p>
                  If you didn't receive the email or it expired, you can request a new confirmation link.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={closeDialog}>Close</Button>
                  <Button onClick={handleResendConfirmation} disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Resend Confirmation"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </>
  );
}
