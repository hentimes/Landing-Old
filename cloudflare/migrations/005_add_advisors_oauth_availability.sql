ALTER TABLE form_leads ADD COLUMN advisor_id TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_form_leads_advisor_id
  ON form_leads(advisor_id);

CREATE TABLE IF NOT EXISTS advisors (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Santiago',
  slot_duration_minutes INTEGER NOT NULL DEFAULT 45,
  slot_buffer_minutes INTEGER NOT NULL DEFAULT 15,
  workday_start TEXT NOT NULL DEFAULT '08:00',
  workday_end TEXT NOT NULL DEFAULT '19:00',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS advisor_calendar_connections (
  advisor_id TEXT PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'google',
  google_email TEXT NOT NULL,
  calendar_id TEXT NOT NULL DEFAULT 'primary',
  refresh_token TEXT NOT NULL,
  access_token TEXT,
  token_scope TEXT,
  token_expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS advisor_availability_rules (
  id TEXT PRIMARY KEY,
  advisor_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_advisor_availability_rules_unique
  ON advisor_availability_rules(advisor_id, day_of_week);

CREATE TABLE IF NOT EXISTS oauth_states (
  id TEXT PRIMARY KEY,
  advisor_id TEXT NOT NULL,
  return_to TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_expires_at
  ON oauth_states(expires_at);
