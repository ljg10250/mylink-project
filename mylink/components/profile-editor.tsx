"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  getProfileSaveError,
  validateUsername,
  type ProfileErrors,
} from "@/lib/profile-validation";
import { loadProfile, saveProfile, type ProfileValues, type SavedProfile } from "@/lib/supabase/profiles";

function getShareUrl(profile: SavedProfile) {
  return profile.is_public === true && profile.username
    ? new URL(`/${encodeURIComponent(profile.username)}`, window.location.origin).href
    : "";
}

export function ProfileEditor({ userId }: { userId: string }) {
  const [values, setValues] = useState<ProfileValues>({
    username: "",
    display_name: "",
    bio: "",
    is_public: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [success, setSuccess] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [savedProfile, setSavedProfile] = useState<SavedProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadProfile(userId)
      .then((profile) => {
        if (!cancelled && profile) {
          setSavedProfile(profile);
          setValues({
            username: profile.username ?? "",
            display_name: profile.display_name ?? "",
            bio: profile.bio ?? "",
            is_public: profile.is_public === true,
          });
          setShareUrl(getShareUrl(profile));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("프로필을 불러오지 못했습니다. 로그인 상태와 네트워크 연결을 확인하고 새로고침해 주세요.");
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
    if (isLoading || isSaving || loadError) {
      return;
    }

    setSuccess("");
    setCopyMessage("");
    const usernameError = validateUsername(values.username);
    setErrors({ username: usernameError });
    if (usernameError) {
      return;
    }

    setIsSaving(true);
    try {
      const profile = await saveProfile(userId, values);
      setSavedProfile(profile);
      setValues({
        username: profile.username ?? "",
        display_name: profile.display_name ?? "",
        bio: profile.bio ?? "",
        is_public: profile.is_public === true,
      });
      setShareUrl(getShareUrl(profile));
      setSuccess("프로필을 저장했습니다.");
    } catch (error) {
      setErrors(getProfileSaveError(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyMessage("공유 주소를 복사했습니다.");
    } catch {
      setCopyMessage("주소를 복사하지 못했습니다. 위의 공유 주소를 직접 복사해 주세요.");
    }
  }

  const profileName = savedProfile?.display_name?.trim() || savedProfile?.username || "아직 프로필이 없습니다";
  const initials = savedProfile
    ? Array.from(profileName.replace(/\s/g, "")).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <section className="profile-editor dashboard-card" aria-labelledby="my-profile-heading">
      <h2 id="my-profile-heading">내 프로필</h2>
      {isLoading && <p className="links-empty" role="status">프로필을 불러오는 중…</p>}
      {loadError && <p className="form-error" role="alert">{loadError}</p>}
      {!isLoading && !loadError && (
        <div className="mypage-profile-summary">
          <div className="mypage-profile-avatar" aria-label="프로필 이니셜">{initials}</div>
          <div className="mypage-profile-identity">
            <h3>{profileName}</h3>
            {savedProfile?.username && <p>@{savedProfile.username}</p>}
            {savedProfile && (
              <span className={`mypage-visibility-badge ${savedProfile.is_public ? "is-public" : ""}`}>
                <span aria-hidden="true">●</span> {savedProfile.is_public ? "공개" : "비공개"}
              </span>
            )}
          </div>
        </div>
      )}
      {savedProfile?.bio && <p className="mypage-profile-bio">{savedProfile.bio}</p>}
      <details className="mypage-profile-details">
        <summary className="button button-primary">프로필 수정</summary>
        <form className="link-form" onSubmit={handleSubmit} noValidate aria-busy={isLoading || isSaving}>
          <fieldset className="profile-fields" disabled={isLoading || isSaving || Boolean(loadError)}>
            <div className="link-form-field">
              <label htmlFor="profile-username">사용자 이름 (username)</label>
              <input
                id="profile-username"
                name="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                minLength={3}
                maxLength={30}
                required
                value={values.username}
                onChange={(event) => setValues((current) => ({ ...current, username: event.target.value }))}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={`profile-username-hint${errors.username ? " profile-username-error" : ""}`}
              />
              <p id="profile-username-hint" className="profile-field-hint">
                소문자 영문·숫자·하이픈 3~30자, 처음과 끝은 영문 또는 숫자를 사용해 주세요.
              </p>
              {errors.username && (
                <p id="profile-username-error" className="form-error" role="alert">{errors.username}</p>
              )}
            </div>

            <div className="link-form-field">
              <label htmlFor="profile-display-name">표시 이름</label>
              <input
                id="profile-display-name"
                name="display_name"
                type="text"
                autoComplete="nickname"
                value={values.display_name}
                onChange={(event) => setValues((current) => ({ ...current, display_name: event.target.value }))}
              />
            </div>

            <div className="link-form-field">
              <label htmlFor="profile-bio">소개</label>
              <textarea
                id="profile-bio"
                name="bio"
                rows={4}
                value={values.bio}
                onChange={(event) => setValues((current) => ({ ...current, bio: event.target.value }))}
              />
            </div>

            <div className="profile-visibility">
              <label htmlFor="profile-is-public">
                <input
                  id="profile-is-public"
                  name="is_public"
                  type="checkbox"
                  checked={values.is_public}
                  onChange={(event) => setValues((current) => ({ ...current, is_public: event.target.checked }))}
                  aria-describedby="profile-visibility-hint"
                />
                프로필 공개
              </label>
              <p id="profile-visibility-hint" className="profile-field-hint">
                공개하면 프로필과 저장한 링크 목록이 함께 공개됩니다
              </p>
            </div>

            {errors.form && <p className="form-error" role="alert">{errors.form}</p>}
            {success && <p className="profile-save-success" role="status">{success}</p>}
            <button className="link-add-button" type="submit">
              {isSaving ? "저장 중…" : "프로필 저장"}
            </button>
          </fieldset>
        </form>
      </details>
      {shareUrl && (
        <div className="profile-share" aria-label="저장된 공개 프로필 공유 주소">
          <a className="mypage-public-page-link" href={shareUrl} target="_blank" rel="noopener noreferrer">
            공개 페이지 보기 <span aria-hidden="true">↗</span>
          </a>
          <a className="profile-share-url" href={shareUrl}>{shareUrl}</a>
          <button className="link-secondary-button" type="button" onClick={handleCopy}>
            주소 복사
          </button>
          {copyMessage && <p className="profile-field-hint" role="status">{copyMessage}</p>}
        </div>
      )}
    </section>
  );
}
