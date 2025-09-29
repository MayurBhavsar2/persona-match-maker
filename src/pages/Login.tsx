import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff, ArrowLeft, Users, Briefcase } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Replace with your backend API URL
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Handle successful login (store token, user data, etc.)
        toast({
          title: "Login Successful",
          description: "Welcome back to your HR platform!",
        });
        navigate("/");
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // const handleRoleChange = (value: string) => {
  //   setFormData({
  //     ...formData,
  //     role: value,
  //   });
  // };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8 text-white hover:bg-white/10 backdrop-blur-sm animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        
        <Card className="shadow-xl backdrop-blur-sm bg-card/95 border-0 animate-scale-in">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4 animate-slide-up">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-fade-in">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-base animate-fade-in">
              Sign in to your HR platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* <div className="space-y-2 animate-slide-up">
                <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange} required>
                  <SelectTrigger className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border shadow-lg">
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="hiring-manager">Hiring Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div> */}

              <div className="space-y-2 animate-slide-up">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300"
                  required
                />
              </div>
              
              <div className="space-y-2 animate-slide-up">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-2 py-2 hover:bg-transparent transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between animate-slide-up">
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="text-primary hover:text-primary-dark transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-10 bg-gradient-primary hover:opacity-90 transition-all duration-300 font-semibold shadow-lg animate-slide-up"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Sign In to Platform
              </Button>
            </form>

            <div className="mt-4 text-center animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary hover:text-primary-dark transition-colors font-semibold"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;