// Dibuja la tabla de CUALQUIER módulo a partir de su definición (/api/meta).
import { escapeHtml, formatDate, formatDateTime, badgeTone } from './ui.js';

// Columnas visibles: se omiten las marcadas con hideInList (textos largos).
export const visibleColumns = (entity) => entity.columns.filter((c) => !c.hideInList);

// HTML del contenido de una celda según el tipo de columna.
function cellContent(col, row) {
  const v = row[col.name];
  if (col.type === 'select') return escapeHtml(row[`${col.name}__label`] ?? '') || '<span class="muted">—</span>';
  if (col.type === 'boolean') return `<span class="badge badge-${v ? 'done' : 'neutral'}">${v ? '● Sí' : '○ No'}</span>`;
  if (v === null || v === undefined || v === '') return '<span class="muted">—</span>';
  if (col.type === 'date') return formatDate(v);
  if (col.type === 'datetime') return formatDateTime(v);
  if (col.name === 'estado' || col.name === 'resultado') {
    return `<span class="badge badge-${badgeTone(v)}">${escapeHtml(v)}</span>`;
  }
  if (col.type === 'textarea') return `<span class="clamp" title="${escapeHtml(v)}">${escapeHtml(v)}</span>`;
  return escapeHtml(v);
}

export function renderTable(entity, rows, { thead, tbody }) {
  const cols = visibleColumns(entity);
  thead.innerHTML = `<tr><th class="col-id">ID</th>${cols.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('')}<th class="col-actions">Acciones</th></tr>`;

  tbody.innerHTML = rows.map((row) => {
    const id = row[entity.pk];
    return `
    <tr data-id="${id}">
      <td class="col-id" data-label="ID">#${id}</td>
      ${cols.map((c) => `<td data-label="${escapeHtml(c.label)}">${cellContent(c, row)}</td>`).join('')}
      <td class="actions">
        <button class="btn btn-ghost btn-small" data-edit="${id}">Editar</button>
        <button class="btn btn-outline btn-small" data-delete="${id}">Eliminar</button>
      </td>
    </tr>`;
  }).join('');
}

// Resumen corto de un registro para el mensaje de confirmación de borrado.
export function summarize(entity, row) {
  const parts = visibleColumns(entity)
    .filter((c) => c.type !== 'boolean')
    .map((c) => (c.type === 'select' ? row[`${c.name}__label`] : row[c.name]))
    .filter((v) => v !== null && v !== undefined && v !== '')
    .slice(0, 2);
  return `#${row[entity.pk]}${parts.length ? ` · ${parts.join(' · ')}` : ''}`;
}
