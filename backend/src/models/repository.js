/**
 * Capa de datos GENÉRICA.
 * createRepository(entity) devuelve las operaciones SQL de una tabla a partir de su
 * definición en config/entities.js. Reglas de seguridad:
 *   - Los valores SIEMPRE viajan como parámetros ($1, $2…): sin inyección SQL.
 *   - Los nombres de tablas/columnas provienen solo de entities.js (nunca del usuario)
 *     y además se escapan con comillas dobles.
 */
const { pool } = require('../config/db');
const { bySlug } = require('../config/entities');

// Escapa un identificador de PostgreSQL: año → "año"
const q = (id) => `"${String(id).replace(/"/g, '""')}"`;

// Escapa % _ \ para que el texto buscado se trate literalmente en ILIKE.
const escapeLike = (s) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

const MAX_ROWS = 5000;

function createRepository(entity) {
  const T = q(entity.table);
  const PK = q(entity.pk);
  const selectCols = entity.columns.filter((c) => c.type === 'select');

  // Subconsulta que convierte cada llave foránea en texto legible. Ej.:
  //   (SELECT "r_id_cliente"."nombre" FROM "cliente" "r_id_cliente" WHERE …) AS "id_cliente__label"
  const labelExprs = selectCols.map((c) => {
    const ref = bySlug[c.ref];
    const a = q(`r_${c.name}`);
    return {
      name: c.name,
      sql: `(SELECT ${ref.label(a)} FROM ${q(ref.table)} ${a} WHERE ${a}.${q(ref.pk)} = t.${q(c.name)})`,
    };
  });

  // Columnas a devolver: llave primaria + columnas editables + etiquetas de las FK.
  const SELECT = [
    `t.${PK}`,
    ...entity.columns.map((c) => `t.${q(c.name)}`),
    ...labelExprs.map((l) => `${l.sql} AS ${q(`${l.name}__label`)}`),
  ].join(', ');

  /** Lista registros. `search` filtra por las columnas de texto, por las etiquetas de las FK y por ID. */
  async function findAll({ search = '', limit = 1000 } = {}) {
    const params = [];
    let where = '';
    if (search) {
      params.push(`%${escapeLike(search)}%`);
      const conds = [
        ...entity.search.map((c) => `t.${q(c)}::text ILIKE $1`),
        ...labelExprs.map((l) => `${l.sql} ILIKE $1`),
      ];
      if (/^\d{1,9}$/.test(search)) { // "12" también encuentra el registro con ID 12
        params.push(Number(search));
        conds.push(`t.${PK} = $2`);
      }
      where = `WHERE ${conds.join(' OR ')}`;
    }
    params.push(Math.min(Math.max(Number(limit) || 1000, 1), MAX_ROWS));
    const { rows } = await pool.query(
      `SELECT ${SELECT} FROM ${T} t ${where} ORDER BY ${entity.orderBy} LIMIT $${params.length}`,
      params
    );
    return rows;
  }

  async function findById(id) {
    const { rows } = await pool.query(`SELECT ${SELECT} FROM ${T} t WHERE t.${PK} = $1`, [id]);
    return rows[0];
  }

  /** Lista ligera {id, label} para los menús desplegables de otras pantallas. */
  async function options() {
    const { rows } = await pool.query(
      `SELECT t.${PK} AS id, ${entity.label('t')} AS label FROM ${T} t ORDER BY ${entity.orderBy} LIMIT ${MAX_ROWS}`
    );
    return rows;
  }

  async function create(values) {
    const names = entity.columns.map((c) => c.name);
    const { rows } = await pool.query(
      `INSERT INTO ${T} (${names.map(q).join(', ')})
       VALUES (${names.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING ${PK} AS id`,
      names.map((n) => values[n])
    );
    return findById(rows[0].id);
  }

  async function update(id, values) {
    const names = entity.columns.map((c) => c.name);
    const { rows } = await pool.query(
      `UPDATE ${T} SET ${names.map((n, i) => `${q(n)} = $${i + 1}`).join(', ')}
       WHERE ${PK} = $${names.length + 1} RETURNING ${PK} AS id`,
      [...names.map((n) => values[n]), id]
    );
    return rows[0] ? findById(rows[0].id) : undefined;
  }

  async function remove(id) {
    const { rowCount } = await pool.query(`DELETE FROM ${T} WHERE ${PK} = $1`, [id]);
    return rowCount > 0;
  }

  return { findAll, findById, options, create, update, remove };
}

module.exports = { createRepository };
