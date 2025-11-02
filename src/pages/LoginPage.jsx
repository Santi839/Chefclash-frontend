import { useState } from 'react';
import Swal from 'sweetalert2';
import { loginUser, getProfile } from '../services/api';

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const trimmedForm = {
      username: form.username.trim(),
      password: form.password.trim(),
    };
    try {
      const res = await loginUser(trimmedForm);
      const { token, user: loginPayloadUser } = res.data || {};
      if (!token) {
        throw new Error('Token faltante en la respuesta de login');
      }

      let resolvedUser = loginPayloadUser;
      try {
        const profileRes = await getProfile(token);
        resolvedUser = profileRes.data || loginPayloadUser;
      } catch (profileErr) {
        console.warn('No se pudo cargar el perfil después del login', profileErr);
        if (!resolvedUser) {
          throw profileErr;
        }
      }

      onLogin({ token, user: resolvedUser });
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      const fallback = err.message === 'Token faltante en la respuesta de login'
        ? 'La respuesta del servidor no incluyó un token. Inténtalo nuevamente.'
        : 'Credenciales inválidas';
      Swal.fire({ icon: 'error', title: 'Error', text: backendMessage || fallback });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <div className="card" style={{ maxWidth: 400, margin: '2rem auto' }}>
        <h1>Iniciar sesión</h1>
  {/* SweetAlert2 handles error alerts visually */}
        <form onSubmit={handleSubmit} className="stack">
          <label htmlFor="username">Usuario</label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            required
          />
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;
