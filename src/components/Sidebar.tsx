"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Mic,
  FileText,
  Search,
  Settings,
  BookOpen,
  Tag,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotesStore } from "@/features/notes/useNotes";
import { ROUTES } from "@/lib/constants";

const NAV_ITEMS = [
  { href: ROUTES.HOME, icon: Mic, label: "Record" },
  { href: ROUTES.NOTES, icon: FileText, label: "Notes" },
  { href: ROUTES.SEARCH, icon: Search, label: "Search" },
  { href: ROUTES.SETTINGS, icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const notebooks = useNotesStore((s) => s.notebooks);
  const tags = useNotesStore((s) => s.tags);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 relative"
      transition={{ duration: 0.2 }}
    >
      {/* Collapse toggle */}
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 z-10 size-6 rounded-full border border-border bg-background"
      >
        {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
      </Button>

      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Mic className="size-4 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-sidebar-foreground text-sm"
            >
              MindNote
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Main nav */}
      <nav className="px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="block">
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={`w-full justify-start ${collapsed ? "px-0 justify-center" : ""}`}
              >
                <item.icon className={`size-4 ${isActive ? "text-primary" : ""}`} />
                {!collapsed && <span className="ml-2">{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <ScrollArea className="flex-1 px-4 py-4">
          {/* Notebooks */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase">
                Notebooks
              </span>
              <Button variant="ghost" size="icon-xs">
                <Plus className="size-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {notebooks.slice(0, 5).map((nb) => (
                <div key={nb.id} className="flex items-center gap-2 text-sm text-sidebar-foreground/80 py-1 px-2 rounded-md hover:bg-sidebar-accent">
                  <BookOpen className="size-3.5" />
                  <span className="truncate">{nb.name}</span>
                </div>
              ))}
              {notebooks.length === 0 && (
                <p className="text-xs text-sidebar-foreground/40 px-2">No notebooks yet</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase">
                Tags
              </span>
              <Button variant="ghost" size="icon-xs">
                <Plus className="size-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 10).map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  <Tag className="size-2.5 mr-1" />
                  {tag.name}
                </Badge>
              ))}
              {tags.length === 0 && (
                <p className="text-xs text-sidebar-foreground/40 px-2">No tags yet</p>
              )}
            </div>
          </div>
        </ScrollArea>
      )}
    </motion.aside>
  );
}
