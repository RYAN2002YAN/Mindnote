"use client";

import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FocusState {
  enabled: boolean;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
}

export const useFocusStore = create<FocusState>((set) => ({
  enabled: false,
  toggle: () => set((s) => ({ enabled: !s.enabled })),
  enable: () => set({ enabled: true }),
  disable: () => set({ enabled: false }),
}));

export function FocusToggle() {
  const enabled = useFocusStore((s) => s.enabled);
  const toggle = useFocusStore((s) => s.toggle);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className={enabled ? "text-primary" : ""}
    >
      <EyeOff className="size-4 mr-1" />
      {enabled ? "Exit Focus" : "Focus Mode"}
    </Button>
  );
}

export function FocusOverlay({ children }: { children: React.ReactNode }) {
  const enabled = useFocusStore((s) => s.enabled);

  return (
    <AnimatePresence>
      {enabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background flex items-center justify-center focus-mode overflow-auto"
        >
          <div className="absolute top-4 right-4">
            <FocusToggle />
          </div>
          <div className="w-full max-w-2xl px-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
