"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { RecordButton, RecordingTimer } from "@/components/VoiceRecorder";
import { TranscriptDisplay } from "@/components/TranscriptDisplay";
import { FocusToggle, FocusOverlay } from "@/components/FocusMode";
import { AudioPlayer } from "@/features/audio/AudioPlayer";
import { useRecorderStore } from "@/features/audio/useRecorder";
import { useTranscription, useTranscriptionStore } from "@/features/audio/useTranscription";
import { useNotesStore } from "@/features/notes/useNotes";
import { useStructuring, useStructuringStore } from "@/features/ai/useStructuring";
import { DEFAULT_AI_CONFIG } from "@/types/ai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const [showStructured, setShowStructured] = useState(false);
  const audioUrl = useRecorderStore((s) => s.audioUrl);
  const status = useRecorderStore((s) => s.status);
  const text = useTranscriptionStore((s) => s.text);
  const { transcribeWithWhisper } = useTranscription();
  const { runStructuring } = useStructuring();
  const { isStructuring, result } = useStructuringStore();
  const createNote = useNotesStore((s) => s.createNote);
  const setStructuredContent = useNotesStore((s) => s.setStructuredContent);

  const handleTranscribe = useCallback(async () => {
    const blob = useRecorderStore.getState().audioBlob;
    if (!blob) return;

    const apiKey = localStorage.getItem("mindnote_openai_key") || "";
    const text = await transcribeWithWhisper(blob, apiKey);

    if (text) {
      const duration = Math.floor(useRecorderStore.getState().elapsedMs / 1000);
      const note = await createNote({
        rawTranscript: text,
        title: text.slice(0, 60),
        duration,
        audioUrl: useRecorderStore.getState().audioUrl,
      });

      const aiKey = localStorage.getItem("mindnote_ai_key") || "";
      if (aiKey) {
        const result = await runStructuring(text, "auto", {
          ...DEFAULT_AI_CONFIG,
          apiKey: aiKey,
        });
        if (result) {
          setStructuredContent(note.id, result);
          setShowStructured(true);
        }
      }
    }
  }, [transcribeWithWhisper, createNote, runStructuring, setStructuredContent]);

  const handleReset = useCallback(() => {
    useRecorderStore.getState().reset();
    useTranscriptionStore.getState().reset();
    useStructuringStore.getState().reset();
    setShowStructured(false);
  }, []);

  const hasTranscript = text.length > 0;

  return (
    <FocusOverlay>
      <div className="min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <span className="font-semibold text-lg">MindNote</span>
          </div>
          <FocusToggle />
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full">
          {!hasTranscript && status === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Capture your thoughts</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  Speak freely. We&apos;ll organize everything.
                </p>
              </div>
              <RecordButton />
              <RecordingTimer />
            </motion.div>
          )}

          {(status === "recording" || status === "paused") && (
            <div className="text-center space-y-6 w-full">
              <RecordingTimer />
              <TranscriptDisplay />
              <RecordButton />
            </div>
          )}

          {!showStructured && hasTranscript && (
            <div className="space-y-6 w-full">
              <RecordButton />
              <TranscriptDisplay />
              {audioUrl && <AudioPlayer audioUrl={audioUrl} />}
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" onClick={handleReset}>Record Again</Button>
                {!result && (
                  <Button onClick={handleTranscribe} disabled={isStructuring}>
                    <Sparkles className="size-4 mr-1" />
                    Structure with AI
                  </Button>
                )}
              </div>
            </div>
          )}

          {showStructured && result && (
            <div className="space-y-6 w-full">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="size-3" /> AI Structured
                </Badge>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowStructured(false)}>
                    View Raw
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>New Recording</Button>
                </div>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border">
                <h2 className="text-xl font-semibold mb-2">{result.title}</h2>
                <p className="text-muted-foreground mb-4">{result.summary}</p>
                {result.keyPoints.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Key Points</h3>
                    <ul className="space-y-1.5">
                      {result.keyPoints.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="mt-1.5 size-1.5 rounded-full bg-accent shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.todos.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Action Items</h3>
                    {result.todos.map((t: { text: string; done: boolean }, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="size-4 rounded border-2 border-muted-foreground" />
                        {t.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </FocusOverlay>
  );
}
