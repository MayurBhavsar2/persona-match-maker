import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CandidateDetailsSidebar from "@/components/CandidateDetailsSidebar";
import {
  Users,
  Calendar,
} from "lucide-react";

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

// hooks/useCandidateScoring.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEvaluatedCandidates } from "@/lib/helper";

const API_URL = import.meta.env.VITE_API_URL;

// Single candidate scoring
// const scoreCandidate = async (data: ScoreRequest): Promise<ScoreResponse> => {
//   const response = await axios.post(
//     `${API_URL}/api/v1/candidate/score-with-ai`,
//     null,
//     {
//       params: {
//         candidate_id: data.candidate_id,
//         persona_id: data.persona_id,
//         cv_id: data.cv_id,
//         force_rescore: data.force_rescore || false,
//       },
//     }
//   );
//   return response.data;
// };

// // Multiple candidates scoring
// const scoreCandidates = async (
//   candidates: ScoreRequest[]
// ): Promise<ScoreResponse[]> => {
//   const promises = candidates.map((candidate) => scoreCandidate(candidate));
//   return Promise.all(promises);
// };

// // Hook for scoring a single candidate
// export const useScoreCandidate = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: scoreCandidate,
//     onSuccess: () => {
//       // Invalidate relevant queries after successful scoring
//       queryClient.invalidateQueries({ queryKey: ['candidate-scores'] });
//     },
//     onError: (error) => {
//       console.error('Error scoring candidate:', error);
//     },
//   });
// };

// // Hook for scoring multiple candidates
// export const useScoreCandidates = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: scoreCandidates,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['candidate-scores'] });
//     },
//     onError: (error) => {
//       console.error('Error scoring candidates:', error);
//     },
//   });
// };

// // Hook for scoring candidates from your data structure
// export const useScoreCandidatesFromData = (personaId: string) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (candidatesData: CandidateData[]) => {
//       const scoreRequests: ScoreRequest[] = candidatesData.map((candidate) => ({
//         candidate_id: candidate.candidate_id,
//         persona_id: personaId,
//         cv_id: candidate.cv_id,
//         force_rescore: false,
//       }));

//       return scoreCandidates(scoreRequests);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['candidate-scores'] });
//     },
//     onError: (error) => {
//       console.error('Error scoring candidates:', error);
//     },
//   });
// };

// // Hook to fetch existing scores (if you have a GET endpoint)
// export const useCandidateScores = (candidateIds?: string[]) => {
//   return useQuery({
//     queryKey: ['candidate-scores', candidateIds],
//     queryFn: async () => {
//       // Adjust this endpoint based on your actual API
//       const response = await axios.get(`${API_URL}/api/v1/candidate/scores`, {
//         params: { candidate_ids: candidateIds?.join(',') },
//       });
//       return response.data;
//     },
//     enabled: !!candidateIds && candidateIds.length > 0,
//   });
// };


const Results = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const navigate = useNavigate()
  const { data: evaluatedData, isLoading, isError } = useEvaluatedCandidates();
  const [roles, setRoles] = useState<any[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  const personaData = localStorage.getItem('savedPersona');
  const persona_id = personaData ? JSON.parse(personaData).id : null; 
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedPersona, setSelectedPersona] = useState<string>(personaData ?? "");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCandidate, setSidebarCandidate] = useState<any | null>(null);
  const [showAllCandidates, setShowAllCandidates] = useState(true);
 

const fetchPersonas = async () => {

    const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }

    try {
      axios.get(`${import.meta.env.VITE_API_URL}/api/v1/persona/`, {headers:headers})
      .then(response => {
        if(response?.status !== 200) throw new Error("Failed to fetch personas");
        const personaList = response?.data
        console.log("personas list from axios: ", personaList)
        setPersonas(personaList);

        const rolesMap = new Map();
        personaList.forEach((persona: any) => {
          if (!rolesMap.has(persona.role_id)) {
            rolesMap.set(persona.role_id, {
              id: persona.role_id,
              name: persona.role_name
            });
          }
        });
        
        const uniqueRoles = Array.from(rolesMap.values());
        console.log("unique roles: ", uniqueRoles)
        setRoles(uniqueRoles);
        
        // Auto-select from localStorage AFTER data is loaded
        const savedJdData = localStorage.getItem('jdData');
        const savedPersonaData = localStorage.getItem('savedPersona');
        console.log(`role id & jd derived from local: `)

        
        
        if (savedJdData) {
          const jdData = JSON.parse(savedJdData);
          console.log("role id derived from local: ", jdData?.roleId)
          setSelectedRole(jdData.roleId || "");
        }
        
        if (savedPersonaData) {
          const personaData = JSON.parse(savedPersonaData);
          console.log("persona id derived from local: ", personaData?.id)
          setSelectedPersona(personaData.id || "");
        }
      })
       .catch (error =>{
      console.error("Error fetching personas:", error);
    })
  }
  finally {
    console.log("fetch call ran")
  }
}

// Filter personas when role changes
  const getPersonasForRole = (roleId: string) => {
    if (!roleId) return [];
    return personas.filter(p => p.role_id === roleId);
  };



  const handleRoleChange = (roleId: string) => {
  setSelectedRole(roleId);
  setSelectedPersona(""); // Clear persona selection when role changes
  
  // Update localStorage
  // const jdData = { roleId };
  // localStorage.setItem('jdData', JSON.stringify(jdData));
};

// Handle persona change
  const handlePersonaChange = (personaId: string) => {
    setSelectedPersona(personaId);
    
    // Find the persona object to save complete data
    const persona = personas.find(p => p.id === personaId);
    if (persona) {
      localStorage.setItem('savedPersona', JSON.stringify(persona));
    }
  };

  useEffect(() => {
    console.log("data from evaluated data: ", evaluatedData)
    console.log("Persona data from local: ", personaData)
    console.log("candidates data received: ", candidates)
    if (!isLoading && evaluatedData) {
      setCandidates(evaluatedData?.candidates || []);
      // Remove the handleScoreCandidates() call - candidates are already scored
    } else if (!isLoading && !evaluatedData) {
      navigate('/candidate-upload');
    }
  }, [evaluatedData, isLoading, navigate]);

  useEffect(() => {
    fetchPersonas();
  }, []);


  const generateDetailedEvaluation = (candidate: any): any[] => {
    return [
      {
        name: "Technical Skills",
        weight: "54%",
        scored: candidate.technicalSkills,
        attributeScore: `${(candidate.technicalSkills * 0.54).toFixed(2)}%`,
        percentScored: `${candidate.technicalSkills}%`,
        subAttributes: [
          {
            name: "Automation Frameworks (Selenium/Java, TestNG/Cucumber, POM/BDD)",
            weightage: 18,
            expectedLevel: 4,
            actualLevel: Math.max(1, Math.min(4, Math.floor(candidate.technicalSkills / 25) + 1)),
            notes: "Expected: stable suites POM BDD maintainable | Actual: stable suites POM BDD maintainable",
          },
          {
            name: "Functional & Regression Testing (Web/Mobile)",
            weightage: 15,
            expectedLevel: 4,
            actualLevel: Math.max(1, Math.min(4, Math.floor(candidate.technicalSkills / 25) + 1)),
            notes: "Expected: end‑to‑end coverage disciplined regression | Actual: end‑to‑end coverage disciplined regression",
          },
          {
            name: "API Testing (Postman/RestAssured)",
            weightage: 12,
            expectedLevel: 4,
            actualLevel: Math.max(1, Math.min(4, Math.floor(candidate.technicalSkills / 25))),
            notes: "Expected: schema contract auth negative cases | Actual: schema contract auth negative cases",
          },
          {
            name: "Performance/Load (JMeter)",
            weightage: 10,
            expectedLevel: 3,
            actualLevel: Math.max(1, Math.min(3, Math.floor(candidate.technicalSkills / 30))),
            notes: "Expected: basic plans KPIs trending | Actual: basic plans KPIs trending",
          },
          {
            name: "Database/SQL Testing",
            weightage: 10,
            expectedLevel: 3,
            actualLevel: Math.max(1, Math.min(3, Math.floor(candidate.technicalSkills / 30))),
            notes: "Expected: joins constraints CRUD integrity | Actual: joins constraints CRUD integrity",
          },
          {
            name: "Test Strategy & Planning (Plans/Cases/Traceability)",
            weightage: 12,
            expectedLevel: 4,
            actualLevel: Math.max(1, Math.min(4, Math.floor(candidate.technicalSkills / 25))),
            notes: "Expected: risk‑based plans RTM data | Actual: risk‑based plans RTM data",
          },
          {
            name: "Defect Management & Reporting (Jira/Xray)",
            weightage: 13,
            expectedLevel: 4,
            actualLevel: Math.max(1, Math.min(4, Math.floor(candidate.technicalSkills / 25))),
            notes: "Expected: triage RCA dashboards hygiene | Actual: triage RCA dashboards hygiene",
          },
          {
            name: "CI/CD & Version Control (Jenkins/Git)",
            weightage: 10,
            expectedLevel: 3,
            actualLevel: Math.max(1, Math.min(3, Math.floor(candidate.technicalSkills / 35))),
            notes: "Expected: trigger suites artifacts hygiene | Actual: trigger suites artifacts hygiene",
          },
        ],
      },
      {
        name: "Cognitive Demands",
        weight: "24%",
        scored: 93.8,
        attributeScore: "22.50%",
        percentScored: "93.8%",
        subAttributes: [
          {
            name: "Remember / Understand",
            weightage: 10,
            expectedLevel: 3,
            actualLevel: 3,
            notes: "Expected: SDLC STLC coverage types | Actual: SDLC STLC coverage types",
          },
          {
            name: "Apply",
            weightage: 25,
            expectedLevel: 4,
            actualLevel: 4,
            notes: "Expected: execute plans stable runs | Actual: execute plans stable runs",
          },
          {
            name: "Analyze",
            weightage: 25,
            expectedLevel: 4,
            actualLevel: 4,
            notes: "Expected: RCA logs data‑driven | Actual: RCA logs data‑driven",
          },
          {
            name: "Evaluate",
            weightage: 25,
            expectedLevel: 4,
            actualLevel: 3,
            notes: "Expected: risk trade‑offs approach | Actual: risk trade‑offs approach",
          },
          {
            name: "Create",
            weightage: 15,
            expectedLevel: 3,
            actualLevel: 3,
            notes: "Expected: utilities data improvements | Actual: utilities data improvements",
          },
        ],
      },
      {
        name: "Values",
        weight: "6%",
        scored: 92.5,
        attributeScore: "5.55%",
        percentScored: "92.5%",
        subAttributes: [
          {
            name: "Achievement / Power",
            weightage: 30,
            expectedLevel: 4,
            actualLevel: 4,
            notes: "Expected: release quality leakage down | Actual: release quality leakage down",
          },
          {
            name: "Security / Conformity",
            weightage: 30,
            expectedLevel: 4,
            actualLevel: 3,
            notes: "Expected: process audit trail standards | Actual: process audit trail standards",
          },
          {
            name: "Self-direction / Stimulation",
            weightage: 25,
            expectedLevel: 3,
            actualLevel: 3,
            notes: "Expected: learning tools experiments | Actual: learning tools experiments",
          },
          {
            name: "Benevolence / Universalism",
            weightage: 15,
            expectedLevel: 3,
            actualLevel: 3,
            notes: "Expected: user empathy team‑first | Actual: user empathy team‑first",
          },
        ],
      },
      {
        name: "Foundational Behaviors",
        weight: "10%",
        scored: candidate.communication,
        attributeScore: `${(candidate.communication * 0.1).toFixed(2)}%`,
        percentScored: `${candidate.communication}%`,
        subAttributes: [
          {
            name: "Communication",
            weightage: 35,
            expectedLevel: 4,
            actualLevel: Math.max(1, Math.min(4, Math.floor(candidate.communication / 25))),
            notes: "Expected: concise risks clear bugs | Actual: concise risks clear bugs",
          },
          {
            name: "Resilience / Stress Tolerance",
            weightage: 25,
            expectedLevel: 3,
            actualLevel: Math.max(1, Math.min(3, Math.floor(candidate.communication / 30))),
            notes: "Expected: calm hotfix incidents | Actual: calm hotfix incidents",
          },
          {
            name: "Decision‑Making under Uncertainty",
            weightage: 20,
            expectedLevel: 3,
            actualLevel: Math.max(1, Math.min(3, Math.floor(candidate.communication / 30))),
            notes: "Expected: time‑box escalate wisely | Actual: time‑box escalate wisely",
          },
          {
            name: "Attention to Detail & Documentation",
            weightage: 20,
            expectedLevel: 4,
            actualLevel: Math.max(1, Math.min(4, Math.floor(candidate.communication / 25))),
            notes: "Expected: traceability crisp documentation | Actual: traceability crisp documentation",
          },
        ],
      },
      {
        name: "Leadership Skills",
        weight: "4%",
        scored: 100.0,
        attributeScore: "4.00%",
        percentScored: "100.0%",
        subAttributes: [
          {
            name: "Peer Mentoring & Reviews",
            weightage: 50,
            expectedLevel: 3,
            actualLevel: 3,
            notes: "Expected: review cases scripts coach | Actual: review cases scripts coach",
          },
          {
            name: "Cross‑functional Influence",
            weightage: 30,
            expectedLevel: 3,
            actualLevel: 3,
            notes: "Expected: align Dev PO BA | Actual: align Dev PO BA",
          },
          {
            name: "Quality Advocacy / Process Improvement",
            weightage: 20,
            expectedLevel: 3,
            actualLevel: 3,
            notes: "Expected: workflow improvements templates | Actual: workflow improvements templates",
          },
        ],
      },
      {
        name: "Education & Experience",
        weight: "2%",
        scored: candidate.experience,
        attributeScore: `${(candidate.experience * 0.02).toFixed(2)}%`,
        percentScored: `${candidate.experience}%`,
        subAttributes: [
          {
            name: "Education (Bachelor's / Equivalent)",
            weightage: 30,
            expectedLevel: 3,
            actualLevel: Math.max(1, Math.min(3, Math.floor(candidate.experience / 30))),
            notes: "Expected: degree or equivalent proof | Actual: degree or equivalent proof",
          },
          {
            name: "Experience (3–6 yrs QA)",
            weightage: 70,
            expectedLevel: 4,
            actualLevel: Math.max(1, Math.min(4, Math.floor(candidate.experience / 25))),
            notes: "Expected: sustained Agile releases | Actual: sustained Agile releases",
          },
        ],
      },
    ];
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-orange-500";
    return "text-red-600";
  };

  const filteredCandidates = candidates
    .filter((candidate) => showAllCandidates ? true : candidate.overallScore >= 80)
    .sort((a, b) => b.overallScore - a.overallScore);

  return (
    <Layout currentStep={4}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-foreground">Candidate Results</h1>

        <div className="flex items-center gap-6">
  <div className="flex items-center gap-3">
    <label className="text-sm font-medium text-foreground">Role:</label>
    <Select value={selectedRole} onValueChange={handleRoleChange}>
      <SelectTrigger className="w-[250px] bg-background border-border">
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent className="bg-background border-border z-50">
        {roles.map((role) => (
          <SelectItem key={role.id} value={role.id}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  <div className="flex items-center gap-3">
    <label className="text-sm font-medium text-foreground">Persona:</label>
    <Select 
      value={selectedPersona} 
      onValueChange={handlePersonaChange}
      disabled={!selectedRole} // Disable until role is selected
    >
      <SelectTrigger className="w-[350px] bg-background border-border">
        <SelectValue placeholder="Select a persona" />
      </SelectTrigger>
      <SelectContent className="bg-background border-border z-50">
        {getPersonasForRole(selectedRole).map((persona) => (
          <SelectItem key={persona.id} value={persona.id}>
            {persona.name || persona.persona_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
</div>
          {/* <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground">Role:</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[250px] bg-background border-border">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground">Persona:</label>
              <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                <SelectTrigger className="w-[350px] bg-background border-border">
                  <SelectValue placeholder="Select a persona" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  {getPersonasForRole(selectedRole).map((personaName) => (
                    <SelectItem key={personaName} value={personaName}>
                      {personaName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div> */}

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



        {/* Results Table */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-2 px-3">Candidate</TableHead>
                    <TableHead className="py-2 px-3">Overall Score</TableHead>
                    <TableHead className="py-2 px-3">Application Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.score_id || candidate.id}>
                      <TableCell className="py-2 px-3">
                        <div>
                          <button
                            className="font-medium text-primary underline-offset-4 underline cursor-pointer text-left"
                            onClick={() => {
                              setSidebarCandidate(candidate);
                              setSidebarOpen(true);
                            }}
                          >
                            {candidate?.score?.candidate_name ?? `Candidate ID: ${candidate.candidate_id || candidate.id}`}
                          </button>
                          <p className="text-sm text-muted-foreground">{candidate.file_name || candidate.fileName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <span className={`font-medium ${getScoreColor(candidate.final_score || candidate.overallScore)}`}>
                          {candidate.score?.final_score || candidate.overallScore}%
                        </span>
                      </TableCell>
                      <TableCell className="py-2 px-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {candidate.applicationDate ? new Date(candidate.applicationDate).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredCandidates.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">No candidates found</h3>
                <p className="text-sm text-muted-foreground">
                  {showAllCandidates ? 'No candidates available.' : 'No candidates with 90% or higher score.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Candidate Details Sidebar */}
      <CandidateDetailsSidebar
        candidate={sidebarCandidate}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />
    </Layout>
  );
};

export default Results;

