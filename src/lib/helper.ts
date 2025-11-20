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

// types/jd.ts
export interface JDOption {
  id: string;
  title: string;
  role_name: string;
  persona_count: number;
}

// types/persona.ts
export interface PersonaOption {
  id: string;
  name: string;
  jd_id: string;
  role_name: string;
}

// types/role.ts
export interface RoleOption {
  id: string;
  name: string;
  description?: string;
}

interface JDListResponse {
  jds: Array<{
    id: string;
    title: string;
    company_id: string | null;
    created_at: string;
    created_by: string;
    created_by_name: string;
    document_character_count: string;
    document_word_count: string;
    notes: string | null;
    original_document_extension: string;
    original_document_filename: string;
    original_document_size: string;
    personas: Array<{
      persona_id: string;
      persona_name: string;
    }>;
    role_id: string;
    role_name: string;
    selected_edited: boolean;
    selected_version: string;
    tags: string[];
    updated_at: string;
    updated_by: string;
    updated_by_name: string;
  }>;
  has_next: boolean;
  has_prev: boolean;
  page: number;
  size: number;
  total: number;
}

interface PersonaListResponse {
  personas: Array<{
    id: string;
    name: string;
    job_description_id: string;
    role_name: string;
    created_at: string;
    created_by: string;
    created_by_name: string;
    updated_at: string;
    updated_by: string;
    updated_by_name: string;
  }>;
  has_next: boolean;
  has_prev: boolean;
  page: number;
  size: number;
  total: number;
}

export interface ScoreResponse {
  score_id: string;
  candidate_id: string;
  persona_id: string;
  final_score: number;
  final_decision: string;
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
// export const useUploadCandidates = () => {
//   const queryClient = useQueryClient();
//   const { toast } = useToast();

//   return useMutation({
//     mutationFn: async (files: File[]) => {
//       const formData = new FormData();
//       files.forEach(file => formData.append("files", file));

//       const response = await fetch(`${API_URL}/api/v1/candidate/upload`, {
//         method: "POST",
//         body: formData,
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || "Upload failed");
//       }

//       const data: UploadedCandidate[] = await response.json();
//       return data;
//     },
//     onSuccess: (data) => {
//       // Store in React Query cache
//       queryClient.setQueryData(['uploadedCandidates'], data);

//       const hasDuplicates = data.some(c => c.status === 'duplicate');
//       if (hasDuplicates) {
//         toast({
//           title: "Duplicate CVs found",
//           description: "Some CVs are duplicates and already exist in the system.",
//           variant: "destructive",
//         });
//       }
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Upload failed",
//         description: error.message || "Something went wrong.",
//         variant: "destructive",
//       });
//     }
//   });
// };

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
      const newCandidates = data.filter(c => c.status !== 'duplicate');
      const duplicateCount = data.filter(c => c.status === 'duplicate').length;

      if (hasDuplicates && newCandidates.length === 0) {
        // All files are duplicates
        toast({
          title: "All CVs are duplicates",
          description: "All uploaded CVs already exist in the system. You can still proceed with evaluation.",
          variant: "default", // Changed from "destructive"
        });
      } else if (hasDuplicates) {
        // Some files are duplicates
        toast({
          title: "Some CVs are duplicates",
          description: `${duplicateCount} CV(s) already exist in the system. ${newCandidates.length} new CV(s) uploaded successfully.`,
          variant: "default", // Changed from "destructive"
        });
      } else {
        // All new files
        toast({
          title: "Upload successful",
          description: `${data.length} CV(s) uploaded successfully.`,
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
// export const useScoreCandidates = () => {
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const useMockData = true;
//   return useMutation({mutationFn: async ({ candidates, persona_id,}: {candidates: UploadedCandidate[],persona_id: string}) => {

//       if (useMockData) {
//       const { scoreWithAi } = await import('@/SampleResultEvaluationResponse');
//       return [scoreWithAi];
//     }

//       const results: ScoreResponse[] = [];

//       for (const candidate of candidates) {
//         const url = `${API_URL}/api/v1/candidate/score-with-ai?candidate_id=${candidate.candidate_id}&persona_id=${persona_id}&cv_id=${candidate.cv_id}&force_rescore=false`;

//         const response = await fetch(url, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });

//         const data = await response.json();

//         if (!response.ok) {
//           console.error(`Failed to score ${candidate.file_name}:`, data.message);
//           continue;
//         }

//         results.push(data);
//       }

//       return results;
//     },
//     onSuccess: (scores, variables) => {
//       // Get uploaded candidates from cache
//       const uploadedCandidates = queryClient.getQueryData<UploadedCandidate[]>(['uploadedCandidates']);

//       if (uploadedCandidates) {
//         // Merge candidates with their scores
//         const candidatesWithScores: CandidateWithScore[] = uploadedCandidates.map(candidate => {
//           const score = scores.find(s => s.candidate_id === candidate.candidate_id);
//           return { ...candidate, score };
//         });

//         // Store merged data in cache
//         queryClient.setQueryData(['evaluatedCandidates'], {
//           candidates: candidatesWithScores,
//           scores,
//           timestamp: Date.now()
//         });
//       }

//       toast({
//         title: "Evaluation completed",
//         description: `${scores.length} candidates have been evaluated successfully.`,
//       });

//       // Navigate after short delay
//       setTimeout(() => {
//         navigate("/results");
//       }, 500);
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Evaluation failed",
//         description: error.message || "Something went wrong.",
//         variant: "destructive",
//       });
//     }
//   });
// };

//Updated useScoreCandidates function

export const useScoreCandidates = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  return useMutation({
    mutationKey: ['scoreCandidates'],
    mutationFn: async ({ candidates, persona_id }: {
      candidates: UploadedCandidate[],
      persona_id: string
    }) => {
      if (useMockData) {
        const { scoreWithAi } = await import('@/SampleResultEvaluationResponse');
        return [scoreWithAi];
      }

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
      const uploadedCandidates = queryClient.getQueryData<UploadedCandidate[]>(['uploadedCandidates']);

      if (uploadedCandidates) {
        const candidatesWithScores: CandidateWithScore[] = uploadedCandidates.map(candidate => {
          const score = scores.find(s => s.candidate_id === candidate.candidate_id);
          return { ...candidate, score };
        });

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

      // Navigate immediately, remove setTimeout
      navigate("/results", { replace: true }); // 👈 Use replace to prevent back button issues
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

// Fetch all JDs with pagination
export const fetchAllJDs = async (): Promise<JDOption[]> => {
  const allJDs: JDOption[] = [];
  let page = 1;
  let hasMore = true;
  const API_URL = import.meta.env.VITE_API_URL;
  
  try {
    while (hasMore) {
      const response = await fetch(
        `${API_URL}/api/v1/jd/?page=${page}&size=50`,
        {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
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
        throw new Error(errorData.message || `Failed to fetch JDs: ${response.status}`);
      }
      
      const data: JDListResponse = await response.json();
      
      // Transform API response to JDOption format
      const transformedJDs = data.jds.map(jd => ({
        id: jd.id,
        title: jd.title,
        role_name: jd.role_name,
        persona_count: jd.personas.length,
      }));
      
      allJDs.push(...transformedJDs);
      
      hasMore = data.has_next;
      page++;
    }
    
    return allJDs;
  } catch (error) {
    console.error('Error fetching all JDs:', error);
    throw error;
  }
};

// Fetch all Personas with pagination
export const fetchAllPersonas = async (): Promise<PersonaOption[]> => {
  const allPersonas: PersonaOption[] = [];
  let page = 1;
  let hasMore = true;
  const API_URL = import.meta.env.VITE_API_URL;
  
  try {
    while (hasMore) {
      const response = await fetch(
        `${API_URL}/api/v1/persona/?page=${page}&size=50`,
        {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
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
        throw new Error(errorData.message || `Failed to fetch personas: ${response.status}`);
      }
      
      const data: PersonaListResponse = await response.json();
      
      // Transform API response to PersonaOption format
      const transformedPersonas = data.personas.map(persona => ({
        id: persona.id,
        name: persona.name || 'Unnamed Persona',
        jd_id: persona.job_description_id,
        role_name: persona.role_name || 'Unknown Role',
      }));
      
      allPersonas.push(...transformedPersonas);
      
      hasMore = data.has_next;
      page++;
    }
    
    return allPersonas;
  } catch (error) {
    console.error('Error fetching all personas:', error);
    throw error;
  }
};

// Fetch all Roles
export const fetchAllRoles = async (): Promise<RoleOption[]> => {
  const API_URL = import.meta.env.VITE_API_URL;
  
  try {
    const response = await fetch(
      `${API_URL}/api/v1/job-role/?page=1&size=100&active_only=true`,
      {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
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
      throw new Error(errorData.message || `Failed to fetch roles: ${response.status}`);
    }
    
    const data = await response.json();
    const roles = data.job_roles || data;
    
    // Transform API response to RoleOption format
    return roles.map((role: any) => ({
      id: role.id,
      name: role.name,
      description: role.description,
    }));
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

// Fetch JDs by Role ID
export const fetchJDsByRole = async (roleId: string): Promise<JDOption[]> => {
  const API_URL = import.meta.env.VITE_API_URL;
  
  try {
    const response = await fetch(
      `${API_URL}/api/v1/jd/by-role/${roleId}`,
      {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
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
      throw new Error(errorData.message || `Failed to fetch JDs: ${response.status}`);
    }
    
    const data = await response.json();
    const jds = Array.isArray(data) ? data : (data.jds || data.items || data.results || []);
    
    // Transform API response to JDOption format
    return jds.map((jd: any) => ({
      id: jd.id,
      title: jd.title || jd.role,
      role_name: jd.role_name || jd.role || '',
      persona_count: jd.personas?.length || 0,
    }));
  } catch (error) {
    console.error('Error fetching JDs by role:', error);
    throw error;
  }
};
