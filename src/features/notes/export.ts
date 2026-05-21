import type { Note } from "@/types/note";

export function exportToMarkdown(note: Note): string {
  const { structuredContent, rawTranscript, title, createdAt } = note;
  const date = new Date(createdAt).toLocaleString();
  const sc = structuredContent;

  let md = `# ${title}\n\n`;
  md += `*Created: ${date}*\n\n`;

  if (sc) {
    md += `## Summary\n${sc.summary}\n\n`;
    if (sc.keyPoints.length) {
      md += `## Key Points\n`;
      sc.keyPoints.forEach((p) => (md += `- ${p}\n`));
      md += "\n";
    }
    if (sc.todos.length) {
      md += `## Todos\n`;
      sc.todos.forEach((t) => (md += `- [${t.done ? "x" : " "}] ${t.text}\n`));
      md += "\n";
    }
    if (sc.dates.length) {
      md += `## Key Dates\n`;
      sc.dates.forEach((d) => (md += `- ${d.text}: ${d.date || "TBD"}\n`));
      md += "\n";
    }
  }

  md += `## Original Transcript\n\n${rawTranscript}\n`;
  return md;
}

export function exportToText(note: Note): string {
  const { structuredContent, rawTranscript, title } = note;
  const sc = structuredContent;
  let txt = `${title}\n${"=".repeat(title.length)}\n\n`;

  if (sc) {
    if (sc.summary) txt += `${sc.summary}\n\n`;
    if (sc.keyPoints.length) {
      sc.keyPoints.forEach((p) => (txt += `• ${p}\n`));
      txt += "\n";
    }
    if (sc.todos.length) {
      sc.todos.forEach((t) => (txt += `☐ ${t.text}\n`));
      txt += "\n";
    }
  }
  txt += `--- Original Transcript ---\n${rawTranscript}`;
  return txt;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportNote(note: Note, format: "markdown" | "pdf" | "text") {
  const safeTitle = note.title.replace(/[^a-zA-Z0-9一-鿿]/g, "_").slice(0, 50);
  const date = new Date().toISOString().slice(0, 10);

  switch (format) {
    case "markdown": {
      const md = exportToMarkdown(note);
      downloadFile(md, `${safeTitle}_${date}.md`, "text/markdown");
      break;
    }
    case "text": {
      const txt = exportToText(note);
      downloadFile(txt, `${safeTitle}_${date}.txt`, "text/plain");
      break;
    }
    case "pdf": {
      // PDF via browser print — simple, works offline
      const md = exportToMarkdown(note);
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(`<pre style="white-space:pre-wrap;font-family:system-ui;padding:2rem;max-width:800px;margin:auto;background:#1a1a2e;color:#e8e8f0;line-height:1.8;">${md.replace(/</g, "&lt;")}</pre>`);
        w.document.close();
        setTimeout(() => w.print(), 500);
      }
      break;
    }
  }
}
