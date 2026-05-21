"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { ROUTES } from "@/lib/constants";

export default function SearchPage() {
  const router = useRouter();

  const handleResultClick = useCallback(
    (id: string) => {
      router.push(ROUTES.NOTE(id));
    },
    [router]
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Search</h1>
      <SearchBar autoFocus onResultClick={handleResultClick} />
    </div>
  );
}
