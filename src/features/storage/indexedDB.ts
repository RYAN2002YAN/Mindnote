import { openDB, IDBPDatabase } from "idb";
import { DB_NAME, DB_VERSION, STORES } from "@/lib/constants";
import type { Note, Notebook, Tag } from "@/types/note";

interface MindNoteDB {
  [STORES.NOTES]: {
    key: string;
    value: Note;
    indexes: { "by-notebook": string; "by-updated": number; "by-status": string };
  };
  [STORES.NOTEBOOKS]: {
    key: string;
    value: Notebook;
  };
  [STORES.TAGS]: {
    key: string;
    value: Tag;
  };
  [STORES.RECORDINGS]: {
    key: string;
    value: { id: string; blob: Blob; noteId: string; createdAt: number };
  };
  [STORES.PENDING_SYNC]: {
    key: string;
    value: { id: string; action: "create" | "update" | "delete"; payload: unknown; timestamp: number };
  };
}

let dbInstance: IDBPDatabase<MindNoteDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<MindNoteDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<MindNoteDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORES.NOTES)) {
        const notesStore = db.createObjectStore(STORES.NOTES, { keyPath: "id" });
        notesStore.createIndex("by-notebook", "notebookId");
        notesStore.createIndex("by-updated", "updatedAt");
        notesStore.createIndex("by-status", "syncStatus");
      }
      if (!db.objectStoreNames.contains(STORES.NOTEBOOKS)) {
        db.createObjectStore(STORES.NOTEBOOKS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.TAGS)) {
        db.createObjectStore(STORES.TAGS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.RECORDINGS)) {
        db.createObjectStore(STORES.RECORDINGS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.PENDING_SYNC)) {
        db.createObjectStore(STORES.PENDING_SYNC, { keyPath: "id" });
      }
    },
  });

  return dbInstance;
}

// Notes CRUD
export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB();
  const notes = await db.getAll(STORES.NOTES);
  return notes.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getNote(id: string): Promise<Note | undefined> {
  const db = await getDB();
  return db.get(STORES.NOTES, id);
}

export async function saveNote(note: Note): Promise<void> {
  const db = await getDB();
  note.updatedAt = Date.now();
  await db.put(STORES.NOTES, note);
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORES.NOTES, id);
}

export async function getNotesByNotebook(notebookId: string): Promise<Note[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORES.NOTES, "by-notebook", notebookId);
}

export async function searchNotes(query: string): Promise<Note[]> {
  const db = await getDB();
  const all = await db.getAll(STORES.NOTES);
  const lower = query.toLowerCase();
  return all
    .filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        n.rawTranscript.toLowerCase().includes(lower) ||
        n.structuredContent?.summary.toLowerCase().includes(lower) ||
        n.structuredContent?.keyPoints.some((p) => p.toLowerCase().includes(lower)) ||
        n.tags.some((t) => t.name.toLowerCase().includes(lower))
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

// Notebooks CRUD
export async function getAllNotebooks(): Promise<Notebook[]> {
  const db = await getDB();
  return db.getAll(STORES.NOTEBOOKS);
}

export async function saveNotebook(notebook: Notebook): Promise<void> {
  const db = await getDB();
  notebook.updatedAt = Date.now();
  await db.put(STORES.NOTEBOOKS, notebook);
}

export async function deleteNotebook(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORES.NOTEBOOKS, id);
}

// Tags CRUD
export async function getAllTags(): Promise<Tag[]> {
  const db = await getDB();
  return db.getAll(STORES.TAGS);
}

export async function saveTag(tag: Tag): Promise<void> {
  const db = await getDB();
  await db.put(STORES.TAGS, tag);
}

export async function deleteTag(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORES.TAGS, id);
}

// Recordings
export async function saveRecording(id: string, blob: Blob, noteId: string): Promise<void> {
  const db = await getDB();
  await db.put(STORES.RECORDINGS, { id, blob, noteId, createdAt: Date.now() });
}

export async function getRecording(id: string): Promise<Blob | undefined> {
  const db = await getDB();
  const record = await db.get(STORES.RECORDINGS, id);
  return record?.blob;
}

// Pending sync queue
export async function addPendingSync(action: "create" | "update" | "delete", payload: unknown): Promise<void> {
  const db = await getDB();
  const id = crypto.randomUUID();
  await db.put(STORES.PENDING_SYNC, { id, action, payload, timestamp: Date.now() });
}

export async function getPendingSyncItems(): Promise<unknown[]> {
  const db = await getDB();
  const items = await db.getAll(STORES.PENDING_SYNC);
  return items.sort((a, b) => a.timestamp - b.timestamp);
}

export async function removePendingSync(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORES.PENDING_SYNC, id);
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
}
