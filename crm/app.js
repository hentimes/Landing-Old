import { isLocalDev, LEAD_STATUSES, ADMIN_KEY_STORAGE } from './config.js';
import {
  addLeadNote,
  archiveLead,
  getFileUrl,
  getLeadDetail,
  getSession,
  listLeads,
  readAdminKey,
  saveAdminKey,
  updateLeadStatus,
} from './api.js';

const state = {
  items: [],
  selectedLeadId: '',
  selectedLead: null,
};

const elements = {
  sessionStatus: document.getElementById('session-status'),
  adminKeyBox: document.getElementById('admin-keybox'),
  adminKey: document.getElementById('admin-key'),
  saveAdminKey: document.getElementById('save-admin-key'),
  filterQ: document.getElementById('filter-q'),
  filterStatus: document.getElementById('filter-status'),
  filterSistema: document.getElementById('filter-sistema'),
  filterIsapre: document.getElementById('filter-isapre'),
  filterFrom: document.getElementById('filter-from'),
  filterTo: document.getElementById('filter-to'),
  applyFilters: document.getElementById('apply-filters'),
  clearFilters: document.getElementById('clear-filters'),
  leadList: document.getElementById('lead-list'),
  leadCount: document.getElementById('lead-count'),
  agendaCountTotal: document.getElementById('agenda-count-total'),
  agendaCountToday: document.getElementById('agenda-count-today'),
  agendaCountPending: document.getElementById('agenda-count-pending'),
  agendaCountUpcoming: document.getElementById('agenda-count-upcoming'),
  agendaListCaption: document.getElementById('agenda-list-caption'),
  agendaList: document.getElementById('agenda-list'),
  leadDetail: document.getElementById('lead-detail'),
  leadDetailEmpty: document.getElementById('lead-detail-empty'),
  leadRowTemplate: document.getElementById('lead-row-template'),
  agendaRowTemplate: document.getElementById('agenda-row-template'),
};

init();

function init() {
  hydrateStatusOptions();
  configureAccessMode();
  bindEvents();
  bootstrap();
}

function bindEvents() {
  if (isLocalDev) {
    elements.saveAdminKey.addEventListener('click', async () => {
      saveAdminKey(elements.adminKey.value.trim());
      await bootstrap();
    });
  }

  elements.applyFilters.addEventListener('click', loadLeads);
  elements.clearFilters.addEventListener('click', async () => {
    elements.filterQ.value = '';
    elements.filterStatus.value = '';
    elements.filterSistema.value = '';
    elements.filterIsapre.value = '';
    elements.filterFrom.value = '';
    elements.filterTo.value = '';
    await loadLeads();
  });

  elements.filterQ.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      await loadLeads();
    }
  });

  if (isLocalDev) {
    window.addEventListener('storage', (event) => {
      if (event.key === ADMIN_KEY_STORAGE) {
        elements.adminKey.value = readAdminKey();
      }
    });
  }
}

function configureAccessMode() {
  if (isLocalDev) {
    elements.adminKey.value = readAdminKey();
    elements.adminKeyBox.hidden = false;
    return;
  }

  elements.adminKeyBox.hidden = true;
}

async function bootstrap() {
  try {
    const session = await getSession();
    elements.sessionStatus.textContent = `${session.actorEmail} · ${session.authMode}`;
    await loadLeads();
  } catch (error) {
    elements.sessionStatus.textContent = error.message;
    renderList([]);
    renderDetail(null);
  }
}

async function loadLeads() {
  try {
    const filters = {
      q: elements.filterQ.value.trim(),
      status: elements.filterStatus.value,
      sistema: elements.filterSistema.value,
      isapre: elements.filterIsapre.value.trim(),
      from: elements.filterFrom.value,
      to: elements.filterTo.value,
      limit: 50,
    };

    const payload = await listLeads(filters);
    state.items = payload.items || [];
    elements.leadCount.textContent = `${payload.total || 0} resultados`;
    renderAgenda(state.items);
    renderList(state.items);

    if (state.selectedLeadId) {
      const exists = state.items.some((item) => item.id === state.selectedLeadId);
      if (exists) {
        await loadLeadDetail(state.selectedLeadId);
      } else {
        state.selectedLeadId = '';
        renderDetail(null);
      }
    }
  } catch (error) {
    elements.leadCount.textContent = error.message;
    renderAgenda([]);
    renderList([]);
    renderDetail(null);
  }
}

function renderAgenda(items) {
  const appointments = buildAppointments(items);
  const today = startOfDay(new Date());
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const total = appointments.length;
  const todayCount = appointments.filter((item) => isSameDay(item.date, today)).length;
  const pendingCount = appointments.filter((item) => !item.status || ['Pendiente', 'Por coordinar'].includes(item.status)).length;
  const upcomingCount = appointments.filter((item) => item.date >= today && item.date < nextWeek).length;

  elements.agendaCountTotal.textContent = String(total);
  elements.agendaCountToday.textContent = String(todayCount);
  elements.agendaCountPending.textContent = String(pendingCount);
  elements.agendaCountUpcoming.textContent = String(upcomingCount);

  elements.agendaList.innerHTML = '';
  if (!appointments.length) {
    elements.agendaListCaption.textContent = 'Sin citas por ahora';
    elements.agendaList.innerHTML = '<p class="crm-muted">Cuando empieces a agendar reuniones, aparecerán aquí.</p>';
    return;
  }

  elements.agendaListCaption.textContent = `${Math.min(appointments.length, 5)} próximas visibles`;
  const fragment = document.createDocumentFragment();

  appointments.slice(0, 5).forEach((appointment) => {
    const node = elements.agendaRowTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('[data-field="nombre"]').textContent = appointment.nombre || 'Sin nombre';
    node.querySelector('[data-field="estado-cita"]').textContent = appointment.status || 'Pendiente';
    node.querySelector('[data-field="fecha"]').textContent = formatDateTime(appointment.rawDate);
    node.querySelector('[data-field="sistema"]').textContent = appointment.sistema_actual || 'Sin sistema';
    node.addEventListener('click', () => loadLeadDetail(appointment.id));
    fragment.appendChild(node);
  });

  elements.agendaList.appendChild(fragment);
}

function renderList(items) {
  elements.leadList.innerHTML = '';

  if (!items.length) {
    elements.leadList.innerHTML = '<div class="crm-empty"><h3>Sin resultados</h3><p>No hay leads para los filtros actuales.</p></div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const node = elements.leadRowTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.leadId = item.id;
    if (item.id === state.selectedLeadId) {
      node.classList.add('is-active');
    }

    node.querySelector('[data-field="nombre"]').textContent = item.nombre || 'Sin nombre';
    node.querySelector('[data-field="status"]').textContent = item.status || 'Sin estado';
    node.querySelector('[data-field="sistema"]').textContent = item.sistema_actual || 'Sin sistema';
    node.querySelector('[data-field="isapre"]').textContent = item.isapre_especifica || '—';
    node.querySelector('[data-field="created"]').textContent = formatDate(item.created_at);
    node.querySelector('[data-field="contacto"]').textContent =
      [item.email, item.telefono, item.comuna].filter(Boolean).join(' · ') || 'Sin contacto';

    node.addEventListener('click', () => loadLeadDetail(item.id));
    fragment.appendChild(node);
  });

  elements.leadList.appendChild(fragment);
}

async function loadLeadDetail(leadId) {
  try {
    const payload = await getLeadDetail(leadId);
    state.selectedLeadId = leadId;
    state.selectedLead = payload.lead;
    renderList(state.items);
    renderDetail(payload);
  } catch (error) {
    renderDetail(null, error.message);
  }
}

function renderDetail(payload, errorMessage = '') {
  if (!payload?.lead) {
    elements.leadDetail.hidden = true;
    elements.leadDetailEmpty.hidden = false;
    elements.leadDetailEmpty.innerHTML = errorMessage
      ? `<h3>Error</h3><p>${escapeHtml(errorMessage)}</p>`
      : '<h3>Selecciona un lead</h3><p>Aquí verás datos, adjunto, comentarios, notas internas y acciones del caso.</p>';
    return;
  }

  const { lead, notes, events } = payload;
  elements.leadDetailEmpty.hidden = true;
  elements.leadDetail.hidden = false;

  const filePreview = lead.has_file
    ? `
      <div class="crm-card">
        <div class="crm-card__header">
          <h3>Adjunto</h3>
          <a href="${getFileUrl(lead.id)}" target="_blank" rel="noopener noreferrer">Abrir en otra pestaña</a>
        </div>
        <iframe class="crm-file-frame" src="${getFileUrl(lead.id)}" title="Adjunto del lead"></iframe>
      </div>
    `
    : '';

  const notesHtml = (notes || []).length
    ? notes.map((note) => `
        <article class="crm-note">
          <header>
            <strong>${escapeHtml(note.author_email)}</strong>
            <span>${formatDateTime(note.created_at)}</span>
          </header>
          <p>${escapeHtml(note.note_text)}</p>
        </article>
      `).join('')
    : '<p class="crm-muted">Sin notas internas todavía.</p>';

  const eventsHtml = (events || []).length
    ? events.map((event) => `
        <article class="crm-event">
          <strong>${escapeHtml(event.event_type)}</strong>
          <span>${formatDateTime(event.created_at)} · ${escapeHtml(event.actor_email)}</span>
        </article>
      `).join('')
    : '<p class="crm-muted">Sin eventos registrados.</p>';

  elements.leadDetail.innerHTML = `
    <div class="crm-detail__header">
      <div>
        <p class="crm-eyebrow">Lead seleccionado</p>
        <h2>${escapeHtml(lead.nombre || 'Sin nombre')}</h2>
      </div>
      <span class="crm-badge">${escapeHtml(lead.status || 'Sin estado')}</span>
    </div>

    <div class="crm-detail__grid">
      ${renderInfoCard(lead)}
      ${renderCommentCard(lead)}
      ${renderAppointmentCard(lead)}
      ${renderActionsCard(lead)}
      ${filePreview}
      <div class="crm-card">
        <div class="crm-card__header">
          <h3>Notas internas</h3>
        </div>
        <form id="note-form" class="crm-note-form">
          <textarea id="note-text" rows="4" placeholder="Registrar seguimiento, contexto comercial o acuerdos."></textarea>
          <button type="submit" class="button button--primary">Guardar nota</button>
        </form>
        <div class="crm-note-list">${notesHtml}</div>
      </div>
      <div class="crm-card">
        <div class="crm-card__header">
          <h3>Historial</h3>
        </div>
        <div class="crm-event-list">${eventsHtml}</div>
      </div>
    </div>
  `;

  bindDetailActions(lead);
}

function bindDetailActions(lead) {
  const statusSelect = document.getElementById('lead-status');
  const saveStatusButton = document.getElementById('save-status');
  const archiveButton = document.getElementById('archive-lead');
  const noteForm = document.getElementById('note-form');
  const noteText = document.getElementById('note-text');

  saveStatusButton?.addEventListener('click', async () => {
    saveStatusButton.disabled = true;
    try {
      await updateLeadStatus(lead.id, statusSelect.value);
      await loadLeads();
      await loadLeadDetail(lead.id);
    } catch (error) {
      window.alert(error.message);
    } finally {
      saveStatusButton.disabled = false;
    }
  });

  archiveButton?.addEventListener('click', async () => {
    const reason = window.prompt('Motivo de archivado (opcional):', '');
    archiveButton.disabled = true;
    try {
      await archiveLead(lead.id, reason || '');
      await loadLeads();
      await loadLeadDetail(lead.id);
    } catch (error) {
      window.alert(error.message);
    } finally {
      archiveButton.disabled = false;
    }
  });

  noteForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const note = noteText.value.trim();
    if (!note) {
      return;
    }
    try {
      await addLeadNote(lead.id, note);
      noteText.value = '';
      await loadLeadDetail(lead.id);
    } catch (error) {
      window.alert(error.message);
    }
  });
}

function renderInfoCard(lead) {
  const rows = [
    ['Correo', lead.email],
    ['Teléfono', lead.telefono],
    ['Edad', lead.rango_edad],
    ['Comuna', lead.comuna],
    ['Región', lead.region],
    ['Sistema', lead.sistema_actual],
    ['Isapre', lead.isapre_especifica],
    ['Cargas', lead.num_cargas],
    ['Edad cargas', lead.edad_cargas],
    ['Renta', lead.rango_renta],
    ['Creado', formatDateTime(lead.created_at)],
    ['Actualizado', formatDateTime(lead.updated_at)],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `
      <div class="crm-kv">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `)
    .join('');

  return `
    <div class="crm-card">
      <div class="crm-card__header">
        <h3>Datos del lead</h3>
      </div>
      <div class="crm-kv-grid">${rows}</div>
    </div>
  `;
}

function renderCommentCard(lead) {
  return `
    <div class="crm-card">
      <div class="crm-card__header">
        <h3>Comentario del lead</h3>
      </div>
      <p class="crm-long-text">${escapeHtml(lead.comentarios || 'Sin comentario entregado.')}</p>
    </div>
  `;
}

function renderActionsCard(lead) {
  const statusOptions = LEAD_STATUSES.map((status) => `
    <option value="${escapeHtml(status)}" ${lead.status === status ? 'selected' : ''}>${escapeHtml(status)}</option>
  `).join('');

  return `
    <div class="crm-card">
      <div class="crm-card__header">
        <h3>Acciones</h3>
      </div>
      <div class="crm-actions">
        <label>
          <span>Estado</span>
          <select id="lead-status">${statusOptions}</select>
        </label>
        <div class="crm-actions__buttons">
          <button type="button" id="save-status" class="button button--primary">Guardar estado</button>
          <button type="button" id="archive-lead" class="button button--ghost">Archivar</button>
        </div>
      </div>
    </div>
  `;
}

function renderAppointmentCard(lead) {
  const appointmentDate = lead.cita_fecha_hora ? formatDateTime(lead.cita_fecha_hora) : 'Sin fecha agendada';
  const appointmentStatus = lead.cita_estado || 'Pendiente';
  const appointmentLink = lead.cita_calendar_url
    ? `<a href="${escapeHtml(lead.cita_calendar_url)}" target="_blank" rel="noopener noreferrer">Abrir en Google Calendar</a>`
    : '<span class="crm-muted">Sin enlace de calendario todavía.</span>';

  return `
    <div class="crm-card">
      <div class="crm-card__header">
        <h3>Agenda / cita</h3>
      </div>
      <div class="crm-kv-grid">
        <div class="crm-kv">
          <span>Estado cita</span>
          <strong>${escapeHtml(appointmentStatus)}</strong>
        </div>
        <div class="crm-kv">
          <span>Fecha y hora</span>
          <strong>${escapeHtml(appointmentDate)}</strong>
        </div>
      </div>
      <div class="crm-inline-link">
        ${appointmentLink}
      </div>
    </div>
  `;
}

function hydrateStatusOptions() {
  LEAD_STATUSES.forEach((status) => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    elements.filterStatus.appendChild(option);
  });
}

function formatDate(value) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function buildAppointments(items) {
  return (items || [])
    .filter((item) => item.cita_fecha_hora)
    .map((item) => ({
      ...item,
      rawDate: item.cita_fecha_hora,
      date: new Date(item.cita_fecha_hora),
    }))
    .filter((item) => !Number.isNaN(item.date.getTime()))
    .sort((a, b) => a.date - b.date);
}

function startOfDay(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function isSameDay(left, right) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function formatDateTime(value) {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
