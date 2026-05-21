"use client";

import { format } from "date-fns";
import { FileText, Star, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Note } from "@/types/note";
import { NOTE_COLORS } from "@/types/note";

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  const colorClasses = note.color ? NOTE_COLORS[note.color] : null;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      layout
    >
      <Card
        className={`
          p-4 cursor-pointer hover:border-primary/30 transition-colors
          ${colorClasses?.bg || ""}
        `}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground leading-snug line-clamp-1">
            {note.title || "Untitled Note"}
          </h3>
          {note.isFavorite && <Star className="size-4 text-amber-400 shrink-0 fill-amber-400" />}
        </div>

        {note.structuredContent?.summary ? (
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
            {note.structuredContent.summary}
          </p>
        ) : note.rawTranscript ? (
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
            {note.rawTranscript}
          </p>
        ) : null}

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {note.tags.slice(0, 3).map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-xs">
              {tag.name}
            </Badge>
          ))}
          {note.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">+{note.tags.length - 3}</span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {note.duration > 0
              ? `${Math.floor(note.duration / 60)}m ${note.duration % 60}s`
              : format(note.createdAt, "MMM d, HH:mm")}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="size-3" />
            {note.rawTranscript.length > 0
              ? `${Math.ceil(note.rawTranscript.length / 100)} words`
              : "empty"}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
