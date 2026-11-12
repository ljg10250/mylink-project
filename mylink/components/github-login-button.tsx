"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GitHubLoginButton() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (isPending) {
      return;
    }

    setIsPending(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: new URL("/auth/callback", window.location.origin).toString(),
          skipBrowserRedirect: true,
        },
      });
      if (error || !data.url) {
        throw new Error("GitHub 로그인을 시작하지 못했습니다.");
      }
      window.location.assign(data.url);
    } catch {
      setError("GitHub 로그인을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setIsPending(false);
    }
  }

  return (
    <div className="auth-button-group">
      <button
        className="link-add-button"
        type="button"
        onClick={handleLogin}
        disabled={isPending}
      >
        {isPending ? "GitHub로 이동 중…" : "GitHub로 로그인"}
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
