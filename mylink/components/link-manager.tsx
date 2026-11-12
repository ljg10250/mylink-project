"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { DeleteLinkDialog } from "@/components/delete-link-dialog";
import { LogoutButton } from "@/components/logout-button";
import { ProfileEditor } from "@/components/profile-editor";
import { LinkStatistics } from "@/components/link-statistics";
import { Brand } from "@/components/brand";
import { deleteLink, loadLinks, saveLink, updateLink, type ManagedLink } from "@/lib/supabase/links";
import { validateLink, type LinkErrors } from "@/lib/link-validation";
import "./link-manager.css";

export function LinkManager({ userId }: { userId: string }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState<ManagedLink[]>([]);
  const [errors, setErrors] = useState<LinkErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [editingLink, setEditingLink] = useState<ManagedLink | null>(null);
  const [editErrors, setEditErrors] = useState<LinkErrors>({});
  const [editSaveError, setEditSaveError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingLink, setDeletingLink] = useState<ManagedLink | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadLinks(userId)
      .then((savedLinks) => {
        if (!cancelled) {
          setLinks(savedLinks);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("링크를 불러오지 못했습니다. 로그인 상태와 네트워크 연결을 확인하고 새로고침해 주세요.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving || isUpdating || isDeleting || isLoading) {
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();
    const nextErrors = validateLink(trimmedTitle, trimmedUrl);

    setErrors(nextErrors);
    if (nextErrors.title || nextErrors.url) {
      return;
    }

    setIsSaving(true);
    setSaveError("");

    let savedLink: ManagedLink;
    try {
      savedLink = await saveLink(trimmedTitle, trimmedUrl);
    } catch {
      setSaveError("링크를 저장하지 못했습니다. 로그인 상태와 네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
      setIsSaving(false);
      return;
    }

    setLinks((currentLinks) => [savedLink, ...currentLinks]);
    setTitle("");
    setUrl("");

    try {
      setLinks(await loadLinks(userId));
      setLoadError("");
    } catch {
      setLoadError("링크는 저장되었지만 목록을 다시 불러오지 못했습니다. 새로고침해 주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing(link: ManagedLink) {
    setEditingLink({ ...link });
    setEditErrors({});
    setEditSaveError("");
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingLink || isUpdating || isSaving || isDeleting) {
      return;
    }

    const nextErrors = validateLink(editingLink.title, editingLink.url);
    setEditErrors(nextErrors);
    setEditSaveError("");
    if (nextErrors.title || nextErrors.url) {
      return;
    }

    setIsUpdating(true);
    try {
      const updatedLink = await updateLink(
        editingLink.id,
        editingLink.title,
        editingLink.url,
      );
      setLinks((currentLinks) => currentLinks.map((link) =>
        link.id === updatedLink.id ? { ...link, ...updatedLink } : link,
      ));
      setEditingLink(null);
    } catch {
      setEditSaveError("링크를 수정하지 못했습니다. 로그인 상태와 네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingLink || isDeleting || isSaving || isUpdating) {
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteLink(deletingLink.id);
    } catch {
      setDeleteError("링크를 삭제하지 못했습니다. 로그인 상태와 네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
      setIsDeleting(false);
      return;
    }

    setLinks((currentLinks) => currentLinks.filter((link) => link.id !== deletingLink.id));
    setDeletingLink(null);

    try {
      setLinks(await loadLinks(userId));
      setLoadError("");
    } catch {
      setLoadError("링크는 삭제되었지만 목록을 다시 불러오지 못했습니다. 새로고침해 주세요.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="profile-page mypage mypage-dashboard">
      <div className="profile-content">
        <div className="mypage-toolbar">
          <Brand />
          <nav className="mypage-navigation" aria-label="관리 화면 이동">
            <a href="#my-links-heading">내 링크</a>
            <a href="#my-profile-heading">내 프로필</a>
            <a href="#link-statistics-heading">클릭 통계</a>
          </nav>
          <LogoutButton />
        </div>
        <header className="mypage-header">
          <div className="mypage-heading">
            <div>
              <h1>내 링크 관리</h1>
              <p className="mypage-description">링크를 추가하고 공유하세요.</p>
            </div>
            <Link className="button button-secondary" href="/demo">
              예시 프로필 보기 <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </header>

        <div className="mypage-overview">
          <ProfileEditor key={`profile-editor-${userId}`} userId={userId} />
          {!isLoading && !loadError && (
            <LinkStatistics key={`link-statistics-${userId}`} links={links} />
          )}
          {(isLoading || loadError) && (
            <section className="dashboard-card mypage-statistics-placeholder" aria-labelledby="link-statistics-heading">
              <h2 id="link-statistics-heading">클릭 통계</h2>
              <p className={loadError ? "form-error" : "links-empty"} role={loadError ? "alert" : "status"}>
                {loadError || "링크를 불러오는 중…"}
              </p>
            </section>
          )}
        </div>

        <div className="mypage-links-grid">
          <form className="link-form dashboard-card link-add-card" onSubmit={handleSubmit} noValidate>
            <h2>새 링크 추가</h2>
            <div className="link-form-field">
              <label htmlFor="link-title">링크 제목</label>
              <input
                id="link-title"
                name="title"
                type="text"
                placeholder="예: GitHub 프로필"
                value={title}
                disabled={isSaving || isUpdating || isDeleting}
                onChange={(event) => setTitle(event.target.value)}
                required
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "link-title-error" : undefined}
              />
              {errors.title && (
                <p id="link-title-error" className="form-error" role="alert">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="link-form-field">
              <label htmlFor="link-url">URL</label>
              <input
                id="link-url"
                name="url"
                type="url"
                inputMode="url"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="https://example.com"
                value={url}
                disabled={isSaving || isUpdating || isDeleting}
                onChange={(event) => setUrl(event.target.value)}
                required
                aria-invalid={Boolean(errors.url)}
                aria-describedby={errors.url ? "link-url-error" : undefined}
              />
              {errors.url && (
                <p id="link-url-error" className="form-error" role="alert">
                  {errors.url}
                </p>
              )}
            </div>

            {saveError && <p className="form-error" role="alert">{saveError}</p>}

            <button
              className="link-add-button"
              type="submit"
              disabled={isSaving || isUpdating || isDeleting || isLoading}
            >
              {isSaving ? "저장 중…" : "추가"}
            </button>
          </form>

          <section className="managed-links dashboard-card" aria-labelledby="my-links-heading">
            <h2 id="my-links-heading">내 링크</h2>
            {loadError && <p className="form-error" role="alert">{loadError}</p>}
            {links.length > 0 && (
              <div className="managed-links-head" aria-hidden="true">
                <span>링크</span>
                <span>관리</span>
              </div>
            )}
            <div aria-live="polite" aria-relevant="additions text">
              {isLoading && <p className="links-empty">링크를 불러오는 중…</p>}
              {!isLoading && !loadError && links.length === 0 && (
                <p className="links-empty">제목과 URL을 입력해 첫 링크를 추가해 보세요.</p>
              )}
              {links.length > 0 && (
                <ul className="profile-links">
                  {links.map((link) => (
                    <li key={link.id}>
                      {editingLink?.id === link.id ? (
                        <form
                          className="link-form"
                          aria-label={`${link.title} 수정`}
                          onSubmit={handleEditSubmit}
                          noValidate
                        >
                          <div className="link-form-field">
                            <label htmlFor={`edit-title-${link.id}`}>링크 제목</label>
                            <input
                              id={`edit-title-${link.id}`}
                              name="title"
                              type="text"
                              value={editingLink.title}
                              onChange={(event) => setEditingLink({
                                ...editingLink,
                                title: event.target.value,
                              })}
                              disabled={isUpdating}
                              required
                              aria-invalid={Boolean(editErrors.title)}
                              aria-describedby={editErrors.title ? `edit-title-error-${link.id}` : undefined}
                            />
                            {editErrors.title && (
                              <p id={`edit-title-error-${link.id}`} className="form-error" role="alert">
                                {editErrors.title}
                              </p>
                            )}
                          </div>

                          <div className="link-form-field">
                            <label htmlFor={`edit-url-${link.id}`}>URL</label>
                            <input
                              id={`edit-url-${link.id}`}
                              name="url"
                              type="url"
                              inputMode="url"
                              autoCapitalize="none"
                              spellCheck={false}
                              value={editingLink.url}
                              onChange={(event) => setEditingLink({
                                ...editingLink,
                                url: event.target.value,
                              })}
                              disabled={isUpdating}
                              required
                              aria-invalid={Boolean(editErrors.url)}
                              aria-describedby={editErrors.url ? `edit-url-error-${link.id}` : undefined}
                            />
                            {editErrors.url && (
                              <p id={`edit-url-error-${link.id}`} className="form-error" role="alert">
                                {editErrors.url}
                              </p>
                            )}
                          </div>

                          {editSaveError && (
                            <p className="form-error" role="alert">{editSaveError}</p>
                          )}

                          <div className="link-edit-actions">
                            <button
                              className="link-add-button"
                              type="submit"
                              disabled={isUpdating || isSaving || isDeleting}
                            >
                              {isUpdating ? "저장 중…" : "저장"}
                            </button>
                            <button
                              className="link-secondary-button"
                              type="button"
                              onClick={() => setEditingLink(null)}
                              disabled={isUpdating}
                            >
                              취소
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="managed-link">
                          <a className="profile-link" href={link.url}>
                            <span className="profile-link-text">
                              <span className="profile-link-title">{link.title}</span>
                              <span className="profile-link-description">{link.url}</span>
                            </span>
                            <span className="profile-link-arrow" aria-hidden="true">↗</span>
                          </a>
                          <div className="link-item-actions">
                            <button
                              className="link-secondary-button"
                              type="button"
                              aria-label={`${link.title} 수정`}
                              onClick={() => startEditing(link)}
                              disabled={isSaving || isUpdating || isDeleting || editingLink !== null}
                            >
                              수정
                            </button>
                            <button
                              className="link-secondary-button link-delete-button"
                              type="button"
                              aria-label={`${link.title} 삭제`}
                              onClick={() => {
                                setDeletingLink(link);
                                setDeleteError("");
                              }}
                              disabled={isSaving || isUpdating || isDeleting || editingLink !== null}
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
      {deletingLink && (
        <DeleteLinkDialog
          link={deletingLink}
          isDeleting={isDeleting}
          error={deleteError}
          onCancel={() => setDeletingLink(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </main>
  );
}
