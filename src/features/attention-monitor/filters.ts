/**
 * DSP Filter Algorithms for Attention Signal Processing
 *
 * Pluggable architecture — designed for DSP course extension.
 * Each filter implements a common interface for easy swapping.
 */

export interface SignalFilter {
  name: string;
  /** Process a raw signal array and return filtered result */
  process(signal: number[]): number[];
  /** Reset filter internal state */
  reset(): void;
}

// ============================================================
// Moving Average Filter (Default)
// Simple sliding window, O(n), low computational cost.
// Good for: real-time attention score smoothing
// ============================================================
export class MovingAverageFilter implements SignalFilter {
  name = "Moving Average";
  private buffer: number[] = [];
  private windowSize: number;

  constructor(windowSize = 5) {
    this.windowSize = windowSize;
  }

  process(signal: number[]): number[] {
    const result: number[] = [];
    for (const value of signal) {
      this.buffer.push(value);
      if (this.buffer.length > this.windowSize) {
        this.buffer.shift();
      }
      const avg = this.buffer.reduce((a, b) => a + b, 0) / this.buffer.length;
      result.push(Math.round(avg * 100) / 100);
    }
    return result;
  }

  reset(): void {
    this.buffer = [];
  }
}

// ============================================================
// Kalman Filter (Reserved — DSP Course Extension)
// Optimal state estimation for noisy measurements.
// Requires: process noise Q, measurement noise R, initial state
// ============================================================
export class KalmanFilter implements SignalFilter {
  name = "Kalman Filter";
  private x = 0;  // state estimate
  private p = 1;  // error covariance
  private q: number; // process noise covariance
  private r: number; // measurement noise covariance

  constructor(q = 0.01, r = 0.1) {
    this.q = q;
    this.r = r;
  }

  process(signal: number[]): number[] {
    return signal.map((z) => {
      // Prediction
      this.p += this.q;
      // Update
      const k = this.p / (this.p + this.r);
      this.x = this.x + k * (z - this.x);
      this.p = (1 - k) * this.p;
      return Math.round(this.x * 100) / 100;
    });
  }

  reset(): void {
    this.x = 0;
    this.p = 1;
  }
}

// ============================================================
// FIR Lowpass Filter (Reserved — DSP Course Extension)
// Finite Impulse Response filter with configurable coefficients.
// ============================================================
export class FIRFilter implements SignalFilter {
  name = "FIR Lowpass";
  private coefficients: number[];
  private buffer: number[] = [];

  // Default: 5-tap FIR lowpass with normalized coefficients
  constructor(coefficients?: number[]) {
    this.coefficients = coefficients ?? [0.1, 0.2, 0.4, 0.2, 0.1];
  }

  process(signal: number[]): number[] {
    const result: number[] = [];
    for (const value of signal) {
      this.buffer.push(value);
      if (this.buffer.length > this.coefficients.length) {
        this.buffer.shift();
      }
      if (this.buffer.length === this.coefficients.length) {
        let sum = 0;
        for (let i = 0; i < this.coefficients.length; i++) {
          sum += this.buffer[i] * this.coefficients[i];
        }
        result.push(Math.round(sum * 100) / 100);
      } else {
        result.push(value);
      }
    }
    return result;
  }

  reset(): void {
    this.buffer = [];
  }
}

// Factory function to create the right filter
export function createFilter(algorithm: string, options?: Record<string, number>): SignalFilter {
  switch (algorithm) {
    case "kalman":
      return new KalmanFilter(options?.q ?? 0.01, options?.r ?? 0.1);
    case "fir":
      return new FIRFilter();
    case "moving-average":
    default:
      return new MovingAverageFilter(options?.windowSize ?? 5);
  }
}
