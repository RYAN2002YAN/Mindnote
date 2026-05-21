"use client";

import { useCallback, useEffect } from "react";
import { create } from "zustand";
import { pushPendingChanges, startOnlineListener } from "./sync";
import { isOnline } from "./indexedDB";

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  setOnline: (v: boolean) => void;
  sync: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  isSyncing: false,
  lastSyncTime: null,
  setOnline: (isOnline) => set({ isOnline }),
  sync: async () => {
    if (get().isSyncing) return;
    if (!isOnline()) return;

    set({ isSyncing: true });
    try {
      await pushPendingChanges();
      set({ lastSyncTime: Date.now() });
    } catch {
      // Sync failed — will retry on next interval
    } finally {
      set({ isSyncing: false });
    }
  },
}));

export function useSync() {
  const { isOnline: online, isSyncing, lastSyncTime, sync } = useSyncStore();

  useEffect(() => {
    const cleanup = startOnlineListener((status) => {
      useSyncStore.getState().setOnline(status);
      if (status) {
        // Auto-sync when coming back online
        useSyncStore.getState().sync();
      }
    });
    return cleanup;
  }, []);

  // Auto-sync every 30 seconds
  useEffect(() => {
    if (!online) return;
    const interval = setInterval(sync, 30000);
    return () => clearInterval(interval);
  }, [online, sync]);

  return { online, isSyncing, lastSyncTime, sync };
}
