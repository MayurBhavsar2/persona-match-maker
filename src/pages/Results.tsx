import { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SearchableDropdown from "@/components/SearchableDropdown";
import { Users, Calendar, AlertCircle } from "lucide-react";
import axios from "axios";
import { fetchAllRoles, fetchJDsByRole } from "@/lib/helper";
import { ColumnDef } from "@tanstack/react-table";
import BasicTable from "@/components/BasicTable";
import { Checkbox } from "@/components/ui/checkbox";
import { useEvaluationData } from "@/lib/helper";

const CandidateDetailsSidebar = lazy(() => import("@/components/CandidateDetailsSidebar"));

export interface CandidateData {
  candidate_id: string;
  cv_id: string;
  file_name: string;
  file_hash: string;
  version: number;
  s3_url: string;
  status: string;
  is_new_candidate: boolean;
  is_new_cv: boolean;
  cv_text: string;
}

export interface ScoreRequest {
  candidate_id: string;
  persona_id: string;
  cv_id: string;
  force_rescore?: boolean;
}

export interface ScoreResponse {
  score_id: string;
  candidate_id: string;
  persona_id: string;
  final_score: number;
  match_status: string;
  pipeline_stage_reached: number;
  candidate_name: string;
  file_name: string;
  persona_name: string;
  role_name: string;
}

const Results = () => {
  const { personaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if coming from evaluation screen
  const fromEvaluation = location.state?.fromEvaluation || false;
  
  // State for candidates and UI
  const [candidates, setCandidates] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCandidate, setSidebarCandidate] = useState<any | null>(null);
  const [showAllCandidates, setShowAllCandidates] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

  // State for dropdowns (only used when no personaId in params)
  const [roles, setRoles] = useState<any[]>([]);
  const [jds, setJds] = useState<any[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedJD, setSelectedJD] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<string>("");
  
  // Loading and error states
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingJDs, setLoadingJDs] = useState(false);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  
  const [roleError, setRoleError] = useState<string | null>(null);
  const [jdError, setJdError] = useState<string | null>(null);
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Display values for when personaId is in params
  const [displayRole, setDisplayRole] = useState<string>("");
  const [displayPersona, setDisplayPersona] = useState<string>("");

  const API_URL = import.meta.env.VITE_API_URL;

  // Use the custom hook to fetch evaluation data
  const { 
    data: evaluationData, 
    isLoading: loadingCandidates,
    error: evaluationError 
  } = useEvaluationData(personaId, fromEvaluation);

  // Update candidates when evaluation data changes
  useEffect(() => {
    if (evaluationData) {
      const candidatesList = evaluationData.scores || evaluationData.candidates || [];
      setCandidates(candidatesList);
      
      // Set display values
      if (candidatesList.length > 0) {
        const firstItem = candidatesList[0];
        setDisplayRole(firstItem.role_name || "");
        setDisplayPersona(firstItem.persona_name || "");
      }
    }
  }, [evaluationData]);

  // Fetch roles
  const fetchRoles = async () => {
    setLoadingRoles(true);
    setRoleError(null);
    try {
      const allRoles = await fetchAllRoles();
      setRoles(allRoles);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not load roles. Please try again.";
      setRoleError(errorMessage);
      console.error("Error fetching roles:", error);
    } finally {
      setLoadingRoles(false);
    }
  };

  // Fetch JDs for selected role
  const fetchJDs = async (roleId: string) => {
    if (!roleId) return;
    setLoadingJDs(true);
    setJdError(null);
    try {
      const roleJDs = await fetchJDsByRole(roleId);
      setJds(roleJDs);
      setSelectedJD("");
      setPersonas([]);
      setSelectedPersona("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not load JDs for selected role.";
      setJdError(errorMessage);
      console.error("Error fetching JDs:", error);
    } finally {
      setLoadingJDs(false);
    }
  };

  // Handle role change
  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
    setSelectedJD("");
    setSelectedPersona("");
    setJds([]);
    setPersonas([]);
    if (roleId) {
      fetchJDs(roleId);
    }
  };

  // Handle JD change
  const handleJDChange = (jdId: string) => {
    const jd = jds.find(j => j.id === jdId);

    setSelectedJD(jdId);

    if (jd?.personas) {
      setPersonas(
        jd.personas.map(p => ({
          id: p.persona_id,
          name: p.persona_name,
          jd_id: jd.id,
          role_name: jd.role_name,
          created_by_name: p.created_by_name,
          created_by: p.created_by,
          created_at: p.created_at
        }))
      );
    } else {
      setPersonas([]);
    }

    setSelectedPersona("");
  };

  // Handle persona change
  const handlePersonaChange = (pId: string) => {
    setSelectedPersona(pId);
    if (pId) {
      // Navigate to results with the selected persona
      navigate(`/results/${pId}`);
    }
  };

  // Retry functions
  const retryLoadRoles = () => fetchRoles();
  const retryLoadJDs = () => {
    if (selectedRole) fetchJDs(selectedRole);
  };

  // Initial load effect
  useEffect(() => {
    if (!personaId) {
      // Scenario 3: No personaId, show dropdowns
      fetchRoles();
    }
  }, [personaId]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-orange-500";
    return "text-red-600";
  };

  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((candidate) => showAllCandidates ? true : candidate.final_score >= 90)
      .sort((a, b) => (b.final_score || b.overallScore || 0) - (a.final_score || a.overallScore || 0));
  }, [candidates, showAllCandidates]);

  // Checkbox selection handlers
  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateId)) {
        newSet.delete(candidateId);
      } else {
        newSet.add(candidateId);
      }
      return newSet;
    });
  };

  const toggleAllCandidates = () => {
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set());
    } else {
      const allIds = filteredCandidates.map(c => c.score_id || c.candidate_id || c.id);
      setSelectedCandidates(new Set(allIds));
    }
  };

  const isAllSelected = selectedCandidates.size === filteredCandidates.length && filteredCandidates.length > 0;
  const isSomeSelected = selectedCandidates.size > 0 && selectedCandidates.size < filteredCandidates.length;

  // Define table columns
  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={isAllSelected}
          indeterminate={isSomeSelected}
          onCheckedChange={toggleAllCandidates}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        const candidateId = row.original.candidate_id || row.original.id || row.original.score_id;
        return (
          <Checkbox
            checked={selectedCandidates.has(candidateId)}
            onCheckedChange={() => toggleCandidateSelection(candidateId)}
            aria-label="Select candidate"
          />
        );
      },
      enableSorting: false,
      size: 50,
    },
    {
      accessorKey: "candidate_name",
      header: "Candidate",
      cell: ({ row }) => {
        const candidate = row.original;
        return (
          <div>
            <button
              className="font-medium text-primary underline-offset-4 underline cursor-pointer text-left"
              onClick={() => {
                setSidebarCandidate(candidate);
                setSidebarOpen(true);
              }}
            >
              {candidate?.candidate_name ?? `Candidate ID: ${candidate.candidate_id || candidate.id}`}
              {candidate?.email && <span> - {candidate?.email}</span>}
            </button>
            <p className="text-sm text-muted-foreground">{candidate.file_name || candidate.fileName}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "final_score",
      header: "Overall Score",
      cell: ({ row }) => {
        const score = row.original.final_score || row.original.overallScore;
        return (
          <span className={`font-medium ${getScoreColor(score)}`}>
            {score}%
          </span>
        );
      },
    },
    {
      accessorKey: "applicationDate",
      header: "Application Date",
      cell: ({ row }) => {
        const date = row.original.applicationDate;
        return (
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {date ? new Date(date).toLocaleDateString() : "N/A"}
            </span>
          </div>
        );
      },
    },
  ], [selectedCandidates, isAllSelected, isSomeSelected]);

  // Determine if we should show the table
  const shouldShowTable = filteredCandidates.length > 0 && !loadingCandidates;

useEffect(() => {
  console.log('Evaluation Data:', evaluationData);
  console.log('Loading:', loadingCandidates);
  console.log('Error:', evaluationError);
  console.log('From Evaluation:', fromEvaluation);
  console.log('Persona ID:', personaId);
}, [evaluationData, loadingCandidates, evaluationError, fromEvaluation, personaId]);

  return (
    <Layout currentStep={4}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-foreground">Candidate Results</h1>

          <div className="flex items-center gap-4">
            {selectedCandidates.size > 0 && (
              <span className="text-sm text-gray-600">
                {selectedCandidates.size} candidate{selectedCandidates.size !== 1 ? 's' : ''} selected
              </span>
            )}
            
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <Button
                variant={showAllCandidates ? "outline" : "default"}
                size="sm"
                onClick={() => setShowAllCandidates(false)}
                className={`rounded-r-none border-r-0 ${
                  !showAllCandidates ? "bg-blue-500 text-white hover:bg-blue-600" : ""
                }`}
              >
                Perfect Fit
              </Button>
              <Button
                variant={!showAllCandidates ? "outline" : "default"}
                size="sm"
                onClick={() => setShowAllCandidates(true)}
                className={`rounded-l-none ${
                  showAllCandidates ? "bg-blue-500 text-white hover:bg-blue-600" : ""
                }`}
              >
                All
              </Button>
            </div>
          </div>
        </div>

        {/* Selection Section */}
        {personaId ? (
          // Display mode: Show selected role and persona
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-foreground">Role:</label>
                  <p className="font-medium text-blue-500">{displayRole || "Loading..."}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-foreground">Persona:</label>
                  <p className="font-medium text-blue-500">{displayPersona || "Loading..."}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Selection mode: Show dropdowns
          <Card className="shadow-card">
            <CardContent className="grid grid-cols-3 gap-3">
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
                  onChange={handleRoleChange}
                  placeholder="Select a role..."
                  searchPlaceholder="Search roles..."
                  emptyMessage="No roles found"
                  loading={loadingRoles}
                  className={validationErrors.includes("Please select a Role") ? "border-destructive" : ""}
                />
                {roleError && (
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
                    badge: `${jd.personas?.length || 0} personas`,
                    created_by_name: jd.created_by_name,
                    created_at: jd.created_at
                  }))}
                  value={selectedJD}
                  created_by={true}
                  onChange={handleJDChange}
                  placeholder={!selectedRole ? "Select a role first" : "Select a job description..."}
                  searchPlaceholder="Search job descriptions..."
                  emptyMessage="No job descriptions found"
                  disabled={!selectedRole}
                  loading={loadingJDs}
                  className={validationErrors.includes("Please select a Job Description") ? "border-destructive" : ""}
                />
                {jdError && selectedRole && (
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
                    created_by_name: persona.created_by_name,
                    created_at: persona.created_at
                  }))}
                  value={selectedPersona}
                  onChange={handlePersonaChange}
                  created_by={true}
                  placeholder={!selectedJD ? "Select a JD first" : "Select a persona..."}
                  searchPlaceholder="Search personas..."
                  emptyMessage="No personas found"
                  disabled={!selectedJD}
                  loading={loadingPersonas}
                  className={validationErrors.includes("Please select a Persona") ? "border-destructive" : ""}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Table - Only show when we have data */}
        {shouldShowTable && (
          <BasicTable
            data={filteredCandidates}
            columns={columns}
            isLoading={false}
            enableSearch={true}
            enableSorting={true}
            enablePagination={true}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 30, 50]}
            searchPlaceholder="Search candidates..."
            description={filteredCandidates.length.toString()}
          />
        )}

        {/* Loading State */}
        {loadingCandidates && personaId && (
          <Card className="shadow-card">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">Loading candidates...</h3>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loadingCandidates && filteredCandidates.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-12">
              <div className="text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">No candidates found</h3>
                <p className="text-sm text-muted-foreground">
                  {!personaId && !selectedPersona 
                    ? 'Please select a role, JD, and persona to view candidates.'
                    : showAllCandidates 
                      ? 'No candidates available.' 
                      : 'No candidates with 90% or higher score.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Candidate Details Sidebar */}
      <Suspense fallback={<div />}>
        <CandidateDetailsSidebar
          candidate={sidebarCandidate}
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />
      </Suspense>
    </Layout>
  );
};

export default Results;

/*updated working Results component with persona based data fetching */
// import { useState, useEffect, lazy, Suspense, useMemo } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import Layout from "@/components/Layout";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import SearchableDropdown from "@/components/SearchableDropdown";
// import { Users, Calendar, AlertCircle } from "lucide-react";
// import axios from "axios";
// import { fetchAllRoles, fetchJDsByRole } from "@/lib/helper";
// import { ColumnDef } from "@tanstack/react-table";
// import BasicTable from "@/components/BasicTable";
// import { Checkbox } from "@/components/ui/checkbox";

// // Lazy load the sidebar component
// const CandidateDetailsSidebar = lazy(() => import("@/components/CandidateDetailsSidebar"));

// export interface CandidateData {
//   candidate_id: string;
//   cv_id: string;
//   file_name: string;
//   file_hash: string;
//   version: number;
//   s3_url: string;
//   status: string;
//   is_new_candidate: boolean;
//   is_new_cv: boolean;
//   cv_text: string;
// }

// export interface ScoreRequest {
//   candidate_id: string;
//   persona_id: string;
//   cv_id: string;
//   force_rescore?: boolean;
// }

// export interface ScoreResponse {
//   score_id: string;
//   candidate_id: string;
//   persona_id: string;
//   final_score: number;
//   match_status: string;
//   pipeline_stage_reached: number;
//   candidate_name: string;
//   file_name: string;
//   persona_name: string;
//   role_name: string;
// }

// const Results = () => {
//   const { personaId } = useParams();
//   const navigate = useNavigate();
  
//   // State for candidates and UI
//   const [candidates, setCandidates] = useState<any[]>([]);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sidebarCandidate, setSidebarCandidate] = useState<any | null>(null);
//   const [showAllCandidates, setShowAllCandidates] = useState(true);
//   const [size, setSize] = useState<number>(10);
//   const [page, setPage] = useState<number>(1);
//   const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

//   // State for dropdowns (only used when no personaId in params)
//   const [roles, setRoles] = useState<any[]>([]);
//   const [jds, setJds] = useState<any[]>([]);
//   const [personas, setPersonas] = useState<any[]>([]);
  
//   const [selectedRole, setSelectedRole] = useState<string>("");
//   const [selectedJD, setSelectedJD] = useState<string>("");
//   const [selectedPersona, setSelectedPersona] = useState<string>("");
  
//   // Loading and error states
//   const [loadingRoles, setLoadingRoles] = useState(false);
//   const [loadingJDs, setLoadingJDs] = useState(false);
//   const [loadingPersonas, setLoadingPersonas] = useState(false);
//   const [loadingCandidates, setLoadingCandidates] = useState(false);
  
//   const [roleError, setRoleError] = useState<string | null>(null);
//   const [jdError, setJdError] = useState<string | null>(null);
//   const [personaError, setPersonaError] = useState<string | null>(null);
  
//   const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
//   // Display values for when personaId is in params
//   const [displayRole, setDisplayRole] = useState<string>("");
//   const [displayPersona, setDisplayPersona] = useState<string>("");

//   const API_URL = import.meta.env.VITE_API_URL;
//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${localStorage.getItem("token")}`,
//   };

//   // Fetch roles
//   const fetchRoles = async () => {
//     setLoadingRoles(true);
//     setRoleError(null);
//     try {
//       const allRoles = await fetchAllRoles();
//       setRoles(allRoles);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Could not load roles. Please try again.";
//       setRoleError(errorMessage);
//       console.error("Error fetching roles:", error);
//     } finally {
//       setLoadingRoles(false);
//     }
//   };

//   // Fetch JDs for selected role
//   const fetchJDs = async (roleId: string) => {
//     if (!roleId) return;
//     setLoadingJDs(true);
//     setJdError(null);
//     try {
//       const roleJDs = await fetchJDsByRole(roleId);
//       setJds(roleJDs);
//       setSelectedJD("");
//       setPersonas([]);
//       setSelectedPersona("");
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Could not load JDs for selected role.";
//       setJdError(errorMessage);
//       console.error("Error fetching JDs:", error);
//     } finally {
//       setLoadingJDs(false);
//     }
//   };

//   // Fetch evaluated candidates for a persona
//   const fetchEvaluatedCandidates = async (pId: string) => {
//     setLoadingCandidates(true);
//     try {
//       const response = await axios.get(
//         `${API_URL}/api/v1/candidate/scores?persona_id=${pId}&page=${page}&size=${size}`,
//         { headers }
//       );
//       setCandidates(response.data?.scores || []);
      
//       // If we have candidates, set display values from the first candidate
//       if (response.data?.candidates?.length > 0) {
//         const firstCandidate = response.data.candidates[0];
//         setDisplayRole(firstCandidate.score?.role_name || "");
//         setDisplayPersona(firstCandidate.score?.persona_name || "");
//       }
//     } catch (error) {
//       console.error("Error fetching evaluated candidates:", error);
//       setCandidates([]);
//     } finally {
//       setLoadingCandidates(false);
//     }
//   };

//   // Handle role change
//   const handleRoleChange = (roleId: string) => {
//     setSelectedRole(roleId);
//     setSelectedJD("");
//     setSelectedPersona("");
//     setJds([]);
//     setPersonas([]);
//     if (roleId) {
//       fetchJDs(roleId);
//     }
//   };

//   // Handle JD change
//   const handleJDChange = (jdId: string) => {
//     const jd = jds.find(j => j.id === jdId);

//     setSelectedJD(jdId);

//     // Personas come from JD object
//     if (jd?.personas) {
//       setPersonas(
//         jd.personas.map(p => ({
//           id: p.persona_id,
//           name: p.persona_name,
//           jd_id: jd.id,
//           role_name: jd.role_name,
//           created_by_name: p.created_by_name,
//           created_by: p.created_by,
//           created_at: p.created_at
//         }))
//       );
//     } else {
//       setPersonas([]);
//     }

//     setSelectedPersona("");
//   };

//   // Handle persona change
//   const handlePersonaChange = (pId: string) => {
//     setSelectedPersona(pId);
//     if (pId) {
//       fetchEvaluatedCandidates(pId);
//     }
//   };

//   // Retry functions
//   const retryLoadRoles = () => fetchRoles();
//   const retryLoadJDs = () => {
//     if (selectedRole) fetchJDs(selectedRole);
//   };

//   // Initial load effect
//   useEffect(() => {
//     if (personaId) {
//       // Scenario 1: personaId in URL params
//       fetchEvaluatedCandidates(personaId);
//     } else {
//       // Scenario 2: No personaId, show dropdowns
//       fetchRoles();
//     }
//   }, [personaId]);

//   const getScoreColor = (score: number) => {
//     if (score >= 90) return "text-green-600";
//     if (score >= 80) return "text-orange-500";
//     return "text-red-600";
//   };

//   const filteredCandidates = useMemo(() => {
//     return candidates
//       .filter((candidate) => showAllCandidates ? true : candidate.final_score >= 90)
//       .sort((a, b) => (b.final_score || b.overallScore) - (a.final_score || a.overallScore));
//   }, [candidates, showAllCandidates]);

//   // Checkbox selection handlers
//   const toggleCandidateSelection = (candidateId: string) => {
//     setSelectedCandidates(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(candidateId)) {
//         newSet.delete(candidateId);
//       } else {
//         newSet.add(candidateId);
//       }
//       return newSet;
//     });
//   };

//   const toggleAllCandidates = () => {
//     if (selectedCandidates.size === filteredCandidates.length) {
//       setSelectedCandidates(new Set());
//     } else {
//       const allIds = filteredCandidates.map(c => c.score_id || c.candidate_id || c.id);
//       setSelectedCandidates(new Set(allIds));
//     }
//   };

//   const isAllSelected = selectedCandidates.size === filteredCandidates.length && filteredCandidates.length > 0;
//   const isSomeSelected = selectedCandidates.size > 0 && selectedCandidates.size < filteredCandidates.length;

//   // Define table columns
//   const columns = useMemo<ColumnDef<any>[]>(() => [
//     {
//       id: "select",
//       header: () => (
//         <Checkbox
//           checked={isAllSelected}
//           indeterminate={isSomeSelected}
//           onCheckedChange={toggleAllCandidates}
//           aria-label="Select all"
//         />
//       ),
//       cell: ({ row }) => {
//         const candidateId = row.original.candidate_id ||  row.original.id || row.original.score_id  
//         return (
//           <Checkbox
//             checked={selectedCandidates.has(candidateId)}
//             onCheckedChange={() => toggleCandidateSelection(candidateId)}
//             aria-label="Select candidate"
//           />
//         );
//       },
//       enableSorting: false,
//       size: 50,
//     },
//     {
//       accessorKey: "candidate_name",
//       header: "Candidate",
//       cell: ({ row }) => {
//         const candidate = row.original;
//         return (
//           <div>
//             <button
//               className="font-medium text-primary underline-offset-4 underline cursor-pointer text-left"
//               onClick={() => {
//                 setSidebarCandidate(candidate);
//                 setSidebarOpen(true);
//               }}
//             >
//               {candidate?.candidate_name ?? `Candidate ID: ${candidate.candidate_id || candidate.id}`}
//               {candidate?.email && <span> - {candidate?.email}</span>}
//             </button>
//             <p className="text-sm text-muted-foreground">{candidate.file_name || candidate.fileName}</p>
//           </div>
//         );
//       },
//     },
//     {
//       accessorKey: "final_score",
//       header: "Overall Score",
//       cell: ({ row }) => {
//         const score = row.original.final_score || row.original.overallScore;
//         return (
//           <span className={`font-medium ${getScoreColor(score)}`}>
//             {score}%
//           </span>
//         );
//       },
//     },
//     {
//       accessorKey: "applicationDate",
//       header: "Application Date",
//       cell: ({ row }) => {
//         const date = row.original.applicationDate;
//         return (
//           <div className="flex items-center space-x-1">
//             <Calendar className="w-4 h-4 text-muted-foreground" />
//             <span className="text-sm">
//               {date ? new Date(date).toLocaleDateString() : "N/A"}
//             </span>
//           </div>
//         );
//       },
//     },
//   ], [selectedCandidates, isAllSelected, isSomeSelected, filteredCandidates]);

//   return (
//     <Layout currentStep={4}>
//       <div className="max-w-7xl mx-auto space-y-8">
//         <div className="flex items-center justify-between gap-3">
//           <h1 className="text-3xl font-bold text-foreground">Candidate Results</h1>

//           <div className="flex items-center gap-4">
//             {selectedCandidates.size > 0 && (
//               <span className="text-sm text-gray-600">
//                 {selectedCandidates.size} candidate{selectedCandidates.size !== 1 ? 's' : ''} selected
//               </span>
//             )}
            
//             <div className="inline-flex rounded-md shadow-sm" role="group">
//               <Button
//                 variant={showAllCandidates ? "outline" : "default"}
//                 size="sm"
//                 onClick={() => setShowAllCandidates(false)}
//                 className={`rounded-r-none border-r-0 ${
//                   !showAllCandidates ? "bg-blue-500 text-white hover:bg-blue-600" : ""
//                 }`}
//               >
//                 Perfect Fit
//               </Button>
//               <Button
//                 variant={!showAllCandidates ? "outline" : "default"}
//                 size="sm"
//                 onClick={() => setShowAllCandidates(true)}
//                 className={`rounded-l-none ${
//                   showAllCandidates ? "bg-blue-500 text-white hover:bg-blue-600" : ""
//                 }`}
//               >
//                 All
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Selection Section */}
//         {personaId ? (
//           // Display mode: Show selected role and persona
//           <Card className="shadow-card">
//             <CardContent className="p-6">
//               <div className="flex items-center gap-8">
//                 <div className="flex items-center gap-3">
//                   <label className="text-sm font-medium text-foreground">Role:</label>
//                   <p className="font-medium text-blue-500">{displayRole || "Loading..."}</p>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <label className="text-sm font-medium text-foreground">Persona:</label>
//                   <p className="font-medium text-blue-500">{displayPersona || "Loading..."}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ) : (
//           // Selection mode: Show dropdowns
//           <Card className="shadow-card">
//             <CardContent className="grid grid-cols-3 gap-3">
//               {/* Role Selection */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-foreground">
//                   Role <span className="text-destructive">*</span>
//                 </label>
//                 <SearchableDropdown
//                   options={roles.map(role => ({
//                     id: role.id,
//                     label: role.name,
//                     sublabel: role.description,
//                   }))}
//                   value={selectedRole}
//                   onChange={handleRoleChange}
//                   placeholder="Select a role..."
//                   searchPlaceholder="Search roles..."
//                   emptyMessage="No roles found"
//                   loading={loadingRoles}
//                   className={validationErrors.includes("Please select a Role") ? "border-destructive" : ""}
//                 />
//                 {roleError && (
//                   <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-md">
//                     <div className="flex items-start space-x-2">
//                       <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
//                       <span className="text-sm text-destructive">{roleError}</span>
//                     </div>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={retryLoadRoles}
//                       disabled={loadingRoles}
//                     >
//                       Retry
//                     </Button>
//                   </div>
//                 )}
//               </div>

//               {/* JD Selection */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-foreground">
//                   Job Description <span className="text-destructive">*</span>
//                 </label>
//                 <SearchableDropdown
//                   options={jds.map(jd => ({
//                     id: jd.id,
//                     label: jd.title,
//                     sublabel: jd.role_name,
//                     badge: `${jd.personas?.length || 0} personas`,
//                     created_by_name: jd.created_by_name,
//                     created_at: jd.created_at
//                   }))}
//                   value={selectedJD}
//                   created_by={true}
//                   onChange={handleJDChange}
//                   placeholder={!selectedRole ? "Select a role first" : "Select a job description..."}
//                   searchPlaceholder="Search job descriptions..."
//                   emptyMessage="No job descriptions found"
//                   disabled={!selectedRole}
//                   loading={loadingJDs}
//                   className={validationErrors.includes("Please select a Job Description") ? "border-destructive" : ""}
//                 />
//                 {jdError && selectedRole && (
//                   <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-md">
//                     <div className="flex items-start space-x-2">
//                       <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
//                       <span className="text-sm text-destructive">{jdError}</span>
//                     </div>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={retryLoadJDs}
//                       disabled={loadingJDs}
//                     >
//                       Retry
//                     </Button>
//                   </div>
//                 )}
//               </div>

//               {/* Persona Selection */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-foreground">
//                   Persona <span className="text-destructive">*</span>
//                 </label>
//                 <SearchableDropdown
//                   options={personas.map(persona => ({
//                     id: persona.id,
//                     label: persona.name,
//                     sublabel: persona.role_name,
//                     created_by_name: persona.created_by_name,
//                     created_at: persona.created_at
//                   }))}
//                   value={selectedPersona}
//                   onChange={handlePersonaChange}
//                   created_by={true}
//                   placeholder={!selectedJD ? "Select a JD first" : "Select a persona..."}
//                   searchPlaceholder="Search personas..."
//                   emptyMessage="No personas found"
//                   disabled={!selectedJD}
//                   loading={loadingPersonas}
//                   className={validationErrors.includes("Please select a Persona") ? "border-destructive" : ""}
//                 />
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Results Table */}
//         <BasicTable
//           data={filteredCandidates}
//           columns={columns}
//           isLoading={loadingCandidates}
//           enableSearch={true}
//           enableSorting={true}
//           enablePagination={true}
//           initialPageSize={10}
//           pageSizeOptions={[10, 20, 30, 50]}
//           searchPlaceholder="Search candidates..."
//           description={filteredCandidates.length.toString()}
//         />

//         {filteredCandidates.length === 0 && !loadingCandidates && (
//           <Card className="shadow-card">
//             <CardContent className="p-12">
//               <div className="text-center">
//                 <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-foreground">No candidates found</h3>
//                 <p className="text-sm text-muted-foreground">
//                   {!personaId && !selectedPersona 
//                     ? 'Please select a role, JD, and persona to view candidates.'
//                     : showAllCandidates 
//                       ? 'No candidates available.' 
//                       : 'No candidates with 90% or higher score.'}
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>

//       {/* Candidate Details Sidebar */}
//       <Suspense fallback={<div />}>
//         <CandidateDetailsSidebar
//           candidate={sidebarCandidate}
//           open={sidebarOpen}
//           onOpenChange={setSidebarOpen}
//         />
//       </Suspense>
//     </Layout>
//   );
// };

// export default Results;


// import { useState, useEffect, lazy, Suspense } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import Layout from "@/components/Layout";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import SearchableDropdown from "@/components/SearchableDropdown";
// import {
//   Users,
//   Calendar,
//   AlertCircle,
// } from "lucide-react";
// import axios from "axios";
// import { fetchAllRoles, fetchJDsByRole } from "@/lib/helper";

// // Lazy load the sidebar component
// const CandidateDetailsSidebar = lazy(() => import("@/components/CandidateDetailsSidebar"));

// export interface CandidateData {
//   candidate_id: string;
//   cv_id: string;
//   file_name: string;
//   file_hash: string;
//   version: number;
//   s3_url: string;
//   status: string;
//   is_new_candidate: boolean;
//   is_new_cv: boolean;
//   cv_text: string;
// }

// export interface ScoreRequest {
//   candidate_id: string;
//   persona_id: string;
//   cv_id: string;
//   force_rescore?: boolean;
// }

// export interface ScoreResponse {
//   score_id: string;
//   candidate_id: string;
//   persona_id: string;
//   final_score: number;
//   match_status: string;
//   pipeline_stage_reached: number;
//   candidate_name: string;
//   file_name: string;
//   persona_name: string;
//   role_name: string;
// }

// const Results = () => {
//   const { personaId } = useParams();
//   const navigate = useNavigate();
  
//   // State for candidates and UI
//   const [candidates, setCandidates] = useState<any[]>([]);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sidebarCandidate, setSidebarCandidate] = useState<any | null>(null);
//   const [showAllCandidates, setShowAllCandidates] = useState(true);
//   const [size, setSize] = useState<number>(10)
//   const [page, setPage] = useState<number>(1)


  
//   // State for dropdowns (only used when no personaId in params)
//   const [roles, setRoles] = useState<any[]>([]);
//   const [jds, setJds] = useState<any[]>([]);
//   const [personas, setPersonas] = useState<any[]>([]);
  
//   const [selectedRole, setSelectedRole] = useState<string>("");
//   const [selectedJD, setSelectedJD] = useState<string>("");
//   const [selectedPersona, setSelectedPersona] = useState<string>("");
  
//   // Loading and error states
//   const [loadingRoles, setLoadingRoles] = useState(false);
//   const [loadingJDs, setLoadingJDs] = useState(false);
//   const [loadingPersonas, setLoadingPersonas] = useState(false);
//   const [loadingCandidates, setLoadingCandidates] = useState(false);
  
//   const [roleError, setRoleError] = useState<string | null>(null);
//   const [jdError, setJdError] = useState<string | null>(null);
//   const [personaError, setPersonaError] = useState<string | null>(null);
  
//   const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
//   // Display values for when personaId is in params
//   const [displayRole, setDisplayRole] = useState<string>("");
//   const [displayPersona, setDisplayPersona] = useState<string>("");

//   const API_URL = import.meta.env.VITE_API_URL;
//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${localStorage.getItem("token")}`,
//   };

//   // Fetch roles
//   const fetchRoles = async () => {
//     setLoadingRoles(true);
//     setRoleError(null);
//     try {
//       const allRoles = await fetchAllRoles();
//       setRoles(allRoles);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Could not load roles. Please try again.";
//       setRoleError(errorMessage);
//       console.error("Error fetching roles:", error);
//     } finally {
//       setLoadingRoles(false);
//     }
//   };

//   // Fetch JDs for selected role
//   const fetchJDs = async (roleId: string) => {
//     if (!roleId) return;
//     setLoadingJDs(true);
//     setJdError(null);
//     try {
//       const roleJDs = await fetchJDsByRole(roleId);
//       setJds(roleJDs);
//       setSelectedJD("");
//       setPersonas([]);
//       setSelectedPersona("");
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Could not load JDs for selected role.";
//       setJdError(errorMessage);
//       console.error("Error fetching JDs:", error);
//     } finally {
//       setLoadingJDs(false);
//     }
//   };

//   // Fetch evaluated candidates for a persona
//   const fetchEvaluatedCandidates = async (pId: string) => {
//     setLoadingCandidates(true);
//     try {
//       const response = await axios.get(
//         `${API_URL}/api/v1/candidate/scores?persona_id=${pId}&page=${page}&size=${size}`,
//         { headers }
//       );
//       setCandidates(response.data?.scores || []);
      
//       // If we have candidates, set display values from the first candidate
//       if (response.data?.candidates?.length > 0) {
//         const firstCandidate = response.data.candidates[0];
//         setDisplayRole(firstCandidate.score?.role_name || "");
//         setDisplayPersona(firstCandidate.score?.persona_name || "");
//       }
//     } catch (error) {
//       console.error("Error fetching evaluated candidates:", error);
//       setCandidates([]);
//     } finally {
//       setLoadingCandidates(false);
//     }
//   };

//   // Handle role change
//   const handleRoleChange = (roleId: string) => {
//     setSelectedRole(roleId);
//     setSelectedJD("");
//     setSelectedPersona("");
//     setJds([]);
//     setPersonas([]);
//     if (roleId) {
//       fetchJDs(roleId);
//     }
//   };

//   // Handle JD change
//   const handleJDChange = (jdId: string) => {
//     const jd = jds.find(j => j.id === jdId);

//     setSelectedJD(jdId);

//     // Personas come from JD object
//     if (jd?.personas) {
//       setPersonas(
//         jd.personas.map(p => ({
//           id: p.persona_id,
//           name: p.persona_name,
//           jd_id: jd.id,
//           role_name: jd.role_name,
//           created_by_name: p.created_by_name,
//           created_by: p.created_by,
//           created_at: p.created_at
//         }))
//       );
//     } else {
//       setPersonas([]);
//     }

//     setSelectedPersona("");
//   };

//   // Handle persona change
//   const handlePersonaChange = (pId: string) => {
//     setSelectedPersona(pId);
//     if (pId) {
//       fetchEvaluatedCandidates(pId);
//     }
//   };

//   // Retry functions
//   const retryLoadRoles = () => fetchRoles();
//   const retryLoadJDs = () => {
//     if (selectedRole) fetchJDs(selectedRole);
//   };

//   // Initial load effect
//   useEffect(() => {
//     if (personaId) {
//       // Scenario 1: personaId in URL params
//       fetchEvaluatedCandidates(personaId);
//     } else {
//       // Scenario 2: No personaId, show dropdowns
//       fetchRoles();
//     }
//   }, [personaId]);

//   const getScoreColor = (score: number) => {
//     if (score >= 90) return "text-green-600";
//     if (score >= 80) return "text-orange-500";
//     return "text-red-600";
//   };

//   const filteredCandidates = candidates
//     .filter((candidate) => showAllCandidates ? true : candidate.final_score >= 90)
//     .sort((a, b) => (b.final_score || b.overallScore) - (a.final_score || a.overallScore));

//   return (
//     <Layout currentStep={4}>
//       <div className="max-w-7xl mx-auto space-y-8">
//         <div className="flex items-center justify-between gap-3">
//           <h1 className="text-3xl font-bold text-foreground">Candidate Results</h1>

//           <div className="inline-flex rounded-md shadow-sm" role="group">
//             <Button
//               variant={showAllCandidates ? "outline" : "default"}
//               size="sm"
//               onClick={() => setShowAllCandidates(false)}
//               className={`rounded-r-none border-r-0 ${
//                 !showAllCandidates ? "bg-blue-500 text-white hover:bg-blue-600" : ""
//               }`}
//             >
//               Perfect Fit
//             </Button>
//             <Button
//               variant={!showAllCandidates ? "outline" : "default"}
//               size="sm"
//               onClick={() => setShowAllCandidates(true)}
//               className={`rounded-l-none ${
//                 showAllCandidates ? "bg-blue-500 text-white hover:bg-blue-600" : ""
//               }`}
//             >
//               All
//             </Button>
//           </div>
//         </div>

//         {/* Selection Section */}
//         {personaId ? (
//           // Display mode: Show selected role and persona
//           <Card className="shadow-card">
//             <CardContent className="p-6">
//               <div className="flex items-center gap-8">
//                 <div className="flex items-center gap-3">
//                   <label className="text-sm font-medium text-foreground">Role:</label>
//                   <p className="font-medium text-blue-500">{displayRole || "Loading..."}</p>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <label className="text-sm font-medium text-foreground">Persona:</label>
//                   <p className="font-medium text-blue-500">{displayPersona || "Loading..."}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ) : (
//           // Selection mode: Show dropdowns
//           <Card className="shadow-card">
//             <CardContent className="grid grid-cols-3 gap-3">
//               {/* Role Selection */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-foreground">
//                   Role <span className="text-destructive">*</span>
//                 </label>
//                 <SearchableDropdown
//                   options={roles.map(role => ({
//                     id: role.id,
//                     label: role.name,
//                     sublabel: role.description,
//                   }))}
//                   value={selectedRole}
//                   onChange={handleRoleChange}
//                   placeholder="Select a role..."
//                   searchPlaceholder="Search roles..."
//                   emptyMessage="No roles found"
//                   loading={loadingRoles}
//                   className={validationErrors.includes("Please select a Role") ? "border-destructive" : ""}
//                 />
//                 {roleError && (
//                   <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-md">
//                     <div className="flex items-start space-x-2">
//                       <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
//                       <span className="text-sm text-destructive">{roleError}</span>
//                     </div>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={retryLoadRoles}
//                       disabled={loadingRoles}
//                     >
//                       Retry
//                     </Button>
//                   </div>
//                 )}
//               </div>

//               {/* JD Selection */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-foreground">
//                   Job Description <span className="text-destructive">*</span>
//                 </label>
//                 <SearchableDropdown
//                   options={jds.map(jd => ({
//                     id: jd.id,
//                     label: jd.title,
//                     sublabel: jd.role_name,
//                     badge: `${jd.personas?.length || 0} personas`,
//                     created_by_name: jd.created_by_name,
//                     created_at: jd.created_at
//                   }))}
//                   value={selectedJD}
//                   created_by={true}
//                   onChange={handleJDChange}
//                   placeholder={!selectedRole ? "Select a role first" : "Select a job description..."}
//                   searchPlaceholder="Search job descriptions..."
//                   emptyMessage="No job descriptions found"
//                   disabled={!selectedRole}
//                   loading={loadingJDs}
//                   className={validationErrors.includes("Please select a Job Description") ? "border-destructive" : ""}
//                 />
//                 {jdError && selectedRole && (
//                   <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-md">
//                     <div className="flex items-start space-x-2">
//                       <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
//                       <span className="text-sm text-destructive">{jdError}</span>
//                     </div>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={retryLoadJDs}
//                       disabled={loadingJDs}
//                     >
//                       Retry
//                     </Button>
//                   </div>
//                 )}
//               </div>

//               {/* Persona Selection */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-foreground">
//                   Persona <span className="text-destructive">*</span>
//                 </label>
//                 <SearchableDropdown
//                   options={personas.map(persona => ({
//                     id: persona.id,
//                     label: persona.name,
//                     sublabel: persona.role_name,
//                     created_by_name: persona.created_by_name,
//                     created_at: persona.created_at
//                   }))}
//                   value={selectedPersona}
//                   onChange={handlePersonaChange}
//                   created_by={true}
//                   placeholder={!selectedJD ? "Select a JD first" : "Select a persona..."}
//                   searchPlaceholder="Search personas..."
//                   emptyMessage="No personas found"
//                   disabled={!selectedJD}
//                   loading={loadingPersonas}
//                   className={validationErrors.includes("Please select a Persona") ? "border-destructive" : ""}
//                 />
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Results Table */}
//         {loadingCandidates ? (
//           <Card className="shadow-card">
//             <CardContent className="p-12">
//               <div className="text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//                 <p className="text-muted-foreground">Loading candidates...</p>
//               </div>
//             </CardContent>
//           </Card>
//         ) : (
//           <Card className="shadow-card">
//             <CardContent className="p-0">
//               <div className="rounded-md border">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="py-2 px-3">Candidate</TableHead>
//                       <TableHead className="py-2 px-3">Overall Score</TableHead>
//                       <TableHead className="py-2 px-3">Application Date</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {candidates.map((candidate) => (
//                       <TableRow key={candidate.score_id || candidate.id}>
//                         <TableCell className="py-2 px-3">
//                           <div>
//                             <button
//                               className="font-medium text-primary underline-offset-4 underline cursor-pointer text-left"
//                               onClick={() => {
//                                 setSidebarCandidate(candidate);
//                                 setSidebarOpen(true);
//                               }}
//                             >
//                               {candidate?.candidate_name ?? `Candidate ID: ${candidate.candidate_id || candidate.id}`}
//                               {candidate?.email && <span> - {candidate?.email}</span>}
//                             </button>
//                             <p className="text-sm text-muted-foreground">{candidate.file_name || candidate.fileName}</p>
//                           </div>
//                         </TableCell>
//                         <TableCell className="py-2 px-3">
//                           <span className={`font-medium ${getScoreColor(candidate.final_score || candidate.overallScore)}`}>
//                             {candidate.score?.final_score || candidate.final_score || candidate.overallScore}%
//                           </span>
//                         </TableCell>
//                         <TableCell className="py-2 px-3">
//                           <div className="flex items-center space-x-1">
//                             <Calendar className="w-4 h-4 text-muted-foreground" />
//                             <span className="text-sm">
//                               {candidate.applicationDate ? new Date(candidate.applicationDate).toLocaleDateString() : "N/A"}
//                             </span>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>

//               {candidates.length === 0 && !loadingCandidates && (
//                 <div className="text-center py-12">
//                   <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
//                   <h3 className="text-lg font-medium text-foreground">No candidates found</h3>
//                   <p className="text-sm text-muted-foreground">
//                     {!personaId && !selectedPersona 
//                       ? 'Please select a role, JD, and persona to view candidates.'
//                       : showAllCandidates 
//                         ? 'No candidates available.' 
//                         : 'No candidates with 90% or higher score.'}
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         )}
//       </div>

//       {/* Candidate Details Sidebar */}
//       <Suspense fallback={<div />}>
//         <CandidateDetailsSidebar
//           candidate={sidebarCandidate}
//           open={sidebarOpen}
//           onOpenChange={setSidebarOpen}
//         />
//       </Suspense>
//     </Layout>
//   );
// };

// export default Results;
