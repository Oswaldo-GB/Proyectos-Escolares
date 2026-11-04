/**
 * Capa de rutas: genera los endpoints REST de cada entidad de config/entities.js.
 *
 *   GET    /api/meta                 → definición de módulos y campos (la usa el frontend)
 *   GET    /api/health               → estado del servidor y de PostgreSQL
 *   GET    /api/<slug>?search=texto  → lista (con buscador)
 *   GET    /api/<slug>/options       → lista {id, label} para menús desplegables
 *   GET    /api/<slug>/:id           → un registro
 *   POST   /api/<slug>               → crear
 *   PUT    /api/<slug>/:id           → actualizar
 *   DELETE /api/<slug>/:id           → eliminar
 */
const router = require('express').Router();
const { entities, publicMeta } = require('../config/entities');
const { crudController } = require('../controllers/crud.controller');
const { pool } = require('../config/db');
const { HttpError, translateDbError } = require('../middlewares/errorHandler');

router.get('/meta', (req, res) => res.json(publicMeta()));

router.get('/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    const e = translateDbError(err);
    next(e instanceof HttpError ? e : new HttpError(503, 'Sin conexión con PostgreSQL.'));
  }
});

for (const entity of entities) {
  const ctrl = crudController(entity);
  const r = require('express').Router();
  r.get('/', ctrl.list);
  r.get('/options', ctrl.options); // antes de "/:id" para que "options" no se tome como ID
  r.get('/:id', ctrl.getOne);
  r.post('/', ctrl.create);
  r.put('/:id', ctrl.update);
  r.delete('/:id', ctrl.remove);
  router.use(`/${entity.slug}`, r);
}

module.exports = router;
