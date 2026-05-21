import { createClient } from "@/features/auth/supabase-client";
import type { Note, Notebook, Tag } from "@/types/note";

export async function syncNoteToCloud(note: Note): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("notes").upsert({
    id: note.id,
    user_id: user.id,
    title: note.title,
    raw_transcript: note.rawTranscript,
    structured_content: note.structuredContent,
    notebook_id: note.notebookId,
    tags: note.tags,
    color: note.color,
    is_favorite: note.isFavorite,
    duration: note.duration,
    audio_url: note.audioUrl,
    created_at: new Date(note.createdAt).toISOString(),
    updated_at: new Date(note.updatedAt).toISOString(),
  });

  if (error) throw error;
}

export async function deleteNoteFromCloud(id: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("notes").delete().eq("id", id);
}

export async function syncNotebookToCloud(notebook: Notebook): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("notebooks").upsert({
    id: notebook.id,
    user_id: user.id,
    name: notebook.name,
    description: notebook.description,
    color: notebook.color,
    updated_at: new Date().toISOString(),
  });
}

export async function syncTagToCloud(tag: Tag): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("tags").upsert({
    id: tag.id,
    user_id: user.id,
    name: tag.name,
    color: tag.color,
  });
}

export async function pullNotesFromCloud(): Promise<Note[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error || !data) return [];

  return data.map(mapDBNoteToLocal);
}

function mapDBNoteToLocal(db: any): Note {
  return {
    id: db.id,
    title: db.title,
    rawTranscript: db.raw_transcript || "",
    structuredContent: db.structured_content,
    notebookId: db.notebook_id,
    tags: db.tags || [],
    color: db.color,
    isFavorite: db.is_favorite || false,
    createdAt: new Date(db.created_at).getTime(),
    updatedAt: new Date(db.updated_at).getTime(),
    audioUrl: db.audio_url,
    duration: db.duration || 0,
    syncStatus: "synced",
  };
}
