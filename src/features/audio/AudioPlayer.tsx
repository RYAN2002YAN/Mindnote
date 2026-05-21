"use client";

import { useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  audioUrl: string;
  onReplay?: () => void;
}

export function AudioPlayer({ audioUrl, onReplay }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <Button
        variant="outline"
        size="icon-sm"
        onClick={togglePlay}
        className="shrink-0"
      >
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
      </Button>

      <div className="flex-1 min-w-0">
        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-100"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
          />
        </div>
        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {onReplay && (
        <Button variant="ghost" size="icon-xs" onClick={onReplay} title="Re-transcribe">
          <RotateCcw className="size-3.5" />
        </Button>
      )}

      <Volume2 className="size-4 text-muted-foreground shrink-0" />
    </div>
  );
}
