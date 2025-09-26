import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff, ArrowLeft, UserPlus, Shield, CheckCircle } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Prototype functionality - just show success and navigate
    toast({
      title: "Registration Successful",
      description: "Welcome to your HR platform!",
    });
    navigate("/login");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  const passwordStrength = formData.password.length;
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 6) return "bg-danger";
    if (passwordStrength < 10) return "bg-warning";
    return "bg-success";
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
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
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mb-6 animate-slide-up">
              <UserPlus className="w-8 h-8 text-secondary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-secondary bg-clip-text text-transparent animate-fade-in">
              Join Our Platform
            </CardTitle>
            <CardDescription className="text-lg animate-fade-in">
              Create your HR platform account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 animate-slide-up">
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="h-12 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2 animate-slide-up">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-12 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300"
                  required
                />
              </div>

              <div className="space-y-2 animate-slide-up">
                <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange} required>
                  <SelectTrigger className="h-12 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border shadow-lg">
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="hiring-manager">Hiring Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 animate-slide-up">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-12 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300 pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${Math.min((passwordStrength / 12) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <Shield className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {passwordStrength < 6 && "Weak password"}
                      {passwordStrength >= 6 && passwordStrength < 10 && "Good password"}
                      {passwordStrength >= 10 && "Strong password"}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2 animate-slide-up">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="h-12 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300 pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <CheckCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 w-4 h-4 text-success" />
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-secondary hover:opacity-90 transition-all duration-300 font-semibold text-lg shadow-lg animate-slide-up"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Create Account
              </Button>
            </form>

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
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-secondary hover:text-secondary-dark transition-colors font-semibold"
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

export default Register;