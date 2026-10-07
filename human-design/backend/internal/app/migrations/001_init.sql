CREATE TABLE IF NOT EXISTS users (
 id uuid PRIMARY KEY,
 name text NOT NULL,
 email text NOT NULL UNIQUE,
 password_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
 id uuid PRIMARY KEY,
 token_hash text NOT NULL UNIQUE,
 user_id uuid REFERENCES users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS charts (
 id uuid PRIMARY KEY,
 owner_id uuid NOT NULL,
 name text NOT NULL,
 birth jsonb NOT NULL,
 result jsonb NOT NULL,
 provider text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS charts_owner_idx ON charts(owner_id, created_at DESC);
