// Formulario modal GENÉRICO: construye los campos de cualquier módulo a partir de su
// definición (/api/meta), valida, guarda (crear o editar) y muestra errores del servidor
// debajo de cada campo sin perder lo que el empleado ya escribió.
import { Api } from './api.js';
import { escapeHtml, showToast, todayValue, nowValue, nuevo } from './ui.js';

const $ = (id) => document.getElementById(id);
const dlg = $('dlg-form'), form = $('form'), box = $('form-fields');
const banner = $('form-error'), btnSave = $('btn-save');

let ctx = null; // { entity, item, onSaved } del formulario abierto

/* ------------------------------------------------------------ construcción */

// Valor inicial de un campo: el del registro (editar) o su "default" (crear).
function initialValue(col, item) {
  if (item) {
    const v = item[col.name];
    if (col.type === 'date') return (v ?? '').slice(0, 10);
    if (col.type === 'datetime') return (v ?? '').replace(' ', 'T').slice(0, 16);
    return v ?? '';
  }
  if (col.default === 'today') return todayValue();
  if (col.default === 'now') return nowValue();
  return col.default ?? '';
}

function fieldHtml(col, item, options, i) {
  const id = `f-${i}`;
  const v = initialValue(col, item);
  const req = col.required ? ' <span class="req" title="Obligatorio">*</span>' : '';
  const attrs = `id="${id}" name="${escapeHtml(col.name)}" aria-describedby="e-${i}" ${col.required ? 'required' : ''}`;
  let control;

  switch (col.type) {
    case 'textarea':
      control = `<textarea ${attrs} rows="3" maxlength="${col.maxLength ?? 1000}">${escapeHtml(v)}</textarea>`;
      break;
    case 'boolean':
      control = `<label class="check"><input type="checkbox" ${attrs} ${v ? 'checked' : ''} /> <span>${escapeHtml(col.label)}</span></label>`;
      return `<div class="field">${control}${col.help ? `<small class="help">${escapeHtml(col.help)}</small>` : ''}<p class="field-error" id="e-${i}" hidden></p></div>`;
    case 'select':
      control = `<select ${attrs}>
        <option value="">${col.required ? '— Selecciona —' : '— Ninguno —'}</option>
        ${options.map((o) => `<option value="${o.id}" ${String(o.id) === String(v) ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}
      </select>`;
      break;
    case 'int':
      control = `<input ${attrs} type="number" step="1" ${col.min !== undefined ? `min="${col.min}"` : ''} ${col.max !== undefined ? `max="${col.max}"` : ''} value="${escapeHtml(v)}" />`;
      break;
    case 'date':
      control = `<input ${attrs} type="date" value="${escapeHtml(v)}" />`;
      break;
    case 'datetime':
      control = `<input ${attrs} type="datetime-local" value="${escapeHtml(v)}" />`;
      break;
    default: { // text | email | tel
      const list = col.suggestions ? `list="dl-${i}"` : '';
      control = `<input ${attrs} type="${col.type === 'text' ? 'text' : col.type}" ${list} maxlength="${col.maxLength ?? 200}"
        value="${escapeHtml(v)}" placeholder="${escapeHtml(col.placeholder ?? '')}" autocomplete="off" />`;
      if (col.suggestions) {
        control += `<datalist id="dl-${i}">${col.suggestions.map((s) => `<option value="${escapeHtml(s)}">`).join('')}</datalist>`;
      }
    }
  }
  return `<div class="field">
    <label for="${id}">${escapeHtml(col.label)}${req}</label>
    ${control}
    ${col.help ? `<small class="help">${escapeHtml(col.help)}</small>` : ''}
    <p class="field-error" id="e-${i}" hidden></p>
  </div>`;
}

/* ----------------------------------------------------------- errores/campos */

const control = (name) => form.elements.namedItem(name);

function setFieldError(name, message) {
  const el = control(name);
  if (!el) return;
  const err = $(el.getAttribute('aria-describedby'));
  el.setAttribute('aria-invalid', 'true');
  err.textContent = `⚠ ${message}`;
  err.hidden = false;
}
// Regla "uno y solo uno": al elegir un campo del grupo, los demás se vacían y se bloquean.
function syncExclusive(entity) {
  for (const group of entity.exactlyOne ?? []) {
    const chosen = group.find((n) => control(n)?.value);
    for (const n of group) {
      const el = control(n);
      if (!el) continue;
      el.disabled = Boolean(chosen) && n !== chosen;
      if (el.disabled) el.value = '';
    }
  }
}
function clearErrors() {
  banner.hidden = true;
  box.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  box.querySelectorAll('.field-error').forEach((p) => { p.hidden = true; });
}
function showBanner(message) { banner.textContent = `⚠ ${message}`; banner.hidden = false; }

/* ------------------------------------------------------------------ lectura */

// Lee el formulario y devuelve el JSON para el servidor ("" → null, números → Number).
function readValues(entity) {
  const out = {};
  for (const col of entity.columns) {
    const el = control(col.name);
    if (col.type === 'boolean') { out[col.name] = el.checked; continue; }
    const v = el.value.trim();
    out[col.name] = v === '' ? null : (col.type === 'int' || col.type === 'select' ? Number(v) : v);
  }
  return out;
}

/* ------------------------------------------------------------------ abrir */

export async function openForm(entity, item, onSaved) {
  ctx = { entity, item, onSaved };
  $('form-title').textContent = `${item ? 'Editar' : nuevo(entity)} ${entity.singular}`;
  clearErrors();
  box.innerHTML = '<p class="muted">Cargando…</p>';
  btnSave.disabled = true;
  dlg.showModal();

  try {
    // Carga en paralelo las listas de los campos que apuntan a otra tabla.
    const selects = entity.columns.filter((c) => c.type === 'select');
    const lists = await Promise.all(selects.map((c) => Api.options(c.ref)));
    const options = Object.fromEntries(selects.map((c, i) => [c.name, lists[i]]));

    box.innerHTML = entity.columns.map((c, i) => fieldHtml(c, item, options[c.name], i)).join('');
    btnSave.disabled = false;
    box.querySelector('input:not([type=checkbox]), select, textarea')?.focus();
    syncExclusive(entity);
  } catch (err) {
    box.innerHTML = '';
    showBanner(`No se pudieron cargar las listas del formulario. ${err.message}`);
  }
}

/* ------------------------------------------------------------------ guardar */

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!ctx) return;
  const { entity, item, onSaved } = ctx;
  clearErrors();

  const body = readValues(entity);

  // Validación rápida en el cliente (el servidor valida de nuevo).
  let missing = 0;
  for (const col of entity.columns) {
    if (col.required && col.type !== 'boolean' && body[col.name] === null) { setFieldError(col.name, 'Campo obligatorio.'); missing += 1; }
  }
    for (const group of entity.exactlyOne ?? []) {
    if (!group.some((n) => body[n] !== null)) {
      const labels = group.map((n) => entity.columns.find((c) => c.name === n).label).join(' o ');
      group.forEach((n) => setFieldError(n, `Elige ${labels}.`));
      missing += 1;
    }
  }
  if (missing) { showBanner('Revisa los campos marcados.'); box.querySelector('[aria-invalid]')?.focus(); return; }

  btnSave.disabled = true;
  btnSave.textContent = 'Guardando…';
  try {
    if (item) await Api.update(entity.slug, item[entity.pk], body);
    else await Api.create(entity.slug, body);
    dlg.close();
    showToast(item ? 'Cambios guardados.' : 'Registro creado correctamente.');
    onSaved();
  } catch (err) {
    // El error se muestra dentro del modal para no perder lo escrito.
    showBanner(err.message);
    Object.entries(err.fields ?? {}).forEach(([name, msg]) => setFieldError(name, msg));
    box.querySelector('[aria-invalid]')?.focus();
  } finally {
    btnSave.disabled = false;
    btnSave.textContent = 'Guardar';
  }
});
box.addEventListener('change', () => ctx && syncExclusive(ctx.entity));
// Al corregir un campo se limpia su aviso.
box.addEventListener('input', (e) => {
  const el = e.target;
  if (el.getAttribute?.('aria-invalid')) {
    el.removeAttribute('aria-invalid');
    $(el.getAttribute('aria-describedby')).hidden = true;
  }
});

$('btn-cancel').addEventListener('click', () => dlg.close());
