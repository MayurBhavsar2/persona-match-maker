import SamplePersonaPayload from "../SamplePersonaPayload.json"; // Make sure the path is correct

export const mockFetchPersona = async (jdId: string) => {
  return new Promise<any>((resolve, reject) => {
    try {
      // Simulate network delay
      setTimeout(() => {
        // You can optionally filter by jdId if your JSON has multiple entries
        resolve(SamplePersonaPayload);
      }, 500); // 500ms delay for realism
    } catch (error) {
      reject(error);
    }
  });
};
