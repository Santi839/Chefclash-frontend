import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const withAuth = (token) =>
  token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};

// --- API de Usuarios ---
export const registerUser = (payload) => apiClient.post('/api/users/register', payload);

export const loginUser = (payload) => apiClient.post('/api/users/login', payload);

export const getProfile = (token) => apiClient.get('/api/users/profile', withAuth(token));

// --- API de Torneos ---
export const getTournaments = (token) => apiClient.get('/api/tournaments', withAuth(token));

export const getTournamentById = (id, token) =>
  apiClient.get(`/api/tournaments/${id}`, withAuth(token));

export const createTournament = (payload, token) =>
  apiClient.post('/api/tournaments', payload, withAuth(token));

export const updateTournament = (id, payload, token) =>
  apiClient.put(`/api/tournaments/${id}`, payload, withAuth(token));

export const deleteTournament = (id, token) =>
  apiClient.delete(`/api/tournaments/${id}`, withAuth(token));

export const registerChef = (tournamentId, chefId, token) =>
  apiClient.post(
    `/api/tournaments/${tournamentId}/register`,
    { chefId },
    withAuth(token)
  );

export const submitChefResult = (tournamentId, payload, token) =>
  apiClient.post(`/api/tournaments/${tournamentId}/submit`, payload, withAuth(token));

export const getTournamentRanking = (tournamentId, token) =>
  apiClient.get(`/api/tournaments/${tournamentId}/ranking`, withAuth(token));

export const removeChefFromTournament = (tournamentId, chefId, token) =>
  apiClient.delete(`/api/tournaments/${tournamentId}/chefs/${chefId}`, withAuth(token));

// --- API de Chefs ---
export const getChefs = (token) => apiClient.get('/api/chefs', withAuth(token));

export const getChefById = (id, token) => apiClient.get(`/api/chefs/${id}`, withAuth(token));

export const createChef = (chefData, token) => apiClient.post('/api/chefs', chefData, withAuth(token));

export const updateChef = (id, chefData, token) => apiClient.put(`/api/chefs/${id}`, chefData, withAuth(token));

export const deleteChef = (id, token) => apiClient.delete(`/api/chefs/${id}`, withAuth(token));

// --- API de Ubicaciones ---
export const getLocations = (token) => apiClient.get('/api/locations', withAuth(token));