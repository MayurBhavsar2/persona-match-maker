import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Target, Users, FileText, Play, AlertCircle, Briefcase } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { fetchAllRoles, fetchJDsByRole, fetchAllPersonas, type RoleOption, type JDOption, type PersonaOption } from "@/lib/helper";
import InfiniteScrollCandidateList from "@/components/InfiniteScrollCandidateList";
import SearchableDropdown from "@/components/SearchableDropdown";

interface CandidateOption {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  personas: Array<{ persona_id: string; persona_name: string }>;
}

interface EvaluationParams {
  jdId: string;
  personaId: string;
  candidateIds: string[];
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
  onEvaluate: (params: EvaluationParams) => void;
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
  
  // State for dropdowns
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [jds, setJds] = useState<JDOption[]>([]);
  const [personas, setPersonas] = useState<PersonaOption[]>([]);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  
  // State for selections
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedJD, setSelectedJD] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingJDs, setLoadingJDs] = useState(false);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // State for error handling
  const [roleError, setRoleError] = useState<string | null>(null);
  const [jdError, setJdError] = useState<string | null>(null);
  const [personaError, setPersonaError] = useState<string | null>(null);
  const [candidateError, setCandidateError] = useState<string | null>(null);
  
  // State for candidate pagination
  const [candidatePage, setCandidatePage] = useState<number>(1);
  const [hasMoreCandidates, setHasMoreCandidates] = useState<boolean>(true);
  const [loadingMoreCandidates, setLoadingMoreCandidates] = useState<boolean>(false);

  // Task 9.1: Debounced search handler (300ms delay)
  useEffect(() => {
    // Don't search if term is empty
    if (!searchTerm) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      // Task 9.3: Call searchCandidates when search term changes
      try {
        const searchResults = await searchCandidates(searchTerm);
        setCandidates(searchResults);
        setIsSearching(false);
      } catch (error) {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
        role_name: preselectedJD.role_name,
        persona_count: 1,
      }]);
      
      setPersonas([{
        id: preselectedPersona.id,
        name: preselectedPersona.name,
        jd_id: preselectedJD.id,
        role_name: preselectedJD.role_name,
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
        toast({
          title: "Error fetching Roles",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoadingRoles(false);
      }
    };

    loadRoles();
  }, [mode, toast]);

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
        setSelectedJD(""); // Reset JD selection when role changes
        setPersonas([]);
        setSelectedPersona("");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Could not load JDs for selected role.";
        setJdError(errorMessage);
        console.error("Error fetching JDs:", error);
        toast({
          title: "Error fetching Job Descriptions",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoadingJDs(false);
      }
    };

    loadJDs();
  }, [mode, selectedRole, toast]);
  
  // Retry function for Roles
  const retryLoadRoles = async () => {
    if (mode !== 'start') return;
    
    try {
      setLoadingRoles(true);
      setRoleError(null);
      const allRoles = await fetchAllRoles();
      setRoles(allRoles);
      toast({
        title: "Success",
        description: "Roles loaded successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not load roles. Please try again.";
      setRoleError(errorMessage);
      toast({
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
      toast({
        title: "Success",
        description: "Job Descriptions loaded successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not load JDs. Please try again.";
      setJdError(errorMessage);
      toast({
        title: "Error fetching Job Descriptions",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingJDs(false);
    }
  };

  // Fetch personas when JD is selected (only in start mode)
  useEffect(() => {
    if (mode !== 'start') return;
    
    const loadPersonas = async () => {
      if (!selectedJD) {
        setPersonas([]);
        setSelectedPersona("");
        setPersonaError(null);
        return;
      }

      try {
        setLoadingPersonas(true);
        setPersonaError(null);
        // Fetch all personas with pagination
        const allPersonas = await fetchAllPersonas();
        
        // Filter personas by selected JD ID
        const filteredPersonas = allPersonas.filter(
          persona => persona.jd_id === selectedJD
        );

        setPersonas(filteredPersonas);
        setSelectedPersona(""); // Reset persona selection when JD changes
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Could not load personas for selected JD.";
        setPersonaError(errorMessage);
        console.error("Error fetching personas:", error);
        toast({
          title: "Error fetching personas",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoadingPersonas(false);
      }
    };

    loadPersonas();
  }, [mode, selectedJD, toast]);
  
  // Retry function for personas
  const retryLoadPersonas = async () => {
    if (mode !== 'start' || !selectedJD) return;
    
    try {
      setPersonaError(null);
      const allPersonas = await fetchAllPersonas();
      const filteredPersonas = allPersonas.filter(
        persona => persona.jd_id === selectedJD
      );
      setPersonas(filteredPersonas);
      toast({
        title: "Success",
        description: "Personas loaded successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not load personas for selected JD.";
      setPersonaError(errorMessage);
      toast({
        title: "Error fetching personas",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Fetch candidates page function
  const fetchCandidatesPage = async (page: number) => {
    // Prevent concurrent requests
    if (loadingMoreCandidates) {
      return [];
    }

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
      const transformedCandidates: CandidateOption[] = (data.candidates || []).map((candidate: any) => ({
        id: candidate.id,
        full_name: candidate.full_name || candidate.name || 'Unknown Candidate',
        email: candidate.email || '',
        created_at: candidate.created_at || new Date().toISOString(),
        personas: candidate.personas || [],
      }));

      // Update hasMore flag based on has_next field
      setHasMoreCandidates(data.has_next || false);
      
      return transformedCandidates;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not load candidates. Please try again.";
      console.error("Error fetching candidates page:", error);
      setCandidateError(errorMessage);
      toast({
        title: "Error fetching candidates",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoadingMoreCandidates(false);
    }
  };

  // Task 9.2: Create searchCandidates function
  const searchCandidates = async (query: string): Promise<CandidateOption[]> => {
    try {
      // First, try the search endpoint
      const searchUrl = `${import.meta.env.VITE_API_URL}/api/v1/candidate/search?q=${encodeURIComponent(query)}`;
      
      try {
        const response = await fetch(searchUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Handle 401 errors with redirect to login
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }

        if (response.ok) {
          const data = await response.json();
          
          // Transform API response to CandidateOption format
          const transformedCandidates: CandidateOption[] = (data.candidates || []).map((candidate: any) => ({
            id: candidate.id,
            full_name: candidate.full_name || candidate.name || 'Unknown Candidate',
            email: candidate.email || '',
            created_at: candidate.created_at || new Date().toISOString(),
            personas: candidate.personas || [],
          }));
          
          return transformedCandidates;
        }
      } catch (searchError) {
        console.log("Search endpoint not available, falling back to client-side filtering");
      }

      // Fallback: Fetch all candidates and filter client-side
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
        
        // Transform and add to results
        const transformedCandidates: CandidateOption[] = (data.candidates || []).map((candidate: any) => ({
          id: candidate.id,
          full_name: candidate.full_name || candidate.name || 'Unknown Candidate',
          email: candidate.email || '',
          created_at: candidate.created_at || new Date().toISOString(),
          personas: candidate.personas || [],
        }));
        
        allCandidates.push(...transformedCandidates);
        hasMore = data.has_next || false;
        page++;
      }

      // Filter candidates client-side
      const lowerQuery = query.toLowerCase();
      return allCandidates.filter(candidate => 
        candidate.full_name.toLowerCase().includes(lowerQuery) ||
        candidate.email.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not search candidates. Please try again.";
      console.error("Error searching candidates:", error);
      toast({
        title: "Error searching candidates",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Fetch initial candidates on component mount
  useEffect(() => {
    const loadInitialCandidates = async () => {
      try {
        setLoading(true);
        setCandidateError(null);
        const initialCandidates = await fetchCandidatesPage(1);
        setCandidates(initialCandidates);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Could not load candidates.";
        setCandidateError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadInitialCandidates();
  }, [toast]);
  
  // Retry function for candidates
  const retryLoadCandidates = async () => {
    try {
      setLoading(true);
      setCandidateError(null);
      setCandidatePage(1);
      const initialCandidates = await fetchCandidatesPage(1);
      setCandidates(initialCandidates);
      toast({
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

  // Load more handler with guards to prevent duplicate calls
  const handleLoadMore = async () => {
    // Comprehensive guards to prevent duplicate calls
    if (loadingMoreCandidates || !hasMoreCandidates || searchTerm || isSearching) {
      return;
    }

    try {
      const nextPage = candidatePage + 1;
      const newCandidates = await fetchCandidatesPage(nextPage);
      
      // Append new candidates to existing list
      setCandidates(prev => [...prev, ...newCandidates]);
      setCandidatePage(nextPage);
    } catch (error) {
      // Error already handled in fetchCandidatesPage
    }
  };

  // Handle candidate selection
  const handleCandidateToggle = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  // Select all visible candidates
  const handleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map(c => c.id));
    }
  };

  // Task 9.3: Handle search term change and restore pagination when cleared
  const handleSearchChange = async (term: string) => {
    setSearchTerm(term);
    
    // If search is cleared, restore pagination
    if (!term) {
      try {
        setLoading(true);
        setCandidateError(null);
        setCandidatePage(1);
        const initialCandidates = await fetchCandidatesPage(1);
        setCandidates(initialCandidates);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Could not load candidates.";
        setCandidateError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  // Validate selections before starting evaluation
  const validateSelections = (): string[] => {
    const errors: string[] = [];
    
    if (!selectedRole) {
      errors.push("Please select a Role");
    }
    
    if (!selectedJD) {
      errors.push("Please select a Job Description");
    }
    
    if (!selectedPersona) {
      errors.push("Please select a Persona");
    }
    
    if (selectedCandidates.length === 0) {
      errors.push("Please select at least one candidate");
    }
    
    return errors;
  };

  // Handle start evaluation
  const handleStartEvaluation = () => {
    const errors = validateSelections();
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setShowConfirmDialog(true);
    } else {
      toast({
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
      candidateIds: selectedCandidates,
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
              <SearchableDropdown
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
                disabled={mode === 'flow'}
                loading={loadingRoles}
                className={validationErrors.includes("Please select a Role") ? "border-destructive" : ""}
              />
              
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
              <SearchableDropdown
                options={jds.map(jd => ({
                  id: jd.id,
                  label: jd.title,
                  sublabel: jd.role_name,
                  badge: `${jd.persona_count} personas`,
                }))}
                value={selectedJD}
                onChange={setSelectedJD}
                placeholder={!selectedRole ? "Select a role first" : "Select a job description..."}
                searchPlaceholder="Search job descriptions..."
                emptyMessage="No job descriptions found"
                disabled={mode === 'flow' || !selectedRole}
                loading={loadingJDs}
                className={validationErrors.includes("Please select a Job Description") ? "border-destructive" : ""}
              />
              
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
              <SearchableDropdown
                options={personas.map(persona => ({
                  id: persona.id,
                  label: persona.name,
                  sublabel: persona.role_name,
                }))}
                value={selectedPersona}
                onChange={setSelectedPersona}
                placeholder={!selectedJD ? "Select a JD first" : "Select a persona..."}
                searchPlaceholder="Search personas..."
                emptyMessage="No personas found"
                disabled={mode === 'flow' || !selectedJD}
                loading={loadingPersonas}
                className={validationErrors.includes("Please select a Persona") ? "border-destructive" : ""}
              />
              
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
            {selectedRole && selectedJDDetails && selectedPersonaDetails && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-2">Selection Summary</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Role:</span> {roles.find(r => r.id === selectedRole)?.name || selectedRole}</div>
                  <div><span className="font-medium">JD:</span> {selectedJDDetails.title}</div>
                  <div><span className="font-medium">Persona:</span> {selectedPersonaDetails.name}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Candidate Selection */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <span>Candidates ({selectedCandidates.length} selected)</span>
            </CardTitle>
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
      {validationErrors.length > 0 && (
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
          disabled={validationErrors.length > 0 || loadingRoles || loadingJDs || loadingPersonas || isSearching || loadingMoreCandidates}
          className="flex items-center space-x-2"
        >
          <Target className="w-4 h-4" />
          <span>Start Evaluation ({selectedCandidates.length} candidates)</span>
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Evaluation</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to start an evaluation with the following parameters:
              <div className="mt-3 space-y-2 text-sm">
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
    </div>
  );
};

export default EvaluationSelector;