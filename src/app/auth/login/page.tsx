"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/useAuth";
import { createClient } from "@/features/auth/supabase-client";

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) router.push("/");
  }, [isAuthenticated, router]);

  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="space-y-2">
          <div className="size-16 rounded-2xl bg-primary flex items-center justify-center mx-auto">
            <Sparkles className="size-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to MindNote</h1>
          <p className="text-muted-foreground">Sign in to sync your notes across devices</p>
        </div>
        <Button onClick={handleSignIn} size="lg" className="w-full">
          <LogIn className="size-4 mr-2" />
          Sign in with Google
        </Button>
        <p className="text-xs text-muted-foreground">
          We never share your data. Your notes are encrypted and private.
        </p>
      </div>
    </div>
  );
}
