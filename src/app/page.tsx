"use client";

import { useState, useCallback, useEffect } from "react";
import { Mic, MicOff, Square, HelpCircle } from "lucide-react";
import { HelpDialog } from "@/components/HelpDialog";
import { useRecorder, useRecorderStore } from "@/features/audio/useRecorder";
import { useTranscriptionStore } from "@/features/audio/useTranscription";

export default function HomePage() {
  const [showHelp, setShowHelp] = useState(false);
  const [recordingText, setRecordingText] = useState("");
  const { start, pause, resume, stop } = useRecorder();
  const status = useRecorderStore((s) => s.status);
  const audioUrl = useRecorderStore((s) => s.audioUrl);
  const elapsedMs = useRecorderStore((s) => s.elapsedMs);

  // Keep track of transcript text via polling — simple, avoids hook chain issues
  useEffect(() => {
    const interval = setInterval(() => {
      const text = useTranscriptionStore.getState().text;
      const interim = useTranscriptionStore.getState().interimText;
      setRecordingText(text + (interim ? " " + interim : ""));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleMainButton = useCallback(() => {
    switch (status) {
      case "idle":
      case "error":
        useTranscriptionStore.getState().reset();
        setRecordingText("");
        start();
        break;
      case "recording":
        pause();
        break;
      case "paused":
        resume();
        break;
    }
  }, [status, start, pause, resume]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const handleReset = useCallback(() => {
    useRecorderStore.getState().reset();
    useTranscriptionStore.getState().reset();
    setRecordingText("");
  }, []);

  const totalSecs = Math.floor(elapsedMs / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const isActive = status === "recording" || status === "paused";

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#1a1b2e",
      color: "#e8e8f0",
      fontFamily: "system-ui, sans-serif",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "24px" }}>✨</span>
          <span style={{ fontSize: "18px", fontWeight: 700 }}>MindNote</span>
        </div>
        <button
          onClick={() => setShowHelp(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "transparent",
            color: "#f59e0b",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          <HelpCircle style={{ width: "16px", height: "16px" }} /> 帮助
        </button>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        maxWidth: "700px",
        margin: "0 auto",
        width: "100%",
      }}>
        {/* Idle state */}
        {status === "idle" && (
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>
              Capture your thoughts
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", marginBottom: "40px" }}>
              Speak freely. We'll organize everything.
            </p>
            <button
              onClick={handleMainButton}
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "#f59e0b",
                color: "#1a1b2e",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                boxShadow: "0 0 40px rgba(245, 158, 11, 0.3)",
                transition: "transform 0.15s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Mic style={{ width: "48px", height: "48px" }} />
            </button>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginTop: "20px" }}>
              Tap to start recording
            </p>
          </div>
        )}

        {/* Requesting state */}
        {status === "requesting" && (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px" }}>
              Requesting microphone access...
            </p>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", marginTop: "8px" }}>
              Please allow microphone access in your browser
            </p>
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#ef4444", fontSize: "16px", marginBottom: "16px" }}>
              {useRecorderStore.getState().error || "Microphone access denied"}
            </p>
            <button
              onClick={handleReset}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "transparent",
                color: "#e8e8f0",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Recording or Paused state */}
        {isActive && (
          <div style={{ textAlign: "center", width: "100%" }}>
            {/* Timer */}
            <div style={{
              fontSize: "32px",
              fontFamily: "monospace",
              color: "rgba(255,255,255,0.6)",
              marginBottom: "20px",
            }}>
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>

            {/* Live transcript */}
            {recordingText ? (
              <div style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "24px",
                textAlign: "left",
                fontSize: "16px",
                lineHeight: "1.7",
                minHeight: "80px",
                maxHeight: "300px",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
              }}>
                {recordingText}
                {status === "recording" && !recordingText && (
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>Listening...</span>
                )}
              </div>
            ) : (
              <div style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "24px",
                color: "rgba(255,255,255,0.3)",
                fontSize: "16px",
              }}>
                {status === "recording" ? "Listening... start speaking" : "Paused — tap resume to continue"}
              </div>
            )}

            {/* Record button */}
            <button
              onClick={handleMainButton}
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: status === "recording" ? "3px solid #ef4444" : "3px solid #f59e0b",
                backgroundColor: status === "recording" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                color: status === "recording" ? "#ef4444" : "#f59e0b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                boxShadow: status === "recording" ? "0 0 30px rgba(239,68,68,0.4)" : "none",
              }}
            >
              {status === "recording" ? (
                <Mic style={{ width: "40px", height: "40px" }} />
              ) : (
                <MicOff style={{ width: "40px", height: "40px" }} />
              )}
            </button>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
              {status === "recording" ? "Recording — tap to pause" : "Paused — tap to resume"}
            </p>

            {/* Stop button */}
            <button
              onClick={handleStop}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                backgroundColor: "transparent",
                color: "#e8e8f0",
                cursor: "pointer",
                marginTop: "16px",
                fontSize: "14px",
              }}
            >
              <Square style={{ width: "14px", height: "14px" }} /> Stop Recording
            </button>
          </div>
        )}

        {/* Post-recording: audio available, text shown */}
        {status === "idle" && recordingText && (
          <div style={{ textAlign: "center", width: "100%" }}>
            <div style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px",
              textAlign: "left",
              fontSize: "16px",
              lineHeight: "1.7",
              whiteSpace: "pre-wrap",
            }}>
              {recordingText}
            </div>
            {audioUrl && (
              <audio src={audioUrl} controls style={{ width: "100%", marginBottom: "16px" }} />
            )}
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={handleReset}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backgroundColor: "transparent",
                  color: "#e8e8f0",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Record Again
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(recordingText);
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#f59e0b",
                  color: "#1a1b2e",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                Copy Text
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Help dialog */}
      <HelpDialog open={showHelp} onOpenChange={setShowHelp} />
    </div>
  );
}
