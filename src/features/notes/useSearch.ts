"use client";

import { useCallback, useState } from "react";
import { searchNotes } from "@/features/storage/indexedDB";
import type { Note } from "@/types/note";

export function useSearch() {
  const [results, setResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");

  const search = useCallback(async (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const notes = await searchNotes(q);
      setResults(notes);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return { results, isSearching, query, search };
}
