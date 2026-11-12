import { profile as demoProfile } from "@/lib/profile";
import { ProfileLink } from "@/components/profile-link";
import { Brand } from "@/components/brand";

type DisplayProfile = {
  name: string;
  bio: string;
  initials: string;
  links?: { id?: string; title: string; description: string; url: string }[];
};

export function ProfilePage({
  profile = demoProfile,
  linksError,
}: {
  profile?: DisplayProfile;
  linksError?: string;
}) {
  return (
    <main className="profile-page public-profile">
      <div className="profile-content public-profile-content">
        <div className="public-profile-brand"><Brand /></div>
        <header className="profile-header surface-card">
          <div className="profile-avatar" aria-label="프로필 이니셜">
            {profile.initials}
          </div>
          <h1>{profile.name}</h1>
          <p>{profile.bio}</p>
        </header>

        {linksError ? (
          <p className="form-error surface-card" role="alert">{linksError}</p>
        ) : profile.links && profile.links.length > 0 ? (
          <nav aria-label="프로필 링크">
            <ul className="profile-links">
              {profile.links.map((link) => (
                <li key={link.id ?? link.url}>
                  <ProfileLink
                    linkId={link.id}
                    title={link.title}
                    description={link.description}
                    url={link.url}
                  />
                </li>
              ))}
            </ul>
          </nav>
        ) : profile.links ? (
          <p className="links-empty surface-card">등록된 링크가 없습니다.</p>
        ) : null}
      </div>
    </main>
  );
}
