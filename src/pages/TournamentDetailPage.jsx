import { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import {
  getTournamentById,
  registerChef,
  submitChefResult,
  getTournamentRanking,
  getChefs,
  removeChefFromTournament,
  getLocations,
} from '../services/api';
import { initializeDetailMap, torneosData as fallbackTournaments } from '../utils/mapUtils.js';
import './TournamentDetailPage.css';

function TournamentDetailPage({ user }) {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [availableChefs, setAvailableChefs] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRankingVisible, setIsRankingVisible] = useState(false);
  const [formValues, setFormValues] = useState({ chefId: '', resultChefId: '', score: '', notes: '' });

  const userToken = user?.token ?? null;
  const roleKey = (user?.user?.role || '').toLowerCase();
  const adminRoles = ['admin', 'chef_admin', 'chef-admin'];
  const isLogged = !!user?.token;
  const isAdmin = adminRoles.includes(roleKey);
  const isVisitor = roleKey === 'visitor';
  const ownChefId = user?.user?.chefId ?? null;
  const selfChefId = useMemo(() => {
    if (!isVisitor) {
      return ownChefId;
    }
    const sourceId = ownChefId ?? user?.user?.id ?? null;
    return sourceId ?? null;
  }, [isVisitor, ownChefId, user]);
  const canManageTournament = isAdmin;
  const canRegisterSelf = isLogged && (isAdmin || !!selfChefId);
  const registrationSectionTitle = isAdmin ? 'Inscribir chef' : 'Inscribirme en el torneo';
  const registerActionLabel = isAdmin ? 'Registrar chef' : 'Inscribirme';
  const selectChefLabel = isAdmin ? 'Selecciona un chef' : 'Confirma tu perfil de chef';

  const loadTournament = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getTournamentById(id, userToken);
      setTournament(response.data);
    } catch (err) {
      setError('No se pudo cargar el torneo: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, userToken]);

  const loadChefs = useCallback(async () => {
    try {
      const response = await getChefs(userToken);
      setAvailableChefs(response.data);
    } catch (err) {
      console.error('No se pudieron cargar los chefs disponibles', err);
      setError((prev) =>
        prev || 'No se pudieron cargar los chefs disponibles: ' + (err.response?.data?.message || err.message)
      );
    }
  }, [userToken]);

  // load locations map for rendering when location is an id
  const [locationsMap, setLocationsMap] = useState(new Map());
  const loadLocations = useCallback(async () => {
    try {
      const resp = await getLocations(userToken);
      const arr = Array.isArray(resp.data) ? resp.data : [];
      const map = new Map(arr.map((l) => [String(l.id), l.name || l.title || l.label || '']));
      setLocationsMap(map);
    } catch (err) {
      console.warn('No se pudieron cargar las ubicaciones', err);
    }
  }, [userToken]);

  const resolveLocationName = useCallback(
    (target) => {
      const rawLocation = target?.location ?? target?.locationId ?? null;

      if (rawLocation === null || rawLocation === undefined || rawLocation === '') {
        if (locationsMap.size > 0) {
          const names = [...locationsMap.values()].filter(Boolean);
          if (names.length > 0) {
            const idValue = Number(target?.id);
            if (Number.isFinite(idValue) && idValue >= 0) {
              return names[idValue % names.length];
            }
            const key = String(target?.id || target?.name || target?.slug || '0');
            const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return names[hash % names.length];
          }
        }
        return 'No registrada';
      }

      if (typeof rawLocation === 'object') {
        const nameFromObj = rawLocation.name || rawLocation.title || rawLocation.label;
        if (nameFromObj) {
          return nameFromObj;
        }

        const idFromObj = rawLocation.id ?? rawLocation.locationId;
        if (idFromObj !== undefined) {
          const key = String(idFromObj);
          if (locationsMap.size > 0) {
            const mapped = locationsMap.get(key);
            if (mapped) {
              return mapped;
            }
          }
          return `ID ${key}`;
        }

        return 'Sin nombre asignado';
      }

      const key = String(rawLocation);
      if (/^\d+$/.test(key) && locationsMap.size > 0) {
        const mapped = locationsMap.get(key);
        if (mapped) {
          return mapped;
        }
        return `ID ${key}`;
      }

      return key;
    },
    [locationsMap]
  );

  useEffect(() => {
    loadTournament();
    loadChefs();
    loadLocations();
  }, [loadTournament, loadChefs, loadLocations]);

  useEffect(() => {
    if (!tournament) return;

    const parseCoordinate = (sources) => {
      for (const value of sources) {
        if (typeof value === 'number' && Number.isFinite(value)) {
          return value;
        }
        if (typeof value === 'string' && value.trim() !== '') {
          const parsed = Number(value);
          if (Number.isFinite(parsed)) {
            return parsed;
          }
        }
      }
      return null;
    };

    const locationData = typeof tournament.location === 'object' ? tournament.location : {};
    const lat =
      parseCoordinate([
        tournament.lat,
        tournament.latitude,
        locationData.lat,
        locationData.latitude,
        tournament.locationLat,
      ]) ?? fallbackTournaments[0]?.lat ?? 0;
    const lon =
      parseCoordinate([
        tournament.lon,
        tournament.lng,
        tournament.longitude,
        locationData.lon,
        locationData.lng,
        locationData.longitude,
        tournament.locationLon,
      ]) ?? fallbackTournaments[0]?.lon ?? 0;

    initializeDetailMap('mapa-detalle', lat, lon);
  }, [tournament]);

  const registeredChefs = useMemo(() => {
    if (!tournament) return [];
    const source = Array.isArray(tournament.registeredChefs)
      ? tournament.registeredChefs
      : Array.isArray(tournament.participants)
      ? tournament.participants
      : Array.isArray(tournament.chefs)
      ? tournament.chefs
      : [];

    return source.map((entry) => {
      const base = entry.chef || entry.participant || entry;
      const id = entry.chefId || base?.id || entry.id;
      return {
        id,
        name: base?.name || entry.chefName || 'Chef sin nombre',
        specialty: base?.specialty || entry.specialty || '',
        score: entry.score ?? entry.result?.score ?? base?.score,
        notes: entry.notes ?? entry.result?.notes ?? base?.notes,
      };
    });
  }, [tournament]);

  const scores = useMemo(() => {
    if (!tournament) return [];
    if (Array.isArray(tournament.scores)) return tournament.scores;
    if (Array.isArray(tournament.results)) return tournament.results;
    return registeredChefs
      .filter((chef) => typeof chef.score === 'number')
      .map((chef) => ({
        chefId: chef.id,
        chefName: chef.name,
        score: chef.score,
        notes: chef.notes,
      }));
  }, [tournament, registeredChefs]);

  const loadRanking = async () => {
    try {
      const response = await getTournamentRanking(id, userToken);
      setRanking(response.data);
    } catch (err) {
      setRanking([]);
      setError('No se pudo obtener el ranking: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRegisterChef = async (event) => {
    event.preventDefault();
    if (!canRegisterSelf) {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso restringido',
        text: 'Inicia sesión con una cuenta autorizada para inscribirte en este torneo.',
      });
      return;
    }
    if (!formValues.chefId) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Selecciona un chef para inscribir.' });
      return;
    }
    if (isVisitor && selfChefId && String(formValues.chefId) !== String(selfChefId)) {
      Swal.fire({
        icon: 'warning',
        title: 'Solo puedes inscribirte tú',
        text: 'Selecciona tu propio perfil para completar la inscripción.',
      });
      return;
    }
    if (isVisitor && !selfChefId) {
      Swal.fire({
        icon: 'warning',
        title: 'Perfil incompleto',
        text: 'No encontramos tu perfil de chef para completar la inscripción.',
      });
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
  await registerChef(id, formValues.chefId, userToken);
      await loadTournament();
      await loadChefs();
      Swal.fire({ icon: 'success', title: 'Chef inscrito', text: 'Chef inscrito correctamente.' });
      setFormValues((prev) => ({ ...prev, chefId: '' }));
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo inscribir al chef: ' + (err.response?.data?.message || err.message) });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitResult = async (event) => {
    event.preventDefault();

    if (!canManageTournament) {
      Swal.fire({ icon: 'warning', title: 'Acceso restringido', text: 'Solo los administradores pueden registrar resultados.' });
      return;
    }

    if (!formValues.resultChefId) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Selecciona un chef para registrar el resultado.' });
      return;
    }

    const parsedScore = Number(formValues.score);
    if (Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El puntaje debe estar entre 0 y 100.' });
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await submitChefResult(id, {
        chefId: formValues.resultChefId,
        score: parsedScore,
        notes: formValues.notes.trim(),
      }, userToken);
      await loadTournament();
      Swal.fire({ icon: 'success', title: 'Resultado registrado', text: 'Resultado registrado correctamente.' });
      setFormValues((prev) => ({ ...prev, score: '', notes: '' }));
      if (isRankingVisible) {
        await loadRanking();
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo registrar el resultado: ' + (err.response?.data?.message || err.message) });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveChef = async (chefId) => {
    if (!canManageTournament) {
      Swal.fire({ icon: 'warning', title: 'Acceso restringido', text: 'Solo los administradores pueden quitar chefs del torneo.' });
      return;
    }
    const result = await Swal.fire({
      title: '¿Deseas quitar este chef del torneo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) {
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
  await removeChefFromTournament(id, chefId, userToken);
      await loadTournament();
      await loadChefs();
      Swal.fire({ icon: 'success', title: 'Chef eliminado', text: 'Chef eliminado del torneo.' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo quitar al chef: ' + (err.response?.data?.message || err.message) });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleRanking = async () => {
    const nextState = !isRankingVisible;
    setIsRankingVisible(nextState);
    if (nextState) {
      await loadRanking();
    }
  };

  const availableChefsForSelect = useMemo(() => {
    const baseList = availableChefs
      .filter((chef) => !registeredChefs.some((registered) => registered.id === chef.id))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' }));

    if (isAdmin) {
      return baseList;
    }

    const targetChefId = isVisitor ? selfChefId : ownChefId;

    if (!targetChefId) {
      return [];
    }

    const match = baseList.find((chef) => {
      const candidateIds = [chef.id, chef.userId, chef.accountId, chef.chefId]
        .filter((value) => value !== undefined && value !== null)
        .map((value) => String(value));
      return candidateIds.includes(String(targetChefId));
    });

    return match ? [match] : [];
  }, [availableChefs, registeredChefs, isVisitor, isAdmin, selfChefId, ownChefId]);

  const maxParticipants = useMemo(() => {
    if (!tournament) return Infinity;
    return (
      tournament.maxParticipants ??
      tournament.maxChefs ??
      tournament.capacity ??
      tournament.limit ??
      Infinity
    );
  }, [tournament]);

  const formattedMaxParticipants = Number.isFinite(maxParticipants) ? maxParticipants : '∞';

  useEffect(() => {
    if (!canRegisterSelf || isAdmin) {
      return;
    }

    const match = availableChefsForSelect.find((chef) => {
      const ids = [chef.id, chef.userId, chef.accountId, chef.chefId]
        .filter((value) => value !== undefined && value !== null)
        .map((value) => String(value));
      return ids.includes(String(selfChefId));
    });

    const selectedChefId = match?.id ?? availableChefsForSelect[0]?.id ?? '';

    setFormValues((prev) => {
      if (!selectedChefId || String(prev.chefId) === String(selectedChefId)) {
        return prev;
      }
      return { ...prev, chefId: selectedChefId };
    });
  }, [availableChefsForSelect, canRegisterSelf, isAdmin, selfChefId]);

  return (
    <section className="page tournament-detail">
      {loading ? (
        <p className="muted">Cargando información del torneo...</p>
      ) : tournament ? (
        <>
          <header className="page-header">
            <div className="tournament-detail-header">
              <div
                className="tournament-detail-background"
                style={{
                  backgroundImage: `url(${
                    tournament.image || '/src/assets/images/defaultTournament.jpg'
                  })`,
                }}
              ></div>
              <div className="tournament-detail-content">
                <h1>{tournament.name}</h1>
                <p className="muted">{tournament.description || 'Sin descripción disponible.'}</p>
                <dl className="details-list">
                  <div>
                    <dt>Ubicación</dt>
                    <dd>{resolveLocationName(tournament)}</dd>
                  </div>
                  <div>
                    <dt>Capacidad</dt>
                    <dd>
                      {registeredChefs.length} / {formattedMaxParticipants} chefs
                    </dd>
                  </div>
                  {tournament.date && (
                    <div>
                      <dt>Fecha</dt>
                      <dd>{new Date(tournament.date).toLocaleString()}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </header>

          <div
            id="mapa-detalle"
            className="c-map-container"
            role="region"
            aria-label="Mapa con la ubicación del torneo"
          />

          {/* SweetAlert2 handles error/success alerts visually */}

          <div className="layout-columns">
            <section className="card">
              <h2>Chefs inscritos</h2>
              {registeredChefs.length === 0 ? (
                <p className="muted">Aún no hay chefs en este torneo.</p>
              ) : (
                <ul className="plain-list">
                  {registeredChefs.map((chef) => (
                    <li key={chef.id} className="list-item-row">
                      <div>
                        <span>{chef.name}</span>
                        <span className="muted small">
                          {chef.specialty ? `Especialidad: ${chef.specialty}` : ''}
                        </span>
                      </div>
                      {canManageTournament && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChef(chef.id)}
                          disabled={actionLoading}
                        >
                          Quitar
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card">
              <h2>{registrationSectionTitle}</h2>
              {canRegisterSelf ? (
                availableChefsForSelect.length === 0 ? (
                  <p className="muted">
                    {isVisitor
                      ? 'No encontramos tu perfil de chef disponible para inscribirte en este torneo.'
                      : 'No hay chefs disponibles para inscribir en este momento.'}
                  </p>
                ) : (
                  <form onSubmit={handleRegisterChef} className="stack">
                    <label htmlFor="chef-select">{selectChefLabel}</label>
                    <select
                      id="chef-select"
                      value={formValues.chefId}
                      onChange={(event) =>
                        setFormValues({ ...formValues, chefId: event.target.value })
                      }
                      required
                    >
                      {isAdmin && (
                        <option value="">
                          Selecciona un chef disponible
                        </option>
                      )}
                      {availableChefsForSelect.map((chef) => (
                        <option key={chef.id} value={chef.id}>
                          {chef.name} ({chef.specialty || 'Sin especialidad'})
                        </option>
                      ))}
                    </select>
                    <button type="submit" disabled={actionLoading}>
                      {actionLoading ? 'Procesando...' : registerActionLabel}
                    </button>
                  </form>
                )
              ) : isLogged ? (
                <p className="muted">Tu rol no permite inscribir chefs en este torneo.</p>
              ) : (
                <p className="muted">Inicia sesión para inscribirte en este torneo.</p>
              )}
            </section>
          </div>

          <section className="card">
            <h2>Registrar resultado</h2>
            {canManageTournament ? (
              registeredChefs.length === 0 ? (
                <p className="muted">Agrega chefs al torneo para registrar resultados.</p>
              ) : (
                <form onSubmit={handleSubmitResult} className="stack">
                  <label htmlFor="result-chef">Chef</label>
                  <select
                    id="result-chef"
                    value={formValues.resultChefId}
                    onChange={(event) =>
                      setFormValues({ ...formValues, resultChefId: event.target.value })
                    }
                    required
                  >
                    <option value="">Selecciona un chef inscrito</option>
                    {registeredChefs.map((chef) => (
                      <option key={chef.id} value={chef.id}>
                        {chef.name}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="score">Puntaje (0-100)</label>
                  <input
                    id="score"
                    type="number"
                    min="0"
                    max="100"
                    value={formValues.score}
                    onChange={(event) =>
                      setFormValues({ ...formValues, score: event.target.value })
                    }
                    required
                  />

                  <label htmlFor="notes">Notas</label>
                  <textarea
                    id="notes"
                    rows="3"
                    value={formValues.notes}
                    onChange={(event) =>
                      setFormValues({ ...formValues, notes: event.target.value })
                    }
                    placeholder="Notas del jurado (opcional)"
                  />

                  <button type="submit" disabled={actionLoading}>
                    {actionLoading ? 'Guardando...' : 'Guardar resultado'}
                  </button>
                </form>
              )
            ) : (
              <p className="muted">Solo los administradores pueden registrar resultados.</p>
            )}
          </section>

          <section className="card">
            <div className="card-header">
              <h2>Resultados</h2>
              <button type="button" onClick={handleToggleRanking}>
                {isRankingVisible ? 'Ocultar ranking' : 'Ver ranking'}
              </button>
            </div>

            {scores.length === 0 ? (
              <p className="muted">Aún no hay resultados registrados.</p>
            ) : (
              <div className="table-wrapper" role="region">
                <table>
                  <thead>
                    <tr>
                      <th>Chef</th>
                      <th>Puntaje</th>
                      <th>Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map((result) => (
                      <tr key={result.id || result.chefId}>
                        <td>{result.chefName || result.chef?.name || '—'}</td>
                        <td>{typeof result.score === 'number' ? result.score : 'Pendiente'}</td>
                        <td>{result.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {isRankingVisible && (
            <section className="card ranking-card">
              <h2>Ranking de Chefs</h2>
              {ranking.length === 0 ? (
                <p className="muted">No hay ranking disponible todavía.</p>
              ) : (
                <div className="table-wrapper" role="region">
                  <table>
                    <thead>
                      <tr>
                        <th>Puesto</th>
                        <th>Chef</th>
                        <th>Puntaje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...ranking]
                        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
                        .map((item, idx) => (
                          <tr key={item.chefId || item.id}>
                            <td>{idx + 1}</td>
                            <td>{item.chefName || item.name}</td>
                            <td>{item.score}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      ) : (
        <p className="muted">No se encontró el torneo solicitado.</p>
      )}
      {error && (
        <div className="alert error-message" role="alert">
          {error}
        </div>
      )}
    </section>
  );
}

export default TournamentDetailPage;
