import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SkillCategory {
  id: string;
  name: string;
  weight: number;
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
  
  // Helper function to analyze JD and generate cognitive demands
  const generateCognitiveDemands = () => {
    const storedJD = localStorage.getItem('selectedJD');
    if (!storedJD) {
      // Return default values if no JD is found
      return [
        { name: "Remember / Understand", weight: 10, requiredLevel: 3, notes: "**SDLC/STLC**, **coverage types**, **definitions**. Understanding of **software development lifecycle**, **testing methodologies**, and **quality assurance principles**." },
        { name: "Apply", weight: 25, requiredLevel: 4, notes: "**Execute plans**; **stable automation runs**. Implement **test strategies**, execute **test cases**, and maintain **consistent automation frameworks**." },
        { name: "Analyze", weight: 25, requiredLevel: 4, notes: "**RCA**; **logs**; **data‑driven debugging**. Perform **root cause analysis**, interpret **system logs**, and use **metrics** for **troubleshooting**." },
        { name: "Evaluate", weight: 25, requiredLevel: 4, notes: "**Weigh risks**; **choose tools/approach**. Assess **testing strategies**, select **appropriate tools**, and make **informed decisions** about **test coverage**." },
        { name: "Create", weight: 15, requiredLevel: 3, notes: "**Build test data/utilities**; **improve suites**. Develop **custom testing tools**, create **test datasets**, and enhance **existing test frameworks**." }
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
            ? "**SDLC/STLC**, **coverage types**, **definitions** as mentioned in JD. Understanding of **software development lifecycle**, **testing methodologies**, and **quality assurance principles**."
            : "**Domain knowledge**, **technical concepts**, **industry standards**. Understanding of **core principles**, **methodologies**, and **best practices** relevant to the role.";
          break;
        case "Apply":
          notes = jdContent.includes("automation") || jdContent.includes("testing")
            ? "**Execute plans**; **stable automation runs** as per JD requirements. Implement **test strategies**, execute **workflows**, and maintain **consistent automation frameworks**."
            : "**Implement solutions**; **execute strategies**. Apply **technical skills**, implement **best practices**, and maintain **consistent delivery** of project requirements.";
          break;
        case "Analyze":
          notes = jdContent.includes("debug") || jdContent.includes("troubleshoot")
            ? "**RCA**; **logs**; **data‑driven debugging** as emphasized in JD. Perform **root cause analysis**, interpret **system logs**, and use **metrics** for **troubleshooting**."
            : "**Problem analysis**; **data interpretation**; **systematic investigation**. Perform **root cause analysis**, examine **system behavior**, and use **analytical thinking** for **issue resolution**.";
          break;
        case "Evaluate":
          notes = jdContent.includes("risk") || jdContent.includes("assessment")
            ? "**Weigh risks**; **choose tools/approach** based on JD criteria. Assess **strategies**, select **appropriate solutions**, and make **informed decisions** about **implementation approaches**."
            : "**Solution evaluation**; **technology selection**; **strategic decisions**. Assess **alternatives**, select **optimal approaches**, and make **informed choices** about **technical direction**.";
          break;
        case "Create":
          notes = jdContent.includes("develop") || jdContent.includes("build")
            ? "**Build solutions/utilities**; **improve systems** as outlined in JD. Develop **custom tools**, create **innovative approaches**, and enhance **existing frameworks**."
            : "**Innovation**; **solution development**; **system improvement**. Develop **creative solutions**, build **custom tools**, and enhance **existing processes** and **frameworks**.";
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
        { name: "Peer Mentoring & Reviews", weight: 40, requiredLevel: 3, notes: "Experience **mentoring colleagues**, conducting **peer reviews**, and **knowledge sharing** within the team." },
        { name: "Cross‑functional Influence", weight: 30, requiredLevel: 3, notes: "Ability to **collaborate** across departments, **influence stakeholders**, and **drive consensus** on technical decisions." },
        { name: "Quality Advocacy / Process Improvement", weight: 30, requiredLevel: 3, notes: "Champion **quality standards**, propose **process improvements**, and drive **best practices** adoption across teams." }
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
            ? "Experience **mentoring colleagues**, conducting **peer reviews**, and **knowledge sharing** as emphasized in JD requirements. Lead **training sessions** and **onboard new team members**."
            : "Strong **mentoring capabilities** and **review skills**. Ability to **guide team members**, share **technical expertise**, and conduct **constructive code reviews**.";
          break;
        case "Cross‑functional Influence":
          notes = jdContent.includes("stakeholder") || jdContent.includes("cross-functional") || jdContent.includes("coordinate")
            ? "Ability to **collaborate** across departments, **influence stakeholders**, and **drive consensus** on technical decisions as required by the role's cross-functional nature."
            : "Strong **collaboration skills** across teams. Ability to **build relationships**, **communicate effectively** with different departments, and **align technical decisions** with business goals.";
          break;
        case "Quality Advocacy / Process Improvement":
          notes = jdContent.includes("quality") || jdContent.includes("process") || jdContent.includes("improvement")
            ? "Champion **quality standards**, propose **process improvements**, and drive **best practices** adoption as outlined in JD. Focus on **continuous improvement** and **operational excellence**."
            : "Commitment to **quality excellence** and **process optimization**. Drive **best practices**, identify **improvement opportunities**, and advocate for **high standards** across all deliverables.";
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
        { name: "Communication", weight: 35, requiredLevel: 4, notes: "Excellent **written and verbal communication**. Must **present concepts** to **stakeholders**, participate in **discussions**, and provide **clear updates**." },
        { name: "Resilience / Stress Tolerance", weight: 20, requiredLevel: 3, notes: "Maintains **productivity** and **quality** during **high-pressure situations**, **tight deadlines** without compromising team morale." },
        { name: "Decision‑Making under Uncertainty", weight: 25, requiredLevel: 3, notes: "Experience making **informed decisions** with incomplete information, **prioritizing tasks** based on **impact**, and **escalating when appropriate**." },
        { name: "Attention to Detail & Documentation", weight: 20, requiredLevel: 3, notes: "Consistently creates and maintains **documentation**, **detailed reports**, and ensures **accuracy** in all deliverables." }
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
            ? "Excellent **written and verbal communication** as emphasized in JD. Must **present concepts** to **stakeholders**, participate in **cross-functional discussions**, and provide **clear status updates**."
            : "Strong **communication skills** required. Ability to **articulate ideas clearly**, **collaborate effectively** with team members, and **document processes** comprehensively.";
          break;
        case "Resilience / Stress Tolerance":
          notes = jdContent.includes("fast-paced") || jdContent.includes("deadline") || jdContent.includes("pressure")
            ? "Maintains **productivity** and **quality** during **high-pressure situations** and **tight project deadlines** as mentioned in JD requirements."
            : "Ability to work effectively under **pressure**, manage **competing priorities**, and maintain **performance standards** during **challenging situations**.";
          break;
        case "Decision‑Making under Uncertainty":
          notes = jdContent.includes("complex") || jdContent.includes("ambiguous")
            ? "Experience making **informed decisions** with **incomplete information**, **prioritizing tasks** based on **business impact** as required by the role complexity."
            : "Strong **decision-making skills** in **uncertain environments**. Ability to **assess situations quickly**, **weigh options**, and **make sound judgments** with **limited information**.";
          break;
        case "Attention to Detail & Documentation":
          notes = jdContent.includes("documentation") || jdContent.includes("quality") || jdContent.includes("accurate")
            ? "Consistently creates and maintains **detailed documentation**, ensures **accuracy** in all deliverables, and follows **quality standards** as specified in JD."
            : "Strong **attention to detail** and **documentation practices**. Ensures **accuracy** in work output, maintains **comprehensive records**, and follows **established procedures**.";
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
  
  const [categories, setCategories] = useState<SkillCategory[]>([
    {
      id: "technical",
      name: "Technical Skills",
      weight: 40,
      skills: [
        { name: "Core Technology Stack", weight: 30, requiredLevel: 4, notes: "Must have **5+ years experience** with **React**, **Node.js**, **TypeScript**. Strong proficiency in modern **JavaScript ES6+**, **REST APIs**, and **microservices architecture**." },
        { name: "Programming Languages", weight: 25, requiredLevel: 4, notes: "**Expert level JavaScript/TypeScript** required. **Python** or **Java** preferred for backend services. Familiarity with **SQL** for database queries." },
        { name: "Frameworks & Tools", weight: 20, requiredLevel: 3, notes: "Experience with **React ecosystem** (**Redux**, **React Query**), **Express.js**, **Git version control**, **Docker containers**, and **CI/CD pipelines** (**Jenkins**/**GitHub Actions**)." },
        { name: "Database & Data Management", weight: 15, requiredLevel: 3, notes: "Proficient in **PostgreSQL/MySQL**, **NoSQL databases** (**MongoDB**), **data modeling**, **query optimization**, and **ETL processes**." },
        { name: "Cloud & Infrastructure", weight: 10, requiredLevel: 3, notes: "**AWS/Azure** experience with **EC2**, **S3**, **Lambda functions**. Understanding of **serverless architecture**, **load balancing**, and **monitoring tools**." }
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

    localStorage.setItem('personaConfig', JSON.stringify({
      categories,
      timestamp: Date.now()
    }));

    toast({
      title: "Persona saved successfully",
      description: "Your ideal candidate persona has been configured and saved.",
    });

    navigate('/candidate-upload');
  };

  const validation = validateWeights();

  return (
    <Layout currentStep={2}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Configure Ideal Persona</h1>
          <p className="text-lg text-muted-foreground">
            Define the weightage for different skills and attributes to create your ideal candidate profile
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Category Weight Distribution</span>
              <div className="flex items-center space-x-2">
                {validation.totalValid ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-warning" />
                )}
                <span className={`text-sm font-mono ${
                  validation.totalValid ? 'text-success' : 'text-warning'
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
                <Card className="shadow-card">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={category.weight}
                            onChange={(e) => updateCategoryWeight(category.id, parseInt(e.target.value) || 0)}
                            className="w-20 h-8 text-center"
                            min="0"
                            max="100"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isSkillTotalValid ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-warning" />
                        )}
                        <span className={`text-xs font-mono ${
                          isSkillTotalValid ? 'text-success' : 'text-warning'
                        }`}>
                          Skills: {skillTotal}%
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0 space-y-4">
                      <div className="grid gap-4">
                        {category.skills.map((skill, index) => (
                          <div key={index} className="p-4 bg-muted rounded-lg space-y-3">
                            <div className="flex items-start justify-between">
                              <Label className="flex-1 text-sm font-medium">{skill.name}</Label>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-muted-foreground">Weight:</span>
                                  <Input
                                    type="number"
                                    value={skill.weight}
                                    onChange={(e) => updateSkillWeight(category.id, index, parseInt(e.target.value) || 0)}
                                    className="w-16 h-8 text-center"
                                    min="0"
                                    max="100"
                                  />
                                  <span className="text-sm text-muted-foreground">%</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-muted-foreground">Level:</span>
                                  <Select 
                                    value={skill.requiredLevel.toString()} 
                                    onValueChange={(value) => updateSkillLevel(category.id, index, parseInt(value))}
                                  >
                                    <SelectTrigger className="w-20 h-8">
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
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground bg-background/50 rounded p-3 border">
                                {skill.notes.split('**').map((part, index) => 
                                  index % 2 === 1 ? (
                                    <span key={index} className="font-semibold text-foreground bg-primary/10 px-1 rounded">{part}</span>
                                  ) : (
                                    <span key={index}>{part}</span>
                                  )
                                )}
                              </div>
                              <Textarea
                                placeholder="Add custom notes or modifications..."
                                value=""
                                onChange={(e) => updateSkillNotes(category.id, index, e.target.value)}
                                className="text-xs resize-none"
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end pt-2">
                        <Progress 
                          value={skillTotal} 
                          className={`h-2 w-32 ${isSkillTotalValid ? '' : 'opacity-75'}`}
                        />
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            );
          })}
        </Accordion>

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
            
            <Button
              onClick={() => navigate('/candidate-upload')}
              disabled={!validation.totalValid || !validation.categoriesValid}
              className="bg-gradient-primary hover:opacity-90 transition-smooth flex items-center space-x-2"
            >
              <span>Continue to Candidate Upload</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PersonaConfig;