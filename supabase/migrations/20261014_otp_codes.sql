CREATE TABLE IF NOT EXISTS public."OtpCode" (
  phone text PRIMARY KEY CHECK (phone ~ '^09[0-9]{9}$'),
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_sent_at timestamptz NOT NULL
);

ALTER TABLE public."OtpCode" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."OtpCode" FROM anon, authenticated;
GRANT ALL ON TABLE public."OtpCode" TO service_role;
