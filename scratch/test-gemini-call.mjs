import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "test-fake-key" });

try {
  // Test the structure
  const params = {
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        },
      },
      "Describe this image",
    ],
  };
  console.log("Params structure ok");
} catch (e) {
  console.error("Params structure error:", e);
}
