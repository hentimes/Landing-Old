CREATE TABLE IF NOT EXISTS form_leads (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status TEXT NOT NULL,
  cta TEXT,
  campana TEXT,
  sheet_name TEXT,
  nombre TEXT,
  email TEXT,
  telefono TEXT,
  rango_edad TEXT,
  comuna TEXT,
  region TEXT,
  sistema_actual TEXT,
  isapre_especifica TEXT,
  num_cargas TEXT,
  edad_cargas TEXT,
  rango_renta TEXT,
  rango_costo TEXT,
  comentarios TEXT,
  cita_estado TEXT,
  cita_fecha_hora TEXT,
  cita_calendar_event_id TEXT,
  cita_calendar_url TEXT,
  pdf_object_key TEXT,
  pdf_original_name TEXT,
  raw_payload TEXT
);

CREATE INDEX IF NOT EXISTS idx_form_leads_created_at
  ON form_leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_form_leads_status
  ON form_leads(status);

CREATE INDEX IF NOT EXISTS idx_form_leads_email
  ON form_leads(email);
