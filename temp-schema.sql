-- 3. Central Registry (For Contributor Discovery)
CREATE TABLE IF NOT EXISTS registry (
  owner TEXT NOT NULL,
  repo TEXT NOT NULL,
  supabase_url TEXT NOT NULL,
  supabase_anon_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (owner, repo)
);

ALTER TABLE registry ENABLE ROW LEVEL SECURITY;

-- Security Policy: The public (contributors) can READ the registry to discover keys
CREATE POLICY "Allow public read access to registry" ON registry
FOR SELECT USING (true);
