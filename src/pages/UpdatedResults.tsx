import { useState, useEffect, lazy, Suspense, useMemo, useCallback, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SearchableDropdown from "@/components/SearchableDropdown";
import { Users, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { fetchAllRoles, fetchJDsByRole, formatDateTime } from "@/lib/helper";
import { ColumnDef } from "@tanstack/react-table";
import BasicTable from "@/components/BasicTable";
import { Checkbox } from "@/components/ui/checkbox";
import { useEvaluationResults } from "@/lib/hooks";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

const CandidateDetailsSidebar = lazy(() => import("@/components/CandidateDetailsSidebar"));

const UpdatedResults = () => {
  const queryClient = useQueryClient();
  const { personaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use ref to track if we've already logged this render cycle
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current += 1;
    console.log(`UpdatedResults render #${renderCount.current}`);
  });
  
  // Extract state from navigation - memoize to prevent changes
  const navigationState = useMemo(() => ({
    fromEvaluation: location.state?.fromEvaluation || false,
    evaluationSessionKey: location.state?.evaluationSessionKey,
    candidateIds: location.state?.candidateIds,
  }), [location.state?.fromEvaluation, location.state?.evaluationSessionKey, location.state?.candidateIds]);
  
  // State for candidates and UI
  const [candidates, setCandidates] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCandidate, setSidebarCandidate] = useState<any | null>(null);
  const [showAllCandidates, setShowAllCandidates] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [selectingCandidates, setSelectingCandidates] = useState(false);

  // State for dropdowns
  const [roles, setRoles] = useState<any[]>([]);
  const [jds, setJds] = useState<any[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedJD, setSelectedJD] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<string>(personaId || "");
  
  // Loading and error states
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingJDs, setLoadingJDs] = useState(false);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  
  const [roleError, setRoleError] = useState<string | null>(null);
  const [jdError, setJdError] = useState<string | null>(null);
  
  // Display values
  const [displayRole, setDisplayRole] = useState<string>("");
  const [displayPersona, setDisplayPersona] = useState<string>("");

  // Use the combined hook
  const { 
    data: evaluationData, 
    isLoading: loadingCandidates,
    error: evaluationError,
    refetch,
    isFromEvaluation,
  } = useEvaluationResults(
    selectedPersona || personaId, 
    navigationState.fromEvaluation,
    pagination.pageIndex + 1, 
    pagination.pageSize,
    navigationState.evaluationSessionKey,
    navigationState.candidateIds
  );

  // FIXED: Consolidate candidate updates into single effect with proper dependencies
  useEffect(() => {
    if (evaluationData?.scores && evaluationData.scores.length > 0) {
      // Only update if data actually changed
      setCandidates(prevCandidates => {
        const newScores = evaluationData.scores;
        // Simple equality check - you might want a deeper comparison
        if (JSON.stringify(prevCandidates) === JSON.stringify(newScores)) {
          return prevCandidates; // Prevent unnecessary state update
        }
        return newScores;
      });
      
      // Update display values only if they're empty or changed
      const firstScore = evaluationData.scores[0];
      setDisplayRole(prev => {
        const newRole = firstScore.role_name || "";
        return prev !== newRole ? newRole : prev;
      });
      setDisplayPersona(prev => {
        const newPersona = firstScore.persona_name || "";
        return prev !== newPersona ? newPersona : prev;
      });
    }
  }, [evaluationData?.scores]); // Only depend on scores array

  // Fetch roles on mount (for Scenario 3) - FIXED: Only run once
  useEffect(() => {
    if (!personaId) {
      fetchRoles();
    }
  }, []); // Empty dependency array - only run on mount

  // Memoized fetch functions to prevent recreation
  const fetchRoles = useCallback(async () => {
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
  }, []); // No dependencies needed

  const fetchJDs = useCallback(async (roleId: string) => {
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
  }, []); // No dependencies needed

  // Handle role change - memoized
  const handleRoleChange = useCallback((roleId: string) => {
    setSelectedRole(roleId);
    setSelectedJD("");
    setSelectedPersona("");
    setJds([]);
    setPersonas([]);
    setCandidates([]);
    if (roleId) {
      fetchJDs(roleId);
    }
  }, [fetchJDs]);

  // Handle JD change - memoized
  const handleJDChange = useCallback((jdId: string) => {
    console.log("=== JD CHANGE TRIGGERED ===");
    console.log("jdID from dd: ", jdId);
    
    setSelectedJD(jdId);
    setSelectedPersona("");
    setCandidates([]);

    setJds(prevJds => {
      const jd = prevJds.find(j => j.id === jdId);
      console.log("Found JD:", jd);
      
      if (jd?.personas) {
        console.log("Setting personas:", jd.personas);
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
      
      return prevJds; // Return unchanged to avoid re-render
    });
  }, []);

  // Handle persona change - memoized
  const handlePersonaChange = useCallback((pId: string) => {
    setSelectedPersona(pId);
  }, []);

  // Retry functions - memoized
  const retryLoadRoles = useCallback(() => fetchRoles(), [fetchRoles]);
  const retryLoadJDs = useCallback(() => {
    if (selectedRole) fetchJDs(selectedRole);
  }, [selectedRole, fetchJDs]);

  const getScoreColor = useCallback((score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-orange-500";
    return "text-red-600";
  }, []);

  // FIXED: Properly memoize filtered candidates
  const filteredCandidates = useMemo(() => {
    const base = candidates.filter(candidate =>
      showAllCandidates ? true : candidate.final_score >= 90
    );

    if (!showAllCandidates) {
      return [...base].sort(
        (a, b) => (b.final_score || 0) - (a.final_score || 0)
      );
    }

    return base;
  }, [candidates, showAllCandidates]); // Only these dependencies

  // Checkbox selection handlers - memoized
  const toggleCandidateSelection = useCallback((candidateId: string) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        return [...prev, candidateId];
      }
    });
  }, []);

  const toggleAllCandidates = useCallback(() => {
    setSelectedCandidates(prev => {
      if (prev.length === filteredCandidates.length) {
        return [];
      } else {
        return filteredCandidates.map(c => c.candidate_id);
      }
    });
  }, [filteredCandidates]);

  // Handle candidate selection API call - memoized
  const handleSelectCandidates = useCallback(async () => {
    if (selectedCandidates.length === 0) return;

    try {
      setSelectingCandidates(true);
      console.log("payload for selection JD: ", selectedJD);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/candidate/select`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            candidate_ids: selectedCandidates,
            persona_id: selectedPersona || personaId,
            job_description_id: selectedJD || (evaluationData?.scores[0] as any)?.job_description_id || "",
            selection_notes: "",
            priority: "high",
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to select candidates");
      }

      const data = await response.json();

      setCandidates(prevCandidates =>
        prevCandidates.map(candidate => {
          const selection = data.selections.find(
            (s: any) => s.candidate.id === candidate.candidate_id
          );
          if (selection) {
            return {
              ...candidate,
              current_status: selection.status,
              selection_id: selection.id,
            };
          }
          return candidate;
        })
      );

      setSelectedCandidates([]);
      alert(`Successfully selected ${data.selected_count} candidate${data.selected_count !== 1 ? 's' : ''}`);
    } catch (error) {
      console.error("Error selecting candidates:", error);
      alert(error instanceof Error ? error.message : "Failed to select candidates");
    } finally {
      setSelectingCandidates(false);
    }
  }, [selectedCandidates, selectedPersona, personaId, selectedJD, evaluationData, navigate]);

  // const handleStatusChange = useCallback(async (candidateId:string, selectionId: string, statusCode: string) => {
  //   const selectedStatus = statuses.find(s => s.code === statusCode);
    
  //   if (!selectedStatus) {
  //     console.error("Status not found");
  //     return;
  //   }

  //   setUpdatingStatus(selectionId);

  //   try {
  //     const response = await fetch(
  //       `${import.meta.env.VITE_API_URL}/api/v1/candidate/selections/${selectionId}`,
  //       {
  //         method: "PATCH",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //         body: JSON.stringify({
  //           "status": selectedStatus.code,
  //           "priority": "high",
  //           "selection_notes": "",
  //           "change_notes": ""
  //       }),
  //       }
  //     );

  //     if (response.status === 401) {
  //       localStorage.removeItem('token');
  //       navigate('/login');
  //       return;
  //     }

  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({}));
  //       throw new Error(errorData.message || "Failed to update status");
  //     }

  //     const data = await response.json();

  //     setCandidates(prevCandidates =>
  //       prevCandidates.map(candidate =>
  //         candidate.candidate_id === candidateId
  //           ? { ...candidate, current_status: selectedStatus.code }
  //           : candidate
  //       )
  //     );

  //     console.log("Status updated successfully:", data);
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //     alert(error instanceof Error ? error.message : "Failed to update candidate status");
  //   } finally {
  //     setUpdatingStatus(null);
  //   }
  // }, [statuses, navigate]);


  const handleStatusChange = useCallback(async (candidateId:string, selectionId: string, statusCode: string) => {
    const selectedStatus = statuses.find(s => s.code === statusCode);
    
    if (!selectedStatus) {
      console.error("Status not found");
      return;
    }

    setUpdatingStatus(selectionId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/candidate/selections/${selectionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            "status": selectedStatus.code,
            "priority": "high",
            "selection_notes": "",
            "change_notes": ""
        }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update status");
      }

      await response.json();

      // Update candidate status optimistically
      setCandidates(prevCandidates =>
        prevCandidates.map(candidate =>
          candidate.selection_id === selectionId
            ? { ...candidate, current_status: selectedStatus.code }
            : candidate
        )
      );

      queryClient.invalidateQueries({ 
        queryKey: ["candidateScores", candidateId] 
      });

      console.log("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error instanceof Error ? error.message : "Failed to update candidate status");
      
      // Revert the status change on error by refetching
      refetch();
    } finally {
      setUpdatingStatus(null);
    }
  }, [statuses, navigate, refetch]);

  const totalCount = evaluationData?.total || 0;
  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  const isAllSelected = selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0;
  const isSomeSelected = selectedCandidates.length > 0 && selectedCandidates.length < filteredCandidates.length;

  const fetchStatuses = useCallback(async () => {
    setLoadingStatuses(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/candidate-selection-status/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch statuses");
      }

      const data = await response.json();
      setStatuses(data.statuses || []);
    } catch (error) {
      console.error("Error fetching statuses:", error);
    } finally {
      setLoadingStatuses(false);
    }
  }, [navigate]);

  // Fetch statuses only once on mount
  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // FIXED: Memoize columns properly with stable dependencies
  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: "candidate_name",
      header: "Candidate",
      cell: ({ row }) => {
        const candidate = row.original;
        return (
          <div>
            <button
              className="font-medium text-primary text-left"
              onClick={() => {
                setSidebarCandidate(candidate);
                setSidebarOpen(true);
              }}
            >
              <span className="underline cursor-pointer">
                {candidate?.candidate_name ?? `Candidate ID: ${candidate.candidate_id}`}
              </span>
              {" - "}
              <span className="text-gray-500">{candidate?.email}</span>
            </button>
            <p className="text-sm text-muted-foreground">{candidate.file_name}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "final_score",
      header: "Overall Score",
      cell: ({ row }) => {
        const score = row.original.final_score;
        return (
          <span className={`font-medium ${getScoreColor(score)}`}>
            {score}%
          </span>
        );
      },
    },
    {
      accessorKey: "scored_at",
      header: "Scored Date",
      cell: ({ row }) => {
        const date = row.original.scored_at;
        return (
          <div className="flex items-center space-x-1">
            <span className="text-sm">
              {date ? formatDateTime(date) : "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "final_decision",
      header: "Evaluation Status",
      cell: ({ row }) => {
        const eval_status = row.original.final_decision;
        return (
          <div className="flex items-center space-x-1">
            <span className="text-sm">
              {eval_status?.replace("_", " ")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "current_status",
      header: "Interview Status",
      cell: ({ row }) => {
        const candidate = row.original;
        const selectionId = candidate.selection_id;
        const candidateId = candidate.candidate_id
        const currentStatus = candidate.current_status || "evaluated";
        const isUpdating = updatingStatus === selectionId;

        return (
          <Select
            value={currentStatus}
            onValueChange={(value) => handleStatusChange(candidateId, selectionId, value)}
            disabled={loadingStatuses || isUpdating}
          >
            <SelectTrigger 
              className={cn(
                "w-full h-8",
                isUpdating && "opacity-50 cursor-not-allowed"
              )}
            >
              {isUpdating ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-sm">Updating...</span>
                </div>
              ) : (
                <SelectValue>
                  {statuses.find(s => s.code === currentStatus)?.name || currentStatus}
                </SelectValue>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.code}>
                    <span className="text-sm font-medium">
                      {status.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        );
      },
    },
  ], [statuses, loadingStatuses, updatingStatus, getScoreColor, handleStatusChange]);

  const shouldShowTable = filteredCandidates.length > 0 && !loadingCandidates;
  const showDropdowns = !personaId;
  
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <Layout currentStep={undefined}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Candidate Results</h1>
            {isFromEvaluation && (
              <p className="text-sm text-muted-foreground mt-1">
                Showing results from latest evaluation
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
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

        {/* Rest of your JSX remains the same... */}
        {showDropdowns ? (
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4">
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
                    created_by={false}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Persona <span className="text-destructive">*</span>
                  </label>
                  <SearchableDropdown
                    options={personas.map(persona => ({
                      id: persona.id,
                      jd_id: persona.jd_id,
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
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
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
                <div className="flex gap-3 items-center">
                  {selectedCandidates.length > 0 && (
                    <Button
                      onClick={handleSelectCandidates}
                      disabled={selectingCandidates}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      size="sm"
                    >
                      {selectingCandidates ? "Selecting..." : `Select ${selectedCandidates.length > 1 ? 'Candidates' : 'Candidate'} (${selectedCandidates.length})`}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/results')}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {shouldShowTable && (
          <BasicTable
            data={filteredCandidates}
            columns={columns}
            onRefresh={handleRefresh}
            isLoading={loadingCandidates}
            enableSearch={true}
            enableSorting={true}
            enablePagination={true}
            enableRefresh={true}
            initialPageSize={pagination.pageSize}
            pageSizeOptions={[10, 20, 30, 50]}
            searchPlaceholder="Search candidates..."
            description={`${totalCount} candidate${totalCount !== 1 ? 's' : ''}`}
            manualPagination={!isFromEvaluation}
            pageCount={pageCount}
            onPaginationChange={setPagination}
            state={{ pagination }}
            initialSorting={[]}
          />
        )}

        {loadingCandidates && (
          <Card className="shadow-card">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">Loading candidates...</h3>
              </div>
            </CardContent>
          </Card>
        )}

        {!loadingCandidates && filteredCandidates.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-12">
              <div className="text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">No candidates found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {!selectedPersona && showDropdowns
                    ? 'Please select a role, JD, and persona to view candidates.'
                    : showAllCandidates 
                      ? 'No candidates have been evaluated yet.' 
                      : 'No candidates with 90% or higher score.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {evaluationError && (
          <Card className="shadow-card">
            <CardContent className="p-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">Failed to load candidates</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {evaluationError instanceof Error ? evaluationError.message : 'Something went wrong'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {sidebarOpen && <Suspense fallback={<div />}>
        <CandidateDetailsSidebar
          candidate={sidebarCandidate}
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />
      </Suspense>}
    </Layout>
  );
};

export default UpdatedResults;

// import { useState, useEffect, lazy, Suspense, useMemo } from "react";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import Layout from "@/components/Layout";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import SearchableDropdown from "@/components/SearchableDropdown";
// import { Users, Calendar, AlertCircle, Loader2 } from "lucide-react";
// import { fetchAllRoles, fetchJDsByRole } from "@/lib/helper";
// import { ColumnDef } from "@tanstack/react-table";
// import BasicTable from "@/components/BasicTable";
// import { Checkbox } from "@/components/ui/checkbox";
// import { useEvaluationResults } from "@/lib/hooks";
// import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { cn } from "@/lib/utils";

// const CandidateDetailsSidebar = lazy(() => import("@/components/CandidateDetailsSidebar"));

// const UpdatedResults = () => {
//   const { personaId } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
  
//   console.log("UpdatedResults component rendered");
  
//   // Extract state from navigation
//   const fromEvaluation = location.state?.fromEvaluation || false;
//   const evaluationSessionKey = location.state?.evaluationSessionKey;
//   const candidateIds = location.state?.candidateIds;
  
//   // State for candidates and UI
//   const [candidates, setCandidates] = useState<any[]>([]);
//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 10,
//   });
//   const [statuses, setStatuses] = useState<any[]>([]);
// const [loadingStatuses, setLoadingStatuses] = useState(false);
// const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [sidebarCandidate, setSidebarCandidate] = useState<any | null>(null);
//   const [showAllCandidates, setShowAllCandidates] = useState(true);
//   const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
//   const [selectingCandidates, setSelectingCandidates] = useState(false);

//   // State for dropdowns
//   const [roles, setRoles] = useState<any[]>([]);
//   const [jds, setJds] = useState<any[]>([]);
//   const [personas, setPersonas] = useState<any[]>([]);
  
//   const [selectedRole, setSelectedRole] = useState<string>("");
//   const [selectedJD, setSelectedJD] = useState<string>("");
//   const [selectedPersona, setSelectedPersona] = useState<string>(personaId || "");
  
//   // Loading and error states
//   const [loadingRoles, setLoadingRoles] = useState(false);
//   const [loadingJDs, setLoadingJDs] = useState(false);
//   const [loadingPersonas, setLoadingPersonas] = useState(false);
  
//   const [roleError, setRoleError] = useState<string | null>(null);
//   const [jdError, setJdError] = useState<string | null>(null);
  
//   // Display values
//   const [displayRole, setDisplayRole] = useState<string>("");
//   const [displayPersona, setDisplayPersona] = useState<string>("");

//   // Use the combined hook
//  const { 
//     data: evaluationData, 
//     isLoading: loadingCandidates,
//     error: evaluationError,
//     refetch,
//     isFromEvaluation,
//   } = useEvaluationResults(
//     selectedPersona || personaId, 
//     fromEvaluation,
//     pagination.pageIndex + 1, 
//     pagination.pageSize,
//     evaluationSessionKey,
//     candidateIds
//   );

//   // Update candidates when evaluation data changes
// //   useEffect(() => {
// //     if (evaluationData?.scores) {
// //       setCandidates(evaluationData.scores);
      
// //       // Set display values from first candidate
// //       if (evaluationData.scores.length > 0) {
// //         const firstScore = evaluationData.scores[0];
// //         setDisplayRole(firstScore.role_name || "");
// //         setDisplayPersona(firstScore.persona_name || "");
// //       }
// //     }
// //   }, [evaluationData]);

//   useEffect(() => {
//     if (evaluationData?.scores) {
//       setCandidates(evaluationData.scores);
      
//       // Set display values from first candidate
//       if (evaluationData.scores.length > 0) {
//         const firstScore = evaluationData.scores[0];
//         setDisplayRole(firstScore.role_name || "");
//         setDisplayPersona(firstScore.persona_name || "");
//       }
//     }
//   }, [evaluationData]);

//   // Fetch roles on mount (for Scenario 3)
//   useEffect(() => {
//     if (!personaId) {
//       fetchRoles();
//     }
//   }, [personaId]);

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

//   // Handle role change
//   const handleRoleChange = (roleId: string) => {
//     setSelectedRole(roleId);
//     setSelectedJD("");
//     setSelectedPersona("");
//     setJds([]);
//     setPersonas([]);
//     setCandidates([]);
//     if (roleId) {
//       fetchJDs(roleId);
//     }
//   };

//   // Handle JD change
//   const handleJDChange = (jdId: string) => {
//     console.log("=== JD CHANGE TRIGGERED ===");
//     console.log("jdID from dd: ", jdId);
//     console.log("Available JDs:", jds);
    
//     const jd = jds.find(j => j.id === jdId);
//     console.log("Found JD:", jd);
    
//     setSelectedJD(jdId);
//     setSelectedPersona("");
//     setCandidates([]);

//     if (jd?.personas) {
//       console.log("Setting personas:", jd.personas);
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
//   };

//   // Handle persona change
//   const handlePersonaChange = (pId: string) => {
//     setSelectedPersona(pId);
//     // Don't navigate - just update the selected persona
//     // The useEvaluationResults hook will automatically fetch data
//   };

//   // Retry functions
//   const retryLoadRoles = () => fetchRoles();
//   const retryLoadJDs = () => {
//     if (selectedRole) fetchJDs(selectedRole);
//   };

//   const getScoreColor = (score: number) => {
//     if (score >= 90) return "text-green-600";
//     if (score >= 80) return "text-orange-500";
//     return "text-red-600";
//   };

// //   const filteredCandidates = useMemo(() => {
// //     return candidates
// //       .filter((candidate) => showAllCandidates ? true : candidate.final_score >= 90)
// //       .sort((a, b) => (b.final_score || 0) - (a.final_score || 0));
// //   }, [candidates, showAllCandidates]);

// //   const filteredCandidates = useMemo(() => {
// //     return candidates
// //       .filter((candidate) => showAllCandidates ? true : candidate.final_score >= 90)
// //       .sort((a, b) => (b.final_score || 0) - (a.final_score || 0));
// //   }, [candidates, showAllCandidates]);

// const filteredCandidates = useMemo(() => {
//   // Start from original array
//   const base = candidates.filter(candidate =>
//     showAllCandidates ? true : candidate.final_score >= 90
//   );

//   // Only sort when we're *not* showing all candidates
//   if (!showAllCandidates) {
//     return [...base].sort(
//       (a, b) => (b.final_score || 0) - (a.final_score || 0)
//     );
//   }

//   return base; // preserve server order
// }, [candidates, showAllCandidates]);

//   // Checkbox selection handlers
//   const toggleCandidateSelection = (candidateId: string) => {
//     setSelectedCandidates(prev => {
//       if (prev.includes(candidateId)) {
//         return prev.filter(id => id !== candidateId);
//       } else {
//         return [...prev, candidateId];
//       }
//     });
//   };

//   const toggleAllCandidates = () => {
//     if (selectedCandidates.length === filteredCandidates.length) {
//       setSelectedCandidates([]);
//     } else {
//       const allIds = filteredCandidates.map(c => c.candidate_id);
//       setSelectedCandidates(allIds);
//     }
//   };

//   // Handle candidate selection API call
//   const handleSelectCandidates = async () => {
//     if (selectedCandidates.length === 0) return;

//     try {
//       setSelectingCandidates(true);
//         console.log("payload for selection JD: ", selectedJD)
//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/api/v1/candidate/select`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           body: JSON.stringify({
//             candidate_ids: selectedCandidates,
//             persona_id: selectedPersona || personaId,
//             job_description_id: selectedJD || (evaluationData?.scores[0] as any)?.job_description_id || "",
//             selection_notes: "",
//             priority: "high",
//           }),
//         }
//       );

//       if (response.status === 401) {
//         localStorage.removeItem('token');
//         navigate('/login');
//         return;
//       }

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || "Failed to select candidates");
//       }

//       const data = await response.json();

//       // Update the candidates list with new selection status
//       setCandidates(prevCandidates =>
//         prevCandidates.map(candidate => {
//           const selection = data.selections.find(
//             (s: any) => s.candidate.id === candidate.candidate_id
//           );
//           if (selection) {
//             return {
//               ...candidate,
//               current_status: selection.status,
//               selection_id: selection.id,
//             };
//           }
//           return candidate;
//         })
//       );

//       // Clear selected candidates
//       setSelectedCandidates([]);

//       // Show success message
//       alert(`Successfully selected ${data.selected_count} candidate${data.selected_count !== 1 ? 's' : ''}`);
//     } catch (error) {
//       console.error("Error selecting candidates:", error);
//       alert(error instanceof Error ? error.message : "Failed to select candidates");
//     } finally {
//       setSelectingCandidates(false);
//     }
//   };

//   const handleStatusChange = async (candidateId: string, statusCode: string) => {
//   // Find the selected status
//   const selectedStatus = statuses.find(s => s.code === statusCode);
  
//   if (!selectedStatus) {
//     console.error("Status not found");
//     return;
//   }

//   setUpdatingStatus(candidateId);

//   try {
//     const response = await fetch(
//       `${import.meta.env.VITE_API_URL}/api/v1/candidate-selection-status/${status_id}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({
//           code: selectedStatus.code,
//           name: selectedStatus.name,
//           description: selectedStatus.description || "",
//           display_order: selectedStatus.display_order,
//           is_active: selectedStatus.is_active,
//         }),
//       }
//     );

//     if (response.status === 401) {
//       localStorage.removeItem('token');
//       navigate('/login');
//       return;
//     }

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.message || "Failed to update status");
//     }

//     const data = await response.json();

//     // Update the local candidate state with new status
//     setCandidates(prevCandidates =>
//       prevCandidates.map(candidate =>
//         candidate.candidate_id === candidateId
//           ? { ...candidate, current_status: selectedStatus.code }
//           : candidate
//       )
//     );

//     console.log("Status updated successfully:", data);
//   } catch (error) {
//     console.error("Error updating status:", error);
//     alert(error instanceof Error ? error.message : "Failed to update candidate status");
//   } finally {
//     setUpdatingStatus(null);
//   }
// };

//     const totalCount = evaluationData?.total || 0;
//   const pageCount = Math.ceil(totalCount / pagination.pageSize);

//   const isAllSelected = selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0;
//   const isSomeSelected = selectedCandidates.length > 0 && selectedCandidates.length < filteredCandidates.length;

//   const fetchStatuses = async () => {
//   setLoadingStatuses(true);
//   try {
//     const response = await fetch(
//       `${import.meta.env.VITE_API_URL}/api/v1/candidate-selection-status/`,
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       }
//     );

//     if (response.status === 401) {
//       localStorage.removeItem('token');
//       navigate('/login');
//       return;
//     }

//     if (!response.ok) {
//       throw new Error("Failed to fetch statuses");
//     }

//     const data = await response.json();
//     setStatuses(data.statuses || []);
//   } catch (error) {
//     console.error("Error fetching statuses:", error);
//   } finally {
//     setLoadingStatuses(false);
//   }
// };

// useEffect(() => {
//   fetchStatuses();
// }, []);

//   // Define table columns
// //   const columns = useMemo<ColumnDef<any>[]>(() => [
// //     // {
// //     //   id: "select",
// //     //   header: () => (
// //     //     <Checkbox
// //     //       checked={isAllSelected}
// //     //       onCheckedChange={toggleAllCandidates}
// //     //       aria-label="Select all"
// //     //     />
// //     //   ),
// //     //   cell: ({ row }) => {
// //     //     const candidateId = row.original.candidate_id;
// //     //     return (
// //     //       <Checkbox
// //     //         checked={selectedCandidates.includes(candidateId)}
// //     //         onCheckedChange={() => toggleCandidateSelection(candidateId)}
// //     //         aria-label="Select candidate"
// //     //       />
// //     //     );
// //     //   },
// //     //   enableSorting: false,
// //     //   size: 50,
// //     // },
// //     {
// //       accessorKey: "candidate_name",
// //       header: "Candidate",
// //       cell: ({ row }) => {
// //         const candidate = row.original;
// //         return (
// //           <div>
// //             <button
// //               className="font-medium text-primary underline-offset-4 underline cursor-pointer text-left"
// //               onClick={() => {
// //                 setSidebarCandidate(candidate);
// //                 setSidebarOpen(true);
// //               }}
// //             >
// //               {candidate?.candidate_name ?? `Candidate ID: ${candidate.candidate_id}`}
// //             </button>
// //             <p className="text-sm text-muted-foreground">{candidate.file_name}</p>
// //           </div>
// //         );
// //       },
// //     },
// //     {
// //       accessorKey: "final_score",
// //       header: "Overall Score",
// //       cell: ({ row }) => {
// //         const score = row.original.final_score;
// //         return (
// //           <span className={`font-medium ${getScoreColor(score)}`}>
// //             {score}%
// //           </span>
// //         );
// //       },
// //     },
// //     {
// //       accessorKey: "scored_at",
// //       header: "Scored Date",
// //       cell: ({ row }) => {
// //         const date = row.original.scored_at;
// //         return (
// //           <div className="flex items-center space-x-1">
// //             <Calendar className="w-4 h-4 text-muted-foreground" />
// //             <span className="text-sm">
// //               {date ? new Date(date).toLocaleDateString() : "N/A"}
// //             </span>
// //           </div>
// //         );
// //       },
// //     },
// //     {
// //       accessorKey: "current_status",
// //       header: "Status",
// //       cell: ({ row }) => {
// //         const status = row.original.current_status;
// //         return (
// //           <span className={`text-sm ${status ? 'font-medium text-green-600' : 'text-gray-400'}`}>
// //             {status || "Evaluated"}
// //           </span>
// //         );
// //       },
// //     },
// //   ], [selectedCandidates, isAllSelected, isSomeSelected]);


// const columns = useMemo<ColumnDef<any>[]>(() => [
//   {
//     accessorKey: "candidate_name",
//     header: "Candidate",
//     cell: ({ row }) => {
//       const candidate = row.original;
//       return (
//         <div>
//           <button
//             className="font-medium text-primary  text-left"
//             onClick={() => {
//               setSidebarCandidate(candidate);
//               setSidebarOpen(true);
//             }}
//           >
//             <span className="2 underline cursor-pointer">{candidate?.candidate_name ?? `Candidate ID: ${candidate.candidate_id}`}</span> - <span className="text-gray-500">{candidate?.email}</span>
//           </button>
//           <p className="text-sm text-muted-foreground">{candidate.file_name}</p>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "final_score",
//     header: "Overall Score",
//     cell: ({ row }) => {
//       const score = row.original.final_score;
//       return (
//         <span className={`font-medium ${getScoreColor(score)}`}>
//           {score}%
//         </span>
//       );
//     },
//   },
//   {
//     accessorKey: "scored_at",
//     header: "Scored Date",
//     cell: ({ row }) => {
//       const date = row.original.scored_at;
//       return (
//         <div className="flex items-center space-x-1">
//           <span className="text-sm">
//             {date ? new Date(date).toLocaleDateString() : "N/A"}
//           </span>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "current_status",
//     header: "Status",
//     cell: ({ row }) => {
//       const candidate = row.original;
//       const candidateId = candidate.candidate_id;
//       const currentStatus = candidate.current_status || "evaluated";
//       const isUpdating = updatingStatus === candidateId;

//       return (
//         <Select
//           value={currentStatus}
//           onValueChange={(value) => handleStatusChange(candidateId, value)}
//           disabled={loadingStatuses || isUpdating}
//         >
//           <SelectTrigger 
//             className={cn(
//               "w-full h-8",
//               isUpdating && "opacity-50 cursor-not-allowed"
//             )}
//           >
//             {isUpdating ? (
//               <div className="flex items-center space-x-2">
//                 <Loader2 className="h-3 w-3 animate-spin" />
//                 <span className="text-sm">Updating...</span>
//               </div>
//             ) : (
//               <SelectValue>
//                 {statuses.find(s => s.code === currentStatus)?.name || currentStatus}
//               </SelectValue>
//             )}
//           </SelectTrigger>
//           <SelectContent>
//             <SelectGroup>
//               {statuses.map((status) => (
//                 <SelectItem key={status.id} value={status.code}>
//                   <span className={cn(
//                     "text-sm font-medium"
//                   )}>
//                     {status.name}
//                   </span>
//                 </SelectItem>
//               ))}
//             </SelectGroup>
//           </SelectContent>
//         </Select>
//       );
//     },
//   },
// ], [statuses, loadingStatuses, updatingStatus]);

//   // Determine if we should show the table
//   const shouldShowTable = filteredCandidates.length > 0 && !loadingCandidates;
//   const showDropdowns = !personaId; // Only show dropdowns in Scenario 3
//   const handleRefresh = () => {
//     refetch()
//   }

//   return (
//     <Layout currentStep={4}>
//       <div className="max-w-7xl mx-auto space-y-8">
//         <div className="flex items-center justify-between gap-3">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">Candidate Results</h1>
//             {isFromEvaluation && (
//               <p className="text-sm text-muted-foreground mt-1">
//                 Showing results from latest evaluation
//               </p>
//             )}
//           </div>

//           <div className="flex items-center gap-4">
//             {/* {selectedCandidates.length > 0 && (
//               <>
//                 <span className="text-sm text-gray-600">
//                   {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? 's' : ''} selected
//                 </span>
//                 <Button
//                   onClick={handleSelectCandidates}
//                   disabled={selectingCandidates}
//                   className="bg-blue-500 hover:bg-blue-600 text-white"
//                   size="sm"
//                 >
//                   {selectingCandidates ? "Selecting..." : "Select Candidates"}
//                 </Button>
//               </>
//             )} */}
            
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
//         {showDropdowns ? (
//           // Scenario 3: Show dropdowns
//           <Card className="shadow-card">
//             <CardContent className="p-6">
//               <div className="grid grid-cols-3 gap-4">
//                 {/* Role Selection */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-foreground">
//                     Role <span className="text-destructive">*</span>
//                   </label>
//                   <SearchableDropdown
//                     options={roles.map(role => ({
//                       id: role.id,
//                       label: role.name,
//                       sublabel: role.description,
//                     }))}
//                     value={selectedRole}
//                     onChange={handleRoleChange}
//                     placeholder="Select a role..."
//                     searchPlaceholder="Search roles..."
//                     emptyMessage="No roles found"
//                     loading={loadingRoles}
//                     created_by={false}
//                   />
//                   {roleError && (
//                     <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-md">
//                       <div className="flex items-start space-x-2">
//                         <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
//                         <span className="text-sm text-destructive">{roleError}</span>
//                       </div>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={retryLoadRoles}
//                         disabled={loadingRoles}
//                       >
//                         Retry
//                       </Button>
//                     </div>
//                   )}
//                 </div>

//                 {/* JD Selection */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-foreground">
//                     Job Description <span className="text-destructive">*</span>
//                   </label>
//                   <SearchableDropdown
//                     options={jds.map(jd => ({
//                       id: jd.id,
//                       label: jd.title,
//                       sublabel: jd.role_name,
//                       badge: `${jd.personas?.length || 0} personas`,
//                       created_by_name: jd.created_by_name,
//                       created_at: jd.created_at
//                     }))}
//                     value={selectedJD}
//                     created_by={true}
//                     onChange={handleJDChange}
//                     placeholder={!selectedRole ? "Select a role first" : "Select a job description..."}
//                     searchPlaceholder="Search job descriptions..."
//                     emptyMessage="No job descriptions found"
//                     disabled={!selectedRole}
//                     loading={loadingJDs}
//                   />
//                   {jdError && selectedRole && (
//                     <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-md">
//                       <div className="flex items-start space-x-2">
//                         <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
//                         <span className="text-sm text-destructive">{jdError}</span>
//                       </div>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={retryLoadJDs}
//                         disabled={loadingJDs}
//                       >
//                         Retry
//                       </Button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Persona Selection */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-foreground">
//                     Persona <span className="text-destructive">*</span>
//                   </label>
//                   <SearchableDropdown
//                     options={personas.map(persona => ({
//                       id: persona.id,
//                       jd_id:persona.jd_id,
//                       label: persona.name,
//                       sublabel: persona.role_name,
//                       created_by_name: persona.created_by_name,
//                       created_at: persona.created_at
//                     }))}
//                     value={selectedPersona}
//                     onChange={handlePersonaChange}
//                     created_by={true}
//                     placeholder={!selectedJD ? "Select a JD first" : "Select a persona..."}
//                     searchPlaceholder="Search personas..."
//                     emptyMessage="No personas found"
//                     disabled={!selectedJD}
//                     loading={loadingPersonas}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ) : (
//           // Scenarios 1 & 2: Display mode
//           <Card className="shadow-card">
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-8">
//                   <div className="flex items-center gap-3">
//                     <label className="text-sm font-medium text-foreground">Role:</label>
//                     <p className="font-medium text-blue-500">{displayRole || "Loading..."}</p>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <label className="text-sm font-medium text-foreground">Persona:</label>
//                     <p className="font-medium text-blue-500">{displayPersona || "Loading..."}</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-3 items-center">
//                   {selectedCandidates.length > 0 && (
//                     <Button
//                       onClick={handleSelectCandidates}
//                       disabled={selectingCandidates}
//                       className="bg-blue-500 hover:bg-blue-600 text-white"
//                       size="sm"
//                     >
//                       {selectingCandidates ? "Selecting..." : `Select ${selectedCandidates.length > 1 ? 'Candidates' : 'Candidate'} (${selectedCandidates.length})`}
//                     </Button>
//                   )}
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => navigate('/results')}
//                   >
//                     Change Selection
//                   </Button>
//                 </div>
                
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Results Table */}
//         {shouldShowTable && (
//           <BasicTable
//             data={filteredCandidates}
//             columns={columns}
//             onRefresh={handleRefresh}
//             isLoading={loadingCandidates}
//             enableSearch={true}
//             enableSorting={true}
//             enablePagination={true}
//             enableRefresh={true}
//             initialPageSize={pagination.pageSize}
//             pageSizeOptions={[10, 20, 30, 50]}
//             searchPlaceholder="Search candidates..."
//             description={`${totalCount} candidate${totalCount !== 1 ? 's' : ''}`}
//             manualPagination={!isFromEvaluation}
//             pageCount={pageCount}
//             onPaginationChange={setPagination}
//             state={{ pagination }}
//             initialSorting={[]}
//           />
//         )}

//         {/* Loading State */}
//         {loadingCandidates && (
//           <Card className="shadow-card">
//             <CardContent className="p-12">
//               <div className="text-center">
//                 <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-foreground">Loading candidates...</h3>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Empty State */}
//         {!loadingCandidates && filteredCandidates.length === 0 && (
//           <Card className="shadow-card">
//             <CardContent className="p-12">
//               <div className="text-center">
//                 <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-foreground">No candidates found</h3>
//                 <p className="text-sm text-muted-foreground mt-2">
//                   {!selectedPersona && showDropdowns
//                     ? 'Please select a role, JD, and persona to view candidates.'
//                     : showAllCandidates 
//                       ? 'No candidates have been evaluated yet.' 
//                       : 'No candidates with 90% or higher score.'}
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {/* Error State */}
//         {evaluationError && (
//           <Card className="shadow-card">
//             <CardContent className="p-12">
//               <div className="text-center">
//                 <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-foreground">Failed to load candidates</h3>
//                 <p className="text-sm text-muted-foreground mt-2">
//                   {evaluationError instanceof Error ? evaluationError.message : 'Something went wrong'}
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

// export default UpdatedResults;