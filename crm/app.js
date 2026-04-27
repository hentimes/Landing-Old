import {
  isLocalDev,
  LEAD_STATUSES,
  ADMIN_KEY_STORAGE,
  PROFILE_STORAGE,
  RANGE_OPTIONS,
  ISAPRE_BUCKETS,
} from './config.js';
import {
  addLeadNote,
  archiveLead,
  getFileUrl,
  getLeadDetail,
  getSession,
  listLeads,
  readAdminKey,
  saveAdminKey,
  updateLeadRut,
  updateLeadStatus,
} from './api.js';

const state = {
  items: [],
  filteredItems: [],
  selectedLeadId: '',
  selectedLead: null,
  currentView: 'dashboard',
  session: null,
  selectedRange: '7d',
  profile: loadProfile(),
  openPopover: '',
  activeFileLeadId: '',
  profileMenuOpen: false,
};

const elements = {
  sessionStatus: document.getElementById('session-status'),
  sidebarUserName: document.getElementById('sidebar-user-name'),
  sidebarAvatar: document.getElementById('sidebar-avatar'),
  profileName: document.getElementById('profile-name'),
  profileAvatar: document.getElementById('profile-avatar'),
  profilePhoto: document.getElementById('profile-photo'),
  viewTitle: document.getElementById('view-title'),
  topbarActiveView: document.getElementById('topbar-active-view'),
  navItems: Array.from(document.querySelectorAll('.crm-nav-item')),
  viewPanels: Array.from(document.querySelectorAll('[data-view-panel]')),
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
  leadDetail: document.getElementById('lead-detail'),
  leadDetailEmpty: document.getElementById('lead-detail-empty'),
  leadRowTemplate: document.getElementById('lead-row-template'),
  rangeChips: Array.from(document.querySelectorAll('.crm-range-chip')),
  metricLeads: document.getElementById('metric-leads'),
  metricClosed: document.getElementById('metric-closed'),
  metricProposals: document.getElementById('metric-proposals'),
  metricPending: document.getElementById('metric-pending'),
  trendLeads: document.getElementById('trend-leads'),
  trendClosed: document.getElementById('trend-closed'),
  trendProposals: document.getElementById('trend-proposals'),
  trendPending: document.getElementById('trend-pending'),
  overviewLineChart: document.getElementById('overview-line-chart'),
  overviewCaption: document.getElementById('overview-caption'),
  isapreDonut: document.getElementById('isapre-donut'),
  isapreLegend: document.getElementById('isapre-legend'),
  statusBreakdown: document.getElementById('status-breakdown'),
  agendaCountTotal: document.getElementById('agenda-count-total'),
  agendaCountToday: document.getElementById('agenda-count-today'),
  agendaCountPending: document.getElementById('agenda-count-pending'),
  agendaCountUpcoming: document.getElementById('agenda-count-upcoming'),
  agendaListCaption: document.getElementById('agenda-list-caption'),
  agendaList: document.getElementById('agenda-list'),
  agendaSectionList: document.getElementById('agenda-section-list'),
  notificationButton: document.getElementById('notification-button'),
  updatesButton: document.getElementById('updates-button'),
  messagesButton: document.getElementById('messages-button'),
  notificationCount: document.getElementById('notification-count'),
  updatesCount: document.getElementById('updates-count'),
  messagesCount: document.getElementById('messages-count'),
  notificationPopover: document.getElementById('notification-popover'),
  updatesPopover: document.getElementById('updates-popover'),
  messagesPopover: document.getElementById('messages-popover'),
  profileWrap: document.getElementById('profile-wrap'),
  profileTrigger: document.getElementById('profile-trigger'),
  profileMenu: document.getElementById('profile-menu'),
  profileMenuProfile: document.getElementById('profile-menu-profile'),
  profileMenuSettings: document.getElementById('profile-menu-settings'),
  profileModal: document.getElementById('profile-modal'),
  profileNameInput: document.getElementById('profile-name-input'),
  profilePhotoInput: document.getElementById('profile-photo-input'),
  profilePreviewPhoto: document.getElementById('profile-preview-photo'),
  profilePreviewAvatar: document.getElementById('profile-preview-avatar'),
  profileReset: document.getElementById('profile-reset'),
  profileSave: document.getElementById('profile-save'),
  fileModal: document.getElementById('file-modal'),
  fileModalTitle: document.getElementById('file-modal-title'),
  fileModalOpen: document.getElementById('file-modal-open'),
  fileModalClose: document.getElementById('file-modal-close'),
  fileModalFrame: document.getElementById('file-modal-frame'),
};

init();

function init() {
  hydrateStatusOptions();
  configureAccessMode();
  bindEvents();
  applyProfileToUI();
  bootstrap();
}

function bindEvents() {
  if (isLocalDev) {
    elements.saveAdminKey?.addEventListener('click', async () => {
      saveAdminKey(elements.adminKey.value.trim());
      await bootstrap();
    });
  }

  elements.navItems.forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });

  elements.rangeChips.forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedRange = button.dataset.range;
      elements.rangeChips.forEach((chip) => chip.classList.toggle('is-active', chip === button));
      refreshDashboard();
    });
  });

  elements.applyFilters?.addEventListener('click', () => renderLeadsView());
  elements.clearFilters?.addEventListener('click', () => {
    elements.filterQ.value = '';
    elements.filterStatus.value = '';
    elements.filterSistema.value = '';
    elements.filterIsapre.value = '';
    elements.filterFrom.value = '';
    elements.filterTo.value = '';
    renderLeadsView();
  });

  [elements.filterQ, elements.filterIsapre].forEach((input) => {
    input?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        renderLeadsView();
      }
    });
  });

  [elements.filterStatus, elements.filterSistema, elements.filterFrom, elements.filterTo].forEach((input) => {
    input?.addEventListener('change', () => renderLeadsView());
  });

  elements.notificationButton?.addEventListener('click', () => togglePopover('notification'));
  elements.updatesButton?.addEventListener('click', () => togglePopover('updates'));
  elements.messagesButton?.addEventListener('click', () => togglePopover('messages'));

  elements.profileTrigger?.addEventListener('click', (event) => {
    event.preventDefault();
    toggleProfileMenu();
  });
  elements.profileMenuProfile?.addEventListener('click', openProfileModal);
  elements.profileMenuSettings?.addEventListener('click', openProfileModal);

  elements.profileWrap?.addEventListener('mouseenter', () => setProfileMenu(true));
  elements.profileWrap?.addEventListener('mouseleave', () => setProfileMenu(false));

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.crm-icon-button') && !event.target.closest('.crm-popover')) {
      hidePopovers();
    }
    if (!event.target.closest('.crm-profile-wrap')) {
      setProfileMenu(false);
    }
  });

  elements.profilePhotoInput?.addEventListener('change', handleProfilePhotoChange);
  elements.profileReset?.addEventListener('click', resetProfile);
  elements.profileSave?.addEventListener('click', saveProfileChanges);

  elements.fileModalClose?.addEventListener('click', closeFileModal);
  elements.fileModal?.addEventListener('click', (event) => {
    const card = event.target.closest('.crm-file-modal__card');
    if (!card) {
      closeFileModal();
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

function setView(view) {
  state.currentView = view;
  elements.navItems.forEach((item) => item.classList.toggle('is-active', item.dataset.view === view));
  elements.viewPanels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.viewPanel === view));
  elements.viewTitle.textContent = ({
    dashboard: 'Dashboard del asesor',
    leads: 'Leads y seguimiento',
    agenda: 'Agenda comercial',
  })[view] || 'CRM';
  elements.topbarActiveView.textContent = capitalize(view);
}

async function bootstrap() {
  try {
    state.session = await getSession();
    const displayName = state.profile.name || state.session.actorEmail || 'Asesor';
    elements.sessionStatus.textContent = `${state.session.actorEmail || 'Acceso OK'} · ${state.session.authMode}`;
    elements.sidebarUserName.textContent = displayName;
    paintAvatar(elements.sidebarAvatar, displayName);
    await loadLeads();
  } catch (error) {
    elements.sessionStatus.textContent = error.message;
    renderDashboard([]);
    renderAgenda([]);
    renderList([]);
    renderDetail(null, error.message);
  }
}

async function loadLeads() {
  try {
    const payload = await listLeads({ limit: 300 });
    state.items = payload.items || [];
    state.filteredItems = applyLeadFilters(state.items);
    refreshDashboard();
    renderLeadsView();
    renderAgenda(state.items);

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
    renderDashboard([]);
    renderAgenda([]);
    renderList([]);
    renderDetail(null, error.message);
  }
}

function renderLeadsView() {
  state.filteredItems = applyLeadFilters(state.items);
  elements.leadCount.textContent = `${state.filteredItems.length} resultados`;
  renderList(state.filteredItems);
}

function refreshDashboard() {
  const rangeItems = filterItemsByRange(state.items, state.selectedRange);
  const previousRangeItems = filterItemsByPreviousRange(state.items, state.selectedRange);
  renderDashboard(rangeItems, previousRangeItems);
}

function renderDashboard(items = [], previousItems = []) {
  const totalLeads = items.length;
  const totalClosed = items.filter((item) => item.status === 'Cerrado').length;
  const totalProposals = items.filter((item) => item.status === 'Propuesta enviada').length;
  const totalPending = items.filter((item) => ['Nuevo', 'Por contactar', 'Completado'].includes(item.status)).length;

  elements.metricLeads.textContent = String(totalLeads);
  elements.metricClosed.textContent = String(totalClosed);
  elements.metricProposals.textContent = String(totalProposals);
  elements.metricPending.textContent = String(totalPending);

  renderTrend(elements.trendLeads, totalLeads, previousItems.length);
  renderTrend(elements.trendClosed, totalClosed, previousItems.filter((item) => item.status === 'Cerrado').length);
  renderTrend(elements.trendProposals, totalProposals, previousItems.filter((item) => item.status === 'Propuesta enviada').length);
  renderTrend(elements.trendPending, totalPending, previousItems.filter((item) => ['Nuevo', 'Por contactar', 'Completado'].includes(item.status)).length);

  const series = buildSeries(items, state.selectedRange);
  elements.overviewCaption.textContent = `${RANGE_OPTIONS[state.selectedRange]?.label || 'Periodo'} vs periodo anterior`;
  elements.overviewLineChart.innerHTML = buildLineChartSvg(series.labels, [
    { values: series.leads, color: '#2f80ed', fill: 'rgba(47,128,237,0.10)' },
    { values: series.closed, color: '#12284a', fill: 'rgba(18,40,74,0.08)' },
  ]);

  const buckets = ISAPRE_BUCKETS.map((label) => ({
    label,
    count: items.filter((item) => resolveSystemBucket(item) === label).length,
  }));
  renderDonut(buckets);

  const statuses = LEAD_STATUSES
    .map((label) => ({ label, count: items.filter((item) => item.status === label).length }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count);
  elements.statusBreakdown.innerHTML = statuses.length
    ? statuses.map((entry) => renderStatusRow(entry.label, entry.count, totalLeads || 1)).join('')
    : '<p class="crm-muted">Sin movimientos para el periodo seleccionado.</p>';

  hydratePopovers(items);
}

function renderDonut(buckets) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  if (!total) {
    elements.isapreDonut.innerHTML = '<span>0</span><small>Sin leads</small>';
    elements.isapreDonut.style.background = 'linear-gradient(180deg, #eaf1f8 0%, #dfe9f6 100%)';
    elements.isapreLegend.innerHTML = '<p class="crm-muted">No hay distribución disponible todavía.</p>';
    return;
  }

  const palette = [
    '#1668dc',
    '#0f9d58',
    '#f59e0b',
    '#ef4444',
    '#6d28d9',
    '#14b8a6',
    '#2563eb',
    '#db2777',
    '#64748b',
  ];

  let current = 0;
  const segments = [];
  const legend = [];
  buckets.forEach((bucket, index) => {
    const percent = bucket.count / total;
    const start = current * 360;
    const end = (current + percent) * 360;
    const color = palette[index % palette.length];
    segments.push(`${color} ${start}deg ${end}deg`);
    legend.push(`
      <div class="crm-legend-row">
        <span class="crm-legend-row__dot" style="background:${color}"></span>
        <strong>${escapeHtml(bucket.label)}</strong>
        <span>${bucket.count}</span>
      </div>
    `);
    current += percent;
  });

  elements.isapreDonut.style.background = `conic-gradient(${segments.join(', ')})`;
  elements.isapreDonut.innerHTML = `<span>${total}</span><small>Leads</small>`;
  elements.isapreLegend.innerHTML = legend.join('');
}

function renderStatusRow(label, count, total) {
  const percent = Math.round((count / Math.max(total, 1)) * 100);
  return `
    <div class="crm-status-row">
      <div class="crm-status-row__head">
        <strong>${escapeHtml(label)}</strong>
        <span>${count} · ${percent}%</span>
      </div>
      <div class="crm-status-row__track">
        <div class="crm-status-row__fill" style="width:${percent}%"></div>
      </div>
    </div>
  `;
}

function hydratePopovers(items) {
  const notifications = items.filter((item) => ['Nuevo', 'Por contactar'].includes(item.status)).slice(0, 5);
  const updates = items.slice().sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)).slice(0, 5);
  const messages = buildAppointments(items).filter((item) => !item.status || ['Pendiente', 'Por coordinar'].includes(item.status)).slice(0, 5);

  elements.notificationCount.textContent = String(notifications.length);
  elements.updatesCount.textContent = String(updates.length);
  elements.messagesCount.textContent = String(messages.length);

  elements.notificationPopover.innerHTML = buildPopoverList('Leads por contactar', notifications.map((item) => ({
    title: item.nombre || 'Sin nombre',
    meta: item.telefono || item.email || 'Sin contacto',
    leadId: item.id,
  })));
  elements.updatesPopover.innerHTML = buildPopoverList('Updates recientes', updates.map((item) => ({
    title: item.nombre || 'Sin nombre',
    meta: `${formatDateTime(item.updated_at || item.created_at)} · ${item.status || 'Sin estado'}`,
    leadId: item.id,
  })));
  elements.messagesPopover.innerHTML = buildPopoverList('Citas pendientes', messages.map((item) => ({
    title: item.nombre || 'Sin nombre',
    meta: `${formatDateTime(item.cita_fecha_hora)} · ${item.cita_estado || 'Pendiente'}`,
    leadId: item.id,
  })));

  document.querySelectorAll('.crm-popover [data-lead-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      hidePopovers();
      setView('leads');
      await loadLeadDetail(button.dataset.leadId);
    });
  });
}

function renderAgenda(items = []) {
  const appointments = buildAppointments(items);
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const total = appointments.length;
  const todayCount = appointments.filter((item) => item.rawDate.slice(0, 10) === todayIso).length;
  const pendingCount = appointments.filter((item) => !item.status || ['Pendiente', 'Por coordinar'].includes(item.status)).length;
  const upcomingCount = appointments.filter((item) => item.date >= now && item.date <= nextWeek).length;

  elements.agendaCountTotal.textContent = String(total);
  elements.agendaCountToday.textContent = String(todayCount);
  elements.agendaCountPending.textContent = String(pendingCount);
  elements.agendaCountUpcoming.textContent = String(upcomingCount);

  const markup = appointments.length
    ? appointments.slice(0, 8).map(renderAppointmentItem).join('')
    : '<p class="crm-muted">Cuando empieces a agendar reuniones, aparecerán aquí.</p>';

  elements.agendaListCaption.textContent = appointments.length
    ? `${appointments.length} citas cargadas`
    : 'Sin citas por ahora';
  elements.agendaList.innerHTML = markup;
  elements.agendaSectionList.innerHTML = markup;
  bindAgendaClicks();
}

function renderAppointmentItem(appointment) {
  return `
    <button type="button" class="crm-agenda-item" data-lead-id="${appointment.id}">
      <div>
        <strong>${escapeHtml(appointment.nombre || 'Sin nombre')}</strong>
        <span>${escapeHtml(formatDateTime(appointment.cita_fecha_hora))}</span>
      </div>
      <span class="crm-badge">${escapeHtml(appointment.status || 'Pendiente')}</span>
    </button>
  `;
}

function bindAgendaClicks() {
  document.querySelectorAll('.crm-agenda-item[data-lead-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      setView('leads');
      await loadLeadDetail(button.dataset.leadId);
    });
  });
}

function renderList(items) {
  elements.leadList.innerHTML = '';
  if (!items.length) {
    elements.leadList.innerHTML = '<div class="crm-empty crm-empty--small"><h3>Sin resultados</h3><p>No hay leads para los filtros actuales.</p></div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const node = elements.leadRowTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.leadId = item.id;
    if (item.id === state.selectedLeadId) {
      node.classList.add('is-active');
    }

    const avatar = node.querySelector('[data-field="avatar"]');
    paintAvatar(avatar, item.nombre || item.email || item.telefono || item.id);
    node.querySelector('[data-field="nombre"]').textContent = item.nombre || 'Sin nombre';
    node.querySelector('[data-field="contacto"]').textContent = [item.telefono, item.email].filter(Boolean).join(' · ') || 'Sin contacto';
    node.querySelector('[data-field="sistema"]').textContent = item.sistema_actual || 'Sin sistema';
    node.querySelector('[data-field="isapre"]').textContent = item.isapre_especifica || 'Sin isapre';
    node.querySelector('[data-field="status"]').textContent = item.status || 'Sin estado';
    node.querySelector('[data-field="created"]').textContent = formatDate(item.created_at);
    node.querySelector('[data-field="region"]').textContent = item.region || 'Sin región';

    const attachButton = node.querySelector('[data-field="attach"]');
    attachButton.hidden = !item.has_file;
    attachButton.disabled = !item.has_file;
    attachButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (item.has_file) {
        openFileModal(item.id, item.nombre || 'Lead', item.pdf_original_name || 'Adjunto');
      }
    });

    node.addEventListener('click', () => loadLeadDetail(item.id));
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        loadLeadDetail(item.id);
      }
    });
    fragment.appendChild(node);
  });

  elements.leadList.appendChild(fragment);
}

async function loadLeadDetail(leadId) {
  try {
    const payload = await getLeadDetail(leadId);
    state.selectedLeadId = leadId;
    state.selectedLead = payload.lead;
    renderList(state.filteredItems);
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
      : '<h3>Selecciona un lead</h3><p>Aquí verás datos, comentarios, RUT, notas internas y acciones del caso.</p>';
    return;
  }

  const { lead, notes, events } = payload;
  elements.leadDetail.hidden = false;
  elements.leadDetailEmpty.hidden = true;

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
    ${renderDetailHeader(lead)}
    <div class="crm-detail-grid crm-detail-grid--compact">
      ${renderInfoCard(lead)}
      ${renderCommentCard(lead)}
      ${renderRutCard(lead)}
      ${renderActionsCard(lead)}
      ${renderAppointmentCard(lead)}
      ${renderAttachmentCard(lead)}
      <div class="crm-card crm-card--detail-wide">
        <div class="crm-card__header">
          <h3>Notas internas</h3>
        </div>
        <form id="note-form" class="crm-note-form">
          <textarea id="note-text" rows="3" placeholder="Registrar seguimiento, contexto comercial o acuerdos."></textarea>
          <button type="submit" class="button button--primary">Guardar nota</button>
        </form>
        <div class="crm-note-list">${notesHtml}</div>
      </div>
      <div class="crm-card crm-card--detail-wide">
        <div class="crm-card__header">
          <h3>Historial</h3>
        </div>
        <div class="crm-event-list">${eventsHtml}</div>
      </div>
    </div>
  `;

  bindDetailActions(lead);
}

function renderDetailHeader(lead) {
  return `
    <div class="crm-detail-summary">
      <div class="crm-detail-summary__identity">
        <div class="crm-avatar crm-avatar--detail" id="detail-avatar"></div>
        <div>
          <h2>${escapeHtml(lead.nombre || 'Sin nombre')}</h2>
          <div class="crm-chip-row crm-chip-row--compact">
            ${lead.email ? `<span class="crm-chip">${escapeHtml(lead.email)}</span>` : ''}
            ${lead.telefono ? `<span class="crm-chip">${escapeHtml(lead.telefono)}</span>` : ''}
            ${lead.comuna ? `<span class="crm-chip">${escapeHtml(lead.comuna)}</span>` : ''}
            ${lead.region ? `<span class="crm-chip">${escapeHtml(lead.region)}</span>` : ''}
            ${lead.sistema_actual ? `<span class="crm-chip crm-chip--accent">${escapeHtml(lead.sistema_actual)}</span>` : ''}
            ${lead.isapre_especifica ? `<span class="crm-chip">${escapeHtml(lead.isapre_especifica)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="crm-detail-summary__side">
        <span class="crm-badge">${escapeHtml(lead.status || 'Sin estado')}</span>
        ${lead.has_file ? `<button type="button" class="button button--ghost button--compact" id="open-detail-file"><i class="fas fa-paperclip" aria-hidden="true"></i> Ver adjunto</button>` : ''}
      </div>
    </div>
  `;
}

function bindDetailActions(lead) {
  paintAvatar(document.getElementById('detail-avatar'), lead.nombre || lead.email || lead.telefono || lead.id);

  document.getElementById('open-detail-file')?.addEventListener('click', () => {
    openFileModal(lead.id, lead.nombre || 'Lead', lead.pdf_original_name || 'Adjunto');
  });
  document.getElementById('open-detail-file-secondary')?.addEventListener('click', () => {
    openFileModal(lead.id, lead.nombre || 'Lead', lead.pdf_original_name || 'Adjunto');
  });

  const statusSelect = document.getElementById('lead-status');
  const saveStatusButton = document.getElementById('save-status');
  const archiveButton = document.getElementById('archive-lead');
  const noteForm = document.getElementById('note-form');
  const noteText = document.getElementById('note-text');
  const rutInput = document.getElementById('lead-rut');
  const saveRutButton = document.getElementById('save-rut');
  const rutFeedback = document.getElementById('rut-feedback');

  rutInput?.addEventListener('input', () => {
    rutInput.value = sanitizeRutTyping(rutInput.value);
    rutFeedback.textContent = '';
    rutInput.classList.remove('is-invalid');
  });
  rutInput?.addEventListener('blur', () => {
    rutInput.value = formatRut(rutInput.value);
    const trimmed = rutInput.value.trim();
    if (trimmed && !isValidRut(trimmed)) {
      rutInput.classList.add('is-invalid');
      rutFeedback.textContent = 'RUT inválido.';
    }
  });

  saveRutButton?.addEventListener('click', async () => {
    const formatted = formatRut(rutInput.value);
    rutInput.value = formatted;
    if (formatted && !isValidRut(formatted)) {
      rutInput.classList.add('is-invalid');
      rutFeedback.textContent = 'El RUT ingresado no es válido.';
      return;
    }

    saveRutButton.disabled = true;
    try {
      await updateLeadRut(lead.id, formatted);
      rutInput.classList.remove('is-invalid');
      rutFeedback.textContent = formatted ? 'RUT guardado.' : 'RUT limpiado.';
      await loadLeads();
      await loadLeadDetail(lead.id);
    } catch (error) {
      rutInput.classList.add('is-invalid');
      rutFeedback.textContent = error.message;
    } finally {
      saveRutButton.disabled = false;
    }
  });

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
    if (!note) return;
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
      <div class="crm-comment-box">
        <p class="crm-long-text">${escapeHtml(lead.comentarios || 'Sin comentario entregado.')}</p>
      </div>
    </div>
  `;
}

function renderRutCard(lead) {
  const rut = formatRut(lead.rut || '');
  return `
    <div class="crm-card">
      <div class="crm-card__header">
        <h3>RUT del lead</h3>
      </div>
      <div class="crm-actions">
        <label>
          <span>RUT</span>
          <input id="lead-rut" type="text" inputmode="text" autocomplete="off" placeholder="12.345.678-5" value="${escapeHtml(rut)}" />
        </label>
        <div class="crm-actions__buttons crm-actions__buttons--stack">
          <button type="button" id="save-rut" class="button button--secondary">Guardar RUT</button>
          <small id="rut-feedback" class="crm-inline-feedback">${rut ? 'RUT cargado.' : 'Sin RUT ingresado.'}</small>
        </div>
      </div>
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
      <div class="crm-inline-link">${appointmentLink}</div>
    </div>
  `;
}

function renderAttachmentCard(lead) {
  return `
    <div class="crm-card">
      <div class="crm-card__header">
        <h3>Adjunto</h3>
      </div>
      ${
        lead.has_file
          ? `<button type="button" class="button button--ghost button--compact" id="open-detail-file-secondary"><i class="fas fa-paperclip" aria-hidden="true"></i> Abrir archivo adjunto</button>`
          : '<p class="crm-muted">Este lead no tiene adjunto.</p>'
      }
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

function applyLeadFilters(items) {
  const query = normalizeText(elements.filterQ.value.trim());
  const status = elements.filterStatus.value;
  const sistema = elements.filterSistema.value;
  const isapre = normalizeText(elements.filterIsapre.value.trim());
  const from = elements.filterFrom.value ? new Date(`${elements.filterFrom.value}T00:00:00`) : null;
  const to = elements.filterTo.value ? new Date(`${elements.filterTo.value}T23:59:59`) : null;

  return items.filter((item) => {
    if (status && item.status !== status) return false;
    if (sistema && item.sistema_actual !== sistema) return false;
    if (isapre && !normalizeText(item.isapre_especifica || '').includes(isapre)) return false;

    if (query) {
      const haystack = normalizeText([
        item.nombre,
        item.email,
        item.telefono,
        item.comuna,
        item.region,
        item.isapre_especifica,
        item.rut,
      ].filter(Boolean).join(' '));
      if (!haystack.includes(query)) return false;
    }

    const created = new Date(item.created_at);
    if (from && created < from) return false;
    if (to && created > to) return false;
    return true;
  });
}

function filterItemsByRange(items, rangeKey) {
  const days = RANGE_OPTIONS[rangeKey]?.days || 7;
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (days === 1) {
    return items.filter((item) => new Date(item.created_at) >= start);
  }

  start.setDate(start.getDate() - (days - 1));
  return items.filter((item) => new Date(item.created_at) >= start && new Date(item.created_at) <= now);
}

function filterItemsByPreviousRange(items, rangeKey) {
  const days = RANGE_OPTIONS[rangeKey]?.days || 7;
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const currentStart = new Date(end);
  currentStart.setDate(currentStart.getDate() - (days - 1));
  const previousEnd = new Date(currentStart);
  previousEnd.setMilliseconds(-1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - (days - 1));

  return items.filter((item) => {
    const created = new Date(item.created_at);
    return created >= previousStart && created <= previousEnd;
  });
}

function buildSeries(items, rangeKey) {
  const days = RANGE_OPTIONS[rangeKey]?.days || 7;
  const now = new Date();
  let bucketCount = 7;
  let stepDays = 1;
  let labelFormat = { weekday: 'short' };

  if (rangeKey === 'today') {
    bucketCount = 6;
    stepDays = 1 / 6;
    labelFormat = { hour: '2-digit' };
  } else if (days <= 14) {
    bucketCount = days;
  } else if (days <= 30) {
    bucketCount = 6;
    stepDays = 5;
    labelFormat = { day: '2-digit', month: 'short' };
  } else if (days <= 90) {
    bucketCount = 6;
    stepDays = 15;
    labelFormat = { day: '2-digit', month: 'short' };
  } else {
    bucketCount = 6;
    stepDays = Math.round(days / 6);
    labelFormat = { month: 'short' };
  }

  const labels = [];
  const leads = Array.from({ length: bucketCount }, () => 0);
  const closed = Array.from({ length: bucketCount }, () => 0);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (rangeKey !== 'today') {
    start.setDate(start.getDate() - (days - 1));
  }

  for (let index = 0; index < bucketCount; index += 1) {
    const bucketDate = new Date(start);
    if (rangeKey === 'today') {
      bucketDate.setHours(8 + index * 2, 0, 0, 0);
    } else {
      bucketDate.setDate(start.getDate() + Math.round(index * stepDays));
    }
    labels.push(new Intl.DateTimeFormat('es-CL', labelFormat).format(bucketDate).replace('.', ''));
  }

  items.forEach((item) => {
    const created = new Date(item.created_at);
    if (Number.isNaN(created.getTime())) return;
    let index = 0;
    if (rangeKey === 'today') {
      const hour = created.getHours();
      index = Math.min(bucketCount - 1, Math.max(0, Math.floor((hour - 8) / 2)));
    } else {
      const diffDays = Math.max(0, Math.floor((created - start) / 86400000));
      index = Math.min(bucketCount - 1, Math.floor(diffDays / Math.max(stepDays, 1)));
    }
    leads[index] += 1;
    if (item.status === 'Cerrado') {
      closed[index] += 1;
    }
  });

  return { labels, leads, closed };
}

function buildLineChartSvg(labels, datasets) {
  const width = 760;
  const height = 248;
  const padding = { top: 12, right: 18, bottom: 28, left: 18 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const max = Math.max(1, ...datasets.flatMap((dataset) => dataset.values));

  const pointsFor = (values) => values.map((value, index) => {
    const x = padding.left + (chartWidth / Math.max(values.length - 1, 1)) * index;
    const y = padding.top + chartHeight - ((value / max) * chartHeight);
    return [x, y];
  });

  const lines = datasets.map((dataset) => {
    const points = pointsFor(dataset.values);
    const path = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
    const area = `${path} L ${points.at(-1)[0]} ${padding.top + chartHeight} L ${points[0][0]} ${padding.top + chartHeight} Z`;
    return `
      <path d="${area}" fill="${dataset.fill}" stroke="none"></path>
      <path d="${path}" fill="none" stroke="${dataset.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
    `;
  }).join('');

  const grid = Array.from({ length: 4 }, (_, index) => {
    const y = padding.top + (chartHeight / 3) * index;
    return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#d7e3f1" stroke-dasharray="4 6"></line>`;
  }).join('');

  const xLabels = labels.map((label, index) => {
    const x = padding.left + (chartWidth / Math.max(labels.length - 1, 1)) * index;
    return `<text x="${x}" y="${height - 6}" text-anchor="middle" fill="#73819a" font-size="11">${escapeHtml(label)}</text>`;
  }).join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" class="crm-chart-svg" aria-hidden="true">
      ${grid}
      ${lines}
      ${xLabels}
    </svg>
  `;
}

function resolveSystemBucket(item) {
  if ((item.sistema_actual || '').toLowerCase() === 'fonasa') return 'Fonasa';
  const normalized = normalizeText(item.isapre_especifica || '');
  if (!normalized) return 'Otros';
  if (normalized.includes('banmedica')) return 'Banmédica';
  if (normalized.includes('colmena')) return 'Colmena';
  if (normalized.includes('consalud')) return 'Consalud';
  if (normalized.includes('cruz blanca')) return 'Cruz Blanca';
  if (normalized.includes('esencial')) return 'Esencial';
  if (normalized.includes('nueva masvida') || normalized.includes('masvida')) return 'Nueva Masvida';
  if (normalized.includes('vida tres')) return 'Vida Tres';
  return 'Otros';
}

function buildAppointments(items) {
  return (items || [])
    .filter((item) => item.cita_fecha_hora)
    .map((item) => ({
      ...item,
      rawDate: item.cita_fecha_hora,
      date: new Date(item.cita_fecha_hora),
      status: item.cita_estado,
    }))
    .filter((item) => !Number.isNaN(item.date.getTime()))
    .sort((a, b) => a.date - b.date);
}

function renderTrend(element, current, previous) {
  const delta = previous === 0 ? (current > 0 ? 100 : 0) : (((current - previous) / previous) * 100);
  const rounded = Math.round(delta);
  element.textContent = `${rounded >= 0 ? '+' : ''}${rounded}%`;
  element.classList.toggle('is-positive', rounded >= 0);
  element.classList.toggle('is-negative', rounded < 0);
}

function buildPopoverList(title, rows) {
  return `
    <div class="crm-popover__title">${escapeHtml(title)}</div>
    <div class="crm-popover__list">
      ${
        rows.length
          ? rows.map((row) => `
            <button type="button" class="crm-popover__item" data-lead-id="${row.leadId}">
              <strong>${escapeHtml(row.title)}</strong>
              <span>${escapeHtml(row.meta)}</span>
            </button>
          `).join('')
          : '<p class="crm-muted">Sin movimientos.</p>'
      }
    </div>
  `;
}

function togglePopover(key) {
  const next = state.openPopover === key ? '' : key;
  state.openPopover = next;
  elements.notificationPopover.hidden = next !== 'notification';
  elements.updatesPopover.hidden = next !== 'updates';
  elements.messagesPopover.hidden = next !== 'messages';
}

function hidePopovers() {
  state.openPopover = '';
  elements.notificationPopover.hidden = true;
  elements.updatesPopover.hidden = true;
  elements.messagesPopover.hidden = true;
}

function toggleProfileMenu() {
  setProfileMenu(!state.profileMenuOpen);
}

function setProfileMenu(open) {
  state.profileMenuOpen = open;
  elements.profileMenu.hidden = !open;
  elements.profileWrap.classList.toggle('is-open', open);
}

function openProfileModal() {
  setProfileMenu(false);
  elements.profileNameInput.value = state.profile.name || state.session?.actorEmail || '';
  renderProfilePreview(state.profile.photoDataUrl, state.profile.name || state.session?.actorEmail || 'Asesor');
  elements.profileModal.showModal();
}

function handleProfilePhotoChange() {
  const file = elements.profilePhotoInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    renderProfilePreview(reader.result, elements.profileNameInput.value || state.session?.actorEmail || 'Asesor');
  };
  reader.readAsDataURL(file);
}

function resetProfile() {
  state.profile = {};
  window.localStorage.removeItem(PROFILE_STORAGE);
  elements.profileNameInput.value = state.session?.actorEmail || '';
  elements.profilePhotoInput.value = '';
  applyProfileToUI();
  renderProfilePreview('', state.session?.actorEmail || 'Asesor');
}

function saveProfileChanges() {
  const name = elements.profileNameInput.value.trim();
  const photoDataUrl = elements.profilePreviewPhoto.hidden ? '' : elements.profilePreviewPhoto.src;
  state.profile = { name, photoDataUrl };
  window.localStorage.setItem(PROFILE_STORAGE, JSON.stringify(state.profile));
  applyProfileToUI();
  elements.profileModal.close();
}

function applyProfileToUI() {
  const fallbackName = state.profile.name || state.session?.actorEmail || 'Asesor';
  elements.profileName.textContent = fallbackName;
  elements.sidebarUserName.textContent = fallbackName;
  paintAvatar(elements.profileAvatar, fallbackName);
  paintAvatar(elements.sidebarAvatar, fallbackName);
  toggleAvatarPhoto(elements.profilePhoto, elements.profileAvatar, state.profile.photoDataUrl, fallbackName);
}

function renderProfilePreview(photoDataUrl, name) {
  toggleAvatarPhoto(elements.profilePreviewPhoto, elements.profilePreviewAvatar, photoDataUrl, name);
  paintAvatar(elements.profilePreviewAvatar, name);
}

function toggleAvatarPhoto(imageElement, avatarElement, photoDataUrl, avatarSeed) {
  if (photoDataUrl) {
    imageElement.src = photoDataUrl;
    imageElement.hidden = false;
    avatarElement.hidden = true;
    return;
  }
  imageElement.hidden = true;
  imageElement.removeAttribute('src');
  avatarElement.hidden = false;
  paintAvatar(avatarElement, avatarSeed);
}

function paintAvatar(element, seed) {
  if (!element) return;
  const hue = hashCode(seed || 'PlanesPro') % 360;
  element.style.background = `linear-gradient(135deg, hsl(${hue} 76% 45%), hsl(${(hue + 28) % 360} 78% 66%))`;
  element.innerHTML = '<i class="fas fa-user" aria-hidden="true"></i>';
}

function openFileModal(leadId, leadName, fileName) {
  state.activeFileLeadId = leadId;
  const url = getFileUrl(leadId);
  elements.fileModalTitle.textContent = `${leadName} · ${fileName}`;
  elements.fileModalOpen.href = url;
  elements.fileModalFrame.src = url;
  elements.fileModal.showModal();
}

function closeFileModal() {
  elements.fileModal.close();
  elements.fileModalFrame.src = 'about:blank';
  state.activeFileLeadId = '';
}

function loadProfile() {
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function formatDate(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function normalizeText(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function capitalize(value = '') {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sanitizeRutTyping(value = '') {
  return value.replace(/[^0-9kK.-]/g, '').replace(/,+/g, '');
}

function cleanRut(value = '') {
  return String(value).replace(/[^0-9kK]/g, '').toUpperCase();
}

function formatRut(value = '') {
  const cleaned = cleanRut(value);
  if (cleaned.length < 2) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots}-${dv}`;
}

function isValidRut(value = '') {
  const cleaned = cleanRut(value);
  if (!/^\d{7,8}[0-9K]$/.test(cleaned)) return false;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  return calculateRutDv(body) === dv;
}

function calculateRutDv(body) {
  let sum = 0;
  let multiplier = 2;
  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return String(remainder);
}

function hashCode(value = '') {
  return Math.abs(Array.from(String(value)).reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0));
}
