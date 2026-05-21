"use client";

import { useState, useEffect } from "react";
import { LogIn, LogOut, Key, Eye, Zap, Cctv, Volume2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/features/auth/useAuth";
import { createClient } from "@/features/auth/supabase-client";
import { useRouter } from "next/navigation";
import { useAttentionStore } from "@/features/attention-monitor";
import type { PetType, FilterAlgorithm } from "@/features/attention-monitor";

export default function SettingsPage() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();
  const attentionSettings = useAttentionStore((s) => s.settings);
  const attentionEnabled = useAttentionStore((s) => s.enabled);
  const updateAttentionSettings = useAttentionStore((s) => s.updateSettings);
  const setAttentionEnabled = useAttentionStore((s) => s.setEnabled);

  const [openaiKey, setOpenaiKey] = useState("");
  const [aiKey, setAiKey] = useState("");
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    setOpenaiKey(localStorage.getItem("mindnote_openai_key") || "");
    setAiKey(localStorage.getItem("mindnote_ai_key") || "");
  }, []);

  const handleSaveOpenAI = () => {
    localStorage.setItem("mindnote_openai_key", openaiKey);
  };

  const handleSaveAI = () => {
    localStorage.setItem("mindnote_ai_key", aiKey);
  };

  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* API Keys */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Key className="size-5" /> API Keys
        </h2>
        <p className="text-sm text-muted-foreground">
          Keys are stored locally in your browser. Never shared or uploaded.
        </p>

        <div className="space-y-3">
          <div>
            <Label>OpenAI Whisper API Key</Label>
            <div className="flex gap-2 mt-1">
              <div className="relative flex-1">
                <Input
                  type={showOpenAI ? "text" : "password"}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <button
                  onClick={() => setShowOpenAI(!showOpenAI)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <Eye className="size-4 text-muted-foreground" />
                </button>
              </div>
              <Button variant="outline" size="sm" onClick={handleSaveOpenAI}>Save</Button>
            </div>
          </div>

          <div>
            <Label>DeepSeek V4 API Key</Label>
            <div className="flex gap-2 mt-1">
              <div className="relative flex-1">
                <Input
                  type={showAI ? "text" : "password"}
                  value={aiKey}
                  onChange={(e) => setAiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <button
                  onClick={() => setShowAI(!showAI)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <Eye className="size-4 text-muted-foreground" />
                </button>
              </div>
              <Button variant="outline" size="sm" onClick={handleSaveAI}>Save</Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Account */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Account</h2>
        {user ? (
          <div className="space-y-3">
            <p className="text-sm">
              Signed in as <span className="font-medium">{user.email}</span>
            </p>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="size-4 mr-1" /> Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sign in to sync notes across devices.
            </p>
            <Button onClick={handleSignIn}>
              <LogIn className="size-4 mr-1" /> Sign in with Google
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Attention Monitor */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Cctv className="size-5" /> Attention Pet Monitor
        </h2>
        <p className="text-sm text-muted-foreground">
          A cute companion that gently keeps you focused. Uses your camera locally — no data is ever sent anywhere.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Pet Monitor</Label>
              <p className="text-xs text-muted-foreground">Camera access required</p>
            </div>
            <Switch
              checked={attentionEnabled}
              onCheckedChange={setAttentionEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Reminder Sensitivity</Label>
            <Select
              value={attentionSettings.sensitivity}
              onValueChange={(v) => updateAttentionSettings({ sensitivity: v as "relaxed" | "moderate" | "strict" })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relaxed">Relaxed</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="strict">Strict</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Pet Character</Label>
            <Select
              value={attentionSettings.petType}
              onValueChange={(v) => updateAttentionSettings({ petType: v as PetType })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="penguin">🐧 Penguin</SelectItem>
                <SelectItem value="shiba">🐶 Shiba</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Pet Size</Label>
            <Select
              value={attentionSettings.petSize}
              onValueChange={(v) => updateAttentionSettings({ petSize: v as "small" | "medium" | "large" })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>DSP Filter Algorithm</Label>
            <Select
              value={attentionSettings.filterAlgorithm}
              onValueChange={(v) => updateAttentionSettings({ filterAlgorithm: v as FilterAlgorithm })}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="moving-average">Moving Average</SelectItem>
                <SelectItem value="kalman">Kalman (DSP)</SelectItem>
                <SelectItem value="fir">FIR Lowpass</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-1">
                <Volume2 className="size-3" /> Voice Reminders
              </Label>
              <p className="text-xs text-muted-foreground">Gentle voice prompts when distracted</p>
            </div>
            <Switch
              checked={attentionSettings.voiceReminders}
              onCheckedChange={(v: boolean) => updateAttentionSettings({ voiceReminders: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-1">
                <Mic className="size-3" /> Smart Auto-Record
              </Label>
              <p className="text-xs text-muted-foreground">Auto start/pause recording based on focus level</p>
            </div>
            <Switch
              checked={attentionSettings.autoRecord}
              onCheckedChange={(v: boolean) => updateAttentionSettings({ autoRecord: v })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* About */}
      <div className="space-y-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-1">
          <Zap className="size-4 text-primary" /> MindNote v0.1.0
        </p>
        <p>ADHD-friendly voice-driven note assistant</p>
        <p>All data is stored locally-first for privacy and offline access.</p>
      </div>
    </div>
  );
}
