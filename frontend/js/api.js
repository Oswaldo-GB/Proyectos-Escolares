// Capa de comunicación con el backend.
// Toda petición pasa por request(), que convierte cualquier fallo (red, tiempo agotado
// o error del servidor) en un ApiError con un mensaje legible para el empleado.

export class ApiError extends Error {
  constructor(message, status = 0, fields = null) {
    super(message);
    this.status = status;
    this.fields = fields; // { columna: "mensaje" } cuando el servidor valida campos
  }
}

const TIMEOUT_MS = 15000;
const BASE_URL = ''; // <- URL de tu backend en Node.js

async function request(endpoint, options = {}) {
  const url = BASE_URL + endpoint; // Une la URL base con la ruta (ej: http://localhost:3000/api/meta)
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal, ...options });
  } catch (err) {
    throw new ApiError(err.name === 'AbortError'
      ? 'El servidor tardó demasiado en responder. Inténtalo de nuevo.'
      : 'No hay conexión con el servidor. Verifica que esté encendido.');
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return null; // eliminación exitosa, sin cuerpo

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error || `Error inesperado del servidor (${res.status}).`, res.status, data?.fields);
  return data;
}

const json = (method, body) => ({ method, body: JSON.stringify(body) });

export const Api = {
  meta: () => request('/api/meta'),
  list: (slug, search = '') => request(`/api/${slug}?search=${encodeURIComponent(search)}`),
  options: (slug) => request(`/api/${slug}/options`),
  create: (slug, body) => request(`/api/${slug}`, json('POST', body)),
  update: (slug, id, body) => request(`/api/${slug}/${id}`, json('PUT', body)),
  remove: (slug, id) => request(`/api/${slug}/${id}`, { method: 'DELETE' }),
};