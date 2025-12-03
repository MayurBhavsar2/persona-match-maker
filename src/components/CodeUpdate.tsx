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


interface EvaluationParams {
  jdId: string;
  personaId: string;
  candidates: CandidateOption[];
}

interface FlowModeJD {
  id: string;
  title: string;
  role_name: string;
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
  const hasInitialLoadRef = useRef(false);
  const flowModeInitializedRef = useRef(false);

  // Helper function to load flow mode data from localStorage
  const loadFlowModeData = useCallback(() => {
    try {
      // Get data from localStorage
      const jdDataStr = localStorage.getItem('jdData');
      const selectedJDStr = localStorage.getItem('selectedJD');
      const savedPersonaStr = localStorage.getItem('savedPersona');

      if (!jdDataStr || !selectedJDStr || !savedPersonaStr) {
        throw new Error('Missing required flow mode data in localStorage');
      }

      const jdData = JSON.parse(jdDataStr);
      const selectedJDData = JSON.parse(selectedJDStr);
      const savedPersonaData = JSON.parse(savedPersonaStr);

      // Extract role from jdData
      const roleName = jdData.role || 'Unknown Role';

      // Set role (read-only in flow mode)
      setSelectedRole(roleName);
      setRoles([{
        id: roleName,
        name: roleName,
        description: ''
      }]);

      // Set JD
      setSelectedJD(selectedJDData.jdId);
      setJds([{
        id: selectedJDData.jdId,
        title: selectedJDData.version || selectedJDData.jdId,
        role_name: roleName,
        persona_count: 1,
        personas: [{
          persona_id: savedPersonaData.id,
          persona_name: savedPersonaData.name
        }]
      }]);

      // Set Persona
      setSelectedPersona(savedPersonaData.id);
      setPersonas([{
        id: savedPersonaData.id,
        name: savedPersonaData.name,
        jd_id: selectedJDData.jdId,
        role_name: roleName
      }]);

      return true;
    } catch (error) {
      console.error('Error loading flow mode data:', error);
      stableToast({
        title: "Error Loading Flow Mode Data",
        description: error instanceof Error ? error.message : "Could not load evaluation context from storage.",
        variant: "destructive",
      });
      return false;
    }
  }, [stableToast]);

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

  // Initialize flow mode data
//   useEffect(() => {
//     if (mode === 'flow' && !flowModeInitializedRef.current) {
//       flowModeInitializedRef.current = true;
      
//       // First try to use props if provided
//       if (preselectedJD && preselectedPersona) {
//         const roleName = preselectedJD.role_name;
        
//         setSelectedRole(roleName);
//         setRoles([{
//           id: roleName,
//           name: roleName,
//           description: ''
//         }]);

//         setSelectedJD(preselectedJD.id);
//         setJds([{
//           id: preselectedJD.id,
//           title: preselectedJD.title,
//           role_name: roleName,
//           persona_count: 1,
//           personas: [{
//             persona_id: preselectedPersona.id,
//             persona_name: preselectedPersona.name
//           }]
//         }]);

//         setSelectedPersona(preselectedPersona.id);
//         setPersonas([{
//           id: preselectedPersona.id,
//           name: preselectedPersona.name,
//           jd_id: preselectedJD.id,
//           role_name: roleName
//         }]);
//       } else {
//         // Fallback to localStorage
//         const success = loadFlowModeData();
//         if (!success && onCancel) {
//           // If we can't load flow mode data and have a cancel handler, call it
//           setTimeout(() => onCancel(), 1000);
//         }
//       }
//     }
//   }, [mode, preselectedJD, preselectedPersona, loadFlowModeData, onCancel]);

useEffect(() => {
  if (mode === 'flow') {
    // Try to get data from localStorage first
    const storedJDData = localStorage.getItem('jdData');
    const storedPersona = localStorage.getItem('savedPersona');
    const storedFlowJD = localStorage.getItem('evaluation_flow_jd');
    const storedFlowPersona = localStorage.getItem('evaluation_flow_persona');

    let jdToUse = preselectedJD;
    let personaToUse = preselectedPersona;

    // Fallback to localStorage if props not provided
    if (!jdToUse && storedFlowJD) {
      try {
        jdToUse = JSON.parse(storedFlowJD);
      } catch (e) {
        console.error('Failed to parse stored flow JD', e);
      }
    }

    if (!personaToUse && storedFlowPersona) {
      try {
        personaToUse = JSON.parse(storedFlowPersona);
      } catch (e) {
        console.error('Failed to parse stored flow persona', e);
      }
    }

    // Additional fallback to jdData/savedPersona
    if (!jdToUse && storedJDData) {
      try {
        const jdData = JSON.parse(storedJDData);
        jdToUse = {
          id: jdData.jdId || '',
          title: jdData.version || 'Untitled JD',
          role_name: jdData.role || 'Unknown Role'
        };
      } catch (e) {
        console.error('Failed to parse jdData', e);
      }
    }

    if (!personaToUse && storedPersona) {
      try {
        const personaData = JSON.parse(storedPersona);
        personaToUse = {
          id: personaData.id || '',
          name: personaData.name || 'Unnamed Persona'
        };
      } catch (e) {
        console.error('Failed to parse savedPersona', e);
      }
    }

    if (jdToUse && personaToUse) {
      // Set selections
      setSelectedRole(jdToUse.role_name);
      setSelectedJD(jdToUse.id);
      setSelectedPersona(personaToUse.id);

      // Populate dropdowns for display
      setRoles([{
        id: jdToUse.role_name,
        name: jdToUse.role_name,
        description: undefined
      }]);

      setJds([{
        id: jdToUse.id,
        title: jdToUse.title,
        role_name: jdToUse.role_name,
        role_id: jdToUse.role_name, // fallback to role_name if role_id not available
        company_id: null,
        notes: null,
        tags: [],
        created_at: new Date().toISOString(),
        created_by: null,
        created_by_name: null,
        updated_at: new Date().toISOString(),
        updated_by: null,
        updated_by_name: null,
        personas: [{
          persona_id: personaToUse.id,
          persona_name: personaToUse.name
        }],
        persona_count: 1
      }]);

      setPersonas([{
        id: personaToUse.id,
        name: personaToUse.name,
        jd_id: jdToUse.id,
        role_name: jdToUse.role_name
      }]);

      setLoading(false);
    } else {
      // Handle case where flow mode data is missing
      stableToast({
        title: "Missing Data",
        description: "Could not load evaluation context. Please start a new evaluation.",
        variant: "destructive"
      });
      if (onCancel) onCancel();
    }
  }
}, [mode, preselectedJD, preselectedPersona, stableToast, onCancel]);

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
  }, [mode, stableToast]);

  // Fetch JDs when role is selected (only in start mode)
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
        setSelectedJD("");
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
  }, [mode, selectedRole, stableToast]);

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
  }, [stableToast]);

  const handleJDSelect = (jdId: string) => {
    const jd = jds.find(j => j.id === jdId);

    setSelectedJD(jdId);

    if (jd?.personas) {
      setPersonas(
        jd.personas.map(p => ({
          id: p.persona_id,
          name: p.persona_name,
          jd_id: jd.id,
          role_name: jd.role_name,
        }))
      );
    } else {
      setPersonas([]);
    }

    setSelectedPersona("");
  };

  const searchCandidates = useCallback(async (query: string): Promise<CandidateOption[]> => {
    try {
      const searchUrl = `${import.meta.env.VITE_API_URL}/api/v1/candidate/search?q=${encodeURIComponent(query)}`;

      try {
        const response = await fetch(searchUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }

        if (response.ok) {
          const data = await response.json();

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

          return transformedCandidates;
        }
      } catch (searchError) {
        console.log("Search endpoint not available, falling back to client-side filtering");
      }

      const allCandidates: CandidateOption[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/candidate/?page=${page}&size=50`,
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
          throw new Error('Session expired. Please login again.');
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch candidates: ${response.status}`);
        }

        const data = await response.json();

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

        allCandidates.push(...transformedCandidates);
        hasMore = data.has_next || false;
        page++;
      }

      const lowerQuery = query.toLowerCase();
      return allCandidates.filter(candidate =>
        candidate.full_name.toLowerCase().includes(lowerQuery) ||
        (candidate.email ?? '').toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not search candidates. Please try again.";
      console.error("Error searching candidates:", error);
      stableToast({
        title: "Error searching candidates",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [stableToast]);

  // Fetch initial candidates on component mount
  useEffect(() => {
    if (hasInitialLoadRef.current) return;
    hasInitialLoadRef.current = true;

    let isMounted = true;

    const loadInitialCandidates = async () => {
      if (loadingMoreRef.current) return;

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
  }, []);

  // Retry function for candidates
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

  const handleLoadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreCandidatesRef.current || searchTermRef.current) {
      return;
    }

    try {
      const nextPage = candidatePageRef.current + 1;
      const newCandidates = await fetchCandidatesPage(nextPage);

      if (newCandidates.length > 0) {
        setCandidates(prev => [...prev, ...newCandidates]);
        setCandidatePage(nextPage);
      }
    } catch (error) {
      // Error already handled in fetchCandidatesPage
    }
  }, [fetchCandidatesPage]);

  const handleCandidateToggle = useCallback((candidate: CandidateOption) => {
    setSelectedCandidates(prev => {
      const isSelected = prev.some(c => c.id === candidate.id);

      if (isSelected) {
        return prev.filter(c => c.id !== candidate.id);
      }
      return [...prev, candidate];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedCandidates(prev => {
      const visibleIds = candidates.map(c => c.id);

      const allVisibleSelected = visibleIds.every(id =>
        prev.some(c => c.id === id)
      );

      if (allVisibleSelected) {
        return prev.filter(c => !visibleIds.includes(c.id));
      }

      const newSelected = [...prev];

      candidates.forEach(candidate => {
        const alreadySelected = newSelected.some(c => c.id === candidate.id);
        if (!alreadySelected) {
          newSelected.push(candidate);
        }
      });

      return newSelected;
    });
  }, [candidates]);

  const handleSearchChange = useCallback(async (term: string) => {
    setSearchTerm(term);

    if (!term) {
      try {
        setLoadingMoreCandidates(true);
        setCandidateError(null);
        setCandidatePage(1);

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

        if (response.ok) {
          const data = await response.json();
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
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Could not load candidates.";
        setCandidateError(errorMessage);
      } finally {
        setLoadingMoreCandidates(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const searchResults = await searchCandidates(searchTerm);
        setCandidates(searchResults);
        setIsSearching(false);
      } catch (error) {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchCandidates]);

  const handleStartEvaluation = () => {
    setHasTriedEvaluation(true);

    if (errors.length === 0) {
      setShowConfirmDialog(true);
    } else {
      stableToast({