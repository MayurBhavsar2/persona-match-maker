import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, ChevronRight, Type } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const JDUpload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [jdText, setJdText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [showCustomRole, setShowCustomRole] = useState(false);
  const [showJdInput, setShowJdInput] = useState(false);

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


  const handleSubmit = () => {
    const role = showCustomRole ? customRole : selectedRole;
    
    if (!role) {
      toast({
        title: "Role required",
        description: "Please select or enter a role.",
        variant: "destructive",
      });
      return;
    }

    if (!jdText.trim()) {
      toast({
        title: "Job description required",
        description: "Please enter the job description text.",
        variant: "destructive",
      });
      return;
    }

    // Store data in localStorage for demo purposes
    localStorage.setItem('jdData', JSON.stringify({
      role,
      fileName: "Pasted Job Description",
      jdContent: jdText,
      instructions,
      timestamp: Date.now()
    }));

    toast({
      title: "Processing job description",
      description: "Analyzing your JD and generating recommendations...",
    });

    // Navigate to comparison page
    setTimeout(() => {
      navigate('/jd-comparison');
    }, 1500);
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

            {/* Job Description Input */}
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={showJdInput ? "default" : "outline"}
                  onClick={() => setShowJdInput(true)}
                  className="flex items-center space-x-2"
                >
                  <Type className="w-4 h-4" />
                  <span>Copy & Paste</span>
                </Button>
              </div>

              {showJdInput && (
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