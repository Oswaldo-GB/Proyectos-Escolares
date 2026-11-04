// Orquestador: arranque, menú lateral, rutas (#/pedidos), carga de datos, buscador y borrado.
import { Api } from './api.js';
import { escapeHtml, showToast, nuevo } from './ui.js';
import { renderTable, summarize } from './table.js';
import { openForm } from './form.js';

const $ = (id) => document.getElementById(id);
const els = {
  thead: $('thead'), tbody: $('tbody'), state: $('state'), count: $('count'),
  search: $('search'), btnNew: $('btn-new'), banner: $('banner'), bannerText: $('banner-text'),
};
const DEFAULT_SLUG = 'refacciones';

let entities = [];   // definición de módulos (GET /api/meta)
let current = null;  // módulo abierto
let rows = [];       // registros mostrados
let loadToken = 0;   // evita que una respuesta lenta pise a una más reciente

/* --------------------------------------------------------------------- menú */

function buildNav() {
  const groups = [...new Set(entities.map((e) => e.group))];
  $('nav').innerHTML = groups.map((g) => `
    <p class="nav-group">${escapeHtml(g)}</p>
    ${entities.filter((e) => e.group === g)
      .map((e) => `<a href="#/${e.slug}" data-slug="${e.slug}">${escapeHtml(e.title)}</a>`).join('')}
  `).join('');
}

function setMenuOpen(open) { // menú deslizable en pantallas pequeñas
  $('sidebar').classList.toggle('open', open);
  $('scrim').hidden = !open;
  $('btn-menu').setAttribute('aria-expanded', String(open));
}
$('btn-menu').addEventListener('click', () => setMenuOpen(!$('sidebar').classList.contains('open')));
$('scrim').addEventListener('click', () => setMenuOpen(false));

/* ------------------------------------------------------------------- rutas */

function route() {
  const slug = location.hash.replace(/^#\//, '');
  const entity = entities.find((e) => e.slug === slug) ?? entities.find((e) => e.slug === DEFAULT_SLUG) ?? entities[0];
  openEntity(entity);
}
window.addEventListener('hashchange', route);

function openEntity(entity) {
  current = entity;
  document.title = `${entity.title} | Autopartes del Sur`;
  $('page-title').textContent = entity.title;
  els.btnNew.textContent = `+ ${nuevo(entity)} ${entity.singular}`;
  els.btnNew.disabled = false;
  els.search.disabled = false;
  els.search.value = '';
  els.search.placeholder = `Buscar en ${entity.title.toLowerCase()}…`;
  document.querySelectorAll('#nav a').forEach((a) => {
    const active = a.dataset.slug === entity.slug;
    a.classList.toggle('active', active);
    active ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
  setMenuOpen(false);
  rows = [];
  renderTable(entity, rows, els); // vacía la tabla anterior mientras llegan los datos nuevos
  load();
}

/* ------------------------------------------------------------------- datos */

async function load() {
  const token = ++loadToken;
  const entity = current;
  const search = els.search.value.trim();
  els.banner.hidden = true;
  els.state.hidden = false;
  els.state.textContent = 'Cargando…';

  try {
    const data = await Api.list(entity.slug, search);
    if (token !== loadToken) return; // el empleado ya cambió de módulo o de búsqueda
    rows = data;
    renderTable(entity, rows, els);
    els.state.hidden = rows.length > 0;
    els.state.textContent = search
      ? `No se encontraron resultados para «${search}».`
      : `Aún no hay ${entity.title.toLowerCase()} registrados. Usa «+ ${nuevo(entity)} ${entity.singular}» para empezar.`;
    els.count.textContent = rows.length ? `${rows.length} ${rows.length === 1 ? 'registro' : 'registros'}` : '';
  } catch (err) {
    if (token !== loadToken) return;
    rows = [];
    renderTable(entity, rows, els);
    els.state.hidden = true;
    els.count.textContent = '';
    els.bannerText.textContent = `⚠ No se pudo cargar la lista. ${err.message}`;
    els.banner.hidden = false;
  }
}
$('banner-retry').addEventListener('click', load);

// Buscador con "debounce": espera 300 ms después de dejar de escribir.
let timer;
els.search.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(load, 300); });

/* ------------------------------------------------------------------ acciones */

els.btnNew.addEventListener('click', () => openForm(current, null, load));

// Delegación de eventos: un solo listener para todos los botones de la tabla.
let pendingDelete = null;
els.tbody.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  const rowEl = e.target.closest('tr');
  const id = btn ? (btn.dataset.edit ?? btn.dataset.delete) : rowEl?.dataset.id;
  const item = id === undefined ? undefined : rows.find((r) => String(r[current.pk]) === String(id));
  if (!item) return;

  if (btn?.dataset.delete) {
    pendingDelete = item;
    $('delete-title').textContent = `Eliminar ${current.singular}`;
    $('delete-text').textContent = `¿Eliminar ${current.singular} ${summarize(current, item)}? Esta acción no se puede deshacer.`;
    $('dlg-delete').showModal();
  } else {
    openForm(current, item, load); // botón Editar o clic en la fila
  }
});

$('btn-delete-cancel').addEventListener('click', () => $('dlg-delete').close());
$('btn-delete-ok').addEventListener('click', async () => {
  const item = pendingDelete;
  $('dlg-delete').close();
  if (!item) return;
  try {
    await Api.remove(current.slug, item[current.pk]);
    showToast('Registro eliminado.');
  } catch (err) {
    showToast(err.message, 'error'); // p. ej. "No se puede eliminar: está siendo usado en «Pedidos»"
  }
  load(); // refresca siempre: si otro usuario ya lo borró, desaparece de la lista
});

/* -------------------------------------------------------------------- inicio */

async function boot() {
  try {
    entities = await Api.meta();
    buildNav();
    route();
  } catch (err) {
    $('page-title').textContent = 'Autopartes del Sur';
    els.bannerText.textContent = `⚠ No se pudo iniciar la aplicación. ${err.message}`;
    els.banner.hidden = false;
    els.state.hidden = true;
    $('banner-retry').onclick = () => location.reload();
  }
}
boot();
