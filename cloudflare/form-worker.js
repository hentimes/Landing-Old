export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const leadDeleteMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/delete$/);
    const leadDetailMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)$/);
    const leadFileMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/file$/);
    const leadNotesMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/notes$/);
    const leadStatusMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/status$/);
    const leadRutMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/rut$/);
    const leadArchiveMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/archive$/);
    const leadAppointmentMatch = url.pathname.match(/^\/api\/admin\/leads\/([^/]+)\/appointment$/);
    const publicAvailabilityMatch = url.pathname === '/api/public/availability';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env, request) });
    }

    try {
      if (request.method === 'GET' && url.pathname === '/api/auth/google/start') {
        return await handleGoogleAuthStart(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/api/auth/google/callback') {
        return await handleGoogleAuthCallback(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/api/form/leads') {
        return await handleLeadCreate(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/api/form/leads/abandoned') {
        return await handleLeadAbandoned(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/api/form/appointments') {
        return await handleAppointmentUpdate(request, env);
      }

      if (request.method === 'GET' && publicAvailabilityMatch) {
        return await handlePublicAvailability(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/api/admin/session') {
        return await handleAdminSession(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/api/admin/advisor/profile') {
        return await handleAdminAdvisorProfile(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/api/admin/advisor/profile') {
        return await handleAdminAdvisorProfileUpdate(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/api/admin/availability') {
        return await handleAdminAvailability(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/api/admin/availability') {
        return await handleAdminAvailabilityUpdate(request, env);
      }

      if (request.method === 'GET' && url.pathname === '/api/admin/leads') {
        return await handleAdminLeadList(request, env);
      }

      if (request.method === 'POST' && url.pathname === '/api/admin/leads') {
        return await handleAdminLeadCreate(request, env);
      }

      if (request.method === 'GET' && leadDetailMatch) {
        return await handleAdminLeadDetail(request, env, leadDetailMatch[1]);
      }

      if ((request.method === 'DELETE' && leadDetailMatch) || (request.method === 'POST' && leadDeleteMatch)) {
        return await handleAdminLeadDelete(request, env, leadDetailMatch?.[1] || leadDeleteMatch?.[1] || '');
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

      if (request.method === 'POST' && leadAppointmentMatch) {
        return await handleAdminLeadAppointment(request, env, leadAppointmentMatch[1]);
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
  const advisor = await ensureAdvisorRecord(env, normalized.advisor_id || request.headers.get('Cf-Access-Authenticated-User-Email') || 'local-admin');
  normalized.advisor_id = advisor.id;
  if (normalized.contacto_preferencia === 'agendar_reunion') {
    if (!normalized.cita_fecha_hora) {
      return json({ error: 'Selecciona un bloque horario disponible' }, 400, env, request);
    }
    await assertSlotAvailableOrThrow(env, advisor, normalized.cita_fecha_hora);
    normalized.cita_estado = normalized.cita_estado || 'Pendiente';
  } else {
    normalized.cita_estado = '';
    normalized.cita_fecha_hora = '';
    normalized.cita_calendar_event_id = '';
    normalized.cita_calendar_url = '';
  }

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
      advisor_id,
      rango_renta, rango_costo, comentarios,
      contacto_preferencia,
      cita_estado, cita_fecha_hora, cita_calendar_event_id, cita_calendar_url,
      pdf_object_key, pdf_original_name, raw_payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    normalized.advisor_id,
    normalized.rango_renta,
    normalized.rango_costo,
    normalized.comentarios,
    normalized.contacto_preferencia,
    normalized.cita_estado,
    normalized.cita_fecha_hora,
    normalized.cita_calendar_event_id,
    normalized.cita_calendar_url,
    pdfObjectKey,
    pdfOriginalName,
    JSON.stringify(normalized.raw_payload)
  ).run();

  const calendarResult = await maybeCreateCalendarEvent(env, normalized, advisor).catch((error) => ({
    ok: false,
    skipped: false,
    reason: 'error',
    error: error?.message || 'calendar_error',
  }));

  if (calendarResult?.ok) {
    const nowUpdate = new Date().toISOString();
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
      nowUpdate,
      calendarResult.cita_estado || normalized.cita_estado || 'Agendada',
      calendarResult.cita_fecha_hora || normalized.cita_fecha_hora || '',
      calendarResult.cita_calendar_event_id || '',
      calendarResult.cita_calendar_url || '',
      leadId
    ).run();

    await insertLeadEvent(env, {
      leadId,
      eventType: 'appointment_created',
      actorEmail: 'system',
      payload: {
        cita_fecha_hora: calendarResult.cita_fecha_hora || normalized.cita_fecha_hora || '',
        cita_calendar_event_id: calendarResult.cita_calendar_event_id || '',
      },
      createdAt: nowUpdate,
    });
  }

  return json({ ok: true, leadId, calendar: calendarResult }, 200, env, request);
}

async function handleLeadAbandoned(request, env) {
  const payload = await request.json().catch(() => ({}));
  const leadId = crypto.randomUUID();
  const now = new Date().toISOString();
  const normalized = normalizeLead(payload, leadId, now, 'Abandonado');
  const advisor = await ensureAdvisorRecord(env, normalized.advisor_id || 'local-admin');
  normalized.advisor_id = advisor.id;

  await env.FORM_DB.prepare(`
    INSERT INTO form_leads (
      id, created_at, updated_at, status, cta, campana, sheet_name,
      nombre, email, telefono, rut, rango_edad, comuna, region,
      sistema_actual, isapre_especifica, num_cargas, edad_cargas,
      advisor_id,
      rango_renta, rango_costo, comentarios,
      contacto_preferencia,
      cita_estado, cita_fecha_hora, cita_calendar_event_id, cita_calendar_url,
      raw_payload
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
    normalized.advisor_id,
    normalized.rango_renta,
    normalized.rango_costo,
    normalized.comentarios,
    normalized.contacto_preferencia,
    normalized.cita_estado,
    normalized.cita_fecha_hora,
    normalized.cita_calendar_event_id,
    normalized.cita_calendar_url,
    JSON.stringify(normalized.raw_payload)
  ).run();

  return json({ ok: true, leadId }, 200, env, request);
}

async function handleAdminLeadCreate(request, env) {
  const admin = requireAdmin(request, env);
  if (admin.response) {
    return admin.response;
  }

  const body = await request.json().catch(() => ({}));
  const leadId = crypto.randomUUID();
  const now = new Date().toISOString();
  const normalized = normalizeLead(body, leadId, now, String(body.status || 'Nuevo').trim() || 'Nuevo');
  const advisor = await ensureAdvisorRecord(env, body.advisor_id || admin.actorEmail || 'local-admin');
  normalized.advisor_id = advisor.id;

  if (!normalized.nombre && !normalized.email && !normalized.telefono) {
    return json({ error: 'Debes ingresar al menos nombre, email o telefono' }, 400, env, request);
  }

  if (normalized.contacto_preferencia === 'agendar_reunion') {
    if (!normalized.cita_fecha_hora) {
      return json({ error: 'Selecciona un bloque horario disponible' }, 400, env, request);
    }
    await assertSlotAvailableOrThrow(env, advisor, normalized.cita_fecha_hora);
    normalized.cita_estado = normalized.cita_estado || 'Pendiente';
  } else {
    normalized.cita_estado = '';
    normalized.cita_fecha_hora = '';
    normalized.cita_calendar_event_id = '';
    normalized.cita_calendar_url = '';
  }

  await env.FORM_DB.prepare(`
    INSERT INTO form_leads (
      id, created_at, updated_at, status, cta, campana, sheet_name,
      nombre, email, telefono, rut, rango_edad, comuna, region,
      sistema_actual, isapre_especifica, num_cargas, edad_cargas,
      advisor_id, rango_renta, rango_costo, comentarios,
      contacto_preferencia, cita_estado, cita_fecha_hora, cita_calendar_event_id, cita_calendar_url,
      pdf_object_key, pdf_original_name, raw_payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    normalized.id,
    normalized.created_at,
    normalized.updated_at,
    normalized.status,
    normalized.fuente_cta || 'CRM',
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
    normalized.advisor_id,
    normalized.rango_renta,
    normalized.rango_costo,
    normalized.comentarios,
    normalized.contacto_preferencia,
    normalized.cita_estado,
    normalized.cita_fecha_hora,
    normalized.cita_calendar_event_id,
    normalized.cita_calendar_url,
    '',
    '',
    JSON.stringify({ ...normalized.raw_payload, created_via: 'crm_admin' })
  ).run();

  const calendarResult = await maybeCreateCalendarEvent(env, normalized, advisor).catch(() => ({ ok: false, skipped: true }));
  if (calendarResult?.ok) {
    const updatedAt = new Date().toISOString();
    await env.FORM_DB.prepare(`
      UPDATE form_leads
      SET updated_at = ?, cita_estado = ?, cita_fecha_hora = ?, cita_calendar_event_id = ?, cita_calendar_url = ?
      WHERE id = ?
    `).bind(
      updatedAt,
      calendarResult.cita_estado || normalized.cita_estado || 'Agendada',
      calendarResult.cita_fecha_hora || normalized.cita_fecha_hora || '',
      calendarResult.cita_calendar_event_id || '',
      calendarResult.cita_calendar_url || '',
      leadId
    ).run();
  }

  await insertLeadEvent(env, {
    leadId,
    eventType: 'created_manual',
    actorEmail: admin.actorEmail,
    payload: {
      source: 'crm_admin',
      contacto_preferencia: normalized.contacto_preferencia,
      cita_fecha_hora: normalized.cita_fecha_hora || '',
    },
    createdAt: now,
  });

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
      advisor_id,
      sistema_actual,
      isapre_especifica,
      comentarios,
      contacto_preferencia,
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
    return json({ error: 'RUT invÃ¡lido' }, 400, env, request);
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

async function handleAdminLeadDelete(request, env, leadId) {
  const admin = requireAdmin(request, env);
  if (admin.response) {
    return admin.response;
  }

  const leadResult = await env.FORM_DB.prepare(`
    SELECT id, pdf_object_key, cita_calendar_event_id, advisor_id
    FROM form_leads
    WHERE id = ?
    LIMIT 1
  `).bind(leadId).all();
  const lead = leadResult.results?.[0];
  if (!lead) {
    return json({ error: 'Lead not found' }, 404, env, request);
  }

  const advisor = await ensureAdvisorRecord(env, lead.advisor_id || admin.actorEmail || 'local-admin');
  const now = new Date().toISOString();

  await deleteCalendarEventIfPresent(env, advisor.id, lead.cita_calendar_event_id || '');
  if (lead.pdf_object_key) {
    await env.FORM_UPLOADS.delete(lead.pdf_object_key).catch(() => null);
  }

  await env.FORM_DB.prepare(`DELETE FROM lead_notes WHERE lead_id = ?`).bind(leadId).run();
  await env.FORM_DB.prepare(`DELETE FROM lead_events WHERE lead_id = ?`).bind(leadId).run();
  await env.FORM_DB.prepare(`DELETE FROM form_leads WHERE id = ?`).bind(leadId).run();

  await insertLeadEvent(env, {
    leadId,
    eventType: 'deleted',
    actorEmail: admin.actorEmail,
    payload: { deleted_at: now },
    createdAt: now,
  }).catch(() => null);

  return json({ ok: true, deleted: leadId }, 200, env, request);
}

async function handleAdminLeadAppointment(request, env, leadId) {
  const admin = requireAdmin(request, env);
  if (admin.response) {
    return admin.response;
  }

  const body = await request.json().catch(() => ({}));
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

  const advisor = await ensureAdvisorRecord(env, lead.advisor_id || admin.actorEmail || 'local-admin');
  const action = String(body.action || '').trim() || (body.cita_estado === 'Cancelada' ? 'cancel' : 'reschedule');
  const now = new Date().toISOString();

  if (action === 'cancel') {
    await deleteCalendarEventIfPresent(env, advisor.id, lead.cita_calendar_event_id);
    await env.FORM_DB.prepare(`
      UPDATE form_leads
      SET updated_at = ?, cita_estado = ?, cita_fecha_hora = '', cita_calendar_event_id = '', cita_calendar_url = ''
      WHERE id = ?
    `).bind(now, 'Cancelada', leadId).run();

    await insertLeadEvent(env, {
      leadId,
      eventType: 'appointment_cancelled',
      actorEmail: admin.actorEmail,
      payload: { previous_event_id: lead.cita_calendar_event_id || '' },
      createdAt: now,
    });

    return json({ ok: true }, 200, env, request);
  }

  const citaFechaHora = normalizeLocalDateTime(body.cita_fecha_hora || '');
  if (!citaFechaHora) {
    return json({ error: 'cita_fecha_hora is required' }, 400, env, request);
  }

  await assertSlotAvailableOrThrow(env, advisor, citaFechaHora, leadId);
  const calendarResult = await upsertCalendarEvent(env, advisor, {
    ...lead,
    ...body,
    cita_fecha_hora: citaFechaHora,
  });

  await env.FORM_DB.prepare(`
    UPDATE form_leads
    SET
      updated_at = ?,
      contacto_preferencia = ?,
      cita_estado = ?,
      cita_fecha_hora = ?,
      cita_calendar_event_id = ?,
      cita_calendar_url = ?
    WHERE id = ?
  `).bind(
    now,
    'agendar_reunion',
    body.cita_estado || 'Agendada',
    citaFechaHora,
    calendarResult.cita_calendar_event_id || '',
    calendarResult.cita_calendar_url || '',
    leadId
  ).run();

  await insertLeadEvent(env, {
    leadId,
    eventType: lead.cita_calendar_event_id ? 'appointment_rescheduled' : 'appointment_created',
    actorEmail: admin.actorEmail,
    payload: {
      cita_fecha_hora: citaFechaHora,
      cita_calendar_event_id: calendarResult.cita_calendar_event_id || '',
    },
    createdAt: now,
  });

  return json({ ok: true, appointment: calendarResult }, 200, env, request);
}

async function handleGoogleAuthStart(request, env) {
  const admin = requireAdmin(request, env);
  if (admin.response) {
    return admin.response;
  }

  const clientId = String(env.GOOGLE_OAUTH_CLIENT_ID || '').trim();
  const redirectUri = getGoogleOauthRedirectUri(env, request);
  if (!clientId || !redirectUri) {
    return json({ error: 'Google OAuth no configurado' }, 500, env, request);
  }

  const url = new URL(request.url);
  const returnTo = sanitizeReturnTo(url.searchParams.get('return_to')) || defaultReturnTo(request);
  const advisor = await ensureAdvisorRecord(env, admin.actorEmail);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60_000).toISOString();
  const state = crypto.randomUUID();

  await env.FORM_DB.prepare(`
    INSERT INTO oauth_states (id, advisor_id, return_to, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(state, advisor.id, returnTo, now.toISOString(), expiresAt).run();

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('include_granted_scopes', 'true');
  authUrl.searchParams.set('scope', [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/calendar',
  ].join(' '));
  authUrl.searchParams.set('state', state);

  return Response.redirect(authUrl.toString(), 302);
}

async function handleGoogleAuthCallback(request, env) {
  const url = new URL(request.url);
  const state = String(url.searchParams.get('state') || '').trim();
  const code = String(url.searchParams.get('code') || '').trim();
  const error = String(url.searchParams.get('error') || '').trim();

  if (!state) {
    return new Response('OAuth state faltante', { status: 400 });
  }

  const stateResult = await env.FORM_DB.prepare(`
    SELECT id, advisor_id, return_to, expires_at
    FROM oauth_states
    WHERE id = ?
    LIMIT 1
  `).bind(state).all();

  const oauthState = stateResult.results?.[0];
  if (!oauthState) {
    return new Response('OAuth state no encontrado', { status: 400 });
  }

  await env.FORM_DB.prepare(`DELETE FROM oauth_states WHERE id = ?`).bind(state).run();

  if (Date.parse(oauthState.expires_at) < Date.now()) {
    return Response.redirect(`${oauthState.return_to}?calendar_connected=0&reason=expired`, 302);
  }

  if (error) {
    return Response.redirect(`${oauthState.return_to}?calendar_connected=0&reason=${encodeURIComponent(error)}`, 302);
  }

  if (!code) {
    return Response.redirect(`${oauthState.return_to}?calendar_connected=0&reason=missing_code`, 302);
  }

  try {
    const tokenSet = await exchangeGoogleAuthCode(env, request, code);
    const googleUser = await fetchGoogleUserProfile(tokenSet.access_token);
    const connectedAt = new Date().toISOString();
    const existingResult = await env.FORM_DB.prepare(`
      SELECT refresh_token
      FROM advisor_calendar_connections
      WHERE advisor_id = ?
      LIMIT 1
    `).bind(oauthState.advisor_id).all();
    const existing = existingResult.results?.[0];
    const refreshToken = tokenSet.refresh_token || existing?.refresh_token || '';

    await env.FORM_DB.prepare(`
      INSERT INTO advisor_calendar_connections (
        advisor_id, provider, google_email, calendar_id, refresh_token,
        access_token, token_scope, token_expires_at, created_at, updated_at
      ) VALUES (?, 'google', ?, 'primary', ?, ?, ?, ?, ?, ?)
      ON CONFLICT(advisor_id) DO UPDATE SET
        google_email = excluded.google_email,
        calendar_id = excluded.calendar_id,
        refresh_token = excluded.refresh_token,
        access_token = excluded.access_token,
        token_scope = excluded.token_scope,
        token_expires_at = excluded.token_expires_at,
        updated_at = excluded.updated_at
    `).bind(
      oauthState.advisor_id,
      googleUser.email || '',
      refreshToken,
      tokenSet.access_token || '',
      tokenSet.scope || '',
      tokenSet.expires_at || '',
      connectedAt,
      connectedAt
    ).run();

    await env.FORM_DB.prepare(`
      UPDATE advisors
      SET email = ?, updated_at = ?
      WHERE id = ?
    `).bind(googleUser.email || oauthState.advisor_id, connectedAt, oauthState.advisor_id).run();

    return Response.redirect(`${oauthState.return_to}?calendar_connected=1`, 302);
  } catch (callbackError) {
    return Response.redirect(`${oauthState.return_to}?calendar_connected=0&reason=${encodeURIComponent(callbackError.message || 'oauth_error')}`, 302);
  }
}

async function handleAdminAdvisorProfile(request, env) {
  const admin = requireAdmin(request, env);
  if (admin.response) {
    return admin.response;
  }

  const advisor = await ensureAdvisorRecord(env, admin.actorEmail);
  const connectionResult = await env.FORM_DB.prepare(`
    SELECT google_email, calendar_id, updated_at
    FROM advisor_calendar_connections
    WHERE advisor_id = ?
    LIMIT 1
  `).bind(advisor.id).all();
  const connection = connectionResult.results?.[0] || null;

  const rules = await listAdvisorAvailabilityRules(env, advisor.id);
  const today = new Date().toISOString().slice(0, 10);
  const blocks = await listAdvisorAvailabilityBlocks(env, advisor.id, today, addDaysIso(today, 60));

  return json({
    ok: true,
    advisor,
    google: connection ? { connected: true, ...connection } : { connected: false },
    availability: rules,
    blocks,
    authStartUrl: `/api/auth/google/start?return_to=${encodeURIComponent(defaultReturnTo(request))}`,
  }, 200, env, request);
}

async function handleAdminAdvisorProfileUpdate(request, env) {
  const admin = requireAdmin(request, env);
  if (admin.response) {
    return admin.response;
  }

  const body = await request.json().catch(() => ({}));
  const advisor = await ensureAdvisorRecord(env, admin.actorEmail);
  const now = new Date().toISOString();
  const displayName = String(body.display_name || advisor.display_name || advisor.id).trim() || advisor.id;
  const timezone = String(body.timezone || advisor.timezone || 'America/Santiago').trim() || 'America/Santiago';
  const duration = clampInteger(body.slot_duration_minutes, advisor.slot_duration_minutes || 45, 15, 180);
  const buffer = clampInteger(body.slot_buffer_minutes, advisor.slot_buffer_minutes || 15, 0, 60);
  const workdayStart = sanitizeTimeText(body.workday_start || advisor.workday_start || '08:00');
  const workdayEnd = sanitizeTimeText(body.workday_end || advisor.workday_end || '19:00');
  const allowBusyRequests = body.allow_busy_requests ? 1 : 0;

  await env.FORM_DB.prepare(`
    UPDATE advisors
    SET display_name = ?, timezone = ?, slot_duration_minutes = ?, slot_buffer_minutes = ?,
        workday_start = ?, workday_end = ?, allow_busy_requests = ?, updated_at = ?
    WHERE id = ?
  `).bind(displayName, timezone, duration, buffer, workdayStart, workdayEnd, allowBusyRequests, now, advisor.id).run();

  return json({ ok: true }, 200, env, request);
}

async function handleAdminAvailability(request, env) {
  const admin = requireAdmin(request, env);
  if (admin.response) {
    return admin.response;
  }

  const advisor = await ensureAdvisorRecord(env, admin.actorEmail);
  const url = new URL(request.url);
  const from = sanitizeDateText(url.searchParams.get('from')) || new Date().toISOString().slice(0, 10);
  const to = sanitizeDateText(url.searchParams.get('to')) || addDaysIso(from, 30);
  const rules = await listAdvisorAvailabilityRules(env, advisor.id);
  const blocks = await listAdvisorAvailabilityBlocks(env, advisor.id, from, to);
  const busyIntervals = await listAdvisorBusyIntervals(env, advisor, rules, from, to, blocks);
  const slotGrid = await buildAdvisorAvailabilityGrid(env, advisor, rules, from, to, blocks, busyIntervals);
  const slots = flattenFreeSlots(slotGrid);

  return json({ ok: true, advisor, from, to, rules, blocks, busy_intervals: busyIntervals, slot_grid: slotGrid, slots }, 200, env, request);
}

async function handlePublicAvailability(request, env) {
  const url = new URL(request.url);
  const advisorId = String(url.searchParams.get('advisorId') || url.searchParams.get('advisor_id') || 'local-admin').trim() || 'local-admin';
  const advisor = await ensureAdvisorRecord(env, advisorId);
  const from = sanitizeDateText(url.searchParams.get('from')) || new Date().toISOString().slice(0, 10);
  const to = sanitizeDateText(url.searchParams.get('to')) || addDaysIso(from, 21);
  const rules = await listAdvisorAvailabilityRules(env, advisor.id);
  const blocks = await listAdvisorAvailabilityBlocks(env, advisor.id, from, to);
  const busyIntervals = await listAdvisorBusyIntervals(env, advisor, rules, from, to, blocks);
  const slotGrid = await buildAdvisorAvailabilityGrid(env, advisor, rules, from, to, blocks, busyIntervals);
  const slots = flattenFreeSlots(slotGrid);

  return json({ ok: true, advisor: publicAdvisorShape(advisor), from, to, blocks, busy_intervals: busyIntervals, slot_grid: slotGrid, slots }, 200, env, request);
}

async function handleAdminAvailabilityUpdate(request, env) {
  const admin = requireAdmin(request, env);
  if (admin.response) {
    return admin.response;
  }

  const body = await request.json().catch(() => ({}));
  const advisor = await ensureAdvisorRecord(env, admin.actorEmail);
  const rules = Array.isArray(body.rules) ? body.rules : [];
  const blocks = Array.isArray(body.blocks) ? body.blocks : [];
  const now = new Date().toISOString();

  for (const rule of rules) {
    const day = clampInteger(rule.day_of_week, -1, 0, 6);
    if (day < 0) continue;
    const enabled = rule.is_enabled ? 1 : 0;
    const startTime = sanitizeTimeText(rule.start_time || advisor.workday_start || '08:00');
    const endTime = sanitizeTimeText(rule.end_time || advisor.workday_end || '19:00');
    await env.FORM_DB.prepare(`
      INSERT INTO advisor_availability_rules (
        id, advisor_id, day_of_week, is_enabled, start_time, end_time, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(advisor_id, day_of_week) DO UPDATE SET
        is_enabled = excluded.is_enabled,
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        updated_at = excluded.updated_at
    `).bind(
      crypto.randomUUID(),
      advisor.id,
      day,
      enabled,
      startTime,
      endTime,
      now,
      now
    ).run();
  }

  if (Array.isArray(body.replace_blocks)) {
    const blockIds = body.replace_blocks
      .map((item) => String(item || '').trim())
      .filter(Boolean);
    if (blockIds.length) {
      const placeholders = blockIds.map(() => '?').join(', ');
      await env.FORM_DB.prepare(`
        DELETE FROM advisor_availability_blocks
        WHERE advisor_id = ?
          AND id IN (${placeholders})
      `).bind(advisor.id, ...blockIds).run();
    }
  }

  for (const block of blocks) {
    const normalizedBlock = normalizeAvailabilityBlock(block, advisor);
    const startsAt = normalizedBlock.starts_at;
    const endsAt = normalizedBlock.ends_at;
    if (!startsAt || !endsAt) continue;
    await env.FORM_DB.prepare(`
      INSERT INTO advisor_availability_blocks (
        id, advisor_id, starts_at, ends_at, block_type, note, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        starts_at = excluded.starts_at,
        ends_at = excluded.ends_at,
        block_type = excluded.block_type,
        note = excluded.note,
        updated_at = excluded.updated_at
    `).bind(
      String(normalizedBlock.id || crypto.randomUUID()),
      advisor.id,
      startsAt,
      endsAt,
      String(normalizedBlock.block_type || 'manual'),
      String(normalizedBlock.note || '').trim(),
      now,
      now
    ).run();
  }

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
    advisor_id: payload.advisor_id || payload.advisorId || '',
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
    contacto_preferencia: normalizeContactPreference(payload.contacto_preferencia || payload.contact_preference || ''),
    cita_estado: payload.cita_estado || '',
    cita_fecha_hora: payload.cita_fecha_hora || '',
    cita_calendar_event_id: payload.cita_calendar_event_id || '',
    cita_calendar_url: payload.cita_calendar_url || '',
    raw_payload: payload,
  };
}

async function maybeCreateCalendarEvent(env, normalizedLead, advisor) {
  const citaRaw = String(normalizedLead?.cita_fecha_hora || '').trim();
  if (!citaRaw) return { ok: false, skipped: true, reason: 'no_cita_fecha_hora' };

  const tokenContext = await resolveCalendarTokenContext(env, advisor?.id || normalizedLead?.advisor_id || 'local-admin');
  if (!tokenContext.ok) return tokenContext;

  const timezone = String(advisor?.timezone || env.GCAL_TIMEZONE || 'America/Santiago').trim() || 'America/Santiago';
  const startLocal = normalizeLocalDateTime(citaRaw);
  const appointmentMinutes = Number(advisor?.slot_duration_minutes || 45);
  const endLocal = addMinutesToLocalDateTime(startLocal, appointmentMinutes);

  const summaryName = (normalizedLead?.nombre || 'Lead').trim() || 'Lead';
  const systemLabel = (normalizedLead?.sistema_actual || '').trim();
  const isapreLabel = (normalizedLead?.isapre_especifica || '').trim();

  const descriptionLines = [
    'Lead PlanesPro',
    '',
    summaryName ? `Nombre: ${summaryName}` : null,
    normalizedLead?.telefono ? `Telefono: ${normalizedLead.telefono}` : null,
    normalizedLead?.email ? `Email: ${normalizedLead.email}` : null,
    normalizedLead?.comuna ? `Comuna: ${normalizedLead.comuna}` : null,
    normalizedLead?.region ? `Region: ${normalizedLead.region}` : null,
    systemLabel ? `Sistema: ${systemLabel}` : null,
    isapreLabel ? `Isapre: ${isapreLabel}` : null,
    normalizedLead?.rut ? `RUT: ${normalizedLead.rut}` : null,
    normalizedLead?.comentarios ? `Comentario: ${normalizedLead.comentarios}` : null,
  ].filter(Boolean);

  const body = {
    summary: `Cita PlanesPro - ${summaryName}`,
    description: descriptionLines.join('\n').slice(0, 8000),
    start: { dateTime: startLocal, timeZone: timezone },
    end: { dateTime: endLocal, timeZone: timezone },
  };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(tokenContext.calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenContext.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = result?.error?.message || result?.message || 'Failed to create calendar event';
    throw new Error(message);
  }

  return {
    ok: true,
    cita_estado: 'Agendada',
    cita_fecha_hora: startLocal,
    cita_calendar_event_id: result?.id || '',
    cita_calendar_url: result?.htmlLink || '',
    calendar_provider: tokenContext.provider,
  };
}

async function upsertCalendarEvent(env, advisor, leadLike) {
  const citaRaw = String(leadLike?.cita_fecha_hora || '').trim();
  if (!citaRaw) {
    return { ok: false, skipped: true, reason: 'no_cita_fecha_hora' };
  }

  const tokenContext = await resolveCalendarTokenContext(env, advisor?.id || leadLike?.advisor_id || 'local-admin');
  if (!tokenContext.ok) {
    return {
      ok: true,
      cita_estado: leadLike?.cita_estado || 'Agendada',
      cita_fecha_hora: normalizeLocalDateTime(citaRaw),
      cita_calendar_event_id: leadLike?.cita_calendar_event_id || '',
      cita_calendar_url: leadLike?.cita_calendar_url || '',
      calendar_provider: 'none',
      skipped_calendar_sync: true,
    };
  }

  const timezone = String(advisor?.timezone || env.GCAL_TIMEZONE || 'America/Santiago').trim() || 'America/Santiago';
  const startLocal = normalizeLocalDateTime(citaRaw);
  const appointmentMinutes = Number(advisor?.slot_duration_minutes || 45);
  const endLocal = addMinutesToLocalDateTime(startLocal, appointmentMinutes);

  const summaryName = (leadLike?.nombre || 'Lead').trim() || 'Lead';
  const descriptionLines = [
    'Lead PlanesPro',
    '',
    summaryName ? `Nombre: ${summaryName}` : null,
    leadLike?.telefono ? `Telefono: ${leadLike.telefono}` : null,
    leadLike?.email ? `Email: ${leadLike.email}` : null,
    leadLike?.comuna ? `Comuna: ${leadLike.comuna}` : null,
    leadLike?.region ? `Region: ${leadLike.region}` : null,
    leadLike?.sistema_actual ? `Sistema: ${leadLike.sistema_actual}` : null,
    leadLike?.isapre_especifica ? `Isapre: ${leadLike.isapre_especifica}` : null,
    leadLike?.rut ? `RUT: ${leadLike.rut}` : null,
    leadLike?.comentarios ? `Comentario: ${leadLike.comentarios}` : null,
  ].filter(Boolean);

  const body = {
    summary: `Cita PlanesPro - ${summaryName}`,
    description: descriptionLines.join('\n').slice(0, 8000),
    start: { dateTime: startLocal, timeZone: timezone },
    end: { dateTime: endLocal, timeZone: timezone },
  };

  const existingEventId = String(leadLike?.cita_calendar_event_id || '').trim();
  const endpoint = existingEventId
    ? `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(tokenContext.calendarId)}/events/${encodeURIComponent(existingEventId)}`
    : `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(tokenContext.calendarId)}/events`;
  const response = await fetch(endpoint, {
    method: existingEventId ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${tokenContext.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result?.error?.message || result?.message || 'No se pudo sincronizar la cita con Google Calendar');
  }

  return {
    ok: true,
    cita_estado: leadLike?.cita_estado || 'Agendada',
    cita_fecha_hora: startLocal,
    cita_calendar_event_id: result?.id || existingEventId,
    cita_calendar_url: result?.htmlLink || leadLike?.cita_calendar_url || '',
    calendar_provider: tokenContext.provider,
  };
}

async function deleteCalendarEventIfPresent(env, advisorId, eventId) {
  const normalizedEventId = String(eventId || '').trim();
  if (!normalizedEventId) return;

  const tokenContext = await resolveCalendarTokenContext(env, advisorId);
  if (!tokenContext.ok) return;

  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(tokenContext.calendarId)}/events/${encodeURIComponent(normalizedEventId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenContext.accessToken}` },
    }
  );
}

async function resolveCalendarTokenContext(env, advisorId) {
  const connectionResult = await env.FORM_DB.prepare(`
    SELECT advisor_id, provider, google_email, calendar_id, refresh_token, access_token, token_scope, token_expires_at
    FROM advisor_calendar_connections
    WHERE advisor_id = ?
    LIMIT 1
  `).bind(advisorId).all();

  const connection = connectionResult.results?.[0];
  if (connection?.refresh_token) {
    const accessToken = await getAdvisorGoogleAccessToken(env, connection);
    return {
      ok: true,
      provider: 'google-oauth',
      accessToken,
      calendarId: connection.calendar_id || 'primary',
      googleEmail: connection.google_email || '',
    };
  }

  const saEmail = String(env.GCAL_SA_EMAIL || '').trim();
  const privateKeyRaw = String(env.GCAL_SA_PRIVATE_KEY || '').trim();
  const calendarId = String(env.GCAL_CALENDAR_ID || '').trim();
  if (!saEmail || !privateKeyRaw || !calendarId) {
    return {
      ok: false,
      skipped: true,
      reason: 'missing_calendar_config',
      missing: {
        google_oauth_connection: !connection?.refresh_token,
        GCAL_SA_EMAIL: !saEmail,
        GCAL_SA_PRIVATE_KEY: !privateKeyRaw,
        GCAL_CALENDAR_ID: !calendarId,
      },
    };
  }

  const accessToken = await getGoogleServiceAccountAccessToken({
    saEmail,
    privateKey: privateKeyRaw,
    scope: 'https://www.googleapis.com/auth/calendar',
  });

  return {
    ok: true,
    provider: 'google-service-account',
    accessToken,
    calendarId,
    googleEmail: saEmail,
  };
}

async function getAdvisorGoogleAccessToken(env, connection) {
  const expiresAt = connection.token_expires_at ? Date.parse(connection.token_expires_at) : 0;
  if (connection.access_token && expiresAt > Date.now() + 60_000) {
    return connection.access_token;
  }

  const clientId = String(env.GOOGLE_OAUTH_CLIENT_ID || '').trim();
  const clientSecret = String(env.GOOGLE_OAUTH_CLIENT_SECRET || '').trim();
  if (!clientId || !clientSecret || !connection.refresh_token) {
    throw new Error('Google OAuth incompleto para este asesor');
  }

  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: connection.refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  const tokenJson = await tokenResp.json().catch(() => ({}));
  if (!tokenResp.ok || !tokenJson?.access_token) {
    throw new Error(tokenJson?.error_description || tokenJson?.error || 'No se pudo refrescar Google token');
  }

  const expiresAtIso = new Date(Date.now() + Number(tokenJson.expires_in || 3600) * 1000).toISOString();
  await env.FORM_DB.prepare(`
    UPDATE advisor_calendar_connections
    SET access_token = ?, token_expires_at = ?, updated_at = ?
    WHERE advisor_id = ?
  `).bind(tokenJson.access_token, expiresAtIso, new Date().toISOString(), connection.advisor_id).run();

  return tokenJson.access_token;
}

async function exchangeGoogleAuthCode(env, request, code) {
  const clientId = String(env.GOOGLE_OAUTH_CLIENT_ID || '').trim();
  const clientSecret = String(env.GOOGLE_OAUTH_CLIENT_SECRET || '').trim();
  const redirectUri = getGoogleOauthRedirectUri(env, request);
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Google OAuth no configurado');
  }

  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  const tokenJson = await tokenResp.json().catch(() => ({}));
  if (!tokenResp.ok || !tokenJson?.access_token) {
    throw new Error(tokenJson?.error_description || tokenJson?.error || 'No se pudo completar Google OAuth');
  }

  return {
    access_token: tokenJson.access_token,
    refresh_token: tokenJson.refresh_token || '',
    scope: tokenJson.scope || '',
    token_type: tokenJson.token_type || '',
    expires_at: new Date(Date.now() + Number(tokenJson.expires_in || 3600) * 1000).toISOString(),
  };
}

async function fetchGoogleUserProfile(accessToken) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || 'No se pudo leer perfil Google');
  }
  return payload;
}

async function listAdvisorAvailabilitySlots(env, advisor, rules, fromDate, toDate) {
  const slotGrid = await buildAdvisorAvailabilityGrid(env, advisor, rules, fromDate, toDate);
  return flattenFreeSlots(slotGrid);
}

async function buildAdvisorAvailabilityGrid(env, advisor, rules, fromDate, toDate, preloadedBlocks = null, preloadedBusyIntervals = null) {
  const startDate = sanitizeDateText(fromDate);
  const endDate = sanitizeDateText(toDate);
  if (!startDate || !endDate) return [];

  const rulesToUse = Array.isArray(rules) ? rules : await listAdvisorAvailabilityRules(env, advisor.id);
  const blocks = Array.isArray(preloadedBlocks) ? preloadedBlocks : await listAdvisorAvailabilityBlocks(env, advisor.id, startDate, endDate);
  const busyIntervals = Array.isArray(preloadedBusyIntervals)
    ? preloadedBusyIntervals
    : await listAdvisorBusyIntervals(env, advisor, rulesToUse, startDate, endDate, blocks);
  const days = [];
  const slotSpanMinutes = Number(advisor.slot_duration_minutes || 45) + Number(advisor.slot_buffer_minutes || 15);
  for (let cursor = startDate; cursor <= endDate; cursor = addDaysIso(cursor, 1)) {
    const dayOfWeek = new Date(`${cursor}T12:00:00Z`).getUTCDay();
    const rule = rulesToUse.find((item) => Number(item.day_of_week) === dayOfWeek);
    if (!rule || !Number(rule.is_enabled)) {
      days.push({
        date: cursor,
        day_of_week: dayOfWeek,
        enabled: false,
        start_time: '',
        end_time: '',
        slots: [],
      });
      continue;
    }

    const dayStartMinutes = timeTextToMinutes(rule.start_time);
    const dayEndMinutes = timeTextToMinutes(rule.end_time);
    const daySlots = [];
    for (let minuteCursor = dayStartMinutes; minuteCursor + Number(advisor.slot_duration_minutes || 45) <= dayEndMinutes; minuteCursor += slotSpanMinutes) {
      const localStart = `${cursor}T${minutesToTimeText(minuteCursor)}:00`;
      const localEnd = addMinutesToLocalDateTime(localStart, Number(advisor.slot_duration_minutes || 45));
      const startUtcMs = Date.parse(zonedLocalToUtcIso(localStart, advisor.timezone));
      const endUtcMs = Date.parse(zonedLocalToUtcIso(localEnd, advisor.timezone));
      const interval = pickBusyIntervalForSlot(busyIntervals, startUtcMs, endUtcMs);
      daySlots.push({
        advisor_id: advisor.id,
        starts_at: localStart,
        ends_at: localEnd,
        label: formatSlotLabel(localStart),
        timezone: advisor.timezone,
        status: interval ? mapBusyIntervalToSlotStatus(interval) : 'free',
        disabled: Boolean(interval),
        busy_source: interval?.source || '',
        lead_id: interval?.lead_id || '',
        block_id: interval?.block_id || '',
        note: interval?.note || '',
      });
    }
    days.push({
      date: cursor,
      day_of_week: dayOfWeek,
      enabled: true,
      start_time: rule.start_time,
      end_time: rule.end_time,
      slots: daySlots,
    });
  }
  return days;
}

function flattenFreeSlots(dayGrid = []) {
  return dayGrid.flatMap((day) => (day.slots || []).filter((slot) => slot.status === 'free'));
}

function mapBusyIntervalToSlotStatus(interval = {}) {
  if (interval.source === 'manual') return 'manual_block';
  if (interval.source === 'google') return 'busy_google';
  return 'busy_crm';
}

function pickBusyIntervalForSlot(busyIntervals = [], startUtcMs, endUtcMs) {
  const overlaps = (busyIntervals || []).filter((item) => item.startMs < endUtcMs && item.endMs > startUtcMs);
  if (!overlaps.length) return null;
  const priority = { manual: 3, lead: 2, google: 1 };
  overlaps.sort((a, b) => (priority[b.source] || 0) - (priority[a.source] || 0));
  return overlaps[0];
}

async function listAdvisorBusyIntervals(env, advisor, _rules, fromDate, toDate, preloadedBlocks = null) {
  const startDate = sanitizeDateText(fromDate);
  const endDate = sanitizeDateText(toDate);
  if (!startDate || !endDate) return [];

  const tokenContext = await resolveCalendarTokenContext(env, advisor.id);
  const googleBusyIntervals = tokenContext.ok
    ? await fetchGoogleBusyIntervals(tokenContext.accessToken, tokenContext.calendarId, advisor.timezone, startDate, endDate)
    : [];
  const manualBlocks = Array.isArray(preloadedBlocks)
    ? preloadedBlocks
    : await listAdvisorAvailabilityBlocks(env, advisor.id, startDate, endDate);
  const leadBusyIntervals = await listLeadBusyIntervals(env, advisor, startDate, endDate);

  return [
    ...googleBusyIntervals.map((item) => ({
      startMs: item.startMs,
      endMs: item.endMs,
      starts_at: item.starts_at,
      ends_at: item.ends_at,
      source: 'google',
      note: 'Ocupado en Google Calendar',
    })),
    ...leadBusyIntervals.map((item) => ({
      startMs: item.startMs,
      endMs: item.endMs,
      starts_at: item.starts_at,
      ends_at: item.ends_at,
      source: 'lead',
      note: item.note || 'Cita del CRM',
      lead_id: item.lead_id || '',
    })),
    ...manualBlocks.map((block) => ({
      startMs: Date.parse(zonedLocalToUtcIso(normalizeLocalDateTime(block.starts_at), advisor.timezone)),
      endMs: Date.parse(zonedLocalToUtcIso(normalizeLocalDateTime(block.ends_at), advisor.timezone)),
      starts_at: normalizeLocalDateTime(block.starts_at),
      ends_at: normalizeLocalDateTime(block.ends_at),
      id: block.id || '',
      source: 'manual',
      note: block.note || 'Bloqueo manual',
      block_id: block.id || '',
    })),
  ].filter((item) => Number.isFinite(item.startMs) && Number.isFinite(item.endMs));
}

async function fetchGoogleBusyIntervals(accessToken, calendarId, timeZone, fromDate, toDate) {
  const body = {
    timeMin: zonedLocalToUtcIso(`${fromDate}T00:00:00`, timeZone),
    timeMax: zonedLocalToUtcIso(`${addDaysIso(toDate, 1)}T00:00:00`, timeZone),
    timeZone,
    items: [{ id: calendarId || 'primary' }],
  };
  const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || 'No se pudo consultar disponibilidad');
  }
  const busy = payload?.calendars?.[calendarId || 'primary']?.busy || [];
  return busy.map((item) => ({
    startMs: Date.parse(item.start),
    endMs: Date.parse(item.end),
    starts_at: utcIsoToLocalDateTime(item.start, timeZone),
    ends_at: utcIsoToLocalDateTime(item.end, timeZone),
  })).filter((item) => Number.isFinite(item.startMs) && Number.isFinite(item.endMs));
}

async function listLeadBusyIntervals(env, advisor, fromDate, toDate) {
  const result = await env.FORM_DB.prepare(`
    SELECT id, cita_fecha_hora, cita_estado
    FROM form_leads
    WHERE advisor_id = ?
      AND cita_fecha_hora IS NOT NULL
      AND cita_fecha_hora != ''
      AND date(substr(cita_fecha_hora, 1, 10)) BETWEEN date(?) AND date(?)
      AND lower(coalesce(cita_estado, '')) NOT IN ('cancelada')
  `).bind(advisor.id, fromDate, toDate).all();

  return (result.results || []).map((item) => {
    const startsAt = normalizeLocalDateTime(item.cita_fecha_hora);
    const endsAt = addMinutesToLocalDateTime(startsAt, Number(advisor.slot_duration_minutes || 45) + Number(advisor.slot_buffer_minutes || 15));
    return {
      startMs: Date.parse(zonedLocalToUtcIso(startsAt, advisor.timezone)),
      endMs: Date.parse(zonedLocalToUtcIso(endsAt, advisor.timezone)),
      starts_at: startsAt,
      ends_at: endsAt,
      lead_id: item.id,
      note: item.cita_estado || 'Cita del CRM',
    };
  }).filter((item) => Number.isFinite(item.startMs) && Number.isFinite(item.endMs));
}

function normalizeLocalDateTime(value) {
  const raw = String(value || '').trim();
  // Accept ISO, datetime-local, or ISO with seconds. Keep as RFC3339 without offset.
  // Examples: 2026-04-28T15:30, 2026-04-28T15:30:00, 2026-04-28T15:30:00.000Z
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return raw;
  const date = match[1];
  const hh = match[2];
  const mm = match[3];
  const ss = match[4] || '00';
  return `${date}T${hh}:${mm}:${ss}`;
}

function addMinutesToLocalDateTime(start, minutes) {
  const match = String(start || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return start;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);

  const base = Date.UTC(year, month - 1, day, hour, minute, second);
  const end = new Date(base + Number(minutes || 0) * 60_000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${end.getUTCFullYear()}-${pad(end.getUTCMonth() + 1)}-${pad(end.getUTCDate())}T${pad(end.getUTCHours())}:${pad(end.getUTCMinutes())}:${pad(end.getUTCSeconds())}`;
}

async function getGoogleServiceAccountAccessToken({ saEmail, privateKey, scope }) {
  const now = Math.floor(Date.now() / 1000);
  const jwtHeader = { alg: 'RS256', typ: 'JWT' };
  const jwtPayload = {
    iss: saEmail,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(jwtHeader));
  const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signature = await signRs256(unsigned, privateKey);
  const assertion = `${unsigned}.${signature}`;

  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const tokenJson = await tokenResp.json().catch(() => ({}));
  if (!tokenResp.ok || !tokenJson?.access_token) {
    const message = tokenJson?.error_description || tokenJson?.error || 'Failed to fetch access token';
    throw new Error(message);
  }
  return tokenJson.access_token;
}

function base64UrlEncode(input) {
  const bytes = new TextEncoder().encode(String(input));
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function signRs256(unsigned, privateKeyRaw) {
  const pem = String(privateKeyRaw || '').replace(/\\n/g, '\n').trim();
  const b64 = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');

  const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const sigBytes = new Uint8Array(sig);
  let binary = '';
  for (const b of sigBytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
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

async function ensureAdvisorRecord(env, actorEmail) {
  const normalizedEmail = String(actorEmail || 'local-admin').trim().toLowerCase() || 'local-admin';
  const advisorId = slugifyFilePart(normalizedEmail.replace(/@/g, '-at-')) || 'local-admin';
  const now = new Date().toISOString();
  const displayName = normalizedEmail === 'local-admin'
    ? 'Local Admin'
    : normalizedEmail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

  const advisorDraft = {
    id: advisorId,
    email: normalizedEmail,
    display_name: displayName,
    timezone: 'America/Santiago',
    slot_duration_minutes: 45,
    slot_buffer_minutes: 15,
    workday_start: '08:00',
    workday_end: '19:00',
    allow_busy_requests: 0,
    is_active: 1,
    created_at: now,
    updated_at: now,
  };

  try {
    await env.FORM_DB.prepare(`
      INSERT INTO advisors (
        id, email, display_name, timezone, slot_duration_minutes, slot_buffer_minutes,
        workday_start, workday_end, allow_busy_requests, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      advisorDraft.id,
      advisorDraft.email,
      advisorDraft.display_name,
      advisorDraft.timezone,
      advisorDraft.slot_duration_minutes,
      advisorDraft.slot_buffer_minutes,
      advisorDraft.workday_start,
      advisorDraft.workday_end,
      advisorDraft.allow_busy_requests,
      advisorDraft.is_active,
      advisorDraft.created_at,
      advisorDraft.updated_at
    ).run();
  } catch (error) {
    if (!String(error?.message || '').includes('UNIQUE constraint failed')) {
      throw error;
    }
  }

  const advisorResult = await env.FORM_DB.prepare(`
    SELECT *
    FROM advisors
    WHERE email = ? OR id = ?
    LIMIT 1
  `).bind(normalizedEmail, advisorId).all();
  const advisor = advisorResult.results?.[0] || advisorDraft;
  await ensureAdvisorDefaultAvailability(env, advisor);
  return advisor;
}

async function ensureAdvisorDefaultAvailability(env, advisor) {
  const countResult = await env.FORM_DB.prepare(`
    SELECT COUNT(*) AS total
    FROM advisor_availability_rules
    WHERE advisor_id = ?
  `).bind(advisor.id).all();
  const total = Number(countResult.results?.[0]?.total || 0);
  if (total > 0) return;

  const now = new Date().toISOString();
  for (let day = 0; day <= 6; day += 1) {
    const enabled = day >= 1 && day <= 5 ? 1 : 0;
    await env.FORM_DB.prepare(`
      INSERT INTO advisor_availability_rules (
        id, advisor_id, day_of_week, is_enabled, start_time, end_time, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      advisor.id,
      day,
      enabled,
      advisor.workday_start || '08:00',
      advisor.workday_end || '19:00',
      now,
      now
    ).run();
  }
}

async function listAdvisorAvailabilityRules(env, advisorId) {
  const result = await env.FORM_DB.prepare(`
    SELECT id, advisor_id, day_of_week, is_enabled, start_time, end_time
    FROM advisor_availability_rules
    WHERE advisor_id = ?
    ORDER BY day_of_week ASC
  `).bind(advisorId).all();
  return result.results || [];
}

async function listAdvisorAvailabilityBlocks(env, advisorId, fromDate, toDate) {
  const startDate = sanitizeDateText(fromDate);
  const endDate = sanitizeDateText(toDate);
  if (!startDate || !endDate) return [];

  const result = await env.FORM_DB.prepare(`
    SELECT id, advisor_id, starts_at, ends_at, block_type, note
    FROM advisor_availability_blocks
    WHERE advisor_id = ?
      AND starts_at < ?
      AND ends_at > ?
    ORDER BY starts_at ASC
  `).bind(advisorId, `${addDaysIso(endDate, 1)}T00:00:00`, `${startDate}T00:00:00`).all();

  return result.results || [];
}

async function assertSlotAvailableOrThrow(env, advisor, citaFechaHora, ignoreLeadId = '') {
  const normalizedStart = normalizeLocalDateTime(citaFechaHora);
  const day = normalizedStart.slice(0, 10);
  const rules = await listAdvisorAvailabilityRules(env, advisor.id);
  const slots = await listAdvisorAvailabilitySlots(env, advisor, rules, day, day);
  const requestedStart = normalizedStart.slice(0, 16);
  const hasSlot = slots.some((slot) => String(slot.starts_at || '').slice(0, 16) === requestedStart);
  if (!hasSlot) {
    if (ignoreLeadId) {
      const currentResult = await env.FORM_DB.prepare(`
        SELECT cita_fecha_hora
        FROM form_leads
        WHERE id = ?
        LIMIT 1
      `).bind(ignoreLeadId).all();
      const current = String(currentResult.results?.[0]?.cita_fecha_hora || '').slice(0, 16);
      if (current === requestedStart) return;
    }
    throw new Error('El bloque solicitado ya no esta disponible');
  }
}

function getGoogleOauthRedirectUri(env, request) {
  const explicit = String(env.GOOGLE_OAUTH_REDIRECT_URI || '').trim();
  if (explicit) return explicit;
  const host = request.headers.get('host') || '';
  if (host.includes('asesores.planespro.cl')) {
    return 'https://asesores.planespro.cl/api/auth/google/callback';
  }
  return 'https://form.planespro.cl/api/auth/google/callback';
}

function defaultReturnTo(request) {
  const host = request.headers.get('host') || '';
  if (host.includes('127.0.0.1') || host.includes('localhost')) {
    return 'http://127.0.0.1:5501/crm/';
  }
  return 'https://asesores.planespro.cl/';
}

function sanitizeReturnTo(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https:\/\/asesores\.planespro\.cl(\/|$)/.test(raw)) return raw;
  if (/^http:\/\/127\.0\.0\.1:\d+(\/|$)/.test(raw)) return raw;
  if (/^http:\/\/localhost:\d+(\/|$)/.test(raw)) return raw;
  return '';
}

function sanitizeDateText(value) {
  const raw = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : '';
}

function sanitizeTimeText(value) {
  const raw = String(value || '').trim();
  return /^\d{2}:\d{2}$/.test(raw) ? raw : '08:00';
}

function normalizeAvailabilityBlock(block, advisor) {
  const raw = block || {};
  const allDay = Boolean(raw.all_day || raw.is_all_day || raw.block_type === 'full_day');
  const date = sanitizeDateText(raw.date || String(raw.starts_at || '').slice(0, 10) || String(raw.start || '').slice(0, 10));

  if (allDay && date) {
    return {
      id: String(raw.id || crypto.randomUUID()),
      starts_at: `${date}T${sanitizeTimeText(advisor.workday_start || '08:00')}:00`,
      ends_at: `${date}T${sanitizeTimeText(advisor.workday_end || '19:00')}:00`,
      block_type: 'full_day',
      note: String(raw.note || 'Día bloqueado').trim(),
    };
  }

  return {
    id: String(raw.id || crypto.randomUUID()),
    starts_at: normalizeLocalDateTime(raw.starts_at || raw.start || ''),
    ends_at: normalizeLocalDateTime(raw.ends_at || raw.end || ''),
    block_type: String(raw.block_type || 'manual'),
    note: String(raw.note || '').trim(),
  };
}

function addDaysIso(isoDate, days) {
  const base = new Date(`${isoDate}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + Number(days || 0));
  return base.toISOString().slice(0, 10);
}

function timeTextToMinutes(value) {
  const [hours, minutes] = String(value || '00:00').split(':').map((part) => Number(part || 0));
  return hours * 60 + minutes;
}

function minutesToTimeText(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function getTimeZoneOffsetMs(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  return asUtc - date.getTime();
}

function zonedLocalToUtcIso(localDateTime, timeZone) {
  const match = String(localDateTime || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return localDateTime;
  const utcGuess = new Date(Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6] || '0')
  ));
  const offsetMs = getTimeZoneOffsetMs(utcGuess, timeZone || 'America/Santiago');
  return new Date(utcGuess.getTime() - offsetMs).toISOString();
}

function utcIsoToLocalDateTime(utcIso, timeZone) {
  const date = new Date(utcIso);
  if (Number.isNaN(date.getTime())) return String(utcIso || '');
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: timeZone || 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

function formatSlotLabel(localDateTime) {
  const match = String(localDateTime || '').match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
  if (!match) return localDateTime;
  const date = new Date(`${match[1]}T12:00:00Z`);
  const day = new Intl.DateTimeFormat('es-CL', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date).replace('.', '');
  return `${day} Â· ${match[2]}:${match[3]}`;
}

function publicAdvisorShape(advisor) {
  return {
    id: advisor.id,
    display_name: advisor.display_name,
    timezone: advisor.timezone,
    slot_duration_minutes: advisor.slot_duration_minutes,
    slot_buffer_minutes: advisor.slot_buffer_minutes,
    allow_busy_requests: Number(advisor.allow_busy_requests || 0),
  };
}

function normalizeContactPreference(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'agendar_reunion') return 'agendar_reunion';
  return 'lo_antes_posible';
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

