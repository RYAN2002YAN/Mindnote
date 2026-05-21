"use client";

import { useCallback, useEffect } from "react";
import { create } from "zustand";
import type { Note, Notebook, Tag, NoteColor, StructuredContent } from "@/types/note";
import { getAllNotes, getNote, saveNote, deleteNote, getAllNotebooks, saveNotebook, deleteNotebook, getAllTags, saveTag, deleteTag } from "@/features/storage/indexedDB";
import { addPendingSync } from "@/features/storage/indexedDB";

interface NotesState {
  notes: Note[];
  notebooks: Notebook[];
  tags: Tag[];
  selectedNoteId: string | null;
  selectedNote: Note | null;
  isLoading: boolean;
  setSelectedNoteId: (id: string | null) => void;
  loadNotes: () => Promise<void>;
  loadNotebooks: () => Promise<void>;
  loadTags: () => Promise<void>;
  createNote: (data?: Partial<Note>) => Promise<Note>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  createNotebook: (name: string, color?: NoteColor) => Promise<Notebook>;
  updateNotebook: (id: string, data: Partial<Notebook>) => Promise<void>;
  removeNotebook: (id: string) => Promise<void>;
  createTag: (name: string, color?: NoteColor) => Promise<Tag>;
  removeTag: (id: string) => Promise<void>;
  setStructuredContent: (noteId: string, content: StructuredContent) => Promise<void>;
}

function generateId(): string {
  return crypto.randomUUID();
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  notebooks: [],
  tags: [],
  selectedNoteId: null,
  selectedNote: null,
  isLoading: false,

  setSelectedNoteId: (id) => {
    set({ selectedNoteId: id });
    if (id) {
      getNote(id).then((note) => {
        set({ selectedNote: note ?? null });
      });
    } else {
      set({ selectedNote: null });
    }
  },

  loadNotes: async () => {
    const notes = await getAllNotes();
    set({ notes });
  },

  loadNotebooks: async () => {
    const notebooks = await getAllNotebooks();
    set({ notebooks });
  },

  loadTags: async () => {
    const tags = await getAllTags();
    set({ tags });
  },

  createNote: async (data) => {
    const now = Date.now();
    const note: Note = {
      id: generateId(),
      title: "Untitled Note",
      rawTranscript: "",
      structuredContent: null,
      notebookId: null,
      tags: [],
      color: null,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
      audioUrl: null,
      duration: 0,
      syncStatus: "local",
      ...data,
    };
    await saveNote(note);
    await addPendingSync("create", note);
    set((s) => ({ notes: [note, ...s.notes] }));
    return note;
  },

  updateNote: async (id, data) => {
    const existing = get().notes.find((n) => n.id === id);
    if (!existing) return;
    const updated = { ...existing, ...data, updatedAt: Date.now() };
    await saveNote(updated);
    await addPendingSync("update", updated);
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? updated : n)),
      selectedNote: s.selectedNote?.id === id ? updated : s.selectedNote,
    }));
  },

  removeNote: async (id) => {
    await deleteNote(id);
    await addPendingSync("delete", { id });
    set((s) => ({
      notes: s.notes.filter((n) => n.id !== id),
      selectedNote: s.selectedNote?.id === id ? null : s.selectedNote,
      selectedNoteId: s.selectedNoteId === id ? null : s.selectedNoteId,
    }));
  },

  createNotebook: async (name, color) => {
    const now = Date.now();
    const notebook: Notebook = {
      id: generateId(),
      name,
      description: "",
      color: color ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await saveNotebook(notebook);
    set((s) => ({ notebooks: [...s.notebooks, notebook] }));
    return notebook;
  },

  updateNotebook: async (id, data) => {
    const existing = get().notebooks.find((nb) => nb.id === id);
    if (!existing) return;
    const updated = { ...existing, ...data, updatedAt: Date.now() };
    await saveNotebook(updated);
    set((s) => ({
      notebooks: s.notebooks.map((nb) => (nb.id === id ? updated : nb)),
    }));
  },

  removeNotebook: async (id) => {
    await deleteNotebook(id);
    set((s) => ({ notebooks: s.notebooks.filter((nb) => nb.id !== id) }));
  },

  createTag: async (name, color) => {
    const tag: Tag = { id: generateId(), name, color: color ?? null };
    await saveTag(tag);
    set((s) => ({ tags: [...s.tags, tag] }));
    return tag;
  },

  removeTag: async (id) => {
    await deleteTag(id);
    set((s) => ({ tags: s.tags.filter((t) => t.id !== id) }));
  },

  setStructuredContent: async (noteId, content) => {
    const existing = get().notes.find((n) => n.id === noteId);
    if (!existing) return;
    const title = content.title || existing.title;
    const updated = { ...existing, title, structuredContent: content, updatedAt: Date.now() };
    await saveNote(updated);
    set((s) => ({
      notes: s.notes.map((n) => (n.id === noteId ? updated : n)),
      selectedNote: s.selectedNote?.id === noteId ? updated : s.selectedNote,
    }));
  },
}));
