"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (isPending) {
      return;
    }

    setIsPending(true);
    setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) {
        // 서버의 토큰 해지 요청이 실패해도 로컬 세션은 먼저 제거될 수 있습니다.
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || data.session) {
          throw error;
        }
      }
      window.location.replace("/login");
    } catch {
      setError("로그아웃하지 못했습니다. 다시 시도해 주세요.");
      setIsPending(false);
    }
  }

  return (
    <div className="auth-button-group">
      <button
        className="link-secondary-button"
        type="button"
        onClick={handleLogout}
        disabled={isPending}
      >
        {isPending ? "로그아웃 중…" : "로그아웃"}
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
