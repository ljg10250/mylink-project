import { createClient } from "@supabase/supabase-js";

export function createPublicClient() {
  // 로그인 쿠키나 저장된 세션을 읽지 않고 방문자 권한으로만 조회합니다.
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    },
  );
}
