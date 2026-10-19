CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  number INT NOT NULL UNIQUE,
  breed TEXT NOT NULL,
  name TEXT NOT NULL,
  project_name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','demo_ready')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  slot_order INT,
  slot_time TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS links (
  id SERIAL PRIMARY KEY,
  team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('repo','demo','slides','chat')),
  url TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS judges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS reviews (
  team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  judge_id INT NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  verdict TEXT NOT NULL CHECK (verdict IN ('pass','pass_notes','not_pass')),
  notes TEXT NOT NULL DEFAULT '',
  UNIQUE (team_id, judge_id)
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
