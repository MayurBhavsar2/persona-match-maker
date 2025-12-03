import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface ScoreResponse {
  score_id?: string;
  id?: string;
  candidate_id: string;
  persona_id: string;
  final_score: number;
  final_decision: string;
  pipeline_stage_reached: number;
  candidate_name: string;
  file_name: string;
  persona_name: string;
  role_name: string;
  current_status?: string;
  scored_at?: string;
}

interface CandidateOption {
  id: string;
  full_name?: string;
  latest_cv_id?: string;
  cvs?: Array<{ id: string }>;
}

interface EvaluationData {
  scores: ScoreResponse[];
  persona_id: string;
  timestamp: number;
  candidateIds: string[];
  total?: number;
  page?: number;
  size?: number;
}

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// Hook to fetch all scores for a persona (Scenarios 2 & 3)
export const usePersonaScores = (
  personaId: string | undefined,
  page: number = 1,
  size: number = 10,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['personaScores', personaId, page, size],
    queryFn: async (): Promise<EvaluationData> => {
      if (!personaId) throw new Error('Persona ID is required');

      const response = await axios.get(
        `${API_URL}/api/v1/candidate/scores?persona_id=${personaId}&page=${page}&size=${size}`,
        { headers: getHeaders() }
      );

      return {
        scores: response.data?.scores || [],
        persona_id: personaId,
        timestamp: Date.now(),
        candidateIds: (response.data?.scores || []).map((s: ScoreResponse) => s.candidate_id),
        total: response.data?.total,
        page: response.data?.page,
        size: response.data?.size,
      };
    },
    enabled: !!personaId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook to score candidates and navigate (Scenario 1)
export const useScoreCandidates = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  return useMutation({
    mutationKey: ['scoreCandidates'],
    mutationFn: async ({
      candidates,
      persona_id,
    }: {
      candidates: CandidateOption[];
      persona_id: string;
    }) => {
      if (useMockData) {
        const { scoreWithAi } = await import('@/SampleResultEvaluationResponse');
        return [scoreWithAi] as ScoreResponse[];
      }

      const results: ScoreResponse[] = [];
      const errors: string[] = [];

      for (const candidate of candidates) {
        const cvId =
          candidate.latest_cv_id ??
          candidate.cvs?.[0]?.id ??
          null;

        if (!cvId) {
          errors.push(`No CV found for ${candidate.full_name || candidate.id}`);
          continue;
        }

        try {
          const url =
            `${API_URL}/api/v1/candidate/score-with-ai` +
            `?candidate_id=${candidate.id}` +
            `&persona_id=${persona_id}` +
            `&cv_id=${cvId}` +
            `&force_rescore=false`;

          const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(),
          });

          const data = await response.json();

          if (!response.ok) {
            errors.push(`Failed to score ${candidate.full_name || candidate.id}: ${data.message}`);
            continue;
          }

          results.push(data);
        } catch (error) {
          errors.push(`Error scoring ${candidate.full_name || candidate.id}`);
        }
      }

      if (errors.length > 0) {
        console.error('Scoring errors:', errors);
      }

      return results;
    },
    onSuccess: (scores, variables) => {
      const { persona_id } = variables;

      // Create a unique timestamp for this evaluation session
      const evaluationTimestamp = Date.now();
      const candidateIds = scores.map(s => s.candidate_id);

      // CRITICAL: Clear ALL previous evaluation sessions for this persona
      // This ensures old session data doesn't interfere
      const queryCache = queryClient.getQueryCache();
      const allQueries = queryCache.getAll();
      
      allQueries.forEach(query => {
        const key = query.queryKey;
        if (
          Array.isArray(key) && 
          key[0] === 'evaluationSession' && 
          key[1] === persona_id
        ) {
          queryClient.removeQueries({ queryKey: key, exact: true });
        }
      });

      const evaluationData: EvaluationData = {
        scores,
        persona_id,
        timestamp: evaluationTimestamp,
        candidateIds,
        total: scores.length,
        page: 1,
        size: scores.length,
      };

      // Store the new evaluation session with timestamp key
      queryClient.setQueryData(
        ['evaluationSession', persona_id, evaluationTimestamp], 
        evaluationData
      );

      // Invalidate the main persona scores to refetch on next view
      queryClient.invalidateQueries({ queryKey: ['personaScores', persona_id] });

      toast({
        title: 'Evaluation completed',
        description: `${scores.length} candidate${scores.length !== 1 ? 's' : ''} evaluated successfully.`,
      });

      // Navigate with evaluation session identifier
      navigate(`/results/${persona_id}`, {
        replace: true,
        state: { 
          fromEvaluation: true,
          evaluationSessionKey: evaluationTimestamp,
          candidateIds
        }
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Evaluation failed',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });
};

// Combined hook for the Results component with pagination
export const useEvaluationResults = (
  personaId: string | undefined,
  fromEvaluation: boolean,
  page: number = 1,
  size: number = 10,
  evaluationSessionKey?: number,
  candidateIds?: string[]
) => {
  const queryClient = useQueryClient();

  // Check for session data first (Scenario 1)
  const sessionData = useMemo(() => {
    if (fromEvaluation && evaluationSessionKey && personaId) {
      const data = queryClient.getQueryData<EvaluationData>([
        'evaluationSession',
        personaId,
        evaluationSessionKey,
      ]);
      
      console.log('Session data lookup:', {
        key: ['evaluationSession', personaId, evaluationSessionKey],
        found: !!data,
        candidateIds: data?.candidateIds,
        scoresCount: data?.scores?.length
      });
      
      // Validate that session data matches expected candidateIds
      if (data && candidateIds) {
        const sessionCandidateIds = new Set(data.candidateIds);
        const expectedCandidateIds = new Set(candidateIds);
        const isMatch = 
          sessionCandidateIds.size === expectedCandidateIds.size &&
          [...expectedCandidateIds].every(id => sessionCandidateIds.has(id));
        
        if (!isMatch) {
          console.warn('Session data mismatch, will fetch from API');
          return null;
        }
      }
      
      return data;
    }
    return null;
  }, [fromEvaluation, evaluationSessionKey, personaId, candidateIds, queryClient]);

  // CRITICAL: Only enable API fetch if we don't have session data
  const shouldFetchFromAPI = !sessionData;

  console.log('useEvaluationResults config:', {
    fromEvaluation,
    hasSessionData: !!sessionData,
    shouldFetchFromAPI,
    evaluationSessionKey,
    personaId,
    candidateIds
  });

  // Get the query result - but it's disabled when we have session data
  const { data: apiData, isLoading, error, refetch } = usePersonaScores(
    personaId, 
    page, 
    size,
    shouldFetchFromAPI // This prevents the API call when we have session data
  );

  // Scenario 1: Return session data if available
  if (sessionData) {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedScores = sessionData.scores.slice(startIndex, endIndex);

    const sessionRefetch = async () => {
      // Clear session data and fetch from API
      queryClient.removeQueries({ 
        queryKey: ['evaluationSession', personaId, evaluationSessionKey],
        exact: true
      });
      await queryClient.invalidateQueries({ 
        queryKey: ['personaScores', personaId] 
      });
      return refetch();
    };

    return {
      data: {
        ...sessionData,
        scores: paginatedScores,
        page,
        size,
        total: sessionData.scores.length,
      },
      isLoading: false,
      error: null,
      isFromEvaluation: true,
      refetch: sessionRefetch,
    };
  }

  // Scenario 1 (fallback): Filter by candidateIds if session data not found
  if (fromEvaluation && candidateIds && apiData) {
    const filteredScores = apiData.scores.filter(score =>
      candidateIds.includes(score.candidate_id)
    );

    return {
      data: {
        ...apiData,
        scores: filteredScores,
        total: filteredScores.length,
      },
      isLoading,
      error,
      isFromEvaluation: true,
      refetch,
    };
  }

  // Scenarios 2 & 3: Return API data
  return {
    data: apiData,
    isLoading,
    error,
    isFromEvaluation: false,
    refetch,
  };
};


// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useNavigate } from 'react-router-dom';
// import { useToast } from '@/components/ui/use-toast';
// import axios from 'axios';
// import { useMemo } from 'react';

// const API_URL = import.meta.env.VITE_API_URL;

// interface ScoreResponse {
//   score_id?: string;
//   id?: string;
//   candidate_id: string;
//   persona_id: string;
//   final_score: number;
//   final_decision: string;
//   pipeline_stage_reached: number;
//   candidate_name: string;
//   file_name: string;
//   persona_name: string;
//   role_name: string;
//   current_status?: string;
//   scored_at?: string;
// }

// interface CandidateOption {
//   id: string;
//   full_name?: string;
//   latest_cv_id?: string;
//   cvs?: Array<{ id: string }>;
// }

// interface EvaluationData {
//   scores: ScoreResponse[];
//   persona_id: string;
//   timestamp: number;
//   total?: number;
//   page?: number;
//   size?: number;
// }

// const getHeaders = () => ({
//   'Content-Type': 'application/json',
//   Authorization: `Bearer ${localStorage.getItem('token')}`,
// });

// // Hook to fetch all scores for a persona (Scenarios 2 & 3)

// export const usePersonaScores = (
//   personaId: string | undefined,
//   page: number = 1,
//   size: number = 10
// ) => {
//   return useQuery({
//     queryKey: ['personaScores', personaId, page, size],
//     queryFn: async (): Promise<EvaluationData> => {
//       if (!personaId) throw new Error('Persona ID is required');

//       const response = await axios.get(
//         `${API_URL}/api/v1/candidate/scores?persona_id=${personaId}&page=${page}&size=${size}`,
//         { headers: getHeaders() }
//       );

//       return {
//         scores: response.data?.scores || [],
//         persona_id: personaId,
//         timestamp: Date.now(),
//         total: response.data?.total,
//         page: response.data?.page,
//         size: response.data?.size,
//       };
//     },
//     enabled: !!personaId,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 30 * 60 * 1000, // 30 minutes
//   });
// };

// // export const usePersonaScores = (personaId: string | undefined) => {
// //   return useQuery({
// //     queryKey: ['personaScores', personaId],
// //     queryFn: async (): Promise<EvaluationData> => {
// //       if (!personaId) throw new Error('Persona ID is required');

// //       const response = await axios.get(
// //         `${API_URL}/api/v1/candidate/scores?persona_id=${personaId}`,
// //         { headers: getHeaders() }
// //       );

// //       return {
// //         scores: response.data?.scores || [],
// //         persona_id: personaId,
// //         timestamp: Date.now(),
// //         total: response.data?.total,
// //         page: response.data?.page,
// //         size: response.data?.size,
// //       };
// //     },
// //     enabled: !!personaId,
// //     staleTime: 5 * 60 * 1000, // 5 minutes
// //     gcTime: 30 * 60 * 1000, // 30 minutes
// //   });
// // };

// // Hook to score candidates and navigate (Scenario 1)
// export const useScoreCandidates = () => {
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

//   return useMutation({
//     mutationKey: ['scoreCandidates'],
//     mutationFn: async ({
//       candidates,
//       persona_id,
//     }: {
//       candidates: CandidateOption[];
//       persona_id: string;
//     }) => {
//       if (useMockData) {
//         const { scoreWithAi } = await import('@/SampleResultEvaluationResponse');
//         return [scoreWithAi] as ScoreResponse[];
//       }

//       const results: ScoreResponse[] = [];
//       const errors: string[] = [];

//       for (const candidate of candidates) {
//         const cvId =
//           candidate.latest_cv_id ??
//           candidate.cvs?.[0]?.id ??
//           null;

//         if (!cvId) {
//           errors.push(`No CV found for ${candidate.full_name || candidate.id}`);
//           continue;
//         }

//         try {
//           const url =
//             `${API_URL}/api/v1/candidate/score-with-ai` +
//             `?candidate_id=${candidate.id}` +
//             `&persona_id=${persona_id}` +
//             `&cv_id=${cvId}` +
//             `&force_rescore=false`;

//           const response = await fetch(url, {
//             method: 'POST',
//             headers: getHeaders(),
//           });

//           const data = await response.json();

//           if (!response.ok) {
//             errors.push(`Failed to score ${candidate.full_name || candidate.id}: ${data.message}`);
//             continue;
//           }

//           results.push(data);
//         } catch (error) {
//           errors.push(`Error scoring ${candidate.full_name || candidate.id}`);
//         }
//       }

//       if (errors.length > 0) {
//         console.error('Scoring errors:', errors);
//       }

//       return results;
//     },
//     onSuccess: (scores, variables) => {
//       const { persona_id } = variables;

//       // Create a unique key for this specific evaluation session
//       const evaluationSessionKey = ['evaluationSession', persona_id, Date.now()];

//       const evaluationData = {
//         scores,
//         persona_id,
//         timestamp: Date.now(),
//       };

//       // Store the new evaluation session separately
//       queryClient.setQueryData(evaluationSessionKey, evaluationData);

//       // Invalidate the main persona scores to refetch on next view
//       queryClient.invalidateQueries({ queryKey: ['personaScores', persona_id] });

//       toast({
//         title: 'Evaluation completed',
//         description: `${scores.length} candidate${scores.length !== 1 ? 's' : ''} evaluated successfully.`,
//       });

//       // Navigate with evaluation session identifier
//       navigate(`/results/${persona_id}`, {
//         replace: true,
//         state: { 
//           fromEvaluation: true,
//           evaluationSessionKey: evaluationSessionKey[2], // timestamp
//           candidateIds: scores.map(s => s.candidate_id)
//         }
//       });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: 'Evaluation failed',
//         description: error.message || 'Something went wrong.',
//         variant: 'destructive',
//       });
//     },
//   });
// };

// export const useEvaluationResults = (
//   personaId: string | undefined,
//   fromEvaluation: boolean,
//   page: number = 1,
//   size: number = 10,
//   evaluationSessionKey?: number,
//   candidateIds?: string[]
// ) => {
//   const queryClient = useQueryClient();

//   // Scenario 1: Coming from evaluation screen with fresh scores
//   // Check session data FIRST before making any API calls
//   const sessionData = useMemo(() => {
//     if (fromEvaluation && evaluationSessionKey && personaId) {
//       return queryClient.getQueryData<EvaluationData>([
//         'evaluationSession',
//         personaId,
//         evaluationSessionKey,
//       ]);
//     }
//     return null;
//   }, [fromEvaluation, evaluationSessionKey, personaId, queryClient]);

//   // Only enable the API query if we're NOT using session data
//   const shouldFetchFromAPI = !sessionData;

//   // Get the query result for scenarios 2 & 3
//   const { data, isLoading, error, refetch } = usePersonaScores(
//     personaId, 
//     page, 
//     size,
//     shouldFetchFromAPI // Pass this as an additional parameter
//   );

//   // Return session data for Scenario 1
//   if (sessionData) {
//     // For session data, handle pagination client-side
//     const startIndex = (page - 1) * size;
//     const endIndex = startIndex + size;
//     const paginatedScores = sessionData.scores.slice(startIndex, endIndex);

//     // Create a stable refetch function
//     const sessionRefetch = async () => {
//       await queryClient.invalidateQueries({ 
//         queryKey: ['personaScores', personaId] 
//       });
//       // Switch to server-side data after refresh
//       return refetch();
//     };

//     return {
//       data: {
//         ...sessionData,
//         scores: paginatedScores,
//         page,
//         size,
//         total: sessionData.scores.length,
//       },
//       isLoading: false,
//       error: null,
//       isFromEvaluation: true,
//       refetch: sessionRefetch,
//     };
//   }

//   // Scenario 1 (fallback): If coming from evaluation but session data not found, 
//   // filter by candidateIds from the fetched data
//   if (fromEvaluation && candidateIds && data) {
//     const filteredScores = data.scores.filter(score =>
//       candidateIds.includes(score.candidate_id)
//     );

//     return {
//       data: {
//         ...data,
//         scores: filteredScores,
//         total: filteredScores.length,
//       },
//       isLoading,
//       error,
//       isFromEvaluation: true,
//       refetch,
//     };
//   }

//   // Scenarios 2 & 3: Fetch all scores for persona (server-side pagination)
//   return {
//     data,
//     isLoading,
//     error,
//     isFromEvaluation: false,
//     refetch,
//   };
// };

// /*Working but scenario 1 exception */
// // export const useEvaluationResults = (
// //   personaId: string | undefined,
// //   fromEvaluation: boolean,
// //   page: number = 1,
// //   size: number = 10,
// //   evaluationSessionKey?: number,
// //   candidateIds?: string[]
// // ) => {
// //   const queryClient = useQueryClient();

// //   // Get the query result first to always have access to refetch
// //   const { data, isLoading, error, refetch } = usePersonaScores(personaId, page, size);

// //   // Scenario 1: Coming from evaluation screen with fresh scores
// //   if (fromEvaluation && evaluationSessionKey) {
// //     const sessionData = queryClient.getQueryData<EvaluationData>([
// //       'evaluationSession',
// //       personaId,
// //       evaluationSessionKey,
// //     ]);

// //     if (sessionData) {
// //       // For session data, handle pagination client-side
// //       const startIndex = (page - 1) * size;
// //       const endIndex = startIndex + size;
// //       const paginatedScores = sessionData.scores.slice(startIndex, endIndex);

// //       return {
// //         data: {
// //           ...sessionData,
// //           scores: paginatedScores,
// //           page,
// //           size,
// //           total: sessionData.scores.length,
// //         },
// //         isLoading: false,
// //         error: null,
// //         isFromEvaluation: true,
// //         refetch,
// //       };
// //     }
// //   }

// //   // If coming from evaluation but session data not found, filter by candidateIds
// //   if (fromEvaluation && candidateIds && data) {
// //     const filteredScores = data.scores.filter(score =>
// //       candidateIds.includes(score.candidate_id)
// //     );

// //     return {
// //       data: {
// //         ...data,
// //         scores: filteredScores,
// //         total: filteredScores.length,
// //       },
// //       isLoading,
// //       error,
// //       isFromEvaluation: true,
// //       refetch,
// //     };
// //   }

// //   // Scenarios 2 & 3: Fetch all scores for persona (server-side pagination)
// //   return {
// //     data,
// //     isLoading,
// //     error,
// //     isFromEvaluation: false,
// //     refetch,
// //   };
// // };

// // Combined hook for the Results component
// // export const useEvaluationResults = (
// //   personaId: string | undefined,
// //   fromEvaluation: boolean,
// //   evaluationSessionKey?: number,
// //   candidateIds?: string[]
// // ) => {
// //   const queryClient = useQueryClient();

// //   // Get the query result first to always have access to refetch
// //   const { data, isLoading, error, refetch } = usePersonaScores(personaId);

// //   // Scenario 1: Coming from evaluation screen with fresh scores
// //   if (fromEvaluation && evaluationSessionKey) {
// //     const sessionData = queryClient.getQueryData<EvaluationData>([
// //       'evaluationSession',
// //       personaId,
// //       evaluationSessionKey,
// //     ]);

// //     if (sessionData) {
// //       return {
// //         data: sessionData,
// //         isLoading: false,
// //         error: null,
// //         isFromEvaluation: true,
// //         refetch, // Include refetch here
// //       };
// //     }
// //   }

// //   // If coming from evaluation but session data not found, filter by candidateIds
// //   if (fromEvaluation && candidateIds && data) {
// //     const filteredScores = data.scores.filter(score =>
// //       candidateIds.includes(score.candidate_id)
// //     );

// //     return {
// //       data: {
// //         ...data,
// //         scores: filteredScores,
// //       },
// //       isLoading,
// //       error,
// //       isFromEvaluation: true,
// //       refetch, // Include refetch here
// //     };
// //   }

// //   // Scenarios 2 & 3: Fetch all scores for persona
// //   return {
// //     data,
// //     isLoading,
// //     error,
// //     isFromEvaluation: false,
// //     refetch, // Include refetch here
// //   };
// // };