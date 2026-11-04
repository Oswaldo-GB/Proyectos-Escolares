/**
 * Prueba de humo del backend: recorre las 13 entidades contra la base de datos real.
 *   Uso:  npm run smoke -- --yes
 * Crea registros de prueba (marcados "ZZ-PRUEBA"), prueba lectura/edición/búsqueda/errores
 * y al final los borra. Pide --yes por seguridad, porque escribe en la base configurada en .env.
 */
const assert = require('assert');
const app = require('../src/app');
const { pool } = require('../src/config/db');

if (!process.argv.includes('--yes')) {
  console.log('Esta prueba escribe (y luego borra) datos de prueba en la base de .env.\nEjecútala con:  npm run smoke -- --yes');
  process.exit(0);
}

let base;
const created = []; // [slug, id] en orden de creación, para borrar al revés
let passed = 0;

async function call(method, path, body, rawBody) {
  const res = await fetch(`${base}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: rawBody ?? (body ? JSON.stringify(body) : undefined),
  });
  const data = res.status === 204 ? null : await res.json();
  return { status: res.status, data };
}
async function make(slug, body) {
  const r = await call('POST', `/${slug}`, body);
  assert.strictEqual(r.status, 201, `crear ${slug}: ${JSON.stringify(r.data)}`);
  const entity = require('../src/config/entities').bySlug[slug];
  created.push([slug, r.data[entity.pk]]);
  return r.data[entity.pk];
}
function ok(name) { passed += 1; console.log(`  ✔ ${name}`); }

async function main() {
  const server = app.listen(0);
  base = `http://localhost:${server.address().port}`;
  try {
    // --- Metadatos
    let r = await call('GET', '/meta');
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.data.length, 13);
    ok('GET /api/meta devuelve 13 módulos');
    r = await call('GET', '/health');
    assert.strictEqual(r.status, 200);
    ok('GET /api/health conecta con PostgreSQL');

    // --- Crear toda la cadena de datos
    const cli = await make('clientes', { nombre: 'ZZ-PRUEBA Cliente', telefono: '555 123 4567', correo: 'prueba@correo.com' });
    const veh = await make('vehiculos', { id_cliente: cli, marca: 'Nissan', modelo: 'Versa', año: 2018, motor: '1.6L' });
    const ref = await make('refacciones', { codigo: 'ZZ-PRUEBA-001', descripcion: 'Balata delantera', variante: 'Cerámica' });
    const prov = await make('proveedores', { razon_social: 'ZZ-PRUEBA Proveedor SA', telefono: '5551112222' });
    const emp = await make('empleados', { nombre: 'ZZ-PRUEBA Empleado', activo: true });
    const sol = await make('solicitudes', { id_vehiculo: veh, id_refaccion: ref, fecha_solicitud: '2026-10-23', observaciones: 'Urgente' });
    const ped = await make('pedidos', { id_solicitud: sol, id_proveedor: prov, fecha_pedido: '2026-10-23', fecha_estimada: '2026-10-30', estado: 'Pendiente' });
    const rec = await make('recepciones', { id_pedido: ped, id_empleado: emp, fecha_recepcion: '2026-10-29T10:30', resultado: 'Pieza equivocada', descripcion_recibida: 'Llegó balata trasera' });
    await make('entregas', { id_pedido: ped, id_empleado: emp, fecha_entrega: '2026-10-30T12:00', nombre_receptor: 'Juan Pérez' });
    await make('comunicaciones', { id_pedido: ped, id_empleado: emp, fecha_comunicacion: '2026-10-29T11:00', medio: 'WhatsApp', resumen: 'Se avisó al cliente' });
    const inc = await make('incidencias', { id_recepcion: rec, id_empleado_registro: emp, tipo: 'Pieza equivocada', detalle: 'Balata trasera en lugar de delantera', fecha_registro: '2026-10-29T10:45', estado: 'Abierta' });
    await make('respuestas', { id_incidencia: inc, id_proveedor: prov, respuesta: 'Se enviará la correcta', fecha_respuesta: '2026-10-30', fecha_compromiso: '2026-11-02' });
    await make('seguimientos', { id_incidencia: inc, id_empleado: emp, fecha_accion: '2026-10-30T09:00', accion: 'Se llamó al proveedor' });
    ok('Crear: 13 tablas, con llaves foráneas encadenadas');

    // --- Leer con etiquetas legibles
    r = await call('GET', `/pedidos/${ped}`);
    assert.strictEqual(r.status, 200);
    assert.match(r.data.id_solicitud__label, /Solicitud #\d+ · ZZ-PRUEBA-001 · Nissan Versa/);
    assert.strictEqual(r.data.id_proveedor__label, 'ZZ-PRUEBA Proveedor SA');
    assert.strictEqual(r.data.fecha_pedido, '2026-10-23', 'las fechas no deben desfasarse por zona horaria');
    ok('Leer: llaves foráneas llegan con texto legible y fechas sin desfase');

    // --- Buscador
    r = await call('GET', '/refacciones?search=ZZ-PRUEBA-001');
    assert.strictEqual(r.data.length, 1);
    r = await call('GET', '/refacciones?search=balata');
    assert.ok(r.data.some((x) => x.id_refaccion === ref));
    r = await call('GET', '/pedidos?search=ZZ-PRUEBA Proveedor'); // busca por proveedor (etiqueta de FK)
    assert.ok(r.data.some((x) => x.id_pedido === ped));
    r = await call('GET', `/pedidos?search=${ped}`); // busca por ID
    assert.ok(r.data.some((x) => x.id_pedido === ped));
    r = await call('GET', '/refacciones?search=%25'); // el % se toma literal
    assert.strictEqual(r.data.length, 0);
    ok('Buscador: por texto, por proveedor relacionado, por ID y con % literal');

    // --- Opciones para desplegables
    r = await call('GET', '/vehiculos/options');
    assert.ok(r.data.some((o) => o.id === veh && /Nissan Versa 2018/.test(o.label)));
    ok('GET /options devuelve {id, label}');

    // --- Actualizar
    r = await call('PUT', `/refacciones/${ref}`, { codigo: 'ZZ-PRUEBA-001', descripcion: 'Balata delantera (editada)', variante: '' });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.data.descripcion, 'Balata delantera (editada)');
    assert.strictEqual(r.data.variante, null);
    ok('Actualizar: edita y convierte texto vacío en NULL');

    // --- Errores esperados
    r = await call('POST', '/refacciones', { codigo: 'ZZ-PRUEBA-001', descripcion: 'Duplicada' });
    assert.strictEqual(r.status, 409);
    assert.ok(r.data.fields.codigo);
    ok('Error 409: código duplicado → mensaje claro y campo marcado');

    r = await call('POST', '/pedidos', { id_solicitud: sol, fecha_pedido: '2026-10-23', estado: 'X' });
    assert.strictEqual(r.status, 409);
    ok('Error 409: una solicitud no puede tener dos pedidos (UNIQUE)');

    r = await call('POST', '/refacciones', { codigo: '', descripcion: '' });
    assert.strictEqual(r.status, 400);
    assert.ok(r.data.fields.codigo && r.data.fields.descripcion);
    ok('Error 400: campos obligatorios vacíos (todos juntos)');

    r = await call('POST', '/vehiculos', { id_cliente: 999999, marca: 'A', modelo: 'B', año: 2020 });
    assert.strictEqual(r.status, 400);
    assert.match(r.data.error, /ya no existe/);
    ok('Error 400: llave foránea inexistente');

    r = await call('POST', '/vehiculos', { id_cliente: cli, marca: 'A', modelo: 'B', año: 1800 });
    assert.strictEqual(r.status, 400);
    assert.ok(r.data.fields['año']);
    r = await call('POST', '/clientes', { nombre: 'X', correo: 'no-es-correo' });
    assert.ok(r.data.fields.correo);
    r = await call('POST', '/pedidos', { id_solicitud: sol, fecha_pedido: '2026-02-31', estado: 'X' });
    assert.ok(r.data.fields.fecha_pedido);
    ok('Error 400: rango de año, correo y fecha inexistente');

    r = await call('DELETE', `/clientes/${cli}`);
    assert.strictEqual(r.status, 409);
    assert.match(r.data.error, /siendo usado en «Vehículos»/);
    ok('Error 409: no deja eliminar un registro que otros usan');

    r = await call('GET', '/refacciones/999999');
    assert.strictEqual(r.status, 404);
    r = await call('PUT', '/refacciones/999999', { codigo: 'a', descripcion: 'b' });
    assert.strictEqual(r.status, 404);
    r = await call('DELETE', '/refacciones/999999');
    assert.strictEqual(r.status, 404);
    r = await call('GET', '/refacciones/abc');
    assert.strictEqual(r.status, 400);
    r = await call('POST', '/refacciones', null, '{mal json');
    assert.strictEqual(r.status, 400);
    r = await call('GET', '/no-existe');
    assert.strictEqual(r.status, 404);
    ok('Errores 404 / ID inválido / JSON inválido / ruta inexistente');
  } finally {
    // --- Limpieza: borrar en orden inverso para respetar las llaves foráneas
    for (const [slug, id] of created.reverse()) {
      const r = await call('DELETE', `/${slug}/${id}`);
      if (r.status !== 204) console.error(`  ! No se pudo borrar ${slug} #${id}:`, r.data);
    }
    console.log(`  ✔ Limpieza: ${created.length} registros de prueba eliminados`);
    server.close();
    await pool.end();
  }
}

main()
  .then(() => console.log(`\nTodo bien: ${passed} grupos de pruebas pasaron.`))
  .catch((err) => { console.error('\n✘ FALLÓ:', err.message); process.exitCode = 1; });
