import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Swal from 'sweetalert2';
import HomePage from './pages/HomePage.jsx';
import TournamentListPage from './pages/TournamentListPage.jsx';
import TournamentDetailPage from './pages/TournamentDetailPage.jsx';
import ChefManagementPage from './pages/ChefManagementPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import LiquidNavbar from './components/LiquidNavbar.jsx';
import CountdownTimer from './components/CountdownTimer.jsx';
import './App.css';
import './styles/Enhancements.css';
import 'leaflet/dist/leaflet.css';

const AUTH_STORAGE_KEY = 'chefclash:auth';

function App() {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('No se pudo recuperar la sesión guardada', error);
      return null;
    }
  }); // { token, user: { username, name, role } }
  const navigate = useNavigate?.() || (() => {});
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [suggestionMessage, setSuggestionMessage] = useState('');
  const [enrollmentForm, setEnrollmentForm] = useState({
    name: '',
    specialty: '',
    experienceYears: '',
  });

  const handleLogin = (data) => {
    setUser(data);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.warn('No se pudo guardar la sesión', error);
      }
    }
    navigate('/profile');
  };
  const handleLogout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (error) {
        console.warn('No se pudo limpiar la sesión guardada', error);
      }
    }
    navigate('/');
  };

  const handleSuggestionSubmit = (event) => {
    event.preventDefault();
    const trimmedMessage = suggestionMessage.trim();
    if (!trimmedMessage) {
      Swal.fire({ icon: 'warning', title: 'Ups', text: 'Por favor escribe tu sugerencia antes de enviarla.' });
      return;
    }
    Swal.fire({ icon: 'success', title: '¡Gracias!', text: 'Tu sugerencia ha sido enviada.' });
    setSuggestionMessage('');
    setIsSuggestionOpen(false);
  };

  const handleEnrollmentSubmit = (event) => {
    event.preventDefault();
    const trimmedName = enrollmentForm.name.trim();
    const trimmedSpecialty = enrollmentForm.specialty.trim();
    if (!trimmedName) {
      Swal.fire({ icon: 'warning', title: 'Falta el nombre', text: 'Ingresa tu nombre para completar la inscripción.' });
      return;
    }

    if (enrollmentForm.experienceYears === '') {
      Swal.fire({ icon: 'warning', title: 'Dato requerido', text: 'Indica tus años de experiencia.' });
      return;
    }

    const parsedExperience = Number(enrollmentForm.experienceYears);
    if (Number.isNaN(parsedExperience) || parsedExperience < 0) {
      Swal.fire({ icon: 'error', title: 'Dato inválido', text: 'Los años de experiencia deben ser un número positivo.' });
      return;
    }

    Swal.fire({ icon: 'success', title: 'Inscripción enviada', text: 'Pronto nos pondremos en contacto contigo.' });
    setEnrollmentForm({ name: '', specialty: '', experienceYears: '' });
    setIsEnrollmentOpen(false);
  };

  const roleKey = (user?.user?.role || '').toLowerCase();
  const adminRoles = ['admin', 'chef_admin', 'chef-admin'];
  const isAdmin = adminRoles.includes(roleKey);
  const isLogged = !!user?.token;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand" aria-label="ChefClash">
          <svg
            className="brand-icon"
            viewBox="0 0 64 64"
            role="img"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M20 28h24v11c0 1.66-1.34 3-3 3H23c-1.66 0-3-1.34-3-3V28z"
              fill="#fff6ef"
              stroke="rgba(45, 55, 72, 0.15)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M20 26c-5.52 0-10-4.48-10-10 0-4.97 4.03-9 9-9 2.24 0 4.28 0.82 5.84 2.19C26.38 7.17 29 6 31.86 6c4.08 0 7.67 2.67 8.87 6.5C42.15 11.56 44.2 11 46.4 11c4.97 0 9 4.03 9 9s-4.48 8.5-10 8.5H20z"
              fill="#ffffff"
              stroke="rgba(45, 55, 72, 0.18)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M25 42h14l-1.2 4.8c-0.46 1.84-2.11 3.2-4.01 3.2h-3.58c-1.9 0-3.55-1.36-4.01-3.2L25 42z"
              fill="rgba(45, 55, 72, 0.12)"
            />
            <path
              d="M23 28h18v4c0 1.1-0.9 2-2 2H25c-1.1 0-2-0.9-2-2v-4z"
              fill="rgba(255, 180, 120, 0.22)"
            />
            <path
              d="M19 22c0-1.66 1.34-3 3-3"
              stroke="rgba(255, 180, 120, 0.6)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M31 48h2v6h-2z"
              fill="rgba(45, 55, 72, 0.35)"
              opacity="0.45"
            />
          </svg>
          <span className="brand-label">ChefClash</span>
        </div>
        <LiquidNavbar isAdmin={isAdmin} isLogged={isLogged} onLogout={handleLogout} />
      </header>

      <div className="c-parallax-utensil" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80"
          alt="Ilustración de cubiertos"
        />
      </div>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/tournaments" element={<TournamentListPage user={user} />} />
          <Route path="/tournaments/:id" element={<TournamentDetailPage user={user} />} />
          {isAdmin && <Route path="/admin/chefs" element={<ChefManagementPage user={user} />} />}
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage token={user?.token} />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section footer-section--suggestions">
            <button
              type="button"
              className="footer-trigger"
              aria-label="Abrir buzón de sugerencias"
              onClick={() => setIsSuggestionOpen(true)}
            >
              <span aria-hidden="true" className="footer-trigger__icon">?</span>
              <span className="sr-only">Abrir buzón de sugerencias</span>
            </button>
            <span className="footer-caption">Contáctanos</span>
          </div>
          {/* <div className="footer-section footer-section--enroll">
            <button
              type="button"
              className="footer-cta"
              onClick={() => setIsEnrollmentOpen(true)}
            >
              <span className="footer-cta__label">Inscribirme</span>
            </button>
          </div> */}
          <div className="footer-section footer-section--social">
            <h4>Síguenos</h4>
            <div className="social-icons">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12a10 10 0 1 0-11 9.95V15h-2v-3h2v-2.2c0-2 1.2-3.1 3-3.1.9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.2V12h2.5l-.4 3H14v6.95A10 10 0 0 0 22 12z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.15 4.15 0 0 0 1.82-2.3 8.3 8.3 0 0 1-2.62 1 4.14 4.14 0 0 0-7.06 3.77A11.72 11.72 0 0 1 3 4.8a4.14 4.14 0 0 0 1.28 5.52A4.07 4.07 0 0 1 2.8 9v.05a4.14 4.14 0 0 0 3.32 4.06 4.2 4.2 0 0 1-1.85.07 4.14 4.14 0 0 0 3.87 2.88A8.32 8.32 0 0 1 2 18.29a11.72 11.72 0 0 0 6.29 1.84c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.35-.01-.53A8.35 8.35 0 0 0 22.46 6z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 2 .25 2.7.54a5.4 5.4 0 0 1 1.96 1.96c.29.7.48 1.5.54 2.7.07 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 2-.54 2.7a5.4 5.4 0 0 1-1.96 1.96c-.7.29-1.5.48-2.7.54-1.3.07-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-2-.25-2.7-.54a5.4 5.4 0 0 1-1.96-1.96c-.29-.7-.48-1.5-.54-2.7-.07-1.3-.07-1.7-.07-4.9s0-3.6.07-4.9c.06-1.2.25-2 .54-2.7A5.4 5.4 0 0 1 4.4 2.81c.7-.29 1.5-.48 2.7-.54C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.2 0-3.6 0-4.8.07-.9.05-1.4.2-1.8.33a3.6 3.6 0 0 0-1.33 1.33c-.13.4-.28.9-.33 1.8-.07 1.2-.07 1.6-.07 4.8s0 3.6.07 4.8c.05.9.2 1.4.33 1.8a3.6 3.6 0 0 0 1.33 1.33c.4.13.9.28 1.8.33 1.2.07 1.6.07 4.8.07s3.6 0 4.8-.07c.9-.05 1.4-.2 1.8-.33a3.6 3.6 0 0 0 1.33-1.33c.13-.4.28-.9.33-1.8.07-1.2.07-1.6.07-4.8s0-3.6-.07-4.8c-.05-.9-.2-1.4-.33-1.8a3.6 3.6 0 0 0-1.33-1.33c-.4-.13-.9-.28-1.8-.33-1.2-.07-1.6-.07-4.8-.07zm0 3.6a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4zm0 1.8a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8zm4.8-.6a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} ChefClash. Todos los derechos reservados.</span>
          <span>Autor: Santiago Solano</span>
        </div>
      </footer>

      {isSuggestionOpen && (
        <div className="footer-modal" role="dialog" aria-modal="true" aria-label="Buzón de sugerencias">
          <div className="footer-modal__content">
            <button
              type="button"
              className="footer-modal__close footer-modal__close--small"
              aria-label="Cerrar"
              onClick={() => setIsSuggestionOpen(false)}
            >
              ×
            </button>
            <h3>Comparte tu sugerencia</h3>
            <form className="footer-form" onSubmit={handleSuggestionSubmit}>
              <div className="field">
                <label htmlFor="suggestion-message">Mensaje</label>
                <textarea
                  id="suggestion-message"
                  rows="4"
                  value={suggestionMessage}
                  onChange={(event) => setSuggestionMessage(event.target.value)}
                  placeholder="Cuéntanos cómo mejorar ChefClash"
                  required
                />
              </div>
              <div className="form-buttons">
                <button type="submit">Enviar</button>
                <button type="button" onClick={() => setIsSuggestionOpen(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEnrollmentOpen && (
        <div className="footer-modal" role="dialog" aria-modal="true" aria-label="Formulario de inscripción">
          <div className="footer-modal__content">
            <button
              type="button"
              className="footer-modal__close footer-modal__close--small"
              aria-label="Cerrar"
              onClick={() => setIsEnrollmentOpen(false)}
            >
              ×
            </button>
            <h3>Inscripción de Chef Invitado</h3>
            <form className="footer-form" onSubmit={handleEnrollmentSubmit}>
              <div className="field">
                <label htmlFor="enroll-name">Nombre</label>
                <input
                  id="enroll-name"
                  type="text"
                  value={enrollmentForm.name}
                  onChange={(event) =>
                    setEnrollmentForm({ ...enrollmentForm, name: event.target.value })
                  }
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="enroll-specialty">Especialidad</label>
                <input
                  id="enroll-specialty"
                  type="text"
                  value={enrollmentForm.specialty}
                  onChange={(event) =>
                    setEnrollmentForm({ ...enrollmentForm, specialty: event.target.value })
                  }
                  placeholder="Postres, cocina de autor..."
                />
              </div>
              <div className="field">
                <label htmlFor="enroll-experience">Años de experiencia</label>
                <input
                  id="enroll-experience"
                  type="number"
                  min="0"
                  value={enrollmentForm.experienceYears}
                  onChange={(event) =>
                    setEnrollmentForm({ ...enrollmentForm, experienceYears: event.target.value })
                  }
                  required
                />
              </div>
              <div className="form-buttons">
                <button type="submit">Enviar inscripción</button>
                <button type="button" onClick={() => setIsEnrollmentOpen(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <CountdownTimer />
    </div>
  );
}

export default App;