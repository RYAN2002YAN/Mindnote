# MindNote — ADHD Voice-Driven Real-Time Note Assistant

An open-source, ADHD-friendly voice note assistant that captures your thoughts in real-time and automatically organizes them with AI.

## Why MindNote?

ADHD makes traditional note-taking painful: you miss things while writing, get distracted, lose your notes, and can't organize them. MindNote solves this with **one-tap voice recording**, **real-time transcription**, and **automatic AI structuring** — all in a minimal, distraction-free interface.

## Core Features

- **One-Tap Voice Recording** — Tap a big button and speak. Real-time transcription appears on screen with <500ms latency.
- **AI Auto-Structuring** — DeepSeek V4 transforms messy speech into structured notes with titles, key points, todos, dates, and mind maps.
- **Distraction-Free Design** — Dark theme by default, minimal UI, focus mode that hides everything except your current note.
- **Local-First Storage** — All data lives in your browser (IndexedDB). Works offline, auto-syncs to Supabase when online.
- **Cross-Device Sync** — Sign in to sync notes across all your devices.
- **Export Anywhere** — Export notes as Markdown, PDF, or plain text.
- **Bilingual Support** — Chinese (中文) and English speech recognition.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animation | Framer Motion |
| Icons | Lucide React |
| State | Zustand |
| Local DB | IndexedDB (via idb) |
| Cloud DB | Supabase |
| Auth | Supabase Auth |
| Transcription | OpenAI Whisper |
| AI Structuring | DeepSeek V4 |

## Project Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home — recording interface
│   ├── (app)/              # Authenticated app shell
│   │   ├── notes/          # Notes list & detail
│   │   ├── search/         # Full-text search
│   │   └── settings/       # API keys, account
│   └── auth/               # Login & auth callback
├── components/             # Shared UI components
│   ├── ui/                 # shadcn/ui primitives
│   ├── VoiceRecorder.tsx   # Core recording button
│   ├── TranscriptDisplay.tsx
│   ├── NoteCard.tsx
│   ├── NoteEditor.tsx
│   ├── SearchBar.tsx
│   ├── Sidebar.tsx
│   └── FocusMode.tsx
├── features/               # Feature modules (swappable)
│   ├── audio/              # Voice recording & transcription
│   ├── ai/                 # AI model interface
│   ├── notes/              # Note CRUD, search, export
│   ├── storage/            # IndexedDB + Supabase sync
│   ├── auth/               # Supabase auth
│   └── extensions/         # Reserved: EEG, multimodal, collaboration
│       ├── eeg/            # EEG brainwave devices
│       ├── multimodal/     # Image, video, sketch notes
│       └── collaboration/  # Team shared notebooks
├── lib/                    # Utilities & constants
└── types/                  # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/mindnote.git
cd mindnote
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings > API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same location

### 3. Supabase Setup

Run the migration in `supabase/migrations/001_schema.sql` in your Supabase SQL Editor.

Enable Auth providers (Google recommended) in Supabase Authentication settings.

### 4. API Keys (optional)

Set in-app via Settings page (stored locally in your browser):
- **OpenAI API key** — for Whisper transcription
- **DeepSeek API key** — for AI note structuring

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Extension Interfaces

MindNote is built with a modular architecture. Reserved extension points:

| Extension | Description | Status |
|-----------|-------------|--------|
| **EEG** | Brainwave device integration (Muse, NeuroSky) with DSP filters | Planned |
| **Multimodal** | Image, video, sketch, and screen recording notes | Planned |
| **Collaboration** | Team shared notebooks with real-time editing | Planned |

See `src/features/extensions/` for interface documentation.

## Design Principles

1. **Minimalism** — Only what you need, nothing more
2. **Instant Feedback** — Every action has immediate visual response
3. **Low Cognitive Load** — One-button operations, no complex settings
4. **Dark Theme Default** — Eye-soothing warm tones
5. **Accessibility** — Keyboard navigable, large touch targets

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/mindnote)

Or manually:

```bash
npm run build
# Deploy the .next folder to Vercel, Netlify, or any Node.js host
```

## License

MIT — Open source, free forever.

## Contributing

Contributions welcome! See `src/features/extensions/` for planned extension points that need implementation.
