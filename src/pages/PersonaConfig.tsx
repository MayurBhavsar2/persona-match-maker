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
        { name: "Core Technology Stack", weight: 30, requiredLevel: 3, notes: "Must have **5+ years experience** with **React**, **Node.js**, **TypeScript**. Strong proficiency in modern **JavaScript ES6+**, **REST APIs**, and **microservices architecture**." },
        { name: "Programming Languages", weight: 25, requiredLevel: 4, notes: "**Expert level JavaScript/TypeScript** required. **Python** or **Java** preferred for backend services. Familiarity with **SQL** for database queries." },
        { name: "Frameworks & Tools", weight: 20, requiredLevel: 3, notes: "Experience with **React ecosystem** (**Redux**, **React Query**), **Express.js**, **Git version control**, **Docker containers**, and **CI/CD pipelines** (**Jenkins**/**GitHub Actions**)." },
        { name: "Database & Data Management", weight: 15, requiredLevel: 4, notes: "Proficient in **PostgreSQL/MySQL**, **NoSQL databases** (**MongoDB**), **data modeling**, **query optimization**, and **ETL processes**." },
        { name: "Cloud & Infrastructure", weight: 10, requiredLevel: 3, notes: "**AWS/Azure** experience with **EC2**, **S3**, **Lambda functions**. Understanding of **serverless architecture**, **load balancing**, and **monitoring tools**." }
      ]
    },
    {
      id: "cognitive",
      name: "Cognitive Demands",
      weight: 25,
      skills: [
        { name: "Problem Solving", weight: 30, requiredLevel: 5, notes: "Must demonstrate ability to **break down complex technical challenges**, **debug issues systematically**, and implement **efficient solutions** under **tight deadlines**." },
        { name: "Critical Thinking", weight: 25, requiredLevel: 5, notes: "Strong **analytical skills** to evaluate **trade-offs** between different technical approaches, **assess risk vs benefit**, and make **data-driven architectural decisions**." },
        { name: "Learning & Adaptation", weight: 20, requiredLevel: 3, notes: "Proven track record of **quickly learning new technologies**, **adapting to changing requirements**, and staying current with **industry trends** and **best practices**." },
        { name: "Decision Making", weight: 15, requiredLevel: 5, notes: "Experience making **informed technical decisions** with incomplete information, **prioritizing features** based on **business impact**, and **escalating when appropriate**." },
        { name: "Attention to Detail", weight: 10, requiredLevel: 4, notes: "Demonstrated ability to write **clean, maintainable code**, conduct **thorough code reviews**, and catch **edge cases** that could impact **system reliability**." }
      ]
    },
    {
      id: "values",
      name: "Values (Schwartz)",
      weight: 10,
      skills: [
        { name: "Achievement & Excellence", weight: 30, requiredLevel: 3, notes: "Strong drive to deliver **high-quality software solutions**, meet **project milestones**, and continuously improve **technical skills** and **code quality standards**." },
        { name: "Security & Reliability", weight: 25, requiredLevel: 4, notes: "Commitment to building **secure, scalable systems**. Values **code reliability**, **comprehensive testing**, and following **security best practices** in all implementations." },
        { name: "Innovation & Self-Direction", weight: 25, requiredLevel: 6, notes: "Seeks **creative solutions** to technical challenges, proposes **process improvements**, and works **independently** with **minimal supervision** while meeting deliverables." },
        { name: "Collaboration & Benevolence", weight: 20, requiredLevel: 3, notes: "Values **teamwork**, **knowledge sharing**, **mentoring junior developers**, and contributing to a **positive team culture** through helpful and supportive interactions." }
      ]
    },
    {
      id: "foundational",
      name: "Foundational Behaviors",
      weight: 15,
      skills: [
        { name: "Communication Skills", weight: 35, requiredLevel: 3, notes: "Excellent **written and verbal communication**. Must **present technical concepts** to **non-technical stakeholders**, participate in **code reviews**, and provide **clear status updates**." },
        { name: "Time Management", weight: 25, requiredLevel: 3, notes: "Proven ability to **manage multiple projects** simultaneously, meet **sprint deadlines**, accurately **estimate task complexity**, and **prioritize work** effectively." },
        { name: "Stress Management", weight: 20, requiredLevel: 3, notes: "Maintains **productivity** and **code quality** during **high-pressure situations**, **production incidents**, and **tight project deadlines** without compromising team morale." },
        { name: "Documentation & Reporting", weight: 20, requiredLevel: 3, notes: "Consistently creates and maintains **technical documentation**, **API docs**, **architectural decisions**, and provides detailed **project status reports**." }
      ]
    },
    {
      id: "leadership",
      name: "Leadership Skills",
      weight: 6,
      skills: [
        { name: "Team Collaboration", weight: 40, requiredLevel: 3, notes: "Experience working in **cross-functional teams** with **designers**, **product managers**, and **QA**. Participates effectively in **agile ceremonies** and **pair programming sessions**." },
        { name: "Mentoring & Knowledge Sharing", weight: 30, requiredLevel: 4, notes: "Willingness to **onboard new team members**, conduct **technical training sessions**, and share knowledge through **code reviews** and **internal tech talks**." },
        { name: "Project Coordination", weight: 30, requiredLevel: 4, notes: "Experience **leading technical initiatives**, **coordinating with stakeholders**, managing **technical risks**, and ensuring project deliverables meet **quality standards**." }
      ]
    },
    {
      id: "education",
      name: "Education & Experience",
      weight: 4,
      skills: [
        { name: "Educational Background", weight: 40, requiredLevel: 2, notes: "**Bachelor's degree** in **Computer Science**, **Software Engineering**, or **equivalent practical experience**. Relevant **certifications** in **cloud platforms** or **modern frameworks** preferred." },
        { name: "Professional Experience", weight: 60, requiredLevel: 2, notes: "Minimum **5+ years** of **full-stack development** experience. Previous experience in **similar industry/domain** preferred. Track record of **successful project deliveries**." }
      ]
    }
  ]);

  const getDominantBloomLevel = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return { level: 3, name: "Apply" };
    
    const levelCounts = category.skills.reduce((acc, skill) => {
      acc[skill.requiredLevel] = (acc[skill.requiredLevel] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const dominantLevel = Object.entries(levelCounts).reduce((a, b) => 
      levelCounts[parseInt(a[0])] > levelCounts[parseInt(b[0])] ? a : b
    )[0];
    
    const bloomLevels = {
      1: "Remember", 2: "Understand", 3: "Apply", 
      4: "Analyze", 5: "Evaluate", 6: "Create"
    };
    
    return { 
      level: parseInt(dominantLevel), 
      name: bloomLevels[parseInt(dominantLevel) as keyof typeof bloomLevels] 
    };
  };

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
            Define weightage and cognitive levels using <span className="font-semibold text-primary">Bloom's Taxonomy</span> to create your ideal candidate profile based on JD requirements
          </p>
          <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 border">
            <p className="font-medium mb-2">Bloom's Taxonomy Levels:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div><span className="font-medium">Remember:</span> Recall facts & basic concepts</div>
              <div><span className="font-medium">Understand:</span> Explain ideas & concepts</div>
              <div><span className="font-medium">Apply:</span> Use information in new situations</div>
              <div><span className="font-medium">Analyze:</span> Draw connections among ideas</div>
              <div><span className="font-medium">Evaluate:</span> Justify decisions & stands</div>
              <div><span className="font-medium">Create:</span> Produce new or original work</div>
            </div>
          </div>
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
                          <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1 rounded-full">
                            <span className="text-xs font-medium text-primary">Dominant Level:</span>
                            <span className="text-xs font-bold text-primary">
                              {getDominantBloomLevel(category.id).level} - {getDominantBloomLevel(category.id).name}
                            </span>
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
                                  <span className="text-xs text-muted-foreground">Bloom's Level:</span>
                                  <Select 
                                    value={skill.requiredLevel.toString()} 
                                    onValueChange={(value) => updateSkillLevel(category.id, index, parseInt(value))}
                                  >
                                    <SelectTrigger className="w-32 h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background border shadow-lg">
                                      <SelectItem value="1" className="bg-background hover:bg-muted">
                                        <div className="flex flex-col">
                                          <span className="font-medium">1 - Remember</span>
                                          <span className="text-xs text-muted-foreground">Recall facts</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="2" className="bg-background hover:bg-muted">
                                        <div className="flex flex-col">
                                          <span className="font-medium">2 - Understand</span>
                                          <span className="text-xs text-muted-foreground">Explain concepts</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="3" className="bg-background hover:bg-muted">
                                        <div className="flex flex-col">
                                          <span className="font-medium">3 - Apply</span>
                                          <span className="text-xs text-muted-foreground">Use in new situations</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="4" className="bg-background hover:bg-muted">
                                        <div className="flex flex-col">
                                          <span className="font-medium">4 - Analyze</span>
                                          <span className="text-xs text-muted-foreground">Draw connections</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="5" className="bg-background hover:bg-muted">
                                        <div className="flex flex-col">
                                          <span className="font-medium">5 - Evaluate</span>
                                          <span className="text-xs text-muted-foreground">Justify decisions</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="6" className="bg-background hover:bg-muted">
                                        <div className="flex flex-col">
                                          <span className="font-medium">6 - Create</span>
                                          <span className="text-xs text-muted-foreground">Produce original work</span>
                                        </div>
                                      </SelectItem>
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