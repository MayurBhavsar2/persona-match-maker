import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Mail, Shield, Clock } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prototype functionality - just show success
    toast({
      title: "Reset Link Sent",
      description: "Check your email for password reset instructions",
    });
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-80 h-80 bg-warning/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-success/10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/login")}
          className="mb-8 text-white hover:bg-white/10 backdrop-blur-sm animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>
        
        <Card className="shadow-xl backdrop-blur-sm bg-card/95 border-0 animate-scale-in">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6 animate-slide-up">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary animate-fade-in">
              Reset Password
            </CardTitle>
            <CardDescription className="text-lg animate-fade-in">
              Don't worry, we'll help you get back in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 animate-slide-up">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send a secure link to reset your password
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 font-semibold text-lg shadow-lg animate-slide-up"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Send Reset Link
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-6 animate-fade-in">
                <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center animate-scale-in">
                  <Mail className="w-8 h-8 text-success" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-xl text-success">Email Sent!</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to:
                  </p>
                  <p className="font-medium text-foreground break-all">{email}</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Link expires in 15 minutes</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Check your spam folder if you don't see the email
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="w-full h-12 border-border/50 backdrop-blur-sm"
                  >
                    Use Different Email
                  </Button>
                  
                  <Button
                    onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                    variant="ghost"
                    className="w-full text-sm text-muted-foreground hover:text-foreground"
                  >
                    Resend Email
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-8 text-center animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary-dark transition-colors font-semibold"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;