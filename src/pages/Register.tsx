import { useState,useEffect } from "react";
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
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(100);
  const [roles, setRoles] = useState<any[]>([]);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name:"",
    email: "",
    phone:"",
    role: "",
    role_id:"",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      // Replace with your backend API URL
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any required headers (authorization, etc.)
          // 'Authorization': 'Bearer YOUR_API_KEY',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name:formData.last_name,
          email: formData.email,
          phone:formData.phone,
          role: formData.role,
          role_id:formData.role_id,
          password: formData.password,
        }),
      });

      console.log("API Response status:", response.status);
      console.log("API Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("Registration successful:", data);
        toast({
          title: "Registration Successful",
          description: "Welcome to your HR platform!",
        });
        navigate("/login");
      } else {
        const errorData = await response.text();
        console.error("Registration failed with status:", response.status, "Error:", errorData);
        toast({
          title: "Registration Failed",
          description: `Server error: ${response.status}. Check if backend is running.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network error during registration:", error);
      toast({
        title: "Registration Failed",
        description: "Network error. Check if backend is running on localhost:8000",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
  const fetchRoles = async () => {
    try {
      const queryParams = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
      const url = `${import.meta.env.VITE_API_URL}/api/v1/role/?${queryParams.toString()}`;

      const response = await fetch(url);
      const data = await response.json();

      console.log("Roles API Response:", data);
      // ✅ Safely handle the API response
      const roleList = data.roles || data;
      setRoles(roleList);
      
      // ✅ Store role ID and name in localStorage
      if (Array.isArray(roleList)) {
        const simplifiedRoles = roleList.map((role: any) => ({
          id: role.id,
          name: role.name,
        }));

        localStorage.setItem("dashboardRoles", JSON.stringify(simplifiedRoles));
        console.log("Roles stored in localStorage:", simplifiedRoles);
      }

      

    } catch (error) {
      console.error("Error fetching roles:", error);
      toast({
        title: "Failed to load roles",
        description: "Please check if the backend server is running.",
        variant: "destructive",
      });
    }
  };

  fetchRoles();
}, [skip, limit]); // <-- re-fetch roles when skip or limit changes


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (value: string) => {
    const selectedRole = roles.find((r) => r.name === value);
    setFormData({
      ...formData,
      role: value,
      role_id:selectedRole ? selectedRole.id : "",
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
      
      <div className="w-full max-w-4xl relative z-10">
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
            <div className="mx-auto w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mb-4 animate-slide-up">
              <UserPlus className="w-6 h-6 text-secondary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-secondary bg-clip-text text-transparent animate-fade-in">
              Join Our Platform
            </CardTitle>
            <CardDescription className="text-base animate-fade-in">
              Create your HR platform account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Row - Full Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Enter your Last name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
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
                <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="text"
                  placeholder="Enter your Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300"
                  required
                />
              </div>

            </div>
              
              
              {/* Second Row - Role */}
              <div className="grid grid-cols-1 gap-4 animate-slide-up">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange} required>
                    <SelectTrigger className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border shadow-lg">
                        {roles.length > 0 ? (
                          roles.map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                              {role.name}
                            </SelectItem>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-sm p-2">Loading roles...</p>
                        )}
                      </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Third Row - Password and Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
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
                  {formData.password && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${Math.min((passwordStrength / 12) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <Shield className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {passwordStrength < 6 && "Weak password"}
                        {passwordStrength >= 6 && passwordStrength < 10 && "Good password"}
                        {passwordStrength >= 10 && "Strong password"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-2 py-2 hover:bg-transparent transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 text-success" />
                    )}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-10 bg-gradient-secondary hover:opacity-90 transition-all duration-300 font-semibold shadow-lg animate-slide-up"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
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