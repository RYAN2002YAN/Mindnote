export const APP_NAME = "MindNote";
export const APP_DESCRIPTION = "ADHD-friendly voice-driven note assistant";

export const DB_NAME = "mindnote-db";
export const DB_VERSION = 1;

export const STORES = {
  NOTES: "notes",
  NOTEBOOKS: "notebooks",
  TAGS: "tags",
  RECORDINGS: "recordings",
  PENDING_SYNC: "pending-sync",
} as const;

export const MAX_RECORDING_DURATION_MS = 30 * 60 * 1000; // 30 minutes
export const AUTO_SAVE_INTERVAL_MS = 2000; // save every 2 seconds during recording

export const ROUTES = {
  HOME: "/",
  NOTES: "/notes",
  NOTE: (id: string) => `/notes/${id}`,
  SEARCH: "/search",
  SETTINGS: "/settings",
  LOGIN: "/auth/login",
} as const;

export const SUPPORTED_LANGUAGES = [
  { code: "zh", label: "中文" },
  { code: "en", label: "English" },
  { code: "auto", label: "Auto-detect" },
] as const;

export const EXPORT_FORMATS = ["markdown", "pdf", "text"] as const;
