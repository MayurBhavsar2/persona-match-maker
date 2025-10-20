import { useState,useEffect } from "react";
import { mockGenerateAIEnhancedJD } from "@/mocks/mockAiRefine";
import { useNavigate,useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Edit3, CheckCircle, FileText, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const JDComparison = () => {
  const { jdId } = useParams<{ jdId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedVersion, setSelectedVersion] = useState<"original" | "ai" | null>(null);
  const [isEditing, setIsEditing] = useState({ original: false, ai: false });
  
  const [originalJD, setOriginalJD] = useState<string>("Loading Original JD.....");
  const [aiGeneratedJD, setAiGeneratedJD] = useState<string>(`Loading AI Enhanced JD.....`);

  // const generatePersonaFromJD = async (jdId: string) => {
  //   try {
  //     const response = await fetch(
  //       `/api/v1/persona/generate-from-jd/${jdId}`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       }
  //     );

  //     if (!response.ok) throw new Error("Failed to generate persona from JD");

  //     const data = await response.json();
  //     console.log("Persona generated successfully:", data);
  //     localStorage.setItem("generatedPersona", JSON.stringify(data));
  //     navigate(`/persona-config/${data.job_description_id}`);
  //     return data;
  //   } catch (error) {
  //     console.error("Error generating persona:", error);
  //   }
  // };

    
                  //     `Position: RPA Developer

                  // Job Summary:
                  // We are seeking an experienced RPA Developer to join our automation team. The candidate will be responsible for developing, testing, and maintaining robotic process automation solutions.

                  // Key Responsibilities:
                  // • Design and develop RPA workflows using UiPath/Blue Prism
                  // • Collaborate with business analysts to identify automation opportunities
                  // • Test and debug automation scripts
                  // • Provide technical support for deployed bots

                  // Requirements:
                  // • 3+ years of experience in RPA development
                  // • Proficiency in UiPath or Blue Prism
                  // • Basic understanding of programming languages
                  // • Strong analytical skills`


  
    
                      //     `Position: RPA Developer - Senior Level

                      // Job Summary:
                      // We are seeking a highly skilled RPA Developer to design, develop, and deploy enterprise-grade robotic process automation solutions. The ideal candidate will drive digital transformation initiatives and optimize business processes through intelligent automation.

                      // Key Responsibilities:
                      // • Architect and develop scalable RPA workflows using UiPath, Blue Prism, or Automation Anywhere
                      // • Conduct comprehensive process analysis and automation feasibility assessments
                      // • Implement advanced automation features including AI/ML integration, OCR, and API connectivity
                      // • Collaborate with cross-functional teams to identify high-impact automation opportunities
                      // • Establish automation governance frameworks and best practices
                      // • Mentor junior developers and provide technical leadership
                      // • Monitor bot performance and implement continuous improvement strategies

                      // Technical Requirements:
                      // • 5+ years of hands-on experience in RPA development
                      // • Expert proficiency in UiPath, Blue Prism, or Automation Anywhere platforms
                      // • Strong programming skills in C#, Python, VB.NET, or Java
                      // • Experience with database technologies (SQL Server, Oracle, MySQL)
                      // • Knowledge of web technologies (HTML, CSS, JavaScript, REST APIs)
                      // • Familiarity with cloud platforms (Azure, AWS) and containerization (Docker)
                      // • Understanding of AI/ML concepts and integration with RPA platforms

                      // Soft Skills:
                      // • Excellent analytical and problem-solving abilities
                      // • Strong communication and stakeholder management skills
                      // • Detail-oriented with focus on quality and accuracy
                      // • Ability to work independently and manage multiple projects
                      // • Continuous learning mindset and adaptability to new technologies

                      // Preferred Qualifications:
                      // • RPA platform certifications (UiPath Advanced Developer, Blue Prism Professional)
                      // • Experience with process mining tools (Celonis, Process Street)
                      // • Knowledge of business process management (BPM) principles
                      // • Agile/Scrum methodology experience`
                      

  // const handleSelectVersion = (version: "original" | "ai") => {
  //   setSelectedVersion(version);
    
  //   const finalJD = version === "original" ? originalJD : aiGeneratedJD;
  //   localStorage.setItem('selectedJD', JSON.stringify({
  //     version: version,
  //     content: finalJD,
  //     timestamp: Date.now()
  //   }));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!jdId) return;
    const fetchOriginalJD = async () => {
      setLoading(true);
      try {
        // if backend requires token
        
        //const { jdId } = useParams<{ jdId: string }>();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/${jdId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });

        if (!response.ok) throw new Error("Failed to fetch Original JD");

        const data = await response.json();
      
        // Assuming backend returns { original_text: "JD content..." }
        setOriginalJD(data.original_text);
        await generateAIEnhancedJD(data);

      } catch (error) {
        console.error("Error fetching Original JD:", error);
         if (error instanceof Response) {
    console.log(await error.text());
    }
        setOriginalJD("⚠️ Failed to load Job Description from server.");
      }finally{
        setLoading(false);
      }
    };

    fetchOriginalJD();
  }, [jdId]);

const USE_MOCK_API = true;

const generateAIEnhancedJD = async (jdData: any) => {
  try {
    let data;

    if (USE_MOCK_API) {
      data = await mockGenerateAIEnhancedJD(jdData);
    } else {
      const payload = {
        role: jdData.role || "",
        company_id: "",
        methodology: "direct",
        min_similarity: 0.5,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/${jdId}/refine/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to generate AI Enhanced JD");

      data = await response.json();
    }
      // console.log("Mock/Real API Response:", data);

    const cleanedRefinedText = (data || "⚠️ No AI-enhanced JD returned").replace(/\*/g, " ");
    setAiGeneratedJD(cleanedRefinedText);

  } catch (error) {
    console.error("Error generating AI Enhanced JD:", error);
    setAiGeneratedJD("⚠️ Failed to generate AI Enhanced JD.");
  }
};



//   const fetchHighlights = async () => {
//   try {
//     const response = await fetch(`/api/v1/jd/${jdId}/diff?format=table`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//     });
//     if (!response.ok) throw new Error("Failed to fetch highlights");
//     const data = await response.json();

//     // Render the diff_html directly
//     setAiGeneratedJD(data.diff_html || "⚠️ No highlights returned");
//   } catch (error) {
//     console.error("Error fetching highlights:", error);
//   }
// };
const handleSelect = async (version: "original" | "ai") => {
  try {
    // If user is editing, save the changes first
    if (isEditing[version]) {
      const updatedText = version === "original" ? originalJD : aiGeneratedJD;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/${jdId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          selectedVersion: version,
          selected_text: updatedText,
          selected_edited: true
        }),
      });

      if (!response.ok) throw new Error("Failed to save edits");

      await response.json();

      // Turn off editing mode
      toggleEdit(version);
    }

    // Now select the version
    await handleSelectVersion(version);
  } catch (error) {
    console.error("Error saving edits before selecting version:", error);
  }
};



  const handleSelectVersion = async (version: "original" | "ai") => {
    setSelectedVersion(version);
    
    const finalJD = version === "original" ? originalJD : aiGeneratedJD;
    
    // Store selection locally
  localStorage.setItem('selectedJD', JSON.stringify({
    jdId,
    version,
    content: finalJD,
    timestamp: Date.now()
  }));

  toast({
    title: "Version selected",
    description: `Proceeding to persona configuration with ${version === "original" ? "Original" : "AI Enhanced"} job description...`,
  });

  navigate(`/persona-config/${jdId}`);
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
      jdId,
      version: selectedVersion,
      content: finalJD,
      timestamp: Date.now()
    }));

    toast({
      title: "Job description confirmed",
      description: "Proceeding to persona configuration...",
    });

    navigate(`/persona-config/${jdId}`);
  };

  const toggleEdit = async (version: "original" | "ai") => {
  if (isEditing[version]) {
    // User clicked "Save Changes" -> Call PATCH API
    const updatedText = version === "original" ? originalJD : aiGeneratedJD;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/${jdId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          selected_version: version,
          selected_text: updatedText,
          selected_edited: true
        })
      });

      if (!response.ok) throw new Error('Failed to save changes');

      const result = await response.json();

      toast({
        title: "Changes saved",
        description: `${version === "original" ? "Original JD" : "AI JD"} updated successfully.`,
      });

      // Optionally update localStorage if needed
      localStorage.setItem('selectedJD', JSON.stringify({
        jdId,
        version,
        content: updatedText,
        apiData: result,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error("Error saving JD:", error);
      toast({
        title: "Save failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive"
      });
       return;
    }
  }

  // Toggle edit mode
  setIsEditing(prev => ({ ...prev, [version]: !prev[version] }));
};


  return (
    <Layout currentStep={1}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Job Description Comparison</h1>
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
                  <Badge className="bg-blue-100 text-blue-800 font-medium px-2 py-1 rounded-md">Your Version</Badge>
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
                
                <div className="flex items-center space-x-2">
                        <Checkbox
  id="originalJD"
  checked={selectedVersion === "original"}
  onCheckedChange={(checked) => {
    if (checked) handleSelect("original");
  }}
/>
                        <label
                          htmlFor="originalJD"
                          className={`text-sm font-medium leading-none ${
                            selectedVersion === "original" ? 'text-success' : 'text-foreground'
                          }`}
                        >
                          Select Original JD
                        </label>
                      </div>

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
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 font-medium px-2 py-1 rounded-md">
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
                  <pre className="whitespace-pre-wrap text-sm font-sans">{aiGeneratedJD}</pre>
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
                
                <div className="flex items-center space-x-2">
                      <Checkbox
  id="aiJD"
  checked={selectedVersion === "ai"}
  onCheckedChange={(checked) => {
    if (checked) handleSelect("ai");
  }}
/>
                      <label
                        htmlFor="aiJD"
                        className={`text-sm font-medium leading-none ${
                          selectedVersion === "ai" ? 'text-success' : 'text-foreground'
                        }`}
                      >
                        Select AI Enhanced JD
                      </label>

                    </div>

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