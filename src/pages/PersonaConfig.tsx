import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SkillCategory {
  id: string;
  name: string;
  weight: number;
  skills: { name: string; weight: number }[];
}

const PersonaConfig = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<SkillCategory[]>([
    {
      id: "technical",
      name: "Technical Skills",
      weight: 35,
      skills: [
        { name: "RPA Platform Expertise (UiPath/Blue Prism)", weight: 40 },
        { name: "Programming Languages (C#, Python, Java)", weight: 25 },
        { name: "Database Knowledge (SQL)", weight: 20 },
        { name: "Web Technologies (APIs, HTML/CSS)", weight: 15 }
      ]
    },
    {
      id: "cognitive",
      name: "Cognitive Demands",
      weight: 20,
      skills: [
        { name: "Problem-solving and Analytical Thinking", weight: 35 },
        { name: "Process Analysis and Optimization", weight: 30 },
        { name: "Logical Reasoning", weight: 20 },
        { name: "Attention to Detail", weight: 15 }
      ]
    },
    {
      id: "experience",
      name: "Experience Level",
      weight: 15,
      skills: [
        { name: "Years of RPA Development (5+ years)", weight: 50 },
        { name: "Enterprise Project Experience", weight: 30 },
        { name: "Leadership/Mentoring Experience", weight: 20 }
      ]
    },
    {
      id: "communication",
      name: "Communication Skills",
      weight: 15,
      skills: [
        { name: "Stakeholder Management", weight: 40 },
        { name: "Technical Documentation", weight: 30 },
        { name: "Team Collaboration", weight: 30 }
      ]
    },
    {
      id: "certifications",
      name: "Certifications & Qualifications",
      weight: 10,
      skills: [
        { name: "RPA Platform Certifications", weight: 60 },
        { name: "Cloud Certifications (Azure/AWS)", weight: 25 },
        { name: "Agile/Scrum Certifications", weight: 15 }
      ]
    },
    {
      id: "adaptability",
      name: "Adaptability & Learning",
      weight: 5,
      skills: [
        { name: "Continuous Learning Mindset", weight: 50 },
        { name: "Technology Adaptation", weight: 30 },
        { name: "Change Management", weight: 20 }
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
                          <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <Label className="flex-1 text-sm font-medium">{skill.name}</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                value={skill.weight}
                                onChange={(e) => updateSkillWeight(category.id, index, parseInt(e.target.value) || 0)}
                                className="w-20 h-8 text-center"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm text-muted-foreground w-4">%</span>
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