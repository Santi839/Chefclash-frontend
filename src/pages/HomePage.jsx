import { Link } from 'react-router-dom';
import { useState } from 'react';
import GallerySlider from '../components/GallerySlider.jsx';
import RegulationAccordion from '../components/RegulationAccordion.jsx';
import SponsorGrid from '../components/SponsorGrid.jsx';

function HomePage({ user }) {
  const [showPopup, setShowPopup] = useState(false);

  const roleKey = (user?.user?.role || '').toLowerCase();
  const adminRoles = ['admin', 'chef_admin', 'chef-admin'];
  const isAdmin = adminRoles.includes(roleKey);
  const isLogged = !!user?.token;

  return (
    <section className="page home-page">
      <div className="hero">
        <h1>Torneos de Cocina</h1>
        <p>
          Gestiona chefs, organiza competencias culinarias y lleva el registro de resultados
          en tiempo real. Esta plataforma conecta a organizadores, jueces y participantes
          para tener torneos memorables.
        </p>
        <div className="cta-group" role="navigation" aria-label="Acciones principales">
          <Link className="btn primary" to="/tournaments">
            Explorar torneos
          </Link>
          {isAdmin ? (
            <Link className="btn" to="/admin/chefs">
              Administrar chefs
            </Link>
          ) : isLogged ? (
            <Link className="btn" to="/profile">
              Ver mi perfil
            </Link>
          ) : (
            <Link className="btn" to="/login">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>

      <section className="c-countdown-wrapper" aria-label="Cuenta regresiva para el próximo torneo">
        <div
          className="c-contador"
          data-fecha-fin={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()}
        />
        <button
          type="button"
          className="btn-inscribirse is-pulse"
          onClick={() => setShowPopup(true)}
        >
          Inscribirse
        </button>
      </section>

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <h2>Formulario de Inscripción</h2>
            <form>
              <label htmlFor="name">Nombre:</label>
              <input type="text" id="name" name="name" required />

              <label htmlFor="email">Correo Electrónico:</label>
              <input type="email" id="email" name="email" required />

              <label htmlFor="phone">Teléfono:</label>
              <input type="tel" id="phone" name="phone" required />

              <button 
                type="submit" 
                className="btn primary" 
                style={{ marginTop: '1rem' }}
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="feature-grid">
        <article className="card">
          <h2>Inscripción ágil</h2>
          <p>Busca chefs disponibles y agrégalos rápidamente a tus torneos activos.</p>
        </article>
        <article className="card">
          <h2>Resultados transparentes</h2>
          <p>Registra puntuaciones y genera rankings automáticos en pocos clics.</p>
        </article>
        <article className="card">
          <h2>Estado actualizado</h2>
          <p>
            Visualiza inscripciones, capacidad disponible y desempeño de los chefs con datos
            siempre sincronizados.
          </p>
        </article>
      </div>

      <GallerySlider />

      <RegulationAccordion />

      <SponsorGrid title="Nuestros Aliados" />
    </section>
  );
}

export default HomePage;
