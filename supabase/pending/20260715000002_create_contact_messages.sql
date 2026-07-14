CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow insert from anon
CREATE POLICY "Allow public inserts on contact_messages"
  ON contact_messages
  FOR INSERT
  WITH CHECK (true);

-- Allow select only for admin (service_role)
CREATE POLICY "Allow admin read on contact_messages"
  ON contact_messages
  FOR SELECT
  USING (auth.role() = 'service_role');
