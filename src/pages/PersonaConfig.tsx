import { useState, useRef, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { mockFetchPersona } from "@/mocks/mockAPI";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle,CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, AlertCircle, Lightbulb, Save,Loader2,Minus,Plus, Trash2 } from "lucide-react";

// ---------- TYPE DEFINITIONS ----------
// interface Skillset {
//   technologies?: string[];
// }

// interface Subcategory {
//   name: string;
//   weight_percentage: number;
//   range_min: number;
//   range_max: number;
//   level_id?: string;
//   position: number;
//   skillset?: Skillset;
// }

// interface Category {
//   name: string;
//   weight_percentage: number;
//   range_min: number;
//   range_max: number;
//   position: number;
//   subcategories: Subcategory[];
//   notes?: { custom_notes: string };
// }

// ---------- HARDCODED PAYLOAD ----------
// const personaPayload = {
//     "job_description_id": "jd-2025-FE-001",
//     "name": "Senior Frontend Developer Persona",
//     "categories": [
//       {
//         "name": "Technical Skills",
//         "weight_percentage": 35,
//         "range_min": -5,
//         "range_max": 10,
//         "position": 1,
//         "subcategories": [
//           {
//             "name": "Frontend Frameworks",
//             "weight_percentage": 30,
//             "range_min": -5,
//             "range_max": 10,
//             "level_id": "5",
//             "position": 1,
//             "skillset": {
//               "technologies": ["React", "Next.js", "Vue.js", "Angular"]
//             }
//           },
//           {
//             "name": "JavaScript & TypeScript",
//             "weight_percentage": 25,
//             "range_min": -5,
//             "range_max": 10,
//             "level_id": "5",
//             "position": 2,
//             "skillset": {
//               "technologies": ["JavaScript (ES6+)", "TypeScript", "Node.js (basic)"]
//             }
//           },
//           {
//             "name": "UI Development & Styling",
//             "weight_percentage": 25,
//             "range_min": -5,
//             "range_max": 10,
//             "level_id": "4",
//             "position": 3,
//             "skillset": {
//               "technologies": ["HTML5", "CSS3", "Tailwind", "Sass", "Styled Components"]
//             }
//           },
//           {
//             "name": "Performance & Optimization",
//             "weight_percentage": 20,
//             "range_min": -5,
//             "range_max": 10,
//             "level_id": "4",
//             "position": 4,
//             "skillset": {
//               "technologies": ["Lighthouse", "Core Web Vitals", "Lazy Loading", "Code Splitting"]
//             }
//           }
//         ],
//         "notes": {
//           "custom_notes": "Expertise in modern frameworks with strong TypeScript skills and focus on scalable, high-performance UI."
//         }
//       },
//       {
//         "name": "Cognitive Demands",
//         "weight_percentage": 15,
//         "range_min": -3,
//         "range_max": 7,
//         "position": 2,
//         "subcategories": [
//           {
//             "name": "Problem Solving",
//             "weight_percentage": 40,
//             "range_min": -3,
//             "range_max": 7,
//             "level_id": "5",
//             "position": 1
//           },
//           {
//             "name": "Design Thinking",
//             "weight_percentage": 35,
//             "range_min": -3,
//             "range_max": 7,
//             "level_id": "4",
//             "position": 2
//           },
//           {
//             "name": "Attention to Detail",
//             "weight_percentage": 25,
//             "range_min": -3,
//             "range_max": 7,
//             "level_id": "4",
//             "position": 3
//           }
//         ],
//         "notes": {
//           "custom_notes": "Should balance creative design interpretation with technical implementation precision."
//         }
//       },
//       {
//         "name": "Values (Schwartz)",
//         "weight_percentage": 10,
//         "range_min": -2,
//         "range_max": 5,
//         "position": 3,
//         "subcategories": [
//           {
//             "name": "Creativity & Self-Direction",
//             "weight_percentage": 35,
//             "range_min": -2,
//             "range_max": 5,
//             "level_id": "4",
//             "position": 1
//           },
//           {
//             "name": "Achievement",
//             "weight_percentage": 25,
//             "range_min": -2,
//             "range_max": 5,
//             "level_id": "4",
//             "position": 2
//           },
//           {
//             "name": "Benevolence",
//             "weight_percentage": 20,
//             "range_min": -2,
//             "range_max": 5,
//             "level_id": "3",
//             "position": 3
//           },
//           {
//             "name": "Conformity",
//             "weight_percentage": 20,
//             "range_min": -2,
//             "range_max": 5,
//             "level_id": "2",
//             "position": 4
//           }
//         ],
//         "notes": {
//           "custom_notes": "Encourages innovation while maintaining code standards and collaboration ethics."
//         }
//       },
//       {
//         "name": "Foundational Behaviors",
//         "weight_percentage": 15,
//         "range_min": -3,
//         "range_max": 7,
//         "position": 4,
//         "subcategories": [
//           {
//             "name": "Collaboration",
//             "weight_percentage": 35,
//             "range_min": -3,
//             "range_max": 7,
//             "level_id": "4",
//             "position": 1
//           },
//           {
//             "name": "Adaptability",
//             "weight_percentage": 35,
//             "range_min": -3,
//             "range_max": 7,
//             "level_id": "4",
//             "position": 2
//           },
//           {
//             "name": "Ownership",
//             "weight_percentage": 30,
//             "range_min": -3,
//             "range_max": 7,
//             "level_id": "5",
//             "position": 3
//           }
//         ],
//         "notes": {
//           "custom_notes": "Thrives in agile environments, embraces feedback loops, and owns delivery end-to-end."
//         }
//       },
//       {
//         "name": "Leadership Skills",
//         "weight_percentage": 15,
//         "range_min": -5,
//         "range_max": 10,
//         "position": 5,
//         "subcategories": [
//           {
//             "name": "Mentoring & Peer Review",
//             "weight_percentage": 40,
//             "range_min": -5,
//             "range_max": 10,
//             "level_id": "4",
//             "position": 1
//           },
//           {
//             "name": "Decision Making",
//             "weight_percentage": 30,
//             "range_min": -5,
//             "range_max": 10,
//             "level_id": "4",
//             "position": 2
//           },
//           {
//             "name": "Strategic Vision",
//             "weight_percentage": 30,
//             "range_min": -5,
//             "range_max": 10,
//             "level_id": "3",
//             "position": 3
//           }
//         ],
//         "notes": {
//           "custom_notes": "Guides UI architecture, ensures code quality through reviews, and supports cross-functional alignment."
//         }
//       },
//       {
//         "name": "Education and Experience",
//         "weight_percentage": 10,
//         "range_min": -2,
//         "range_max": 5,
//         "position": 6,
//         "subcategories": [
//           {
//             "name": "Academic Qualification",
//             "weight_percentage": 40,
//             "range_min": -2,
//             "range_max": 5,
//             "level_id": "2",
//             "position": 1
//           },
//           {
//             "name": "Years of Experience",
//             "weight_percentage": 40,
//             "range_min": -2,
//             "range_max": 5,
//             "level_id": "5",
//             "position": 2
//           },
//           {
//             "name": "Certifications & Portfolio",
//             "weight_percentage": 20,
//             "range_min": -2,
//             "range_max": 5,
//             "level_id": "3",
//             "position": 3
//           }
//         ],
//         "notes": {
//           "custom_notes": "Typically 5–8 years of frontend development with a strong portfolio of responsive, scalable web apps."
//         }
//       }
//     ]
//   };

// ---------- COMPONENT ----------
const PersonaConfig = () => {
  const navigate = useNavigate();

  // ---------- STATE ----------
  const [categories, setCategories] = useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ cat: string; position: number } | null>(null);
  const [personaName, setPersonaName] = useState("");
  const [activeTab, setActiveTab] = useState("distribution");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const [loading, setLoading] = useState(true);
  const distributionRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const aiInsightsRef = useRef<HTMLDivElement>(null);

  // ---------- INITIALIZE STATE ----------
   useEffect(() => {
    const selectedJD = localStorage.getItem("selectedJD");

    if (!selectedJD) {
      alert("Please select a JD version first.");
      navigate("/jd-comparison");
      return;
    }

    const { jdId } = JSON.parse(selectedJD);

    const USE_MOCK_API = true; // toggle this to switch

    const fetchPersona = async () => {
        try {
          setLoading(true);

          let data;
          if (USE_MOCK_API) {
            data = await mockFetchPersona(jdId);
          } else {
            const response = await fetch(`/api/v1/persona/generate-from-jd/${jdId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ job_description_id: jdId }),
            });

            if (!response.ok) throw new Error("Failed to fetch persona");

            data = await response.json();
          }

          setCategories(data.categories || []);
          setPersonaName(data.name || "");

        } catch (error) {
          console.error(error);
          alert("Error fetching persona data");
        } finally {
          setLoading(false);
        }
      };

    fetchPersona();
  }, [navigate]);

  // ---------- HELPERS ----------
  const getTotalWeight = () => categories.reduce((acc, cat) => acc + cat.weight_percentage, 0);
  const getCategorySkillTotal = (catIndex: number) =>
    categories[catIndex].subcategories.reduce((acc, sub) => acc + sub.weight_percentage, 0);

  const updateCategory = (catPos: number, updatedFields: any) => {
    setCategories(prev =>
      prev.map(cat => (cat.position === catPos ? { ...cat, ...updatedFields } : cat))
    );
  };

  const updateSubcategory = (
    catPos: number,
    subPos: number,
    updatedFields: any,
  ) => {
    setCategories(prev =>
      prev.map(cat => {
        if (cat.position === catPos) {
          const updatedSubcategories = cat.subcategories.map(sub =>
            sub.position === subPos ? { ...sub, ...updatedFields } : sub
          );
          // 🧮 Calculate total weight for this category
        // const totalWeight = updatedSubcategories.reduce(
        //   (total, sub) => total + (Number(sub.weight) || 0),
        //   0
        // );

        // // ⚠️ Validation check
        // if (totalWeight > 100) {
        //   alert(`Total weight for category "${cat.category}" exceeds 100%. Please adjust.`);
        //   return cat; // Don’t update if it exceeds 100%
        // }
          return { ...cat, subcategories: updatedSubcategories };
        }
        return cat;
      })
    );
          
  };

  
  // Calculate new total
  //         const totalWeight = updatedSubcategories.reduce((total, sub) => total + (Number(sub.weight)|| 0),0);
          
  //         // Show toast if not 100%
  //         if (totalWeight > 100) {
  //           toast({
  //             title: "Skills total above 100%",
  //             description: `The skills in this category total ${totalWeight}%. Please adjust to exactly 100%.`,
  //             variant: "destructive",
  //           });
  //         } else if (totalWeight < 100) {
  //           toast({
  //             title: "Skills total below 100%",
  //             description: `The skills in this category total ${totalWeight}%. Please adjust to exactly 100%.`,
  //             variant: "destructive",
  //           });
  //         }
          
  //         return { ...cat, skills: updatedSubcategories };
  //         }
  //       return cat;
  //     })
  //   );
  // };

  const scrollToSection = (value: string) => {
    setActiveTab(value);
    if (value === "distribution") distributionRef.current?.scrollIntoView({ behavior: "smooth" });
    if (value === "summary") summaryRef.current?.scrollIntoView({ behavior: "smooth" });
    if (value === "insights") aiInsightsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSavePersona = () => setShowSaveDialog(true);
  const confirmSavePersona = async () => {
  const payload = {
    job_description_id: localStorage.getItem("selectedJD") 
      ? JSON.parse(localStorage.getItem("selectedJD")!).jdId 
      : "",
    name: personaName,
    
    categories
  };

  try {
    setLoading(true);

    const response = await fetch(`/api/v1/persona/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // if auth is needed
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to save persona");
    }

    const data = await response.json();
    console.log("Persona saved successfully:", data);
    alert("Persona saved successfully!");
    setShowSaveDialog(false);
    navigate('/candidate-upload');

  } catch (error) {
    console.error(error);
    alert("Error saving persona. Please try again.");
  } finally {
    setLoading(false);
  }
};


  const validation = {
    totalValid: getTotalWeight() === 100,
    categoriesValid: categories.every((cat, idx) => getCategorySkillTotal(idx) === 100)
  };
  

  const addSkillToCategory = (categoryId: string) => {
    setCategories(prev =>
      prev.map(cat => {
        if (cat.id === categoryId) {
          const newSubcategory = {
            name: "New Skill",
            weight_percentage: 0,
            level_id: 3,
            notes: "",
            position:cat.subcategories.length+1,
          };
          return { ...cat, subcategories: [...(cat.subcategories || []), newSubcategory] };
        }
        return cat;
      })
    );
  };

  const removeSkillFromCategory = (categoryId: string, subPosition: number) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: cat.subcategories.filter(sub => sub.position !== subPosition)
        };
      }
      return cat;
    });
    setCategories(updatedCategories);
  };

  if (loading) {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="text-lg font-semibold text-gray-600">
          Loading Persona Configuration...
        </p>
      </div>
    </Layout>
  );
}

  return (
    <Layout currentStep={2}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Configure Ideal Persona</h1>
          {/* <p className="text-lg text-muted-foreground">
            Define the weightage for different skills and attributes to create your ideal candidate profile
          </p> */}
          <div className="flex items-center justify-center space-x-2 text-sm">
            <span className="text-muted-foreground">Role:</span>
            <span className="font-medium text-primary">{personaName}</span>
          </div>
        </div>

        {/* STICKY TABS */}
        <div className="bg-background border-b border-border sticky top-16 z-30 -mx-6 px-6 py-3">
          <Tabs value={activeTab} onValueChange={scrollToSection} className="w-full max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 h-10 bg-muted">
              <TabsTrigger value="distribution" className="text-sm font-medium">Table of Distribution</TabsTrigger>
              <TabsTrigger value="summary" className="text-sm font-medium">Summary</TabsTrigger>
              <TabsTrigger value="insights" className="text-sm font-medium">AI Insights</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* DISTRIBUTION SECTION */}
        <div ref={distributionRef} className="space-y-6 mt-6">
          {/* Category Weight Card */}
          {/* <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Category Weight Distribution</span>
                <div className="flex items-center space-x-2">
                  {validation.totalValid ? <CheckCircle2 className="w-5 h-5 text-success" /> : <AlertCircle className="w-5 h-5 text-destructive" />}
                  <span className={`text-sm font-mono ${validation.totalValid ? "text-success" : "text-destructive"}`}>
                    {getTotalWeight()}%
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={getTotalWeight()} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">Total must equal 100% to proceed</p>
            </CardContent>
          </Card> */}

          {/* Categories Accordion */}
          <Accordion type="multiple" className="space-y-2">
            {categories.map((cat) => {
              const skillTotal = getCategorySkillTotal(cat.position - 1);
              const isSkillTotalValid = skillTotal === 100;
              return (
                <AccordionItem key={cat.position} value={cat.position.toString()} className="border-0">
                  <Card className="shadow-card">
                    <AccordionTrigger className="pl-4 pr-6 py-2 hover:no-underline">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold text-foreground w-[220px] text-left">{cat.name}</h3>
                          <div className="flex items-center justify-end w-24">
                            <Input
                              type="text"
                              value={cat.weight_percentage}
                              onChange={(e) => updateCategory(cat.position, { weight_percentage: parseInt(e.target.value) || 0 })}
                              className="w-20 h-8 text-center"
                              min={0}
                              max={100}
                            />
                            <span className="text-sm text-muted-foreground ml-1">%</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isSkillTotalValid ? <CheckCircle2 className="w-4 h-4 text-success" /> : <AlertCircle className="w-4 h-4 text-destructive" />}
                          {/* <span className={`text-xs font-mono ${isSkillTotalValid ? "text-success" : "text-destructive"}`}>
                            Skills: {skillTotal}%
                          </span> */}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CardContent className="pt-0 space-y-4">
                        {/* Table of Subcategories */}
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[25%]">Skill Name</TableHead>
                                <TableHead className="w-[15%] text-center">Weight (%)</TableHead>
                                <TableHead className="w-[15%] text-center">Required Level</TableHead>
                                <TableHead className="w-[40%]">Skills & Technologies</TableHead>
                              <TableHead className="w-[5%]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {cat.subcategories.map((sub) => (
                                <TableRow key={sub.position}>
                                  <TableCell>
                                    <Input
                                      value={sub.name}
                                      onChange={(e) => updateSubcategory(cat.position, sub.position, { name: e.target.value })}
                                      className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 font-medium"
                                    />
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Input
                                      type="text"
                                      value={sub.weight_percentage}
                                      onChange={(e) => updateSubcategory(cat.position, sub.position, { weight_percentage: parseInt(e.target.value) || 0 })}
                                      className="w-16 h-8 text-center"
                                      min={0}
                                      max={100}
                                    />
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Select
                                      value={sub.level_id}
                                      onValueChange={(value) => updateSubcategory(cat.position, sub.position, { level_id: value })}
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
                                      value={sub.skillset?.technologies.join(", ")}
                                      onChange={(e) => updateSubcategory(cat.position, sub.position, {
                                        skillset: { technologies: e.target.value.split(",").map(t => t.trim()) }
                                      })}
                                      className="min-h-[60px] resize-none border-0 p-0 bg-transparent focus-visible:ring-0 font-semibold"
                                    />
                                  </TableCell>
                                  <TableCell className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteConfirm({ cat: cat.id, position: sub.position })}
                                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            <span className="font-bold font-semibold">Skills total:</span> <span className={`font-mono  ${isSkillTotalValid ? 'text-success' : 'text-destructive'}`}>{skillTotal}%</span>
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => addSkillToCategory(cat.id)}
                            className="h-8 gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add Skill
                          </Button>
                        </div>
                        </div>

                        {/* Custom Notes */}
                        <div className="mt-4 pt-3 border-t">
                          <Label htmlFor={`custom-${cat.position}`} className="text-xs font-medium text-muted-foreground">
                            Custom Addition
                          </Label>
                          <Textarea
                            id={`custom-${cat.position}`}
                            placeholder="Add custom notes for this category..."
                            className="mt-1 min-h-[60px] text-xs"
                            value={cat.notes?.custom_notes || ""}
                            onChange={(e) => updateCategory(cat.position, { notes: { custom_notes: e.target.value } })}
                          />
                        </div>
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              );
            })}
          </Accordion>
          <Card className="shadow-card border-2 border-primary/20 bg-primary/5">
            <CardContent className="py-2 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-foreground">Total Category Weight</span>
                  {validation.totalValid ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div className={`text-lg font-mono font-bold ${
                  validation.totalValid ? 'text-success' : 'text-destructive'
                }`}>
                  {getTotalWeight()}% / 100%
                </div>
              </div>
              {!validation.totalValid && (
                <p className="text-xs text-destructive mt-2">
                  Category weights must total exactly 100%
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        {/* ---------- SUMMARY SECTION ---------- */}
<div ref={summaryRef} className="space-y-6 mt-6">
  <Card className="shadow-card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20">
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <CheckCircle2 className="w-5 h-5 text-primary" />
        <span>Persona Configuration Summary</span>
      </CardTitle>
      <CardDescription>Quick overview of all categories and weights</CardDescription>
    </CardHeader>

    <CardContent className="space-y-6">
      {/* Category Cards in Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const skillTotal = category.subcategories.reduce(
            (acc, sub) => acc + sub.weight_percentage,
            0
          );
          const isSkillTotalValid = skillTotal === 100;

          return (
            <div
              key={category.position}
              className="bg-background/80 rounded-lg p-4 space-y-3 border border-border/50"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-foreground">
                  {category.name}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono bg-primary/10 text-primary px-2 rounded">
                    {category.weight_percentage}%
                  </span>
                  {isSkillTotalValid ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
              </div>

              {/* Subcategories */}
              <div className="space-y-1 pl-1">
                {category.subcategories.map((sub, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-muted-foreground truncate flex-1 mr-2">
                      {sub.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                        {sub.weight_percentage}%
                      </span>
                      <span className="font-mono bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                        L{sub.level_id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skill Total */}
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">Skills Total:</span>
                  <span
                    className={`font-mono font-semibold ${
                      isSkillTotalValid ? "text-success" : "text-destructive"
                    }`}
                  >
                    <span className="text-muted-foreground font-semibold text-2xl font-bold">{skillTotal}%</span> {/* increase font size*/}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------- Overall Configuration ---------- */}
      <div className="border-t border-border/50 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-foreground">
              Overall Configuration:
            </span>
            {validation.totalValid && validation.categoriesValid ? (
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm text-success font-medium">
                  Valid & Ready
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <AlertCircle className="w-4 h-4 text-warning" />
                <span className="text-sm text-warning font-medium">
                  Needs Adjustment
                </span>
              </div>
            )}
          </div>

          {/* <div className="text-right">
            <div className="text-xs text-muted-foreground">
              Total Category Weight
            </div>
            <div
              className={`text-sm font-mono font-semibold ${
                validation.totalValid ? "text-success" : "text-destructive"
              }`}
            >
              {getTotalWeight()}% / 100%
            </div>
          </div> */}
        </div>
      </div>

      {/* ---------- Configuration Issues ---------- */}
      {(!validation.totalValid || !validation.categoriesValid) && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-warning mb-1">
                Configuration Issues:
              </div>
              <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                {!validation.totalValid && (
                  <li>
                    Category weights must total exactly 100% (currently{" "}
                    {getTotalWeight()}%)
                  </li>
                )}
                {!validation.categoriesValid && (
                  <li>
                    All skill weights within each category must total 100%
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
</div>


        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button onClick={handleSavePersona} className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Save Persona</span>
          </Button>
        </div>

        {/* Save Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Save Persona</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Enter persona name" value={personaName} onChange={(e) => setPersonaName(e.target.value)} />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
                <Button onClick={confirmSavePersona}>Confirm Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this row? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteConfirm) return;
                removeSkillFromCategory(deleteConfirm.cat, deleteConfirm.position);
                setDeleteConfirm(null)}}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default PersonaConfig