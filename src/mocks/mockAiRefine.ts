import SampleAiRefinePayload from "../SampleAiRefinePayload.json";

export const mockGenerateAIEnhancedJD = async (jdData: any) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      // Only return the refined_text field
      resolve(SampleAiRefinePayload.refined_text || "⚠️ No AI-enhanced JD returned1");
    }, 500);
  });
};
