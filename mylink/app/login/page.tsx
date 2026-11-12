import type { Metadata } from "next";
import Link from "next/link";
import { GitHubLoginButton } from "@/components/github-login-button";
import { Brand } from "@/components/brand";

export const metadata: Metadata = {
  title: "로그인 | MyLink",
};

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="profile-page login-page">
      <section className="profile-content login-card surface-card" aria-labelledby="login-heading">
        <Brand />
        <h1 id="login-heading">마이링크 로그인</h1>
        <p className="login-description">GitHub 계정으로 로그인하고 링크를 관리하세요.</p>
        {error && (
          <p className="form-error" role="alert">
            {error === "oauth_cancelled"
              ? "GitHub 로그인이 취소되었습니다. 아래 버튼으로 다시 시도해 주세요."
              : "로그인을 완료하지 못했습니다. 아래 버튼으로 다시 시도해 주세요."}
          </p>
        )}
        <GitHubLoginButton />
        <Link className="text-link" href="/demo">예시 프로필 보기 ↗</Link>
      </section>
    </main>
  );
}
