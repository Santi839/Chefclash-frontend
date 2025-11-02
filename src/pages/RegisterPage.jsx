import { useState } from 'react';
import Swal from 'sweetalert2';
import { registerUser } from '../services/api';

function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const trimmedForm = {
      username: form.username.trim(),
      password: form.password.trim(),
    };
    try {
      await registerUser({ ...trimmedForm, role: 'visitor' });
      Swal.fire({ icon: 'success', title: 'Registro exitoso', text: 'Usuario registrado correctamente. Ahora puedes iniciar sesión.' });
      setForm({ username: '', password: '' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'No se pudo registrar el usuario' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <div className="card" style={{ maxWidth: 400, margin: '2rem auto' }}>
        <h1>Registro de usuario</h1>
  {/* SweetAlert2 handles error/success alerts visually */}
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
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default RegisterPage;
