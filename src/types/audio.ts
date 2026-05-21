export type RecordingStatus =
  | "idle"
  | "requesting"
  | "recording"
  | "paused"
  | "stopping"
  | "error";

export interface RecordingState {
  status: RecordingStatus;
  startTime: number | null;
  elapsedMs: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

export interface TranscriptionSegment {
  text: string;
  start: number; // seconds
  end: number;
  confidence: number;
}

export interface TranscriptionResult {
  text: string;
  segments: TranscriptionSegment[];
  language: string;
  duration: number;
}
