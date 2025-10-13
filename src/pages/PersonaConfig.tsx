import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowRight, Save, AlertCircle, CheckCircle2, Lightbulb, TrendingUp, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SkillCategory {
  id: string;
  name: string;
  weight: number;
  customAddition?: string;
  skills: { 
    name: string; 
    weight: number; 
    requiredLevel: number; 
    notes: string; 
  }[];
}

const PersonaConfig = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [personaName, setPersonaName] = useState("");
  const [isPersonaSaved, setIsPersonaSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("distribution");
  
  // Refs for scrolling to sections
  const distributionRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const aiInsightsRef = useRef<HTMLDivElement>(null);
  
  // Get role name from JD data (stored during JD upload)
  const getSelectedRole = () => {
    const jdData = localStorage.getItem('jdData');
    if (jdData) {
      const parsedJD = JSON.parse(jdData);
      return parsedJD.role || 'Not specified';
    }
    return localStorage.getItem('selectedRole') || 'Not specified';
  };
  const selectedRole = getSelectedRole();
  
  // Scroll to section functions
  const scrollToSection = (section: string) => {
    setActiveTab(section);
    
    // Add a small delay to ensure tab state is updated
    setTimeout(() => {
      const sectionRef = 
        section === 'distribution' ? distributionRef :
        section === 'summary' ? summaryRef :
        aiInsightsRef;
      
      if (sectionRef.current) {
        console.log(`Scrolling to ${section} section`); // Debug log
        
        // Get the element's position
        const rect = sectionRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const elementTop = rect.top + scrollTop;
        
        // Account for sticky header and tabs - more precise calculation
        const headerHeight = 64; // Layout header
        const tabsHeight = 60;   // Sticky tabs
        const padding = 20;      // Extra padding
        const offset = headerHeight + tabsHeight + padding;
        
        window.scrollTo({ 
          top: elementTop - offset,
          behavior: 'smooth'
        });
      } else {
        console.log(`Section ref for ${section} not found`); // Debug log
      }
    }, 150);
  };
  
  // Helper function to analyze JD and generate cognitive demands
  const generateCognitiveDemands = () => {
    const storedJD = localStorage.getItem('selectedJD');
    if (!storedJD) {
      // Return default values if no JD is found
      return [
        { name: "Remember / Understand", weight: 10, requiredLevel: 3, notes: "SDLC, STLC, Testing methodologies, Quality standards" },
        { name: "Apply", weight: 25, requiredLevel: 4, notes: "Test execution, Automation frameworks, CI/CD pipelines" },
        { name: "Analyze", weight: 25, requiredLevel: 4, notes: "Root cause analysis, Log analysis, Performance debugging" },
        { name: "Evaluate", weight: 25, requiredLevel: 4, notes: "Risk assessment, Tool selection, Strategy comparison" },
        { name: "Create", weight: 15, requiredLevel: 3, notes: "Custom tools, Test utilities, Framework development" }
      ];
    }

    const jdData = JSON.parse(storedJD);
    const jdContent = jdData.content.toLowerCase();
    
    // Analyze JD content to determine cognitive demands
    const cognitiveSkills = [
      {
        name: "Remember / Understand",
        keywords: ["knowledge", "understand", "familiar", "awareness", "concepts", "principles", "fundamentals"],
        defaultWeight: 10,
        defaultLevel: 3
      },
      {
        name: "Apply",
        keywords: ["implement", "execute", "apply", "use", "perform", "operate", "run", "deploy"],
        defaultWeight: 25,
        defaultLevel: 4
      },
      {
        name: "Analyze",
        keywords: ["analyze", "debug", "troubleshoot", "investigate", "examine", "review", "assess"],
        defaultWeight: 25,
        defaultLevel: 4
      },
      {
        name: "Evaluate",
        keywords: ["evaluate", "compare", "select", "choose", "decide", "recommend", "optimize"],
        defaultWeight: 25,
        defaultLevel: 4
      },
      {
        name: "Create",
        keywords: ["create", "build", "develop", "design", "architect", "innovate", "improve"],
        defaultWeight: 15,
        defaultLevel: 3
      }
    ];

    // Calculate weights based on keyword frequency in JD
    const skillScores = cognitiveSkills.map(skill => {
      const keywordCount = skill.keywords.reduce((count, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        const matches = jdContent.match(regex);
        return count + (matches ? matches.length : 0);
      }, 0);
      
      return {
        ...skill,
        score: keywordCount,
        adjustedWeight: Math.max(5, skill.defaultWeight + (keywordCount * 3)), // Minimum 5%, increase by 3% per keyword match
        adjustedLevel: Math.min(5, skill.defaultLevel + Math.floor(keywordCount / 3)) // Max level 5, increase level every 3 keyword matches
      };
    });

    // Normalize weights to total 100%
    const totalWeight = skillScores.reduce((sum, skill) => sum + skill.adjustedWeight, 0);
    const normalizedSkills = skillScores.map(skill => ({
      ...skill,
      finalWeight: Math.round((skill.adjustedWeight / totalWeight) * 100)
    }));

    // Generate dynamic notes based on JD content
    return normalizedSkills.map(skill => {
      let notes = "";
      switch (skill.name) {
        case "Remember / Understand":
          notes = jdContent.includes("sdlc") || jdContent.includes("software development") 
            ? "SDLC, STLC, Testing concepts, Quality standards"
            : "Core concepts, Technical principles, Domain knowledge";
          break;
        case "Apply":
          notes = jdContent.includes("automation") || jdContent.includes("testing")
            ? "Test automation, Framework execution, CI/CD implementation"
            : "Solution implementation, Process execution, Tool usage";
          break;
        case "Analyze":
          notes = jdContent.includes("debug") || jdContent.includes("troubleshoot")
            ? "Root cause analysis, Log interpretation, System debugging"
            : "Problem analysis, Data interpretation, Issue investigation";
          break;
        case "Evaluate":
          notes = jdContent.includes("risk") || jdContent.includes("assessment")
            ? "Risk assessment, Tool evaluation, Strategy selection"
            : "Solution evaluation, Decision making, Approach comparison";
          break;
        case "Create":
          notes = jdContent.includes("develop") || jdContent.includes("build")
            ? "Custom tools, Utility development, Framework enhancement"
            : "Innovation, Solution development, Process improvement";
          break;
      }
      return {
        name: skill.name,
        weight: skill.finalWeight,
        requiredLevel: skill.adjustedLevel,
        notes
      };
    });
  };
  
  // Helper function to analyze JD and generate leadership skills
  const generateLeadershipSkills = () => {
    const storedJD = localStorage.getItem('selectedJD');
    if (!storedJD) {
      // Return default values if no JD is found
      return [
        { name: "Peer Mentoring & Reviews", weight: 40, requiredLevel: 3, notes: "Code reviews, Team mentoring, Knowledge sharing, Training delivery" },
        { name: "Cross‑functional Influence", weight: 30, requiredLevel: 3, notes: "Stakeholder management, Cross-team collaboration, Consensus building" },
        { name: "Quality Advocacy / Process Improvement", weight: 30, requiredLevel: 3, notes: "Quality standards, Process optimization, Best practices" }
      ];
    }

    const jdData = JSON.parse(storedJD);
    const jdContent = jdData.content.toLowerCase();
    
    // Analyze JD content to determine leadership skill requirements
    const leadershipSkills = [
      {
        name: "Peer Mentoring & Reviews",
        keywords: ["mentor", "coaching", "training", "review", "guidance", "teach", "onboard", "knowledge transfer"],
        defaultWeight: 40,
        defaultLevel: 3
      },
      {
        name: "Cross‑functional Influence",
        keywords: ["cross-functional", "stakeholder", "influence", "collaborate", "coordinate", "alignment", "consensus"],
        defaultWeight: 30,
        defaultLevel: 3
      },
      {
        name: "Quality Advocacy / Process Improvement",
        keywords: ["quality", "process", "improvement", "standards", "best practices", "optimize", "efficiency", "methodology"],
        defaultWeight: 30,
        defaultLevel: 3
      }
    ];

    // Calculate weights based on keyword frequency in JD
    const skillScores = leadershipSkills.map(skill => {
      const keywordCount = skill.keywords.reduce((count, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        const matches = jdContent.match(regex);
        return count + (matches ? matches.length : 0);
      }, 0);
      
      return {
        ...skill,
        score: keywordCount,
        adjustedWeight: Math.max(15, skill.defaultWeight + (keywordCount * 3)), // Minimum 15%, increase by 3% per keyword match
        adjustedLevel: Math.min(5, skill.defaultLevel + Math.floor(keywordCount / 2)) // Max level 5, increase level every 2 keyword matches
      };
    });

    // Normalize weights to total 100%
    const totalWeight = skillScores.reduce((sum, skill) => sum + skill.adjustedWeight, 0);
    const normalizedSkills = skillScores.map(skill => ({
      ...skill,
      finalWeight: Math.round((skill.adjustedWeight / totalWeight) * 100)
    }));

    // Generate dynamic notes based on JD content
    return normalizedSkills.map(skill => {
      let notes = "";
      switch (skill.name) {
        case "Peer Mentoring & Reviews":
          notes = jdContent.includes("mentor") || jdContent.includes("training") || jdContent.includes("coaching")
            ? "Technical mentoring, Code reviews, Training delivery, Team guidance"
            : "Peer mentoring, Code reviews, Knowledge sharing, Skill development";
          break;
        case "Cross‑functional Influence":
          notes = jdContent.includes("stakeholder") || jdContent.includes("cross-functional") || jdContent.includes("coordinate")
            ? "Stakeholder management, Cross-team collaboration, Consensus building"
            : "Relationship building, Cross-departmental work, Influence skills";
          break;
        case "Quality Advocacy / Process Improvement":
          notes = jdContent.includes("quality") || jdContent.includes("process") || jdContent.includes("improvement")
            ? "Quality standards, Process optimization, Continuous improvement"
            : "Quality excellence, Process enhancement, Best practices";
          break;
      }
      return {
        name: skill.name,
        weight: skill.finalWeight,
        requiredLevel: skill.adjustedLevel,
        notes
      };
    });
  };
  // Helper function to analyze JD and generate foundational behaviors
  const generateFoundationalBehaviors = () => {
    const storedJD = localStorage.getItem('selectedJD');
    if (!storedJD) {
      // Return default values if no JD is found
      return [
        { name: "Communication", weight: 35, requiredLevel: 4, notes: "Written communication, Verbal presentation, Stakeholder management, Team collaboration" },
        { name: "Resilience / Stress Tolerance", weight: 20, requiredLevel: 3, notes: "High-pressure performance, Deadline management, Quality maintenance, Stress management" },
        { name: "Decision‑Making under Uncertainty", weight: 25, requiredLevel: 3, notes: "Informed decisions, Ambiguity handling, Risk-based prioritization, Quick assessment" },
        { name: "Attention to Detail & Documentation", weight: 20, requiredLevel: 3, notes: "Thorough documentation, Accuracy focus, Detail-oriented delivery, Quality standards" }
      ];
    }

    const jdData = JSON.parse(storedJD);
    const jdContent = jdData.content.toLowerCase();
    
    // Analyze JD content to determine foundational behavior requirements
    const behaviorSkills = [
      {
        name: "Communication",
        keywords: ["communication", "present", "collaborate", "team", "stakeholder", "meeting", "discuss"],
        defaultWeight: 35,
        defaultLevel: 4
      },
      {
        name: "Resilience / Stress Tolerance",
        keywords: ["pressure", "deadline", "stress", "pace", "urgent", "critical", "fast-paced"],
        defaultWeight: 20,
        defaultLevel: 3
      },
      {
        name: "Decision‑Making under Uncertainty",
        keywords: ["decision", "judgment", "prioritize", "ambiguous", "uncertain", "complex", "choose"],
        defaultWeight: 25,
        defaultLevel: 3
      },
      {
        name: "Attention to Detail & Documentation",
        keywords: ["detail", "documentation", "accurate", "precise", "quality", "thorough", "document"],
        defaultWeight: 20,
        defaultLevel: 3
      }
    ];

    // Calculate weights based on keyword frequency in JD
    const skillScores = behaviorSkills.map(skill => {
      const keywordCount = skill.keywords.reduce((count, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        const matches = jdContent.match(regex);
        return count + (matches ? matches.length : 0);
      }, 0);
      
      return {
        ...skill,
        score: keywordCount,
        adjustedWeight: Math.max(10, skill.defaultWeight + (keywordCount * 2)), // Minimum 10%, increase by 2% per keyword match
        adjustedLevel: Math.min(5, skill.defaultLevel + Math.floor(keywordCount / 2)) // Max level 5, increase level every 2 keyword matches
      };
    });

    // Normalize weights to total 100%
    const totalWeight = skillScores.reduce((sum, skill) => sum + skill.adjustedWeight, 0);
    const normalizedSkills = skillScores.map(skill => ({
      ...skill,
      finalWeight: Math.round((skill.adjustedWeight / totalWeight) * 100)
    }));

    // Generate dynamic notes based on JD content
    return normalizedSkills.map(skill => {
      let notes = "";
      switch (skill.name) {
        case "Communication":
          notes = jdContent.includes("stakeholder") || jdContent.includes("present")
            ? "Stakeholder presentations, Written communication, Cross-functional discussions, Status updates"
            : "Written communication, Verbal skills, Team collaboration, Documentation";
          break;
        case "Resilience / Stress Tolerance":
          notes = jdContent.includes("fast-paced") || jdContent.includes("deadline") || jdContent.includes("pressure")
            ? "High-pressure performance, Deadline management, Quality maintenance, Fast-paced work"
            : "Stress management, Competing priorities, Performance consistency, Pressure handling";
          break;
        case "Decision‑Making under Uncertainty":
          notes = jdContent.includes("complex") || jdContent.includes("ambiguous")
            ? "Complex problem solving, Ambiguity navigation, Impact-based decisions, Strategic thinking"
            : "Quick assessment, Limited information decisions, Sound judgment, Risk evaluation";
          break;
        case "Attention to Detail & Documentation":
          notes = jdContent.includes("documentation") || jdContent.includes("quality") || jdContent.includes("accurate")
            ? "Quality documentation, Accuracy standards, Detail focus, Documentation standards"
            : "Comprehensive records, Procedure adherence, Precision focus, Quality control";
          break;
      }
      return {
        name: skill.name,
        weight: skill.finalWeight,
        requiredLevel: skill.adjustedLevel,
        notes
      };
    });
  };
  
  // AI Analysis function to provide improvement suggestions
  const generateAIAnalysis = () => {
    const storedJD = localStorage.getItem('selectedJD');
    const jdContent = storedJD ? JSON.parse(storedJD).content.toLowerCase() : '';
    
    const suggestions = [];
    const insights = [];
    const optimizations = [];

    // Analyze weight distribution
    const totalWeight = getTotalWeight();
    if (totalWeight !== 100) {
      suggestions.push({
        type: "critical",
        title: "Weight Distribution",
        description: `Total category weights are ${totalWeight}%. Adjust to exactly 100% for optimal scoring.`,
        action: "Redistribute category weights proportionally"
      });
    }

    // Analyze cognitive demands based on JD
    const cognitiveCategory = categories.find(cat => cat.id === "cognitive");
    if (cognitiveCategory && jdContent.includes("complex") || jdContent.includes("analyze")) {
      const analyzeSkill = cognitiveCategory.skills.find(skill => skill.name === "Analyze");
      if (analyzeSkill && analyzeSkill.weight < 30) {
        suggestions.push({
          type: "improvement",
          title: "Cognitive Analysis Weight",
          description: "JD emphasizes complex analysis. Consider increasing 'Analyze' weight to 30%+",
          action: "Increase analytical requirements based on JD complexity"
        });
      }
    }

    // Analyze technical vs behavioral balance
    const technicalWeight = categories.find(cat => cat.id === "technical")?.weight || 0;
    const behavioralWeight = (categories.find(cat => cat.id === "foundational")?.weight || 0) + 
                            (categories.find(cat => cat.id === "cognitive")?.weight || 0);
    
    if (technicalWeight > 50) {
      insights.push({
        icon: "TrendingUp",
        title: "Technical Focus Detected",
        description: `${technicalWeight}% weight on technical skills suggests a highly technical role`,
        recommendation: "Ensure soft skills aren't undervalued for team collaboration"
      });
    }

    // Leadership requirements analysis
    const leadershipCategory = categories.find(cat => cat.id === "leadership");
    if (jdContent.includes("lead") || jdContent.includes("mentor") || jdContent.includes("senior")) {
      if (leadershipCategory && leadershipCategory.weight < 10) {
        suggestions.push({
          type: "improvement",
          title: "Leadership Weight",
          description: "JD indicates leadership responsibilities. Consider increasing leadership weight to 10%+",
          action: "Align leadership requirements with JD expectations"
        });
      }
    }

    // Experience level optimization
    const avgRequiredLevel = categories.reduce((sum, cat) => 
      sum + cat.skills.reduce((skillSum, skill) => skillSum + skill.requiredLevel, 0) / cat.skills.length, 0
    ) / categories.length;

    if (avgRequiredLevel > 4) {
      insights.push({
        icon: "Target",
        title: "High Standards Configuration",
        description: `Average required level is ${avgRequiredLevel.toFixed(1)} - targeting expert-level candidates`,
        recommendation: "Ensure salary and benefits align with senior-level expectations"
      });
    } else if (avgRequiredLevel < 3) {
      insights.push({
        icon: "Target",
        title: "Balanced Expectations",
        description: `Average required level is ${avgRequiredLevel.toFixed(1)} - suitable for mid-level candidates`,
        recommendation: "Consider if some critical skills need higher requirements"
      });
    }

    // Documentation and quality focus
    if (jdContent.includes("documentation") || jdContent.includes("quality")) {
      const foundationalCategory = categories.find(cat => cat.id === "foundational");
      const docSkill = foundationalCategory?.skills.find(skill => 
        skill.name.includes("Documentation") || skill.name.includes("Detail")
      );
      if (docSkill && docSkill.weight < 25) {
        optimizations.push({
          category: "Foundational Behaviors",
          suggestion: "Increase documentation/detail focus to 25%+ based on JD requirements",
          impact: "Better alignment with quality expectations"
        });
      }
    }

    // Industry-specific optimizations
    if (jdContent.includes("agile") || jdContent.includes("scrum")) {
      optimizations.push({
        category: "Leadership Skills",
        suggestion: "Emphasize cross-functional collaboration for agile environment",
        impact: "Better fit for agile team dynamics"
      });
    }

    return { suggestions, insights, optimizations };
  };
  
  const [categories, setCategories] = useState<SkillCategory[]>([
    {
      id: "technical",
      name: "Technical Skills",
      weight: 40,
      skills: [
        { name: "Core Technology Stack", weight: 30, requiredLevel: 4, notes: "React, Node.js, TypeScript, JavaScript ES6+, REST APIs, microservices architecture" },
        { name: "Programming Languages", weight: 25, requiredLevel: 4, notes: "JavaScript, TypeScript, Python, Java, SQL" },
        { name: "Frameworks & Tools", weight: 20, requiredLevel: 3, notes: "React, Redux, React Query, Express.js, Git, Docker, CI/CD, Jenkins, GitHub Actions" },
        { name: "Database & Data Management", weight: 15, requiredLevel: 3, notes: "PostgreSQL, MySQL, MongoDB, NoSQL, ETL" },
        { name: "Cloud & Infrastructure", weight: 10, requiredLevel: 3, notes: "AWS, Azure, EC2, S3, Lambda, serverless architecture" }
      ]
    },
    {
      id: "cognitive",
      name: "Cognitive Demands",
      weight: 25,
      skills: generateCognitiveDemands()
    },
    {
      id: "values",
      name: "Values (Schwartz)",
      weight: 10,
      skills: [
        { name: "Achievement & Excellence", weight: 30, requiredLevel: 4, notes: "Strong drive to deliver **high-quality software solutions**, meet **project milestones**, and continuously improve **technical skills** and **code quality standards**." },
        { name: "Security & Reliability", weight: 25, requiredLevel: 4, notes: "Commitment to building **secure, scalable systems**. Values **code reliability**, **comprehensive testing**, and following **security best practices** in all implementations." },
        { name: "Innovation & Self-Direction", weight: 25, requiredLevel: 3, notes: "Seeks **creative solutions** to technical challenges, proposes **process improvements**, and works **independently** with **minimal supervision** while meeting deliverables." },
        { name: "Collaboration & Benevolence", weight: 20, requiredLevel: 3, notes: "Values **teamwork**, **knowledge sharing**, **mentoring junior developers**, and contributing to a **positive team culture** through helpful and supportive interactions." }
      ]
    },
    {
      id: "foundational",
      name: "Foundational Behaviors",
      weight: 15,
      skills: generateFoundationalBehaviors()
    },
    {
      id: "leadership",
      name: "Leadership Skills",
      weight: 6,
      skills: generateLeadershipSkills()
    },
    {
      id: "education",
      name: "Education & Experience",
      weight: 4,
      skills: [
        { name: "Educational Background", weight: 40, requiredLevel: 3, notes: "**Bachelor's degree** in **Computer Science**, **Software Engineering**, or **equivalent practical experience**. Relevant **certifications** in **cloud platforms** or **modern frameworks** preferred." },
        { name: "Professional Experience", weight: 60, requiredLevel: 4, notes: "Minimum **5+ years** of **full-stack development** experience. Previous experience in **similar industry/domain** preferred. Track record of **successful project deliveries**." }
      ]
    }
  ]);

  const updateCategoryWeight = (categoryId: string, newWeight: number) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId ? { ...cat, weight: newWeight } : cat
      )
    );
  };

  const updateSkillWeight = (categoryId: string, skillIndex: number, newWeight: number) => {
    setCategories(prev =>
      prev.map(cat => {
        if (cat.id === categoryId) {
          const newSkills = [...cat.skills];
          newSkills[skillIndex] = { ...newSkills[skillIndex], weight: newWeight };
          return { ...cat, skills: newSkills };
        }
        return cat;
      })
    );
  };

  const updateSkillLevel = (categoryId: string, skillIndex: number, newLevel: number) => {
    setCategories(prev =>
      prev.map(cat => {
        if (cat.id === categoryId) {
          const newSkills = [...cat.skills];
          newSkills[skillIndex] = { ...newSkills[skillIndex], requiredLevel: newLevel };
          return { ...cat, skills: newSkills };
        }
        return cat;
      })
    );
  };

  const updateSkillNotes = (categoryId: string, skillIndex: number, newNotes: string) => {
    setCategories(prev =>
      prev.map(cat => {
        if (cat.id === categoryId) {
          const newSkills = [...cat.skills];
          newSkills[skillIndex] = { ...newSkills[skillIndex], notes: newNotes };
          return { ...cat, skills: newSkills };
        }
        return cat;
      })
    );
  };

  
  const updateCustomAddition = (categoryId: string, value: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId ? { ...cat, customAddition: value } : cat
      )
    );
  };

  const getTotalWeight = () => {
    return categories.reduce((sum, cat) => sum + cat.weight, 0);
  };

  const getCategorySkillTotal = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.skills.reduce((sum, skill) => sum + skill.weight, 0) : 0;
  };

  const validateWeights = () => {
    const totalWeight = getTotalWeight();
    const categoryValidations = categories.map(cat => ({
      id: cat.id,
      isValid: getCategorySkillTotal(cat.id) === 100
    }));
    
    return {
      totalValid: totalWeight === 100,
      categoriesValid: categoryValidations.every(cat => cat.isValid),
      categoryValidations
    };
  };

  // Generate default persona name
  const generateDefaultPersonaName = () => {
    // Get role from JD data stored in first step
    const storedJD = localStorage.getItem('jdData');
    let position = 'candidate';
    
    if (storedJD) {
      const jdData = JSON.parse(storedJD);
      position = jdData.role || 'candidate';
    }
    
    // Get username - in a real app this would come from authentication
    const userData = localStorage.getItem('currentUser');
    const username = userData ? JSON.parse(userData).username || 'Admin user' : 'Admin user';
    
    const now = new Date();
    const date = now.toISOString().slice(0, 10); // 2025-09-24
    const time = now.toTimeString().slice(0, 5); // 12:48
    
    return `Persona-${position}-${username}-${date} - ${time}`;
  };

  const handleSavePersona = () => {
    const validation = validateWeights();
    
    if (!validation.totalValid) {
      toast({
        title: "Invalid category weights",
        description: `Total category weights must equal 100%. Current total: ${getTotalWeight()}%`,
        variant: "destructive",
      });
      return;
    }

    if (!validation.categoriesValid) {
      toast({
        title: "Invalid skill weights",
        description: "All skill weights within each category must total 100%",
        variant: "destructive",
      });
      return;
    }

    // Set default persona name and show dialog
    setPersonaName(generateDefaultPersonaName());
    setShowSaveDialog(true);
  };

  const confirmSavePersona = () => {
    if (!personaName.trim()) {
      toast({
        title: "Persona name required",
        description: "Please enter a name for your persona.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('personaConfig', JSON.stringify({
      categories,
      name: personaName.trim(),
      timestamp: Date.now()
    }));

    toast({
      title: "Persona saved successfully",
      description: `Your ideal candidate persona "${personaName}" has been configured and saved.`,
    });

    setIsPersonaSaved(true);
    setShowSaveDialog(false);
    
    // Auto-navigate to candidate upload
    navigate('/candidate-upload');
  };

  const validation = validateWeights();

  return (
    <Layout currentStep={2}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Configure Ideal Persona</h1>
          <p className="text-lg text-muted-foreground">
            Define the weightage for different skills and attributes to create your ideal candidate profile
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm">
            <span className="text-muted-foreground">Role:</span>
            <span className="font-medium text-primary">{selectedRole}</span>
          </div>
        </div>

        {/* Sticky Navigation Tabs */}
        <div className="bg-background border-b border-border sticky top-16 z-30 -mx-6 px-6 py-3">
          <Tabs value={activeTab} onValueChange={scrollToSection} className="w-full max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 h-10 bg-muted">
              <TabsTrigger value="distribution" className="text-sm font-medium">Table of Distribution</TabsTrigger>
              <TabsTrigger value="summary" className="text-sm font-medium">Summary</TabsTrigger>
              <TabsTrigger value="insights" className="text-sm font-medium">AI Insights</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Table of Distribution Section */}
        <div ref={distributionRef} className="space-y-6 mt-6">
          {/* Overall Progress */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Category Weight Distribution</span>
                <div className="flex items-center space-x-2">
                  {validation.totalValid ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  )}
                  <span className={`text-sm font-mono ${
                    validation.totalValid ? 'text-success' : 'text-destructive'
                  }`}>
                    {getTotalWeight()}%
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={getTotalWeight()} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                Total must equal 100% to proceed
              </p>
            </CardContent>
          </Card>

          {/* Categories */}
          <Accordion type="multiple" className="space-y-4">
          {categories.map((category) => {
            const skillTotal = getCategorySkillTotal(category.id);
            const isSkillTotalValid = skillTotal === 100;
            
            return (
              <AccordionItem key={category.id} value={category.id} className="border-0">
                <Card className="shadow-card overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full -ml-6">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-foreground min-w-[350px]">{category.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Input
                            type="number"
                            value={category.weight}
                            onChange={(e) => updateCategoryWeight(category.id, parseInt(e.target.value) || 0)}
                            className="w-16 h-8 text-center font-mono"
                            min="0"
                            max="100"
                          />
                          <span className="text-sm font-mono text-muted-foreground">%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {isSkillTotalValid ? (
                          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                        )}
                        <span className={`text-sm font-mono whitespace-nowrap ${
                          isSkillTotalValid ? 'text-success' : 'text-destructive'
                        }`}>
                          Skills: {skillTotal}%
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0 space-y-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[25%]">Skill Name</TableHead>
                              <TableHead className="w-[15%] text-center">Weight (%)</TableHead>
                              <TableHead className="w-[15%] text-center">Required Level</TableHead>
                              <TableHead className="w-[45%]">Skills & Technologies</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {category.skills.map((skill, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Input
                                    value={skill.name}
                                    onChange={(e) => {
                                      const updatedCategories = categories.map(cat => {
                                        if (cat.id === category.id) {
                                          const updatedSkills = [...cat.skills];
                                          updatedSkills[index] = { ...updatedSkills[index], name: e.target.value };
                                          return { ...cat, skills: updatedSkills };
                                        }
                                        return cat;
                                      });
                                      setCategories(updatedCategories);
                                    }}
                                    className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 font-medium"
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center space-x-1">
                                    <Input
                                      type="number"
                                      value={skill.weight}
                                      onChange={(e) => updateSkillWeight(category.id, index, parseInt(e.target.value) || 0)}
                                      className="w-16 h-8 text-center"
                                      min="0"
                                      max="100"
                                    />
                                    <span className="text-xs text-muted-foreground">%</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Select 
                                    value={skill.requiredLevel.toString()} 
                                    onValueChange={(value) => updateSkillLevel(category.id, index, parseInt(value))}
                                  >
                                    <SelectTrigger className="w-32 h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">1 - Basic</SelectItem>
                                      <SelectItem value="2">2 - Working</SelectItem>
                                      <SelectItem value="3">3 - Proficient</SelectItem>
                                      <SelectItem value="4">4 - Advanced</SelectItem>
                                      <SelectItem value="5">5 - Expert</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Textarea
                                    value={skill.notes}
                                    onChange={(e) => updateSkillNotes(category.id, index, e.target.value)}
                                    className="min-h-[60px] resize-none border-0 p-0 bg-transparent focus-visible:ring-0 font-semibold"
                                    placeholder="React, Node.js, TypeScript..."
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-muted-foreground">
                          Skills total: <span className={`font-mono ${isSkillTotalValid ? 'text-success' : 'text-destructive'}`}>{skillTotal}%</span>
                        </span>
                        <Progress 
                          value={skillTotal} 
                          className={`h-2 w-32 ${isSkillTotalValid ? '' : 'opacity-75'}`}
                        />
                      </div>
                      
                      {/* Custom Addition for this category */}
                      <div className="mt-4 pt-3 border-t">
                        <Label htmlFor={`custom-${category.id}`} className="text-xs font-medium text-muted-foreground">
                          Custom Addition
                        </Label>
                        <Textarea
                          id={`custom-${category.id}`}
                          placeholder="Add custom notes for this category..."
                          className="mt-1 min-h-[60px] text-xs"
                          value={category.customAddition || ""}
                          onChange={(e) => updateCustomAddition(category.id, e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            );
          })}
        </Accordion>
        </div>

        {/* Summary Section */}
        <div ref={summaryRef} className="space-y-6">
          {/* Persona Summary */}
          <Card className="shadow-card bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Persona Configuration Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const skillTotal = getCategorySkillTotal(category.id);
                const isSkillTotalValid = skillTotal === 100;
                
                return (
                  <div key={category.id} className="bg-background/80 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-foreground">{category.name}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono bg-primary/10 px-2 py-1 rounded">
                          {category.weight}%
                        </span>
                        {isSkillTotalValid ? (
                          <CheckCircle2 className="w-3 h-3 text-success" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-destructive" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {category.skills.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground truncate flex-1 mr-2">
                            {skill.name}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                              {skill.weight}%
                            </span>
                            <span className="font-mono bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                              L{skill.requiredLevel}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Skills Total:</span>
                        <span className={`font-mono font-semibold ${
                          isSkillTotalValid ? 'text-success' : 'text-destructive'
                        }`}>
                          {skillTotal}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-border/50 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground">Overall Configuration:</span>
                  {validation.totalValid && validation.categoriesValid ? (
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm text-success font-medium">Valid & Ready</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4 text-warning" />
                      <span className="text-sm text-warning font-medium">Needs Adjustment</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Total Category Weight</div>
                  <div className={`text-sm font-mono font-semibold ${
                    validation.totalValid ? 'text-success' : 'text-destructive'
                  }`}>
                    {getTotalWeight()}% / 100%
                  </div>
                </div>
              </div>
            </div>
            
            {(!validation.totalValid || !validation.categoriesValid) && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-warning mb-1">Configuration Issues:</div>
                    <ul className="space-y-1 text-muted-foreground">
                      {!validation.totalValid && (
                        <li>• Category weights must total exactly 100% (currently {getTotalWeight()}%)</li>
                      )}
                      {!validation.categoriesValid && (
                        <li>• All skill weights within each category must total 100%</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Section */}
        <div ref={aiInsightsRef} className="space-y-6">
          {validation.totalValid && validation.categoriesValid && (
            <Card className="shadow-card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  <span>AI Analysis & Improvement Suggestions</span>
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                const analysis = generateAIAnalysis();
                
                return (
                  <>
                    {analysis.suggestions.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center space-x-2">
                          <Target className="w-4 h-4 text-orange-600" />
                          <span>Priority Improvements</span>
                        </h4>
                        <div className="space-y-2">
                          {analysis.suggestions.map((suggestion, index) => (
                            <div key={index} className={`p-3 rounded-lg border-l-4 ${
                              suggestion.type === 'critical' 
                                ? 'bg-red-50 border-red-400 dark:bg-red-950/20' 
                                : 'bg-orange-50 border-orange-400 dark:bg-orange-950/20'
                            }`}>
                              <div className="font-medium text-sm text-foreground">{suggestion.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">{suggestion.description}</div>
                              <div className="text-xs text-blue-600 mt-2 font-medium">💡 {suggestion.action}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.insights.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span>Configuration Insights</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {analysis.insights.map((insight, index) => (
                            <div key={index} className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                              <div className="font-medium text-sm text-foreground">{insight.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">{insight.description}</div>
                              <div className="text-xs text-green-700 dark:text-green-400 mt-2">📋 {insight.recommendation}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.optimizations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm flex items-center space-x-2">
                          <Lightbulb className="w-4 h-4 text-purple-600" />
                          <span>Optimization Opportunities</span>
                        </h4>
                        <div className="space-y-2">
                          {analysis.optimizations.map((opt, index) => (
                            <div key={index} className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-foreground">{opt.category}</div>
                                  <div className="text-xs text-muted-foreground mt-1">{opt.suggestion}</div>
                                </div>
                                <div className="text-xs text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded ml-2">
                                  {opt.impact}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.suggestions.length === 0 && analysis.insights.length === 0 && analysis.optimizations.length === 0 && (
                      <div className="text-center py-6">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <div className="text-sm font-medium text-foreground">Excellent Configuration!</div>
                        <div className="text-xs text-muted-foreground">Your persona is well-balanced and aligned with the job requirements.</div>
                      </div>
                    )}
                  </>
                );
              })()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => navigate('/jd-comparison')}
          >
            Back to JD Comparison
          </Button>
          
          <div className="flex space-x-4">
            <Button
              variant="success"
              onClick={handleSavePersona}
              disabled={!validation.totalValid || !validation.categoriesValid}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Persona</span>
            </Button>
          </div>
        </div>

        {/* Save Persona Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Save Persona</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="persona-name">Persona Name</Label>
                <Input
                  id="persona-name"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  placeholder="Enter persona name"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Default format: persona-&lt;position&gt;-&lt;username&gt;-&lt;date-time&gt;
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmSavePersona}>
                  OK
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default PersonaConfig;