import { getPendingSyncItems, removePendingSync, isOnline } from "./indexedDB";
import { syncNoteToCloud, deleteNoteFromCloud } from "./supabase";
import { getAllNotes } from "./indexedDB";
import type { Note } from "@/types/note";

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

export async function pushPendingChanges(): Promise<SyncResult> {
  const result: SyncResult = { success: true, synced: 0, failed: 0, errors: [] };
  if (!isOnline()) {
    result.success = false;
    result.errors.push("Offline — cannot sync");
    return result;
  }

  const pendingItems = await getPendingSyncItems();

  for (const item of pendingItems) {
    try {
      const { action, payload } = item as { id: string; action: string; payload: any; timestamp: number };

      switch (action) {
        case "create":
        case "update":
          await syncNoteToCloud(payload as Note);
          break;
        case "delete":
          await deleteNoteFromCloud(payload.id);
          break;
      }

      await removePendingSync((item as any).id);
      result.synced++;
    } catch (err) {
      result.failed++;
      result.errors.push(`Failed to sync ${(item as any).action}: ${err}`);
    }
  }

  // Mark successfully synced notes
  const notes = await getAllNotes();
  for (const note of notes) {
    if (note.syncStatus === "pending") {
      note.syncStatus = "synced";
      const { saveNote } = await import("./indexedDB");
      await saveNote(note);
    }
  }

  result.success = result.failed === 0;
  return result;
}

export function startOnlineListener(onStatusChange: (online: boolean) => void) {
  if (typeof window === "undefined") return () => {};

  const handler = () => onStatusChange(navigator.onLine);
  window.addEventListener("online", handler);
  window.addEventListener("offline", handler);

  return () => {
    window.removeEventListener("online", handler);
    window.removeEventListener("offline", handler);
  };
}
