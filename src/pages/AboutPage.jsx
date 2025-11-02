import SponsorGrid from '../components/SponsorGrid.jsx';

function AboutPage() {
  const teamMembers = [
    {
      id: 1,
      name: 'Ana Rivera',
      role: 'Directora Gastronómica',
      avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=320&q=80',
    },
    {
      id: 2,
      name: 'Mateo León',
      role: 'Coordinador de Jurados',
      avatar: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=320&q=80',
    },
    {
      id: 3,
      name: 'Lucía Prado',
      role: 'Productora de Eventos',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80',
    },
  ];

  return (
    <section className="page c-about-page">
      <div className="c-about-grid">
        <article className="c-about-card">
          <h2>Nuestra Misión</h2>
          <p>
            Impulsamos a chefs y proyectos gastronómicos emergentes con torneos transparentes,
            mentoría especializada y escenarios de alto impacto para mostrar su talento.
          </p>
        </article>
        <article className="c-about-card">
          <h2>Visión</h2>
          <p>
            Convertirnos en la plataforma latinoamericana líder para competencias culinarias,
            conectando a comunidades, patrocinadores y medios con experiencias inolvidables.
          </p>
        </article>
      </div>

      <article className="c-about-card">
        <h2>Nuestro Equipo</h2>
        <ul className="c-team-list">
          {teamMembers.map((member) => (
            <li key={member.id} className="c-team-member">
              <img src={member.avatar} alt={member.name} loading="lazy" />
              <h3>{member.name}</h3>
              <span>{member.role}</span>
            </li>
          ))}
        </ul>
      </article>

      <SponsorGrid />
    </section>
  );
}

export default AboutPage;
