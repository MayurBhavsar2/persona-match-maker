import { useState, useRef, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { mockFetchPersona } from "@/mocks/mockAPI";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Plus,
  Trash2,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axiosInstance, { isAxiosError } from "@/lib/utils";

const PersonaConfig = () => {
  const navigate = useNavigate();

  // State
  const [categories, setCategories] = useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    cat: number;
    position: number;
  } | null>(null);
  const [personaName, setPersonaName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [personaNotes, setPersonaNotes] = useState("");
  const [activeTab, setActiveTab] = useState("distribution");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const distributionRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    const selectedJD = localStorage.getItem("selectedJD");
    const storedJD = localStorage.getItem("jdData");

    if (storedJD) {
      const parsed = JSON.parse(storedJD);
      setRoleName(parsed.role || "Unknown Role");
      setRoleId(parsed.id || "");
    }

    if (!selectedJD) {
      toast({
        title: "Error",
        description: "Please select a JD version first.",
        variant: "destructive",
      });
      navigate("/jd-comparison");
      return;
    }

    const { jdId } = JSON.parse(selectedJD);
    const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_DATA === "true";

    // const fetchPersona = async () => {
    //   try {
    //     setLoading(true);

    //     let data;
    //     if (USE_MOCK_API) {
    //       data = await mockFetchPersona(jdId);
    //     } else {
    //       try {
    //         const { data } = await axiosInstance.post(
    //           `/api/v1/persona/generate-from-jd/${jdId}`,
    //           { job_description_id: jdId },
    //           {
    //             timeout: 90000,
    //           }
    //         );

    //         console.log(data);
    //         const normalizedCategories = (data.categories || []).map((cat: any) => ({
    //           ...cat,
    //           weight_percentage: Number(cat.weight_percentage) || 0,
    //           range_min: Number(cat.range_min) || 0,
    //           range_max: Number(cat.range_max) || 0,
    //           subcategories: (cat.subcategories || []).map((sub: any) => ({
    //             ...sub,
    //             weight_percentage: Number(sub.weight_percentage) || 0,
    //             level_id: String(sub.level_id || "3"),
    //             skillset: sub.skillset || { technologies: [] },
    //           })),
    //         }));
    
    //         setCategories(normalizedCategories);
    //         setPersonaName(data.name || "");
    //         setPersonaNotes(data.persona_notes || "");
    //       } catch (error) {
    //         if (isAxiosError(error)) {
    //           if (error.code === "ECONNABORTED") {
    //             throw new Error("Request timeout - please try again");
    //           }
    //           throw new Error(
    //             error.response?.data?.message || "Failed to fetch persona"
    //           );
    //         }
    //         throw error;
    //       }
    //     }

    //     // Normalize data to ensure consistent types
    //     const normalizedCategories = (data.categories || []).map(
    //       (cat: any) => ({
    //         ...cat,
    //         weight_percentage: Number(cat.weight_percentage) || 0,
    //         range_min: Number(cat.range_min) || 0,
    //         range_max: Number(cat.range_max) || 0,
    //         subcategories: (cat.subcategories || []).map((sub: any) => ({
    //           ...sub,
    //           weight_percentage: Number(sub.weight_percentage) || 0,
    //           level_id: String(sub.level_id || "3"),
    //           skillset: sub.skillset || { technologies: [] },
    //         })),
    //       })
    //     );

    //     setCategories(normalizedCategories);
    //     setPersonaName(data.name || "");
    //     setPersonaNotes(data.persona_notes || "");
    //   } catch (error) {
    //     console.error(error);
    //     toast({
    //       title: "Error",
    //       description: "Failed to load persona data. Please try again.",
    //       variant: "destructive",
    //     });
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    const fetchPersona = async () => {
      try {
        setLoading(true);
        
        if (USE_MOCK_API) {
          const data = await mockFetchPersona(jdId);
          
          // Normalize mock data
          const normalizedCategories = (data.categories || []).map((cat: any) => ({
            ...cat,
            weight_percentage: Number(cat.weight_percentage) || 0,
            range_min: Number(cat.range_min) || 0,
            range_max: Number(cat.range_max) || 0,
            subcategories: (cat.subcategories || []).map((sub: any) => ({
              ...sub,
              weight_percentage: Number(sub.weight_percentage) || 0,
              level_id: String(sub.level_id || "3"),
              skillset: sub.skillset || { technologies: [] },
            })),
          }));
          
          setCategories(normalizedCategories);
          setPersonaName(data.name || "");
          setPersonaNotes(data.persona_notes || "");
        } else {
          const { data } = await axiosInstance.post(
            `/api/v1/persona/generate-from-jd/${jdId}`,
            { job_description_id: jdId },
            {
              timeout: 90000,
            }
          );
          
          console.log(data);
          
          // Normalize API data
          const normalizedCategories = (data.categories || []).map((cat: any) => ({
            ...cat,
            weight_percentage: Number(cat.weight_percentage) || 0,
            range_min: Number(cat.range_min) || 0,
            range_max: Number(cat.range_max) || 0,
            subcategories: (cat.subcategories || []).map((sub: any) => ({
              ...sub,
              weight_percentage: Number(sub.weight_percentage) || 0,
              level_id: String(sub.level_id || "3"),
              skillset: sub.skillset || { technologies: [] },
            })),
          }));
          
          setCategories(normalizedCategories);
          setPersonaName(data.name || "");
          setPersonaNotes(data.persona_notes || "");
        }
      } catch (error) {
        console.error(error);
        if (isAxiosError(error)) {
          if (error.code === "ECONNABORTED") {
            toast({
              title: "Error",
              description: "Request timeout - please try again",
              variant: "destructive",
            });
            return;
          }
        }
        toast({
          title: "Error",
          description: "Failed to load persona data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPersona();
  }, [navigate]);

  // Helpers
  const getTotalWeight = () =>
    categories.reduce(
      (acc, cat) => acc + Number(cat.weight_percentage || 0),
      0
    );

  const getCategorySkillTotal = (catIndex: number) =>
    categories[catIndex]?.subcategories.reduce(
      (acc: number, sub: any) => acc + Number(sub.weight_percentage || 0),
      0
    ) || 0;

  const updateCategory = (catPos: number, updatedFields: any) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.position === catPos
          ? {
              ...cat,
              ...updatedFields,
              weight_percentage: Number(
                updatedFields.weight_percentage || cat.weight_percentage
              ),
            }
          : cat
      )
    );
  };

  const updateSubcategory = (
    catPos: number,
    subPos: number,
    updatedFields: any
  ) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.position === catPos) {
          const updatedSubcategories = cat.subcategories.map((sub: any) =>
            sub.position === subPos
              ? {
                  ...sub,
                  ...updatedFields,
                  weight_percentage: Number(
                    updatedFields.weight_percentage ?? sub.weight_percentage
                  ),
                  level_id:
                    updatedFields.level_id !== undefined
                      ? String(updatedFields.level_id)
                      : sub.level_id,
                }
              : sub
          );
          return { ...cat, subcategories: updatedSubcategories };
        }
        return cat;
      })
    );
  };

  const scrollToSection = (value: string) => {
    setActiveTab(value);

    // Adjust this number based on your sticky header height
    const headerOffset = 133;

    const ref =
      value === "distribution"
        ? distributionRef.current
        : value === "summary"
        ? summaryRef.current
        : null;

    if (ref) {
      const elementPosition = ref.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // const addSkillToCategory = (categoryId: string) => {
  //     setCategories(prev =>
  //       prev.map(cat => {
  //         if (cat.id === categoryId) {
  //           const newSubcategory = {
  //             name: "New Skill",
  //             weight_percentage: 0,
  //             level_id: 3,
  //             notes: "",
  //             position:cat.subcategories.length+1,
  //           };
  //           return { ...cat, subcategories: [...(cat.subcategories || []), newSubcategory] };
  //         }
  //         return cat;
  //       })
  //     );
  //   };

  // const addSkillToCategory = (categoryIndex: number) => {
  //   setCategories(prev =>
  //     prev.map((cat, idx) => {
  //       if (idx !== categoryIndex) return cat; // match by index

  //       const maxPosition = cat.subcategories.reduce(
  //         (max: number, sub: any) => Math.max(max, sub.position || 0),
  //         0
  //       );

  //       const newSubcategory = {
  //         id: `new-skill-${Date.now()}`,
  //             name: "New Skill",
  //             weight_percentage: 0,
  //             level_id: "3",
  //             notes: "",
  //             position: maxPosition + 1,
  //             skillset: { technologies: [] },
  //       };

  //       return { ...cat, subcategories: [...cat.subcategories, newSubcategory] };
  //     })
  //   );
  // };

  const addSkillToCategory = (categoryPosition) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.position === categoryPosition) {
          // ✅ Only modify the matching category
          return {
            ...cat,
            subcategories: [
              ...cat.subcategories,
              {
                position: cat.subcategories.length + 1,
                name: "New Skill",
                weight_percentage: 0,
                level_id: "1",
                skillset: { technologies: [] },
              },
            ],
          };
        }
        return cat; // 🔹 Leave other categories unchanged
      })
    );
  };

  // const addSkillToCategory = (categoryId: string,subcategoryId: string) => {
  //   setCategories(prev =>
  //     prev.map(cat => {
  //       if (cat.id === categoryId) {
  //         const maxPosition = cat.subcategories.reduce(
  //           (max: number, sub: any) => Math.max(max, sub.position || 0),
  //           0
  //         );
  //         const newSubcategory = {
  //           id: `new-skill-${Date.now()}`,
  //           name: "New Skill",
  //           weight_percentage: 0,
  //           level_id: "3",
  //           notes: "",
  //           position: maxPosition + 1,
  //           skillset: { technologies: [] },
  //         };
  //         return { ...cat, subcategories: [...cat.subcategories, newSubcategory] };
  //       }
  //       return cat;
  //     })
  //   );
  // };

  //   const addSkillToCategory = (categoryId: string, subcategoryId: string) => {
  //   setCategories(prev =>
  //     prev.map(cat => {
  //       if (cat.id === categoryId) {
  //         const updatedSubcategories = cat.subcategories.map(sub => {
  //           if (sub.id === subcategoryId) {
  //             const updatedTechnologies = [
  //               ...(sub.skillset?.technologies || []),
  //               "New Skill"
  //             ];
  //             return {
  //               ...sub,
  //               skillset: {
  //                 ...sub.skillset,
  //                 technologies: updatedTechnologies
  //               }
  //             };
  //           }
  //           return sub;
  //         });
  //         return { ...cat, subcategories: updatedSubcategories };
  //       }
  //       return cat;
  //     })
  //   );
  // };

  const removeSkillFromCategory = (
    categoryPosition: number,
    subPosition: number
  ) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.position === categoryPosition) {
          return {
            ...cat,
            subcategories: cat.subcategories.filter(
              (sub: any) => sub.position !== subPosition
            ),
          };
        }
        return cat;
      })
    );
  };

  const validation = {
    totalValid: Math.abs(getTotalWeight() - 100) < 0.01,
    categoriesValid: categories.every(
      (_, idx) => Math.abs(getCategorySkillTotal(idx) - 100) < 0.01
    ),
    hasName: personaName.trim().length > 0,
  };

  const canSave =
    validation.totalValid && validation.categoriesValid && validation.hasName;

  const handleSavePersona = () => {
    if (!canSave) {
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before saving.",
        variant: "destructive",
      });
      return;
    } else {
      setPersonaName("");
      setError("");
      setShowSaveDialog(true);
    }
    setShowSaveDialog(true);
  };

  const confirmSavePersona = async () => {
    if (!canSave) return;

    const selectedJD = localStorage.getItem("selectedJD");
    if (!selectedJD) {
      toast({
        title: "Error",
        description: "No job description selected.",
        variant: "destructive",
      });
      return;
    }

    const { jdId } = JSON.parse(selectedJD);

    const payload = {
      name: personaName.trim(),
      role_name: roleName,
      role_id: roleId,
      job_description_id: jdId,
      persona_notes: personaNotes.trim(),
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        weight_percentage: Number(cat.weight_percentage),
        range_min: Number(cat.range_min || 0),
        range_max: Number(cat.range_max || 100),
        position: cat.position,
        notes: cat.notes || { custom_notes: "" },
        subcategories: cat.subcategories.map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          weight_percentage: Number(sub.weight_percentage),
          level_id: String(sub.level_id),
          position: sub.position,
          notes: sub.notes || "",
          skillset: {
            technologies: Array.isArray(sub.skillset?.technologies)
              ? sub.skillset.technologies
              : [],
          },
        })),
      })),
    };

    console.log("Payload being sent:", JSON.stringify(payload, null, 2));

    try {
      setSaving(true);
      console.log("persona save try block");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/persona/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to save persona";
        try {
          const errorData = await response.json();
          console.error("API Error Response:", errorData);

          // Handle different error response formats
          if (typeof errorData === "string") {
            errorMessage = errorData;
          } else if (errorData.detail) {
            // Handle FastAPI validation errors
            if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail
                .map(
                  (err: any) => `${err.loc?.join(".") || "Field"}: ${err.msg}`
                )
                .join("; ");
            } else if (typeof errorData.detail === "string") {
              errorMessage = errorData.detail;
            } else {
              errorMessage = JSON.stringify(errorData.detail);
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else {
            errorMessage = JSON.stringify(errorData);
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Save successful:", data);

      localStorage.setItem(
        "savedPersona",
        JSON.stringify({
          id: data.id,
          name: data.name,
          apiData: data,
        })
      );

      toast({
        title: "Success",
        description: `Persona "${personaName}" saved successfully!`,
      });

      setShowSaveDialog(false);
      navigate("/candidate-upload");
    } catch (error) {
      console.error("Save error:", error);

      let errorDescription = "Failed to save persona. Please try again.";
      if (error instanceof Error) {
        errorDescription = error.message;
      } else if (typeof error === "string") {
        errorDescription = error;
      }

      toast({
        title: "Error",
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-baseline justify-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">
              Configure Ideal Persona
            </h1>
            <span className="text-muted-foreground">Role:</span>
            <span className="text-xl font-bold text-primary">{roleName}</span>
          </div>
        </div>

        {/* Sticky Tabs */}
        <div className="bg-background border-b border-border sticky top-16 z-30 -mx-6 px-6 py-3">
          <Tabs
            value={activeTab}
            onValueChange={scrollToSection}
            className="w-full max-w-6xl mx-auto"
          >
            <TabsList className="grid w-full grid-cols-2 h-10 bg-muted">
              <TabsTrigger value="distribution" className="text-sm font-medium">
                Table of Distribution
              </TabsTrigger>
              <TabsTrigger value="summary" className="text-sm font-medium">
                Summary
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Distribution Section */}
        <div ref={distributionRef} className="space-y-6 mt-6">
          <TooltipProvider>
            <Accordion type="multiple" className="space-y-0">
              {categories.map((cat) => {
                const skillTotal = getCategorySkillTotal(cat.position - 1);
                const isSkillTotalValid = Math.abs(skillTotal - 100) < 0.01;

                return (
                  <AccordionItem
                    key={cat.position}
                    value={cat.position.toString()}
                    className="border-0"
                  >
                    <Card className="shadow-card overflow-hidden rounded-none first:rounded-t-lg last:rounded-b-lg border-b-0 last:border-b">
                      <AccordionTrigger className="px-3 py-2 hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                          <h3 className="text-base font-medium text-foreground w-[220px] text-left">
                            {cat.name}
                          </h3>
                          <div className="flex items-center justify-center flex-1 mr-32">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-end w-24">
                                  <Input
                                    type="text"
                                    value={cat.weight_percentage}
                                    onChange={(e) =>
                                      updateCategory(cat.position, {
                                        weight_percentage:
                                          parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="w-14 h-7 text-center font-mono text-sm border-muted font-bold"
                                    min={0}
                                    max={100}
                                    step={0.1}
                                  />
                                  <span className="text-sm text-muted-foreground ml-2">
                                    %
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Category weight percentage (all categories
                                  must total 100%)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isSkillTotalValid ? (
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <CardContent className="pt-0 pb-2 space-y-2">
                          <div>
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-transparent border-b">
                                  <TableHead className="w-[25%] py-2 text-sm font-medium">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 cursor-help">
                                          Skill Name
                                          <Info className="h-3.5 w-3.5" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          Name of the specific skill or
                                          competency
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableHead>
                                  <TableHead className="w-[1%] text-center py-2 text-sm font-medium">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center justify-center gap-1 cursor-help">
                                          Weight
                                          <Info className="h-3.5 w-3.5" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          Percentage weight of this skill within
                                          the category
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableHead>
                                  <TableHead className="w-[1%] text-center py-2 text-sm font-medium">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center justify-center gap-1 cursor-help">
                                          Level
                                          <Info className="h-3.5 w-3.5" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="grid grid-cols-2 gap-x-3 text-sm text-center">
                                          <p className="text-right font-medium">
                                            Level 1
                                          </p>
                                          <p className="text-left">Basic</p>
                                          <p className="text-right font-medium">
                                            Level 2
                                          </p>
                                          <p className="text-left">Working</p>
                                          <p className="text-right font-medium">
                                            Level 3
                                          </p>
                                          <p className="text-left">
                                            Proficient
                                          </p>
                                          <p className="text-right font-medium">
                                            Level 4
                                          </p>
                                          <p className="text-left">Advanced</p>
                                          <p className="text-right font-medium">
                                            Level 5
                                          </p>
                                          <p className="text-left">Expert</p>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableHead>
                                  <TableHead className="w-[40%] py-2 text-sm font-medium">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 cursor-help">
                                          Skills & Technologies
                                          <Info className="h-3.5 w-3.5" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          Specific technologies, tools, or
                                          skills required
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableHead>
                                  <TableHead className="w-[5%] py-2"></TableHead>
                                </TableRow>
                              </TableHeader>

                              <TableBody className="text-[14.9px]">
                                {cat.subcategories.map(
                                  (sub: any, subIndex: number) => (
                                    <TableRow
                                      key={sub.position}
                                      className="hover:bg-muted/30 border-b h-9"
                                    >
                                      <TableCell className="p-0 align-middle">
                                        <Input
                                          value={sub.name}
                                          onChange={(e) =>
                                            updateSubcategory(
                                              cat.position,
                                              sub.position,
                                              {
                                                name: e.target.value,
                                              }
                                            )
                                          }
                                          className="border-0 p-1 h-8 bg-transparent focus-visible:ring-0 text-sm ml-3"
                                        />
                                      </TableCell>
                                      <TableCell className="text-center p-0 align-middle">
                                        <Input
                                          type="text"
                                          value={sub.weight_percentage}
                                          onChange={(e) =>
                                            updateSubcategory(
                                              cat.position,
                                              sub.position,
                                              {
                                                weight_percentage:
                                                  parseFloat(e.target.value) ||
                                                  0,
                                              }
                                            )
                                          }
                                          className="w-12 h-8 text-center text-[14.9px] border-muted ml-2"
                                          min={0}
                                          max={100}
                                          step={0.1}
                                        />
                                      </TableCell>
                                      <TableCell className="text-center p-0 align-middle">
                                        <Select
                                          value={String(sub.level_id)}
                                          onValueChange={(value) =>
                                            updateSubcategory(
                                              cat.position,
                                              sub.position,
                                              {
                                                level_id: value,
                                              }
                                            )
                                          }
                                        >
                                          <SelectTrigger className="w-16 h-8 text-[14px] border-muted">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="1">1</SelectItem>
                                            <SelectItem value="2">2</SelectItem>
                                            <SelectItem value="3">3</SelectItem>
                                            <SelectItem value="4">4</SelectItem>
                                            <SelectItem value="5">5</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </TableCell>
                                      <TableCell className="p-0 align-middle">
                                        <Textarea
                                          value={
                                            sub.skillset?.technologies?.join(
                                              ", "
                                            ) || ""
                                          }
                                          onChange={(e) =>
                                            updateSubcategory(
                                              cat.position,
                                              sub.position,
                                              {
                                                skillset: {
                                                  technologies: e.target.value
                                                    .split(",")
                                                    .map((t) => t.trim())
                                                    .filter(Boolean),
                                                },
                                              }
                                            )
                                          }
                                          className="min-h-[35px] h-8 resize-none border-0 p-1 bg-transparent focus-visible:ring-0 text-[14.9px] ml-3"
                                        />
                                      </TableCell>
                                      <TableCell className="text-center p-0 align-middle">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            setDeleteConfirm({
                                              cat: cat.position,
                                              position: sub.position,
                                            })
                                          }
                                          className="h-8 w-8 p-0 hover:text-destructive"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <div className="flex items-center gap-3 w-full">
                              <div className="flex-shrink-0">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    addSkillToCategory(cat.position)
                                  }
                                  className="h-8 gap-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add Skill
                                </Button>
                              </div>

                              <div className="text-sm text-muted-foreground flex items-center">
                                <span
                                  className={`font-mono font-bold text-base ml-[14.1rem] ${
                                    isSkillTotalValid
                                      ? "text-success"
                                      : "text-destructive"
                                  }`}
                                >
                                  {skillTotal.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TooltipProvider>

          {/* Total Category Weight Card */}
          <Card className="shadow-card border-2 border-primary/20 bg-primary/5">
            <CardContent className="py-4 px-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-foreground">
                    Total Category Weight
                  </span>
                  {validation.totalValid ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div
                  className={`text-lg font-mono font-bold ${
                    validation.totalValid ? "text-success" : "text-destructive"
                  } mr-[31.1rem]`}
                >
                  {getTotalWeight().toFixed(1)}%
                </div>
              </div>
              {!validation.totalValid && (
                <p className="text-xs text-destructive">
                  Category weights must total exactly 100%
                </p>
              )}

              {/* Persona Notes Section */}
            </CardContent>
          </Card>
          <div className="pt-3 border-t border-border/50">
            <Label
              htmlFor="persona-notes"
              className="text-sm font-medium mb-2 block"
            >
              Persona Notes
            </Label>
            <Textarea
              id="persona-notes"
              placeholder="Add any additional notes or comments about this persona configuration..."
              value={personaNotes}
              onChange={(e) => setPersonaNotes(e.target.value)}
              className="min-h-[40px] text-sm resize-none border border-gray-400"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional: Add context, assumptions, or special considerations for
              this persona
            </p>
          </div>
        </div>

        {/* Summary Section */}
        <div ref={summaryRef} className="space-y-6 mt-6">
          <Card className="shadow-card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Persona Configuration Summary</span>
              </CardTitle>
              <CardDescription>
                Quick overview of all categories and weights
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const skillTotal = category.subcategories.reduce(
                    (acc: number, sub: any) =>
                      acc + Number(sub.weight_percentage || 0),
                    0
                  );
                  const isSkillTotalValid = Math.abs(skillTotal - 100) < 0.01;

                  return (
                    <div
                      key={category.position}
                      className="bg-background/80 rounded-lg p-4 space-y-3 border border-border/50"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-foreground">
                          {category.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono bg-primary/10 text-primary px-2 rounded">
                            {Number(category.weight_percentage).toFixed(1)}%
                          </span>
                          {isSkillTotalValid ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 pl-1">
                        {category.subcategories.map((sub: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-muted-foreground truncate flex-1 mr-2">
                              {sub.name}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                                {Number(sub.weight_percentage).toFixed(1)}%
                              </span>
                              <span className="font-mono bg-primary/10 px-1.5 py-0.5 rounded text-primary">
                                L{sub.level_id}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Skills Total:
                          </span>
                          <span
                            className={`font-mono font-bold text-lg ${
                              isSkillTotalValid
                                ? "text-success"
                                : "text-destructive"
                            }`}
                          >
                            {skillTotal.toFixed(1)}%
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
                </div>
              </div>

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
                            {getTotalWeight().toFixed(1)}%)
                          </li>
                        )}
                        {!validation.categoriesValid && (
                          <li>
                            All skill weights within each category must total
                            100%
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
          <Button
            onClick={handleSavePersona}
            disabled={!canSave || saving}
            className="flex items-center space-x-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Persona</span>
              </>
            )}
          </Button>
        </div>

        {/* Save Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Save Persona</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="persona-name"
                  className="text-sm font-medium mb-2 block"
                >
                  Persona Name
                </Label>
                <Input
                  id="persona-name"
                  placeholder="persona-<position>-<username>-<date-time>"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  className="w-full"
                />
                {!validation.hasName && (
                  <p className="text-xs text-destructive mt-1">
                    Persona name is required
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmSavePersona}
                  disabled={!canSave || saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Confirm Save"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this skill? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteConfirm) return;
                removeSkillFromCategory(
                  deleteConfirm.cat,
                  deleteConfirm.position
                );
                setDeleteConfirm(null);
              }}
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

export default PersonaConfig;