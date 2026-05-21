# EEG Brainwave Integration (Reserved)

## Overview
This module is reserved for future EEG device integration. It will enable direct brainwave-based attention measurement for users with EEG headsets (e.g., Muse, NeuroSky, OpenBCI).

## Planned Interface

```typescript
interface EEGDevice {
  connect(): Promise<void>;
  disconnect(): void;
  onBrainwave(callback: (data: BrainwaveData) => void): void;
}

interface BrainwaveData {
  timestamp: number;
  alpha: number;    // 8-13 Hz — relaxed focus
  beta: number;     // 13-30 Hz — active thinking
  theta: number;    // 4-8 Hz — drowsiness
  delta: number;    // 0.5-4 Hz — deep sleep
  gamma: number;    // 30+ Hz — high-level processing
  attention: number; // computed attention score 0-100
  meditation: number; // computed meditation score 0-100
}

interface EEGPlugin {
  id: string;
  name: string;
  device: EEGDevice;
  filterAlgorithm: "moving-average" | "kalman" | "fir";
}
```

## DSP Filter Architecture

The EEG module is designed as a practical application of digital signal processing concepts:

- **Moving Average Filter** (default): Simple sliding window, low computational cost
- **Kalman Filter** (planned): Optimal state estimation for noisy measurements
- **FIR Bandpass Filter** (planned): Extract specific frequency bands (alpha, beta, etc.)

### Plugin Interface for Filter Algorithms

```typescript
interface FilterAlgorithm {
  name: string;
  process(rawSignal: number[]): number[];
  getFrequencyResponse(): { freq: number; magnitude: number }[];
}
```

## Integration Points
- `useAttentionMonitor.ts` can accept EEG data as an alternative attention signal source
- Filter algorithm selection will be available in Settings > Attention Monitor
- EEG attention scores override camera-based estimates when both are available
