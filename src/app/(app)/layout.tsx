"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { FocusOverlay } from "@/components/FocusMode";
import { useNotesStore } from "@/features/notes/useNotes";
import { useSync } from "@/features/storage/useSync";
import { useAuthInit } from "@/features/auth/useAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useAuthInit();
  useSync();
  const loadNotes = useNotesStore((s) => s.loadNotes);
  const loadNotebooks = useNotesStore((s) => s.loadNotebooks);
  const loadTags = useNotesStore((s) => s.loadTags);

  useEffect(() => {
    loadNotes();
    loadNotebooks();
    loadTags();
  }, [loadNotes, loadNotebooks, loadTags]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <FocusOverlay>
          {children}
        </FocusOverlay>
      </main>
    </div>
  );
}
