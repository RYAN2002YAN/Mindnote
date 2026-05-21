export interface Note {
  id: string;
  title: string;
  rawTranscript: string;
  structuredContent: StructuredContent | null;
  notebookId: string | null;
  tags: Tag[];
  color: NoteColor | null;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  audioUrl: string | null;
  duration: number; // seconds
  syncStatus: "local" | "synced" | "pending";
}

export interface StructuredContent {
  title: string;
  summary: string;
  keyPoints: string[];
  todos: Todo[];
  dates: DateMention[];
  people: string[];
  links: string[];
  mindMap: MindMapNode;
}

export interface Todo {
  text: string;
  done: boolean;
}

export interface DateMention {
  text: string;
  date: string; // ISO string
}

export interface MindMapNode {
  id: string;
  label: string;
  children: MindMapNode[];
}

export interface Notebook {
  id: string;
  name: string;
  description: string;
  color: NoteColor | null;
  createdAt: number;
  updatedAt: number;
}

export interface Tag {
  id: string;
  name: string;
  color: NoteColor | null;
}

export type NoteColor =
  | "amber"
  | "green"
  | "blue"
  | "purple"
  | "rose"
  | "slate";

export const NOTE_COLORS: Record<NoteColor, { label: string; hex: string; bg: string }> = {
  amber:  { label: "Amber",  hex: "#f59e0b", bg: "bg-amber-500/10" },
  green:  { label: "Green",  hex: "#10b981", bg: "bg-emerald-500/10" },
  blue:   { label: "Blue",   hex: "#3b82f6", bg: "bg-blue-500/10" },
  purple: { label: "Purple", hex: "#8b5cf6", bg: "bg-purple-500/10" },
  rose:   { label: "Rose",   hex: "#f43f5e", bg: "bg-rose-500/10" },
  slate:  { label: "Slate",  hex: "#64748b", bg: "bg-slate-500/10" },
};
