"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  FileText,
  Copy,
  Download,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { Note } from "@/types/note";
import { useStructuring, useStructuringStore } from "@/features/ai/useStructuring";
import { useNotesStore } from "@/features/notes/useNotes";
import { DEFAULT_AI_CONFIG } from "@/types/ai";

interface NoteEditorProps {
  note: Note;
}

export function NoteEditor({ note }: NoteEditorProps) {
  const [activeTab, setActiveTab] = useState("structured");
  const { runStructuring } = useStructuring();
  const { isStructuring, error } = useStructuringStore();
  const setStructuredContent = useNotesStore((s) => s.setStructuredContent);

  const handleStructure = useCallback(async () => {
    const config = {
      ...DEFAULT_AI_CONFIG,
      apiKey: localStorage.getItem("mindnote_ai_key") || "",
    };
    const result = await runStructuring(note.rawTranscript, "auto", config);
    if (result) {
      setStructuredContent(note.id, result);
    }
  }, [note, runStructuring, setStructuredContent]);

  const handleCopyTranscript = useCallback(() => {
    navigator.clipboard.writeText(note.rawTranscript);
  }, [note.rawTranscript]);

  const sc = note.structuredContent;

  if (!note.rawTranscript) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <p>No transcript available. Record something first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {!sc && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleStructure}
            disabled={isStructuring || !note.rawTranscript}
          >
            {isStructuring ? (
              <Loader2 className="size-4 mr-1 animate-spin" />
            ) : (
              <Brain className="size-4 mr-1" />
            )}
            Structure with AI
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={handleCopyTranscript}>
          <Copy className="size-4 mr-1" /> Copy
        </Button>
        <Button variant="ghost" size="sm" onClick={() => {}}>
          <RotateCcw className="size-4 mr-1" /> Re-transcribe
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Content tabs */}
      {sc ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="structured">
              <Brain className="size-4 mr-1" /> Structured
            </TabsTrigger>
            <TabsTrigger value="raw">
              <FileText className="size-4 mr-1" /> Raw Transcript
            </TabsTrigger>
          </TabsList>

          <TabsContent value="structured" className="mt-4">
            <StructuredView sc={sc} />
          </TabsContent>

          <TabsContent value="raw" className="mt-4">
            <div className="p-4 rounded-lg bg-muted/50 whitespace-pre-wrap text-foreground leading-relaxed">
              {note.rawTranscript}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="p-4 rounded-lg bg-muted/50 whitespace-pre-wrap text-foreground leading-relaxed">
          {note.rawTranscript}
        </div>
      )}
    </div>
  );
}

function StructuredView({ sc }: { sc: NonNullable<Note["structuredContent"]> }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Summary
        </h3>
        <p className="text-foreground leading-relaxed">{sc.summary}</p>
      </div>

      <Separator />

      {/* Key Points */}
      {sc.keyPoints.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Key Points
          </h3>
          <ul className="space-y-2">
            {sc.keyPoints.map((point, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 text-foreground"
              >
                <span className="mt-1.5 size-1.5 rounded-full bg-accent shrink-0" />
                {point}
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Todos */}
      {sc.todos.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Action Items
          </h3>
          <div className="space-y-2">
            {sc.todos.map((todo, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
                <div className={`size-4 rounded border-2 flex items-center justify-center ${
                  todo.done ? "bg-accent border-accent" : "border-muted-foreground"
                }`}>
                  {todo.done && <span className="text-xs">✓</span>}
                </div>
                <span className={todo.done ? "line-through text-muted-foreground" : "text-foreground"}>
                  {todo.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* People & Dates */}
      {(sc.people.length > 0 || sc.dates.length > 0 || sc.links.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {sc.people.map((person, i) => (
            <Badge key={i} variant="outline">{person}</Badge>
          ))}
          {sc.dates.map((d, i) => (
            <Badge key={i} variant="secondary">
              {d.text}
              {d.date && <span className="ml-1 text-xs">({new Date(d.date).toLocaleDateString()})</span>}
            </Badge>
          ))}
          {sc.links.map((link, i) => (
            <Badge key={i} variant="outline" className="text-accent">
              <a href={link} target="_blank" rel="noreferrer">{link.slice(0, 30)}...</a>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
