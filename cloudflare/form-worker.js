export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const leadDetailMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)$/);
    const leadFileMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/file$/);
    const leadNotesMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/notes$/);
    const leadStatusMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/status$/);
    const leadRutMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/rut$/);
    const leadArchiveMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/archive$/);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env, request) });
    }

    try {
      if (request.method === 'POST' && url.pathname === '/api/form/leads') {
        return await handleLeadCreate(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/api/form/leads/abandoned') {
        return await handleLeadAbandoned(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/api/form/appointments') {
        return await handleAppointmentUpdate(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/api/admin/session') {
        return await handleAdminSession(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/api/admin/leads') {
        return await handleAdminLeadList(request, env);
      }

      if (request.method === 'GET' && leadDetailMatch) {
        return await handleAdminLeadDetail(request, env, leadDetailMatch[1]);
      }

      if (request.method === 'GET' && leadFileMatch) {
        return await handleAdminLeadFile(request, env, leadFileMatch[1]);
      }

      if (request.method === 'POST' && leadNotesMatch) {
        return await handleAdminLeadNote(request, env, leadNotesMatch[1]);
      }

      if (request.method === 'POST' && leadStatusMatch) {
        return await handleAdminLeadStatus(request, env, leadStatusMatch[1]);
      }

      if (request.method === 'POST' && leadRutMatch) {
        return await handleAdminLeadRut(request, env, leadRutMatch[1]);
      }

      if (request.method === 'POST' && leadArchiveMatch) {
        return await handleAdminLeadArchive(request, env, leadArchiveMatch[1]);
      }
    } catch (error) {
      return json(
        { error: error?.message || 'Internal error' },
        500,
        env,
        request
      );
    }

    return json({ error: 'Not found' }, 404, env, request);
  },
};

async function handleLeadCreate(request, env) {
  const contentType = request.headers.get('content-type') || '';
  let payload = {};
  let uploadedFile = null;

  if (contentType.includes('application/json')) {
    payload = await request.json();
  } else {
    const formData = await request.formData();
    const parsed = await formDataToFields(formData);
    payload = parsed.fields;
    uploadedFile = parsed.file;
  }

  const leadId = crypto.randomUUID();
  const now = new Date().toISOString();
  const normalized = normalizeLead(payload, leadId, now, 'Completado');

  let pdfObjectKey = '';
  let pdfOriginalName = '';
  if (uploadedFile && uploadedFile.size > 0) {
    pdfOriginalName = buildUploadFilename({
      originalName: uploadedFile.name,
      leadId,
      leadName: normalized.nombre,
      createdAt: now,
    });
    pdfObjectKey = `leads/${pdfOriginalName}`;
    const bytes = new Uint8Array(await uploadedFile.arrayBuffer());
    await env.FORM_UPLOADS.put(pdfObjectKey, bytes, {
      httpMetadata: { contentType: uploadedFile.type || 'application/pdf' },
    });
  } else if (payload.base64pdf) {
    const pdf = decodeBase64(payload.base64pdf);
    pdfOriginalName = buildUploadFilename({
      originalName: payload.filename,
      leadId,
      leadName: normalized.nombre,
      createdAt: now,
    });
    pdfObjectKey = `leads/${pdfOriginalName}`;
    await env.FORM_UPLOADS.put(pdfObjectKey, pdf, {
      httpMetadata: { contentType: 'application/pdf' },
    });
  }

  await env.FORM_DB.prepare(`
    INSERT INTO form_leads (
      id, created_at, updated_at, status, cta, campana, sheet_name,
      nombre, email, telefono, rut, rango_edad, comuna, region,
      sistema_actual, isapre_especifica, num_cargas, edad_cargas,
      rango_renta, rango_costo, comentarios,
      cita_estado, cita_fecha_hora, cita_calendar_event_id, cita_calendar_url,
      pdf_object_key, pdf_original_name, raw_payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    normalized.id,
    normalized.created_at,
    normalized.updated_at,
    normalized.status,
    normalized.fuente_cta,
    normalized.campana,
    normalized.sheetName,
    normalized.nombre,
    normalized.email,
    normalized.telefono,
    normalized.rut,
    normalized.rango_edad,
    normalized.comuna,
    normalized.region,
    normalized.sistema_actual,
    normalized.isapre_especifica,
    normalized.num_cargas,
    normalized.edad_cargas,
    normalized.rango_renta,
    normalized.rango_costo,
    normalized.comentarios,
    normalized.cita_estado,
    normalized.cita_fecha_hora,
    normalized.cita_calendar_event_id,
    normalized.cita_calendar_url,
    pdfObjectKey,
    pdfOriginalName,
    JSON.stringify(normalized.raw_payload)
  ).run();

  return json({ ok: true, leadId }, 200, env, request);
}

async function handleLeadAbandoned(request, env) {
  const payload = await request.json().catch(() => ({}));
  const leadId = crypto.randomUUID();
  const now = new Date().toISOString();
  const normalized = normalizeLead(payload, leadId, now, 'Abandonado');

  await env.FORM_DB.prepare(`
    INSERT INTO form_leads (
      id, created_at, updated_at, status, cta, campana, sheet_name,
      nombre, email, telefono, rut, rango_edad, comuna, region,
      sistema_actual, isapre_especifica, num_cargas, edad_cargas,
      rango_renta, rango_costo, comentarios,
      cita_estado, cita_fecha_hora, cita_calendar_event_id, cita_calendar_url,
      raw_payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    normalized.id,
    normalized.created_at,
    normalized.updated_at,
    normalized.status,
    normalized.fuente_cta,
    normalized.campana,
    normalized.sheetName,
    normalized.nombre,
    normalized.email,
    normalized.telefono,
    normalized.rut,
    normalized.rango_edad,
    normalized.comuna,
    normalized.region,
    normalized.sistema_actual,
    normalized.isapre_especifica,
    normalized.num_cargas,
    normalized.edad_cargas,
    normalized.rango_renta,
    normalized.rango_costo,
    normalized.comentarios,
    normalized.cita_estado,
    normalized.cita_fecha_hora,
    normalized.cita_calendar_event_id,
    normalized.cita_calendar_url,
    JSON.stringify(normalized.raw_payload)
  ).run();

  return json({ ok: true, leadId }, 200, env, request);
}

async function handleAppointmentUpdate(request, env) {
  const payload = await request.json().catch(() => ({}));
  if (!payload.leadId) {
    return json({ error: 'leadId is required' }, 400, env, request);
  }

  await env.FORM_DB.prepare(`
    UPDATE form_leads
    SET
      updated_at = ?,
      cita_estado = ?,
      cita_fecha_hora = ?,
      cita_calendar_event_id = ?,
      cita_calendar_url = ?
    WHERE id = ?
  `).bind(
    new Date().toISOString(),
    payload.cita_estado || 'Agendada',
    payload.cita_fecha_hora || '',
    payload.cita_calendar_event_id || '',
    payload.cita_calendar_url || '',
    payload.leadId
  ).run();

  return json({ ok: true }, 200, env, request);
}

async function handleAdminSession(request, env) {
  const admin = requireAdmin(request, env);
  if (admin.response) {
    return admin.response;
  }

  return json(
    {
      ok: true,
      actorEmail: admin.actorEmail,
      authMode: admin.authMode,
    },
    200,
    env,
    request
  );
}

async function handleAdminLeadList(request, env) {
  const admin = requireAdmin(request, env);
  if (admin.response) {
    return admin.response;
  }

  const url = new URL(request.url);
  const query = (url.searchParams.get('q') || '').trim().toLowerCase();
  const status = (url.searchParams.get('status') || '').trim();
  const sistema = (url.searchParams.get('sistema') || '').trim();
  const isapre = (url.searchParams.get('isapre') || '').trim();
  const from = (url.searchParams.get('from') || '').trim();
  const to = (url.searchParams.get('to') || '').trim();
  const limit = clampInteger(url.searchParams.get('limit'), 20, 1, 300);
  const offset = clampInteger(url.searchParams.get('offset'), 0, 0, 5000);

  const searchLike = `%${query}%`;
  const filters = [
    query,
    searchLike,
    searchLike,
    searchLike,
    searchLike,
    searchLike,
    status,
    status,
    sistema,
    sistema,
    isapre,
    isapre,
    from,
    from,
    to,
    to,
  ];

  const whereClause = `
    WHERE
      (? = '' OR lower(nombre) LIKE ? OR lower(email) LIKE ? OR lower(telefono) LIKE ? OR lower(comuna) LIKE ? OR lower(rut) LIKE ?)
      AND (? = '' OR status = ?)
      AND (? = '' OR sistema_actual = ?)
      AND (? = '' OR isapre_especifica = ?)
      AND (? = '' OR date(created_at) >= date(?))
      AND (? = '' OR date(created_at) <= date(?))
  `;

  const countSql = `SELECT COUNT(*) AS total FROM form_leads ${whereClause}`;
  const listSql = `
    SELECT
      id,
      created_at,
      updated_at,
      status,
      nombre,
      email,
      telefono,
      rut,
      comuna,
      region,
      sistema_actual,
      isapre_especifica,
      comentarios,
      cita_estado,
      cita_fecha_hora,
      cita_calendar_url,
      pdf_object_key,
      pdf_original_name
    FROM form_leads
    ${whereClause}
    ORDER BY datetime(created_at) DESC
    LIMIT ? OFFSET ?
  `;

  const [{ total } = { total: 0 }] = (await env.FORM_DB.prepare(countSql).bind(...filters).all()).results || [];
  const listResults = await env.FORM_DB.prepare(listSql).bind(...filters, limit, offset).all();

  return json(
    {
      ok: true,
      items: (listResults.results || []).map((item) => ({
        ...item,
        has_file: Boolean(item.pdf_object_key),
      })),
      total: Number(total || 0),
      limit,
      offset,
    },
    200,
    env,
    request
  );
}

async function handleAdminLeadDetail(request, env, leadId) {
  const admin = requireAdmin(request, env);
  if (admin.response) {
    return admin.response;
  }

  const leadResult = await env.FORM_DB.prepare(`
    SELECT *
    FROM form_leads
    WHERE id = ?
    LIMIT 1
  `).bind(leadId).all();

  const lead = leadResult.results?.[0];
  if (!lead) {
    return json({ error: 'Lead not found' }, 404, env, request);
  }

  const notesResult = await env.FORM_DB.prepare(`
    SELECT id, lead_id, note_text, author_email, created_at
    FROM lead_notes
    WHERE lead_id = ?
    ORDER BY datetime(created_at) DESC
  `).bind(leadId).all();

  const eventsResult = await env.FORM_DB.prepare(`
    SELECT id, lead_id, event_type, actor_email, payload_json, created_at
    FROM lead_events
    WHERE lead_id = ?
    ORDER BY datetime(created_at) DESC
    LIMIT 30
  `).bind(leadId).all();

  return json(
    {
      ok: true,
      lead: {
        ...lead,
        has_file: Boolean(lead.pdf_object_key),
      },
      notes: notesResult.results || [],
      events: (eventsResult.results || []).map((event) => ({
        ...event,
        payload: safeJsonParse(event.payload_json),
      })),
    },
    200,
    env,
    request
  );
}

async function handleAdminLeadFile(request, env, leadId) {
  const admin = requireAdmin(request, env);
  if (admin.response) {
    return admin.response;
  }

  const leadResult = await env.FORM_DB.prepare(`
    SELECT pdf_object_key, pdf_original_name
    FROM form_leads
    WHERE id = ?
    LIMIT 1
  `).bind(leadId).all();

  const lead = leadResult.results?.[0];
  if (!lead?.pdf_object_key) {
    return json({ error: 'File not found' }, 404, env, request);
  }

  const object = await env.FORM_UPLOADS.get(lead.pdf_object_key);
  if (!object) {
    return json({ error: 'Stored file not found' }, 404, env, request);
  }

  const headers = new Headers(corsHeaders(env, request));
  headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
  headers.set('Content-Disposition', `inline; filename="${lead.pdf_original_name || 'adjunto'}"`);

  return new Response(object.body, { status: 200, headers });
}

async function handleAdminLeadNote(request, env, leadId) {
  const admin = requireAdmin(request, env);
  if (admin.response) {
    return admin.response;
  }

  const body = await request.json().catch(() => ({}));
  const note = String(body.note || '').trim();
  if (!note) {
    return json({ error: 'Note is required' }, 400, env, request);
  }

  const now = new Date().toISOString();
  await env.FORM_DB.prepare(`
    INSERT INTO lead_notes (id, lead_id, note_text, author_email, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    leadId,
    note,
    admin.actorEmail,
    now
  ).run();

  await insertLeadEvent(env, {
    leadId,
    eventType: 'note_added',
    actorEmail: admin.actorEmail,
    payload: { note },
    createdAt: now,
  });

  return json({ ok: true }, 200, env, request);
}

async function handleAdminLeadStatus(request, env, leadId) {
  const admin = requireAdmin(request, env);
  if (admin.response) {
    return admin.response;
  }

  const body = await request.json().catch(() => ({}));
  const status = String(body.status || '').trim();
  if (!status) {
    return json({ error: 'Status is required' }, 400, env, request);
  }

  const now = new Date().toISOString();
  await env.FORM_DB.prepare(`
    UPDATE form_leads
    SET status = ?, updated_at = ?
    WHERE id = ?
  `).bind(status, now, leadId).run();

  await insertLeadEvent(env, {
    leadId,
    eventType: 'status_changed',
    actorEmail: admin.actorEmail,
    payload: { status },
    createdAt: now,
  });

  return json({ ok: true }, 200, env, request);
}

async function handleAdminLeadRut(request, env, leadId) {
  const admin = requireAdmin(request, env);
  if (admin.response) {
    return admin.response;
  }

  const body = await request.json().catch(() => ({}));
  const rut = normalizeRut(String(body.rut || ''));
  if (rut && !isValidRut(rut)) {
    return json({ error: 'RUT inválido' }, 400, env, request);
  }

  const now = new Date().toISOString();
  await env.FORM_DB.prepare(`
    UPDATE form_leads
    SET rut = ?, updated_at = ?
    WHERE id = ?
  `).bind(rut, now, leadId).run();

  await insertLeadEvent(env, {
    leadId,
    eventType: 'rut_updated',
    actorEmail: admin.actorEmail,
    payload: { rut },
    createdAt: now,
  });

  return json({ ok: true, rut }, 200, env, request);
}

async function handleAdminLeadArchive(request, env, leadId) {
  const admin = requireAdmin(request, env);
  if (admin.response) {
    return admin.response;
  }

  const body = await request.json().catch(() => ({}));
  const reason = String(body.reason || '').trim();
  const now = new Date().toISOString();

  await env.FORM_DB.prepare(`
    UPDATE form_leads
    SET status = ?, updated_at = ?
    WHERE id = ?
  `).bind('Archivado', now, leadId).run();

  await insertLeadEvent(env, {
    leadId,
    eventType: 'archived',
    actorEmail: admin.actorEmail,
    payload: { reason },
    createdAt: now,
  });

  return json({ ok: true }, 200, env, request);
}

function normalizeLead(payload, leadId, now, fallbackStatus) {
  return {
    id: leadId,
    created_at: now,
    updated_at: now,
    status: payload.status || fallbackStatus,
    fuente_cta: payload.fuente_cta || 'Organico',
    campana: payload.campana || 'No especificado',
    sheetName: payload.sheetName || '',
    nombre: payload.nombre || '',
    email: payload.email || '',
    telefono: payload.telefono || '',
    rut: normalizeRut(payload.rut || ''),
    rango_edad: payload.rango_edad || '',
    comuna: payload.comuna || '',
    region: payload.region || '',
    sistema_actual: payload.sistema_actual || '',
    isapre_especifica: payload.isapre_especifica || '',
    num_cargas: payload.num_cargas || '',
    edad_cargas: payload.edad_cargas || '',
    rango_renta: payload.rango_renta || '',
    rango_costo: payload.rango_costo || '',
    comentarios: payload.comentarios || '',
    cita_estado: payload.cita_estado || '',
    cita_fecha_hora: payload.cita_fecha_hora || '',
    cita_calendar_event_id: payload.cita_calendar_event_id || '',
    cita_calendar_url: payload.cita_calendar_url || '',
    raw_payload: payload,
  };
}

async function formDataToFields(formData) {
  const fields = {};
  let file = null;

  for (const [key, value] of formData.entries()) {
    if (key === 'archivo' && value && typeof value === 'object' && 'arrayBuffer' in value) {
      file = value;
      continue;
    }
    if (typeof value === 'string') {
      fields[key] = value;
    } else if (value == null) {
      fields[key] = '';
    } else {
      // For safety, coerce unexpected types to string.
      fields[key] = String(value);
    }
  }

  return { fields, file };
}

function decodeBase64(base64) {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return bytes;
}

function requireAdmin(request, env) {
  const url = new URL(request.url);
  const accessEmail =
    request.headers.get('Cf-Access-Authenticated-User-Email') ||
    request.headers.get('cf-access-authenticated-user-email') ||
    '';

  if (accessEmail) {
    return { actorEmail: accessEmail, authMode: 'cloudflare-access' };
  }

  const adminKey = request.headers.get('X-Admin-Key') || url.searchParams.get('adminKey') || '';
  if (env.ADMIN_API_KEY && adminKey && adminKey === env.ADMIN_API_KEY) {
    return { actorEmail: 'local-admin', authMode: 'admin-key' };
  }

  return {
    response: json(
      {
        error: 'Unauthorized',
        message: 'Cloudflare Access o X-Admin-Key requerido.',
      },
      401,
      env,
      request
    ),
  };
}

async function insertLeadEvent(env, { leadId, eventType, actorEmail, payload, createdAt }) {
  await env.FORM_DB.prepare(`
    INSERT INTO lead_events (id, lead_id, event_type, actor_email, payload_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    leadId,
    eventType,
    actorEmail,
    JSON.stringify(payload || {}),
    createdAt || new Date().toISOString()
  ).run();
}

function clampInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}

function safeJsonParse(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function buildUploadFilename({ originalName, leadId, leadName, createdAt }) {
  const datePart = (createdAt || new Date().toISOString()).slice(0, 10);
  const namePart = slugifyFilePart(leadName || 'sin-nombre');
  const leadPart = String(leadId || '').slice(0, 8) || 'lead';
  const extension = getSafeExtension(originalName);
  return `${datePart}_${namePart}_${leadPart}.${extension}`;
}

function slugifyFilePart(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'archivo';
}

function getSafeExtension(filename) {
  const raw = String(filename || '').trim();
  const parts = raw.split('.');
  const ext = parts.length > 1 ? parts.pop().toLowerCase() : 'pdf';
  return /^[a-z0-9]{2,5}$/.test(ext) ? ext : 'pdf';
}

function cleanRut(value) {
  return String(value || '')
    .replace(/[^0-9kK]/g, '')
    .toUpperCase();
}

function normalizeRut(value) {
  const cleaned = cleanRut(value);
  if (cleaned.length < 2) {
    return cleaned;
  }
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  const bodyWithDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${bodyWithDots}-${dv}`;
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

function isValidRut(value) {
  const cleaned = cleanRut(value);
  if (!/^\d{7,8}[0-9K]$/.test(cleaned)) {
    return false;
  }
  return calculateRutDv(cleaned.slice(0, -1)) === cleaned.slice(-1);
}

function json(body, status, env, request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(env, request),
    },
  });
}

function corsHeaders(env, request) {
  const allowedRaw = env.FORM_ALLOWED_ORIGIN || '*';
  const allowed = String(allowedRaw)
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const requestOrigin = (request?.headers?.get?.('Origin') || '').replace(/\/$/, '');

  // Allow any local dev port without needing to keep the allowlist in sync.
  if (/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(requestOrigin)) {
    return {
      'Access-Control-Allow-Origin': requestOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
    };
  }

  let origin = '*';
  if (allowed.includes('*')) {
    origin = '*';
  } else if (requestOrigin && allowed.includes(requestOrigin)) {
    origin = requestOrigin;
  } else if (allowed.length > 0) {
    // Return an origin that will intentionally fail CORS when not in allowlist.
    origin = 'null';
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
  };
}
