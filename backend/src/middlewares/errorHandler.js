/**
 * Manejo centralizado de errores.
 * Todo error del backend sale al frontend con el mismo formato:
 *    { error: "mensaje legible", fields?: { columna: "mensaje" } }
 * El detalle técnico se queda únicamente en la consola del servidor.
 */

// Error propio para respuestas HTTP controladas (400, 404, 409...).
class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields; // errores por campo, para marcarlos en el formulario
  }
}

/**
 * Traduce errores de PostgreSQL / red a mensajes comprensibles para el empleado.
 * `entity` (opcional) permite nombrar la columna o tabla en el mensaje.
 */
function translateDbError(err, entity) {
  if (!err || err instanceof HttpError) return err;
  const { bySlug, entities } = require('../config/entities'); // carga diferida: evita ciclos

  const colLabel = (name) => entity?.columns.find((c) => c.name === name)?.label || name;
  const detail = err.detail || '';
  const keyCols = ((/Key \(([^)]+)\)=/.exec(detail) || [])[1] || '')
    .split(',').map((s) => s.trim().replace(/"/g, '')).filter(Boolean);

  switch (err.code) {
    case '23505': { // unique_violation
      const names = keyCols.map(colLabel).join(', ');
      const fields = keyCols.length === 1 ? { [keyCols[0]]: 'Este valor ya está registrado.' } : undefined;
      return new HttpError(409, names
        ? `Ya existe un registro con el mismo valor en: ${names}.`
        : 'Ya existe un registro con esos datos (valor duplicado).', fields);
    }
    case '23503': { // foreign_key_violation
      const used = /is still referenced from table "([^"]+)"/.exec(detail);
      if (used) { // se intentó ELIMINAR algo que otros registros usan
        const other = entities.find((e) => e.table === used[1]);
        return new HttpError(409,
          `No se puede eliminar: este registro está siendo usado en «${other?.title || used[1]}».`);
      }
      // se intentó GUARDAR una referencia a algo que no existe
      const field = keyCols[0];
      return new HttpError(400,
        `El valor elegido en «${colLabel(field)}» ya no existe. Actualiza la lista e inténtalo de nuevo.`,
        field ? { [field]: 'Selecciona un valor válido.' } : undefined);
    }
    case '23502': // not_null_violation
      return new HttpError(400, `Falta un campo obligatorio: ${colLabel(err.column)}.`,
        err.column ? { [err.column]: 'Campo obligatorio.' } : undefined);
    case '22001': // string_data_right_truncation
      return new HttpError(400, 'Uno de los textos es demasiado largo para la base de datos.');
    case '22P02': case '22007': case '22008': case '22003': // formato / rango inválido
      return new HttpError(400, 'Alguno de los valores tiene un formato inválido.');
    case '23514': // check_violation
      return new HttpError(400,
        `Los datos no cumplen una regla de la base de datos (${err.constraint || 'restricción'}). Revisa los campos del formulario.`);
    case '42P01': // undefined_table
      return new HttpError(500, `Tabla inexistente en PostgreSQL (${err.message}). Revisa "table" en config/entities.js.`);
    case '42703': // undefined_column
      return new HttpError(500, `Columna inexistente en PostgreSQL (${err.message}). Revisa "name" en config/entities.js.`);
    case '28P01': case '28000':
      return new HttpError(503, 'PostgreSQL rechazó el usuario o la contraseña. Revisa backend/.env.');
    case '3D000':
      return new HttpError(503, 'La base de datos indicada en backend/.env no existe.');
    case 'ECONNREFUSED': case 'ENOTFOUND': case 'ETIMEDOUT': case '57P01':
      return new HttpError(503, 'No se pudo conectar con PostgreSQL. Verifica que esté encendido y los datos de backend/.env.');
    default:
      return err;
  }
}

// Ruta /api/... que no existe → 404 en JSON (no HTML).
function notFound(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada.' });
}

// Último middleware de Express: convierte cualquier error en respuesta JSON.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const e = translateDbError(err);
  if (e instanceof HttpError) {
    if (e.status >= 500) console.error('[error]', err);
    return res.status(e.status).json({ error: e.message, ...(e.fields && { fields: e.fields }) });
  }
  if (e.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El JSON enviado no es válido.' });
  }
  if (e.type === 'entity.too.large') {
    return res.status(413).json({ error: 'La petición es demasiado grande.' });
  }
  console.error('[error]', e);
  res.status(500).json({ error: 'Error interno del servidor. Intenta de nuevo.' });
}

module.exports = { HttpError, translateDbError, notFound, errorHandler };
