import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindNote — ADHD Voice Notes",
  description:
    "ADHD-friendly voice-driven real-time note-taking assistant. Capture thoughts instantly, auto-organize with AI.",
  keywords: ["ADHD", "voice notes", "transcription", "AI notes", "productivity"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
