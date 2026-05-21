# Multimodal Notes Integration (Reserved)

## Overview
This module is reserved for multimodal note support — enabling users to capture notes beyond just voice audio.

## Planned Note Types

```typescript
type NoteType = "voice" | "image" | "video" | "screen-recording" | "sketch" | "mixed";

interface MultimodalNote {
  id: string;
  type: NoteType;
  voiceTranscript?: string;
  images?: ImageAttachment[];
  videoUrl?: string;
  sketches?: SketchData[];
  ocrText?: string;       // extracted from images
  sceneDescription?: string; // AI-generated image description
}
```

## Integration Points
- Extends the existing `Note` type with a `noteType` field
- Adds new capture modes to the Home page recording interface
- Uses the same AI structuring pipeline (DeepSeek V4) for multimodal content
- Image OCR via Tesseract.js (browser-based, no backend needed)
- Screen recording via Screen Capture API
