import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";

export const metadata: Metadata = {
  title: "내 링크를 한곳에 | MyLink",
  description: "여러 링크를 한 페이지에 모아, 하나의 주소로 간편하게 공유하세요.",
};

export default function Home() {
  return (
    <main className="landing-page">
      <div className="landing-content">
        <header className="landing-topbar"><Brand /></header>
        <header className="landing-hero">
          <h1>내 링크를 <span>한곳에</span></h1>
          <p className="landing-description">
            여러 링크를 한 페이지에 모아, 하나의 주소로 간편하게 공유하세요.
          </p>
          <div className="landing-actions">
            <Link className="button button-primary" href="/login">
              GitHub로 시작하기
            </Link>
            <Link className="button button-secondary" href="/demo">
              예시 보기
            </Link>
          </div>
        </header>

        <dl className="landing-features" aria-label="마이링크 주요 기능">
          <div className="surface-card">
            <dt>링크 관리</dt>
            <dd>내 링크를 쉽게 추가하고 관리하세요.</dd>
          </div>
          <div className="surface-card">
            <dt>개인 주소 공유</dt>
            <dd>나만의 주소 하나로 모두 공유하세요.</dd>
          </div>
          <div className="surface-card">
            <dt>클릭 통계</dt>
            <dd>어떤 링크가 인기 있는지 확인하세요.</dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
