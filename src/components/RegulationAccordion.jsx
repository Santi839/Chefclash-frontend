function RegulationAccordion() {
  const sections = [
    {
      title: '1. Requisitos de inscripción',
      description:
        'Los chefs deben registrarse con una receta original documentada y un video corto de presentación.',
    },
    {
      title: '2. Criterios de evaluación',
      description:
        'El jurado califica sabor, presentación e innovación con puntajes del 0 al 100. Cada ronda suma al ranking final.',
    },
    {
      title: '3. Código de conducta',
      description:
        'Se espera puntualidad, trabajo colaborativo y respeto a las decisiones del jurado y otros participantes.',
    },
  ];

  return (
    <section className="c-reglamento" aria-label="Reglamento del torneo">
      <h2 className="c-reglamento__title">Reglamento Oficial</h2>
      {sections.map((section) => (
        <details key={section.title} className="c-reglamento__item">
          <summary>{section.title}</summary>
          <p>{section.description}</p>
        </details>
      ))}
    </section>
  );
}

export default RegulationAccordion;
