"use client";

import { recordLinkClick } from "@/lib/supabase/public-links";

export function ProfileLink({
  linkId,
  title,
  description,
  url,
}: {
  linkId?: string;
  title: string;
  description: string;
  url: string;
}) {
  async function handleClick() {
    if (!linkId) {
      return;
    }
    try {
      await recordLinkClick(linkId);
    } catch {
      // 링크 이동은 브라우저가 처리하므로 기록 실패가 이동을 막지 않습니다.
    }
  }

  return (
    <a
      className="profile-link"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
    >
      <span className="profile-link-text">
        <span className="profile-link-title">{title}</span>
        <span className="profile-link-description">{description}</span>
      </span>
      <span className="profile-link-arrow" aria-hidden="true">↗</span>
    </a>
  );
}
