/**
 * Capa de negocio GENÉRICA.
 * crudController(entity) valida la entrada, llama al repositorio y arma la respuesta HTTP.
 * Un mismo controlador sirve a las 13 tablas; lo que cambia es la definición de la entidad.
 */
const { createRepository } = require('../models/repository');
const { validateBody } = require('../services/validator');
const { HttpError, translateDbError } = require('../middlewares/errorHandler');

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) throw new HttpError(400, 'El ID no es válido.');
  return id;
}

function crudController(entity) {
  const repo = createRepository(entity);
  const notFound = () => new HttpError(404, `El ${entity.singular} no existe (quizá ya fue eliminado).`);

  // Express 4 no captura errores async: este wrapper los traduce y los manda al errorHandler.
  const wrap = (fn) => async (req, res, next) => {
    try { await fn(req, res); } catch (err) { next(translateDbError(err, entity)); }
  };

  // Valida el cuerpo; si hay errores los devuelve TODOS juntos para marcarlos en el formulario.
  const parse = (body) => {
    const { values, fields } = validateBody(entity, body);
    if (Object.keys(fields).length) throw new HttpError(400, 'Revisa los campos marcados.', fields);
    return values;
  };

  return {
    list: wrap(async (req, res) => {
      const search = String(req.query.search ?? '').trim().slice(0, 100);
      res.json(await repo.findAll({ search, limit: req.query.limit }));
    }),
    options: wrap(async (req, res) => res.json(await repo.options())),
    getOne: wrap(async (req, res) => {
      const item = await repo.findById(parseId(req.params.id));
      if (!item) throw notFound();
      res.json(item);
    }),
    create: wrap(async (req, res) => res.status(201).json(await repo.create(parse(req.body)))),
    update: wrap(async (req, res) => {
      const updated = await repo.update(parseId(req.params.id), parse(req.body));
      if (!updated) throw notFound();
      res.json(updated);
    }),
    remove: wrap(async (req, res) => {
      if (!(await repo.remove(parseId(req.params.id)))) throw notFound();
      res.status(204).end();
    }),
  };
}

module.exports = { crudController };
