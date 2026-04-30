ALTER TABLE form_leads ADD COLUMN contacto_preferencia TEXT DEFAULT 'lo_antes_posible';

CREATE INDEX IF NOT EXISTS idx_form_leads_contacto_preferencia
  ON form_leads(contacto_preferencia);

ALTER TABLE advisors ADD COLUMN allow_busy_requests INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS advisor_availability_blocks (
  id TEXT PRIMARY KEY,
  advisor_id TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  block_type TEXT NOT NULL DEFAULT 'manual',
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_advisor_availability_blocks_advisor_time
  ON advisor_availability_blocks(advisor_id, starts_at, ends_at);
