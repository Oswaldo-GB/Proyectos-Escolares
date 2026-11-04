/**
 * Servicio de validación.
 * Recibe el cuerpo de la petición y la definición de la entidad (config/entities.js),
 * y devuelve los valores limpios y tipados, o los errores por campo.
 * Nunca confía en lo que mande el navegador: el frontend valida por comodidad,
 * pero la validación real ocurre aquí.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+\-.x#]{7,30}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_RE = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/;
const INT_MAX = 2147483647;

// ¿Existe realmente ese día? (descarta 2026-02-31)
function isRealDate(s) {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

const isEmpty = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

/** Valida un valor NO vacío. Devuelve { value } o { error }. */
function parseValue(col, raw) {
  if (typeof raw === 'object') return { error: 'Valor inválido.' };

  switch (col.type) {
    case 'int':
    case 'select': {
      const n = Number(raw);
      if (!Number.isInteger(n) || Math.abs(n) > INT_MAX) {
        return { error: col.type === 'select' ? 'Selecciona una opción válida.' : 'Debe ser un número entero.' };
      }
      if (col.type === 'select' && n <= 0) return { error: 'Selecciona una opción válida.' };
      if (col.min !== undefined && n < col.min) return { error: `Debe ser mayor o igual a ${col.min}.` };
      if (col.max !== undefined && n > col.max) return { error: `Debe ser menor o igual a ${col.max}.` };
      return { value: n };
    }
    case 'date': {
      const s = String(raw).trim().slice(0, 10);
      if (!DATE_RE.test(s) || !isRealDate(s)) return { error: 'Fecha inválida.' };
      return { value: s };
    }
    case 'datetime': {
      const m = DATETIME_RE.exec(String(raw).trim());
      const [hh, mm, ss] = m ? [Number(m[2]), Number(m[3]), Number(m[4] ?? 0)] : [];
      if (!m || !isRealDate(m[1]) || hh > 23 || mm > 59 || ss > 59) return { error: 'Fecha y hora inválidas.' };
      return { value: `${m[1]} ${m[2]}:${m[3]}:${m[4] ?? '00'}` };
    }
    default: { // text | textarea | email | tel
      const s = String(raw).trim();
      if (col.maxLength && s.length > col.maxLength) return { error: `Máximo ${col.maxLength} caracteres.` };
      if (col.type === 'email' && !EMAIL_RE.test(s)) return { error: 'Correo electrónico inválido.' };
      if (col.type === 'tel' && !PHONE_RE.test(s)) return { error: 'Teléfono inválido (usa dígitos, espacios, + - ( ) ).' };
      return { value: s };
    }
  }
}

/**
 * @returns {{ values: object, fields: object }}
 *   values: { columna: valor|null } listo para el INSERT/UPDATE
 *   fields: { columna: "mensaje" } (vacío si todo está bien)
 */
function validateBody(entity, body = {}) {
  const values = {};
  const fields = {};

  for (const col of entity.columns) {
    const raw = body?.[col.name];

    if (col.type === 'boolean') {
      // Un checkbox sin marcar simplemente no se envía → usa el valor por defecto.
      values[col.name] = raw === undefined ? Boolean(col.default) : (raw === true || raw === 'true' || raw === 1);
      continue;
    }
    if (isEmpty(raw)) {
      values[col.name] = null;
      if (col.required) fields[col.name] = 'Campo obligatorio.';
      continue;
    }
    const result = parseValue(col, raw);
    if (result.error) fields[col.name] = result.error;
    else values[col.name] = result.value;
  }
    // Regla "uno y solo uno" (refleja un CHECK de la base de datos).
  for (const group of entity.exactlyOne ?? []) {
    const filled = group.filter((n) => values[n] !== null && values[n] !== undefined);
    if (filled.length !== 1) {
      const labels = group.map((n) => entity.columns.find((c) => c.name === n).label).join(' o ');
      group.forEach((n) => { fields[n] ||= `Elige solo uno: ${labels}.`; });
    }
  }
  return { values, fields };
}

module.exports = { validateBody };
