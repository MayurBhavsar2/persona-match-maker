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
  
  const [categories, setCategories] = useState<SkillCategory[]>([
    {
      id: "technical",
      name: "Technical Skills",
      weight: 54,
      skills: [
        { name: "Automation Frameworks (Selenium/Java, TestNG/Cucumber, POM/BDD)", weight: 18, requiredLevel: 4, notes: "Stable suites; POM/BDD; maintainable code." },
        { name: "Functional & Regression Testing (Web/Mobile)", weight: 15, requiredLevel: 4, notes: "End‑to‑end coverage; regression discipline." },
        { name: "API Testing (Postman/RestAssured)", weight: 12, requiredLevel: 4, notes: "Schema/contract tests; neg cases; auth." },
        { name: "Performance/Load (JMeter)", weight: 10, requiredLevel: 3, notes: "Basic load plans; KPIs; trends." },
        { name: "Database/SQL Testing", weight: 10, requiredLevel: 3, notes: "CRUD validations; joins; data integrity." },
        { name: "Test Strategy & Planning (Plans/Cases/Traceability)", weight: 12, requiredLevel: 4, notes: "Risk‑based plans; RTM; data design." },
        { name: "Defect Management & Reporting (Jira/Xray)", weight: 13, requiredLevel: 4, notes: "Good triage; root cause; dashboards." },
        { name: "CI/CD & Version Control (Jenkins/Git)", weight: 10, requiredLevel: 3, notes: "Trigger suites; artifacts; Git hygiene." }
      ]
    },
    {
      id: "cognitive",
      name: "Cognitive Demands",
      weight: 24,
      skills: [
        { name: "Remember / Understand", weight: 10, requiredLevel: 3, notes: "SDLC/STLC, coverage types, definitions." },
        { name: "Apply", weight: 25, requiredLevel: 4, notes: "Execute plans; stable automation runs." },
        { name: "Analyze", weight: 25, requiredLevel: 4, notes: "RCA; logs; data‑driven debugging." },
        { name: "Evaluate", weight: 25, requiredLevel: 4, notes: "Weigh risks; choose tools/approach." },
        { name: "Create", weight: 15, requiredLevel: 3, notes: "Build test data/utilities; improve suites." }
      ]
    },
    {
      id: "values",
      name: "Values (Schwartz)",
      weight: 6,
      skills: [
        { name: "Achievement / Power", weight: 30, requiredLevel: 4, notes: "Owns quality outcomes; leakage ↓" },
        { name: "Security / Conformity", weight: 30, requiredLevel: 4, notes: "Compliance; audit trail; DoD/DoR." },
        { name: "Self-direction / Stimulation", weight: 25, requiredLevel: 3, notes: "Tooling experiments; learning." },
        { name: "Benevolence / Universalism", weight: 15, requiredLevel: 3, notes: "User empathy; team-first." }
      ]
    },
    {
      id: "foundational",
      name: "Foundational Behaviors",
      weight: 10,
      skills: [
        { name: "Communication", weight: 35, requiredLevel: 4, notes: "Concise risk comms; clear bugs." },
        { name: "Resilience / Stress Tolerance", weight: 25, requiredLevel: 3, notes: "Calm during hotfixes/incidents." },
        { name: "Decision‑Making under Uncertainty", weight: 20, requiredLevel: 3, notes: "Time‑box spikes; escalate smartly." },
        { name: "Attention to Detail & Documentation", weight: 20, requiredLevel: 4, notes: "Traceability; crisp docs." }
      ]
    },
    {
      id: "leadership",
      name: "Leadership Skills",
      weight: 4,
      skills: [
        { name: "Peer Mentoring & Reviews", weight: 50, requiredLevel: 3, notes: "Review cases/scripts; coach peers." },
        { name: "Cross‑functional Influence", weight: 30, requiredLevel: 3, notes: "Align with Dev/PO/BA; gates." },
        { name: "Quality Advocacy / Process Improvement", weight: 20, requiredLevel: 3, notes: "Improve workflows; templates." }
      ]
    },
    {
      id: "education",
      name: "Education & Experience",
      weight: 2,
      skills: [
        { name: "Education (Bachelor's / Equivalent)", weight: 30, requiredLevel: 3, notes: "Degree or proven equivalent." },
        { name: "Experience (3–6 yrs QA)", weight: 70, requiredLevel: 4, notes: "Sustained QA in Agile; releases." }
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
                            <Textarea
                              placeholder="Notes..."
                              value={skill.notes}
                              onChange={(e) => updateSkillNotes(category.id, index, e.target.value)}
                              className="text-xs resize-none"
                              rows={2}
                            />
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