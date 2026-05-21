"use client";

import { useState, useEffect } from "react";
import { LogIn, LogOut, Key, Eye, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/features/auth/useAuth";
import { createClient } from "@/features/auth/supabase-client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();

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
