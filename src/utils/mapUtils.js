import L from 'leaflet';

export const torneosData = [
  { id: 1, titulo: 'Copa Gourmet Andina', lat: -12.0464, lon: -77.0428 },
  { id: 2, titulo: 'Festival Sabores del Sur', lat: -38.9516, lon: -68.0591 },
  { id: 3, titulo: 'Challenge Mar y Tierra', lat: 19.4326, lon: -99.1332 },
];

const isBrowser = typeof window !== 'undefined';
let generalMapInstance = null;
let detailMapInstance = null;

export function initializeGeneralMap(containerId, data = torneosData) {
  if (!isBrowser) return null;
  const container = document.getElementById(containerId);
  if (!container) return null;
  container.innerHTML = '';

  if (generalMapInstance) {
    generalMapInstance.remove();
    generalMapInstance = null;
  }

  const map = L.map(containerId, { scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  const bounds = [];
  data.forEach((torneo) => {
    const marker = L.marker([torneo.lat, torneo.lon]);
    marker.addTo(map).bindPopup(`<strong>${torneo.titulo}</strong>`);
    bounds.push([torneo.lat, torneo.lon]);
  });

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [40, 40] });
  } else {
    map.setView([0, 0], 2);
  }

  generalMapInstance = map;
  return map;
}

export function initializeDetailMap(containerId, lat, lon) {
  if (!isBrowser) return null;
  const container = document.getElementById(containerId);
  if (!container) return null;
  container.innerHTML = '';

  if (detailMapInstance) {
    detailMapInstance.remove();
    detailMapInstance = null;
  }

  const map = L.map(containerId, { scrollWheelZoom: false }).setView([lat, lon], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  L.marker([lat, lon]).addTo(map);
  detailMapInstance = map;
  return map;
}
