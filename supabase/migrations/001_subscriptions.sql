-- subscriptions テーブル
create table if not exists subscriptions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  stripe_price_id        text,
  plan             text not null default 'free',   -- 'free' | 'pro'
  status           text not null default 'active', -- Stripe subscription status
  current_period_end timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- user_id に unique 制約（1 ユーザー 1 レコード）
create unique index if not exists subscriptions_user_id_key on subscriptions(user_id);

-- updated_at 自動更新
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger subscriptions_updated_at
  before update on subscriptions
  for each row execute procedure update_updated_at();

-- RLS
alter table subscriptions enable row level security;

create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "subscriptions_select_own"
  on subscriptions for select
  using (auth.uid() = user_id);

-- サービスロール（webhook）は RLS をバイパスするため INSERT/UPDATE/DELETE ポリシー不要
