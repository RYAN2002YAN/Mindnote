"use client";

import { useRef, useCallback, useEffect } from "react";
import { useAttentionStore } from "./useAttentionStore";
import { createFilter, type SignalFilter } from "./filters";
import type { AttentionMetrics, FilterAlgorithm } from "./types";

// MediaPipe Face Mesh landmark indices
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];
const LEFT_EYE = [362, 385, 387, 263, 373, 380];
const MOUTH_OUTER = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 146];
const NOSE_TIP = 1;
const FOREHEAD = 10;
const CHIN = 152;
const LEFT_CHEEK = 234;
const RIGHT_CHEEK = 454;

// 3D model points for head pose estimation
const MODEL_POINTS = [
  [0.0, 0.0, 0.0],       // Nose tip
  [0.0, -330.0, -65.0],  // Chin
  [-225.0, 170.0, -135.0], // Left eye left corner
  [225.0, 170.0, -135.0],  // Right eye right corner
  [-150.0, -150.0, -125.0], // Left mouth corner
  [150.0, -150.0, -125.0],  // Right mouth corner
];

function euclideanDist(a: [number, number], b: [number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
}

function eyeAspectRatio(eyePoints: number[][]): number {
  const v1 = euclideanDist(eyePoints[1] as [number, number], eyePoints[5] as [number, number]);
  const v2 = euclideanDist(eyePoints[2] as [number, number], eyePoints[4] as [number, number]);
  const h = euclideanDist(eyePoints[0] as [number, number], eyePoints[3] as [number, number]);
  return (v1 + v2) / (2.0 * h);
}

function mouthAspectRatio(mouthPoints: number[][]): number {
  const v = euclideanDist(mouthPoints[2] as [number, number], mouthPoints[6] as [number, number]);
  const h = euclideanDist(mouthPoints[0] as [number, number], mouthPoints[4] as [number, number]);
  return v / h;
}

function estimateHeadPose(
  landmarks: number[][],
  imgW: number,
  imgH: number
): { pitch: number; yaw: number; roll: number } {
  const imagePoints = [
    landmarks[NOSE_TIP],
    landmarks[CHIN],
    landmarks[LEFT_CHEEK],
    landmarks[RIGHT_CHEEK],
    landmarks[61],  // left mouth
    landmarks[291], // right mouth
  ];

  // Simplified PnP using perspective approximation
  const nose = imagePoints[0];
  const chin = imagePoints[1];

  // Pitch: vertical angle from nose to chin
  const pitch = Math.atan2(chin[1] - nose[1], chin[2] - nose[2] || 1) * (180 / Math.PI);

  // Yaw: horizontal nose offset
  const leftCheek = imagePoints[2];
  const rightCheek = imagePoints[3];
  const faceCenter = (leftCheek[0] + rightCheek[0]) / 2;
  const yaw = ((nose[0] - faceCenter) / (imgW / 2)) * 45;

  // Roll: angle between eyes
  const roll = Math.atan2(
    landmarks[LEFT_EYE[0]][1] - landmarks[RIGHT_EYE[0]][1],
    landmarks[LEFT_EYE[0]][0] - landmarks[RIGHT_EYE[0]][0]
  ) * (180 / Math.PI);

  return { pitch, yaw, roll };
}

export function useAttentionMonitor() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceMeshRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const filterRef = useRef<SignalFilter>(createFilter("moving-average"));
  const scoreHistoryRef = useRef<number[]>([]);
  const blinksRef = useRef<{ count: number; lastMinute: number }>({ count: 0, lastMinute: Date.now() });
  const eyesClosedStartRef = useRef<number | null>(null);
  const yawnStartRef = useRef<number | null>(null);

  const { enabled, settings, setCameraReady } = useAttentionStore();

  // Load MediaPipe Face Mesh
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function init() {
      try {
        const { FaceMesh } = await import("@mediapipe/face_mesh");
        const faceMesh = new FaceMesh({
          locateFile: (f: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results: any) => {
          if (cancelled) return;
          processFrame(results);
        });

        faceMeshRef.current = faceMesh;

        // Start camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
          startProcessing();
        }
      } catch (err) {
        console.error("Failed to initialize attention monitor:", err);
      }
    }

    init();

    return () => {
      cancelled = true;
      stopProcessing();
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };
  }, [enabled, setCameraReady]);

  const processFrame = useCallback((results: any) => {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      // No face detected — low attention
      const score = Math.max(0, (scoreHistoryRef.current.slice(-1)[0] ?? 50) - 5);
      updateScore(score, {
        ear: 0, mar: 0, headPitch: 0, headYaw: 0, headRoll: 0,
        blinksPerMinute: 0, closedEyeDuration: 0,
        isYawning: false, lookingAtScreen: false,
      });
      return;
    }

    const landmarks = results.multiFaceLandmarks[0];
    const imgW = results.image?.width || 320;
    const imgH = results.image?.height || 240;

    // Convert normalized landmarks to pixel coordinates
    const pts: number[][] = [];
    for (const lm of landmarks) {
      pts.push([lm.x * imgW, lm.y * imgH, lm.z]);
    }

    // Eye Aspect Ratio
    const leftEyePts = LEFT_EYE.map((i) => pts[i]);
    const rightEyePts = RIGHT_EYE.map((i) => pts[i]);
    const leftEAR = eyeAspectRatio(leftEyePts);
    const rightEAR = eyeAspectRatio(rightEyePts);
    const ear = (leftEAR + rightEAR) / 2;

    // Blink detection
    const now = Date.now();
    if (ear < 0.2) {
      if (!eyesClosedStartRef.current) {
        eyesClosedStartRef.current = now;
        blinksRef.current.count++;
      }
    } else {
      eyesClosedStartRef.current = null;
    }
    // Reset blink count every minute
    if (now - blinksRef.current.lastMinute > 60000) {
      blinksRef.current = { count: 0, lastMinute: now };
    }

    const closedDuration = eyesClosedStartRef.current
      ? now - eyesClosedStartRef.current
      : 0;

    // Mouth Aspect Ratio (yawn detection)
    const mouthPts = MOUTH_OUTER.map((i) => pts[i]);
    const mar = mouthAspectRatio(mouthPts);
    const isYawning = mar > 0.7;

    // Head pose
    const { pitch, yaw, roll } = estimateHeadPose(pts, imgW, imgH);

    // Looking at screen: head not turned too far
    const lookingAtScreen = Math.abs(yaw) < 30 && Math.abs(pitch) < 35;

    const metrics: AttentionMetrics = {
      ear,
      mar,
      headPitch: pitch,
      headYaw: yaw,
      headRoll: roll,
      blinksPerMinute: blinksRef.current.count,
      closedEyeDuration: closedDuration,
      isYawning,
      lookingAtScreen,
    };

    // Compute attention score (0-100)
    let score = 80;

    // Eye factor: low EAR or prolonged closure = distracted/sleepy
    if (ear < 0.18) score -= 30;
    else if (ear < 0.22) score -= 15;

    if (closedDuration > 2000) score -= 40; // eyes closed >2 seconds
    else if (closedDuration > 500) score -= 10;

    // Head pose factor
    if (Math.abs(yaw) > 25) score -= 20;
    else if (Math.abs(yaw) > 15) score -= 10;

    if (pitch > 30) score -= 15; // looking down a lot
    else if (pitch > 20) score -= 5;

    // Yawning factor
    if (isYawning) score -= 20;

    // Looking away factor
    if (!lookingAtScreen) score -= 25;

    // Clamp
    score = Math.max(0, Math.min(100, score));

    scoreHistoryRef.current.push(score);
    if (scoreHistoryRef.current.length > 30) {
      scoreHistoryRef.current.shift();
    }

    // Apply DSP filter
    const filtered = filterRef.current.process([score]);
    const finalScore = filtered[0] || score;

    updateScore(finalScore, metrics);
  }, []);

  const updateScore = useCallback((score: number, metrics: AttentionMetrics) => {
    useAttentionStore.getState().setCurrentScore({
      score: Math.round(score),
      state: "idle", // will be set by store
      metrics,
      timestamp: Date.now(),
    });
  }, []);

  const startProcessing = useCallback(() => {
    const process = async () => {
      if (!videoRef.current || !faceMeshRef.current) return;

      try {
        await faceMeshRef.current.send({ image: videoRef.current });
      } catch {
        // retry next frame
      }

      animFrameRef.current = requestAnimationFrame(process);
    };
    process();
  }, []);

  const stopProcessing = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const changeFilter = useCallback((algorithm: FilterAlgorithm) => {
    filterRef.current = createFilter(algorithm);
  }, []);

  return { videoRef, canvasRef, changeFilter };
}
