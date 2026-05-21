"use client";

import { useCallback } from "react";
import { Mic, MicOff, Pause, Play, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRecorder, useRecorderStore } from "@/features/audio/useRecorder";
import { useTranscriptionStore } from "@/features/audio/useTranscription";

export function RecordButton() {
  const { start, pause, resume, stop } = useRecorder();
  const status = useRecorderStore((s) => s.status);

  const handleClick = useCallback(() => {
    switch (status) {
      case "idle":
      case "error":
        useTranscriptionStore.getState().reset();
        start();
        break;
      case "recording":
        pause();
        break;
      case "paused":
        resume();
        break;
    }
  }, [status, start, pause, resume]);

  const isActive = status === "recording" || status === "paused";

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        onClick={handleClick}
        disabled={status === "requesting" || status === "stopping"}
        className={`
          relative flex items-center justify-center rounded-full
          transition-all duration-300 select-none
          ${isActive
            ? "w-28 h-28 bg-destructive/20 text-destructive recording-pulse"
            : "w-32 h-32 bg-primary text-primary-foreground hover:scale-105 active:scale-95"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {status === "recording" ? (
            <motion.div key="rec" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Mic className="size-12" />
            </motion.div>
          ) : status === "paused" ? (
            <motion.div key="paused" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <MicOff className="size-12" />
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Mic className="size-14" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="flex items-center gap-2">
        {isActive && (
          <>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={status === "recording" ? pause : resume}
              title={status === "recording" ? "Pause" : "Resume"}
            >
              {status === "recording" ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={stop}
              title="Stop recording"
            >
              <Square className="size-4" />
            </Button>
          </>
        )}
      </div>

      <p className="text-sm text-muted-foreground text-center select-none">
        {status === "idle" && "Tap to start recording"}
        {status === "requesting" && "Requesting microphone..."}
        {status === "recording" && "Recording — tap to pause"}
        {status === "paused" && "Paused — tap to resume"}
        {status === "stopping" && "Stopping..."}
        {status === "error" && "Error — tap to retry"}
      </p>
    </div>
  );
}

export function RecordingTimer() {
  const elapsedMs = useRecorderStore((s) => s.elapsedMs);
  const status = useRecorderStore((s) => s.status);

  if (status !== "recording" && status !== "paused") return null;

  const totalSecs = Math.floor(elapsedMs / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;

  return (
    <div className="text-center font-mono text-2xl tabular-nums text-muted-foreground">
      {mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
    </div>
  );
}
