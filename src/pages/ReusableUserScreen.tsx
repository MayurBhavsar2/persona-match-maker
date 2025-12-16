import Layout from "@/components/Layout"
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, CardContent} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, ArrowLeft, UserPlus, Shield, CheckCircle, Save } from "lucide-react";
import axios from 'axios';
import { Button } from "@/components/ui/button";

const ReusableUserScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = useParams<{ userId?: string}>();
    const isEditMode = location.pathname.includes('/edit/') && !!userId;
    
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name:"",
        email: "",
        phone:"",
        role: "",
        role_id:"",
        password: "",
        confirmPassword: "",
        is_active: true,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Fetch roles on component mount
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/role`);
                setRoles(response.data?.roles);
            } catch (error) {
                console.error("Failed to fetch roles:", error);
                toast({
                    title: "Error",
                    description: "Failed to load roles",
                    variant: "destructive",
                });
            }
        };
        fetchRoles();
    }, []);

    // Fetch user data in edit mode
    useEffect(() => {
        const fetchUserData = async () => {
            if (!isEditMode || !userId) return;

            // Check if user data was passed via navigation state
            const navigationState = location.state as { userData?: any };
            if (navigationState?.userData) {
                const userData = navigationState.userData;
                setFormData({
                    first_name: userData.first_name || "",
                    last_name: userData.last_name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    role: userData.role || "",
                    role_id: userData.role_id || "",
                    is_active: userData.is_active ?? true,
                    password: "",
                    confirmPassword: "",
                });
                return;
            }

            // If no state data, fetch from API
            setLoading(true);
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/v1/auth/users/${userId}`
                );
                const userData = response.data;
                
                // Find the role name from role_id
                const userRole = roles.find(r => r.id === userData.role_id);
                
                setFormData({
                    first_name: userData.first_name || "",
                    last_name: userData.last_name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    role: userRole?.name || "",
                    role_id: userData.role_id || "",
                    is_active: userData.is_active ?? true,
                    password: "",
                    confirmPassword: "",
                });
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load user data",
                    variant: "destructive",
                });
                navigate("/users");
            } finally {
                setLoading(false);
            }
        };

        // Only fetch user data after roles are loaded
        if (roles.length > 0) {
            fetchUserData();
        }
    }, [isEditMode, userId, location.state, roles, navigate]);
      
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Password validation only for create mode
        if (!isEditMode) {
            if (formData.password !== formData.confirmPassword) {
                toast({
                    title: "Error",
                    description: "Passwords do not match",
                    variant: "destructive",
                });
                return;
            }
        }
        
        setLoading(true);
        
        try {
            if (isEditMode) {
                // Update user
                const response = await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/v1/auth/users/${userId}`,
                    {
                        email: formData.email,
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        phone: formData.phone,
                        is_active: formData.is_active,
                        role_id: formData.role_id,
                    }
                );
                
                console.log("Update successful:", response.data);
                toast({
                    title: "Update Successful",
                    description: "User details have been updated.",
                });
                navigate("/users");
            } else {
                // Create new user
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/v1/auth/signup`,
                    {
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        email: formData.email,
                        phone: formData.phone,
                        role: formData.role,
                        role_id: formData.role_id,
                        password: formData.password,
                    }
                );
                
                console.log("Registration successful:", response.data);
                toast({
                    title: "Registration Successful",
                    description: "User has been created successfully!",
                });
                navigate("/users");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.detail || 
                                    error.response?.data?.message || 
                                    error.response?.data?.error ||
                                    error.message ||
                                    `${isEditMode ? 'Update' : 'Registration'} failed. Please try again.`;
                
                console.error(`${isEditMode ? 'Update' : 'Registration'} failed:`, error.response?.data);
                
                toast({
                    title: `${isEditMode ? 'Update' : 'Registration'} Failed`,
                    description: errorMessage,
                    variant: "destructive",
                });
            } else {
                console.error("Network error:", error);
                toast({
                    title: `${isEditMode ? 'Update' : 'Registration'} Failed`,
                    description: "Network error. Check if backend is running.",
                    variant: "destructive",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }; 

    const passwordStrength = formData.password.length;

    const getPasswordStrengthColor = () => {
        if (passwordStrength < 6) return "bg-red-500";
        if (passwordStrength < 10) return "bg-yellow-500";
        return "bg-green-500";
    };

    const handleRoleChange = (value: string) => {
        const selectedRole = roles.find((r) => r.name === value);
        setFormData({
            ...formData,
            role: value,
            role_id: selectedRole ? selectedRole.id : "",
        });
    };

    if (loading && isEditMode) {
        return (
            <Layout>
                <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
                    <p className="text-muted-foreground">Loading user data...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="flex items-baseline justify-center gap-3">
                        <h1 className="text-3xl font-bold text-foreground">
                            {isEditMode ? "Update User Details" : "Create User"}
                        </h1>
                    </div>
                </div>
                
                <Card className="border-0 animate-scale-in">
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* First Row - Full Name */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name" className="text-sm font-medium">First Name</Label>
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        type="text"
                                        placeholder="Enter first name"
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
                                        placeholder="Enter last name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Second Row - Email and Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="text"
                                        placeholder="Enter phone number"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300"
                                        required
                                    />
                                </div>
                            </div>
                            
                            {/* Third Row - Role */}
                            <div className="grid grid-cols-1 gap-4 animate-slide-up">
                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                                    <Select value={formData.role} onValueChange={handleRoleChange} required>
                                        <SelectTrigger className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300">
                                            <SelectValue placeholder="Select role" />
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
                            
                            {/* Password Fields - Only show in create mode */}
                            {!isEditMode && (
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
                                                <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="w-full flex justify-between items-center">
                                <Button className="w-36 h-10 border bg-black border-black hover:bg-black/90 transition-all duration-300 font-semibold shadow-lg animate-slide-up" onClick={()=>navigate("/users/list")} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button 
                                type="submit" 
                                className="w-36 h-10 bg-blue-500 hover:opacity-90 transition-all duration-300 font-semibold shadow-lg animate-slide-up"
                                disabled={loading}
                            >
                                {loading ? (
                                    "Processing..."
                                ) : isEditMode ? (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Update User
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Create User
                                    </>
                                )}
                            </Button>
                            </div>
                            
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default ReusableUserScreen;


// import Layout from "@/components/Layout"
// import { useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { Card, CardContent} from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { toast } from "@/components/ui/use-toast";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Eye, EyeOff, ArrowLeft, UserPlus, Shield, CheckCircle } from "lucide-react";
// import axios from 'axios';
// import { Button } from "@/components/ui/button";



// const ReusableUserScreen  = () => {
//     const navigate = useNavigate();
//     const { userId } = useParams<{ userId?: string}>();
//     const isEditMode = location.pathname.includes('/edit/') && !!userId;
//     const [roles, setRoles] = useState<any[]>([]);
//     const [formData, setFormData] = useState({
//         first_name: "",
//         last_name:"",
//         email: "",
//         phone:"",
//         role: "",
//         role_id:"",
//         password: "",
//         confirmPassword: "",
//       });
//     const [showPassword, setShowPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
      
//     const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (formData.password !== formData.confirmPassword) {
//         toast({
//         title: "Error",
//         description: "Passwords do not match",
//         variant: "destructive",
//         });
//         return;
//     }
    
//     try {
//         const response = await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/v1/auth/signup`,
//         {
//             first_name: formData.first_name,
//             last_name: formData.last_name,
//             email: formData.email,
//             phone: formData.phone,
//             role: formData.role,
//             role_id: formData.role_id,
//             password: formData.password,
//         }
//         );
    
//         console.log("Registration successful:", response.data);
//         toast({
//         title: "Registration Successful",
//         description: "Welcome to your HR platform!",
//         });
//         navigate("/login");
        
//     } catch (error) {
//         if (axios.isAxiosError(error)) {
//         const errorMessage = error.response?.data?.detail || 
//                             error.response?.data?.message || 
//                             error.response?.data?.error ||
//                             error.message ||
//                             "Registration failed. Please try again.";
        
//         console.error("Registration failed:", error.response?.data);
        
//         toast({
//             title: "Registration Failed",
//             description: errorMessage,
//             variant: "destructive",
//         });
//         } else {
//         console.error("Network error:", error);
//         toast({
//             title: "Registration Failed",
//             description: "Network error. Check if backend is running.",
//             variant: "destructive",
//         });
//         }
//     }
//     };

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//     }; 

//     const passwordStrength = formData.password.length;

//     const getPasswordStrengthColor = () => {
//         if (passwordStrength < 6) return "bg-danger";
//         if (passwordStrength < 10) return "bg-warning";
//         return "bg-success";
//     };

//     const handleRoleChange = (value: string) => {
//     const selectedRole = roles.find((r) => r.name === value);
//     setFormData({
//       ...formData,
//       role: value,
//       role_id:selectedRole ? selectedRole.id : "",
//     });
//   };

//     return (
//         <Layout >
//         <div className="max-w-6xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="text-center space-y-3">
//           <div className="flex items-baseline justify-center gap-3">
//             <h1 className="text-3xl font-bold text-foreground">
//               {isEditMode ? "Update User Details" : "Create User"}
//             </h1>
//             </div>
//             </div>
//             <Card className="border-0 animate-scale-in">
//           <CardContent className="space-y-4">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* First Row - Full Name and Email */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
//                 <div className="space-y-2">
//                   <Label htmlFor="first_name" className="text-sm font-medium">First Name</Label>
//                   <Input
//                     id="first_name"
//                     name="first_name"
//                     type="text"
//                     placeholder="Enter your first name"
//                     value={formData.first_name}
//                     onChange={handleInputChange}
//                     className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="last_name" className="text-sm font-medium">Last Name</Label>
//                   <Input
//                     id="last_name"
//                     name="last_name"
//                     type="text"
//                     placeholder="Enter your Last name"
//                     value={formData.last_name}
//                     onChange={handleInputChange}
//                     className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
//                   <Input
//                     id="email"
//                     name="email"
//                     type="email"
//                     placeholder="Enter your email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2 animate-slide-up">
//                 <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
//                 <Input
//                   id="phone"
//                   name="phone"
//                   type="text"
//                   placeholder="Enter your Phone Number"
//                   value={formData.phone}
//                   onChange={handleInputChange}
//                   className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300"
//                   required
//                 />
//               </div>

//             </div>
              
              
//               {/* Second Row - Role */}
//               <div className="grid grid-cols-1 gap-4 animate-slide-up">
//                 <div className="space-y-2">
//                   <Label htmlFor="role" className="text-sm font-medium">Role</Label>
//                   <Select value={formData.role} onValueChange={handleRoleChange} required>
//                     <SelectTrigger className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300">
//                       <SelectValue placeholder="Select your role" />
//                     </SelectTrigger>
//                     <SelectContent className="bg-card border-border shadow-lg">
//                         {roles.length > 0 ? (
//                           roles.map((role) => (
//                             <SelectItem key={role.id} value={role.name}>
//                               {role.name}
//                             </SelectItem>
//                           ))
//                         ) : (
//                           <p className="text-muted-foreground text-sm p-2">Loading roles...</p>
//                         )}
//                       </SelectContent>
//                   </Select>
//                 </div>
//               </div>
              
//               {/* Third Row - Password and Confirm Password */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
//                 <div className="space-y-2">
//                   <Label htmlFor="password" className="text-sm font-medium">Password</Label>
//                   <div className="relative">
//                     <Input
//                       id="password"
//                       name="password"
//                       type={showPassword ? "text" : "password"}
//                       placeholder="Create a strong password"
//                       value={formData.password}
//                       onChange={handleInputChange}
//                       className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300 pr-10"
//                       required
//                     />
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       className="absolute right-0 top-0 h-full px-2 py-2 hover:bg-transparent transition-colors"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? (
//                         <EyeOff className="h-4 w-4 text-muted-foreground" />
//                       ) : (
//                         <Eye className="h-4 w-4 text-muted-foreground" />
//                       )}
//                     </Button>
//                   </div>
//                   {formData.password && (
//                     <div className="space-y-1">
//                       <div className="flex items-center gap-2">
//                         <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
//                           <div 
//                             className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
//                             style={{ width: `${Math.min((passwordStrength / 12) * 100, 100)}%` }}
//                           ></div>
//                         </div>
//                         <Shield className="w-3 h-3 text-muted-foreground" />
//                       </div>
//                       <p className="text-xs text-muted-foreground">
//                         {passwordStrength < 6 && "Weak password"}
//                         {passwordStrength >= 6 && passwordStrength < 10 && "Good password"}
//                         {passwordStrength >= 10 && "Strong password"}
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
//                   <div className="relative">
//                     <Input
//                       id="confirmPassword"
//                       name="confirmPassword"
//                       type={showConfirmPassword ? "text" : "password"}
//                       placeholder="Confirm your password"
//                       value={formData.confirmPassword}
//                       onChange={handleInputChange}
//                       className="h-10 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background transition-all duration-300 pr-10"
//                       required
//                     />
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       className="absolute right-0 top-0 h-full px-2 py-2 hover:bg-transparent transition-colors"
//                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     >
//                       {showConfirmPassword ? (
//                         <EyeOff className="h-4 w-4 text-muted-foreground" />
//                       ) : (
//                         <Eye className="h-4 w-4 text-muted-foreground" />
//                       )}
//                     </Button>
//                     {formData.confirmPassword && formData.password === formData.confirmPassword && (
//                       <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 text-success" />
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <Button 
//                 type="submit" 
//                 className="w-full h-10 bg-blue-500 hover:opacity-90 transition-all duration-300 font-semibold shadow-lg animate-slide-up"
//               >
//                 <UserPlus className="w-4 h-4 mr-2" />
//                 Create User
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//             </div>
//             </Layout>
//     )
// }

// export default ReusableUserScreen