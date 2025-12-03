import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Target, Users, Play, AlertCircle, Briefcase, RefreshCw, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { fetchAllRoles, fetchJDsByRole, fetchAllPersonas, type RoleOption, type JDOption, type PersonaOption } from "@/lib/helper";
import InfiniteScrollCandidateList from "@/components/InfiniteScrollCandidateList";
import SearchableDropdown from "@/components/SearchableDropdown";
import { CandidateOption } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CandidateUpload from "@/pages/CandidateUpload";
import axiosInstance, { isAxiosError } from "@/lib/utils";

interface EvaluationParams {
  jdId: string;
  personaId: string;
  candidates: CandidateOption[];
}

interface FlowModeJD {
  id: string;
  title: string;
  role_name: string;
  created_by_name: string;
  created_by: string;
  created_at: string
}

interface FlowModePersona {
  id: string;
  name: string;
}

interface EvaluationSelectorProps {
  mode: 'start' | 'flow';
  preselectedJD?: FlowModeJD | null;
  preselectedPersona?: FlowModePersona | null;
  onEvaluate: (params: EvaluationParams) => Promise<void> | void;
  onCancel?: () => void;
}

const EvaluationSelector = ({
  mode,
  preselectedJD,
  preselectedPersona,
  onEvaluate,
  onCancel
}: EvaluationSelectorProps) => {
  const { toast } = useToast();
  const stableToast = useMemo(() => toast, [toast]);


  // State for dropdowns
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [jds, setJds] = useState<JDOption[]>([]);
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);

  // State for selections
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedJD, setSelectedJD] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [selectedCandidates, setSelectedCandidates] = useState<CandidateOption[]>([]);



  // State for UI
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingJDs, setLoadingJDs] = useState(false);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasTriedEvaluation, setHasTriedEvaluation] = useState(false);
  const [isUploadModalOpen,setIsUploadModalOpen] = useState(false)
  

  // State for error handling
  const [roleError, setRoleError] = useState<string | null>(null);
  const [jdError, setJdError] = useState<string | null>(null);
  const [personaError, setPersonaError] = useState<string | null>(null);
  const [candidateError, setCandidateError] = useState<string | null>(null);

  // State for candidate pagination
  const [candidatePage, setCandidatePage] = useState<number>(1);
  const [hasMoreCandidates, setHasMoreCandidates] = useState<boolean>(true);
  const [loadingMoreCandidates, setLoadingMoreCandidates] = useState<boolean>(false);

  // Refs to prevent stale closures and unnecessary re-renders
  const loadingMoreRef = useRef(false);
  const candidatePageRef = useRef(1);
  const hasMoreCandidatesRef = useRef(true);
  const searchTermRef = useRef("");
  const isSearchingRef = useRef(false);

  const validateSelections = (params: {
    selectedRole: string | null;
    selectedJD: string | null;
    selectedPersona: string | null;
    selectedCandidatesCount: number;
  }): string[] => {
    const errors: string[] = [];

    if (!params.selectedRole) {
      errors.push("Please select a Role");
    }

    if (!params.selectedJD) {
      errors.push("Please select a Job Description");
    }

    if (!params.selectedPersona) {
      errors.push("Please select a Persona");
    }

    if (params.selectedCandidatesCount === 0) {
      errors.push("Please select at least one candidate");
    }

    return errors;
  };

  // Sync refs with state
  useEffect(() => {
    candidatePageRef.current = candidatePage;
  }, [candidatePage]);

  useEffect(() => {
    hasMoreCandidatesRef.current = hasMoreCandidates;
  }, [hasMoreCandidates]);

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  useEffect(() => {
    isSearchingRef.current = isSearching;
  }, [isSearching]);


  const errors = useMemo(
    () =>
      validateSelections({
        selectedRole,
        selectedJD,
        selectedPersona,
        selectedCandidatesCount: selectedCandidates.length,
      }),
    [selectedRole, selectedJD, selectedPersona, selectedCandidates.length]
  );

  const isValid = errors.length === 0;


  // Initialize state with preselected values in flow mode
  useEffect(() => {
    if (mode === 'flow' && preselectedJD && preselectedPersona) {
      // Extract role from preselected JD (assuming role_name contains role info)
      setSelectedRole(preselectedJD.role_name); // This might need adjustment based on actual data structure
      setSelectedJD(preselectedJD.id);
      setSelectedPersona(preselectedPersona.id);

      // Set arrays with preselected values for display
      setRoles([{
        id: preselectedJD.role_name,
        name: preselectedJD.role_name,
      }]);

      setJds([{
        id: preselectedJD.id,
        title: preselectedJD.title,
        role_id: '',
        role_name: preselectedJD.role_name,
        company_id: null,
        notes: null,
        tags: [],
        original_document_filename: '',
        original_document_size: '',
        original_document_extension: '',
        document_word_count: '',
        document_character_count: '',
        selected_version: '',
        selected_edited: false,
        created_at: preselectedJD.created_at,
        created_by: preselectedJD.created_by,
        created_by_name: preselectedJD.created_by_name,
        updated_at: preselectedJD.created_at,
        updated_by: preselectedJD.created_by,
        updated_by_name: preselectedJD.created_by_name,
        personas: [],
      }]);

      setPersonas([{
        id: preselectedPersona.id,
        name: preselectedPersona.name,
        jd_id: preselectedJD.id,
        role_name: preselectedJD.role_name,
        created_at: preselectedJD.created_at,
        created_by: preselectedJD.created_by,
        created_by_name: preselectedJD.created_by_name
      }]);
    }
  }, [mode, preselectedJD, preselectedPersona]);

  // Fetch Roles on component mount (only in start mode)
  useEffect(() => {
    if (mode !== 'start') return;

    const loadRoles = async () => {
      try {
        setLoadingRoles(true);
        setRoleError(null);
        const allRoles = await fetchAllRoles();
        setRoles(allRoles);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Could not load roles. Please try again.";
        setRoleError(errorMessage);
        console.error("Error fetching roles:", error);
        stableToast({
          title: "Error fetching Roles",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoadingRoles(false);
      }
    };

    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]); // Only run when mode changes

  useEffect(() => {
    if (mode !== 'start') return;

    const loadJDs = async () => {
      if (!selectedRole) {
        setJds([]);
        setSelectedJD("");
        setPersonas([]);
        setSelectedPersona("");
        setJdError(null);
        return;
      }

      try {
        setLoadingJDs(true);
        setJdError(null);
        const roleJDs = await fetchJDsByRole(selectedRole);
        setJds(roleJDs);
        setSelectedJD(""); // Reset JD selection when role changes
        setPersonas([]);
        setSelectedPersona("");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Could not load JDs for selected role.";
        setJdError(errorMessage);
        console.error("Error fetching JDs:", error);
        stableToast({
          title: "Error fetching Job Descriptions",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoadingJDs(false);
      }
    };

    loadJDs();

  }, [mode, selectedRole]); 

  // Retry function for Roles

  const retryLoadRoles = async () => {
    if (mode !== 'start') return;

    try {
      setLoadingRoles(true);
      setRoleError(null);
      const allRoles = await fetchAllRoles();
      setRoles(allRoles);
      stableToast({
        title: "Success",
        description: "Roles loaded successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not load roles. Please try again.";
      setRoleError(errorMessage);
      stableToast({
        title: "Error fetching Roles",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingRoles(false);
    }
  };

  // Retry function for JDs
  const retryLoadJDs = async () => {
    if (mode !== 'start' || !selectedRole) return;

    try {
      setLoadingJDs(true);
      setJdError(null);
      const roleJDs = await fetchJDsByRole(selectedRole);
      setJds(roleJDs);
      stableToast({
        title: "Success",
        description: "Job Descriptions loaded successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not load JDs. Please try again.";
      setJdError(errorMessage);
      stableToast({
        title: "Error fetching Job Descriptions",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingJDs(false);
    }
  };

  // Retry function for personas
  const retryLoadPersonas = async () => {
    if (mode !== 'start' || !selectedJD) return;

    try {
      setPersonaError(null);
      const allPersonas = await fetchAllPersonas(selectedJD);
      setPersonas(allPersonas);
      stableToast({
        title: "Success",
        description: "Personas loaded successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not load personas for selected JD.";
      setPersonaError(errorMessage);
      stableToast({
        title: "Error fetching personas",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const fetchCandidatesPage = useCallback(async (page: number) => {
    // Prevent concurrent requests using ref
    if (loadingMoreRef.current) {
      return [];
    }

    loadingMoreRef.current = true;

    try {
      setLoadingMoreCandidates(true);
      setCandidateError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/candidate/?page=${page}&size=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Handle 401 errors with redirect to login
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch candidates: ${response.status}`);
      }

      const data = await response.json();

      // Transform API response to CandidateOption format
      const transformedCandidates: CandidateOption[] = (data.candidates || []).map(
        (candidate: any) => ({
          id: candidate.id,
          full_name: candidate.full_name || candidate.name || 'Unknown Candidate',
          email: candidate.email ?? null,
          phone: candidate.phone ?? null,
          latest_cv_id: candidate.latest_cv_id ?? null,
          created_at: candidate.created_at || new Date().toISOString(),
          created_by: candidate.created_by ?? null,
          created_by_name: candidate.created_by_name ?? null,
          updated_at:
            candidate.updated_at || candidate.created_at || new Date().toISOString(),
          updated_by: candidate.updated_by ?? null,
          updated_by_name: candidate.updated_by_name ?? null,
          personas: candidate.personas || [],
          cvs: candidate.cvs ?? null,
        })
      );


      // Update hasMore flag based on has_next field
      setHasMoreCandidates(data.has_next || false);

      return transformedCandidates;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not load candidates. Please try again.";
      console.error("Error fetching candidates page:", error);
      setCandidateError(errorMessage);
      stableToast({
        title: "Error fetching candidates",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      loadingMoreRef.current = false;
      setLoadingMoreCandidates(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleJDSelect = (jdId: string) => {
  const jd = jds.find(j => j.id === jdId);

  setSelectedJD(jdId);

  // Personas come from JD object
  if (jd?.personas) {
    setPersonas(
      jd.personas.map(p => ({
        id: p.persona_id,
        name: p.persona_name,
        jd_id: jd.id,
        role_name: jd.role_name,
        created_by_name: jd.created_by_name,
        created_by: jd.created_by,
        created_at: jd.created_at
      }))
    );
  } else {
    setPersonas([]);
  }

  setSelectedPersona("");
};

// Updated handleSearchChange - FIXED to prevent multiple calls
const searchCandidates = useCallback(async (query: string): Promise<CandidateOption[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    const response = await axiosInstance.post('/api/v1/candidate/search', {
      query: query,
      page: 1,
      size: 100,
    });

    // Transform API response to CandidateOption format
    const transformedCandidates: CandidateOption[] = (response.data.candidates || []).map(
      (candidate: any) => ({
        id: candidate.id,
        full_name: candidate.full_name || candidate.name || 'Unknown Candidate',
        email: candidate.email ?? null,
        phone: candidate.phone ?? null,
        latest_cv_id: candidate.latest_cv_id ?? null,
        created_at: candidate.created_at || new Date().toISOString(),
        created_by: candidate.created_by ?? null,
        created_by_name: candidate.created_by_name ?? null,
        updated_at: candidate.updated_at || candidate.created_at || new Date().toISOString(),
        updated_by: candidate.updated_by ?? null,
        updated_by_name: candidate.updated_by_name ?? null,
        personas: candidate.personas || [],
        cvs: candidate.cvs ?? null,
      })
    );

    return transformedCandidates;
  } catch (error) {
    if (isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message;
      console.error("Error searching candidates:", errorMessage);
      
      // Show toast notification
      stableToast({
        title: "Error searching candidates",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      console.error("Unexpected error:", error);
      stableToast({
        title: "Error searching candidates",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
    
    return [];
  }
}, []);


const loadPaginatedCandidates = async (page: number, size: number = 10) => {
  try {
    const response = await axiosInstance.get('/api/v1/candidate/', {
      params: { page, size },
    });

    const transformedCandidates: CandidateOption[] = (response.data.candidates || []).map(
      (candidate: any) => ({
        id: candidate.id,
        full_name: candidate.full_name || candidate.name || 'Unknown Candidate',
        email: candidate.email ?? null,
        phone: candidate.phone ?? null,
        latest_cv_id: candidate.latest_cv_id ?? null,
        created_at: candidate.created_at || new Date().toISOString(),
        created_by: candidate.created_by ?? null,
        created_by_name: candidate.created_by_name ?? null,
        updated_at: candidate.updated_at || candidate.created_at || new Date().toISOString(),
        updated_by: candidate.updated_by ?? null,
        updated_by_name: candidate.updated_by_name ?? null,
        personas: candidate.personas || [],
        cvs: candidate.cvs ?? null,
      })
    );

    return {
      candidates: transformedCandidates,
      hasMore: response.data.has_next || false,
      total: response.data.total || 0,
    };
  } catch (error) {
    if (isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};


const handleSearchChange = useCallback(async (term: string) => {
  setSearchTerm(term);

  // If search is cleared, restore pagination
  if (!term.trim()) {
    try {
      setLoadingMoreCandidates(true);
      setCandidateError(null);
      setCandidatePage(1);

      const result = await loadPaginatedCandidates(1, 10);
      setCandidates(result.candidates);
      setHasMoreCandidates(result.hasMore);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not load candidates.";
      setCandidateError(errorMessage);
    } finally {
      setLoadingMoreCandidates(false);
    }
    return;
  }

  // Perform search
  try {
    setIsSearching(true);
    const results = await searchCandidates(term);
    setCandidates(results);
    setHasMoreCandidates(false); // No pagination for search results
  } catch (error) {
    console.error("Search error:", error);
    setCandidates([]);
  } finally {
    setIsSearching(false);
  }
}, [searchCandidates]);


const handleLoadMore = useCallback(async () => {
  if (loadingMoreCandidates || !hasMoreCandidates || searchTerm) return;

  try {
    setLoadingMoreCandidates(true);
    const nextPage = candidatePage + 1;
    
    const result = await loadPaginatedCandidates(nextPage, 10);
    
    setCandidates(prev => [...prev, ...result.candidates]);
    setHasMoreCandidates(result.hasMore);
    setCandidatePage(nextPage);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Could not load more candidates.";
    setCandidateError(errorMessage);
  } finally {
    setLoadingMoreCandidates(false);
  }
}, [candidatePage, hasMoreCandidates, loadingMoreCandidates, searchTerm]);

// const handleCandidateToggle = useCallback((candidate: CandidateOption) => {
//   setSelectedCandidates((prev) => {
//     const isSelected = prev.some((c) => c.id === candidate.id);
    
//     if (isSelected) {
//       return prev.filter((c) => c.id !== candidate.id);
//     } else {
//       return [...prev, candidate];
//     }
//   });
// }, []);

const handleCandidateToggle = useCallback((candidate: CandidateOption) => {
  setSelectedCandidates((prev) => {
    const isSelected = prev.some((c) => c.id === candidate.id);
    
    if (isSelected) {
      // Remove from selected (but stays in candidates list)
      return prev.filter((c) => c.id !== candidate.id);
    } else {
      // Add to selected
      return [...prev, candidate];
    }
  });
}, []);

// const handleCandidatesUploaded = useCallback((uploadedCandidates: any[]) => {
//   // uploadedCandidates is UploadedCandidate[] from the API response
//   // Each has: candidate_id, cv_id, file_name, file_hash, version, s3_url, status, cv_text
  
//   // Transform them to CandidateOption[] format
//   const candidateOptions: CandidateOption[] = uploadedCandidates.map((uploaded) => ({
//     id: uploaded.candidate_id,
//     full_name: uploaded.file_name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "), // Extract name from filename
//     email: null,
//     phone: null,
//     latest_cv_id: uploaded.cv_id, // Map cv_id to latest_cv_id
//     created_at: new Date().toISOString(),
//     created_by: null,
//     created_by_name: null,
//     updated_at: new Date().toISOString(),
//     updated_by: null,
//     updated_by_name: null,
//     personas: [],
//     cvs: [{
//       id: uploaded.cv_id,
//       original_document_filename: uploaded.file_name,
//       file_hash: uploaded.file_hash,
//       version: uploaded.version,
//       s3_url: uploaded.s3_url,
//       cv_text: uploaded.cv_text || null,
//     }],
//   }));

//   // Add to selected candidates immediately (without duplicates)
//   setSelectedCandidates((prev) => {
//     const existingIds = new Set(prev.map(c => c.id));
//     const newSelections = candidateOptions.filter(c => !existingIds.has(c.id));
//     return [...newSelections, ...prev];
//   });

//   // Also add to the candidates list so they appear in the UI (without duplicates)
//   setCandidates((prev) => {
//     const existingIds = new Set(prev.map(c => c.id));
//     const newCandidates = candidateOptions.filter(c => !existingIds.has(c.id));
//     return [...newCandidates, ...prev];
//   });
// }, []);

// Updated handleSelectAll to work with current view

const handleCandidatesUploaded = useCallback((uploadedCandidates: any[]) => {
  const candidateOptions: CandidateOption[] = uploadedCandidates.map((uploaded) => ({
    id: uploaded.candidate_id,
    full_name: uploaded.candidate_name || uploaded.file_name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "), // Use candidate_name from API
    email: uploaded.email || null, // Use email from API
    phone: uploaded.phone || null, // Use phone from API
    latest_cv_id: uploaded.cv_id,
    created_at: uploaded.created_at || new Date().toISOString(),
    created_by: uploaded.created_by || null,
    created_by_name: uploaded.created_by_name || null,
    updated_at: uploaded.updated_at || new Date().toISOString(),
    updated_by: uploaded.updated_by || null,
    updated_by_name: uploaded.updated_by_name || null,
    personas: uploaded.personas || [],
    cvs: [{
      id: uploaded.cv_id,
      original_document_filename: uploaded.file_name,
      file_hash: uploaded.file_hash,
      version: uploaded.version,
      s3_url: uploaded.s3_url,
      cv_text: uploaded.cv_text || null,
    }],
  }));

  setSelectedCandidates((prev) => {
    const existingIds = new Set(prev.map(c => c.id));
    const newSelections = candidateOptions.filter(c => !existingIds.has(c.id));
    return [...newSelections, ...prev];
  });

  setCandidates((prev) => {
    const existingIds = new Set(prev.map(c => c.id));
    const newCandidates = candidateOptions.filter(c => !existingIds.has(c.id));
    return [...newCandidates, ...prev];
  });
}, []);

const handleSelectAll = useCallback(() => {
  const allSelected = candidates.length > 0 &&
    candidates.every(candidate =>
      selectedCandidates.some(sel => sel.id === candidate.id)
    );

  if (allSelected) {
    // Deselect all visible candidates
    const visibleIds = new Set(candidates.map(c => c.id));
    setSelectedCandidates(prev => prev.filter(c => !visibleIds.has(c.id)));
  } else {
    // Select all visible candidates (merge with existing)
    setSelectedCandidates(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const newSelections = candidates.filter(c => !existingIds.has(c.id));
      return [...prev, ...newSelections];
    });
  }
}, [candidates, selectedCandidates]);


  const hasInitialLoadRef = useRef(false);

  useEffect(() => {

    if (hasInitialLoadRef.current) return;
    hasInitialLoadRef.current = true;

    let isMounted = true;

    const loadInitialCandidates = async () => {
      if (loadingMoreRef.current) return; // Prevent duplicate calls

      try {
        setLoading(true);
        setLoadingMoreCandidates(true);
        setCandidateError(null);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/candidate/?page=1&size=10`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch candidates');
        }

        const data = await response.json();

        if (!isMounted) return;

        const transformedCandidates: CandidateOption[] = (data.candidates || []).map(
          (candidate: any) => ({
            id: candidate.id,
            full_name: candidate.full_name || candidate.name || 'Unknown Candidate',
            email: candidate.email ?? null,
            phone: candidate.phone ?? null,
            latest_cv_id: candidate.latest_cv_id ?? null,
            created_at: candidate.created_at || new Date().toISOString(),
            created_by: candidate.created_by ?? null,
            created_by_name: candidate.created_by_name ?? null,
            updated_at:
              candidate.updated_at || candidate.created_at || new Date().toISOString(),
            updated_by: candidate.updated_by ?? null,
            updated_by_name: candidate.updated_by_name ?? null,
            personas: candidate.personas || [],
            cvs: candidate.cvs ?? null,
          })
        );


        setCandidates(transformedCandidates);
        setHasMoreCandidates(data.has_next || false);
      } catch (error) {
        if (!isMounted) return;
        const errorMessage = error instanceof Error ? error.message : "Could not load candidates.";
        setCandidateError(errorMessage);
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingMoreCandidates(false);
        }
      }
    };

    loadInitialCandidates();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const retryLoadCandidates = async () => {
    try {
      setLoading(true);
      setCandidateError(null);
      setCandidatePage(1);
      const initialCandidates = await fetchCandidatesPage(1);
      setCandidates(initialCandidates);
      stableToast({
        title: "Success",
        description: "Candidates loaded successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not load candidates.";
      setCandidateError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (!searchTerm) {
  //     setIsSearching(false);
  //     return;
  //   }

  //   setIsSearching(true);
  //   const timer = setTimeout(async () => {
  //     try {
  //       const searchResults = await searchCandidates(searchTerm);
  //       setCandidates(searchResults);
  //       setIsSearching(false);
  //     } catch (error) {
  //       setIsSearching(false);
  //     }
  //   }, 300);

  //   return () => clearTimeout(timer);
  // }, [searchTerm, searchCandidates]);
  
  // Handle start evaluation
  
  const handleStartEvaluation = () => {
    setHasTriedEvaluation(true);

    if (errors.length === 0) {
      setShowConfirmDialog(true);
    } else {
      stableToast({
        title: "Validation Error",
        description: "Please fix the validation errors before proceeding.",
        variant: "destructive",
      });
    }
  };

  // Confirm and start evaluation
  const confirmEvaluation = () => {
    const params: EvaluationParams = {
      jdId: selectedJD,
      personaId: selectedPersona,
      candidates: selectedCandidates,
    };

    onEvaluate(params);

    setShowConfirmDialog(false);
  };


  // Get selected JD and persona details for display
  const selectedJDDetails = jds.find(jd => jd.id === selectedJD);
  const selectedPersonaDetails = personas.find(p => p.id === selectedPersona);

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-muted-foreground">Loading evaluation options...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {mode === 'flow' ? 'Continue Evaluation' : 'Start New Evaluation'}
          </h2>
          <p className="text-muted-foreground">
            {mode === 'flow'
              ? 'Select candidates to evaluate with your chosen job description and persona'
              : 'Select job description, persona, and candidates to evaluate'}
          </p>
        </div>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>

      {/* Selection Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role, JD and Persona Selection */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <span>Role, Job Description & Persona</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Role <span className="text-destructive">*</span>
              </label>
              {mode=== "flow" ? <p>{selectedRole}</p>:<SearchableDropdown
                options={roles.map(role => ({
                  id: role.id,
                  label: role.name,
                  sublabel: role.description,
                }))}
                value={selectedRole}
                onChange={setSelectedRole}
                placeholder="Select a role..."
                searchPlaceholder="Search roles..."
                emptyMessage="No roles found"
                created_by={false}
                loading={loadingRoles}
                className={validationErrors.includes("Please select a Role") ? "border-destructive" : ""}
              />}

              {/* Role Error Display with Retry */}
              {roleError && mode === 'start' && (
                <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                    <span className="text-sm text-destructive">{roleError}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryLoadRoles}
                    disabled={loadingRoles}
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>

            {/* JD Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Job Description <span className="text-destructive">*</span>
              </label>
              {mode=== "flow" ? <p>{preselectedJD?.title}</p>:<SearchableDropdown
                options={jds.map(jd => ({
                  id: jd.id,
                  label: jd.title,
                  sublabel: jd.role_name,
                  badge: `${jd.personas.length} personas`,
                  created_by_name: jd.created_by_name,
                  created_at: jd.created_at
                }))}
                value={selectedJD}
                created_by={true}
                onChange={handleJDSelect}
                placeholder={!selectedRole ? "Select a role first" : "Select a job description..."}
                searchPlaceholder="Search job descriptions..."
                emptyMessage="No job descriptions found"
                // disabled={mode === 'flow' || !selectedRole}
                loading={loadingJDs}
                className={validationErrors.includes("Please select a Job Description") ? "border-destructive" : ""}
              />}

              {/* JD Error Display with Retry */}
              {jdError && mode === 'start' && selectedRole && (
                <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                    <span className="text-sm text-destructive">{jdError}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryLoadJDs}
                    disabled={loadingJDs}
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>

            {/* Persona Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Persona <span className="text-destructive">*</span>
              </label>
              {mode=== "flow" ? <p>{preselectedPersona.name}</p>: <SearchableDropdown
                options={personas.map(persona => ({
                  id: persona.id,
                  label: persona.name,
                  sublabel: persona.role_name,
                  created_by_name: persona.created_by_name,
                  created_at: persona.created_at
                }))}
                value={selectedPersona}
                onChange={setSelectedPersona}
                created_by={true}
                placeholder={!selectedJD ? "Select a JD first" : "Select a persona..."}
                searchPlaceholder="Search personas..."
                emptyMessage="No personas found"
                // disabled={mode === 'flow' || !selectedJD}
                loading={loadingPersonas}
                className={validationErrors.includes("Please select a Persona") ? "border-destructive" : ""}
              />}

              {/* Persona Error Display with Retry */}
              {personaError && mode === 'start' && selectedJD && (
                <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                    <span className="text-sm text-destructive">{personaError}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryLoadPersonas}
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>

            {/* Selection Summary */}
            {/* {selectedRole && selectedJDDetails && selectedPersonaDetails && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-2">Selection Summary</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Role:</span> {roles.find(r => r.id === selectedRole)?.name || selectedRole}</div>
                  <div><span className="font-medium">JD:</span> {selectedJDDetails.title}</div>
                  <div><span className="font-medium">Persona:</span> {selectedPersonaDetails.name}</div>
                </div>
              </div>
            )} */}
          </CardContent>
        </Card>

        {/* Candidate Selection */}
        <Card className="shadow-card">
          <CardHeader className="!flex !flex-row w-full justify-between items-center gap-2">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <span>Candidates ({selectedCandidates.length} selected)</span>
            </CardTitle>

            <div className="flex items-center gap-2">
               <Button
                variant="default"
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add candidates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={retryLoadCandidates}
                disabled={loading || isSearching || loadingMoreCandidates}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <InfiniteScrollCandidateList
              candidates={candidates}
              selectedCandidates={selectedCandidates}
              onToggleCandidate={handleCandidateToggle}
              onSelectAll={handleSelectAll}
              onLoadMore={handleLoadMore}
              hasMore={searchTerm ? false : hasMoreCandidates}
              loading={isSearching || loadingMoreCandidates}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />

            {/* Candidate Error Display with Retry */}
            {candidateError && (
              <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-md mt-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                  <span className="text-sm text-destructive">{candidateError}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryLoadCandidates}
                  disabled={loading}
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Validation Error */}
            {validationErrors.includes("Please select at least one candidate") && (
              <div className="flex items-center space-x-2 text-destructive text-sm mt-4">
                <AlertCircle className="w-4 h-4" />
                <span>Please select at least one candidate</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Validation Errors */}
      {hasTriedEvaluation && errors.length > 0 && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-destructive">Please fix the following errors:</h4>
                <ul className="mt-1 text-sm text-destructive list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <Button
          onClick={handleStartEvaluation}
          disabled={
            !isValid ||
            loadingRoles ||
            loadingJDs ||
            loadingPersonas ||
            isSearching ||
            loadingMoreCandidates
          }
          className="flex items-center space-x-2"
        >
          <Target className="w-4 h-4" />
          <span>Start Evaluation ({selectedCandidates.length} candidates)</span>
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-2xl gap-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Evaluation</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to start an evaluation with the following parameters:
              <div className=" mt-5 w-full space-y-4 text-sm">
                <div><strong>Job Description:</strong> {selectedJDDetails?.title}</div>
                <div><strong>Role:</strong> {selectedJDDetails?.role_name}</div>
                <div><strong>Persona:</strong> {selectedPersonaDetails?.name}</div>
                <div><strong>Candidates:</strong> {selectedCandidates.length} selected</div>
              </div>
              <p className="mt-3">This process may take a few minutes to complete. Do you want to proceed?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEvaluation} className="flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Start Evaluation</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
{/* Candidate Upload Dialog */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
  <DialogContent className="min-w-5xl max-w-5xl">
    <DialogHeader>
      <DialogTitle>Upload candidates</DialogTitle>
      <DialogDescription>
        Upload new CVs to add candidates to this list.
      </DialogDescription>
    </DialogHeader>

    <CandidateUpload
      onSuccess={() => {
        // Don't refresh the list - candidates are already added via handleCandidatesUploaded
        setIsUploadModalOpen(false);
      }}
      onCancel={() => setIsUploadModalOpen(false)}
      onCandidatesUploaded={handleCandidatesUploaded}
    />
  </DialogContent>
</Dialog>

    </div>
  );
};

export default EvaluationSelector;