import { useState, useRef, useEffect } from "react";
import { Dialog, DialogDescription, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Plus, Type, File, X, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { mockGenerateAIEnhancedJD } from "@/mocks/mockAiRefine";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Edit3, CheckCircle, Sparkles, Undo2 } from "lucide-react";

const ReusableJDUpload = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { jdId } = useParams<{ jdId: string }>();
    const location = useLocation();
    
    // Determine if we're in edit mode
    const isEditMode = location.pathname.includes('/edit/') && !!jdId;

    // Form state
    const [title, setTitle] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [customRole, setCustomRole] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [jdText, setJdText] = useState("");
    const [instructions, setInstructions] = useState("");
    const [showCustomRole, setShowCustomRole] = useState(false);
    const [inputMethod, setInputMethod] = useState<"upload" | "text">("upload");
    const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
    const [hiringManagers, setHiringManagers] = useState<Array<{ id: string; name: string }>>([
        { id: "1", name: "John Doe" },
        { id: "2", name: "Jane Smith" },
        { id: "3", name: "Michael Johnson" }
    ]);
    const [loadingManagers, setLoadingManagers] = useState(false);
    const [openManagerPopover, setOpenManagerPopover] = useState(false);

    // Workflow state
    const [currentJdId, setCurrentJdId] = useState<string | null>(jdId || null);
    const [isFormDisabled, setIsFormDisabled] = useState(false);
    const [isCreatingJD, setIsCreatingJD] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [aiGenerationFailed, setAiGenerationFailed] = useState(false);
    const [aiRetryPayload, setAiRetryPayload] = useState<any>(null);
    const [isLoadingJD, setIsLoadingJD] = useState(false);

    // Comparison state
    const [roleName, setRoleName] = useState("");
    const [previousOriginalJD, setPreviousOriginalJD] = useState<string>("");
    const [previousAIJD, setPreviousAIJD] = useState<string>("");
    const [selectedVersion, setSelectedVersion] = useState<"original" | "ai" | null>(null);
    const [isEditing, setIsEditing] = useState({ original: false, ai: false });
    const [originalJD, setOriginalJD] = useState<string>("");
    const [aiGeneratedJD, setAiGeneratedJD] = useState<string>("");
    
    // Track original JD content for change detection
    const [initialJDContent, setInitialJDContent] = useState<string>("");
    const [jdContentChanged, setJdContentChanged] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const loadingRef = useRef<HTMLDivElement>(null);
    const [predefinedRoles, setPredefinedRoles] = useState<{ id: string; name: string }[]>([]);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [activeOnly, setActiveOnly] = useState(false);
    const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_DATA === 'true';

    // Helper function to handle 401 errors
    const handle401Error = (response: Response) => {
        if (response.status === 401) {
            toast({
                title: "Session Timed Out",
                description: "Your session has expired. Please login to continue",
                variant: "destructive",
            });
            return true; // Indicates 401 error was handled
        }
        return false; // Not a 401 error
    };

    // Popup state for Add Role
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newRole, setNewRole] = useState({
        name: "",
        description: "",
        department: "",
    });

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    size: size.toString(),
                    active_only: activeOnly.toString(),
                });

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/job-role/?${queryParams.toString()}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) {
                    if (handle401Error(response)) return; // Show 401 toast and exit
                    throw new Error(`Failed to fetch roles: ${response.status}`);
                }

                const data = await response.json();
                const roles = data.job_roles
                    ? data.job_roles.map((r: any) => ({ id: r.id, name: r.name }))
                    : data.map((r: any) => ({ id: r.id, name: r.name }));

                localStorage.setItem("jobRoles", JSON.stringify(roles));
                setPredefinedRoles(roles);

            } catch (error) {
                console.error("Error fetching roles:", error);
                toast({
                    title: "Error fetching roles",
                    description: "Could not load roles. Please try again later.",
                    variant: "destructive",
                });
            }
        };

        fetchRoles();
    }, [page, size, activeOnly]);

    // Fetch existing JD data when in edit mode
    useEffect(() => {
        if (!isEditMode || !jdId) return;

        const fetchJDData = async () => {
            setIsLoadingJD(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/${jdId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) {
                    if (handle401Error(response)) return;
                    throw new Error("Failed to fetch JD data");
                }

                const data = await response.json();
                
                // Pre-populate form fields
                setTitle(data.title || "");
                setSelectedRole(data.role_id || "");
                setJdText(data.original_text || "");
                setInstructions(data.notes || "");
                setOriginalJD(data.original_text || "");
                setRoleName(data.role_name || data.role || "");
                
                // Store initial JD content for change detection
                setInitialJDContent(data.original_text || "");
                
                // Set input method based on available data
                setInputMethod("text");
                
                // If there's a refined version, show it
                if (data.refined_text) {
                    setAiGeneratedJD(data.refined_text);
                    setShowComparison(true);
                }
                
                // Set selected version if available
                if (data.selected_version) {
                    setSelectedVersion(data.selected_version as "original" | "ai");
                }

                toast({
                    title: "JD Loaded",
                    description: "Job description data loaded successfully.",
                });

            } catch (error) {
                console.error("Error fetching JD data:", error);
                toast({
                    title: "Error loading JD",
                    description: "Could not load job description data. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoadingJD(false);
            }
        };

        fetchJDData();
    }, [isEditMode, jdId]);

    // Detect changes in JD content
    useEffect(() => {
        if (isEditMode && initialJDContent) {
            setJdContentChanged(jdText !== initialJDContent);
        }
    }, [jdText, initialJDContent, isEditMode]);

    const generateAIEnhancedJD = async (jdData: any, jdId: string) => {
        setIsGeneratingAI(true);
        try {
            let data: string;
            const storedJDData = localStorage.getItem("jdData");
            const parsedJDData = storedJDData ? JSON.parse(storedJDData) : {};
            const roleName = parsedJDData.role || "";

            if (USE_MOCK_API) {
                const mockData = await mockGenerateAIEnhancedJD(jdData);
                data = JSON.stringify(mockData).replace(/\*/g, "").replace(/\\n/g, "\n");
            } else {
                const payload = {
                    role: roleName,
                    company_id: "",
                    methodology: "direct",
                    min_similarity: 0.5,
                };

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/${jdId}/refine/ai`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    if (handle401Error(response)) return; // Show 401 toast and exit
                    throw new Error("Failed to generate AI Enhanced JD");
                }

                const result = await response.json();
                data = JSON.stringify(result['refined_text']).replace(/\*/g, "").replace(/\\n/g, "\n");
            }

            setAiGeneratedJD(data);
            setShowComparison(true);
        } catch (error) {
            console.error("Error generating AI Enhanced JD:", error);
            setAiGeneratedJD("⚠️ Failed to generate AI Enhanced JD.");
            setAiGenerationFailed(true);

            // Store retry payload for later use
            const storedJDData = localStorage.getItem("jdData");
            const parsedJDData = storedJDData ? JSON.parse(storedJDData) : {};
            const roleName = parsedJDData.role || "";

            setAiRetryPayload({
                jdId,
                payload: {
                    role: roleName,
                    company_id: "",
                    methodology: "direct",
                    min_similarity: 0.5,
                }
            });

            toast({
                title: "AI Generation Failed",
                description: "Could not generate AI-enhanced JD. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleRetryAIGeneration = async () => {
        if (!aiRetryPayload) return;

        setIsGeneratingAI(true);
        setAiGenerationFailed(false);

        try {
            let data: string;

            if (USE_MOCK_API) {
                const mockData = await mockGenerateAIEnhancedJD({ role: aiRetryPayload.payload.role });
                data = JSON.stringify(mockData).replace(/\*/g, "").replace(/\\n/g, "\n");
            } else {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/${aiRetryPayload.jdId}/refine/ai`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(aiRetryPayload.payload),
                });

                if (!response.ok) {
                    if (handle401Error(response)) return;
                    throw new Error("Failed to generate AI Enhanced JD");
                }

                const result = await response.json();
                data = JSON.stringify(result['refined_text']).replace(/\*/g, "").replace(/\\n/g, "\n");
            }

            setAiGeneratedJD(data);
            setShowComparison(true);
            setAiRetryPayload(null); // Clear retry payload on success

            toast({
                title: "AI Generation Successful",
                description: "AI-enhanced JD has been generated successfully.",
            });

        } catch (error) {
            console.error("Error retrying AI Enhanced JD:", error);
            setAiGeneratedJD("⚠️ Failed to generate AI Enhanced JD.");
            setAiGenerationFailed(true);

            toast({
                title: "AI Generation Failed",
                description: "Could not generate AI-enhanced JD. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsGeneratingAI(false);
        }
    };

    // Update JD without regenerating AI (for metadata or content changes)
    const handleUpdateJD = async () => {
        const selectedRoleObj = predefinedRoles.find(r => r.id === selectedRole);
        const roleId = selectedRoleObj ? selectedRoleObj.id : "";
        const roleNameValue = selectedRoleObj ? selectedRoleObj.name : customRole || "";

        if (!roleId && !roleNameValue) {
            toast({
                title: "Role required",
                description: "Please select or enter a role.",
                variant: "destructive",
            });
            return;
        }

        if (!jdText.trim()) {
            toast({
                title: "Job description required",
                description: "Please enter the job description text.",
                variant: "destructive",
            });
            return;
        }

        if (!currentJdId) return;

        setIsCreatingJD(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/${currentJdId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    title: title || roleNameValue,
                    role: roleNameValue,
                    role_id: roleId,
                    notes: instructions,
                    original_text: jdText,
                }),
            });

            if (!response.ok) {
                if (handle401Error(response)) return;
                const result = await response.json();
                const errorMessage = result?.detail || response.statusText;
                toast({
                    title: "Update failed",
                    description: errorMessage,
                    variant: "destructive",
                });
                return;
            }

            // Update initial content to reflect the save
            setInitialJDContent(jdText);
            setJdContentChanged(false);

            toast({
                title: "JD Updated Successfully",
                description: "Job description has been updated.",
            });

        } catch (error) {
            console.error("API Error:", error);
            toast({
                title: "Update failed",
                description: "There was an error updating the job description. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsCreatingJD(false);
        }
    };

    const handleCreateJD = async () => {
        const selectedRoleObj = predefinedRoles.find(r => r.id === selectedRole);
        const roleId = selectedRoleObj ? selectedRoleObj.id : "";
        const roleNameValue = selectedRoleObj ? selectedRoleObj.name : customRole || "";

        if (!roleId && !roleNameValue) {
            toast({
                title: "Role required",
                description: "Please select or enter a role.",
                variant: "destructive",
            });
            return;
        }

        if (inputMethod === "text" && !jdText.trim()) {
            toast({
                title: "Job description required",
                description: "Please enter the job description text.",
                variant: "destructive",
            });
            return;
        }

        setIsCreatingJD(true);
        setIsFormDisabled(true);

        // Scroll to loading section
        setTimeout(() => {
            loadingRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);

        try {
            let jdIdResult: string | null = null;
            let originalContent = "";

            // Edit mode - update existing JD
            if (isEditMode && currentJdId) {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/${currentJdId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        title: title || roleNameValue,
                        role: roleNameValue,
                        role_id: roleId,
                        notes: instructions,
                        original_text: jdText,
                    }),
                });

                if (!response.ok) {
                    if (handle401Error(response)) {
                        setIsFormDisabled(false);
                        return;
                    }
                    const result = await response.json();
                    const errorMessage = result?.detail || response.statusText;
                    toast({
                        title: "Update failed",
                        description: errorMessage,
                        variant: "destructive",
                    });
                    setIsFormDisabled(false);
                    return;
                }

                const result = await response.json();
                jdIdResult = currentJdId;
                originalContent = jdText;

                toast({
                    title: "JD Updated Successfully",
                    description: "Now regenerating AI-enhanced version...",
                });
            }
            // Create mode - create new JD
            else if (inputMethod === "upload" && file) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("role", roleNameValue);
                formData.append("role_id", roleId);
                formData.append("title", title || roleNameValue);
                formData.append('hiringManagers', JSON.stringify(selectedManagers));
                formData.append("notes", instructions || "");

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/upload-document`, {
                    method: "POST",
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const result = await response.json().catch(() => null);

                if (!response.ok) {
                    if (handle401Error(response)) {
                        setIsFormDisabled(false);
                        return;
                    }
                    const errorMessage = result?.detail || "";
                    if (errorMessage.includes("No text content found")) {
                        toast({
                            title: "Unreadable File",
                            description: "Uploaded file doesn't contain readable text. Please upload another file.",
                            variant: "destructive",
                        });
                    } else {
                        toast({
                            title: "Processing failed",
                            description: errorMessage || "There was an error processing your job description. Please try again.",
                            variant: "destructive",
                        });
                    }
                    setIsFormDisabled(false);
                    return;
                }

                jdIdResult = result.id;
                originalContent = result.original_text || "";
            }
            else if (inputMethod === "text" && jdText.trim()) {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        title: title || roleNameValue,
                        role: roleNameValue,
                        hiringManagers: selectedManagers,
                        role_id: roleId,
                        notes: instructions,
                        original_text: jdText,
                        company_id: "0",
                        tags: [],
                    }),
                });

                const result = await response.json();
                if (!response.ok) {
                    if (handle401Error(response)) {
                        setIsFormDisabled(false);
                        return;
                    }
                    const errorMessage = result?.detail || response.statusText;
                    toast({
                        title: "Processing failed",
                        description: errorMessage,
                        variant: "destructive",
                    });
                    setIsFormDisabled(false);
                    return;
                }

                jdIdResult = result.id;
                originalContent = jdText;
            }

            if (!jdIdResult) {
                throw new Error("JD ID not returned from backend");
            }

            // Store JD data
            localStorage.setItem(
                "jdData",
                JSON.stringify({
                    role: roleNameValue,
                    hiringManagers: selectedManagers,
                    roleId: roleId,
                    fileName: file?.name,
                    jdContent: inputMethod === "text" ? jdText : undefined,
                    instructions,
                    timestamp: Date.now(),
                })
            );

            setCurrentJdId(jdIdResult);
            setRoleName(roleNameValue);
            setOriginalJD(originalContent);

            toast({
                title: isEditMode ? "JD Updated Successfully" : "JD Created Successfully",
                description: "Now generating AI-enhanced version...",
            });

            // Generate AI-enhanced version
            await generateAIEnhancedJD({ role: roleNameValue }, jdIdResult);

        } catch (error) {
            console.error("API Error:", error);
            toast({
                title: "Processing failed",
                description: "There was an error processing your job description. Please try again.",
                variant: "destructive",
            });
            setIsFormDisabled(false);
        } finally {
            setIsCreatingJD(false);
        }
    };

    const handleSelect = async (version: "original" | "ai") => {
        try {
            setSelectedVersion(version);
            const selectedText = version === "original" ? originalJD : aiGeneratedJD;

            // Update JD with selected version using PATCH
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/${currentJdId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    selected_version: version,
                    selected_text: selectedText,
                }),
            });

            if (!response.ok) {
                if (handle401Error(response)) return;
                const result = await response.json();
                const errorMessage = result?.detail || response.statusText;
                toast({
                    title: "Update failed",
                    description: errorMessage,
                    variant: "destructive",
                });
                return;
            }

            // Store selection locally
            localStorage.setItem('selectedJD', JSON.stringify({
                jdId: currentJdId,
                version,
                content: selectedText,
                timestamp: Date.now()
            }));

            toast({
                title: "Version Selected",
                description: `${version === "original" ? "Original" : "AI-enhanced"} version has been selected.`,
            });

            setShowSuccessDialog(true);

        } catch (error) {
            console.error("Error updating JD selection:", error);
            toast({
                title: "Update failed",
                description: "Could not update JD selection. Please try again.",
                variant: "destructive",
            });
        }
    };

    const toggleEdit = async (version: "original" | "ai") => {
        if (isEditing[version]) {
            const updatedText = version === "original" ? originalJD : aiGeneratedJD;
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/jd/${currentJdId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        selected_version: version,
                        selected_text: updatedText,
                        selected_edited: true
                    })
                });
                if (!response.ok) {
                    if (handle401Error(response)) return; // Show 401 toast and exit
                    throw new Error('Failed to save changes');
                }

                toast({
                    title: "Changes saved",
                    description: `${version === "original" ? "Original JD" : "AI JD"} updated successfully.`,
                });

            } catch (error) {
                console.error("Error saving JD:", error);
                toast({
                    title: "Save failed",
                    description: "Could not save changes. Please try again.",
                    variant: "destructive"
                });
                return;
            }
        } else {
            if (version === "original") {
                setPreviousOriginalJD(originalJD);
            } else {
                setPreviousAIJD(aiGeneratedJD);
            }
        }

        setIsEditing(prev => ({ ...prev, [version]: !prev[version] }));
    };

    const handleUndo = (version: "original" | "ai") => {
        if (version === "original") {
            setOriginalJD(previousOriginalJD);
        } else {
            setAiGeneratedJD(previousAIJD);
        }
    };

    const handleNewRoleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewRole((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveRole = async () => {
        if (!newRole.name.trim() || !newRole.department.trim()) {
            toast({
                title: "Missing Required Fields",
                description: "Please fill in both Name and Department.",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/job-role/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    name: newRole.name,
                    description: newRole.description,
                    category: newRole.department,
                    is_active: true,
                }),
            });

            if (!response.ok) {
                if (handle401Error(response)) return; // Show 401 toast and exit
                throw new Error(`Failed with status ${response.status}`);
            }

            const result = await response.json();
            setPredefinedRoles(prev => [...prev, result]);
            setSelectedRole(result.id);
            setIsDialogOpen(false);
            setNewRole({ name: "", description: "", department: "" });

            toast({
                title: "Role Saved Successfully",
                description: `${result.name} has been added to the role list.`,
            });

        } catch (error) {
            console.error(error);
            toast({
                title: "Error Saving Role",
                description: "There was an issue saving the role. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files?.[0];
        if (uploadedFile) {
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
            if (validTypes.includes(uploadedFile.type)) {
                setFile(uploadedFile);
                toast({
                    title: "File uploaded successfully",
                    description: `${uploadedFile.name} has been uploaded.`,
                });
            } else {
                toast({
                    title: "Invalid file type",
                    description: "Please upload a PDF, DOC, DOCX, or TXT file.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleUploadClick = () => {
        setInputMethod("upload");
        fileInputRef.current?.click();
    };

    const resetForm = () => {
        setTitle("");
        setSelectedRole("");
        setCustomRole("");
        setFile(null);
        setJdText("");
        setInstructions("");
        setSelectedManagers([]);
        setCurrentJdId(null);
        setIsFormDisabled(false);
        setShowComparison(false);
        setShowSuccessDialog(false);
        setSelectedVersion(null);
        setOriginalJD("");
        setAiGeneratedJD("");
        setIsEditing({ original: false, ai: false });
        setAiGenerationFailed(false);
        setAiRetryPayload(null);
    };

    const handleProceedToPersona = () => {
        if (currentJdId) {
            navigate(`/persona-config/${currentJdId}`);
        }
    };

    return (
        <Layout currentStep={1}>
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-3xl font-bold text-foreground">
                        {showComparison 
                            ? "Job Description Comparison" 
                            : isEditMode 
                                ? "Edit Job Description" 
                                : "Create Job Description"
                        }
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {showComparison
                            ? "Compare your original JD with our AI-enhanced version and select the one that best fits your needs"
                            : isEditMode
                                ? "Update your job description details and regenerate AI-enhanced version"
                                : "Start by selecting a role and uploading your job description for AI analysis"
                        }
                    </p>
                </div>

                {/* Loading JD Data */}
                {isLoadingJD && (
                    <Card className="shadow-card">
                        <CardContent className="py-8">
                            <div className="flex flex-col items-center space-y-4">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold">Loading Job Description...</h3>
                                    <p className="text-muted-foreground">
                                        Fetching job description data...
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Form Section */}
                {!isLoadingJD && (
                    <Card className="shadow-card">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="w-5 h-5 text-primary" />
                                <span>Job Details</span>
                            </CardTitle>
                            <CardDescription>
                                {isEditMode 
                                    ? "Update the job description information below"
                                    : "Provide the role information and upload your job description document"
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                        {/* Role Selection */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="role" className="text-base whitespace-nowrap">Role:</Label>
                                <div className="flex-1">
                                    {!showCustomRole ? (
                                        <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isFormDisabled}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {predefinedRoles.map((role) => (
                                                    <SelectItem key={role.id} value={role.id}>
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            placeholder="Enter custom role..."
                                            value={customRole}
                                            onChange={(e) => setCustomRole(e.target.value)}
                                            disabled={isFormDisabled}
                                        />
                                    )}
                                </div>

                                {/* Hiring Manager Selection */}
                                <div className="flex-1">
                                    <Popover open={openManagerPopover} onOpenChange={setOpenManagerPopover}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openManagerPopover}
                                                className="w-full justify-between h-10 px-3 py-2 text-sm font-normal bg-background border-input hover:bg-background hover:text-foreground"
                                                disabled={loadingManagers || isFormDisabled}
                                            >
                                                {selectedManagers.length > 0
                                                    ? selectedManagers.join(", ")
                                                    : loadingManagers ? "Loading..." : "Select manager(s)..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                                            <Command>
                                                <CommandInput placeholder="Search managers..." />
                                                <CommandList>
                                                    <CommandEmpty>No manager found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {hiringManagers.map((manager) => (
                                                            <CommandItem
                                                                key={manager.id}
                                                                value={manager.name}
                                                                onSelect={() => {
                                                                    setSelectedManagers(
                                                                        selectedManagers.includes(manager.name)
                                                                            ? selectedManagers.filter((m) => m !== manager.name)
                                                                            : [...selectedManagers, manager.name]
                                                                    );
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedManagers.includes(manager.name) ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {manager.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {!showCustomRole ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(true)}
                                        className="flex items-center space-x-1"
                                        disabled={isFormDisabled}
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Add Role</span>
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowCustomRole(false);
                                            setCustomRole("");
                                        }}
                                        disabled={isFormDisabled}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>

                            {/* Title Input */}
                            <div className="flex items-center gap-2">
                                <Label htmlFor="title" className="text-base whitespace-nowrap">Title:</Label>
                                <Input
                                    id="title"
                                    placeholder="Enter job title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="flex-1"
                                    disabled={isFormDisabled}
                                />
                            </div>
                        </div>

                        {/* Job Description Input Method Selection */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-5">
                                <Label>JD Input Method:</Label>
                                <Button
                                    type="button"
                                    variant={inputMethod === "upload" ? "default" : "outline"}
                                    onClick={handleUploadClick}
                                    className="flex items-center space-x-2"
                                    disabled={isFormDisabled}
                                >
                                    <File className="w-4 h-4" />
                                    <span>Upload Document</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant={inputMethod === "text" ? "default" : "outline"}
                                    onClick={() => setInputMethod("text")}
                                    className="flex items-center space-x-2"
                                    disabled={isFormDisabled}
                                >
                                    <Type className="w-4 h-4" />
                                    <span>Paste JD</span>
                                </Button>
                            </div>

                            {inputMethod === "upload" && (
                                <div className="space-y-2">
                                    {file ? (
                                        <div className="p-4 border border-border rounded-lg bg-muted/30">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="w-5 h-5 text-primary" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">File uploaded successfully</p>
                                                </div>
                                                {!isFormDisabled ? (
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="hover:bg-primary/10"
                                                        >
                                                            <Upload className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setFile(null);
                                                                toast({
                                                                    title: "File removed",
                                                                    description: "The file has been removed.",
                                                                });
                                                            }}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            onClick={handleCreateJD}
                                                            className="bg-gradient-primary hover:opacity-90 transition-smooth"
                                                            disabled={isCreatingJD}
                                                        >
                                                            {isCreatingJD ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                    {isEditMode ? "Updating..." : "Processing..."}
                                                                </>
                                                            ) : (
                                                                "Proceed"
                                                            )}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-muted-foreground">
                                                        Processing file...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Click "Upload Document" above to select your job description file.
                                        </p>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.txt"
                                        onChange={handleFileUpload}
                                        disabled={isFormDisabled}
                                    />
                                </div>
                            )}

                            {inputMethod === "text" && (
                                <div className="space-y-2">
                                    <Label htmlFor="jdText">Job Description Text</Label>
                                    <Textarea
                                        id="jdText"
                                        placeholder="Copy and paste your job description here..."
                                        value={jdText}
                                        onChange={(e) => setJdText(e.target.value)}
                                        rows={12}
                                        className="resize-none"
                                        disabled={isFormDisabled}
                                    />
                                    {jdText.trim() && !isFormDisabled && (
                                        <div className="flex justify-end space-x-2">
                                            {isEditMode ? (
                                                jdContentChanged ? (
                                                    <Button
                                                        onClick={handleCreateJD}
                                                        className="bg-gradient-primary hover:opacity-90 transition-smooth"
                                                        disabled={isCreatingJD || isGeneratingAI}
                                                    >
                                                        {isCreatingJD || isGeneratingAI ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                {isCreatingJD ? "Updating..." : "Generating AI..."}
                                                            </>
                                                        ) : (
                                                            "Update & Regenerate AI"
                                                        )}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={handleUpdateJD}
                                                        className="bg-gradient-primary hover:opacity-90 transition-smooth"
                                                        disabled={isCreatingJD}
                                                    >
                                                        {isCreatingJD ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                Updating...
                                                            </>
                                                        ) : (
                                                            "Update JD"
                                                        )}
                                                    </Button>
                                                )
                                            ) : (
                                                <Button
                                                    onClick={handleCreateJD}
                                                    className="bg-gradient-primary hover:opacity-90 transition-smooth"
                                                    disabled={isCreatingJD || isGeneratingAI}
                                                >
                                                    {isCreatingJD || isGeneratingAI ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            {isCreatingJD ? "Processing..." : "Generating AI..."}
                                                        </>
                                                    ) : (
                                                        "Save & Proceed"
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className="space-y-2">
                            <Label htmlFor="instructions" className="text-base">Additional Instructions (Optional)</Label>
                            <Textarea
                                id="instructions"
                                placeholder="Add any specific requirements, preferences, or areas of focus for this role..."
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                rows={4}
                                className="resize-none"
                                disabled={isFormDisabled}
                            />
                        </div>
                    </CardContent>
                </Card>
                )}

                {/* Loading Indicators */}
                {(isCreatingJD || isGeneratingAI) && (
                    <Card className="shadow-card" ref={loadingRef}>
                        <CardContent className="py-8">
                            <div className="flex flex-col items-center space-y-4">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold">
                                        {isCreatingJD 
                                            ? (isEditMode ? "Updating JD..." : "Creating JD...") 
                                            : "Generating AI refinement..."
                                        }
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {isCreatingJD
                                            ? "Processing your job description and extracting content..."
                                            : "Our AI is enhancing your job description with industry best practices..."
                                        }
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* AI Generation Failed - Retry Section */}
                {aiGenerationFailed && !isGeneratingAI && (
                    <Card className="shadow-card border-destructive">
                        <CardContent className="py-8">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center">
                                    <X className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-semibold text-destructive">AI Generation Failed</h3>
                                    <p className="text-muted-foreground">
                                        We couldn't generate the AI-enhanced version of your job description.
                                        Your original JD has been saved successfully.
                                    </p>
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        onClick={handleRetryAIGeneration}
                                        className="bg-gradient-primary hover:opacity-90 transition-smooth"
                                        disabled={isGeneratingAI}
                                    >
                                        {isGeneratingAI ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Retrying...
                                            </>
                                        ) : (
                                            "Retry AI Generation"
                                        )}
                                    </Button>
                                    {/* <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowComparison(true);
                                            setAiGenerationFailed(false);
                                            setAiGeneratedJD("⚠️ AI generation was skipped. You can proceed with the original JD.");
                                        }}
                                    >
                                        Skip AI Enhancement
                                    </Button> */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Comparison Section */}
                {showComparison && !isGeneratingAI && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Original JD */}
                            <Card className={`shadow-card transition-all duration-300 ${selectedVersion === "original" ? "ring-2 ring-primary border-primary" : ""
                                }`}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <FileText className="w-5 h-5 text-muted-foreground" />
                                            <CardTitle>Original Job Description</CardTitle>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge className="bg-blue-100 text-blue-800 font-medium px-2 py-1 rounded-md">Your Version</Badge>
                                            {selectedVersion === "original" && (
                                                <CheckCircle className="w-5 h-5 text-success" />
                                            )}
                                        </div>
                                    </div>
                                    <CardDescription>
                                        The job description you uploaded
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {isEditing.original ? (
                                        <Textarea
                                            value={originalJD}
                                            onChange={(e) => setOriginalJD(e.target.value)}
                                            rows={20}
                                            className="font-mono text-sm"
                                        />
                                    ) : (
                                        <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                                            <pre className="text-sm whitespace-pre-wrap font-sans">{originalJD}</pre>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => toggleEdit("original")}
                                                className="flex items-center space-x-1"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                                <span>{isEditing.original ? "Save Changes" : "Edit"}</span>
                                            </Button>
                                            {isEditing.original && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleUndo("original")}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <Undo2 className="w-4 h-4" />
                                                    <span>Undo</span>
                                                </Button>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="originalJD"
                                                checked={selectedVersion === "original"}
                                                onCheckedChange={(checked) => {
                                                    if (checked) handleSelect("original");
                                                }}
                                            />
                                            <label
                                                htmlFor="originalJD"
                                                className={`text-sm font-medium leading-none ${selectedVersion === "original" ? 'text-success' : 'text-foreground'
                                                    }`}
                                            >
                                                Select Original JD
                                            </label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* AI Enhanced JD */}
                            <Card className={`shadow-card transition-all duration-300 ${selectedVersion === "ai" ? "ring-2 ring-primary border-primary" : ""
                                }`}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Sparkles className="w-5 h-5 text-secondary" />
                                            <CardTitle>AI-Enhanced Job Description</CardTitle>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="bg-purple-100 text-purple-800 font-medium px-2 py-1 rounded-md">
                                                AI Optimized
                                            </Badge>
                                            {selectedVersion === "ai" && (
                                                <CheckCircle className="w-5 h-5 text-success" />
                                            )}
                                        </div>
                                    </div>
                                    <CardDescription>
                                        Our AI-enhanced version with comprehensive requirements and modern standards
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {isEditing.ai ? (
                                        <Textarea
                                            value={aiGeneratedJD}
                                            onChange={(e) => setAiGeneratedJD(e.target.value)}
                                            rows={20}
                                            className="font-mono text-sm"
                                        />
                                    ) : (
                                        <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                                            <pre className="whitespace-pre-wrap text-sm font-sans">{aiGeneratedJD}</pre>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => toggleEdit("ai")}
                                                className="flex items-center space-x-1"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                                <span>{isEditing.ai ? "Save Changes" : "Edit"}</span>
                                            </Button>
                                            {isEditing.ai && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleUndo("ai")}
                                                    className="flex items-center space-x-1"
                                                >
                                                    <Undo2 className="w-4 h-4" />
                                                    <span>Undo</span>
                                                </Button>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="aiJD"
                                                checked={selectedVersion === "ai"}
                                                onCheckedChange={(checked) => {
                                                    if (checked) handleSelect("ai");
                                                }}
                                            />
                                            <label
                                                htmlFor="aiJD"
                                                className={`text-sm font-medium leading-none ${selectedVersion === "ai" ? 'text-success' : 'text-foreground'
                                                    }`}
                                            >
                                                Select AI Enhanced JD
                                            </label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* AI Enhancement Highlights */}
                        <Card className="shadow-card bg-gradient-subtle">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Sparkles className="w-5 h-5 text-secondary" />
                                    <span>AI Enhancement Summary</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4">
                                        <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <span className="text-success font-bold">+85%</span>
                                        </div>
                                        <h3 className="font-semibold text-foreground">More Comprehensive</h3>
                                        <p className="text-sm text-muted-foreground">Added detailed technical requirements and modern skills</p>
                                    </div>
                                    <div className="text-center p-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <span className="text-primary font-bold">+12</span>
                                        </div>
                                        <h3 className="font-semibold text-foreground">Additional Skills</h3>
                                        <p className="text-sm text-muted-foreground">Cloud platforms, AI/ML integration, and modern frameworks</p>
                                    </div>
                                    <div className="text-center p-4">
                                        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <span className="text-secondary font-bold">+90%</span>
                                        </div>
                                        <h3 className="font-semibold text-foreground">Better Structure</h3>
                                        <p className="text-sm text-muted-foreground">Improved formatting and industry-standard sections</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-success" />
                            <span>Success!</span>
                        </DialogTitle>
                        <DialogDescription>
                            JD content has been updated successfully
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex space-x-2">
                        <Button variant="outline" onClick={() => {
                            setShowSuccessDialog(false);
                            resetForm();
                        }}>
                            Save JD
                        </Button>
                        <Button onClick={handleProceedToPersona} className="bg-gradient-primary">
                           Proceed to Persona
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Role Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Role</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label htmlFor="name">Role Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Enter role name"
                                value={newRole.name}
                                onChange={handleNewRoleChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Enter description (optional)"
                                value={newRole.description}
                                onChange={handleNewRoleChange}
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="department">Department *</Label>
                            <Input
                                id="department"
                                name="department"
                                placeholder="Enter department name"
                                value={newRole.department}
                                onChange={handleNewRoleChange}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-gradient-primary"
                            onClick={handleSaveRole}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default ReusableJDUpload;