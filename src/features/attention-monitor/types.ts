export type PetType = "penguin" | "shiba";

export type PetState = "idle" | "focused" | "warning" | "alert" | "celebrate";

export type FilterAlgorithm = "moving-average" | "kalman" | "fir";

export interface AttentionMetrics {
  ear: number;           // Eye Aspect Ratio — higher = more open
  mar: number;           // Mouth Aspect Ratio — high = yawning
  headPitch: number;     // degrees, positive = looking down
  headYaw: number;       // degrees, positive = turning right
  headRoll: number;      // degrees, tilt
  blinksPerMinute: number;
  closedEyeDuration: number; // ms
  isYawning: boolean;
  lookingAtScreen: boolean;
}

export interface AttentionScore {
  score: number;         // 0-100
  state: PetState;
  metrics: AttentionMetrics;
  timestamp: number;
}

export interface AttentionTimelineEntry {
  timestamp: number;
  score: number;
  state: "focused" | "distracted" | "away";
  noteCharIndex?: number; // position in note transcript
}

export interface DailyReport {
  date: string;
  totalFocusMinutes: number;
  totalDistractedMinutes: number;
  averageAttentionScore: number;
  peakFocusHour: number; // 0-23
  timeline: AttentionTimelineEntry[];
}

export interface AttentionSettings {
  enabled: boolean;
  sensitivity: "relaxed" | "moderate" | "strict";
  petType: PetType;
  petSize: "small" | "medium" | "large";
  voiceReminders: boolean;
  autoRecord: boolean;
  showTimeline: boolean;
  filterAlgorithm: FilterAlgorithm;
}

export const DEFAULT_ATTENTION_SETTINGS: AttentionSettings = {
  enabled: false,
  sensitivity: "moderate",
  petType: "penguin",
  petSize: "medium",
  voiceReminders: false,
  autoRecord: false,
  showTimeline: true,
  filterAlgorithm: "moving-average",
};

export const SENSITIVITY_THRESHOLDS = {
  relaxed: { warning: 15, alert: 30 },
  moderate: { warning: 10, alert: 15 },
  strict: { warning: 5, alert: 8 },
} as const;
