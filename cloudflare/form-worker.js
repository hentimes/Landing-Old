export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env) });
    }

    if (request.method === 'POST' && url.pathname === '/api/form/leads') {
      return handleLeadCreate(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/form/leads/abandoned') {
      return handleLeadAbandoned(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/api/form/appointments') {
      return handleAppointmentUpdate(request, env);
    }

    return json({ error: 'Not found' }, 404, env);
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
    pdfOriginalName = uploadedFile.name || `${leadId}.pdf`;
    pdfObjectKey = `leads/${leadId}/${pdfOriginalName}`;
    const bytes = new Uint8Array(await uploadedFile.arrayBuffer());
    await env.FORM_UPLOADS.put(pdfObjectKey, bytes, {
      httpMetadata: { contentType: uploadedFile.type || 'application/pdf' },
    });
  } else if (payload.base64pdf) {
    const pdf = decodeBase64(payload.base64pdf);
    pdfOriginalName = payload.filename || `${leadId}.pdf`;
    pdfObjectKey = `leads/${leadId}/${pdfOriginalName}`;
    await env.FORM_UPLOADS.put(pdfObjectKey, pdf, {
      httpMetadata: { contentType: 'application/pdf' },
    });
  }

  await env.FORM_DB.prepare(`
    INSERT INTO form_leads (
      id, created_at, updated_at, status, cta, campana, sheet_name,
      nombre, email, telefono, rango_edad, comuna, region,
      sistema_actual, isapre_especifica, num_cargas, edad_cargas,
      rango_renta, rango_costo, comentarios,
      cita_estado, cita_fecha_hora, cita_calendar_event_id, cita_calendar_url,
      pdf_object_key, pdf_original_name, raw_payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

  return json({ ok: true, leadId }, 200, env);
}

async function handleLeadAbandoned(request, env) {
  const payload = await request.json().catch(() => ({}));
  const leadId = crypto.randomUUID();
  const now = new Date().toISOString();
  const normalized = normalizeLead(payload, leadId, now, 'Abandonado');

  await env.FORM_DB.prepare(`
    INSERT INTO form_leads (
      id, created_at, updated_at, status, cta, campana, sheet_name,
      nombre, email, telefono, rango_edad, comuna, region,
      sistema_actual, isapre_especifica, num_cargas, edad_cargas,
      rango_renta, rango_costo, comentarios,
      cita_estado, cita_fecha_hora, cita_calendar_event_id, cita_calendar_url,
      raw_payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

  return json({ ok: true, leadId }, 200, env);
}

async function handleAppointmentUpdate(request, env) {
  const payload = await request.json().catch(() => ({}));
  if (!payload.leadId) {
    return json({ error: 'leadId is required' }, 400, env);
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

  return json({ ok: true }, 200, env);
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

function json(body, status, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(env),
    },
  });
}

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.FORM_ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
