-- rate_limits: per-user, per-endpoint, per-hour counters
CREATE TABLE IF NOT EXISTS public.rate_limits (
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint     TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('hour', NOW()),
  count        INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, endpoint, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_limits_select_own" ON public.rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- audit_logs: immutable record of important actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  action     TEXT        NOT NULL,
  resource   TEXT,
  metadata   JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_own" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Atomic rate-limit counter increment; returns new count for this window
CREATE OR REPLACE FUNCTION public.increment_rate_limit(p_user_id UUID, p_endpoint TEXT)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO public.rate_limits (user_id, endpoint, window_start, count)
  VALUES (p_user_id, p_endpoint, date_trunc('hour', NOW()), 1)
  ON CONFLICT (user_id, endpoint, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO v_count;
  RETURN v_count;
END;
$$;
