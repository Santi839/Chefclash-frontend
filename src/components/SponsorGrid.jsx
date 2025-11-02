import saboresMundo from '/src/assets/images/saboresMundo.jpg';
import fuegoVivo from '/src/assets/images/fuegoVivo.jpg';
import granoSelecto from '/src/assets/images/granoSelecto.jpg';
import cuchilloTabla from '/src/assets/images/cuchilloTabla.jpg';

const sponsors = [
  { id: 1, name: 'Sabores del Mundo', logo: saboresMundo },
  { id: 2, name: 'Fuego Vivo', logo: fuegoVivo },
  { id: 3, name: 'Grano Selecto', logo: granoSelecto },
  { id: 4, name: 'Cuchillo & Tabla', logo: cuchilloTabla },
];

function SponsorGrid({ title = 'Patrocinadores Oficiales' }) {
  return (
    <section aria-label="Patrocinadores" className="c-sponsor-grid-section">
      <h2 style={{ fontFamily: 'var(--c-display-font)', marginBottom: '1rem' }}>{title}</h2>
      <div className="c-sponsor-grid">
        {sponsors.map((sponsor) => (
          <div key={sponsor.id} className="c-sponsor-grid__item">
            <img 
              src={sponsor.logo} 
              alt={`Logo de ${sponsor.name}`} 
              loading="lazy" 
              style={{
                borderRadius: '12px',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default SponsorGrid;
