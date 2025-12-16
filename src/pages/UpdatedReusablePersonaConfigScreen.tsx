import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { mockFetchPersona } from "@/mocks/mockAPI";
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
  Sparkles,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import axiosInstance from "@/lib/utils";

import { Pie, PieChart, Sector, Cell, Tooltip as RechartsTooltip, PieSectorDataItem, ResponsiveContainer } from 'recharts';

// Render active shape with details
const renderActiveShape = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  payload,
  percent,
  value,
}: PieSectorDataItem) => {
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * (midAngle ?? 1));
  const cos = Math.cos(-RADIAN * (midAngle ?? 1));
  const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos;
  const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin;
  const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos;
  const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={(outerRadius ?? 0) + 6}
        outerRadius={(outerRadius ?? 0) + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
        {`${value.toFixed(1)}%`}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${((percent ?? 1) * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

// Category colors for the pie chart
const CATEGORY_COLORS = [
  "#10b981", // Technical Skills - emerald
  "#8b5cf6", // Cognitive Demands - violet
  "#f59e0b", // Values - amber
  "#3b82f6", // Foundational Behaviors - blue
  "#ef4444", // Leadership Skills - red
  "#06b6d4", // Education and Experience - cyan
];

// API Functions (keeping existing ones)
const fetchRoles = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/job-role/?page=1&size=100&active_only=true`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) {
    if (response.status === 401) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch roles");
  }
  const data = await response.json();
  return data.job_roles || data;
};

const fetchJDsByRole = async (roleId: string) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/by-role/${roleId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) {
    if (response.status === 401) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch JDs");
  }
  const data = await response.json();
  return Array.isArray(data) ? data : (data.jds || data.items || data.results || []);
};

const generatePersonaFromJD = async ({ roleId, jdId }: { roleId: string; jdId: string }) => {
  const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_DATA === "true";
  
  if (USE_MOCK_API) {
    const data = await mockFetchPersona(jdId);
    return data;
  }
  
  const { data } = await axiosInstance.post(
    `/api/v1/persona/generate-from-jd/${jdId}`,
    { job_description_id: jdId },
    { timeout: 90000 }
  );
  return data;
};

const fetchPersonaById = async (personaId: string) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/persona/${personaId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) {
    if (response.status === 401) {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      throw new Error("Unauthorized");
    }
    throw new Error("Failed to fetch persona");
  }
  return response.json();
};

const UpdatedReusablePersonaConfig = () => {
  const navigate = useNavigate();
  const { personaId, jdId } = useParams<{ personaId?: string; jdId?: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [activeIndex, setActiveIndex] = useState(0);


  // Determine mode
  const isEditMode = location.pathname.includes('/edit/') && !!personaId;
  const isFlowMode = !!jdId && !isEditMode;
  const isStandaloneCreate = !isEditMode && !isFlowMode;

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
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedJD, setSelectedJD] = useState("");
  const [hasGeneratedPersona, setHasGeneratedPersona] = useState(false);
  const [categoryWarnings, setCategoryWarnings] = useState<{[key: number]: string}>({});
  const [hasRangeViolations, setHasRangeViolations] = useState(false);
  const [showRangeWarningDialog, setShowRangeWarningDialog] = useState(false);
  const [originalCategoryWeights, setOriginalCategoryWeights] = useState<{[key: number]: number}>({});

  const distributionRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Fetch roles for standalone mode
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    enabled: isStandaloneCreate,
    staleTime: 30 * 60 * 1000,
    gcTime: 45 * 60 * 1000,
  });

  // Fetch JDs based on selected role
  const { data: jdsData, isLoading: jdsLoading } = useQuery({
    queryKey: ['jds', selectedRole],
    queryFn: () => fetchJDsByRole(selectedRole),
    enabled: isStandaloneCreate && !!selectedRole,
    staleTime: 30 * 60 * 1000,
    gcTime: 45 * 60 * 1000,
  });

  const jds = Array.isArray(jdsData) ? jdsData : [];

  // Fetch existing persona by ID (Edit mode)
  const { 
    data: existingPersona, 
    isLoading: existingPersonaLoading 
  } = useQuery({
    queryKey: ['persona', personaId],
    queryFn: () => fetchPersonaById(personaId!),
    enabled: isEditMode && !!personaId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { 
    data: generatedPersona, 
    isLoading: generatedPersonaLoading,
    refetch: refetchGeneratedPersona 
  } = useQuery({
    queryKey: ['generated-persona', jdId, roleId],
    queryFn: () => generatePersonaFromJD({ roleId, jdId: jdId! }),
    enabled: isFlowMode && !!jdId && !!roleId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const generatePersonaMutation = useMutation({
    mutationFn: generatePersonaFromJD,
    onSuccess: (data) => {
      queryClient.setQueryData(['generated-persona', selectedJD, selectedRole], data);
      processPersonaData(data);
      
      toast({
        title: "Persona Generated",
        description: "AI has generated the persona successfully. You can now review and modify it.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate persona. Please try again.",
        variant: "destructive",
      });
    },
  });

  const processPersonaData = (data: any) => {
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
    
    const originalWeights: {[key: number]: number} = {};
    normalizedCategories.forEach((cat: any) => {
      originalWeights[cat.position] = Number(cat.weight_percentage);
    });
    
    setOriginalCategoryWeights(originalWeights);
    setCategories(normalizedCategories);
    setPersonaName(data.name || "");
    setPersonaNotes(data.persona_notes || data.notes || "");
    setHasGeneratedPersona(true);
  };

  useEffect(() => {
    if (existingPersona) {
      processPersonaData(existingPersona);
      setRoleName(existingPersona.role_name || "");
      setRoleId(existingPersona.role_id || "");
    }
  }, [existingPersona]);

  useEffect(() => {
    if (generatedPersona) {
      processPersonaData(generatedPersona);
    }
  }, [generatedPersona]);

  useEffect(() => {
    if (isFlowMode && jdId) {
      const storedJD = localStorage.getItem("jdData");
      if (storedJD) {
        const parsed = JSON.parse(storedJD);
        setRoleName(parsed.role || "Unknown Role");
        setRoleId(parsed.roleId || parsed.id || "");
        setSelectedRole(parsed.roleId || parsed.id || "");
        setSelectedJD(jdId);
      }
    }
  }, [isFlowMode, jdId]);

  const handleGeneratePersona = () => {
    if (!selectedRole || !selectedJD) {
      toast({
        title: "Missing Information",
        description: "Please select both role and JD to generate persona.",
        variant: "destructive",
      });
      return;
    }

    const cachedPersona = queryClient.getQueryData(['generated-persona', selectedJD, selectedRole]);
    
    if (cachedPersona) {
      toast({
        title: "Persona Loaded",
        description: "Loaded previously generated persona from cache.",
      });
      processPersonaData(cachedPersona);
    } else {
      generatePersonaMutation.mutate({ roleId: selectedRole, jdId: selectedJD });
    }
  };

  // Helper functions
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

  const validateCategoryRange = (catPos: number, newWeight: number) => {
    const category = categories.find(cat => cat.position === catPos);
    if (!category) return { valid: true, message: "" };
    
    const originalWeight = originalCategoryWeights[catPos];
    if (originalWeight === undefined) return { valid: true, message: "" };
    
    const minAllowed = originalWeight + Number(category.range_min || 0);
    const maxAllowed = originalWeight + Number(category.range_max || 0);
    
    if (newWeight < minAllowed || newWeight > maxAllowed) {
      return {
        valid: false,
        message: `Ideal weightage must be between ${minAllowed}% and ${maxAllowed}%`
      };
    }
    
    return { valid: true, message: "" };
  };

  const updateCategory = (catPos: number, updatedFields: any) => {
    if (updatedFields.weight_percentage !== undefined) {
      const validation = validateCategoryRange(catPos, updatedFields.weight_percentage);
      
      setCategoryWarnings(prev => {
        const updated = { ...prev };
        if (!validation.valid) {
          updated[catPos] = validation.message;
        } else {
          delete updated[catPos];
        }
        return updated;
      });
      
      setHasRangeViolations(!validation.valid || 
        Object.keys(categoryWarnings).filter(k => Number(k) !== catPos).length > 0
      );
    }
    
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

  const addSkillToCategory = (categoryPosition: number) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.position === categoryPosition) {
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
        return cat;
      })
    );
  };

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
    hasRangeViolations: hasRangeViolations,
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
    }
    
    if (hasRangeViolations) {
      setShowRangeWarningDialog(true);
      return;
    }

    if (isEditMode) {
      confirmSavePersona();
    } else {
      setShowSaveDialog(true);
    }
  };

  const confirmSavePersona = async () => {
    if (!canSave) return;

    const payload = {
      name: personaName.trim(),
      role_name: roleName,
      role_id: roleId,
      job_description_id: selectedJD || jdId,
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

    try {
      setSaving(true);
      const url = isEditMode 
        ? `${import.meta.env.VITE_API_URL}/api/v1/persona/${personaId}`
        : `${import.meta.env.VITE_API_URL}/api/v1/persona/`;
      
      const method = isEditMode ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = "Failed to save persona";
        try {
          const errorData = await response.json();
          if (typeof errorData === "string") {
            errorMessage = errorData;
          } else if (errorData.detail) {
            if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail
                .map((err: any) => `${err.loc?.join(".") || "Field"}: ${err.msg}`)
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

      if (!isEditMode) {
        localStorage.setItem(
          "savedPersona",
          JSON.stringify({
            id: data.id,
            name: data.name,
            apiData: data,
          })
        );
      }

      queryClient.invalidateQueries({ queryKey: ['personas'] });
      queryClient.invalidateQueries({ queryKey: ['persona', personaId] });

      toast({
        title: "Success",
        description: `Persona "${personaName}" ${isEditMode ? 'updated' : 'saved'} successfully!`,
      });

      setShowSaveDialog(false);
      
      if (isFlowMode) {
        const selectedJdData = jds?.find((jd: any) => jd.id === (selectedJD || jdId));
        const jdData = {
          id: selectedJD || jdId,
          title: selectedJdData?.title || selectedJdData?.role || roleName,
          role_name: roleName,
        };
        const personaData = {
          id: data.id,
          name: data.name,
        };
        
        localStorage.setItem('evaluation_flow_jd', JSON.stringify(jdData));
        localStorage.setItem('evaluation_flow_persona', JSON.stringify(personaData));
        
        navigate("/evaluation/flow");
      } else if (isEditMode) {
        navigate("/persona/list");
      } else {
        navigate("/persona/list");
      }
    } catch (error) {
      console.error("Save error:", error);
      let errorDescription = "Failed to save persona. Please try again.";
      if (error instanceof Error) {
        errorDescription = error.message;
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

  // Prepare data for pie chart
  const pieChartData = categories.map((cat, idx) => ({
    name: cat.name,
    value: Number(cat.weight_percentage) || 0,
    color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  }));

  // Custom label for pie chart
  const renderCustomLabel = (entry: any) => {
    return `${entry.value.toFixed(1)}%`;
  };

  return (
    <Layout currentStep={isFlowMode ? 2 : undefined}>
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-baseline justify-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">
              {isEditMode ? "Edit Persona" : isStandaloneCreate ? "Create Persona" : "Configure Ideal Persona"}
            </h1>
            {!isStandaloneCreate && (
              <>
                <span className="text-muted-foreground">Role:</span>
                <span className="text-xl font-bold text-primary">{roleName}</span>
              </>
            )}
          </div>
        </div>

        {/* Standalone Mode: Role and JD Selection */}
        {isStandaloneCreate && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Select Role and Job Description</CardTitle>
              <CardDescription>
                Choose a role and its corresponding job description to generate a persona
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={selectedRole} onValueChange={(value) => {
                    setSelectedRole(value);
                    setSelectedJD("");
                    setCategories([]);
                    setHasGeneratedPersona(false);
                    setPersonaName("");
                    setPersonaNotes("");
                    setOriginalCategoryWeights({});
                    setCategoryWarnings({});
                    setHasRangeViolations(false);
                    const role = roles.find((r: any) => r.id === value);
                    if (role) {
                      setRoleName(role.name);
                      setRoleId(value);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {rolesLoading ? (
                        <SelectItem value="loading" disabled>Loading roles...</SelectItem>
                      ) : (
                        roles.map((role: any) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jd">Job Description *</Label>
                  <Select 
                    value={selectedJD} 
                    onValueChange={(value)=> {
                      setSelectedJD(value);
                      setCategories([]);
                      setHasGeneratedPersona(false);
                      setPersonaName("");
                      setPersonaNotes("");
                      setOriginalCategoryWeights({});
                      setCategoryWarnings({});
                      setHasRangeViolations(false)
                    }}
                    disabled={!selectedRole}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedRole ? "Select a JD..." : "Select a role first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {jdsLoading ? (
                        <SelectItem value="loading" disabled>Loading JDs...</SelectItem>
                      ) : jds?.length === 0 ? (
                        <SelectItem value="none" disabled>No JDs found for this role</SelectItem>
                      ) : (
                        jds?.map((jd: any) => (
                          <SelectItem key={jd.id} value={jd.id}>
                            {jd.title || jd.role}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleGeneratePersona}
                  disabled={
                    !selectedRole || 
                    !selectedJD || 
                    generatePersonaMutation.isPending ||
                    hasGeneratedPersona
                  }
                  className="bg-gradient-primary hover:opacity-90"
                >
                  {generatePersonaMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Persona...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Persona
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Only show the rest if persona data is available */}
        {hasGeneratedPersona && categories.length > 0 && (
          <>
            {/* Main Content Grid: Left sidebar with chart, Right content area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar - Persona Details and Chart */}
              <div className="lg:col-span-1 space-y-4">
                {/* Persona Details Card */}
                <Card className="shadow-card sticky top-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Persona Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="persona-name" className="text-sm font-medium">
                        Persona Name
                      </Label>
                      <Input
                        id="persona-name"
                        value={personaName}
                        onChange={(e) => setPersonaName(e.target.value)}
                        placeholder="Enter persona name"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="persona-notes" className="text-sm font-medium">
                        Notes
                      </Label>
                      <Textarea
                        id="persona-notes"
                        value={personaNotes}
                        onChange={(e) => setPersonaNotes(e.target.value)}
                        placeholder="Add notes..."
                        className="min-h-[80px] resize-none text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Weight Distribution Chart */}
                <Card className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Weight Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                        {/* <PieChart width={280} height={280}>
                            <Pie
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            dataKey="value"
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            >
                            {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            </Pie>
                            <RechartsTooltip content={() => null} />
                        </PieChart> */}
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        //   label={renderCustomLabel}
                          labelLine={false}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value: any) => `${Number(value).toFixed(1)}%`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Legend */}
                    <div className="mt-4 space-y-2">
                      {pieChartData.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground truncate max-w-[140px]">
                              {entry.name}
                            </span>
                          </div>
                          <span className="font-medium">{entry.value.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Total Weight Indicator */}
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total weight</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold ${
                              validation.totalValid ? "text-success" : "text-destructive"
                            }`}
                          >
                            {getTotalWeight().toFixed(1)}%
                          </span>
                          {validation.totalValid ? (
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Content Area - Main Distribution Table */}
              <div className="lg:col-span-3 space-y-4">
                {/* Sticky Tabs */}
                <div className="bg-background border-b border-border sticky top-2 z-30 -mx-6 px-6 py-3">
                  <Tabs
                    value={activeTab}
                    onValueChange={scrollToSection}
                    className="w-full"
                  >
                    <TabsList className="w-full h-10 bg-muted">
                      <TabsTrigger value="distribution" className="text-sm font-medium">
                        Category Weights
                      </TabsTrigger>
                      {/* <TabsTrigger value="summary" className="text-sm font-medium">
                        Summary
                      </TabsTrigger> */}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Distribution Section */}
                <div ref={distributionRef} className="space-y-4 mt-2">
                  <TooltipProvider>
                    <Accordion type="multiple" className="space-y-0">
                      {categories.map((cat, catIdx) => {
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
                                <div className="flex items-center justify-between w-full gap-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-4 h-4 rounded-full flex-shrink-0"
                                      style={{ 
                                        backgroundColor: CATEGORY_COLORS[catIdx % CATEGORY_COLORS.length] 
                                      }}
                                    />
                                    <h3 className="text-base font-medium text-foreground text-left">
                                      {cat.name}
                                    </h3>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 flex-1 justify-end mr-8">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2">
                                          <Input
                                            type="number"
                                            value={cat.weight_percentage}
                                            onChange={(e) =>
                                              updateCategory(cat.position, {
                                                weight_percentage:
                                                  parseFloat(e.target.value) || 0,
                                              })
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-20 h-8 text-center font-mono text-sm border-muted font-bold"
                                            min={0}
                                            max={100}
                                            step={0.1}
                                          />
                                          <span className="text-sm text-muted-foreground">%</span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Category weight percentage (all categories must total 100%)</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    
                                    {categoryWarnings[cat.position] && (
                                      <div className="flex items-center gap-1 text-xs text-warning">
                                        <AlertCircle className="w-3 h-3" />
                                        <span className="whitespace-nowrap">
                                          {categoryWarnings[cat.position]}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {isSkillTotalValid ? (
                                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                                    ) : (
                                      <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                                    )}
                                  </div>
                                </div>
                              </AccordionTrigger>
                              
                              <AccordionContent>
                                <CardContent className="pt-0 pb-2 space-y-2">
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
                                              <p>Name of the specific skill or competency</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TableHead>
                                        <TableHead className="w-[15%] text-center py-2 text-sm font-medium">
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="flex items-center justify-center gap-1 cursor-help">
                                                Weight
                                                <Info className="h-3.5 w-3.5" />
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Percentage weight of this skill within the category</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TableHead>
                                        <TableHead className="w-[12%] text-center py-2 text-sm font-medium">
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="flex items-center justify-center gap-1 cursor-help">
                                                Level
                                                <Info className="h-3.5 w-3.5" />
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <div className="grid grid-cols-2 gap-x-3 text-sm">
                                                <p className="text-right font-medium">Level 1</p>
                                                <p className="text-left">Basic</p>
                                                <p className="text-right font-medium">Level 2</p>
                                                <p className="text-left">Working</p>
                                                <p className="text-right font-medium">Level 3</p>
                                                <p className="text-left">Proficient</p>
                                                <p className="text-right font-medium">Level 4</p>
                                                <p className="text-left">Advanced</p>
                                                <p className="text-right font-medium">Level 5</p>
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
                                              <p>Specific technologies, tools, or skills required</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TableHead>
                                        <TableHead className="w-[8%] py-2"></TableHead>
                                      </TableRow>
                                    </TableHeader>

                                    <TableBody className="text-sm">
                                      {cat.subcategories.map((sub: any) => (
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
                                                  { name: e.target.value }
                                                )
                                              }
                                              className="border-0 p-1 h-8 bg-transparent focus-visible:ring-0 text-sm ml-3"
                                            />
                                          </TableCell>
                                          <TableCell className="text-center p-0 align-middle">
                                            <Input
                                              type="number"
                                              value={sub.weight_percentage}
                                              onChange={(e) => {
                                                const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                                                updateSubcategory(
                                                  cat.position,
                                                  sub.position,
                                                  { weight_percentage: value }
                                                )
                                              }}
                                              onBlur={(e) => {
                                                if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                                                  updateSubcategory(
                                                    cat.position,
                                                    sub.position,
                                                    { weight_percentage: 0 }
                                                  )
                                                }
                                              }}
                                              className="w-16 h-8 text-center text-sm border-muted mx-auto"
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
                                                  { level_id: value }
                                                )
                                              }
                                            >
                                              <SelectTrigger className="w-16 h-8 text-sm border-muted mx-auto">
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
                                              value={sub.skillset?.technologies?.join(", ") || ""}
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
                                              className="min-h-[50px] h-8 resize-none border-0 p-1 bg-transparent focus-visible:ring-0 text-sm ml-3"
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
                                      ))}
                                    </TableBody>
                                  </Table>

                                  <div className="flex justify-between items-center pt-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => addSkillToCategory(cat.position)}
                                      className="h-8 gap-2"
                                    >
                                      <Plus className="h-4 w-4" />
                                      Add Skill
                                    </Button>

                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-muted-foreground">Skills Total:</span>
                                      <span
                                        className={`font-mono font-bold text-base ${
                                          isSkillTotalValid ? "text-success" : "text-destructive"
                                        }`}
                                      >
                                        {skillTotal.toFixed(1)}%
                                      </span>
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
                </div>

                {/* Summary Section */}
                {/* <div ref={summaryRef} className="space-y-6 mt-6">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map((category, catIdx) => {
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
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ 
                                      backgroundColor: CATEGORY_COLORS[catIdx % CATEGORY_COLORS.length] 
                                    }}
                                  />
                                  <h4 className="font-semibold text-sm text-foreground">
                                    {category.name}
                                  </h4>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
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
                                  <span className="text-muted-foreground">Skills Total:</span>
                                  <span
                                    className={`font-mono font-bold ${
                                      isSkillTotalValid ? "text-success" : "text-destructive"
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
                            <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
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
                </div> */}

                {/* Validation Error Messages */}
{(!validation.totalValid || !validation.categoriesValid) && (
  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mt-6">
    <div className="flex items-start space-x-3">
      <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="font-medium text-destructive">
          Configuration Issues:
        </div>
        <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-4">
          {!validation.totalValid && (
            <li>
              Total weightage needs to be 100%. Please modify the weights accordingly. 
              (Currently {getTotalWeight().toFixed(1)}%)
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
                        <span>{isEditMode ? "Update Persona" : "Save Persona"}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Save Dialog - Only for non-edit mode */}
            {!isEditMode && (
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Save Persona</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="persona-name-dialog" className="text-sm font-medium mb-2 block">
                        Persona Name
                      </Label>
                      <Input
                        id="persona-name-dialog"
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
                      <Button onClick={confirmSavePersona} disabled={!canSave || saving}>
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
            )}
          </>
        )}
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
              Are you sure you want to delete this skill? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteConfirm) return;
                removeSkillFromCategory(deleteConfirm.cat, deleteConfirm.position);
                setDeleteConfirm(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Range Warning Dialog */}
      <AlertDialog open={showRangeWarningDialog} onOpenChange={setShowRangeWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Category Weight Range Warning
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Some category weights are outside their defined ranges:</p>
              <ul className="list-disc pl-6 space-y-1">
                {Object.entries(categoryWarnings).map(([pos, msg]) => (
                  <li key={pos} className="text-sm text-warning">
                    {categories.find(c => c.position === Number(pos))?.name}: {msg}
                  </li>
                ))}
              </ul>
              <p className="pt-2">Do you want to save the persona anyway?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowRangeWarningDialog(false);
                if (isEditMode) {
                  confirmSavePersona();
                } else {
                  setShowSaveDialog(true);
                }
              }}
              className="bg-warning hover:bg-warning/90"
            >
              Save Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loading Overlay */}
      {(existingPersonaLoading || generatedPersonaLoading || generatePersonaMutation.isPending) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
              <p className="text-lg font-semibold text-gray-600">
                {generatePersonaMutation.isPending
                  ? "Generating Persona..."
                  : "Loading Persona Configuration..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UpdatedReusablePersonaConfig;