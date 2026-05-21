"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { useAttentionStore } from "./useAttentionStore";
import { format } from "date-fns";

export function AttentionTimeline() {
  const timeline = useAttentionStore((s) => s.timeline);
  const showTimeline = useAttentionStore((s) => s.settings.showTimeline);

  if (!showTimeline || timeline.length === 0) return null;

  // Group entries into 5-minute buckets
  const buckets = useMemo(() => {
    const result: { time: string; avgScore: number; state: string }[] = [];
    const interval = 5 * 60 * 1000; // 5 minutes
    let bucketStart = timeline[0].timestamp;
    let scores: number[] = [];
    let states: string[] = [];

    for (const entry of timeline) {
      if (entry.timestamp - bucketStart > interval) {
        result.push({
          time: format(bucketStart, "HH:mm"),
          avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
          state: states.filter((s) => s === "focused").length > states.length / 2
            ? "focused" : "distracted",
        });
        bucketStart = entry.timestamp;
        scores = [];
        states = [];
      }
      scores.push(entry.score);
      states.push(entry.state);
    }

    if (scores.length > 0) {
      result.push({
        time: format(bucketStart, "HH:mm"),
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        state: states.filter((s) => s === "focused").length > states.length / 2
          ? "focused" : "distracted",
      });
    }

    return result;
  }, [timeline]);

  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">Attention Timeline</h3>
      </div>
      <div className="flex items-end gap-1 h-16">
        {buckets.map((bucket, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(8, (bucket.avgScore / 100) * 64)}px` }}
            className={`flex-1 rounded-sm min-w-[4px] ${
              bucket.state === "focused"
                ? "bg-emerald-500/60"
                : "bg-amber-500/40"
            }`}
            title={`${bucket.time}: ${Math.round(bucket.avgScore)}%`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{buckets[0]?.time}</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500/60" /> Focused
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500/40" /> Distracted
          </span>
        </div>
        <span>{buckets[buckets.length - 1]?.time}</span>
      </div>
    </div>
  );
}
