// src/mocks/mockCandidateScoreApi.ts
import sampleResult from "../Cv_Score_Result.json";

/**
 * Mock function to simulate candidate scoring API.
 * @param candidate_id - ID of the candidate
 * @param persona_id - ID of the persona
 * @param cv_id - ID of the CV
 * @param force_rescore - boolean flag
 * @returns Promise that resolves with the sample JSON
 */
export const mockScoreCandidate = async (
  candidate_id: string,
  persona_id: string,
  cv_id: string,
  force_rescore: boolean = false
): Promise<any> => {
  console.log("🧪 Mock API called with:", { candidate_id, persona_id, cv_id, force_rescore });

  return new Promise((resolve) => {
    // simulate network delay
    setTimeout(() => {
      resolve(sampleResult);
    }, 800); // 0.8s delay
  });
};
