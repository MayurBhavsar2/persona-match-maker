import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Edit3, CheckCircle, FileText, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const JDComparison = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedVersion, setSelectedVersion] = useState<"original" | "ai" | null>(null);
  const [isEditing, setIsEditing] = useState({ original: false, ai: false });
  
  // Get role name from JD data
  const getSelectedRole = () => {
    const jdData = localStorage.getItem('jdData');
    if (jdData) {
      const parsedJD = JSON.parse(jdData);
      return parsedJD.role || 'Not specified';
    }
    return localStorage.getItem('selectedRole') || 'Not specified';
  };
  const selectedRole = getSelectedRole();
  const [originalJD, setOriginalJD] = useState(`Position: RPA Developer

Job Summary:
We are seeking an experienced RPA Developer to join our automation team. The candidate will be responsible for developing, testing, and maintaining robotic process automation solutions.

Key Responsibilities:
• Design and develop RPA workflows using UiPath/Blue Prism
• Collaborate with business analysts to identify automation opportunities
• Test and debug automation scripts
• Provide technical support for deployed bots

Requirements:
• 3+ years of experience in RPA development
• Proficiency in UiPath or Blue Prism
• Basic understanding of programming languages
• Strong analytical skills`);

  const [aiGeneratedJD, setAiGeneratedJD] = useState(`Position: RPA Developer - Senior Level

Job Summary:
We are seeking a highly skilled RPA Developer to design, develop, and deploy enterprise-grade robotic process automation solutions. The ideal candidate will drive digital transformation initiatives and optimize business processes through intelligent automation.

Key Responsibilities:
• Architect and develop scalable RPA workflows using UiPath, Blue Prism, or Automation Anywhere
• Conduct comprehensive process analysis and automation feasibility assessments
• Implement advanced automation features including AI/ML integration, OCR, and API connectivity
• Collaborate with cross-functional teams to identify high-impact automation opportunities
• Establish automation governance frameworks and best practices
• Mentor junior developers and provide technical leadership
• Monitor bot performance and implement continuous improvement strategies

Technical Requirements:
• 5+ years of hands-on experience in RPA development
• Expert proficiency in UiPath, Blue Prism, or Automation Anywhere platforms
• Strong programming skills in C#, Python, VB.NET, or Java
• Experience with database technologies (SQL Server, Oracle, MySQL)
• Knowledge of web technologies (HTML, CSS, JavaScript, REST APIs)
• Familiarity with cloud platforms (Azure, AWS) and containerization (Docker)
• Understanding of AI/ML concepts and integration with RPA platforms

Soft Skills:
• Excellent analytical and problem-solving abilities
• Strong communication and stakeholder management skills
• Detail-oriented with focus on quality and accuracy
• Ability to work independently and manage multiple projects
• Continuous learning mindset and adaptability to new technologies

Preferred Qualifications:
• RPA platform certifications (UiPath Advanced Developer, Blue Prism Professional)
• Experience with process mining tools (Celonis, Process Street)
• Knowledge of business process management (BPM) principles
• Agile/Scrum methodology experience`);

  const handleSelectVersion = async (version: "original" | "ai") => {
    setSelectedVersion(version);
    
    const finalJD = version === "original" ? originalJD : aiGeneratedJD;
    
    try {
      // TODO: Replace with your actual API endpoint for JD version selection
      const response = await fetch('YOUR_API_ENDPOINT_FOR_JD_SELECTION', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any required headers (authorization, etc.)
          // 'Authorization': 'Bearer YOUR_API_KEY',
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
      
      // Store both local data and API response
      localStorage.setItem('selectedJD', JSON.stringify({
        version: version,
        content: finalJD,
        apiData: result,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('API Error:', error);
      // Fallback: Store data locally
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

    // Navigate directly to persona config
    navigate('/persona-config');
  };

  const handleProceed = () => {
    if (!selectedVersion) {
      toast({
        title: "Please select a version",
        description: "Choose either the original or AI-enhanced job description to proceed.",
        variant: "destructive",
      });
      return;
    }

    const finalJD = selectedVersion === "original" ? originalJD : aiGeneratedJD;
    localStorage.setItem('selectedJD', JSON.stringify({
      version: selectedVersion,
      content: finalJD,
      timestamp: Date.now()
    }));

    toast({
      title: "Job description confirmed",
      description: "Proceeding to persona configuration...",
    });

    navigate('/persona-config');
  };

  const toggleEdit = (version: "original" | "ai") => {
    setIsEditing(prev => ({ ...prev, [version]: !prev[version] }));
  };

  return (
    <Layout currentStep={1}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">Job Description Comparison</h1>
            <span className="text-muted-foreground">|</span>
            <span className="text-xl font-bold text-primary">{selectedRole}</span>
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
                <Button
                  variant="outline"
                  onClick={() => toggleEdit("original")}
                  className="flex items-center space-x-1"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditing.original ? "Save Changes" : "Edit"}</span>
                </Button>
                
                <Button
                  variant={selectedVersion === "original" ? "success" : "default"}
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
                <Button
                  variant="outline"
                  onClick={() => toggleEdit("ai")}
                  className="flex items-center space-x-1"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditing.ai ? "Save Changes" : "Edit"}</span>
                </Button>
                
                <Button
                  variant={selectedVersion === "ai" ? "success" : "gradient"}
                  onClick={() => handleSelectVersion("ai")}
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
    </Layout>
  );
};

export default JDComparison;