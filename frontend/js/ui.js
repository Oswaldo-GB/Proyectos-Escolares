// Utilidades visuales compartidas: alertas, escape de HTML y formato de fechas.

// Escapa texto para insertarlo en HTML de forma segura (evita XSS).
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Alerta flotante. type: "ok" | "error".
// Lleva ícono además de color, para que se entienda sin distinguir colores.
export function showToast(message, type = 'ok') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.textContent = `${type === 'ok' ? '✔' : '⚠'} ${message}`;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.remove(), type === 'error' ? 8000 : 4000);
}

// --- Fechas: el servidor las manda como texto "2026-10-23" o "2026-10-23 14:30:00" ---
const pad = (n) => String(n).padStart(2, '0');

export function todayValue() { // para <input type="date">
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function nowValue() { // para <input type="datetime-local">
  const d = new Date();
  return `${todayValue()}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function formatDate(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v ?? '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}
export function formatDateTime(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(v ?? '');
  return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : formatDate(v);
}

// Tono de las etiquetas de estado. Sin rojo ni verde: azul = terminado, ámbar = requiere atención.
const DONE = /^(entregad|recibid|resuelt|cerrad|correct)/i;
const ATTENTION = /^(cancelad|abiert|pendient|pieza|dañad|incomplet|faltante|retras)/i;
export function badgeTone(text) {
  if (DONE.test(text)) return 'done';
  if (ATTENTION.test(text)) return 'attention';
  return 'neutral';
}

// "Nuevo pedido" / "Nueva refacción" según el género del módulo.
export const nuevo = (entity) => (entity.fem ? 'Nueva' : 'Nuevo');
