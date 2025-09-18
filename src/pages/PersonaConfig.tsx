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
      weight: 40,
      skills: [
        { name: "Core Technology Stack", weight: 30, requiredLevel: 4, notes: "Primary technologies required for the role" },
        { name: "Programming Languages", weight: 25, requiredLevel: 4, notes: "Languages specified in job requirements" },
        { name: "Frameworks & Tools", weight: 20, requiredLevel: 3, notes: "Frameworks and development tools" },
        { name: "Database & Data Management", weight: 15, requiredLevel: 3, notes: "Database technologies and data handling" },
        { name: "Cloud & Infrastructure", weight: 10, requiredLevel: 3, notes: "Cloud platforms and infrastructure knowledge" }
      ]
    },
    {
      id: "cognitive",
      name: "Cognitive Demands",
      weight: 25,
      skills: [
        { name: "Problem Solving", weight: 30, requiredLevel: 4, notes: "Analytical and logical problem-solving abilities" },
        { name: "Critical Thinking", weight: 25, requiredLevel: 4, notes: "Ability to analyze and evaluate information" },
        { name: "Learning & Adaptation", weight: 20, requiredLevel: 3, notes: "Continuous learning and adapting to change" },
        { name: "Decision Making", weight: 15, requiredLevel: 3, notes: "Making informed decisions under pressure" },
        { name: "Attention to Detail", weight: 10, requiredLevel: 4, notes: "Precision and accuracy in work" }
      ]
    },
    {
      id: "values",
      name: "Values (Schwartz)",
      weight: 10,
      skills: [
        { name: "Achievement & Excellence", weight: 30, requiredLevel: 4, notes: "Drive for success and quality outcomes" },
        { name: "Security & Reliability", weight: 25, requiredLevel: 4, notes: "Commitment to stability and dependability" },
        { name: "Innovation & Self-Direction", weight: 25, requiredLevel: 3, notes: "Creative thinking and independent work" },
        { name: "Collaboration & Benevolence", weight: 20, requiredLevel: 3, notes: "Team-oriented and helpful attitude" }
      ]
    },
    {
      id: "foundational",
      name: "Foundational Behaviors",
      weight: 15,
      skills: [
        { name: "Communication Skills", weight: 35, requiredLevel: 4, notes: "Clear verbal and written communication" },
        { name: "Time Management", weight: 25, requiredLevel: 3, notes: "Efficient planning and execution" },
        { name: "Stress Management", weight: 20, requiredLevel: 3, notes: "Composure under pressure and deadlines" },
        { name: "Documentation & Reporting", weight: 20, requiredLevel: 3, notes: "Thorough documentation practices" }
      ]
    },
    {
      id: "leadership",
      name: "Leadership Skills",
      weight: 6,
      skills: [
        { name: "Team Collaboration", weight: 40, requiredLevel: 3, notes: "Working effectively within teams" },
        { name: "Mentoring & Knowledge Sharing", weight: 30, requiredLevel: 3, notes: "Guiding and supporting colleagues" },
        { name: "Project Coordination", weight: 30, requiredLevel: 3, notes: "Organizing and leading project activities" }
      ]
    },
    {
      id: "education",
      name: "Education & Experience",
      weight: 4,
      skills: [
        { name: "Educational Background", weight: 40, requiredLevel: 3, notes: "Relevant degree or equivalent experience" },
        { name: "Professional Experience", weight: 60, requiredLevel: 4, notes: "Years of relevant industry experience" }
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