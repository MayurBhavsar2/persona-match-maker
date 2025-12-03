// types/candidate.ts
// export interface UploadedCandidate {
//   candidate_id: string;
//   latest_cv_id: string;
//   file_name: string;
//   file_hash: string;
//   version: number;
//   s3_url: string;
//   status: 'success' | 'duplicate' | 'error';
//   is_new_candidate: boolean;
//   is_new_cv: boolean;
//   cv_text: string;
// }

export interface Candidate {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  cvs: any;
  latest_cv_id: string | null;
  personas: Array<{ persona_id: string }>;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  created_by_name: string | null;
  updated_by: string | null;
  updated_by_name: string | null;
}

interface CandidateUploadProps {
  onSuccess?: (uploaded: UploadedCandidate[]) => void;
  onCancel?: () => void;
  isModal?: boolean;
  onCandidatesUploaded?: (candidates: Candidate[]) => void;
}

export interface UploadedCandidate {
  id?: string; // For backward compatibility
  candidate_id?: string; // From API response
  candidate_name: string; // full_name from API
  email: string | null;
  phone?: string | null;
  cv_id?: string; // From API response
  latest_cv_id?: string; // For backward compatibility
  file_name: string;
  file_hash: string;
  version: number;
  s3_url: string;
  status: 'success' | 'duplicate' | 'error';
  is_new_candidate: boolean;
  is_new_cv: boolean;
  cv_text: string;
  error?: string | null;
  personas?: Array<{ persona_id: string }>;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  created_by_name?: string | null;
  updated_by?: string | null;
  updated_by_name?: string | null;
}

// types/jd.ts
export interface JDOption {
  id: string;
  title: string;
  role_id: string;
  role_name: string;

  company_id: string | null;

  notes: string | null;
  tags: string[];

  original_document_filename: string;
  original_document_size: string;
  original_document_extension: string;

  document_word_count: string;
  document_character_count: string;

  selected_version: string;
  selected_edited: boolean;
  created_at: string;
  created_by: string;
  created_by_name: string;

  updated_at: string;
  updated_by: string;
  updated_by_name: string;

  personas: {
    persona_id: string;
    persona_name: string;
  }[];
}

export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};


// types/persona.ts
export interface PersonaOption {
  id: string;
  name: string;
  jd_id: string;
  role_name: string;
  created_at: string;
  created_by: string;
  created_by_name: string
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

export interface CandidateWithScore extends CandidateOption {
  score?: ScoreResponse;
}

// hooks/useCandidateOperations.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { CandidateOption } from './types';
import axiosInstance from './utils';

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

//       for (const candidate of candidates) {
//         console.log("candidate data from score function: ", candidate);
        
//         const cvId =
//           candidate.latest_cv_id ??
//           candidate.cvs?.[0]?.id ??
//           null;

//         if (!cvId) {
//           console.error(
//             `No CV ID found for candidate ${candidate.full_name} (${candidate.id}), skipping`
//           );
//           continue;
//         }

//         const url =
//           `${API_URL}/api/v1/candidate/score-with-ai` +
//           `?candidate_id=${candidate.id}` +
//           `&persona_id=${persona_id}` +
//           `&cv_id=${cvId}` +
//           `&force_rescore=false`;

//         const response = await fetch(url, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//           },
//         });

//         const data = await response.json();

//         if (!response.ok) {
//           console.error(
//             `Failed to score candidate ${candidate.full_name || candidate.id}:`,
//             data.message
//           );
//           continue;
//         }

//         results.push(data);
//       }

//       return results;
//     },
//     onSuccess: (scores, variables) => {
//       const { candidates, persona_id } = variables;

//       const candidatesWithScores: CandidateWithScore[] = candidates.map(
//         (candidate) => {
//           const score = scores.find(
//             (s) => s.candidate_id === candidate.id
//           );
//           return { ...candidate, score };
//         }
//       );

//       const evaluationData = {
//         candidates: candidatesWithScores,
//         scores,
//         persona_id,
//         timestamp: Date.now(),
//       };

//       // Store in React Query cache
//       queryClient.setQueryData(
//         ['evaluatedCandidates', persona_id], 
//         evaluationData
//       );

//       // Store in session storage for page refresh persistence
//       sessionStorage.setItem(
//         `evaluation_${persona_id}`,
//         JSON.stringify(evaluationData)
//       );

//       toast({
//         title: 'Evaluation completed',
//         description: `${scores.length} candidates have been evaluated successfully.`,
//       });

//       // Navigate with state indicator
//       navigate(`/results/${persona_id}`, { 
//         replace: true,
//         state: { fromEvaluation: true }
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

//updated scoreCandidates hook 

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

//       for (const candidate of candidates) {

//         console.log("candidate data from score function: ", candidate)
//         // Prefer latest_cv_id; if not present, try first CV as fallback
//         const cvId =
//           candidate.latest_cv_id ??
//           candidate.cvs?.[0]?.id ??
//           null;

//         if (!cvId) {
//           console.error(
//             `No CV ID found for candidate ${candidate.full_name} (${candidate.id}), skipping`
//           );
//           continue;
//         }

//         const url =
//           `${API_URL}/api/v1/candidate/score-with-ai` +
//           `?candidate_id=${candidate.id}` +
//           `&persona_id=${persona_id}` +
//           `&cv_id=${cvId}` +
//           `&force_rescore=false`;

//         const response = await fetch(url, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//           },
//         });

//         const data = await response.json();

//         if (!response.ok) {
//           console.error(
//             `Failed to score candidate ${candidate.full_name || candidate.id}:`,
//             data.message
//           );
//           continue;
//         }

//         results.push(data);
//       }

//       return results;
//     },
//     onSuccess: (scores, variables) => {
//       const { candidates, persona_id } = variables;

//       const candidatesWithScores: CandidateWithScore[] = candidates.map(
//         (candidate) => {
//           const score = scores.find(
//             (s) => s.candidate_id === candidate.id
//           );
//           return { ...candidate, score };
//         }
//       );

//       // Store evaluated candidates in cache
//       queryClient.setQueryData(['evaluatedCandidates'], {
//         candidates: candidatesWithScores,
//         scores,
//         timestamp: Date.now(),
//       });

//       toast({
//         title: 'Evaluation completed',
//         description: `${scores.length} candidates have been evaluated successfully.`,
//       });

//       navigate(`/results/${persona_id}`, { replace: true });
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
export const fetchAllPersonas = async (jd_id): Promise<PersonaOption[]> => {

  const API_URL = import.meta.env.VITE_API_URL;
  
  try {
      const response = await fetch(
        `${API_URL}/api/v1/persona/by-jd/${jd_id}`,
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
      
      const data: PersonaOption[] = await response.json();
          
    return data; 
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
    
    // Transform API response to JDOption format
    return data.jds
  } catch (error) {
    console.error('Error fetching JDs by role:', error);
    throw error;
  }
};


interface EvaluationData {
  candidates: any[];
  scores: ScoreResponse[];
  persona_id: string;
  timestamp: number;
}

export const useEvaluationData = (
  personaId: string | undefined,
  fromEvaluation: boolean
) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  return useQuery({
    queryKey: ['evaluatedCandidates', personaId],
    queryFn: async (): Promise<EvaluationData | null> => {
      if (!personaId) return null;

      // 1. Check React Query cache first
      // (This is automatically checked by React Query)

      // 2. Check session storage (for page refresh scenario)
      const sessionData = sessionStorage.getItem(`evaluation_${personaId}`);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        // Only use session storage if it's recent (within last 30 minutes)
        const isRecent = Date.now() - parsed.timestamp < 30 * 60 * 1000;
        if (isRecent && fromEvaluation) {
          return parsed;
        }
      }

      // 3. Fetch from API (for viewing all evaluated candidates)
      const response = await axios.get(
        `${API_URL}/api/v1/candidate/scores?persona_id=${personaId}`,
        { headers }
      );

      return {
        candidates: response.data?.candidates || [],
        scores: response.data?.scores || [],
        persona_id: personaId,
        timestamp: Date.now(),
      };
    },
    enabled: !!personaId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
};


export const useSearchCandidates = (searchTerm: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['candidates', 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) {
        return [];
      }

      const response = await axiosInstance.post('/api/v1/candidate/search', {
        query: searchTerm,
        page: 1,
        size: 1000,
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
    },
    enabled: enabled && searchTerm.trim().length > 0,
    staleTime: 30000, // Cache for 30 seconds
    retry: 1,
  });
};


export const usePaginatedCandidates = (page: number, size: number = 10) => {
  return useQuery({
    queryKey: ['candidates', 'paginated', page, size],
    queryFn: async () => {
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
    },
    staleTime: 60000, // Cache for 1 minute
  });
};


