"use client";

import { useEffect, useState } from "react";
import type { ManagedLink } from "@/lib/supabase/links";
import { loadLinkStats, type LinkStat } from "@/lib/supabase/link-stats";

type StatsResult = {
  links: ManagedLink[];
  stats: LinkStat[];
  error: string;
};

export function LinkStatistics({ links }: { links: ManagedLink[] }) {
  const [result, setResult] = useState<StatsResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadLinkStats(links.map((link) => link.id))
      .then((stats) => {
        if (!cancelled) {
          setResult({ links, stats, error: "" });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({
            links,
            stats: [],
            error: "클릭 통계를 불러오지 못했습니다. 로그인 상태와 네트워크 연결을 확인하고 새로고침해 주세요.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [links]);

  const isLoading = result?.links !== links;
  const clickCounts = new Map(result?.stats.map((stat) => [stat.link_id, Number(stat.click_count)]));
  const rankedLinks = links
    .map((link) => ({ ...link, clickCount: clickCounts.get(link.id) ?? 0 }))
    .sort((first, second) => second.clickCount - first.clickCount);
  const totalClicks = rankedLinks.reduce((total, link) => total + link.clickCount, 0);
  const maxClicks = rankedLinks[0]?.clickCount ?? 0;
  const topLinkTitle = maxClicks > 0 ? rankedLinks[0].title : "집계 대기";

  return (
    <section className="link-statistics mypage-statistics" aria-label="클릭 통계" aria-busy={isLoading}>
      <div className="dashboard-card stats-summary-card">
        <div className="stats-total-highlight">
          <h2>전체 클릭 수</h2>
          <p className="stats-total-value">
            {isLoading ? "…" : result?.error ? "—" : totalClicks.toLocaleString("ko-KR")}
          </p>
        </div>
        <dl className="stats-summary-details">
          <div>
            <dt>등록 링크</dt>
            <dd>{links.length.toLocaleString("ko-KR")}</dd>
          </div>
          <div>
            <dt>가장 많이 클릭한 링크</dt>
            <dd className="stats-top-link">
              {isLoading || result?.error ? "—" : topLinkTitle}
            </dd>
          </div>
        </dl>
      </div>
      <div className="dashboard-card stats-breakdown-card">
        <h2 id="link-statistics-heading">링크별 클릭</h2>
        {isLoading ? (
          <p className="links-empty" role="status">클릭 통계를 불러오는 중…</p>
        ) : result?.error ? (
          <p className="form-error" role="alert">{result.error}</p>
        ) : (
          <>
            {rankedLinks.length === 0 ? (
              <p className="links-empty">등록된 링크가 없습니다.</p>
            ) : (
              <ol className="link-statistics-list">
                {rankedLinks.map((link) => (
                  <li key={link.id}>
                    <span className="stats-link-title" title={link.title}>{link.title}</span>
                    <div className="stats-bar-track" aria-hidden="true">
                      <span style={{ width: `${maxClicks > 0 ? (link.clickCount / maxClicks) * 100 : 0}%` }} />
                    </div>
                    <strong>{link.clickCount.toLocaleString("ko-KR")}회</strong>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>
    </section>
  );
}
