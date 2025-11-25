import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Plus, ChevronRight, Type, File, X, Check, ChevronsUpDown, Edit3, CheckCircle, Sparkles, Undo2, Building2, MapPin, Globe, Save, Phone, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [hiringManagers, setHiringManagers] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [openManagerPopover, setOpenManagerPopover] = useState(false);
  const [title, setTitle] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<"original" | "ai" | null>(null);
  const [isEditing, setIsEditing] = useState({ original: false, ai: false });
  const [savedOriginalJD, setSavedOriginalJD] = useState("");
  const [savedAiJD, setSavedAiJD] = useState("");
  const [originalJD, setOriginalJD] = useState("");
  const [aiGeneratedJD, setAiGeneratedJD] = useState("");
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [openCompanyDialog, setOpenCompanyDialog] = useState(false);

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

  // Fetch hiring managers from API
  useEffect(() => {
    const fetchHiringManagers = async () => {
      setLoadingManagers(true);
      try {
        // TODO: Replace with your actual API endpoint for fetching hiring managers
        const response = await fetch('YOUR_API_ENDPOINT_FOR_HIRING_MANAGERS', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add any required headers (authorization, etc.)
            // 'Authorization': 'Bearer YOUR_API_KEY',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch hiring managers');
        }

        const data = await response.json();
        
        // TODO: Adjust based on your API response structure
        // Expected format: [{ id: "1", name: "John Doe" }, { id: "2", name: "Jane Smith" }]
        setHiringManagers(data.hiringManagers || data);
        
      } catch (error) {
        console.error('Error fetching hiring managers:', error);
        toast({
          title: "Failed to load hiring managers",
          description: "Using default list. Please check your API connection.",
          variant: "destructive",
        });
        
        // Fallback: Demo data for testing
        setHiringManagers([
          { id: "1", name: "John Doe" },
          { id: "2", name: "Jane Smith" },
          { id: "3", name: "Michael Johnson" }
        ]);
      } finally {
        setLoadingManagers(false);
      }
    };

    fetchHiringManagers();
  }, []);

  // Fetch companies from API
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        // TODO: Replace with your actual API endpoint for fetching companies
        const response = await fetch('YOUR_API_ENDPOINT_FOR_COMPANIES', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add any required headers (authorization, etc.)
            // 'Authorization': 'Bearer YOUR_API_KEY',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }

        const data = await response.json();
        
        // TODO: Adjust based on your API response structure
        // Expected format: [{ id: "1", name: "Company A" }, { id: "2", name: "Company B" }]
        setCompanies(data.companies || data);
        
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast({
          title: "Failed to load companies",
          description: "Using default list. Please check your API connection.",
          variant: "destructive",
        });
        
        // Fallback: Demo data for testing
        setCompanies([
          { id: "1", name: "Tech Corp" },
          { id: "2", name: "Innovation Labs" },
          { id: "3", name: "Digital Solutions" }
        ]);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

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

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a job title.",
        variant: "destructive",
      });
      return;
    }

    if (selectedManagers.length === 0) {
      toast({
        title: "Hiring Manager required",
        description: "Please select at least one hiring manager.",
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
      let extractedText = inputMethod === "text" ? jdText : "";
      
      if (inputMethod === "upload" && file) {
        // TODO: Replace with your actual file upload API endpoint
        const formData = new FormData();
        formData.append('file', file);
        formData.append('role', role);
        formData.append('title', title);
        formData.append('hiringManagers', JSON.stringify(selectedManagers));
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
        extractedText = result.extractedText || "Sample extracted text from file";
        
        // Store the API response data
        localStorage.setItem('jdData', JSON.stringify({
          role,
          title,
          hiringManagers: selectedManagers,
          fileName: file.name,
          jdContent: extractedText,
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
            title,
            hiringManagers: selectedManagers,
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
          title,
          hiringManagers: selectedManagers,
          fileName: "Pasted Job Description",
          jdContent: jdText,
          instructions,
          apiData: result,
          timestamp: Date.now()
        }));
      }

      // Set original and AI-generated JDs
      setOriginalJD(extractedText);
      setAiGeneratedJD(generateAIEnhancedJD(extractedText, role));
      
      // Show comparison section
      toast({
        title: "Analysis complete",
        description: "Scroll down to compare versions",
      });
      
      setTimeout(() => {
        setShowComparison(true);
      }, 500);

    } catch (error) {
      console.error('API Error:', error);
      
      // Fallback: Store data locally and show comparison with sample data
      const fallbackJD = inputMethod === "text" ? jdText : `Position: ${role}\n\nJob Summary:\nSample job description content.`;
      
      localStorage.setItem('jdData', JSON.stringify({
        role,
        title,
        hiringManagers: selectedManagers,
        fileName: inputMethod === "upload" ? file?.name : "Pasted Job Description",
        jdContent: fallbackJD,
        instructions,
        timestamp: Date.now()
      }));
      
      setOriginalJD(fallbackJD);
      setAiGeneratedJD(generateAIEnhancedJD(fallbackJD, role));
      
      toast({
        title: "Using demo data",
        description: "Scroll down to compare versions",
      });
      
      setTimeout(() => {
        setShowComparison(true);
      }, 500);
    }
  };

  const generateAIEnhancedJD = (originalText: string, role: string) => {
    // This is a placeholder function that generates AI-enhanced JD
    // In production, this would come from your API
    return `Position: ${role} - Senior Level

Job Summary:
Enhanced and comprehensive job description with modern industry standards and best practices.

Key Responsibilities:
• Advanced technical implementations and architecture design
• Cross-functional collaboration and team leadership
• Strategic planning and project management
• Continuous improvement and innovation initiatives

Technical Requirements:
• 5+ years of relevant experience
• Expert-level proficiency in required technologies
• Strong problem-solving and analytical skills
• Experience with modern frameworks and tools

Soft Skills:
• Excellent communication and interpersonal abilities
• Leadership and mentoring capabilities
• Adaptability and continuous learning mindset
• Strong attention to detail and quality focus

Preferred Qualifications:
• Industry certifications
• Advanced degree or equivalent experience
• Contribution to open-source projects`;
  };

  const toggleEdit = (version: "original" | "ai") => {
    if (!isEditing[version]) {
      if (version === "original") {
        setSavedOriginalJD(originalJD);
      } else {
        setSavedAiJD(aiGeneratedJD);
      }
    }
    setIsEditing(prev => ({ ...prev, [version]: !prev[version] }));
  };

  const handleUndo = (version: "original" | "ai") => {
    if (version === "original") {
      setOriginalJD(savedOriginalJD);
    } else {
      setAiGeneratedJD(savedAiJD);
    }
  };

  const handleSelectVersion = async (version: "original" | "ai") => {
    setSelectedVersion(version);
    
    const finalJD = version === "original" ? originalJD : aiGeneratedJD;
    
    try {
      const response = await fetch('YOUR_API_ENDPOINT_FOR_JD_SELECTION', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedVersion: version,
          jobDescription: finalJD,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error('JD selection API call failed');
      }

      const result = await response.json();
      
      localStorage.setItem('selectedJD', JSON.stringify({
        version: version,
        content: finalJD,
        apiData: result,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('API Error:', error);
      localStorage.setItem('selectedJD', JSON.stringify({
        version: version,
        content: finalJD,
        timestamp: Date.now()
      }));
    }

    toast({
      title: "Version selected",
      description: `Proceeding to persona configuration with ${version === "original" ? "Original" : "AI Enhanced"} job description...`,
    });

    navigate('/persona-config');
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
            {/* Role, Hiring Manager, and Title Section */}
            <div className="space-y-3">
              {/* Role and Hiring Manager Selection - Single Row */}
              <div className="flex items-center gap-2">
              <Label htmlFor="role" className="text-base whitespace-nowrap">Role</Label>
              <div className="flex-1">
                {!showCustomRole ? (
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
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
                ) : (
                  <Input
                    placeholder="Enter custom role..."
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                  />
                )}
              </div>
              
              <Label htmlFor="hiringManager" className="text-base whitespace-nowrap">Manager</Label>
              <div className="flex-1">
                <Popover open={openManagerPopover} onOpenChange={setOpenManagerPopover}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openManagerPopover}
                      className="w-full justify-between h-10 px-3 py-2 text-sm font-normal bg-background border-input hover:bg-background hover:text-foreground"
                      disabled={loadingManagers}
                    >
                      <span className={cn(
                        selectedManagers.length === 0 && "text-muted-foreground"
                      )}>
                        {selectedManagers.length > 0
                          ? `${selectedManagers.length} manager${selectedManagers.length > 1 ? 's' : ''} selected`
                          : loadingManagers ? "Loading..." : "Select manager(s)..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                    <Command>
                      <CommandInput placeholder="Search managers..." />
                      <CommandList>
                        <CommandEmpty>No manager found.</CommandEmpty>
                        <CommandGroup>
                          {hiringManagers.map((manager) => (
                            <CommandItem
                              key={manager.id}
                              value={manager.name}
                              onSelect={() => {
                                setSelectedManagers(
                                  selectedManagers.includes(manager.name)
                                    ? selectedManagers.filter((m) => m !== manager.name)
                                    : [...selectedManagers, manager.name]
                                );
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedManagers.includes(manager.name) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {manager.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {!showCustomRole ? (
                <Button
                  variant="outline"
                  onClick={() => setShowCustomRole(true)}
                  className="flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Custom</span>
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

              {/* Title, Company, and Add Company Button */}
              <div className="flex items-center gap-2">
                <Label htmlFor="title" className="text-base whitespace-nowrap">Title</Label>
                <div className="flex-1">
                  <Input
                    id="title"
                    placeholder="Enter job title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <Label htmlFor="company" className="text-base whitespace-nowrap">Company</Label>
                <div className="flex-1">
                  <Select value={selectedCompany} onValueChange={setSelectedCompany} disabled={loadingCompanies}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCompanies ? "Loading..." : "Select company..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setOpenCompanyDialog(true)}
                  className="flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Company</span>
                </Button>
              </div>
            </div>

            {/* Job Description Input Method Selection */}
            <div className="space-y-4">
              <Label className="text-base">Job Description Input Method</Label>
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
                          <X className="w-4 h-4" />
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
              <Label htmlFor="instructions" className="text-base">Additional Instructions (Optional)</Label>
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

        {/* JD Comparison Section - Only shown after analysis */}
        {showComparison && (
          <div className="space-y-8 pt-12 border-t border-border">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl font-bold text-foreground">Job Description Comparison</h2>
                <span className="text-muted-foreground">|</span>
                <span className="text-xl font-bold text-primary">{showCustomRole ? customRole : selectedRole}</span>
              </div>
              <p className="text-lg text-muted-foreground">
                Compare your original JD with our AI-enhanced version and select the one that best fits your needs
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Original JD */}
              <Card className={`shadow-card transition-all duration-300 ${
                selectedVersion === "original" ? "ring-2 ring-primary border-primary" : ""
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <CardTitle>Original Job Description</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Your Version</Badge>
                      {selectedVersion === "original" && (
                        <CheckCircle className="w-5 h-5 text-success" />
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    The job description you uploaded
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing.original ? (
                    <Textarea
                      value={originalJD}
                      onChange={(e) => setOriginalJD(e.target.value)}
                      rows={20}
                      className="font-mono text-sm"
                    />
                  ) : (
                    <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-sans">{originalJD}</pre>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => toggleEdit("original")}
                        className="flex items-center space-x-1"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>{isEditing.original ? "Save Changes" : "Edit"}</span>
                      </Button>
                      {isEditing.original && (
                        <Button
                          variant="outline"
                          onClick={() => handleUndo("original")}
                          className="flex items-center space-x-1"
                        >
                          <Undo2 className="w-4 h-4" />
                          <span>Undo</span>
                        </Button>
                      )}
                    </div>
                    
                    <Button
                      variant={selectedVersion === "original" ? "default" : "outline"}
                      onClick={() => handleSelectVersion("original")}
                    >
                      {selectedVersion === "original" ? "Selected" : "Select This Version"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Enhanced JD */}
              <Card className={`shadow-card transition-all duration-300 ${
                selectedVersion === "ai" ? "ring-2 ring-primary border-primary" : ""
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-secondary" />
                      <CardTitle>AI-Enhanced Job Description</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-gradient-secondary text-secondary-foreground">
                        AI Optimized
                      </Badge>
                      {selectedVersion === "ai" && (
                        <CheckCircle className="w-5 h-5 text-success" />
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    Our AI-enhanced version with comprehensive requirements and modern standards
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing.ai ? (
                    <Textarea
                      value={aiGeneratedJD}
                      onChange={(e) => setAiGeneratedJD(e.target.value)}
                      rows={20}
                      className="font-mono text-sm"
                    />
                  ) : (
                    <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-sans">{aiGeneratedJD}</pre>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => toggleEdit("ai")}
                        className="flex items-center space-x-1"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>{isEditing.ai ? "Save Changes" : "Edit"}</span>
                      </Button>
                      {isEditing.ai && (
                        <Button
                          variant="outline"
                          onClick={() => handleUndo("ai")}
                          className="flex items-center space-x-1"
                        >
                          <Undo2 className="w-4 h-4" />
                          <span>Undo</span>
                        </Button>
                      )}
                    </div>
                    
                    <Button
                      variant={selectedVersion === "ai" ? "default" : "outline"}
                      onClick={() => handleSelectVersion("ai")}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      {selectedVersion === "ai" ? "Selected" : "Select This Version"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Enhancement Highlights */}
            <Card className="shadow-card bg-gradient-subtle">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  <span>AI Enhancement Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-success font-bold">+85%</span>
                    </div>
                    <h3 className="font-semibold text-foreground">More Comprehensive</h3>
                    <p className="text-sm text-muted-foreground">Added detailed technical requirements and modern skills</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">+12</span>
                    </div>
                    <h3 className="font-semibold text-foreground">Additional Skills</h3>
                    <p className="text-sm text-muted-foreground">Cloud platforms, AI/ML integration, and modern frameworks</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-secondary font-bold">+90%</span>
                    </div>
                    <h3 className="font-semibold text-foreground">Better Structure</h3>
                    <p className="text-sm text-muted-foreground">Improved formatting and industry-standard sections</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Company Dialog */}
        <Dialog open={openCompanyDialog} onOpenChange={setOpenCompanyDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-primary" />
                <span>Company Configuration</span>
              </DialogTitle>
            </DialogHeader>
            
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>Company Information</span>
                </CardTitle>
                <CardDescription>
                  Enter your company details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base">Company Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter company name..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website_url" className="text-base">Company Website URL</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="website_url"
                        type="url"
                        placeholder="https://www.example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_number" className="text-base">Contact Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="contact_number"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email_address" className="text-base">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email_address"
                        type="email"
                        placeholder="contact@example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street" className="text-base flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>Street Address</span>
                    </Label>
                    <Input
                      id="street"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-base">City</Label>
                      <Input
                        id="city"
                        placeholder="City name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-base">State</Label>
                      <Input
                        id="state"
                        placeholder="State/Province"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-base">Country</Label>
                      <Input
                        id="country"
                        placeholder="Country name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="text-base">Pincode</Label>
                      <Input
                        id="pincode"
                        placeholder="123456"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-foreground">Social Media Links</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitter_link" className="text-base">Twitter Link</Label>
                      <Input
                        id="twitter_link"
                        type="url"
                        placeholder="https://twitter.com/yourcompany"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram_link" className="text-base">Instagram Link</Label>
                      <Input
                        id="instagram_link"
                        type="url"
                        placeholder="https://instagram.com/yourcompany"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook_link" className="text-base">Facebook Link</Label>
                      <Input
                        id="facebook_link"
                        type="url"
                        placeholder="https://facebook.com/yourcompany"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin_link" className="text-base">LinkedIn Link</Label>
                      <Input
                        id="linkedin_link"
                        type="url"
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>
                  </div>
                </div>

                {/* About Company */}
                <div className="space-y-2">
                  <Label htmlFor="about_company" className="text-base">About Company</Label>
                  <Textarea
                    id="about_company"
                    placeholder="Tell us about your company, its mission, values, and culture..."
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a brief description of your company that will be used in communications and reports.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => {
                      toast({
                        title: "Company saved",
                        description: "Company information has been saved successfully.",
                      });
                      setOpenCompanyDialog(false);
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Configuration</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default JDUpload;