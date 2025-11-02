import { useEffect, useMemo, useState } from 'react';
import { getProfile } from '../services/api';

function ProfilePage({ token }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    getProfile(token)
      .then((res) => setProfile(res.data))
      .catch((err) => setError(err.response?.data?.message || 'No se pudo cargar el perfil'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsRevealed(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const initials = useMemo(() => {
    const source = profile?.name || profile?.username || '';
    const letters = source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase())
      .join('');
    return letters || 'TC';
  }, [profile]);

  const roleKey = (profile?.role || 'guest')?.toLowerCase();

  if (!token) {
    return (
      <section className="page profile-page">
        <div className="profile-empty card reveal" data-visible="true">
          <h1>Perfil</h1>
          <p>Debes iniciar sesión para ver tu perfil.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page profile-page">
      <header className="profile-header reveal" data-visible={isRevealed}>
        <h1>Tu perfil</h1>
        <p className="muted">Visualiza tu información de cuenta y rol dentro del torneo.</p>
      </header>

      <div className="profile-card reveal" data-visible={isRevealed}>
        <div className="profile-card__glow" aria-hidden="true" />
        <div className="profile-avatar" aria-hidden="true">
          <span>{initials}</span>
        </div>

        <div className="profile-info">
          <h2>{profile?.name || 'Cocinero/a'}</h2>
          {profile?.username && <span className="profile-username">@{profile.username}</span>}
        </div>

        <div className="profile-meta">
          {loading && <p className="muted">Cargando perfil...</p>}
          {error && <div className="alert error-message">{error}</div>}

          {profile && !loading && !error && (
            <ul>
              <li>
                <span className="label">Nombre</span>
                <span className="value">{profile.name || 'Sin registrar'}</span>
              </li>
              <li>
                <span className="label">Usuario</span>
                <span className="value">{profile.username}</span>
              </li>
              <li>
                <span className="label">Rol</span>
                <span className="value">
                  <span className={`role-badge role-${roleKey}`}>{profile?.role || 'Invitado'}</span>
                </span>
              </li>
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
