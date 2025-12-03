import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import EvaluationSelector from "@/components/EvaluationSelector";
import { useScoreCandidates } from "@/lib/hooks";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { CandidateOption } from "@/lib/types";

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
  created_at: string;
}

interface FlowModePersona {
  id: string;
  name: string;
}

const Evaluation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { mutate: scoreCandidates, isPending: isScoring } = useScoreCandidates();
  
  // Detect mode based on route
  const mode: 'start' | 'flow' = location.pathname === '/evaluation/flow' ? 'flow' : 'start';
  
  // State for flow mode pre-selected data
  const [preselectedJD, setPreselectedJD] = useState<FlowModeJD | null>(null);
  const [preselectedPersona, setPreselectedPersona] = useState<FlowModePersona | null>(null);
  
  // Load pre-selected data from localStorage for flow mode
  useEffect(() => {
    if (mode === 'flow') {
      try {
        // Read JD data from localStorage
        const jdData = localStorage.getItem('evaluation_flow_jd');
        if (jdData) {
          const parsedJD = JSON.parse(jdData);
          // Validate data format
          if (parsedJD && parsedJD.id && parsedJD.title) {
            setPreselectedJD(parsedJD);
          } else {
            console.error('Invalid JD data format in localStorage');
            toast({
              title: "Missing JD Data",
              description: "Please select a Job Description first.",
              variant: "destructive",
            });
            navigate('/jd/list');
            return;
          }
        } else {
          toast({
            title: "Missing JD Data",
            description: "Please select a Job Description first.",
            variant: "destructive",
          });
          navigate('/jd/list');
          return;
        }
        
        // Read persona data from localStorage
        const personaData = localStorage.getItem('evaluation_flow_persona');
        if (personaData) {
          const parsedPersona = JSON.parse(personaData);
          // Validate data format
          if (parsedPersona && parsedPersona.id && parsedPersona.name) {
            setPreselectedPersona(parsedPersona);
          } else {
            console.error('Invalid persona data format in localStorage');
            toast({
              title: "Missing Persona Data",
              description: "Please select a Persona first.",
              variant: "destructive",
            });
            navigate('/persona/list');
            return;
          }
        } else {
          toast({
            title: "Missing Persona Data",
            description: "Please select a Persona first.",
            variant: "destructive",
          });
          navigate('/persona/list');
          return;
        }
      } catch (error) {
        console.error('Error reading localStorage data:', error);
        toast({
          title: "Error Loading Data",
          description: "Could not load pre-selected data. Please try again.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    }
  }, [mode, navigate, toast]);

  // const handleEvaluate = async (params: EvaluationParams) => {
  //   try {
  //     // Fetch all candidates to get their full data including CV information
  //     let allCandidates: any[] = [];
  //     let page = 1;
  //     let hasMore = true;

  //     // Fetch all pages of candidates
  //     while (hasMore) {
  //       const response = await fetch(
  //         `${import.meta.env.VITE_API_URL}/api/v1/candidate/?page=${page}&size=50`,
  //         {
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           },
  //         }
  //       );

  //       // Handle 401 errors with redirect to login
  //       if (response.status === 401) {
  //         localStorage.removeItem('token');
  //         toast({
  //           title: "Session Expired",
  //           description: "Please login again to continue.",
  //           variant: "destructive",
  //         });
  //         navigate('/login');
  //         return;
  //       }

  //       if (!response.ok) {
  //         const errorData = await response.json().catch(() => ({}));
  //         throw new Error(errorData.message || "Failed to fetch candidates");
  //       }

  //       const data = await response.json();
  //       allCandidates.push(...(data.candidates || []));
  //       hasMore = data.has_next || false;
  //       page++;
  //     }
      
  //     // Filter candidates based on selected IDs
  //     const selectedCandidates = allCandidates.filter((candidate: any) => 
  //       params.candidateIds.includes(candidate.id)
  //     );

  //     if (selectedCandidates.length === 0) {
  //       toast({
  //         title: "No candidates found",
  //         description: "Could not find the selected candidates.",
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     // Transform candidates to UploadedCandidate format expected by useScoreCandidates
  //     const uploadedCandidates = selectedCandidates.map((candidate: any) => {
  //       // Get the most recent CV for each candidate
  //       const cvs = candidate.cvs || [];
  //       const latestCv = Array.isArray(cvs) && cvs.length > 0 ? cvs[0] : null;
        
  //       return {
  //         candidate_id: candidate.id,
  //         cv_id: latestCv?.id || candidate.id, // Fallback to candidate ID if no CV
  //         file_name: latestCv?.original_document_filename || candidate.full_name || 'Unknown',
  //         file_hash: latestCv?.file_hash || '',
  //         version: latestCv?.version || 1,
  //         s3_url: latestCv?.s3_url || '',
  //         status: 'success' as const,
  //         is_new_candidate: false,
  //         is_new_cv: false,
  //         cv_text: latestCv?.cv_text || '',
  //       };
  //     });

  //     // Start the scoring process
  //     scoreCandidates(
  //       { 
  //         candidates: uploadedCandidates, 
  //         persona_id: params.personaId 
  //       },
  //       {
  //         onSuccess: (results) => {
  //           console.log('Evaluation completed:', results);
  //           // Navigation to results is handled by the hook
  //         },
  //         onError: (error) => {
  //           console.error('Evaluation failed:', error);
  //           const errorMessage = error instanceof Error ? error.message : "Evaluation failed. Please try again.";
  //           toast({
  //             title: "Evaluation Failed",
  //             description: errorMessage,
  //             variant: "destructive",
  //           });
  //         }
  //       }
  //     );

  //   } catch (error) {
  //     const errorMessage = error instanceof Error ? error.message : "Could not start the evaluation process. Please try again.";
  //     console.error("Error starting evaluation:", error);
  //     toast({
  //       title: "Error starting evaluation",
  //       description: errorMessage,
  //       variant: "destructive",
  //     });
  //   }
  // };


  const handleEvaluate = async (params: EvaluationParams) => {
    try {
      const { personaId, candidates } = params;

      if (!candidates.length) {
        toast({
          title: "No candidates selected",
          description: "Please select at least one candidate to evaluate.",
          variant: "destructive",
        });
        return;
      }

      // Call the scoring hook directly with CandidateOption[]
      // The hook will extract cv_id from latest_cv_id or cvs array
      scoreCandidates(
        {
          candidates,
          persona_id: personaId,
        },
        {
          onSuccess: (results) => {
            console.log("Evaluation completed:", results);
          },
          onError: (error) => {
            console.error("Evaluation failed:", error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Evaluation failed. Please try again.";
            toast({
              title: "Evaluation Failed",
              description: errorMessage,
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Could not start the evaluation process. Please try again.";
      console.error("Error starting evaluation:", error);
      toast({
        title: "Error starting evaluation",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <Layout currentStep={mode === "start" ? undefined: 3}>
      <div className="max-w-7xl mx-auto py-6">
        <EvaluationSelector 
          mode={mode}
          preselectedJD={preselectedJD}
          preselectedPersona={preselectedPersona}
          onEvaluate={handleEvaluate}
          onCancel={handleCancel}
        />
        
        {isScoring && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <div>
                  <h3 className="font-medium">Evaluating Candidates</h3>
                  <p className="text-sm text-muted-foreground">
                    This may take a few minutes to complete...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Evaluation;