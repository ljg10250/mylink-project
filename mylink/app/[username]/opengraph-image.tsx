import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { loadPublicProfile } from "@/lib/supabase/public-profiles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "MyLink 프로필 공유 미리보기";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

const koreanFont = readFile(join(process.cwd(), "assets/fonts/NanumGothic-Bold.ttf"));

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await loadPublicProfile(username);
  const responseHeaders = { "Cache-Control": "no-store, max-age=0" };
  if (!profile) {
    return new Response(null, { status: 404, headers: responseHeaders });
  }

  const name = profile.display_name?.trim() || profile.username;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#f3f3f5",
          color: "#181818",
          fontFamily: "NanumGothic",
          fontWeight: 700,
          border: "16px solid #ff6039",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, color: "#ff6039" }}>MyLink</div>
        <div
          style={{
            display: "flex",
            fontSize: 80,
            lineHeight: 1.25,
            maxHeight: 300,
            overflow: "hidden",
            wordBreak: "break-word",
          }}
        >
          {name}
        </div>
        <div style={{ display: "flex", width: 120, height: 12, borderRadius: 6, backgroundColor: "#20201f" }} />
      </div>
    ),
    {
      ...size,
      headers: responseHeaders,
      fonts: [{ name: "NanumGothic", data: await koreanFont, style: "normal", weight: 700 }],
    },
  );
}
