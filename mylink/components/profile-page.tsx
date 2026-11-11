import { profile } from "@/lib/profile";

export function ProfilePage() {
  return (
    <main className="profile-page">
      <div className="profile-content">
        <header className="profile-header">
          <div className="profile-avatar" aria-label="프로필 이니셜">
            {profile.initials}
          </div>
          <h1>{profile.name}</h1>
          <p>{profile.bio}</p>
        </header>

        <nav aria-label="프로필 링크">
          <ul className="profile-links">
            {profile.links.map((link) => (
              <li key={link.url}>
                <a className="profile-link" href={link.url}>
                  <span className="profile-link-text">
                    <span className="profile-link-title">{link.title}</span>
                    <span className="profile-link-description">
                      {link.description}
                    </span>
                  </span>
                  <span className="profile-link-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
