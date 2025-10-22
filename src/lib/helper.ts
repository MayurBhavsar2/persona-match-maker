// types/candidate.ts
export interface UploadedCandidate {
    candidate_id: string;
    cv_id: string;
    file_name: string;
    file_hash: string;
    version: number;
    s3_url: string;
    status: 'success' | 'duplicate' | 'error';
    is_new_candidate: boolean;
    is_new_cv: boolean;
    cv_text: string;
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
  
  export interface CandidateWithScore extends UploadedCandidate {
    score?: ScoreResponse;
  }
  
  // hooks/useCandidateOperations.ts
  import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
  import { useNavigate } from 'react-router-dom';
  import { useToast } from '@/components/ui/use-toast';
  
  const API_URL = import.meta.env.VITE_API_URL;
  
  // Upload candidates
  export const useUploadCandidates = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
  
    return useMutation({
      mutationFn: async (files: File[]) => {
        const formData = new FormData();
        files.forEach(file => formData.append("files", file));
  
        const response = await fetch(`${API_URL}/api/v1/candidate/upload`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Upload failed");
        }
  
        const data: UploadedCandidate[] = await response.json();
        return data;
      },
      onSuccess: (data) => {
        // Store in React Query cache
        queryClient.setQueryData(['uploadedCandidates'], data);
        
        const hasDuplicates = data.some(c => c.status === 'duplicate');
        if (hasDuplicates) {
          toast({
            title: "Duplicate CVs found",
            description: "Some CVs are duplicates and already exist in the system.",
            variant: "destructive",
          });
        }
      },
      onError: (error: Error) => {
        toast({
          title: "Upload failed",
          description: error.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    });
  };
  
  // Score candidates
  export const useScoreCandidates = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { toast } = useToast();
  
    return useMutation({
      mutationFn: async ({ 
        candidates, 
        persona_id 
      }: { 
        candidates: UploadedCandidate[], 
        persona_id: string 
      }) => {
        const results: ScoreResponse[] = [];
  
        for (const candidate of candidates) {
          const url = `${API_URL}/api/v1/candidate/score-with-ai?candidate_id=${candidate.candidate_id}&persona_id=${persona_id}&cv_id=${candidate.cv_id}&force_rescore=false`;
  
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
  
          const data = await response.json();
  
          if (!response.ok) {
            console.error(`Failed to score ${candidate.file_name}:`, data.message);
            continue;
          }
  
          results.push(data);
        }
  
        return results;
      },
      onSuccess: (scores, variables) => {
        // Get uploaded candidates from cache
        const uploadedCandidates = queryClient.getQueryData<UploadedCandidate[]>(['uploadedCandidates']);
        
        if (uploadedCandidates) {
          // Merge candidates with their scores
          const candidatesWithScores: CandidateWithScore[] = uploadedCandidates.map(candidate => {
            const score = scores.find(s => s.candidate_id === candidate.candidate_id);
            return { ...candidate, score };
          });
  
          // Store merged data in cache
          queryClient.setQueryData(['evaluatedCandidates'], {
            candidates: candidatesWithScores,
            scores,
            timestamp: Date.now()
          });
        }
  
        toast({
          title: "Evaluation completed",
          description: `${scores.length} candidates have been evaluated successfully.`,
        });
  
        // Navigate after short delay
        setTimeout(() => {
          navigate("/results");
        }, 1500);
      },
      onError: (error: Error) => {
        toast({
          title: "Evaluation failed",
          description: error.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    });
  };
  
  // Get uploaded candidates from cache
  export const useUploadedCandidates = () => {
    return useQuery<UploadedCandidate[]>({
      queryKey: ['uploadedCandidates'],
      queryFn: () => {
        // This will return data from cache if available
        // If not in cache, you could fetch from localStorage as fallback
        const cached = localStorage.getItem('candidateCvInfo');
        return cached ? JSON.parse(cached) : [];
      },
      staleTime: Infinity, // Data doesn't go stale during session
    });
  };
  
  // Get evaluated candidates from cache
  export const useEvaluatedCandidates = () => {
    return useQuery<{
      candidates: CandidateWithScore[];
      scores: ScoreResponse[];
      timestamp: number;
    }>({
      queryKey: ['evaluatedCandidates'],
      queryFn: () => {
        // Fallback to localStorage if not in cache
        const cached = localStorage.getItem('evaluatedCandidates');
        return cached ? JSON.parse(cached) : null;
      },
      staleTime: Infinity,
    });
  };