import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Plus, ChevronRight, Type, File } from "lucide-react";
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

  const predefinedRoles = [
    "Software Engineer - RPA",
    "RPA Developer",
    "Business Analyst",
    "Project Manager",
    "Data Scientist",
    "Full Stack Developer",
    "DevOps Engineer",
    "Product Manager",
    "UX/UI Designer",
    "Quality Assurance Engineer"
  ];

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
        formData.append('instructions', instructions);

        const response = await fetch('YOUR_API_ENDPOINT_FOR_FILE_UPLOAD', {
          method: 'POST',
          body: formData,
          headers: {
            // Add any required headers (authorization, etc.)
            // 'Authorization': 'Bearer YOUR_API_KEY',
          }
        });

        if (!response.ok) {
          throw new Error('File upload failed');
        }

        const result = await response.json();
        
        // Store the API response data
        localStorage.setItem('jdData', JSON.stringify({
          role,
          fileName: file.name,
          jdContent: result.extractedText || null, // Assuming API returns extracted text
          instructions,
          apiData: result,
          timestamp: Date.now()
        }));

      } else if (inputMethod === "text" && jdText.trim()) {
        // TODO: Replace with your actual text processing API endpoint
        const response = await fetch('YOUR_API_ENDPOINT_FOR_TEXT_PROCESSING', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add any required headers (authorization, etc.)
            // 'Authorization': 'Bearer YOUR_API_KEY',
          },
          body: JSON.stringify({
            role,
            jobDescription: jdText,
            instructions
          })
        });

        if (!response.ok) {
          throw new Error('Text processing failed');
        }

        const result = await response.json();
        
        // Store the API response data
        localStorage.setItem('jdData', JSON.stringify({
          role,
          fileName: "Pasted Job Description",
          jdContent: jdText,
          instructions,
          apiData: result,
          timestamp: Date.now()
        }));
      }

      // Navigate to comparison page
      setTimeout(() => {
        navigate('/jd-comparison');
      }, 1500);

    } catch (error) {
      console.error('API Error:', error);
      toast({
        title: "Processing failed",
        description: "There was an error processing your job description. Please try again.",
        variant: "destructive",
      });
      
      // Fallback: Store data locally for demo purposes
      localStorage.setItem('jdData', JSON.stringify({
        role,
        fileName: inputMethod === "upload" ? file?.name : "Pasted Job Description",
        jdContent: inputMethod === "text" ? jdText : null,
        instructions,
        timestamp: Date.now()
      }));
      
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
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              {!showCustomRole ? (
                <div className="flex space-x-2">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomRole(true)}
                    className="flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Custom</span>
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter custom role..."
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCustomRole(false);
                      setCustomRole("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Job Description Input Method Selection */}
            <div className="space-y-4">
              <Label>Job Description Input Method</Label>
              <div className="flex space-x-2">
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
                  <span>Copy & Paste</span>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change File
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click "Upload Document" above to select your job description file.
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
                  <p className="text-xs text-muted-foreground">
                    Paste the complete job description content here.
                  </p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions">Additional Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                placeholder="Add any specific requirements, preferences, or areas of focus for this role..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Provide any additional context or specific areas you want to emphasize in the job description analysis.
              </p>
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
    </Layout>
  );
};

export default JDUpload;