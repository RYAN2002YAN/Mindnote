import type { AIStructuringResponse, AIModelConfig } from "@/types/ai";
import { DEFAULT_AI_CONFIG } from "@/types/ai";
import { STRUCTURING_SYSTEM_PROMPT, STRUCTURING_USER_PROMPT } from "./prompts";

export async function structureNote(
  transcript: string,
  language: string,
  config: Partial<AIModelConfig> = {}
): Promise<AIStructuringResponse> {
  const cfg = { ...DEFAULT_AI_CONFIG, ...config };

  const response = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: "system", content: STRUCTURING_SYSTEM_PROMPT },
        { role: "user", content: STRUCTURING_USER_PROMPT(transcript, language) },
      ],
      max_tokens: cfg.maxTokens,
      temperature: cfg.temperature,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI");

  const parsed: AIStructuringResponse = JSON.parse(content);

  // Validate and provide defaults
  return {
    title: parsed.title || "Untitled Note",
    summary: parsed.summary || "",
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    todos: Array.isArray(parsed.todos) ? parsed.todos : [],
    dates: Array.isArray(parsed.dates) ? parsed.dates : [],
    people: Array.isArray(parsed.people) ? parsed.people : [],
    links: Array.isArray(parsed.links) ? parsed.links : [],
    mindMap: parsed.mindMap || { id: "root", label: parsed.title || "Note", children: [] },
  };
}

export async function generateTitle(transcript: string, config: Partial<AIModelConfig> = {}): Promise<string> {
  const cfg = { ...DEFAULT_AI_CONFIG, ...config };

  const response = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: "system", content: "Generate a short, descriptive title (max 10 words) for the given transcript. Reply with only the title, no quotes." },
        { role: "user", content: transcript.slice(0, 2000) },
      ],
      max_tokens: 50,
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error("Failed to generate title");
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "Untitled";
}
