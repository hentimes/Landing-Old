ALTER TABLE form_leads ADD COLUMN rut TEXT;

CREATE INDEX IF NOT EXISTS idx_form_leads_rut
  ON form_leads(rut);
