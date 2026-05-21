"use client";

import { motion } from "framer-motion";
import { useTranscriptionStore } from "@/features/audio/useTranscription";
import { useRecorderStore } from "@/features/audio/useRecorder";

export function TranscriptDisplay() {
  const text = useTranscriptionStore((s) => s.text);
  const interim = useTranscriptionStore((s) => s.interimText);
  const status = useRecorderStore((s) => s.status);

  const isActive = status === "recording" || status === "paused";

  if (!text && !interim && status === "idle") {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground text-lg">
          Your words will appear here in real-time...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="p-6 rounded-xl bg-card border border-border/50">
        <div className="text-lg leading-relaxed whitespace-pre-wrap text-foreground">
          {text}
          {interim && (
            <span className="text-muted-foreground italic">
              {" "}{interim}
            </span>
          )}
        </div>
        {isActive && !text && !interim && (
          <span className="inline-block animate-pulse-soft text-muted-foreground">
            Listening...
          </span>
        )}
      </div>
    </motion.div>
  );
}
