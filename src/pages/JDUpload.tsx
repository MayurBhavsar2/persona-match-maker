import { useState, useRef, useEffect } from "react";
import { Dialog, DialogDescription, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Plus, ChevronRight, Type, File, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const JDUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [showCustomRole, setShowCustomRole] = useState(false);
  const [inputMethod, setInputMethod] = useState<"upload" | "text">("upload");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [predefinedRoles, setPredefinedRoles] = useState<{ id: string; name: string }[]>([]);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [activeOnly, setActiveOnly] = useState(false);

  useEffect(() => {
  const fetchRoles = async () => {
    try {
      // Construct dynamic query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        active_only: activeOnly.toString(),
      });

      const response = await fetch(`/api/v1/job-role/?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch roles: ${response.status}`);

      const data = await response.json();
    
      // Assuming roles come from data.results
      const roles = data.job_roles
          ? data.job_roles.map((r: any) => ({ id: r.id, name: r.name }))
          : data.map((r: any) => ({ id: r.id, name: r.name }));

setPredefinedRoles(roles);

    } catch (error) {
      console.error("Error fetching roles:", error);
      toast({
        title: "Error fetching roles",
        description: "Could not load roles. Please try again later.",
        variant: "destructive",
      });
    }
  };

  fetchRoles();
}, [page, size, activeOnly]); // refetch if any param changes


    // Popup state for Add Role
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [newRole, setNewRole] = useState({
  name: "",
  description: "",
  department: "",
});

// Handle input change inside popup
const handleNewRoleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setNewRole((prev) => ({ ...prev, [name]: value }));
};

// Handle Save button click
const handleSaveRole = async () => {
  if (!newRole.name.trim() || !newRole.department.trim()) {
    toast({
      title: "Missing Required Fields",
      description: "Please fill in both Name and Department.",
      variant: "destructive",
    });
    return;
  }

  setIsSaving(true);
  try {
    const response = await fetch(`/api/v1/job-role/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name: newRole.name,
        description: newRole.description,
        category: newRole.department, // backend field name
        is_active: true,
      }),
    });

    if (!response.ok) throw new Error(`Failed with status ${response.status}`);

    const result = await response.json();

    // Add the new role to predefined list dynamically
    predefinedRoles.push(result.name);
    setSelectedRole(result.name);
    setIsDialogOpen(false);
    setNewRole({ name: "", description: "", department: "" });

    toast({
      title: "Role Saved Successfully",
      description: `${result.name} has been added to the role list.`,
    });
  } catch (error) {
    console.error(error);
    toast({
      title: "Error Saving Role",
      description: "There was an issue saving the role. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSaving(false);
  }
};


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (validTypes.includes(uploadedFile.type)) {
        setFile(uploadedFile);
        toast({
          title: "File uploaded successfully",
          description: `${uploadedFile.name} has been uploaded.`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, DOCX, or TXT file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUploadClick = () => {
    setInputMethod("upload");
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    const role = showCustomRole ? customRole : selectedRole;
    
    if (!role) {
      toast({
        title: "Role required",
        description: "Please select or enter a role.",
        variant: "destructive",
      });
      return;
    }

    if (inputMethod === "upload" && !file) {
      toast({
        title: "File required",
        description: "Please upload a job description file.",
        variant: "destructive",
      });
      return;
    }

    if (inputMethod === "text" && !jdText.trim()) {
      toast({
        title: "Job description required",
        description: "Please enter the job description text.",
        variant: "destructive",
      });
      return;
    }

    // // Store data in localStorage for demo purposes
    // localStorage.setItem('jdData', JSON.stringify({
    //   role,
    //   fileName: inputMethod === "upload" ? file?.name : "Pasted Job Description",
    //   jdContent: inputMethod === "text" ? jdText : null,
    //   instructions,
    //   timestamp: Date.now()
    // }));

    // toast({
    //   title: "Processing job description",
    //   description: "Analyzing your JD and generating recommendations...",
    // });

    // // Navigate to comparison page
    // setTimeout(() => {
    //   navigate('/jd-comparison');
    // }, 1500);

    toast({
      title: "Processing job description",
      description: "Analyzing your JD and generating recommendations...",
    });

    try {
      if (inputMethod === "upload" && file) {
        // TODO: Replace with your actual file upload API endpoint
        const formData = new FormData();
        formData.append('file', file);
        formData.append('role', role);
        formData.append("role_id", "");
        formData.append('title',role);
        formData.append('notes', instructions || "");

        const response = await fetch(`/api/v1/jd/upload-document`, {
          method: 'POST',
          body: formData,
          headers: {
            // Add any required headers (authorization, etc.)
            // 'Authorization': 'Bearer YOUR_API_KEY',
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });

        if (!response.ok) {
          throw new Error('File upload failed');
        }

        const result = await response.json();
        console.log(result.id)
        const jdId = result.id;
        if (!jdId) {
          throw new Error("JD ID not returned from backend");
        }

        
        
        // Store the API response data
        localStorage.setItem('jdData', JSON.stringify({
          role,
          fileName: file.name,
          jdContent: result.extractedText || null, // Assuming API returns extracted text
          instructions,
          apiData: result,
          timestamp: Date.now()
        }));
        navigate(`/jd-comparison/${jdId}`);

      } else if (inputMethod === "text" && jdText.trim()) {
        // TODO: Replace with your actual text processing API endpoint
        const response = await fetch(`/api/v1/jd/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            // Add any required headers (authorization, etc.)
            // 'Authorization': 'Bearer YOUR_API_KEY',
          },
          body: JSON.stringify({
            title:role,
            role:role,
            role_id:"",
            notes:instructions,
            original_text: jdText,
            company_id:"0",
            tags:[],
          })
        });

        if (!response.ok || !response) {
          throw new Error(`Upload failed: ${response?.status}`);
        }

        const result = await response.json();
        console.log(result.id)
        const jdId = result.id;
        if (!jdId) {
          throw new Error("JD ID not returned from backend");
        }
        
        // Store the API response data
        // localStorage.setItem('jdData', JSON.stringify({
        //   role,
        //   fileName: "Pasted Job Description",
        //   jdContent: jdText,
        //   instructions,
        //   apiData: result,
        //   timestamp: Date.now()
        // }));
        

        localStorage.setItem("jdData", JSON.stringify({
          role,
          jdContent: inputMethod === "text" ? jdText : result.extracted_metadata || null,
          instructions,
          apiData: result,
          timestamp: Date.now(),
        }));
        navigate(`/jd-comparison/${jdId}`);

      }

      // Navigate to comparison page
      // setTimeout(() => {
      //   navigate('/jd-comparison');
      // }, 1500);

    } catch (error) {
      console.error('API Error:', error);
      toast({
        title: "Processing failed",
        description: "There was an error processing your job description. Please try again.",
        variant: "destructive",
      });
      
      // // Fallback: Store data locally for demo purposes
      // localStorage.setItem('jdData', JSON.stringify({
      //   role,
      //   fileName: inputMethod === "upload" ? file?.name : "Pasted Job Description",
      //   jdContent: inputMethod === "text" ? jdText : null,
      //   instructions,
      //   timestamp: Date.now()
      // }));
      
      setTimeout(() => {
        navigate('/jd-comparison');
      }, 1500);
    }
  };

  return (
    <Layout currentStep={1}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Upload Job Description</h1>
          <p className="text-lg text-muted-foreground">
            Start by selecting a role and uploading your job description for AI analysis
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Job Details</span>
            </CardTitle>
            <CardDescription>
              Provide the role information and upload your job description document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div className="flex items-center space-x-1">
              <Label htmlFor="role" className="min-w-[40px] text-base">Role:</Label>
              <div className="flex-1">
                {!showCustomRole ? (
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Enter custom role..."
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                  />
                )
                }
              </div>
              {!showCustomRole ? (
                <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Role</span>
                  </Button>

              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCustomRole(false);
                    setCustomRole("");
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>

            {/* Job Description Input Method Selection */}
            <div className="space-y-4">
              
              <div className="flex items-center space-x-5">       {/*flex space-x-2*/}
                <Label>JD Input Method:</Label>
                <Button
                  type="button"
                  variant={inputMethod === "upload" ? "default" : "outline"}
                  onClick={handleUploadClick}
                  className="flex items-center space-x-2"
                >
                  <File className="w-4 h-4" />
                  <span>Upload Document</span>
                </Button>
                <Button
                  type="button"
                  variant={inputMethod === "text" ? "default" : "outline"}
                  onClick={() => setInputMethod("text")}
                  className="flex items-center space-x-2"
                >
                  <Type className="w-4 h-4" />
                  <span>Paste JD</span>
                </Button>
              </div>

              {inputMethod === "upload" && (
                <div className="space-y-2">
                  {file ? (
                    <div className="p-4 border border-border rounded-lg bg-muted/30">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{file.name}</p>
                          <p className="text-xs text-muted-foreground">File uploaded successfully</p>
                        </div>

                        <div className="flex space-x-2">
                              {/* Edit Icon */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                className="hover:bg-primary/10"
                              >
                                <Upload className="w-4 h-4" />
                              </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setFile(null);
                            toast({
                              title: "File removed",
                              description: "The file has been removed.",
                            });
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4" />   {/* Change File */}
                        </Button>
                      </div>
                    </div>
                  </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {/* Click "Upload Document" above to select your job description file. */}
                    </p>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                </div>
              )}

              {inputMethod === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="jdText">Job Description Text</Label>
                  <Textarea
                    id="jdText"
                    placeholder="Copy and paste your job description here..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    rows={12}
                    className="resize-none"
                  />
                  {/* <p className="text-xs text-muted-foreground">
                    Paste the complete job description content here.
                  </p> */}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-base">Additional Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                placeholder="Add any specific requirements, preferences, or areas of focus for this role..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                className="resize-none"
              />
              {/* <p className="text-xs text-muted-foreground">
                Provide any additional context or specific areas you want to emphasize in the job description analysis.
              </p> */}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmit}
                className="bg-gradient-primary hover:opacity-90 transition-smooth flex items-center space-x-2"
              >
                <span>Analyze Job Description</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Role</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div>
                    <Label htmlFor="name">Role Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter role name"
                      value={newRole.name}
                      onChange={handleNewRoleChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter description (optional)"
                      value={newRole.description}
                      onChange={handleNewRoleChange}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      name="department"
                      placeholder="Enter department name"
                      value={newRole.department}
                      onChange={handleNewRoleChange}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-gradient-primary"
                    onClick={handleSaveRole}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>


    </Layout>
  );
};

export default JDUpload;