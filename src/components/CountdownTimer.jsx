import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const formatUnit = (value) => String(value).padStart(2, '0');

function renderCountdown(container, endDate) {
  const now = Date.now();
  const end = new Date(endDate).getTime();
  const diff = Math.max(end - now, 0);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  container.innerHTML = `
    <div class="c-contador__item"><span>${formatUnit(days)}</span><small>Días</small></div>
    <div class="c-contador__item"><span>${formatUnit(hours)}</span><small>Horas</small></div>
    <div class="c-contador__item"><span>${formatUnit(minutes)}</span><small>Min</small></div>
    <div class="c-contador__item"><span>${formatUnit(seconds)}</span><small>Seg</small></div>
  `;
}

function CountdownTimer() {
  const location = useLocation();

  useEffect(() => {
    const containers = document.querySelectorAll('.c-contador');
    if (!containers.length) return undefined;

    const refresh = () => {
      containers.forEach((container) => {
        const endDate = container.dataset.fechaFin;
        if (!endDate) return;
        renderCountdown(container, endDate);
      });
    };

    refresh();
    const interval = window.setInterval(refresh, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [location.pathname]);

  return null;
}

export default CountdownTimer;
