import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ProfilePage } from "@/components/profile-page";
import { loadPublicProfile } from "@/lib/supabase/public-profiles";
import { loadPublicLinks, type PublicLink } from "@/lib/supabase/public-links";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await loadPublicProfile(username);
  if (!profile) {
    return {
      title: "프로필을 찾을 수 없습니다 | MyLink",
      description: "공개된 프로필을 찾을 수 없습니다.",
      robots: { index: false, follow: false },
      openGraph: {
        title: "MyLink",
        description: "공개된 프로필을 찾을 수 없습니다.",
        images: [],
      },
    };
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host")?.split(",")[0].trim()
    || requestHeaders.get("host") || "localhost:3000";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0].trim();
  const isLocalHost = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
  const protocol = forwardedProtocol === "https" || (!forwardedProtocol && !isLocalHost)
    ? "https" : "http";
  const name = profile.display_name?.trim() || profile.username;
  const title = `${name}의 마이링크`;
  const description = profile.bio ?? "";

  return {
    metadataBase: new URL(`${protocol}://${host}`),
    title,
    description,
    openGraph: { title, description, siteName: "MyLink", locale: "ko_KR", type: "profile" },
  };
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await loadPublicProfile(username);
  if (!profile) {
    notFound();
  }

  let links: PublicLink[] = [];
  let linksError = "";
  try {
    links = await loadPublicLinks(profile.user_id);
  } catch {
    linksError = "링크 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }

  const name = profile.display_name?.trim() || profile.username;
  const initials = Array.from(name.replace(/\s/g, "")).slice(0, 2).join("").toUpperCase();
  return (
    <ProfilePage
      profile={{
        name,
        bio: profile.bio ?? "",
        initials,
        links: links.map((link) => ({ ...link, description: link.url })),
      }}
      linksError={linksError}
    />
  );
}
