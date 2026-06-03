-- IP-based access tracking for suspicious request detection.
-- Stores SHA-256 hash of IP (never raw IP) for privacy.
CREATE TABLE IF NOT EXISTS public.ip_rate_limits (
  ip_hash      TEXT        NOT NULL,
  endpoint     TEXT        NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count        INTEGER     NOT NULL DEFAULT 1,
  PRIMARY KEY (ip_hash, endpoint, window_start)
);

-- No user-facing access: only service role via SECURITY DEFINER function
ALTER TABLE public.ip_rate_limits ENABLE ROW LEVEL SECURITY;

-- 5-minute window atomic counter
CREATE OR REPLACE FUNCTION public.increment_ip_rate_limit(p_ip_hash TEXT, p_endpoint TEXT)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_count  INTEGER;
  v_window TIMESTAMPTZ;
BEGIN
  v_window := date_trunc('minute', NOW())
    - ((EXTRACT(MINUTE FROM NOW())::INT % 5) * INTERVAL '1 minute');

  INSERT INTO public.ip_rate_limits (ip_hash, endpoint, window_start, count)
  VALUES (p_ip_hash, p_endpoint, v_window, 1)
  ON CONFLICT (ip_hash, endpoint, window_start)
  DO UPDATE SET count = public.ip_rate_limits.count + 1
  RETURNING count INTO v_count;
  RETURN v_count;
END;
$$;
