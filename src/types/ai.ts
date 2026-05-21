export interface AIStructuringRequest {
  transcript: string;
  language: string;
  previousNotes?: string[];
}

export interface AIStructuringResponse {
  title: string;
  summary: string;
  keyPoints: string[];
  todos: { text: string; done: boolean }[];
  dates: { text: string; date: string }[];
  people: string[];
  links: string[];
  mindMap: {
    id: string;
    label: string;
    children: { id: string; label: string; children: never[] }[];
  };
}

export interface AIModelConfig {
  provider: "deepseek" | "openai";
  model: string;
  apiKey: string;
  baseUrl: string;
  maxTokens: number;
  temperature: number;
}

export const DEFAULT_AI_CONFIG: AIModelConfig = {
  provider: "deepseek",
  model: "deepseek-chat",
  apiKey: "",
  baseUrl: "https://api.deepseek.com/v1",
  maxTokens: 4096,
  temperature: 0.3,
};
