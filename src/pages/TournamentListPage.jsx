import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTournaments, getLocations } from '../services/api';
import { initializeGeneralMap, torneosData as fallbackTournaments } from '../utils/mapUtils.js';

function TournamentListPage({ user }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationsMap, setLocationsMap] = useState(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);
  const fallbackLocationName = (tournament) => {
    if (locationsMap.size === 0) {
      return 'No especificado';
    }

    const names = [...locationsMap.values()].filter(Boolean);
    if (names.length === 0) {
      return 'No especificado';
    }

    const idValue = Number(tournament.id);
    if (Number.isFinite(idValue) && idValue >= 0) {
      return names[idValue % names.length];
    }

    const key = String(tournament.id || tournament.name || tournament.slug || '0');
    const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return names[hash % names.length];
  };

  const userToken = user?.token;
  const roleKey = (user?.user?.role || '').toLowerCase();
  const adminRoles = ['admin', 'chef_admin', 'chef-admin'];
  const isAdmin = adminRoles.includes(roleKey);
  const isVisitor = roleKey === 'visitor';
  const isLogged = !!user?.token;

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getTournaments(userToken);
        setTournaments(response.data);
      } catch (err) {
        setError('No se pudieron cargar los torneos: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [userToken]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locResp = await getLocations(userToken);
        const locArray = Array.isArray(locResp.data) ? locResp.data : [];
        const map = new Map(
          locArray.map((loc) => [String(loc.id), loc.name || loc.title || loc.label || ''])
        );
        setLocationsMap(map);
      } catch (locErr) {
        console.warn('No se pudieron cargar las ubicaciones', locErr);
      }
    };

    fetchLocations();
  }, [userToken]);

  useEffect(() => {
    if (loading) return;

    const normalized = tournaments
      .map((torneo) => {
        const lat =
          torneo.lat ??
          torneo.latitude ??
          torneo.location?.lat ??
          torneo.location?.latitude ??
          torneo.locationLat;
        const lon =
          torneo.lon ??
          torneo.lng ??
          torneo.longitude ??
          torneo.location?.lon ??
          torneo.location?.lng ??
          torneo.location?.longitude ??
          torneo.locationLon;

        if (typeof lat !== 'number' || typeof lon !== 'number') {
          return null;
        }

        return {
          id: torneo.id,
          titulo: torneo.name || torneo.title || `Torneo ${torneo.id}`,
          lat,
          lon,
        };
      })
      .filter(Boolean);

    const mapData = normalized.length > 0 ? normalized : fallbackTournaments;
    initializeGeneralMap('mapa-general', mapData);
    setMapLoaded(true);
  }, [loading, tournaments]);

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>Torneos activos</h1>
          <p className="muted">
            Visualiza la capacidad disponible y accede al detalle para administrar inscripciones y
            resultados.
          </p>
        </div>
      </header>

      <div
        id="mapa-general"
        className="c-map-container"
        role="region"
        aria-label="Mapa con ubicaciones de torneos"
        data-loaded={mapLoaded}
      />

      {error && (
        <div className="alert error-message" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="muted">Cargando torneos...</p>
      ) : tournaments.length === 0 ? (
        <p className="muted">Aún no hay torneos registrados.</p>
      ) : (
        <div className="cards-grid" role="list">
          {tournaments.map((tournament) => {
            const currentChefs =
              tournament.registeredChefs?.length ??
              tournament.participants?.length ??
              tournament.currentChefs ??
              0;
            const rawMaxParticipants =
              tournament.maxParticipants ??
              tournament.maxChefs ??
              tournament.capacity ??
              tournament.limit ??
              Infinity;
            const formattedMaxParticipants = Number.isFinite(rawMaxParticipants)
              ? rawMaxParticipants
              : '\u221e';

            const ctaLabel = isAdmin
              ? 'Administrar'
              : isVisitor
              ? 'Inscribirme'
              : isLogged
              ? 'Ver detalle'
              : 'Ver información';

            const resolveLocationName = () => {
              const raw = tournament.location ?? tournament.locationId ?? null;
                if (raw === null || raw === undefined || raw === '') {
                  return fallbackLocationName(tournament);
              }

              const asObject = typeof raw === 'object' && raw !== null;
              if (asObject) {
                const nameFromObject = raw.name || raw.title || raw.label;
                if (nameFromObject) {
                  return nameFromObject;
                }
                const idFromObject = raw.id ?? raw.locationId;
                if (idFromObject !== undefined) {
                  const key = String(idFromObject);
                  if (locationsMap.size > 0) {
                    const mapped = locationsMap.get(key);
                    if (mapped) return mapped;
                  }
                  return `ID ${key}`;
                }
                return 'Sin nombre asignado';
              }

              const key = String(raw);
              if (/^\d+$/.test(key) && locationsMap.size > 0) {
                const mapped = locationsMap.get(key);
                if (mapped) return mapped;
                return fallbackLocationName(tournament);
              }

              return key;
            };

            return (
              <article key={tournament.id} className="card" role="listitem">
                <img
                  src={tournament.image || '/src/assets/images/defaultTournament.jpg'}
                  alt={`Imagen del torneo ${tournament.name}`}
                  className="tournament-detail-image rounded-image"
                  style={{ marginBottom: '25px' }}
                />
                <h2>{tournament.name}</h2>
                <p className="muted">{tournament.description || 'Sin descripción'}</p>
                <dl className="details-list">
                  <div>
                    <dt>Ubicación</dt>
                    <dd>{resolveLocationName()}</dd>
                  </div>
                  <div>
                    <dt>Inscritos</dt>
                    <dd>
                      {currentChefs} / {formattedMaxParticipants}
                    </dd>
                  </div>
                  {tournament.date && (
                    <div>
                      <dt>Fecha</dt>
                      <dd>{new Date(tournament.date).toLocaleDateString()}</dd>
                    </div>
                  )}
                </dl>
                <Link className="btn" to={`/tournaments/${tournament.id}`}>
                  {ctaLabel}
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default TournamentListPage;