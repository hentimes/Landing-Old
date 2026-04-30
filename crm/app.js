import {
  isLocalDev,
  LEAD_STATUSES,
  ADMIN_KEY_STORAGE,
  LOCAL_DEV_ADMIN_KEY,
  PROFILE_STORAGE,
  RANGE_OPTIONS,
  ISAPRE_BUCKETS,
} from './config.js';
import {
  addLeadNote,
  archiveLead,
  createLead,
  deleteLead,
  getAdvisorProfile,
  getAvailability,
  getFileUrl,
  getLeadDetail,
  getSession,
  listLeads,
  readAdminKey,
  saveAdminKey,
  updateAppointment,
  updateAdvisorProfile,
  updateAvailability,
  updateLeadRut,
  updateLeadStatus,
} from './api.js';

const SIDEBAR_STORAGE = 'crm-sidebar-collapsed';

const VIEW_META = {
  dashboard: { title: 'Dashboard', crumb: 'Dashboard', copy: 'Métricas, pipeline comercial y agenda del asesor.' },
  leads: { title: 'Leads', crumb: 'Leads', copy: 'Bandeja compacta, seguimiento y acciones comerciales.' },
  agenda: { title: 'Agenda', crumb: 'Agenda', copy: 'Próximas citas, pendientes y agenda inmediata.' },
  profile: { title: 'Profile', crumb: 'Profile', copy: 'Datos visibles del asesor dentro del CRM.' },
  settings: { title: 'Configuración', crumb: 'Configuración', copy: 'Configuración actual del acceso y del panel privado.' },
};

const state = {
  items: [],
  filteredItems: [],
  selectedLeadId: '',
  currentView: 'dashboard',
  session: null,
  selectedRange: '7d',
  profile: loadProfile(),
  openPopover: '',
  profileMenuOpen: false,
  sidebarCollapsed: loadSidebarState(),
  sortBy: 'created',
  sortOrder: 'desc',
  calendarDate: new Date(),
  advisorProfile: null,
  advisorAvailability: [],
  advisorSlots: [],
  advisorBlocks: [],
  advisorBusyIntervals: [],
};

const elements = {
  sidebar: document.getElementById('crm-sidebar'),
  sidebarToggle: document.getElementById('sidebar-toggle'),
  sessionStatus: document.getElementById('session-status'),
  sidebarUserName: document.getElementById('sidebar-user-name'),
  profileName: document.getElementById('profile-name'),
  profileAvatar: document.getElementById('profile-avatar'),
  profilePhoto: document.getElementById('profile-photo'),
  profilePagePhoto: document.getElementById('profile-page-photo'),
  profilePageAvatar: document.getElementById('profile-page-avatar'),
  profilePageName: document.getElementById('profile-page-name'),
  profilePageNameValue: document.getElementById('profile-page-name-value'),
  profilePageAccess: document.getElementById('profile-page-access'),
  profilePageEmail: document.getElementById('profile-page-email'),
  profilePageGoogle: document.getElementById('profile-page-google'),
  profilePageHours: document.getElementById('profile-page-hours'),
  profilePageCalendarCopy: document.getElementById('profile-page-calendar-copy'),
  profileConnectGoogle: document.getElementById('profile-connect-google'),
  profileGoSettings: document.getElementById('profile-go-settings'),
  viewTitle: document.getElementById('view-title'),
  viewCopy: document.querySelector('.crm-page-toolbar__copy'),
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
  createLeadButton: document.getElementById('create-lead-button'),
  leadList: document.getElementById('lead-list'),
  leadCount: document.getElementById('lead-count'),
  leadDetail: document.getElementById('lead-detail'),
  leadDetailEmpty: document.getElementById('lead-detail-empty'),
  leadRowTemplate: document.getElementById('lead-row-template'),
  rangeChips: Array.from(document.querySelectorAll('.crm-range-chip')),
  metricLeads: document.getElementById('tb-metric-leads'),
  metricClosed: document.getElementById('tb-metric-closed'),
  metricProposals: document.getElementById('tb-metric-proposals'),
  metricPending: document.getElementById('tb-metric-pending'),
  trendLeads: document.getElementById('tb-trend-leads'),
  trendClosed: document.getElementById('tb-trend-closed'),
  trendProposals: document.getElementById('tb-trend-proposals'),
  trendPending: document.getElementById('tb-trend-pending'),
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
  availabilitySlots: document.getElementById('availability-slots'),
  busyIntervals: document.getElementById('busy-intervals'),
  availabilityRangeLabel: document.getElementById('availability-range-label'),
  calendarSyncHint: document.getElementById('calendar-sync-hint'),
  leadsMetricNew: document.getElementById('leads-metric-new'),
  leadsMetricContacted: document.getElementById('leads-metric-contacted'),
  leadsMetricAnalysis: document.getElementById('leads-metric-analysis'),
  leadsMetricProposals: document.getElementById('leads-metric-proposals'),
  leadsBoxNew: document.getElementById('leads-metric-box-new'),
  leadsBoxContacted: document.getElementById('leads-metric-box-contacted'),
  leadsBoxAnalysis: document.getElementById('leads-metric-box-analysis'),
  leadsBoxProposals: document.getElementById('leads-metric-box-proposals'),
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
  openProfileEditor: document.getElementById('open-profile-editor'),
  leadCreateModal: document.getElementById('lead-create-modal'),
  leadCreateForm: document.getElementById('lead-create-form'),
  leadCreateClose: document.getElementById('lead-create-close'),
  leadCreateCancel: document.getElementById('lead-create-cancel'),
  leadCreateSubmit: document.getElementById('lead-create-submit'),
  leadCreateName: document.getElementById('lead-create-name'),
  leadCreatePhone: document.getElementById('lead-create-phone'),
  leadCreateEmail: document.getElementById('lead-create-email'),
  leadCreateSystem: document.getElementById('lead-create-system'),
  leadCreateIsapreField: document.getElementById('lead-create-isapre-field'),
  leadCreateIsapre: document.getElementById('lead-create-isapre'),
  leadCreateComuna: document.getElementById('lead-create-comuna'),
  leadCreateFeedback: document.getElementById('lead-create-feedback'),
  settingsGoogleStatus: document.getElementById('settings-google-status'),
  settingsGoogleEmail: document.getElementById('settings-google-email'),
  settingsGoogleUpdated: document.getElementById('settings-google-updated'),
  settingsConnectGoogle: document.getElementById('settings-connect-google'),
  settingsDisplayName: document.getElementById('settings-display-name'),
  settingsTimezone: document.getElementById('settings-timezone'),
  settingsWorkdayStart: document.getElementById('settings-workday-start'),
  settingsWorkdayEnd: document.getElementById('settings-workday-end'),
  settingsSlotDuration: document.getElementById('settings-slot-duration'),
  settingsSlotBuffer: document.getElementById('settings-slot-buffer'),
  settingsAllowBusy: document.getElementById('settings-allow-busy'),
  settingsSaveProfile: document.getElementById('settings-save-profile'),
  settingsAvailabilityGrid: document.getElementById('settings-availability-grid'),
  settingsSaveAvailability: document.getElementById('settings-save-availability'),
  settingsBlockDate: document.getElementById('settings-block-date'),
  settingsBlockStart: document.getElementById('settings-block-start'),
  settingsBlockEnd: document.getElementById('settings-block-end'),
  settingsBlockNote: document.getElementById('settings-block-note'),
  settingsAddBlock: document.getElementById('settings-add-block'),
  settingsAddFullDayBlock: document.getElementById('settings-add-full-day-block'),
  settingsBlockList: document.getElementById('settings-block-list'),
  settingsSaveBlocks: document.getElementById('settings-save-blocks'),
  fileModal: document.getElementById('file-modal'),
  fileModalTitle: document.getElementById('file-modal-title'),
  fileModalClose: document.getElementById('file-modal-close'),
  fileModalFrame: document.getElementById('file-modal-frame'),
  calendarMonthYear: document.getElementById('calendar-month-year'),
  calendarGrid: document.getElementById('calendar-grid'),
  calendarPrev: document.getElementById('prev-month'),
  calendarNext: document.getElementById('next-month'),
  calendarToday: document.getElementById('today-month'),
  calendarDayDetails: document.getElementById('calendar-day-details'),
  selectedDayLabel: document.getElementById('selected-day-label'),
  dayAppointmentsList: document.getElementById('day-appointments-list'),
  dayFreeSlots: document.getElementById('day-free-slots'),
  dayBusySlots: document.getElementById('day-busy-slots'),
  closeDayDetails: document.getElementById('close-details'),
};

init();

function init() {
  hydrateStatusOptions();
  configureAccessMode();
  applySidebarState();
  bindEvents();
  syncLeadCreateSystemField();
  applyProfileToUI();
  hydrateProfileSections();
  setView(state.currentView);
  bootstrap();
}

function bindEvents() {
  if (isLocalDev) {
    elements.saveAdminKey?.addEventListener('click', async () => {
      saveAdminKey(elements.adminKey.value.trim());
      await bootstrap();
    });
  }

  elements.sidebarToggle?.addEventListener('click', () => {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    persistSidebarState();
    applySidebarState();
  });

  elements.navItems.forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));

  elements.rangeChips.forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedRange = button.dataset.range;
      elements.rangeChips.forEach((chip) => chip.classList.toggle('is-active', chip === button));
      refreshDashboard();
      renderLeadsMetrics(filterItemsByRange(state.items, state.selectedRange));
      renderLeadsView();
      renderAgenda();
      refreshAvailabilitySlots();
    });
  });

  elements.applyFilters?.addEventListener('click', renderLeadsView);
  elements.createLeadButton?.addEventListener('click', openLeadCreateModal);
  elements.clearFilters?.addEventListener('click', () => {
    if (elements.filterQ) elements.filterQ.value = '';
    if (elements.filterStatus) elements.filterStatus.value = '';
    if (elements.filterSistema) elements.filterSistema.value = '';
    if (elements.filterIsapre) elements.filterIsapre.value = '';
    if (elements.filterFrom) elements.filterFrom.value = '';
    if (elements.filterTo) elements.filterTo.value = '';
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
    input?.addEventListener('change', renderLeadsView);
  });

  elements.notificationButton?.addEventListener('click', () => togglePopover('notification'));
  elements.updatesButton?.addEventListener('click', () => togglePopover('updates'));
  elements.messagesButton?.addEventListener('click', () => togglePopover('messages'));

  elements.profileTrigger?.addEventListener('click', (event) => {
    event.preventDefault();
    toggleProfileMenu();
  });
  elements.profileMenuProfile?.addEventListener('click', () => {
    setProfileMenu(false);
    setView('profile');
  });
  elements.profileMenuSettings?.addEventListener('click', () => {
    setProfileMenu(false);
    setView('settings');
  });

  elements.profileWrap?.addEventListener('mouseenter', () => setProfileMenu(true));
  elements.profileWrap?.addEventListener('mouseleave', () => setProfileMenu(false));

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.crm-icon-button') && !event.target.closest('.crm-popover')) hidePopovers();
    if (!event.target.closest('.crm-profile-wrap')) setProfileMenu(false);
  });

  elements.profilePhotoInput?.addEventListener('change', handleProfilePhotoChange);
  elements.profileReset?.addEventListener('click', resetProfile);
  elements.profileSave?.addEventListener('click', saveProfileChanges);
  elements.leadCreateClose?.addEventListener('click', closeLeadCreateModal);
  elements.leadCreateCancel?.addEventListener('click', closeLeadCreateModal);
  elements.leadCreateForm?.addEventListener('submit', createLeadFromModal);
  elements.leadCreateSystem?.addEventListener('change', syncLeadCreateSystemField);
  elements.leadCreateModal?.addEventListener('click', (event) => {
    if (event.target === elements.leadCreateModal) closeLeadCreateModal();
  });

  // Calendar navigation
  elements.calendarPrev?.addEventListener('click', () => {
    state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
    renderCalendar();
  });
  elements.calendarNext?.addEventListener('click', () => {
    state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
    renderCalendar();
  });
  elements.calendarToday?.addEventListener('click', () => {
    state.calendarDate = new Date();
    renderCalendar();
  });
  elements.closeDayDetails?.addEventListener('click', () => {
    elements.calendarDayDetails.hidden = true;
  });

  elements.openProfileEditor?.addEventListener('click', openProfileModal);
  elements.profileConnectGoogle?.addEventListener('click', connectGoogleCalendar);
  elements.profileGoSettings?.addEventListener('click', () => setView('settings'));
  elements.settingsConnectGoogle?.addEventListener('click', connectGoogleCalendar);
  elements.settingsSaveProfile?.addEventListener('click', saveAdvisorSettings);
  elements.settingsSaveAvailability?.addEventListener('click', saveAdvisorAvailability);
  elements.settingsAddBlock?.addEventListener('click', appendManualBlockFromForm);
  elements.settingsAddFullDayBlock?.addEventListener('click', appendFullDayBlockFromForm);
  elements.settingsSaveBlocks?.addEventListener('click', saveAdvisorBlocks);

  elements.fileModalClose?.addEventListener('click', closeFileModal);
  elements.fileModal?.addEventListener('click', (event) => {
    if (!event.target.closest('.crm-file-modal__card')) closeFileModal();
  });

  document.querySelectorAll('.crm-sort-header').forEach((header) => {
    header.addEventListener('click', () => {
      const field = header.dataset.sort;
      if (state.sortBy === field) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortBy = field;
        state.sortOrder = 'asc';
      }
      renderLeadsView();
    });
  });
  
  elements.leadsBoxNew?.addEventListener('click', () => quickFilterByStatus('Nuevo'));
  elements.leadsBoxContacted?.addEventListener('click', () => quickFilterByStatus('Contactado'));
  elements.leadsBoxAnalysis?.addEventListener('click', () => quickFilterByStatus('En analisis'));
  elements.leadsBoxProposals?.addEventListener('click', () => quickFilterByStatus('Propuesta enviada'));

  if (isLocalDev) {
    window.addEventListener('storage', (event) => {
      if (event.key === ADMIN_KEY_STORAGE) elements.adminKey.value = readAdminKey();
    });
  }
}

function configureAccessMode() {
  if (isLocalDev) {
    const currentKey = readAdminKey() || LOCAL_DEV_ADMIN_KEY;
    saveAdminKey(currentKey);
    elements.adminKey.value = currentKey;
    elements.adminKeyBox.hidden = false;
  } else {
    elements.adminKeyBox.hidden = true;
  }
}

function setView(view) {
  state.currentView = view;
  elements.navItems.forEach((item) => item.classList.toggle('is-active', item.dataset.view === view));
  elements.viewPanels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.viewPanel === view));
  const meta = VIEW_META[view] || { title: 'CRM', crumb: 'CRM', copy: '' };
  if (elements.viewTitle) elements.viewTitle.textContent = meta.title;
  if (elements.topbarActiveView) elements.topbarActiveView.textContent = meta.crumb;
  if (elements.viewCopy) elements.viewCopy.textContent = meta.copy;
}

async function bootstrap() {
  try {
    state.session = await getSession();

    const displayName = state.profile.name || state.session.actorEmail || 'Asesor';
    elements.sessionStatus.textContent = state.session.actorEmail || 'Acceso OK';
    elements.sidebarUserName.textContent = displayName;
    applyProfileToUI();
    hydrateProfileSections();
    await loadLeads();
    await loadAdvisorWorkspace();
  } catch (error) {
    elements.sessionStatus.textContent = error.message;
    renderDashboard([]);
    renderAgenda([]);
    renderList([]);
    renderDetail(null, error.message);
  }
}

async function loadLeads(skipFetch = false) {
  try {
    if (!skipFetch) {
      const payload = await listLeads({ limit: 300 });
      state.items = payload.items || [];
    }
    state.filteredItems = applyLeadFilters(state.items);
    refreshDashboard();
    renderLeadsMetrics(filterItemsByRange(state.items, state.selectedRange));
    renderLeadsView();
    renderAgenda();

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

async function loadAdvisorWorkspace() {
  try {
    const profilePayload = await getAdvisorProfile();
    state.advisorProfile = profilePayload;
    hydrateAdvisorUI();
    await refreshAvailabilitySlots();
  } catch (error) {
    if (elements.calendarSyncHint) elements.calendarSyncHint.textContent = error.message;
  }
}

async function refreshAvailabilitySlots() {
  try {
    const { from, to } = getSelectedRangeWindow();
    const payload = await getAvailability({ from, to });
    state.advisorAvailability = payload.rules || [];
    state.advisorSlots = payload.slots || [];
    state.advisorBlocks = payload.blocks || [];
    state.advisorBusyIntervals = payload.busy_intervals || [];
    if (state.advisorProfile) state.advisorProfile.blocks = payload.blocks || [];
    hydrateAdvisorUI();
  } catch (error) {
    state.advisorSlots = [];
    state.advisorBlocks = [];
    state.advisorBusyIntervals = [];
    if (elements.availabilitySlots) {
      elements.availabilitySlots.innerHTML = `<p class="crm-muted">${escapeHtml(error.message)}</p>`;
    }
  }
}

function renderLeadsView() {
  state.filteredItems = applyLeadFilters(state.items);
  
  // Sort
  state.filteredItems.sort((a, b) => {
    let valA = a[state.sortBy];
    let valB = b[state.sortBy];
    
    if (state.sortBy === 'created') {
      valA = new Date(a.created_at || 0).getTime();
      valB = new Date(b.created_at || 0).getTime();
    }

    if (state.sortBy === 'sistema') {
      valA = normalizeText(a.isapre_especifica || a.sistema_actual || '');
      valB = normalizeText(b.isapre_especifica || b.sistema_actual || '');
    }

    if (state.sortBy === 'file') {
      valA = a.has_file ? 1 : 0;
      valB = b.has_file ? 1 : 0;
    }
    
    if (valA < valB) return state.sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return state.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Header & Search merging
  elements.leadCount.textContent = `${state.filteredItems.length} leads captados`;
  renderLeadsMetrics(state.items);
  renderList(state.filteredItems);
}

function renderLeadsMetrics(items = []) {
  if (!elements.leadsMetricNew) return;
  
  const countNew = items.filter(i => i.status === 'Nuevo').length;
  const countContacted = items.filter(i => i.status === 'Contactado').length;
  const countAnalysis = items.filter(i => i.status === 'En analisis').length;
  const countProposals = items.filter(i => i.status === 'Propuesta enviada').length;
  
  elements.leadsMetricNew.textContent = String(countNew);
  elements.leadsMetricContacted.textContent = String(countContacted);
  elements.leadsMetricAnalysis.textContent = String(countAnalysis);
  elements.leadsMetricProposals.textContent = String(countProposals);
}

function quickFilterByStatus(status) {
  if (elements.filterStatus) {
    elements.filterStatus.value = status;
    renderLeadsView();
  }
}

function refreshDashboard() {
  const rangeItems = filterItemsByRange(state.items, state.selectedRange);
  const previousItems = filterItemsByPreviousRange(state.items, state.selectedRange);
  renderDashboard(rangeItems, previousItems);
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

  renderDonut(ISAPRE_BUCKETS.map((label) => ({
    label,
    count: items.filter((item) => resolveSystemBucket(item) === label).length,
  })));

  const statuses = LEAD_STATUSES
    .map((label) => ({ label, count: items.filter((item) => item.status === label).length }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count);

  elements.statusBreakdown.innerHTML = statuses.length
    ? statuses.map((entry) => renderStatusRow(entry.label, entry.count, totalLeads || 1)).join('')
    : '<p class="crm-muted">Sin movimientos para el periodo seleccionado.</p>';

  hydratePopovers(items);
}

function renderStatusRow(label, count, total) {
  const percent = Math.round((count / total) * 100);
  const normalized = normalizeText(label);
  let icon = 'fa-circle';
  let colorClass = 'neutral';

  if (normalized.includes('completado') || normalized.includes('cerrado')) {
    icon = 'fa-check-double'; colorClass = 'success';
  } else if (normalized.includes('contactado') || normalized.includes('propuesta')) {
    icon = 'fa-phone-alt'; colorClass = 'info';
  } else if (normalized.includes('analisis') || normalized.includes('evaluacion')) {
    icon = 'fa-microscope'; colorClass = 'warning';
  } else if (normalized.includes('nuevo') || normalized.includes('contactar')) {
    icon = 'fa-star'; colorClass = 'new';
  } else if (normalized.includes('pendiente') || normalized.includes('espera')) {
    icon = 'fa-clock'; colorClass = 'pending';
  }

  return `
    <div class="crm-status-row">
      <div class="crm-status-row__main">
        <i class="fas ${icon} crm-status-icon--${colorClass}"></i>
        <span class="crm-status-row__label">${escapeHtml(label)}</span>
      </div>
      <div class="crm-status-row__data">
        <div class="crm-status-row__bar-wrap">
          <div class="crm-status-row__bar crm-status-row__bar--${colorClass}" style="width: ${percent}%"></div>
        </div>
        <span class="crm-status-row__count"><strong>${count}</strong></span>
        <span class="crm-status-row__percent">${percent}%</span>
      </div>
    </div>
  `;
}

function renderAgenda(items = state.items) {
  const appointments = buildAppointments(filterAppointmentItemsByRange(items, state.selectedRange));
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  elements.agendaCountTotal.textContent = String(appointments.length);
  elements.agendaCountToday.textContent = String(appointments.filter((item) => item.rawDate.slice(0, 10) === todayIso).length);
  elements.agendaCountPending.textContent = String(appointments.filter((item) => !item.status || ['Pendiente', 'Por coordinar'].includes(item.status)).length);
  elements.agendaCountUpcoming.textContent = String(appointments.filter((item) => item.date >= now && item.date <= nextWeek).length);

  renderCalendar();
  renderAgendaTable(appointments);
  renderAvailabilitySlots();
}

function renderAvailabilitySlots() {
  if (!elements.availabilitySlots) return;
  const slots = state.advisorSlots || [];
  const rangeLabel = RANGE_OPTIONS[state.selectedRange]?.label || 'Periodo';
  if (elements.availabilityRangeLabel) {
    elements.availabilityRangeLabel.textContent = `Bloques · ${rangeLabel}`;
  }

  if (!slots.length) {
    elements.availabilitySlots.innerHTML = '<p class="crm-muted">No hay bloques libres para el rango seleccionado.</p>';
  } else {
    elements.availabilitySlots.innerHTML = slots.slice(0, 18).map((slot) => `
      <div class="crm-slot-card">
        <strong>${escapeHtml(slot.label || '')}</strong>
        <span>${escapeHtml(slot.starts_at?.slice(11, 16) || '')} - ${escapeHtml(slot.ends_at?.slice(11, 16) || '')}</span>
      </div>
    `).join('');
  }

  renderBusyIntervals();
}

function renderBusyIntervals() {
  if (!elements.busyIntervals) return;
  const intervals = (state.advisorBusyIntervals || [])
    .slice()
    .sort((a, b) => Number(a.startMs || 0) - Number(b.startMs || 0));

  if (!intervals.length) {
    elements.busyIntervals.innerHTML = '<p class="crm-muted">No hay horas ocupadas registradas para el rango.</p>';
    return;
  }

  elements.busyIntervals.innerHTML = intervals.slice(0, 18).map((item) => `
    <div class="crm-slot-card crm-slot-card--busy">
      <strong>${escapeHtml(formatDateTime(item.starts_at || ''))}</strong>
      <span>${escapeHtml((item.starts_at || '').slice(11, 16))} - ${escapeHtml((item.ends_at || '').slice(11, 16))}</span>
      <small>${escapeHtml(resolveBusySourceLabel(item))}</small>
    </div>
  `).join('');
}

function resolveBusySourceLabel(item = {}) {
  if (item.source === 'manual') return item.note || 'Bloqueo manual';
  if (item.source === 'google') return item.note || 'Google Calendar';
  return item.note || 'Cita del CRM';
}

function renderCalendar() {
  const year = state.calendarDate.getFullYear();
  const month = state.calendarDate.getMonth();
  
  const monthName = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(state.calendarDate);
  elements.calendarMonthYear.textContent = monthName;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const appointments = buildAppointments(filterAppointmentItemsByRange(state.items, state.selectedRange));
  
  let html = '';
  // Padding days
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="crm-calendar-day crm-calendar-day--other"></div>';
  }

  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const dayIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayAppointments = appointments.filter(a => a.rawDate.slice(0, 10) === dayIso);
    const todayClass = (isCurrentMonth && today.getDate() === d) ? 'crm-calendar-day--today' : '';
    
    const eventsHtml = dayAppointments.map((appt) => {
      const statusClass = calendarStatusClass(appt.status || '');
      const label = calendarEventLabel(appt);
      return `
        <div class="calendar-event calendar-event--${statusClass}" title="${escapeHtml(label)}">
          ${escapeHtml(label)}
        </div>
      `;
    }).join('');

    html += `
      <div class="crm-calendar-day ${todayClass}" onclick="handleCalendarDayClick('${dayIso}')">
        <span class="day-number">${d}</span>
        <div class="crm-calendar-events">${eventsHtml}</div>
      </div>
    `;
  }

  elements.calendarGrid.innerHTML = html;
}

function calendarEventLabel(appointment) {
  const name = appointment.nombre || 'Cita';
  const time = appointment.date && !Number.isNaN(appointment.date.getTime())
    ? new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' }).format(appointment.date)
    : '';
  return time ? `${time} · ${name}` : name;
}

function calendarStatusClass(status) {
  const normalized = normalizeText(status);
  if (!normalized) return 'pending';
  if (normalized.includes('cancel')) return 'cancelada';
  if (normalized.includes('agend') || normalized.includes('confirm')) return 'agendada';
  if (normalized.includes('pend') || normalized.includes('coord')) return 'pendiente';
  return 'pending';
}

function renderCalendarDaySlots(dayIso) {
  if (elements.dayFreeSlots) {
    const selectedLead = state.items.find((item) => item.id === state.selectedLeadId) || null;
    const freeSlots = (state.advisorSlots || []).filter((slot) => String(slot.starts_at || '').slice(0, 10) === dayIso);
    const selectedLeadCopy = selectedLead
      ? `<p class="crm-muted crm-slot-context">Lead seleccionado: <strong>${escapeHtml(selectedLead.nombre || selectedLead.email || selectedLead.telefono || 'Sin nombre')}</strong></p>`
      : '<p class="crm-muted crm-slot-context">Abre un lead desde la bandeja para usar estos bloques y agendar desde la agenda.</p>';
    elements.dayFreeSlots.innerHTML = freeSlots.length
      ? `${selectedLeadCopy}${freeSlots.map((slot) => `
        <div class="crm-slot-card">
          <strong>${escapeHtml((slot.starts_at || '').slice(11, 16))}</strong>
          <span>${escapeHtml((slot.starts_at || '').slice(11, 16))} - ${escapeHtml((slot.ends_at || '').slice(11, 16))}</span>
          <div class="crm-slot-card__actions">
            <button
              type="button"
              class="button button--secondary button--compact crm-slot-action"
              data-slot-start="${escapeHtml(slot.starts_at || '')}"
              ${selectedLead ? '' : 'disabled'}
            >
              ${selectedLead?.cita_fecha_hora ? 'Reprogramar lead abierto' : 'Agendar lead abierto'}
            </button>
            <button
              type="button"
              class="button button--ghost button--compact crm-slot-block"
              data-slot-start="${escapeHtml(slot.starts_at || '')}"
              data-slot-end="${escapeHtml(slot.ends_at || '')}"
            >
              Bloquear
            </button>
          </div>
        </div>
      `).join('')}`
      : '<p class="crm-muted">Sin bloques libres para este día.</p>';
  }

  if (elements.dayBusySlots) {
    const busySlots = (state.advisorBusyIntervals || [])
      .filter((item) => String(item.starts_at || '').slice(0, 10) === dayIso)
      .sort((a, b) => Number(a.startMs || 0) - Number(b.startMs || 0));
    elements.dayBusySlots.innerHTML = busySlots.length
      ? busySlots.map((item) => `
        <div class="crm-slot-card crm-slot-card--busy">
          <strong>${escapeHtml((item.starts_at || '').slice(11, 16))}</strong>
          <span>${escapeHtml((item.starts_at || '').slice(11, 16))} - ${escapeHtml((item.ends_at || '').slice(11, 16))}</span>
          <small>${escapeHtml(resolveBusySourceLabel(item))}</small>
          <div class="crm-slot-card__actions">
            ${item.lead_id
              ? `<button type="button" class="button button--ghost button--compact crm-busy-open" data-lead-id="${escapeHtml(item.lead_id)}">Abrir lead</button>`
              : ''}
            ${item.source === 'manual'
              ? `<button type="button" class="button button--ghost button--compact crm-busy-release" data-block-id="${escapeHtml(item.id || '')}">Liberar</button>`
              : ''}
          </div>
        </div>
      `).join('')
      : '<p class="crm-muted">Sin horas ocupadas registradas.</p>';
  }

  bindCalendarSlotActions(dayIso);
}

function bindCalendarSlotActions(dayIso) {
  elements.dayFreeSlots?.querySelectorAll('.crm-slot-action').forEach((button) => {
    button.addEventListener('click', async () => {
      const lead = state.items.find((item) => item.id === state.selectedLeadId);
      if (!lead) {
        window.alert('Primero abre un lead desde la bandeja.');
        return;
      }

      const slotStart = button.dataset.slotStart || '';
      if (!slotStart) return;

      button.disabled = true;
      try {
        await updateAppointment(lead.id, {
          action: lead.cita_fecha_hora ? 'reschedule' : 'create',
          cita_fecha_hora: slotStart,
          cita_estado: 'Agendada',
        });
        await loadLeads();
        await loadLeadDetail(lead.id);
        window.handleCalendarDayClick(dayIso);
      } catch (error) {
        window.alert(error.message || 'No se pudo agendar la cita');
      } finally {
        button.disabled = false;
      }
    });
  });

  elements.dayFreeSlots?.querySelectorAll('.crm-slot-block').forEach((button) => {
    button.addEventListener('click', async () => {
      const startsAt = button.dataset.slotStart || '';
      const endsAt = button.dataset.slotEnd || '';
      if (!startsAt || !endsAt) return;

      button.disabled = true;
      try {
        await persistAdvisorBlocks([
          ...(state.advisorBlocks || []),
          {
            id: window.crypto?.randomUUID?.() || `block-${Date.now()}`,
            starts_at: startsAt,
            ends_at: endsAt,
            block_type: 'manual',
            note: 'Bloqueado desde agenda',
          },
        ]);
        window.handleCalendarDayClick(dayIso);
      } catch (error) {
        window.alert(error.message || 'No se pudo bloquear el horario');
      } finally {
        button.disabled = false;
      }
    });
  });

  elements.dayBusySlots?.querySelectorAll('.crm-busy-open').forEach((button) => {
    button.addEventListener('click', async () => {
      setView('leads');
      await loadLeadDetail(button.dataset.leadId);
    });
  });

  elements.dayBusySlots?.querySelectorAll('.crm-busy-release').forEach((button) => {
    button.addEventListener('click', async () => {
      const blockId = button.dataset.blockId || '';
      if (!blockId) return;

      button.disabled = true;
      try {
        await persistAdvisorBlocks((state.advisorBlocks || []).filter((block) => block.id !== blockId));
        window.handleCalendarDayClick(dayIso);
      } catch (error) {
        window.alert(error.message || 'No se pudo liberar el bloqueo');
      } finally {
        button.disabled = false;
      }
    });
  });
}

window.handleCalendarDayClick = (dayIso) => {
  const appointments = buildAppointments(filterAppointmentItemsByRange(state.items, state.selectedRange));
  const dayAppointments = appointments.filter(a => a.rawDate.slice(0, 10) === dayIso);
  const dateObj = new Date(`${dayIso}T12:00:00`);
  const dateLabel = new Intl.DateTimeFormat('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).format(dateObj);

  elements.selectedDayLabel.textContent = dateLabel;
  elements.calendarDayDetails.hidden = false;

  if (dayAppointments.length === 0) {
    elements.dayAppointmentsList.innerHTML = '<p class="crm-muted">Sin citas para este día.</p>';
  } else {
    elements.dayAppointmentsList.innerHTML = dayAppointments.map(renderAppointmentItem).join('');
    bindAgendaClicks();
  }

  renderCalendarDaySlots(dayIso);
};

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
    if (item.id === state.selectedLeadId) node.classList.add('is-active');

    const avatar = node.querySelector('[data-field="avatar"]');
    paintAvatar(avatar, item.nombre || item.email || item.telefono || item.id);
    
    // Nombre + RUT Icon
    const nameNode = node.querySelector('[data-field="nombre"]');
    const rutIcon = item.rut ? ' <i class="fas fa-address-card crm-rut-icon" title="RUT registrado"></i>' : '';
    nameNode.innerHTML = `${escapeHtml(item.nombre || 'Sin nombre')}${rutIcon}`;
    
    node.querySelector('[data-field="contacto"]').textContent = [item.telefono, item.email].filter(Boolean).join(' · ') || 'Sin contacto';
    // Sistema / Isapre flip (Nombre Isapre arriba, Tipo abajo)
    const systemName = item.isapre_especifica || item.sistema_actual || 'Sin dato';
    const systemType = item.isapre_especifica ? (item.sistema_actual || 'Isapre') : (item.sistema_actual || '');
    node.querySelector('[data-field="sistema"]').textContent = systemName;
    node.querySelector('[data-field="isapre"]').textContent = systemType;
    
    const statusNode = node.querySelector('[data-field="status"]');
    statusNode.textContent = (item.status || 'Sin estado').slice(0, 12);
    statusNode.className = `crm-badge ${statusBadgeClass(item.status)}`;
    node.querySelector('[data-field="created"]').textContent = formatDate(item.created_at);
    node.querySelector('[data-field="region"]').textContent = item.region || 'Sin región';

    const attachButton = node.querySelector('[data-field="attach"]');
    const hasAttachment = Boolean(item.has_file && item.pdf_object_key);
    attachButton.hidden = !hasAttachment;
    attachButton.disabled = !hasAttachment;
    attachButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (hasAttachment) openFileModal(item.id, item.nombre || 'Lead', item.pdf_original_name || 'Adjunto');
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
      ? `<div class="crm-empty__message"><h3>Error</h3><p>${escapeHtml(errorMessage)}</p></div>`
      : '<div class="crm-empty__message"><h3>Selecciona un lead</h3><p>Aquí verás datos, notas, agenda y acciones operativas del contacto elegido.</p></div>';
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
    <div class="crm-detail-layout-grid">
      <div class="crm-detail-main-col">
        ${renderCommentCard(lead)}
        ${renderNotesCard(notes)}
        ${renderEventsCard(events)}
      </div>
      <div class="crm-detail-side-col">
        ${renderInfoCard(lead)}
        ${renderRutCard(lead)}
        ${renderActionsCard(lead)}
        ${renderAppointmentCard(lead)}
      </div>
    </div>
  `;

  bindDetailActions(lead);
}

function renderDetailHeader(lead) {
  const meta = [
    lead.comuna || '',
    lead.region || '',
    lead.created_at ? `Ingreso ${formatDateTime(lead.created_at)}` : '',
  ].filter(Boolean).join(' · ');
  return `
    <div class="crm-detail-summary">
      <div class="crm-detail-summary__identity">
        <div class="crm-avatar crm-avatar--detail" id="detail-avatar"></div>
        <div>
          <h2>${escapeHtml(lead.nombre || 'Sin nombre')}</h2>
          ${meta ? `<p class="crm-detail-summary__meta">${escapeHtml(meta)}</p>` : ''}
          <div class="crm-chip-row crm-chip-row--compact">
            ${lead.rut ? `<span class="crm-chip crm-chip--accent"><i class="fas fa-id-card"></i> ${escapeHtml(formatRut(lead.rut))}</span>` : ''}
            ${lead.telefono ? `<span class="crm-chip"><i class="fas fa-phone"></i> ${escapeHtml(lead.telefono)}</span>` : ''}
            ${lead.email ? `<span class="crm-chip"><i class="fas fa-envelope"></i> ${escapeHtml(lead.email)}</span>` : ''}
            ${lead.sistema_actual ? `<span class="crm-chip crm-chip--outline">${escapeHtml(lead.sistema_actual)}</span>` : ''}
            ${lead.isapre_especifica ? `<span class="crm-chip">${escapeHtml(lead.isapre_especifica)}</span>` : ''}
          </div>
        </div>
      </div>
      <div class="crm-detail-summary__side">
        <span class="crm-badge ${statusBadgeClass(lead.status)}">${escapeHtml(lead.status || 'Sin estado')}</span>
      </div>
    </div>
  `;
}

function bindDetailActions(lead) {
  paintAvatar(document.getElementById('detail-avatar'), lead.nombre || lead.email || lead.telefono || lead.id);

  const statusSelect = document.getElementById('lead-status');
  const saveStatusButton = document.getElementById('save-status');
  const archiveButton = document.getElementById('archive-lead');
  const deleteButton = document.getElementById('delete-lead');
  const noteForm = document.getElementById('note-form');
  const noteText = document.getElementById('note-text');
  const rutInput = document.getElementById('lead-rut');
  const saveRutButton = document.getElementById('save-rut');
  const rutFeedback = document.getElementById('rut-feedback');
  const appointmentDay = document.getElementById('lead-appointment-day');
  const appointmentTime = document.getElementById('lead-appointment-time');
  const saveAppointmentButton = document.getElementById('save-appointment');
  const cancelAppointmentButton = document.getElementById('cancel-appointment');
  const appointmentGroups = buildLeadAppointmentSlotGroups(lead);

  if (appointmentDay) {
    const currentStart = String(lead.cita_fecha_hora || '').trim();
    const initialDay = currentStart ? normalizeLocalDateTime(currentStart).slice(0, 10) : appointmentGroups[0]?.day;
    populateLeadAppointmentTimes(appointmentGroups, initialDay, currentStart ? normalizeLocalDateTime(currentStart) : '');
    appointmentDay.value = appointmentGroups.some((group) => group.day === initialDay) ? initialDay : (appointmentGroups[0]?.day || '');
    appointmentDay.addEventListener('change', () => {
      populateLeadAppointmentTimes(appointmentGroups, appointmentDay.value);
    });
  }

  saveAppointmentButton?.addEventListener('click', async () => {
    const selectedSlot = appointmentTime?.value || '';
    if (!selectedSlot) {
      window.alert('Selecciona un bloque válido para la cita.');
      return;
    }

    saveAppointmentButton.disabled = true;
    if (cancelAppointmentButton) cancelAppointmentButton.disabled = true;
    try {
      await updateAppointment(lead.id, {
        action: lead.cita_fecha_hora ? 'reschedule' : 'create',
        cita_fecha_hora: selectedSlot,
        cita_estado: 'Agendada',
      });
      await loadLeads();
      await loadLeadDetail(lead.id);
    } catch (error) {
      window.alert(error.message || 'No se pudo guardar la cita');
    } finally {
      saveAppointmentButton.disabled = false;
      if (cancelAppointmentButton) cancelAppointmentButton.disabled = false;
    }
  });

  cancelAppointmentButton?.addEventListener('click', async () => {
    cancelAppointmentButton.disabled = true;
    if (saveAppointmentButton) saveAppointmentButton.disabled = true;
    try {
      await updateAppointment(lead.id, { action: 'cancel', cita_estado: 'Cancelada' });
      await loadLeads();
      await loadLeadDetail(lead.id);
    } catch (error) {
      window.alert(error.message || 'No se pudo cancelar la cita');
    } finally {
      cancelAppointmentButton.disabled = false;
      if (saveAppointmentButton) saveAppointmentButton.disabled = false;
    }
  });

  rutInput?.addEventListener('input', () => {
    rutInput.value = sanitizeRutTyping(rutInput.value);
    rutFeedback.textContent = '';
    rutInput.classList.remove('is-invalid');
  });

  rutInput?.addEventListener('blur', () => {
    rutInput.value = formatRut(rutInput.value);
    if (rutInput.value.trim() && !isValidRut(rutInput.value)) {
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
    const reason = window.prompt('Motivo de archivado:', '');
    if (reason === null) return;
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

  deleteButton?.addEventListener('click', async () => {
    const confirmed = window.confirm('Esto eliminará el lead, sus notas, su adjunto y su cita. ¿Continuar?');
    if (!confirmed) return;
    deleteButton.disabled = true;
    try {
      await deleteLead(lead.id);
      state.selectedLeadId = '';
      await loadLeads();
      renderDetail(null);
    } catch (error) {
      window.alert(error.message || 'No se pudo eliminar el lead');
      deleteButton.disabled = false;
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

  document.querySelectorAll('.crm-card--collapsible .crm-card__header').forEach((header) => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('is-collapsed');
    });
  });
}

function renderInfoCard(lead) {
  const data = [
    ['Correo', lead.email || 'Sin correo'],
    ['Teléfono', lead.telefono || 'Sin teléfono'],
    ['RUT', lead.rut ? formatRut(lead.rut) : 'Sin RUT'],
    ['Edad', lead.rango_edad || 'Sin dato'],
    ['Comuna', lead.comuna || 'Sin dato'],
    ['Región', lead.region || 'Sin dato'],
    ['Sistema', lead.sistema_actual || 'Sin dato'],
    ['Isapre', lead.isapre_especifica || 'Sin dato'],
    ['Cargas', lead.num_cargas || 'Sin dato'],
    ['Edad cargas', lead.edad_cargas || 'Sin dato'],
    ['Renta', lead.rango_renta || 'Sin dato'],
    ['Creado', formatDateTime(lead.created_at)],
  ];
  
  const rows = data.map(([label, value]) => `
      <div class="crm-kv crm-kv--compact">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `).join('');

  return `
    <div class="crm-card crm-card--compact-data">
      <div class="crm-card__header">
        <h3>Datos del lead</h3>
      </div>
      <div class="crm-kv-grid crm-kv-grid--dense">${rows}</div>
    </div>
  `;
}

function renderCommentCard(lead) {
  const hasComment = !!lead.comentarios;
  return `
    <div class="crm-card crm-card--comment-compact crm-card--collapsible ${!hasComment ? 'is-collapsed' : ''}">
      <div class="crm-card__header">
        <h3>Comentario del lead</h3>
      </div>
      <div class="crm-comment-box-compact">
        <p class="crm-long-text-compact">${escapeHtml(lead.comentarios || 'Sin comentario adicional.')}</p>
      </div>
    </div>
  `;
}

function renderNotesCard(notes = []) {
  const notesHtml = notes.length
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

  return `
    <div class="crm-card crm-card--detail-wide crm-card--collapsible">
      <div class="crm-card__header">
        <h3>Notas internas</h3>
      </div>
      <form id="note-form" class="crm-note-form">
        <textarea id="note-text" rows="2" placeholder="Registrar seguimiento comercial..."></textarea>
        <button type="submit" class="button button--primary button--compact">Guardar nota</button>
      </form>
      <div class="crm-note-list">${notesHtml}</div>
    </div>
  `;
}

function renderEventsCard(events = []) {
  const eventsHtml = events.length
    ? events.map((event) => `
      <article class="crm-event">
        <strong>${escapeHtml(event.event_type)}</strong>
        <span>${formatDateTime(event.created_at)} · ${escapeHtml(event.actor_email)}</span>
      </article>
    `).join('')
    : '<p class="crm-muted">Sin eventos registrados.</p>';

  return `
    <div class="crm-card crm-card--detail-wide crm-card--collapsible is-collapsed">
      <div class="crm-card__header">
        <h3>Historial</h3>
      </div>
      <div class="crm-event-list">${eventsHtml}</div>
    </div>
  `;
}

function renderRutCard(lead) {
  if (lead.rut) return '';
  const rut = formatRut(lead.rut || '');
  return `
    <div class="crm-card crm-card--highlight">
      <div class="crm-card__header">
        <h3>Completar RUT</h3>
      </div>
      <div class="crm-actions">
        <p class="crm-rut-help">Este lead no tiene RUT registrado. Ingrésalo para completar el perfil.</p>
        <label>
          <input id="lead-rut" type="text" inputmode="text" autocomplete="off" placeholder="12.345.678-5" value="${escapeHtml(rut)}" />
        </label>
        <div class="crm-actions__buttons crm-mt-10">
          <button type="button" id="save-rut" class="button button--secondary button--compact">Guardar RUT</button>
          <small id="rut-feedback" class="crm-inline-feedback"></small>
        </div>
      </div>
    </div>
  `;
}

function renderActionsCard(lead) {
  const options = LEAD_STATUSES.map((status) => `<option value="${escapeHtml(status)}" ${lead.status === status ? 'selected' : ''}>${escapeHtml(status)}</option>`).join('');
  return `
    <div class="crm-card">
      <div class="crm-card__header">
        <h3>Acciones</h3>
      </div>
      <div class="crm-actions">
        <label>
          <span>Estado</span>
          <select id="lead-status">${options}</select>
        </label>
        <div class="crm-actions__buttons">
          <button type="button" id="save-status" class="button button--primary">Guardar estado</button>
          <button type="button" id="archive-lead" class="button button--ghost">Archivar</button>
          <button type="button" id="delete-lead" class="button button--ghost">Eliminar</button>
        </div>
      </div>
    </div>
  `;
}

function renderAppointmentCard(lead) {
  const appointmentDate = lead.cita_fecha_hora ? formatDateTime(lead.cita_fecha_hora) : 'Sin fecha agendada';
  const appointmentStatus = lead.cita_estado || 'Pendiente';
  const isCanceled = normalizeText(appointmentStatus).includes('cancel');
  const preference = normalizeContactPreference(lead.contacto_preferencia || '');
  const groups = buildLeadAppointmentSlotGroups(lead);
  const appointmentLink = lead.cita_calendar_url
    ? `<a href="${escapeHtml(lead.cita_calendar_url)}" target="_blank" rel="noopener noreferrer">Abrir en Google Calendar</a>`
    : '<span class="crm-muted">Sin enlace de calendario todavía.</span>';

  return `
    <div class="crm-card">
      <div class="crm-card__header">
        <h3>Agenda / cita</h3>
      </div>
      <div class="crm-kv-grid crm-kv-grid--single">
        <div class="crm-kv">
          <span>Preferencia</span>
          <strong>${escapeHtml(preference === 'agendar_reunion' ? 'Agendar reunión' : 'Lo antes posible')}</strong>
        </div>
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
      <div class="crm-actions crm-actions--appointment">
        <div class="crm-actions__intro">
          <strong>${lead.cita_fecha_hora && !isCanceled ? 'Reprogramar o mover cita' : 'Crear cita desde el CRM'}</strong>
          <small>Slots reales del rango actual (${escapeHtml(RANGE_OPTIONS[state.selectedRange]?.label || '7d')}) con regla 45 min + 15 min.</small>
        </div>
        <div class="crm-form-grid crm-form-grid--two">
          <label class="crm-field">
            <span>Día</span>
            <select id="lead-appointment-day" ${groups.length ? '' : 'disabled'}>
              ${groups.length
                ? groups.map((group, index) => `<option value="${escapeHtml(group.day)}" ${index === 0 ? 'selected' : ''}>${escapeHtml(group.label)}</option>`).join('')
                : '<option value="">Sin días disponibles</option>'}
            </select>
          </label>
          <label class="crm-field">
            <span>Hora</span>
            <select id="lead-appointment-time" ${groups.length ? '' : 'disabled'}></select>
          </label>
        </div>
        <p id="lead-appointment-help" class="crm-muted crm-appointment-help">
          ${groups.length
            ? 'Solo se muestran horas libres. Cambia el rango superior si necesitas ver más días.'
            : 'No hay slots libres en este rango. Ajusta la disponibilidad o cambia el rango de agenda.'}
        </p>
        <div class="crm-actions__buttons">
          <button type="button" id="save-appointment" class="button button--primary" ${groups.length ? '' : 'disabled'}>
            ${lead.cita_fecha_hora && !isCanceled ? 'Reprogramar cita' : 'Agendar cita'}
          </button>
          ${lead.cita_fecha_hora && !isCanceled
            ? '<button type="button" id="cancel-appointment" class="button button--ghost">Cancelar cita</button>'
            : ''}
        </div>
      </div>
    </div>
  `;
}

function buildLeadAppointmentSlotGroups(lead) {
  const grouped = new Map();
  const slots = Array.isArray(state.advisorSlots) ? state.advisorSlots.slice() : [];

  slots.forEach((slot) => {
    const day = String(slot.starts_at || '').slice(0, 10);
    if (!day) return;
    if (!grouped.has(day)) {
      grouped.set(day, {
        day,
        label: formatDayLabel(day),
        slots: [],
      });
    }
    grouped.get(day).slots.push(slot);
  });

  const currentStart = String(lead.cita_fecha_hora || '').trim();
  if (currentStart) {
    const normalized = normalizeLocalDateTime(currentStart);
    const day = normalized.slice(0, 10);
    const alreadyIncluded = slots.some((slot) => String(slot.starts_at || '') === normalized);
    if (day && !alreadyIncluded) {
      if (!grouped.has(day)) {
        grouped.set(day, {
          day,
          label: `${formatDayLabel(day)} · cita actual`,
          slots: [],
        });
      }
      grouped.get(day).slots.unshift({
        starts_at: normalized,
        ends_at: addMinutesToLocalDateTime(normalized, Number(state.advisorProfile?.advisor?.slot_duration_minutes || 45)),
        label: `${formatSlotLabel(normalized)} · actual`,
        isCurrent: true,
      });
    }
  }

  return Array.from(grouped.values())
    .map((group) => ({
      ...group,
      slots: group.slots.sort((a, b) => String(a.starts_at || '').localeCompare(String(b.starts_at || ''))),
    }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

function populateLeadAppointmentTimes(groups, selectedDay, selectedStart = '') {
  const timeSelect = document.getElementById('lead-appointment-time');
  if (!timeSelect) return;

  const activeGroup = groups.find((group) => group.day === selectedDay) || groups[0];
  const options = activeGroup?.slots || [];
  timeSelect.innerHTML = options.length
    ? options.map((slot, index) => {
      const value = String(slot.starts_at || '');
      const isSelected = selectedStart
        ? value === selectedStart
        : index === 0;
      return `<option value="${escapeHtml(value)}" ${isSelected ? 'selected' : ''}>${escapeHtml(slot.label || formatSlotLabel(value))}</option>`;
    }).join('')
    : '<option value="">Sin horas libres</option>';
  timeSelect.disabled = !options.length;
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
  const rangeItems = filterItemsByRange(items, state.selectedRange);
  const query = normalizeText(elements.filterQ?.value?.trim() || '');
  const status = elements.filterStatus?.value || '';
  const sistema = elements.filterSistema?.value || '';
  const isapre = normalizeText(elements.filterIsapre?.value?.trim() || '');
  const fromValue = elements.filterFrom?.value;
  const toValue = elements.filterTo?.value;
  const from = fromValue ? new Date(`${fromValue}T00:00:00`) : null;
  const to = toValue ? new Date(`${toValue}T23:59:59`) : null;

  return rangeItems.filter((item) => {
    if (status && item.status !== status) return false;
    if (sistema && item.sistema_actual !== sistema) return false;
    if (isapre && !normalizeText(item.isapre_especifica || '').includes(isapre)) return false;

    if (query) {
      const haystack = normalizeText([item.nombre, item.email, item.telefono, item.comuna, item.region, item.isapre_especifica, item.rut].filter(Boolean).join(' '));
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
  if (days === 1) return items.filter((item) => new Date(item.created_at) >= start);
  start.setDate(start.getDate() - (days - 1));
  return items.filter((item) => new Date(item.created_at) >= start && new Date(item.created_at) <= now);
}

function filterAppointmentItemsByRange(items, rangeKey) {
  const days = RANGE_OPTIONS[rangeKey]?.days || 7;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + Math.max(days - 1, 0));
  end.setHours(23, 59, 59, 999);

  return (items || []).filter((item) => {
    if (!item.cita_fecha_hora) return false;
    const date = new Date(item.cita_fecha_hora);
    if (Number.isNaN(date.getTime())) return false;
    return date >= start && date <= end;
  });
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

function getSelectedRangeWindow() {
  const days = RANGE_OPTIONS[state.selectedRange]?.days || 7;
  const fromDate = new Date();
  fromDate.setHours(0, 0, 0, 0);
  const toDate = new Date(fromDate);
  toDate.setDate(toDate.getDate() + Math.max(days - 1, 0));
  return {
    from: fromDate.toISOString().slice(0, 10),
    to: toDate.toISOString().slice(0, 10),
  };
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
  if (rangeKey !== 'today') start.setDate(start.getDate() - (days - 1));

  for (let index = 0; index < bucketCount; index += 1) {
    const bucketDate = new Date(start);
    if (rangeKey === 'today') bucketDate.setHours(8 + index * 2, 0, 0, 0);
    else bucketDate.setDate(start.getDate() + Math.round(index * stepDays));
    labels.push(new Intl.DateTimeFormat('es-CL', labelFormat).format(bucketDate).replace('.', ''));
  }

  items.forEach((item) => {
    const created = new Date(item.created_at);
    if (Number.isNaN(created.getTime())) return;
    let index = 0;
    if (rangeKey === 'today') index = Math.min(bucketCount - 1, Math.max(0, Math.floor((created.getHours() - 8) / 2)));
    else {
      const diffDays = Math.max(0, Math.floor((created - start) / 86400000));
      index = Math.min(bucketCount - 1, Math.floor(diffDays / Math.max(stepDays, 1)));
    }
    leads[index] += 1;
    if (item.status === 'Cerrado') closed[index] += 1;
  });

  return { labels, leads, closed };
}

function buildLineChartSvg(labels, datasets) {
  const width = 800;
  const height = 200;
  const padding = { top: 2, right: 16, bottom: 25, left: 16 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const max = Math.max(1, ...datasets.flatMap((dataset) => dataset.values)) * 1.1;

  const pointsFor = (values) => values.map((value, index) => ({
    x: padding.left + (chartWidth / Math.max(values.length - 1, 1)) * index,
    y: padding.top + chartHeight - ((value / max) * chartHeight)
  }));

  const getBezierPath = (points) => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2.5;
      const cp2x = p1.x - (p1.x - p0.x) / 2.5;
      d += ` C ${cp1x} ${p0.y}, ${cp2x} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const drawDatasets = datasets.map((dataset, dIdx) => {
    const pts = pointsFor(dataset.values);
    const pathData = getBezierPath(pts);
    const gradId = `grad-${dIdx}`;
    const areaPath = `${pathData} L ${pts[pts.length - 1].x} ${padding.top + chartHeight} L ${pts[0].x} ${padding.top + chartHeight} Z`;
    const softColor = dIdx === 0 ? '#4285f4' : '#64748b'; // Azul claro para leads

    return `
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${softColor}" stop-opacity="0.2" />
          <stop offset="100%" stop-color="${softColor}" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path d="${areaPath}" fill="url(#${gradId})" stroke="none" />
      <path d="${pathData}" fill="none" stroke="${softColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    `;
  }).join('');

  const vGrid = labels.map((_, index) => {
    const x = padding.left + (chartWidth / Math.max(labels.length - 1, 1)) * index;
    return `<line x1="${x}" y1="${padding.top}" x2="${x}" y2="${padding.top + chartHeight}" stroke="#f1f5f9" stroke-width="1" />`;
  }).join('');

  const xAxis = `<line x1="${padding.left}" y1="${padding.top + chartHeight}" x2="${padding.left + chartWidth}" y2="${padding.top + chartHeight}" stroke="#e2e8f0" stroke-width="0.8" />`;

  const xLabelsMarkup = labels.map((label, index) => {
    const x = padding.left + (chartWidth / Math.max(labels.length - 1, 1)) * index;
    return `<text x="${x}" y="${height - 2}" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="500">${escapeHtml(label)}</text>`;
  }).join('');

  return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="width:100%;height:100%;display:block">${vGrid}${xAxis}${drawDatasets}${xLabelsMarkup}</svg>`;
}

function renderDonut(buckets) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  if (!total) {
    elements.isapreDonut.innerHTML = '<span>0</span><small>Sin leads</small>';
    elements.isapreDonut.style.background = 'linear-gradient(180deg, #eaf1f8 0%, #dfe9f6 100%)';
    elements.isapreLegend.innerHTML = '<p class="crm-muted">No hay distribución disponible todavía.</p>';
    return;
  }

  const palette = ['#1668dc', '#0f9d58', '#f59e0b', '#ef4444', '#6d28d9', '#14b8a6', '#2563eb', '#db2777', '#64748b'];
  let current = 0;
  const segments = [];
  const legend = [];

  buckets.forEach((bucket, index) => {
    const percent = bucket.count / total;
    const start = current * 360;
    const end = (current + percent) * 360;
    const color = palette[index % palette.length];
    segments.push(`${color} ${start}deg ${end}deg`);
    legend.push(`<div class="crm-legend-row"><span class="crm-legend-row__dot" style="background:${color}"></span><strong>${escapeHtml(bucket.label)}</strong><span>${bucket.count}</span></div>`);
    current += percent;
  });

  elements.isapreDonut.style.background = `conic-gradient(${segments.join(', ')})`;
  elements.isapreDonut.innerHTML = `<span>${total}</span><small>Leads</small>`;
  elements.isapreLegend.innerHTML = legend.join('');
}

function buildAppointments(items) {
  return (items || [])
    .filter((item) => item.cita_fecha_hora)
    .map((item) => ({ ...item, rawDate: item.cita_fecha_hora, date: new Date(item.cita_fecha_hora), status: item.cita_estado }))
    .filter((item) => !Number.isNaN(item.date.getTime()))
    .sort((a, b) => a.date - b.date);
}

function renderAppointmentItem(appointment) {
  return `<button type="button" class="crm-agenda-item" data-lead-id="${appointment.id}"><div><strong>${escapeHtml(appointment.nombre || 'Sin nombre')}</strong><span>${escapeHtml(formatDateTime(appointment.cita_fecha_hora))}</span></div><span class="crm-badge ${statusBadgeClass(appointment.status)}">${escapeHtml(appointment.status || 'Pendiente')}</span></button>`;
}

function bindAgendaClicks() {
  document.querySelectorAll('.crm-agenda-item[data-lead-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      setView('leads');
      await loadLeadDetail(button.dataset.leadId);
    });
  });
}

function renderAgendaTable(appointments) {
  const upcoming = (appointments || [])
    .filter((item) => !normalizeText(item.status || '').includes('cancel'))
    .slice()
    .sort((a, b) => a.date - b.date);

  if (!upcoming.length) {
    elements.agendaSectionList.innerHTML = '<div class="crm-empty crm-empty--small"><h3>Sin citas para el periodo</h3><p>Agenda vacia para el rango seleccionado.</p></div>';
    return;
  }

  const grouped = new Map();
  upcoming.forEach((appt) => {
    const dayIso = appt.rawDate.slice(0, 10);
    if (!grouped.has(dayIso)) grouped.set(dayIso, []);
    grouped.get(dayIso).push(appt);
  });

  const dayLabels = Array.from(grouped.keys()).sort().slice(0, 14);
  elements.agendaSectionList.innerHTML = dayLabels.map((dayIso) => {
    const dateObj = new Date(`${dayIso}T12:00:00`);
    const label = new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: '2-digit', month: 'short' }).format(dateObj).replace('.', '');
    const rows = (grouped.get(dayIso) || [])
      .sort((a, b) => a.date - b.date)
      .map((appt) => {
        const time = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit' }).format(appt.date);
        const status = appt.status || 'Pendiente';
        const badge = statusBadgeClass(status);
        const hasCalendar = Boolean(appt.cita_calendar_url);
        const calendarLink = hasCalendar ? `<a class="crm-link" href="${escapeHtml(appt.cita_calendar_url)}" target="_blank" rel="noopener noreferrer">Calendar</a>` : '';
        const cancelDisabled = normalizeText(status).includes('realiz') || normalizeText(status).includes('cerrad');
        return `
          <div class="crm-agenda-row" data-lead-id="${appt.id}">
            <div class="crm-agenda-row__time">${escapeHtml(time)}</div>
            <div class="crm-agenda-row__main">
              <strong>${escapeHtml(appt.nombre || 'Sin nombre')}</strong>
              <span>${escapeHtml(appt.telefono || appt.email || '')}</span>
            </div>
            <span class="crm-badge ${badge}">${escapeHtml(status)}</span>
            <div class="crm-agenda-row__actions">
              <button type="button" class="button button--secondary button--compact crm-agenda-open" data-lead-id="${appt.id}">Abrir</button>
              ${calendarLink}
              <button type="button" class="button button--ghost button--compact crm-agenda-cancel" data-lead-id="${appt.id}" ${cancelDisabled ? 'disabled' : ''}>Cancelar</button>
            </div>
          </div>
        `;
      }).join('');

    return `
      <section class="crm-card crm-card--inner crm-agenda-day">
        <div class="crm-card__header">
          <div>
            <p class="crm-eyebrow">Agenda</p>
            <h3>${escapeHtml(label)}</h3>
          </div>
        </div>
        <div class="crm-agenda-day__rows">${rows}</div>
      </section>
    `;
  }).join('');

  elements.agendaSectionList.querySelectorAll('.crm-agenda-open').forEach((btn) => {
    btn.addEventListener('click', async () => {
      setView('leads');
      await loadLeadDetail(btn.dataset.leadId);
    });
  });

  elements.agendaSectionList.querySelectorAll('.crm-agenda-cancel').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const leadId = btn.dataset.leadId;
      btn.disabled = true;
      try {
        await updateAppointment(leadId, {
          action: 'cancel',
          cita_estado: 'Cancelada',
          cita_calendar_event_id: '',
          cita_calendar_url: '',
        });
        await loadLeads(false);
      } catch (error) {
        btn.disabled = false;
        alert(error.message || 'No se pudo cancelar la cita');
      }
    });
  });
}

function renderAvailabilityRuleEditor(rules = [], advisor = {}) {
  if (!elements.settingsAvailabilityGrid) return;
  const dayLabels = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const byDay = new Map((rules || []).map((rule) => [Number(rule.day_of_week), rule]));
  elements.settingsAvailabilityGrid.innerHTML = dayLabels.map((label, dayOfWeek) => {
    const rule = byDay.get(dayOfWeek) || {};
    const enabled = Number(rule.is_enabled ?? (dayOfWeek >= 1 && dayOfWeek <= 5 ? 1 : 0)) === 1;
    const start = rule.start_time || advisor.workday_start || '08:00';
    const end = rule.end_time || advisor.workday_end || '19:00';
    return `
      <div class="crm-availability-row" data-day="${dayOfWeek}">
        <label class="crm-availability-row__toggle">
          <input type="checkbox" data-role="enabled" ${enabled ? 'checked' : ''} />
          <span>${label}</span>
        </label>
        <input type="time" data-role="start" value="${escapeHtml(start)}" />
        <input type="time" data-role="end" value="${escapeHtml(end)}" />
      </div>
    `;
  }).join('');
}

function renderAvailabilityBlocks(blocks = []) {
  if (!elements.settingsBlockList) return;
  if (!blocks.length) {
    elements.settingsBlockList.innerHTML = '<p class="crm-muted">No hay bloqueos manuales guardados.</p>';
    return;
  }

  elements.settingsBlockList.innerHTML = blocks
    .slice()
    .sort((a, b) => String(a.starts_at || '').localeCompare(String(b.starts_at || '')))
    .map((block) => `
      <div class="crm-block-row" data-block-id="${escapeHtml(block.id || '')}">
        <div class="crm-block-row__main">
          <strong>${escapeHtml(formatDateTime(block.starts_at || ''))}</strong>
          <span>${block.block_type === 'full_day'
            ? 'Día completo'
            : `${escapeHtml((block.starts_at || '').slice(11, 16))} - ${escapeHtml((block.ends_at || '').slice(11, 16))}`}</span>
          <small>${escapeHtml(block.note || (block.block_type === 'full_day' ? 'Día bloqueado' : 'Bloqueo manual'))}</small>
        </div>
        <button type="button" class="button button--ghost button--compact crm-block-remove" data-block-id="${escapeHtml(block.id || '')}">Quitar</button>
      </div>
    `).join('');

  elements.settingsBlockList.querySelectorAll('.crm-block-remove').forEach((button) => {
    button.addEventListener('click', () => {
      state.advisorBlocks = state.advisorBlocks.filter((block) => block.id !== button.dataset.blockId);
      renderAvailabilityBlocks(state.advisorBlocks);
    });
  });
}

function appendManualBlockFromForm() {
  const date = elements.settingsBlockDate?.value || '';
  const start = elements.settingsBlockStart?.value || '';
  const end = elements.settingsBlockEnd?.value || '';
  const note = elements.settingsBlockNote?.value?.trim() || '';

  if (!date || !start || !end) {
    window.alert('Completa fecha, hora de inicio y hora de t?rmino');
    return;
  }

  if (end <= start) {
    window.alert('La hora de t?rmino debe ser mayor que la de inicio');
    return;
  }

  state.advisorBlocks = [
    ...state.advisorBlocks,
    {
      id: window.crypto?.randomUUID?.() || `block-${Date.now()}`,
      starts_at: `${date}T${start}:00`,
      ends_at: `${date}T${end}:00`,
      block_type: 'manual',
      note,
    },
  ];
  renderAvailabilityBlocks(state.advisorBlocks);
  if (elements.settingsBlockNote) elements.settingsBlockNote.value = '';
}

function appendFullDayBlockFromForm() {
  const date = elements.settingsBlockDate?.value || '';
  const note = elements.settingsBlockNote?.value?.trim() || 'Día bloqueado';

  if (!date) {
    window.alert('Selecciona una fecha para bloquear el día completo');
    return;
  }

  state.advisorBlocks = [
    ...state.advisorBlocks,
    {
      id: window.crypto?.randomUUID?.() || `block-${Date.now()}`,
      starts_at: `${date}T${elements.settingsWorkdayStart?.value || '08:00'}:00`,
      ends_at: `${date}T${elements.settingsWorkdayEnd?.value || '19:00'}:00`,
      block_type: 'full_day',
      note,
    },
  ];
  renderAvailabilityBlocks(state.advisorBlocks);
}

async function saveAdvisorBlocks() {
  elements.settingsSaveBlocks.disabled = true;
  try {
    await persistAdvisorBlocks(state.advisorBlocks || []);
  } catch (error) {
    window.alert(error.message || 'No se pudieron guardar los bloqueos');
  } finally {
    elements.settingsSaveBlocks.disabled = false;
  }
}

async function persistAdvisorBlocks(blocks) {
  const originalBlocks = state.advisorProfile?.blocks || [];
  const currentBlocks = (blocks || []).map((block) => ({
    id: block.id,
    starts_at: block.starts_at,
    ends_at: block.ends_at,
    block_type: block.block_type || 'manual',
    note: block.note || '',
  }));
  const currentIds = new Set(currentBlocks.map((block) => block.id).filter(Boolean));
  const removeIds = originalBlocks
    .map((block) => block.id)
    .filter((id) => id && !currentIds.has(id));

  await updateAvailability({
    blocks: currentBlocks,
    replace_blocks: removeIds,
  });
  await loadAdvisorWorkspace();
}

function syncLeadCreateSystemField() {
  if (!elements.leadCreateSystem || !elements.leadCreateIsapreField || !elements.leadCreateIsapre) return;
  const needsIsapre = /^isapre$/i.test(elements.leadCreateSystem.value || '');
  elements.leadCreateIsapreField.hidden = !needsIsapre;
  elements.leadCreateIsapre.toggleAttribute('required', needsIsapre);
  if (!needsIsapre) elements.leadCreateIsapre.value = '';
}

function resetLeadCreateForm() {
  elements.leadCreateForm?.reset();
  if (elements.leadCreateSystem) elements.leadCreateSystem.value = 'Fonasa';
  if (elements.leadCreateFeedback) elements.leadCreateFeedback.textContent = '';
  syncLeadCreateSystemField();
}

function openLeadCreateModal() {
  resetLeadCreateForm();
  elements.leadCreateModal?.showModal();
  window.setTimeout(() => elements.leadCreateName?.focus(), 30);
}

function closeLeadCreateModal() {
  elements.leadCreateModal?.close();
}

async function createLeadFromModal(event) {
  event?.preventDefault();
  const nombre = elements.leadCreateName?.value?.trim() || '';
  const telefono = elements.leadCreatePhone?.value?.trim() || '';
  const email = elements.leadCreateEmail?.value?.trim() || '';
  const sistema = elements.leadCreateSystem?.value || 'Fonasa';
  const isapre = /^isapre$/i.test(sistema) ? (elements.leadCreateIsapre?.value?.trim() || '') : '';
  const comuna = elements.leadCreateComuna?.value?.trim() || '';

  if (!nombre) {
    if (elements.leadCreateFeedback) elements.leadCreateFeedback.textContent = 'El nombre es obligatorio.';
    elements.leadCreateName?.focus();
    return;
  }

  elements.leadCreateSubmit.disabled = true;
  try {
    const response = await createLead({
      nombre,
      telefono,
      email,
      comuna,
      sistema_actual: sistema,
      isapre_especifica: isapre,
      fuente_cta: 'CRM',
      campana: 'CRM manual',
      contacto_preferencia: 'lo_antes_posible',
      status: 'Nuevo',
    });
    closeLeadCreateModal();
    await loadLeads();
    if (response?.leadId) {
      setView('leads');
      await loadLeadDetail(response.leadId);
    }
  } catch (error) {
    if (elements.leadCreateFeedback) elements.leadCreateFeedback.textContent = error.message || 'No se pudo crear el lead';
  } finally {
    elements.leadCreateSubmit.disabled = false;
  }
}

async function saveAdvisorSettings() {
  const payload = {
    display_name: elements.settingsDisplayName?.value?.trim() || '',
    timezone: elements.settingsTimezone?.value?.trim() || 'America/Santiago',
    workday_start: elements.settingsWorkdayStart?.value || '08:00',
    workday_end: elements.settingsWorkdayEnd?.value || '19:00',
    slot_duration_minutes: Number(elements.settingsSlotDuration?.value || 45),
    slot_buffer_minutes: Number(elements.settingsSlotBuffer?.value || 15),
    allow_busy_requests: Boolean(elements.settingsAllowBusy?.checked),
  };

  elements.settingsSaveProfile.disabled = true;
  try {
    await updateAdvisorProfile(payload);
    await loadAdvisorWorkspace();
  } catch (error) {
    window.alert(error.message || 'No se pudo guardar el perfil operativo');
  } finally {
    elements.settingsSaveProfile.disabled = false;
  }
}

async function saveAdvisorAvailability() {
  const rows = Array.from(elements.settingsAvailabilityGrid?.querySelectorAll('.crm-availability-row') || []);
  const rules = rows.map((row) => ({
    day_of_week: Number(row.dataset.day),
    is_enabled: row.querySelector('[data-role="enabled"]')?.checked || false,
    start_time: row.querySelector('[data-role="start"]')?.value || '08:00',
    end_time: row.querySelector('[data-role="end"]')?.value || '19:00',
  }));

  elements.settingsSaveAvailability.disabled = true;
  try {
    await updateAvailability({ rules });
    await loadAdvisorWorkspace();
  } catch (error) {
    window.alert(error.message || 'No se pudo guardar la disponibilidad');
  } finally {
    elements.settingsSaveAvailability.disabled = false;
  }
}

function connectGoogleCalendar() {
  const returnTo = `${window.location.origin}${window.location.pathname}`;
  window.location.href = `https://form.planespro.cl/api/auth/google/start?adminKey=${encodeURIComponent(readAdminKey())}&return_to=${encodeURIComponent(returnTo)}`;
}

function hydratePopovers(items) {
  const notifications = items.filter((item) => ['Nuevo', 'Por contactar'].includes(item.status)).slice(0, 5);
  const updates = items.slice().sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)).slice(0, 5);
  const messages = buildAppointments(items).filter((item) => !item.status || ['Pendiente', 'Por coordinar'].includes(item.status)).slice(0, 5);
  elements.notificationCount.textContent = String(notifications.length);
  elements.updatesCount.textContent = String(updates.length);
  elements.messagesCount.textContent = String(messages.length);
  elements.notificationPopover.innerHTML = buildPopoverList('Leads por contactar', notifications.map((item) => ({ title: item.nombre || 'Sin nombre', meta: item.telefono || item.email || 'Sin contacto', leadId: item.id })));
  elements.updatesPopover.innerHTML = buildPopoverList('Updates recientes', updates.map((item) => ({ title: item.nombre || 'Sin nombre', meta: `${formatDateTime(item.updated_at || item.created_at)} · ${item.status || 'Sin estado'}`, leadId: item.id })));
  elements.messagesPopover.innerHTML = buildPopoverList('Citas pendientes', messages.map((item) => ({ title: item.nombre || 'Sin nombre', meta: `${formatDateTime(item.cita_fecha_hora)} · ${item.cita_estado || 'Pendiente'}`, leadId: item.id })));
  document.querySelectorAll('.crm-popover [data-lead-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      hidePopovers();
      setView('leads');
      await loadLeadDetail(button.dataset.leadId);
    });
  });
}

function buildPopoverList(title, rows) {
  return `<div class="crm-popover__title">${escapeHtml(title)}</div><div class="crm-popover__list">${rows.length ? rows.map((row) => `<button type="button" class="crm-popover__item" data-lead-id="${row.leadId}"><strong>${escapeHtml(row.title)}</strong><span>${escapeHtml(row.meta)}</span></button>`).join('') : '<p class="crm-muted">Sin movimientos.</p>'}</div>`;
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

function openProfileModal() {
  const fallbackName = state.profile.name || state.session?.actorEmail || 'Asesor';
  elements.profileNameInput.value = fallbackName;
  renderProfilePreview(state.profile.photoDataUrl || '', fallbackName);
  elements.profileModal.showModal();
}

function setProfileMenu(open) {
  state.profileMenuOpen = open;
  elements.profileMenu.hidden = !open;
  elements.profileWrap.classList.toggle('is-open', open);
}

function handleProfilePhotoChange() {
  const file = elements.profilePhotoInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => renderProfilePreview(reader.result, elements.profileNameInput.value || state.session?.actorEmail || 'Asesor');
  reader.readAsDataURL(file);
}

function resetProfile() {
  state.profile = {};
  window.localStorage.removeItem(PROFILE_STORAGE);
  elements.profileNameInput.value = state.session?.actorEmail || '';
  elements.profilePhotoInput.value = '';
  applyProfileToUI();
  hydrateProfileSections();
  renderProfilePreview('', state.session?.actorEmail || 'Asesor');
}

function saveProfileChanges() {
  const name = elements.profileNameInput.value.trim();
  const photoDataUrl = elements.profilePreviewPhoto.hidden ? '' : elements.profilePreviewPhoto.src;
  state.profile = { name, photoDataUrl };
  window.localStorage.setItem(PROFILE_STORAGE, JSON.stringify(state.profile));
  applyProfileToUI();
  hydrateProfileSections();
  elements.profileModal.close();
}

function applyProfileToUI() {
  const fallbackName = state.profile.name || state.session?.actorEmail || 'Asesor';
  elements.profileName.textContent = fallbackName;
  elements.sidebarUserName.textContent = fallbackName;
  paintAvatar(elements.profileAvatar, fallbackName);
  toggleAvatarPhoto(elements.profilePhoto, elements.profileAvatar, state.profile.photoDataUrl, fallbackName);
}

function hydrateProfileSections() {
  const fallbackName = state.profile.name || state.session?.actorEmail || 'Asesor';
  elements.profilePageName.textContent = fallbackName;
  elements.profilePageNameValue.textContent = fallbackName;
  elements.profilePageAccess.textContent = isLocalDev ? 'Clave manual local' : 'Cloudflare Access';
  elements.profilePageEmail.textContent = state.session?.actorEmail || '-';
  toggleAvatarPhoto(elements.profilePagePhoto, elements.profilePageAvatar, state.profile.photoDataUrl, fallbackName);
}

function hydrateAdvisorUI() {
  const profilePayload = state.advisorProfile;
  const advisor = profilePayload?.advisor;
  const google = profilePayload?.google;
  const availability = state.advisorAvailability.length ? state.advisorAvailability : (profilePayload?.availability || []);
  const blocks = state.advisorBlocks.length ? state.advisorBlocks : (profilePayload?.blocks || []);

  if (advisor) {
    if (elements.settingsDisplayName) elements.settingsDisplayName.value = advisor.display_name || '';
    if (elements.settingsTimezone) elements.settingsTimezone.value = advisor.timezone || 'America/Santiago';
    if (elements.settingsWorkdayStart) elements.settingsWorkdayStart.value = advisor.workday_start || '08:00';
    if (elements.settingsWorkdayEnd) elements.settingsWorkdayEnd.value = advisor.workday_end || '19:00';
    if (elements.settingsSlotDuration) elements.settingsSlotDuration.value = String(advisor.slot_duration_minutes || 45);
    if (elements.settingsSlotBuffer) elements.settingsSlotBuffer.value = String(advisor.slot_buffer_minutes || 15);
    if (elements.settingsAllowBusy) elements.settingsAllowBusy.checked = Number(advisor.allow_busy_requests || 0) === 1;
    if (elements.profilePageHours) {
      elements.profilePageHours.textContent = `${advisor.workday_start || '08:00'} - ${advisor.workday_end || '19:00'}`;
    }
  }

  const connected = Boolean(google?.connected);
  if (elements.settingsGoogleStatus) elements.settingsGoogleStatus.textContent = connected ? 'Conectado' : 'Sin conectar';
  if (elements.settingsGoogleEmail) elements.settingsGoogleEmail.textContent = google?.google_email || '-';
  if (elements.settingsGoogleUpdated) elements.settingsGoogleUpdated.textContent = google?.updated_at ? formatDateTime(google.updated_at) : '-';
  if (elements.profilePageGoogle) elements.profilePageGoogle.textContent = connected ? (google?.google_email || 'Conectado') : 'Sin conectar';
  if (elements.profilePageCalendarCopy) {
    elements.profilePageCalendarCopy.textContent = connected
      ? `Google Calendar activo para ${google?.google_email || 'esta cuenta'}.`
      : 'Todavía no hay un calendario personal conectado a este asesor.';
  }
  if (elements.calendarSyncHint) {
    elements.calendarSyncHint.textContent = connected
      ? 'Disponibilidad sincronizada con Google Calendar.'
      : 'Disponibilidad basada en reglas locales. Conecta Google Calendar para bloquear horas ocupadas.';
  }

  renderAvailabilityRuleEditor(availability, advisor);
  renderAvailabilityBlocks(blocks);
  renderAvailabilitySlots();
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
  element.style.background = `linear-gradient(135deg, hsl(${hue} 72% 42%), hsl(${(hue + 26) % 360} 70% 62%))`;
  element.innerHTML = '<i class="fas fa-user" aria-hidden="true"></i>';
}

function openFileModal(leadId, leadName, fileName) {
  elements.fileModalTitle.textContent = `${leadName} · ${fileName}`;
  elements.fileModalFrame.src = getFileUrl(leadId);
  elements.fileModal.showModal();
}

function closeFileModal() {
  elements.fileModal.close();
  elements.fileModalFrame.src = 'about:blank';
}

function loadProfile() {
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadSidebarState() {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE) === '1';
  } catch {
    return false;
  }
}

function persistSidebarState() {
  try {
    window.localStorage.setItem(SIDEBAR_STORAGE, state.sidebarCollapsed ? '1' : '0');
  } catch {
    // no-op
  }
}

function applySidebarState() {
  elements.sidebar?.classList.toggle('is-collapsed', state.sidebarCollapsed);
}

function normalizeContactPreference(value = '') {
  const normalized = normalizeText(value || '');
  return normalized.includes('agendar') ? 'agendar_reunion' : 'lo_antes_posible';
}

function normalizeLocalDateTime(value = '') {
  const match = String(value || '').trim().match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return '';
  return `${match[1]}T${match[2]}:${match[3]}:${match[4] || '00'}`;
}

function addMinutesToLocalDateTime(start, minutes) {
  const normalized = normalizeLocalDateTime(start);
  if (!normalized) return '';
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return normalized;
  date.setMinutes(date.getMinutes() + Number(minutes || 0));
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatDayLabel(dayIso) {
  const date = new Date(`${dayIso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dayIso;
  return new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: '2-digit', month: 'short' }).format(date).replace('.', '');
}

function formatSlotLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date).replace('.', '');
}
function formatDate(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function formatDateTime(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

function normalizeText(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
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
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
}

function isValidRut(value = '') {
  const cleaned = cleanRut(value);
  if (!/^\d{7,8}[0-9K]$/.test(cleaned)) return false;
  return calculateRutDv(cleaned.slice(0, -1)) === cleaned.slice(-1);
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

function renderTrend(element, current, previous) {
  const delta = previous === 0 ? (current > 0 ? 100 : 0) : (((current - previous) / previous) * 100);
  const rounded = Math.round(delta);
  element.textContent = `${rounded >= 0 ? '+' : ''}${rounded}%`;
  element.classList.toggle('is-positive', rounded >= 0);
  element.classList.toggle('is-negative', rounded < 0);
}

function statusBadgeClass(status = '') {
  const normalized = normalizeText(status);
  if (normalized.includes('cerrado')) return 'crm-badge--success';
  if (normalized.includes('contactado') || normalized.includes('propuesta')) return 'crm-badge--accent';
  if (normalized.includes('archivado') || normalized.includes('descartado')) return 'crm-badge--muted';
  return 'crm-badge--neutral';
}







