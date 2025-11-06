import { useState, useRef, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { mockFetchPersona } from "@/mocks/mockAPI";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, AlertCircle, Lightbulb, Save, Loader2, Minus, Plus, Trash2 } from "lucide-react";

interface PersonaFormProps {
  mode: 'create' | 'edit';
  personaId?: string;
  jdId?: string; // Required for create mode
  onSave?: (data: any) => void;
  onCancel?: () => void;
  showLayout?: boolean;
}

interface JDOption {
  id: string;
  title: string;
  role_name: string;
}

const PersonaForm = ({ mode, personaId, jdId, onSave, onCancel, showLayout = true }: PersonaFormProps) => {
  const navigate = useNavigate();

  // State
  const [categories, setCategories] = useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ cat: string; position: number } | null>(null);
  const [personaName, setPersonaName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [activeTab, setActiveTab] = useState("distribution");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedJdId, setSelectedJdId] = useState(jdId || "");
  const [availableJDs, setAvailableJDs] = useState<JDOption[]>([]);

  const distributionRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const aiInsightsRef = useRef<HTMLDivElement>(null);

  // Load available JDs for create mode
  useEffect(() => {
    if (mode === 'create') {
      loadAvailableJDs();
    }
  }, [mode]);

  // Load existing persona data in edit mode
  useEffect(() => {
    if (mode === 'edit' && personaId) {
      loadPersonaData(personaId);
    } else if (mode === 'create' && selectedJdId) {
      generatePersonaFromJD(selectedJdId);
    }
  }, [mode, personaId, selectedJdId]);

  const loadAvailableJDs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch JDs");

      const data = await response.json();
      const jds = data.job_descriptions || data;
      setAvailableJDs(jds.map((jd: any) => ({
        id: jd.id,
        title: jd.title,
        role_name: jd.role_name || jd.role
      })));

    } catch (error) {
      console.error("Error loading JDs:", error);
      toast({
        title: "Error loading JDs",
        description: "Could not load available job descriptions.",
        variant: "destructive",
      });
    }
  };

  const loadPersonaData = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/persona/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch persona");

      const data = await response.json();
      
      setCategories(data.categories || []);
      setPersonaName(data.name || "");
      setSelectedJdId(data.job_description_id || "");
      
      // Load JD info for display
      if (data.job_description_id) {
        loadJDInfo(data.job_description_id);
      }

    } catch (error) {
      console.error("Error loading persona:", error);
      toast({
        title: "Error loading persona",
        description: "Could not load persona data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadJDInfo = async (jdId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/${jdId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch JD");

      const data = await response.json();
      setRoleName(data.role_name || data.role || "");

    } catch (error) {
      console.error("Error loading JD info:", error);
    }
  };

  const generatePersonaFromJD = async (jdId: string) => {
    if (!jdId) return;

    try {
      setLoading(true);

      const USE_MOCK_API = true; // toggle this to switch

      let data;
      if (USE_MOCK_API) {
        data = await mockFetchPersona(jdId);
      } else {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/persona/generate-from-jd/${jdId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ job_description_id: jdId }),
        });

        if (!response.ok) throw new Error("Failed to generate persona");

        data = await response.json();
      }

      setCategories(data.categories || []);
      setPersonaName(data.name || "");

      // Load JD info for display
      const selectedJD = availableJDs.find(jd => jd.id === jdId);
      if (selectedJD) {
        setRoleName(selectedJD.role_name);
      }

    } catch (error) {
      console.error("Error generating persona:", error);
      toast({
        title: "Error generating persona",
        description: "Could not generate persona from JD.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getTotalWeight = () => categories.reduce((acc, cat) => acc + cat.weight_percentage, 0);
  const getCategorySkillTotal = (catIndex: number) =>
    categories[catIndex].subcategories.reduce((acc, sub) => acc + sub.weight_percentage, 0);

  const updateCategory = (catPos: number, updatedFields: any) => {
    setCategories(prev =>
      prev.map(cat => (cat.position === catPos ? { ...cat, ...updatedFields } : cat))
    );
  };

  const updateSubcategory = (catPos: number, subPos: number, updatedFields: any) => {
    setCategories(prev =>
      prev.map(cat => {
        if (cat.position === catPos) {
          const updatedSubcategories = cat.subcategories.map(sub =>
            sub.position === subPos ? { ...sub, ...updatedFields } : sub
          );
          return { ...cat, subcategories: updatedSubcategories };
        }
        return cat;
      })
    );
  };

  const scrollToSection = (value: string) => {
    setActiveTab(value);
    if (value === "distribution") distributionRef.current?.scrollIntoView({ behavior: "smooth" });
    if (value === "summary") summaryRef.current?.scrollIntoView({ behavior: "smooth" });
    if (value === "insights") aiInsightsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSavePersona = () => setShowSaveDialog(true);

  const confirmSavePersona = async () => {
    const payload = {
      job_description_id: selectedJdId,
      name: personaName,
      categories
    };

    try {
      setLoading(true);

      let response;
      if (mode === 'create') {
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/persona/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/persona/${personaId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to ${mode === 'create' ? 'save' : 'update'} persona`);
      }

      const data = await response.json();

      if (mode === 'create') {
        localStorage.setItem(
          "savedPersona",
          JSON.stringify({
            id: data.id,
            name: data.name,
            apiData: data,
          })
        );
      }

      toast({
        title: `Persona ${mode === 'create' ? 'Saved' : 'Updated'}`,
        description: `${personaName} ${mode === 'create' ? 'saved' : 'updated'} successfully!`,
        variant: "default",
      });

      setShowSaveDialog(false);

      if (onSave) {
        onSave(data);
      } else {
        if (mode === 'create') {
          navigate('/candidate-upload');
        } else {
          navigate('/personas');
        }
      }

    } catch (error) {
      console.error(error);

      toast({
        title: "Error",
        description: `Failed to ${mode === 'create' ? 'save' : 'update'} persona. Please try again.`,
        variant: "destructive",
      });

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
            level_id: "3",
            notes: "",
            position: cat.subcategories.length + 1,
            skillset: { technologies: [] }
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

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="text-lg font-semibold text-gray-600">
          {mode === 'create' ? 'Generating Persona Configuration...' : 'Loading Persona Configuration...'}
        </p>
      </div>
    );
  }

  const formContent = (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          {mode === 'create' ? 'Configure Ideal Persona' : 'Edit Persona Configuration'}
        </h1>
        <div className="flex items-center justify-center space-x-4 text-sm">
          {mode === 'create' && (
            <div className="flex items-center space-x-2">
              <Label>Select JD:</Label>
              <Select value={selectedJdId} onValueChange={setSelectedJdId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Choose a job description..." />
                </SelectTrigger>
                <SelectContent>
                  {availableJDs.map((jd) => (
                    <SelectItem key={jd.id} value={jd.id}>
                      {jd.title} - {jd.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {roleName && (
            <>
              <span className="text-muted-foreground">Role:</span>
              <span className="font-medium text-primary">{roleName}</span>
            </>
          )}
        </div>
        {mode === 'edit' && (
          <div className="space-y-2">
            <Label htmlFor="personaName">Persona Name:</Label>
            <Input
              id="personaName"
              value={personaName}
              onChange={(e) => setPersonaName(e.target.value)}
              className="max-w-md mx-auto"
              placeholder="Enter persona name..."
            />
          </div>
        )}
      </div>

      {/* Only show configuration if JD is selected (create mode) or data is loaded (edit mode) */}
      {((mode === 'create' && selectedJdId && categories.length > 0) || (mode === 'edit' && categories.length > 0)) && (
        <>
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
                                        value={sub.skillset?.technologies?.join(", ") || ""}
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
                                <span className="font-bold font-semibold">Skills total:</span> <span className={`font-mono ${isSkillTotalValid ? 'text-success' : 'text-destructive'}`}>{skillTotal}%</span>
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

            {/* Save Button */}
            <Card className="shadow-card border-2 border-primary/20 bg-primary/5">
              <CardContent className="py-4 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {validation.totalValid ? <CheckCircle2 className="w-5 h-5 text-success" /> : <AlertCircle className="w-5 h-5 text-destructive" />}
                      <span className="font-medium">
                        Total Weight: <span className={`font-mono ${validation.totalValid ? 'text-success' : 'text-destructive'}`}>{getTotalWeight()}%</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {validation.categoriesValid ? <CheckCircle2 className="w-5 h-5 text-success" /> : <AlertCircle className="w-5 h-5 text-destructive" />}
                      <span className="font-medium">
                        All Skills: <span className={`${validation.categoriesValid ? 'text-success' : 'text-destructive'}`}>{validation.categoriesValid ? 'Valid' : 'Invalid'}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSavePersona}
                      disabled={!validation.totalValid || !validation.categoriesValid}
                      className="bg-gradient-primary hover:opacity-90 transition-smooth flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{mode === 'create' ? 'Save Persona' : 'Update Persona'}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{mode === 'create' ? 'Save Persona Configuration?' : 'Update Persona Configuration?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {mode === 'create' 
                ? 'This will save your persona configuration and proceed to candidate upload.'
                : 'This will update your persona configuration with the current settings.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSavePersona} disabled={loading}>
              {loading ? 'Saving...' : (mode === 'create' ? 'Save & Continue' : 'Update')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this skill from the category. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  removeSkillFromCategory(deleteConfirm.cat, deleteConfirm.position);
                  setDeleteConfirm(null);
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  return showLayout ? (
    <Layout currentStep={2}>
      {formContent}
    </Layout>
  ) : (
    formContent
  );
};

export default PersonaForm;