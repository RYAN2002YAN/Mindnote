"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Notebook } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { NoteCard } from "@/components/NoteCard";
import { useNotesStore } from "@/features/notes/useNotes";
import { ROUTES } from "@/lib/constants";

export default function NotesPage() {
  const router = useRouter();
  const notes = useNotesStore((s) => s.notes);
  const createNote = useNotesStore((s) => s.createNote);
  const loadNotes = useNotesStore((s) => s.loadNotes);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleCreate = async () => {
    const note = await createNote();
    router.push(ROUTES.NOTE(note.id));
  };

  const handleNavigate = (id: string) => {
    router.push(ROUTES.NOTE(id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="size-4 mr-1" /> New Note
        </Button>
      </div>

      {/* Search */}
      <SearchBar onResultClick={handleNavigate} />

      {/* Notes grid */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Notebook className="size-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-medium text-muted-foreground">No notes yet</h2>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Go to the Record tab to create your first voice note
          </p>
        </div>
      ) : (
        <motion.div layout className="grid gap-3 sm:grid-cols-2">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => handleNavigate(note.id)}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
