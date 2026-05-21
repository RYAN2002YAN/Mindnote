"use client";

import { useCallback, useRef } from "react";
import { create } from "zustand";
import type { StructuredContent } from "@/types/note";
import type { AIModelConfig } from "@/types/ai";
import { structureNote } from "./deepseek";

interface StructuringState {
  isStructuring: boolean;
  error: string | null;
  result: StructuredContent | null;
  setStructuring: (v: boolean) => void;
  setError: (e: string | null) => void;
  setResult: (r: StructuredContent | null) => void;
  reset: () => void;
}

export const useStructuringStore = create<StructuringState>((set) => ({
  isStructuring: false,
  error: null,
  result: null,
  setStructuring: (isStructuring) => set({ isStructuring }),
  setError: (error) => set({ error, isStructuring: false }),
  setResult: (result) => set({ result, isStructuring: false, error: null }),
  reset: () => set({ result: null, error: null, isStructuring: false }),
}));

export function useStructuring() {
  const abortRef = useRef<AbortController | null>(null);

  const runStructuring = useCallback(
    async (transcript: string, language: string, config: Partial<AIModelConfig> = {}) => {
      const store = useStructuringStore.getState();
      store.setStructuring(true);
      store.setError(null);

      try {
        abortRef.current = new AbortController();
        const result = await structureNote(transcript, language, config);
        store.setResult(result);
        return result;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return null;
        const msg = err instanceof Error ? err.message : "AI structuring failed";
        store.setError(msg);
        return null;
      }
    },
    []
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    useStructuringStore.getState().setStructuring(false);
  }, []);

  return { runStructuring, cancel };
}
