/**
 * ============================================================================
 *  FUENTE ÚNICA DE VERDAD DEL MODELO (basada en el diagrama ER)
 * ============================================================================
 *  Cada entrada describe una tabla de PostgreSQL. A partir de este archivo:
 *    - el BACKEND genera automáticamente el CRUD (rutas, SQL, validación);
 *    - el FRONTEND genera automáticamente el menú, la tabla y el formulario
 *      (los recibe por GET /api/meta).
 *
 *  Si tu compañero nombró alguna tabla o columna distinta (por ejemplo "anio"
 *  en lugar de "año"), SOLO hay que cambiarlo aquí.
 *
 *  Campos de una entidad:
 *    slug        ruta REST: /api/<slug>
 *    table       nombre real de la tabla en PostgreSQL
 *    pk          columna de llave primaria (se asume autogenerada: SERIAL/IDENTITY)
 *    title       nombre en plural (menú y encabezados)
 *    singular    nombre en singular (botones y mensajes)
 *    fem         true si el nombre es femenino ("Nueva refacción" en vez de "Nuevo")
 *    group       sección del menú
 *    orderBy     ORDER BY de la tabla (SQL fijo, nunca viene del usuario)
 *    search      columnas de texto donde busca el buscador
 *    label(a)    expresión SQL que describe un registro en texto legible
 *                (se usa en listas desplegables y para mostrar llaves foráneas)
 *    columns[]   columnas editables:
 *       name       nombre de la columna (también es la clave en el JSON)
 *       label      etiqueta visible
 *       type       text | textarea | email | tel | int | date | datetime | boolean | select
 *       required   obligatorio en el formulario
 *       ref        (type select) slug de la entidad a la que apunta la llave foránea
 *       unique     informativo: la BD ya lo exige; aquí solo se muestra un aviso
 *       maxLength  largo máximo de texto
 *       min / max  límites para int
 *       default    valor inicial en el formulario: 'today' | 'now' | literal
 *       suggestions sugerencias (datalist) para campos de texto libre
 *       hideInList ocultar la columna en la tabla (útil para textos largos)
 *       placeholder / help  textos de ayuda
 * ============================================================================
 */

// Año máximo permitido para vehículos: el próximo año modelo.
const MAX_YEAR = new Date().getFullYear() + 2;

const entities = [
  /* ------------------------------------------------------------ CATÁLOGOS */
  {
    slug: 'clientes', table: 'cliente', pk: 'id_cliente',
    title: 'Clientes', singular: 'cliente', group: 'Catálogos',
    orderBy: 't."nombre"',
    search: ['nombre', 'telefono', 'correo'],
    label: (a) => `${a}."nombre"`,
    columns: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
      { name: 'telefono', label: 'Teléfono', type: 'tel', maxLength: 30 },
      { name: 'correo', label: 'Correo', type: 'email', maxLength: 150 },
    ],
  },
  {
    slug: 'vehiculos', table: 'vehiculo', pk: 'id_vehiculo',
    title: 'Vehículos', singular: 'vehículo', group: 'Catálogos',
    orderBy: 't."marca", t."modelo", t."anio"',
    search: ['marca', 'modelo', 'motor', 'version'],
    label: (a) => `concat_ws(' ', ${a}."marca", ${a}."modelo", ${a}."anio", ${a}."motor")`,
    columns: [
      { name: 'id_cliente', label: 'Cliente', type: 'select', ref: 'clientes', required: true },
      { name: 'marca', label: 'Marca', type: 'text', required: true, maxLength: 80 },
      { name: 'modelo', label: 'Modelo', type: 'text', required: true, maxLength: 80 },
      { name: 'anio', label: 'Año', type: 'int', required: true, min: 1900, max: MAX_YEAR },
      { name: 'motor', label: 'Motor', type: 'text', maxLength: 80, placeholder: 'Ej. 2.0L 4 cilindros' },
      { name: 'version', label: 'Versión', type: 'text', maxLength: 80 },
    ],
  },
  {
    fem: true, slug: 'refacciones', table: 'refaccion', pk: 'id_refaccion',
    title: 'Refacciones', singular: 'refacción', group: 'Catálogos',
    orderBy: 't."codigo"',
    search: ['codigo', 'descripcion', 'variante'],
    label: (a) => `concat_ws(' – ', ${a}."codigo", ${a}."descripcion")`,
    columns: [
      { name: 'codigo', label: 'Código', type: 'text', required: true, maxLength: 50 },
      { name: 'descripcion', label: 'Descripción', type: 'text', required: true, maxLength: 200 },
      { name: 'variante', label: 'Variante', type: 'text', maxLength: 100, placeholder: 'Ej. Delantero izquierdo' },
    ],
  },
  {
    slug: 'proveedores', table: 'proveedor', pk: 'id_proveedor',
    title: 'Proveedores', singular: 'proveedor', group: 'Catálogos',
    orderBy: 't."razon_social"',
    search: ['razon_social', 'telefono', 'correo'],
    label: (a) => `${a}."razon_social"`,
    columns: [
      { name: 'razon_social', label: 'Razón social', type: 'text', required: true, maxLength: 150 },
      { name: 'telefono', label: 'Teléfono', type: 'tel', maxLength: 30 },
      { name: 'correo', label: 'Correo', type: 'email', maxLength: 150 },
    ],
  },
  {
    slug: 'empleados', table: 'empleado', pk: 'id_empleado',
    title: 'Empleados', singular: 'empleado', group: 'Catálogos',
    orderBy: 't."nombre"',
    search: ['nombre'],
    label: (a) => `${a}."nombre" || CASE WHEN ${a}."activo" IS FALSE THEN ' (inactivo)' ELSE '' END`,
    columns: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 150 },
      { name: 'activo', label: 'Activo', type: 'boolean', default: true,
        help: 'Desmárcalo en lugar de eliminar al empleado: conserva su historial.' },
    ],
  },

  /* ------------------------------------------------------------ OPERACIÓN */
  {
    fem: true, slug: 'solicitudes', table: 'solicitud', pk: 'id_solicitud',
    title: 'Solicitudes', singular: 'solicitud', group: 'Operación',
    orderBy: 't."fecha_solicitud" DESC, t."id_solicitud" DESC',
    search: ['observaciones'],
    label: (a) => `concat('Solicitud #', ${a}."id_solicitud", ' · ', ` +
      `(SELECT r."codigo" FROM "refaccion" r WHERE r."id_refaccion" = ${a}."id_refaccion"), ' · ', ` +
      `(SELECT concat_ws(' ', v."marca", v."modelo") FROM "vehiculo" v WHERE v."id_vehiculo" = ${a}."id_vehiculo"))`,
    columns: [
      { name: 'id_vehiculo', label: 'Vehículo', type: 'select', ref: 'vehiculos', required: true },
      { name: 'id_refaccion', label: 'Refacción', type: 'select', ref: 'refacciones', required: true },
      { name: 'fecha_solicitud', label: 'Fecha de solicitud', type: 'date', required: true, default: 'today' },
      { name: 'observaciones', label: 'Observaciones', type: 'textarea', maxLength: 500 },
    ],
  },
  {
    slug: 'pedidos', table: 'pedido', pk: 'id_pedido',
    title: 'Pedidos', singular: 'pedido', group: 'Operación',
    orderBy: 't."fecha_pedido" DESC, t."id_pedido" DESC',
    search: ['estado'],
    label: (a) => `concat('Pedido #', ${a}."id_pedido", ' · ', ${a}."estado")`,
    columns: [
      { name: 'id_solicitud', label: 'Solicitud', type: 'select', ref: 'solicitudes', required: true, unique: true,
        help: 'Cada solicitud solo puede tener un pedido.' },
      { name: 'id_proveedor', label: 'Proveedor', type: 'select', ref: 'proveedores',
        help: 'Déjalo vacío si aún no se asigna proveedor.' },
      { name: 'fecha_pedido', label: 'Fecha del pedido', type: 'date', required: true, default: 'today' },
      { name: 'fecha_estimada', label: 'Fecha estimada de llegada', type: 'date' },
      { name: 'estado', label: 'Estado', type: 'text', required: true, maxLength: 50, default: 'Pendiente',
        suggestions: ['SOLICITADO', 'PENDIENTE_PROVEEDOR', 'RECIBIDO', 'EN_INCIDENCIA', 'ENTREGADO', 'CANCELADO'] },
    ],
  },
  {
    fem: true, slug: 'recepciones', table: 'recepcion', pk: 'id_recepcion',
    title: 'Recepciones', singular: 'recepción', group: 'Operación',
    orderBy: 't."fecha_recepcion" DESC, t."id_recepcion" DESC',
    search: ['resultado', 'descripcion_recibida'],
    label: (a) => `concat('Recepción #', ${a}."id_recepcion", ' · pedido #', ${a}."id_pedido")`,
    columns: [
      { name: 'id_pedido', label: 'Pedido', type: 'select', ref: 'pedidos', required: true },
      { name: 'id_refaccion_recibida', label: 'Refacción recibida', type: 'select', ref: 'refacciones',
        help: 'Solo si la pieza que llegó es distinta a la solicitada.' },
      { name: 'id_empleado', label: 'Recibió', type: 'select', ref: 'empleados', required: true },
      { name: 'fecha_recepcion', label: 'Fecha de recepción', type: 'datetime', required: true, default: 'now' },
      { name: 'resultado', label: 'Resultado', type: 'text', required: true, maxLength: 80,
        suggestions: ['CORRECTA', 'INCORRECTA'] },
      { name: 'descripcion_recibida', label: 'Descripción de lo recibido', type: 'textarea', maxLength: 500, hideInList: true },
    ],
  },
  {
    fem: true, slug: 'entregas', table: 'entrega', pk: 'id_entrega',
    title: 'Entregas', singular: 'entrega', group: 'Operación',
    orderBy: 't."fecha_entrega" DESC, t."id_entrega" DESC',
    search: ['nombre_receptor', 'observaciones'],
    label: (a) => `concat('Entrega #', ${a}."id_entrega", ' · pedido #', ${a}."id_pedido")`,
    columns: [
      { name: 'id_pedido', label: 'Pedido', type: 'select', ref: 'pedidos', required: true, unique: true,
        help: 'Cada pedido solo puede tener una entrega.' },
      { name: 'id_empleado', label: 'Entregó', type: 'select', ref: 'empleados', required: true },
      { name: 'fecha_entrega', label: 'Fecha de entrega', type: 'datetime', required: true, default: 'now' },
      { name: 'nombre_receptor', label: 'Nombre de quien recibe', type: 'text', required: true, maxLength: 150 },
      { name: 'observaciones', label: 'Observaciones', type: 'textarea', maxLength: 500, hideInList: true },
    ],
  },
  {
    fem: true, slug: 'comunicaciones', table: 'comunicacion_cliente', pk: 'id_comunicacion',
    title: 'Comunicación con cliente', singular: 'comunicación', group: 'Operación',
    orderBy: 't."fecha_comunicacion" DESC, t."id_comunicacion" DESC',
    search: ['medio', 'resumen'],
    label: (a) => `concat('Comunicación #', ${a}."id_comunicacion", ' · pedido #', ${a}."id_pedido")`,
    columns: [
      { name: 'id_pedido', label: 'Pedido', type: 'select', ref: 'pedidos', required: true },
      { name: 'id_empleado', label: 'Empleado', type: 'select', ref: 'empleados', required: true },
      { name: 'fecha_comunicacion', label: 'Fecha y hora', type: 'datetime', required: true, default: 'now' },
      { name: 'medio', label: 'Medio', type: 'text', required: true, maxLength: 50,
        suggestions: ['PRESENCIAL', 'LLAMADA', 'WHATSAPP', 'SMS', 'CORREO'] },
      { name: 'resumen', label: 'Resumen', type: 'textarea', maxLength: 500, hideInList: true },
    ],
  },

  /* ----------------------------------------------------------- INCIDENCIAS */
  {
    fem: true, slug: 'incidencias', table: 'incidencia', pk: 'id_incidencia',
    title: 'Incidencias', singular: 'incidencia', group: 'Incidencias',
    orderBy: 't."fecha_registro" DESC, t."id_incidencia" DESC',
    search: ['tipo', 'detalle', 'estado'],
    label: (a) => `concat('Incidencia #', ${a}."id_incidencia", ' · ', ${a}."tipo")`,
    columns: [
      { name: 'id_recepcion', label: 'Recepción', type: 'select', ref: 'recepciones', required: true, unique: true,
        help: 'Cada recepción solo puede tener una incidencia.' },
      { name: 'id_empleado_registro', label: 'Registró', type: 'select', ref: 'empleados', required: true },
      { name: 'tipo', label: 'Tipo', type: 'text', required: true, maxLength: 80,
        suggestions: ['Pieza equivocada', 'Pieza dañada', 'Faltante', 'Retraso'] },
      { name: 'detalle', label: 'Detalle', type: 'textarea', required: true, maxLength: 1000, hideInList: true },
      { name: 'fecha_registro', label: 'Fecha de registro', type: 'datetime', required: true, default: 'now' },
      { name: 'estado', label: 'Estado', type: 'text', required: true, maxLength: 50, default: 'Abierta',
        suggestions: ['ABIERTA', 'EN_SEGUIMIENTO', 'RESUELTA'] },
    ],
  },
  {
    fem: true, slug: 'respuestas', table: 'respuesta_proveedor', pk: 'id_respuesta',
    title: 'Respuestas de proveedor', singular: 'respuesta de proveedor', group: 'Incidencias',
    orderBy: 't."fecha_respuesta" DESC, t."id_respuesta" DESC',
    search: ['propuesta'],
    label: (a) => `concat('Respuesta #', ${a}."id_respuesta")`,
    columns: [
      { name: 'id_incidencia', label: 'Incidencia', type: 'select', ref: 'incidencias', required: true },
      { name: 'id_proveedor', label: 'Proveedor', type: 'select', ref: 'proveedores', required: true },
      { name: 'id_empleado_registro', label: 'Registró', type: 'select', ref: 'empleados' },
      { name: 'propuesta', label: 'Propuesta', type: 'textarea', required: true, maxLength: 1000 },
      { name: 'fecha_respuesta', label: 'Fecha de respuesta', type: 'date', required: true, default: 'today' },
      { name: 'fecha_compromiso', label: 'Fecha compromiso', type: 'date',
        help: 'Fecha en la que el proveedor se comprometió a resolver.' },
    ],
  },
  {
    slug: 'seguimientos', table: 'seguimiento_incidencia', pk: 'id_seguimiento',
    title: 'Seguimiento de incidencias', singular: 'seguimiento', group: 'Incidencias',
    orderBy: 't."fecha_accion" DESC, t."id_seguimiento" DESC',
    search: ['accion'],
    label: (a) => `concat('Seguimiento #', ${a}."id_seguimiento")`,
   
    columns: [
      { name: 'id_incidencia', label: 'Incidencia', type: 'select', ref: 'incidencias', required: true },
      { name: 'id_empleado', label: 'Empleado', type: 'select', ref: 'empleados' },
      { name: 'id_proveedor', label: 'Proveedor', type: 'select', ref: 'proveedores' },
      { name: 'fecha_accion', label: 'Fecha de la acción', type: 'datetime', required: true, default: 'now' },
      { name: 'accion', label: 'Acción realizada', type: 'textarea', required: true, maxLength: 1000 },
    ],
  },
];

// Índice por slug para resolver referencias (ref: 'clientes') rápidamente.
const bySlug = Object.fromEntries(entities.map((e) => [e.slug, e]));

// Validación de arranque: detecta errores de captura en este archivo de inmediato.
for (const e of entities) {
  for (const c of e.columns) {
    if (c.type === 'select' && !bySlug[c.ref]) {
      throw new Error(`entities.js: "${e.slug}.${c.name}" apunta a una entidad inexistente: "${c.ref}"`);
    }
  }
}

/** Metadatos seguros para el frontend (sin funciones SQL ni nombres internos sensibles). */
function publicMeta() {
  return entities.map((e) => ({
    slug: e.slug, title: e.title, singular: e.singular, fem: Boolean(e.fem), group: e.group, pk: e.pk,
        columns: e.columns, exactlyOne: e.exactlyOne ?? [],
  }));
}

module.exports = { entities, bySlug, publicMeta };