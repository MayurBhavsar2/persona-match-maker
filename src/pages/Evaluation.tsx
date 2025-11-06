import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import EvaluationSelector from "@/components/EvaluationSelector";
import { useScoreCandidates } from "@/lib/helper";
import { useToast } from "@/components/ui/use-toast";

interface EvaluationParams {
  jdId: string;
  personaId: string;
  candidateIds: string[];
}

const Evaluation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: scoreCandidates, isPending: isScoring } = useScoreCandidates();

  const handleEvaluate = async (params: EvaluationParams) => {
    try {
      // First, fetch the candidates data
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/candidate/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch candidates");

      const data = await response.json();
      const allCandidates = data.candidates || data || [];
      
      // Filter candidates based on selected IDs
      const selectedCandidates = allCandidates.filter((candidate: any) => 
        params.candidateIds.includes(candidate.id)
      );

      if (selectedCandidates.length === 0) {
        toast({
          title: "No candidates found",
          description: "Could not find the selected candidates.",
          variant: "destructive",
        });
        return;
      }

      // Start the scoring process
      scoreCandidates(
        { 
          candidates: selectedCandidates, 
          persona_id: params.personaId 
        },
        {
          onSuccess: (results) => {
            console.log('Evaluation completed:', results);
            // Navigation to results is handled by the hook
          },
          onError: (error) => {
            console.error('Evaluation failed:', error);
          }
        }
      );

    } catch (error) {
      console.error("Error starting evaluation:", error);
      toast({
        title: "Error starting evaluation",
        description: "Could not start the evaluation process. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <Layout currentStep={3}>
      <div className="max-w-7xl mx-auto py-6">
        <EvaluationSelector 
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