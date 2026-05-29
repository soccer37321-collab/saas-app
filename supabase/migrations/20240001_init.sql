-- profiles (auth.users の拡張)
CREATE TABLE public.profiles (
  id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT        NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- organizations
CREATE TABLE public.organizations (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  slug        TEXT        UNIQUE NOT NULL,
  owner_id    UUID        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- memberships (ユーザー × 組織 の中間テーブル)
CREATE TABLE public.memberships (
  id              UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID  REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID  REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role            TEXT  NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, organization_id)
);

-- Row Level Security
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships  ENABLE ROW LEVEL SECURITY;

-- profiles: 本人のみ読み書き
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- organizations: メンバーは読み取り可、ownerは更新可
CREATE POLICY "orgs_select_member" ON public.organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

CREATE POLICY "orgs_update_owner" ON public.organizations FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "orgs_insert_auth" ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- memberships: 本人 or 同組織メンバーが参照可
CREATE POLICY "memberships_select" ON public.memberships FOR SELECT
  USING (
    user_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

-- 新規ユーザー登録時に profiles を自動作成するトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
