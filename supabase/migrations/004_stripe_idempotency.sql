-- Stripe webhook idempotency: track processed event IDs to prevent double-processing
CREATE TABLE IF NOT EXISTS public.processed_stripe_events (
  event_id     TEXT        PRIMARY KEY,
  event_type   TEXT        NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- No user-facing access needed; only service role via webhook
ALTER TABLE public.processed_stripe_events ENABLE ROW LEVEL SECURITY;
