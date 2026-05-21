"use client";

import { useCallback, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/features/notes/useSearch";

interface SearchBarProps {
  autoFocus?: boolean;
  onResultClick?: (id: string) => void;
}

export function SearchBar({ autoFocus, onResultClick }: SearchBarProps) {
  const { results, isSearching, query, search } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search(val), 150);
    },
    [search]
  );

  const handleClear = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    search("");
  }, [search]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search notes..."
          onChange={handleChange}
          className="pl-9 pr-9"
        />
        {query && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="size-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {query && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-auto">
          {results.map((note) => (
            <button
              key={note.id}
              className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors"
              onClick={() => {
                onResultClick?.(note.id);
                handleClear();
              }}
            >
              <div className="font-medium text-sm line-clamp-1">{note.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {note.rawTranscript.slice(0, 100)}
              </div>
            </button>
          ))}
        </div>
      )}

      {query && !isSearching && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 p-4 text-center text-sm text-muted-foreground">
          No notes found
        </div>
      )}
    </div>
  );
}
