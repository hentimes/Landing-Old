import { API_BASE_URL, ADMIN_KEY_STORAGE, LOCAL_DEV_ADMIN_KEY, isLocalDev } from './config.js';

function getAdminKey() {
  return window.localStorage.getItem(ADMIN_KEY_STORAGE) || (isLocalDev ? LOCAL_DEV_ADMIN_KEY : '');
}

function getHeaders(extra = {}) {
  const headers = { ...extra };
  const adminKey = getAdminKey();
  if (isLocalDev && adminKey) {
    headers['X-Admin-Key'] = adminKey;
  }
  return headers;
}

async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: getHeaders(options.headers),
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const message = payload?.message || payload?.error || 'Request failed';
    throw new Error(message);
  }

  return payload;
}

export function saveAdminKey(value) {
  if (!value) {
    window.localStorage.removeItem(ADMIN_KEY_STORAGE);
    return;
  }
  window.localStorage.setItem(ADMIN_KEY_STORAGE, value);
}

export function readAdminKey() {
  return getAdminKey();
}

export function getFileUrl(leadId) {
  const url = new URL(`${API_BASE_URL}/api/admin/leads/${leadId}/file`);
  const adminKey = getAdminKey();
  if (isLocalDev && adminKey) {
    url.searchParams.set('adminKey', adminKey);
  }
  return url.toString();
}

export async function getSession() {
  return fetchJson('/api/admin/session');
}

export async function getAdvisorProfile() {
  return fetchJson('/api/admin/advisor/profile');
}

export async function updateAdvisorProfile(payload) {
  return fetchJson('/api/admin/advisor/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
}

export async function getAvailability(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  return fetchJson(`/api/admin/availability?${query.toString()}`);
}

export async function updateAvailability(payload) {
  return fetchJson('/api/admin/availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
}

export async function listLeads(filters) {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  return fetchJson(`/api/admin/leads?${params.toString()}`);
}

export async function createLead(payload) {
  return fetchJson('/api/admin/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
}

export async function deleteLead(leadId) {
  return fetchJson(`/api/admin/leads/${leadId}/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
}

export async function updateAppointment(leadId, payload) {
  return fetchJson(`/api/admin/leads/${leadId}/appointment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
}

export async function getLeadDetail(leadId) {
  return fetchJson(`/api/admin/leads/${leadId}`);
}

export async function updateLeadStatus(leadId, status) {
  return fetchJson(`/api/admin/leads/${leadId}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function updateLeadRut(leadId, rut) {
  return fetchJson(`/api/admin/leads/${leadId}/rut`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rut }),
  });
}

export async function archiveLead(leadId, reason) {
  return fetchJson(`/api/admin/leads/${leadId}/archive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
}

export async function addLeadNote(leadId, note) {
  return fetchJson(`/api/admin/leads/${leadId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note }),
  });
}
