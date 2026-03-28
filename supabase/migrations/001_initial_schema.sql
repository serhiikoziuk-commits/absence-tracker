-- ============================================================
-- AbsenceTrack — Initial Schema
-- Run this in Supabase SQL Editor or via supabase db push
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE workspaces (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                     TEXT UNIQUE NOT NULL,
  name                     TEXT NOT NULL,
  logo_url                 TEXT,
  email_domain             TEXT,
  restrict_email_domain    BOOLEAN NOT NULL DEFAULT false,
  stripe_customer_id       TEXT,
  stripe_subscription_id   TEXT,
  plan                     TEXT NOT NULL DEFAULT 'free'
                             CHECK (plan IN ('free','starter','pro','enterprise')),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id                         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id               UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email                      TEXT NOT NULL,
  first_name                 TEXT,
  last_name                  TEXT,
  avatar_url                 TEXT,
  job_title                  TEXT,
  start_date                 DATE,
  date_of_birth              DATE,
  role                       TEXT NOT NULL DEFAULT 'user'
                               CHECK (role IN ('user','admin')),
  status                     TEXT NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active','blocked','invited')),
  push_token                 TEXT,
  push_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE teams (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE team_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_manager BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (team_id, user_id)
);

CREATE TABLE absence_types (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  color               TEXT NOT NULL DEFAULT '#6366F1',
  icon                TEXT,
  requires_attachment BOOLEAN NOT NULL DEFAULT false,
  accrual_type        TEXT NOT NULL DEFAULT 'none'
                        CHECK (accrual_type IN ('none','monthly','yearly')),
  accrual_amount      NUMERIC NOT NULL DEFAULT 0,
  default_days        NUMERIC NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  sort_order          INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE absence_balances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  absence_type_id UUID NOT NULL REFERENCES absence_types(id) ON DELETE CASCADE,
  total_days      NUMERIC NOT NULL DEFAULT 0,
  used_days       NUMERIC NOT NULL DEFAULT 0,
  year            INT NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  UNIQUE (user_id, absence_type_id, year)
);

CREATE TABLE absence_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  absence_type_id     UUID NOT NULL REFERENCES absence_types(id),
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL,
  total_days          NUMERIC NOT NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','rejected','modified','cancelled')),
  comment             TEXT,
  reviewer_id         UUID REFERENCES users(id),
  reviewer_comment    TEXT,
  modified_start_date DATE,
  modified_end_date   DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE absence_request_files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  UUID NOT NULL REFERENCES absence_requests(id) ON DELETE CASCADE,
  file_url    TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  file_size   INT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE invites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email        TEXT,
  token        TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by   UUID NOT NULL REFERENCES users(id),
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','accepted','expired')),
  expires_at   TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  title        TEXT NOT NULL,
  body         TEXT,
  read         BOOLEAN NOT NULL DEFAULT false,
  payload      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_users_workspace ON users(workspace_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_teams_workspace ON teams(workspace_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_absence_types_workspace ON absence_types(workspace_id);
CREATE INDEX idx_absence_balances_user ON absence_balances(user_id);
CREATE INDEX idx_absence_requests_workspace ON absence_requests(workspace_id);
CREATE INDEX idx_absence_requests_user ON absence_requests(user_id);
CREATE INDEX idx_absence_requests_dates ON absence_requests(start_date, end_date);
CREATE INDEX idx_invites_token ON invites(token);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_requests_updated_at BEFORE UPDATE ON absence_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- JWT CUSTOM CLAIMS HOOK
-- Injects workspace_id + role into every access token
-- Enable in: Supabase Dashboard → Auth → Hooks → Custom Access Token
-- ============================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims     JSONB;
  user_rec   RECORD;
BEGIN
  SELECT workspace_id, role
  INTO user_rec
  FROM public.users
  WHERE id = (event->>'user_id')::UUID;

  claims := event->'claims';

  IF user_rec IS NOT NULL THEN
    claims := jsonb_set(claims, '{workspace_id}', to_jsonb(user_rec.workspace_id::TEXT));
    claims := jsonb_set(claims, '{role}',         to_jsonb(user_rec.role));
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE workspaces          ENABLE ROW LEVEL SECURITY;
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams               ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE absence_types       ENABLE ROW LEVEL SECURITY;
ALTER TABLE absence_balances    ENABLE ROW LEVEL SECURITY;
ALTER TABLE absence_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE absence_request_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;

-- Helper: current user's workspace_id from JWT
CREATE OR REPLACE FUNCTION auth.workspace_id() RETURNS UUID AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'workspace_id')::UUID,
    NULL
  );
$$ LANGUAGE sql STABLE;

-- Helper: current user's role from JWT
CREATE OR REPLACE FUNCTION auth.user_role() RETURNS TEXT AS $$
  SELECT COALESCE(auth.jwt() ->> 'role', 'user');
$$ LANGUAGE sql STABLE;

-- Helper: is current user a manager of the given user's team?
CREATE OR REPLACE FUNCTION auth.is_manager_of(target_user_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM team_members mgr
    JOIN team_members member ON mgr.team_id = member.team_id
    WHERE mgr.user_id    = auth.uid()
      AND mgr.is_manager = true
      AND member.user_id = target_user_id
  );
$$ LANGUAGE sql STABLE;

-- WORKSPACES
CREATE POLICY "workspace_select" ON workspaces FOR SELECT
  USING (id = auth.workspace_id());

CREATE POLICY "workspace_update_admin" ON workspaces FOR UPDATE
  USING (id = auth.workspace_id() AND auth.user_role() = 'admin');

-- USERS
CREATE POLICY "users_select_same_workspace" ON users FOR SELECT
  USING (workspace_id = auth.workspace_id());

CREATE POLICY "users_insert_own" ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own" ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "users_update_admin" ON users FOR UPDATE
  USING (workspace_id = auth.workspace_id() AND auth.user_role() = 'admin');

CREATE POLICY "users_delete_admin" ON users FOR DELETE
  USING (workspace_id = auth.workspace_id() AND auth.user_role() = 'admin');

-- TEAMS
CREATE POLICY "teams_select" ON teams FOR SELECT
  USING (workspace_id = auth.workspace_id());

CREATE POLICY "teams_insert_admin" ON teams FOR INSERT
  WITH CHECK (workspace_id = auth.workspace_id() AND auth.user_role() = 'admin');

CREATE POLICY "teams_update_admin" ON teams FOR UPDATE
  USING (workspace_id = auth.workspace_id() AND auth.user_role() = 'admin');

CREATE POLICY "teams_delete_admin" ON teams FOR DELETE
  USING (workspace_id = auth.workspace_id() AND auth.user_role() = 'admin');

-- TEAM MEMBERS
CREATE POLICY "team_members_select" ON team_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM teams t WHERE t.id = team_id AND t.workspace_id = auth.workspace_id()
  ));

CREATE POLICY "team_members_manage_admin" ON team_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM teams t WHERE t.id = team_id AND t.workspace_id = auth.workspace_id()
    AND auth.user_role() = 'admin'
  ));

-- ABSENCE TYPES
CREATE POLICY "absence_types_select" ON absence_types FOR SELECT
  USING (workspace_id = auth.workspace_id());

CREATE POLICY "absence_types_manage_admin" ON absence_types FOR ALL
  USING (workspace_id = auth.workspace_id() AND auth.user_role() = 'admin');

-- ABSENCE BALANCES
CREATE POLICY "balances_select_own" ON absence_balances FOR SELECT
  USING (
    user_id = auth.uid()
    OR auth.user_role() = 'admin'
    OR auth.is_manager_of(user_id)
  );

CREATE POLICY "balances_manage_admin" ON absence_balances FOR ALL
  USING (workspace_id = auth.workspace_id() AND auth.user_role() = 'admin');

-- ABSENCE REQUESTS
CREATE POLICY "requests_select" ON absence_requests FOR SELECT
  USING (
    workspace_id = auth.workspace_id()
    AND (
      user_id = auth.uid()
      OR auth.user_role() = 'admin'
      OR auth.is_manager_of(user_id)
    )
  );

CREATE POLICY "requests_insert_own" ON absence_requests FOR INSERT
  WITH CHECK (workspace_id = auth.workspace_id() AND user_id = auth.uid());

CREATE POLICY "requests_update_own_pending" ON absence_requests FOR UPDATE
  USING (user_id = auth.uid() AND status IN ('pending','modified'));

CREATE POLICY "requests_update_manager" ON absence_requests FOR UPDATE
  USING (
    workspace_id = auth.workspace_id()
    AND (auth.user_role() = 'admin' OR auth.is_manager_of(user_id))
  );

CREATE POLICY "requests_delete" ON absence_requests FOR DELETE
  USING (
    (user_id = auth.uid() AND status = 'pending')
    OR (workspace_id = auth.workspace_id() AND auth.user_role() = 'admin')
  );

-- ABSENCE REQUEST FILES
CREATE POLICY "files_select" ON absence_request_files FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM absence_requests r
    WHERE r.id = request_id
      AND (r.user_id = auth.uid() OR auth.user_role() = 'admin' OR auth.is_manager_of(r.user_id))
  ));

CREATE POLICY "files_insert_own" ON absence_request_files FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM absence_requests r
    WHERE r.id = request_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "files_delete_own" ON absence_request_files FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM absence_requests r
    WHERE r.id = request_id AND r.user_id = auth.uid()
  ));

-- INVITES
CREATE POLICY "invites_select_admin" ON invites FOR SELECT
  USING (workspace_id = auth.workspace_id() AND auth.user_role() = 'admin');

CREATE POLICY "invites_select_by_token" ON invites FOR SELECT
  USING (true); -- public read by token for acceptance flow (filtered in app layer)

CREATE POLICY "invites_insert_admin" ON invites FOR INSERT
  WITH CHECK (workspace_id = auth.workspace_id() AND auth.user_role() = 'admin');

CREATE POLICY "invites_update" ON invites FOR UPDATE
  USING (workspace_id = auth.workspace_id());

-- NOTIFICATIONS
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_system" ON notifications FOR INSERT
  WITH CHECK (workspace_id = auth.workspace_id());

-- ============================================================
-- STORAGE BUCKETS (run separately in Storage settings or via API)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('absence-attachments', 'absence-attachments', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- ============================================================
-- DEFAULT ABSENCE TYPES SEEDER FUNCTION
-- Call after workspace creation: SELECT seed_default_absence_types('workspace-id');
-- ============================================================

CREATE OR REPLACE FUNCTION public.seed_default_absence_types(p_workspace_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO absence_types (workspace_id, name, color, icon, default_days, accrual_type, accrual_amount, sort_order)
  VALUES
    (p_workspace_id, 'Vacation',             '#6366F1', 'plane',       28, 'yearly',  28, 1),
    (p_workspace_id, 'Sick Leave',           '#F43F5E', 'thermometer',  5, 'yearly',   5, 2),
    (p_workspace_id, 'Sick Leave (with cert)','#EF4444','file-text',   14, 'yearly',  14, 3),
    (p_workspace_id, 'Day-Off',              '#F59E0B', 'coffee',       3, 'yearly',   3, 4);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER: increment used_days on balance
-- Called after approving a request
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_used_days(
  p_user_id UUID, p_type_id UUID, p_year INT, p_days NUMERIC
)
RETURNS VOID AS $$
BEGIN
  UPDATE absence_balances
  SET used_days = used_days + p_days
  WHERE user_id = p_user_id AND absence_type_id = p_type_id AND year = p_year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
