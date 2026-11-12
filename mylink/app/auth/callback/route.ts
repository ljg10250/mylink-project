import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const providerError = searchParams.get("error");
  let destination = "/login?error=callback_failed";

  if (providerError === "access_denied") {
    destination = "/login?error=oauth_cancelled";
  } else if (!providerError && code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.session) {
        destination = "/mypage";
      }
    } catch {
      destination = "/login?error=callback_failed";
    }
  }

  const response = NextResponse.redirect(new URL(destination, request.url), 303);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
