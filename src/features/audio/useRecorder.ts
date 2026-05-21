"use client";

import { useRef, useCallback } from "react";
import { create } from "zustand";
import type { RecordingState, RecordingStatus } from "@/types/audio";

interface RecorderStore extends RecordingState {
  setStatus: (status: RecordingStatus) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  setAudioData: (blob: Blob, url: string) => void;
  tick: () => void;
}

const initialState: RecordingState = {
  status: "idle",
  startTime: null,
  elapsedMs: 0,
  audioBlob: null,
  audioUrl: null,
  error: null,
};

export const useRecorderStore = create<RecorderStore>((set, get) => ({
  ...initialState,
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: "error" }),
  reset: () => set(initialState),
  setAudioData: (audioBlob, audioUrl) => set({ audioBlob, audioUrl }),
  tick: () => {
    const { startTime } = get();
    if (startTime) {
      set({ elapsedMs: Date.now() - startTime });
    }
  },
}));

export function useRecorder() {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { setStatus, setError, reset: resetStore, setAudioData, tick } = useRecorderStore();

  const startTimer = useCallback(() => {
    const startTime = Date.now();
    useRecorderStore.setState({ startTime });
    timerRef.current = setInterval(() => {
      tick();
    }, 100);
  }, [tick]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    try {
      setStatus("requesting");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;
      chunks.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorder.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioData(blob, url);
        stopTimer();
      };

      recorder.start(250); // emit data every 250ms for low latency
      setStatus("recording");
      startTimer();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Microphone access denied";
      setError(msg);
    }
  }, [setStatus, setError, setAudioData, startTimer, stopTimer]);

  const pause = useCallback(() => {
    if (mediaRecorder.current?.state === "recording") {
      mediaRecorder.current.pause();
      setStatus("paused");
      stopTimer();
    }
  }, [setStatus, stopTimer]);

  const resume = useCallback(() => {
    if (mediaRecorder.current?.state === "paused") {
      mediaRecorder.current.resume();
      setStatus("recording");
      startTimer();
    }
  }, [setStatus, startTimer]);

  const stop = useCallback(() => {
    if (mediaRecorder.current?.state !== "inactive") {
      setStatus("stopping");
      mediaRecorder.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      // Recorder.onstop will handle resetting status
    }
  }, [setStatus]);

  const reset = useCallback(() => {
    stop();
    resetStore();
    chunks.current = [];
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [stop, resetStore]);

  return { start, pause, resume, stop, reset };
}
