"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Clock,
  TrendingUp,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAttentionStore } from "./useAttentionStore";

export function DailyReport() {
  const generateDailyReport = useAttentionStore((s) => s.generateDailyReport);
  const report = useAttentionStore((s) => s.dailyReport);
  const timeline = useAttentionStore((s) => s.timeline);

  if (timeline.length === 0 && !report) return null;

  return (
    <div className="p-4 rounded-xl bg-card border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Daily Focus Report</h3>
        </div>
        <Button variant="outline" size="sm" onClick={generateDailyReport}>
          <Zap className="size-3 mr-1" /> Generate
        </Button>
      </div>

      {report && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 text-center">
              <Clock className="size-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-2xl font-bold text-emerald-400">
                {report.totalFocusMinutes}m
              </div>
              <div className="text-xs text-muted-foreground">Total Focus</div>
            </Card>
            <Card className="p-3 text-center">
              <Brain className="size-4 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-primary">
                {report.averageAttentionScore}%
              </div>
              <div className="text-xs text-muted-foreground">Avg Attention</div>
            </Card>
          </div>

          <Separator />

          <div className="text-sm text-muted-foreground space-y-1">
            <p className="flex items-center gap-1">
              <ChevronRight className="size-3" />
              Best focus hour: <span className="font-medium text-foreground">{report.peakFocusHour}:00</span>
            </p>
            <p className="flex items-center gap-1">
              <ChevronRight className="size-3" />
              Distracted time: <span className="font-medium text-foreground">{report.totalDistractedMinutes}m</span>
            </p>
          </div>
        </motion.div>
      )}

      {!report && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Click Generate to see your daily focus insights.
        </p>
      )}
    </div>
  );
}
