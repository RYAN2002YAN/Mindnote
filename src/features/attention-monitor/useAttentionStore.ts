"use client";

import { create } from "zustand";
import type { AttentionScore, AttentionTimelineEntry, AttentionSettings, DailyReport, PetState } from "./types";
import { DEFAULT_ATTENTION_SETTINGS } from "./types";

interface AttentionState {
  enabled: boolean;
  isCameraReady: boolean;
  currentScore: AttentionScore | null;
  petState: PetState;
  settings: AttentionSettings;
  timeline: AttentionTimelineEntry[];
  dailyReport: DailyReport | null;
  attentionStartTime: number | null;
  distractionStartTime: number | null;

  setEnabled: (v: boolean) => void;
  setCameraReady: (v: boolean) => void;
  setCurrentScore: (score: AttentionScore) => void;
  updateSettings: (s: Partial<AttentionSettings>) => void;
  addTimelineEntry: (entry: AttentionTimelineEntry) => void;
  generateDailyReport: () => void;
  reset: () => void;
}

export const useAttentionStore = create<AttentionState>((set, get) => ({
  enabled: false,
  isCameraReady: false,
  currentScore: null,
  petState: "idle",
  settings: { ...DEFAULT_ATTENTION_SETTINGS },
  timeline: [],
  dailyReport: null,
  attentionStartTime: null,
  distractionStartTime: null,

  setEnabled: (enabled) => set({ enabled }),
  setCameraReady: (isCameraReady) => set({ isCameraReady }),

  setCurrentScore: (score) => {
    const { settings, attentionStartTime, distractionStartTime, timeline } = get();
    let petState: PetState = "idle";
    const thresholds = {
      relaxed: { warning: 40, alert: 20 },
      moderate: { warning: 50, alert: 30 },
      strict: { warning: 60, alert: 40 },
    }[settings.sensitivity];

    if (score.score >= 70) {
      petState = "focused";
    } else if (score.score >= (thresholds?.warning ?? 50)) {
      petState = "warning";
    } else if (score.score > 0) {
      petState = "alert";
    } else {
      petState = "idle";
    }

    // Add timeline entry every 5 seconds
    const lastEntry = timeline[timeline.length - 1];
    if (!lastEntry || score.timestamp - lastEntry.timestamp > 5000) {
      const state =
        score.score >= 70 ? "focused" : score.score >= 40 ? "distracted" : "away";
      const newEntry: AttentionTimelineEntry = {
        timestamp: score.timestamp,
        score: score.score,
        state,
      };
      set((s) => ({ timeline: [...s.timeline, newEntry].slice(-720) })); // keep last hour
    }

    set({ currentScore: score, petState });
  },

  updateSettings: (partial) =>
    set((s) => ({ settings: { ...s.settings, ...partial } })),

  addTimelineEntry: (entry) =>
    set((s) => ({ timeline: [...s.timeline, entry].slice(-720) })),

  generateDailyReport: () => {
    const { timeline } = get();
    if (timeline.length === 0) return;

    const focused = timeline.filter((e) => e.state === "focused").length;
    const distracted = timeline.filter((e) => e.state !== "focused").length;
    const total = focused + distracted;
    const avgScore = timeline.reduce((a, b) => a + b.score, 0) / total;

    // Find peak focus hour
    const hourCounts = new Map<number, number>();
    timeline.filter((e) => e.state === "focused").forEach((e) => {
      const hour = new Date(e.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    let peakHour = 9;
    let maxCount = 0;
    hourCounts.forEach((count, hour) => {
      if (count > maxCount) { maxCount = count; peakHour = hour; }
    });

    set({
      dailyReport: {
        date: new Date().toISOString().slice(0, 10),
        totalFocusMinutes: Math.round((focused * 5) / 60),
        totalDistractedMinutes: Math.round((distracted * 5) / 60),
        averageAttentionScore: Math.round(avgScore),
        peakFocusHour: peakHour,
        timeline,
      },
    });
  },

  reset: () =>
    set({
      currentScore: null,
      petState: "idle",
      timeline: [],
      dailyReport: null,
      attentionStartTime: null,
      distractionStartTime: null,
    }),
}));
