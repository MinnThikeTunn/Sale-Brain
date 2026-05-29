import { GoogleGenAI } from "npm:@google/genai@2.4.0";

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    const key = Deno.env.get("GEMINI_API_KEY");
    if (!key || key.includes("MY_GEMINI_API_KEY")) {
      throw new Error("GEMINI_API_KEY is missing or invalid.");
    }
    client = new GoogleGenAI({
      apiKey: key,
      httpOptions: { headers: { "User-Agent": "sales-brain-edge" } },
    });
  }
  return client;
}
