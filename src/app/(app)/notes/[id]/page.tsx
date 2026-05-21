"use client";

import { useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteEditor } from "@/components/NoteEditor";
import { AudioPlayer } from "@/features/audio/AudioPlayer";
import { useNotesStore } from "@/features/notes/useNotes";
import { exportNote } from "@/features/notes/export";

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const note = useNotesStore((s) => s.selectedNote);
  const setSelectedNoteId = useNotesStore((s) => s.setSelectedNoteId);
  const updateNote = useNotesStore((s) => s.updateNote);
  const removeNote = useNotesStore((s) => s.removeNote);

  useEffect(() => {
    setSelectedNoteId(id);
    return () => setSelectedNoteId(null);
  }, [id, setSelectedNoteId]);

  const handleDelete = useCallback(async () => {
    await removeNote(id);
    router.push("/notes");
  }, [id, removeNote, router]);

  const handleToggleFavorite = useCallback(() => {
    if (note) updateNote(note.id, { isFavorite: !note.isFavorite });
  }, [note, updateNote]);

  const handleExport = useCallback(
    (format: "markdown" | "pdf" | "text") => {
      if (note) exportNote(note, format);
    },
    [note]
  );

  if (!note) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-muted-foreground">Loading note...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-xl font-bold flex-1">{note.title}</h1>

        <Button variant="ghost" size="icon-sm" onClick={handleToggleFavorite}>
          <Star
            className={`size-4 ${note.isFavorite ? "fill-amber-400 text-amber-400" : ""}`}
          />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => handleExport("markdown")}>
          <Download className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={handleDelete}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>

      {/* Audio player */}
      {note.audioUrl && (
        <AudioPlayer audioUrl={note.audioUrl} />
      )}

      {/* Note content / editor */}
      <NoteEditor note={note} />

      {/* Metadata */}
      <div className="text-xs text-muted-foreground flex gap-4">
        <span>Created: {new Date(note.createdAt).toLocaleString()}</span>
        <span>Updated: {new Date(note.updatedAt).toLocaleString()}</span>
        {note.duration > 0 && <span>Duration: {Math.floor(note.duration / 60)}m {note.duration % 60}s</span>}
      </div>
    </div>
  );
}
