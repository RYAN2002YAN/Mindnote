"use client";

import { create } from "zustand";

type TranscriptionStatus = "idle" | "transcribing" | "done" | "error";

interface TranscriptionStore {
  text: string;
  interimText: string; // for Web Speech API real-time display
  status: TranscriptionStatus;
  language: string;
  error: string | null;
  setText: (text: string) => void;
  appendText: (text: string) => void;
  setInterim: (text: string) => void;
  setStatus: (status: TranscriptionStatus) => void;
  setLanguage: (lang: string) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

export const useTranscriptionStore = create<TranscriptionStore>((set) => ({
  text: "",
  interimText: "",
  status: "idle",
  language: "auto",
  error: null,
  setText: (text) => set({ text, interimText: "" }),
  appendText: (text) => set((s) => ({ text: s.text + text })),
  setInterim: (interimText) => set({ interimText }),
  setStatus: (status) => set({ status }),
  setLanguage: (language) => set({ language }),
  setError: (error) => set({ error, status: "error" }),
  reset: () => set({ text: "", interimText: "", status: "idle", error: null }),
}));

export function useTranscription() {
  const { setStatus, setText, setError, setLanguage } = useTranscriptionStore();

  const transcribeWithWhisper = async (
    audioBlob: Blob,
    apiKey: string,
    language?: string
  ): Promise<string> => {
    setStatus("transcribing");

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      formData.append("model", "whisper-1");
      if (language && language !== "auto") {
        formData.append("language", language);
      }
      formData.append("response_format", "verbose_json");
      formData.append("timestamp_granularities", "segment");

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Whisper API error: ${err}`);
      }

      const data = await response.json();
      const fullText = data.text || "";
      const detectedLang = data.language || language || "auto";

      setText(fullText);
      setLanguage(detectedLang);
      setStatus("done");
      return fullText;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transcription failed";
      setError(msg);
      throw err;
    }
  };

  const transcribeWithWebSpeech = () => {
    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setError("Browser does not support speech recognition");
      return null;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "zh-CN";

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        useTranscriptionStore.getState().appendText(final + " ");
        useTranscriptionStore.getState().setInterim("");
      }
      if (interim) {
        useTranscriptionStore.getState().setInterim(interim);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "no-speech") {
        setError(`Speech recognition error: ${event.error}`);
      }
    };

    return recognition;
  };

  return { transcribeWithWhisper, transcribeWithWebSpeech };
}
