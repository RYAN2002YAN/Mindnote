"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAttentionStore } from "./useAttentionStore";
import type { PetState, PetType } from "./types";

interface PetMonitorProps {
  onSettings?: () => void;
}

export function PetMonitor({ onSettings }: PetMonitorProps) {
  const enabled = useAttentionStore((s) => s.enabled);
  const petState = useAttentionStore((s) => s.petState);
  const score = useAttentionStore((s) => s.currentScore?.score ?? null);
  const petType = useAttentionStore((s) => s.settings.petType);
  const petSize = useAttentionStore((s) => s.settings.petSize);
  const setEnabled = useAttentionStore((s) => s.setEnabled);
  const isCameraReady = useAttentionStore((s) => s.isCameraReady);

  if (!enabled) return null;

  const sizeMap = { small: 64, medium: 80, large: 100 };
  const size = sizeMap[petSize];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"
    >
      {/* Pet controls */}
      <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
        {!isCameraReady && (
          <span className="text-xs text-muted-foreground bg-card px-2 py-1 rounded-full">
            Camera not ready
          </span>
        )}
        {score !== null && (
          <span className="text-xs text-muted-foreground bg-card px-2 py-1 rounded-full">
            Focus: {score}%
          </span>
        )}
        <Button variant="ghost" size="icon-xs" onClick={onSettings}>
          <Settings2 className="size-3" />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={() => setEnabled(false)}>
          <X className="size-3" />
        </Button>
      </div>

      {/* Pet character */}
      <motion.div
        className="relative cursor-pointer select-none"
        style={{ width: size, height: size }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {petType === "penguin" ? (
            <Penguin key="penguin" state={petState} size={size} />
          ) : (
            <Shiba key="shiba" state={petState} size={size} />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Attention score bar */}
      {score !== null && (
        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor:
                score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444",
            }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </motion.div>
  );
}

/* ================================================================
   QQ Penguin — SVG animated character
   States: idle, focused, warning, alert, celebrate
   ================================================================ */
function Penguin({ state, size }: { state: PetState; size: number }) {
  const animations = useMemo(() => {
    switch (state) {
      case "focused":
        return {
          body: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } },
          headTilt: { rotate: [0, 3, 0, -3, 0], transition: { repeat: Infinity, duration: 4 } },
          eyes: { scaleY: [1, 1, 0.3, 1], transition: { repeat: Infinity, duration: 4, times: [0, 0.7, 0.85, 1] } },
          pen: { rotate: [-5, 5, -5], transition: { repeat: Infinity, duration: 2 } },
        };
      case "warning":
        return {
          body: { x: [-2, 2, -2], transition: { repeat: Infinity, duration: 0.6 } },
          headTilt: { rotate: [0, -10, 0, -10, 0], transition: { repeat: Infinity, duration: 2 } },
          eyes: { scaleY: [1, 0.8, 1], transition: { repeat: Infinity, duration: 1.5 } },
          arm: { rotate: [0, -20, 0, -20, 0], transition: { repeat: Infinity, duration: 1 } },
        };
      case "alert":
        return {
          body: { y: [0, -8, 0, -8, 0], transition: { repeat: Infinity, duration: 0.5 } },
          headTilt: { rotate: [-5, 5, -5, 5, 0], transition: { repeat: Infinity, duration: 0.4 } },
          exclamation: { opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], transition: { repeat: Infinity, duration: 0.8 } },
        };
      case "celebrate":
        return {
          body: { y: [0, -10, 0], rotate: [0, -5, 5, -5, 0], transition: { repeat: Infinity, duration: 1.5 } },
          confetti: { opacity: [0, 1, 0], transition: { repeat: Infinity, duration: 1 } },
        };
      default: // idle
        return {
          body: { y: [0, -1, 0], transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } },
          eyes: { scaleY: [1, 1, 0.2, 1], transition: { repeat: Infinity, duration: 5, times: [0, 0.8, 0.9, 1] } },
        };
    }
  }, [state]);

  const scale = size / 80;

  return (
    <motion.svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      animate={animations.body}
      style={{ originY: "70%" }}
    >
      {/* Body */}
      <motion.ellipse
        cx="50" cy="60" rx="28" ry="30"
        fill="#2d3748"
        animate={state === "celebrate" ? { fill: ["#2d3748", "#4a5568", "#2d3748"] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
      />
      {/* White belly */}
      <ellipse cx="50" cy="65" rx="18" ry="20" fill="#e2e8f0" />

      {/* Head */}
      <motion.g animate={animations.headTilt} style={{ originX: "50px", originY: "35px" }}>
        <ellipse cx="50" cy="35" rx="22" ry="18" fill="#2d3748" />
        {/* Eyes */}
        <motion.ellipse cx="41" cy="33" rx="4" ry="5" fill="white" animate={animations.eyes as any} />
        <motion.ellipse cx="59" cy="33" rx="4" ry="5" fill="white" animate={animations.eyes as any} />
        <circle cx="42" cy="33" r="2" fill="#1a202c" />
        <circle cx="60" cy="33" r="2" fill="#1a202c" />
        {/* Beak */}
        <polygon points="47,38 53,38 50,43" fill="#f6ad55" />

        {/* Blush when focused */}
        {state === "focused" && (
          <>
            <circle cx="34" cy="37" r="4" fill="#fc8181" opacity="0.3" />
            <circle cx="66" cy="37" r="4" fill="#fc8181" opacity="0.3" />
          </>
        )}

        {/* Exclamation mark when alert */}
        {state === "alert" && (
          <motion.text
            x="70" y="25"
            fontSize="20" fontWeight="bold" fill="#f6ad55"
            animate={animations.exclamation as any}
          >
            !
          </motion.text>
        )}

        {/* Sparkles when celebrating */}
        {state === "celebrate" && (
          <motion.g animate={animations.confetti as any}>
            <text x="25" y="20" fontSize="12">✦</text>
            <text x="65" y="18" fontSize="14">★</text>
            <text x="30" y="50" fontSize="10">✦</text>
            <text x="68" y="48" fontSize="8">★</text>
          </motion.g>
        )}

        {/* Pen/book when focused */}
        {state === "focused" && (
          <motion.g animate={animations.pen as any} style={{ originX: "25px", originY: "55px" }}>
            <rect x="20" y="50" width="4" height="15" rx="1" fill="#f6ad55" />
            <circle cx="22" cy="50" r="2.5" fill="#f6ad55" />
            <rect x="18" y="62" width="8" height="10" rx="1" fill="#e2e8f0" opacity="0.5" />
          </motion.g>
        )}
      </motion.g>

      {/* Arms / flippers */}
      <motion.ellipse
        cx="22" cy="55" rx="8" ry="14"
        fill="#2d3748"
        animate={state === "warning" ? (animations.arm as any) : {}}
        style={{ originX: "22px", originY: "55px" }}
      />
      <ellipse cx="78" cy="55" rx="8" ry="14" fill="#2d3748" />

      {/* Feet */}
      <ellipse cx="38" cy="90" rx="10" ry="5" fill="#f6ad55" />
      <ellipse cx="62" cy="90" rx="10" ry="5" fill="#f6ad55" />
    </motion.svg>
  );
}

/* ================================================================
   Shiba Inu — SVG animated character
   States: idle, focused, warning, alert, celebrate
   ================================================================ */
function Shiba({ state, size }: { state: PetState; size: number }) {
  const animations = useMemo(() => {
    switch (state) {
      case "focused":
        return {
          head: { rotate: [0, 2, 0], transition: { repeat: Infinity, duration: 3 } },
          tail: { rotate: [-10, 10, -10], transition: { repeat: Infinity, duration: 2 } },
        };
      case "warning":
        return {
          head: { rotate: [0, -15, 0, -15, 0], transition: { repeat: Infinity, duration: 1.5 } },
          ear: { scaleY: [1, 1.2, 1], transition: { repeat: Infinity, duration: 1 } },
        };
      case "alert":
        return {
          body: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 0.6 } },
          head: { rotate: [-3, 3, -3], transition: { repeat: Infinity, duration: 0.3 } },
        };
      case "celebrate":
        return {
          body: { y: [0, -8, 0], rotate: [0, -5, 5, 0], transition: { repeat: Infinity, duration: 1.2 } },
        };
      default:
        return {
          tail: { rotate: [-5, 5, -5], transition: { repeat: Infinity, duration: 3 } },
        };
    }
  }, [state]);

  return (
    <motion.svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      animate={animations.body as any}
    >
      {/* Tail */}
      <motion.g animate={animations.tail as any} style={{ originX: "70px", originY: "55px" }}>
        <ellipse cx="75" cy="45" rx="8" ry="14" fill="#f6ad55" transform="rotate(30 75 45)" />
      </motion.g>

      {/* Body */}
      <ellipse cx="50" cy="60" rx="22" ry="18" fill="#f6ad55" />
      <ellipse cx="50" cy="64" rx="14" ry="12" fill="#fffaf0" />

      {/* Head */}
      <motion.g animate={animations.head as any} style={{ originX: "50px", originY: "40px" }}>
        <circle cx="50" cy="40" r="18" fill="#f6ad55" />
        {/* Face white area */}
        <ellipse cx="50" cy="44" rx="12" ry="10" fill="#fffaf0" />

        {/* Ears */}
        <motion.polygon
          points="35,28 30,12 42,24"
          fill="#e8740c"
          animate={animations.ear as any}
          style={{ originX: "35px", originY: "28px" }}
        />
        <motion.polygon
          points="65,28 70,12 58,24"
          fill="#e8740c"
          animate={animations.ear as any}
          style={{ originX: "65px", originY: "28px" }}
        />

        {/* Eyes */}
        <circle cx="43" cy="38" r="2.5" fill="#1a202c" />
        <circle cx="57" cy="38" r="2.5" fill="#1a202c" />

        {/* Nose */}
        <ellipse cx="50" cy="44" rx="3" ry="2" fill="#1a202c" />
        {/* Mouth */}
        <path d="M47 47 Q50 51 53 47" stroke="#1a202c" strokeWidth="1" fill="none" />

        {state === "focused" && (
          <>
            <text x="28" y="30" fontSize="10">📖</text>
          </>
        )}

        {state === "alert" && (
          <motion.text
            x="62" y="22" fontSize="18" fontWeight="bold" fill="#e8740c"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          >
            !
          </motion.text>
        )}
      </motion.g>

      {/* Legs */}
      <ellipse cx="38" cy="82" rx="6" ry="4" fill="#e8740c" />
      <ellipse cx="62" cy="82" rx="6" ry="4" fill="#e8740c" />
    </motion.svg>
  );
}
