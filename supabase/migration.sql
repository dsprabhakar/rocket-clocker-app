-- Rocket Clocker — Supabase Migration
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== ENUMS =====
CREATE TYPE user_role AS ENUM ('employee', 'supervisor', 'hq', 'gm', 'ceo', 'superuser');
CREATE TYPE site_status AS ENUM ('requested', 'ready', 'active', 'extended', 'completed', 'abandoned');
CREATE TYPE punch_type AS ENUM ('in', 'out');
CREATE TYPE assignment_status AS ENUM ('assigned', 'confirmed', 'checked_in', 'completed', 'cancelled');
CREATE TYPE report_status AS ENUM ('pending', 'actioned', 'dismissed');
CREATE TYPE site_down_reason AS ENUM ('power_failure', 'local_holiday', 'natural_calamity', 'materials_unavailable', 'tool_shortage', 'site_clearance');

-- ===== PROFILES =====
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  role user_role NOT NULL DEFAULT 'employee',
  skill TEXT,
  daily_wage NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  photo_url TEXT,
  device_id TEXT,
  language TEXT DEFAULT 'en',
  star_count INT DEFAULT 0,
  strike_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===== SITES =====
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  street TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geofence_radius_meters INT DEFAULT 200,
  supervisor_id UUID REFERENCES profiles(id),
  status site_status DEFAULT 'requested',
  estimated_duration_days INT DEFAULT 90,
  site_down_active BOOLEAN DEFAULT false,
  site_down_reason site_down_reason,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===== TASKS =====
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  assigned_to UUID REFERENCES profiles(id),
  completed_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== ASSIGNMENTS =====
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id),
  employee_id UUID NOT NULL REFERENCES profiles(id),
  assigned_date DATE NOT NULL,
  assigned_by UUID REFERENCES profiles(id),
  status assignment_status DEFAULT 'assigned',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== PUNCHES =====
CREATE TABLE punches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES profiles(id),
  site_id UUID REFERENCES sites(id),
  punch_type punch_type NOT NULL,
  punched_at TIMESTAMPTZ DEFAULT now(),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  in_geofence BOOLEAN DEFAULT true,
  selfie_url TEXT,
  device_id TEXT,
  synced BOOLEAN DEFAULT true,
  offline_queued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== TASK PHOTOS =====
CREATE TABLE task_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  employee_id UUID NOT NULL REFERENCES profiles(id),
  photo_url TEXT NOT NULL,
  photo_type TEXT DEFAULT 'before',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== CIVIL WORKER PHOTOS =====
CREATE TABLE civil_worker_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES profiles(id),
  photo_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== STARS =====
CREATE TABLE stars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES profiles(id),
  awarded_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== STRIKES =====
CREATE TABLE strikes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES profiles(id),
  issued_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== WORKER REPORTS =====
CREATE TABLE worker_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES profiles(id),
  reported_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  status report_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== BROADCASTS =====
CREATE TABLE broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  message TEXT,
  audio_url TEXT,
  target_site_id UUID REFERENCES sites(id),
  target_role TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== SITE CLOSURES =====
CREATE TABLE site_closures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id),
  reason site_down_reason NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  declared_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== AUDIT LOG =====
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ===== INDEXES =====
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_sites_supervisor ON sites(supervisor_id);
CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_assignments_site_date ON assignments(site_id, assigned_date);
CREATE INDEX idx_assignments_employee ON assignments(employee_id);
CREATE INDEX idx_punches_employee ON punches(employee_id);
CREATE INDEX idx_punches_site ON punches(site_id);
CREATE INDEX idx_punches_date ON punches(punched_at);
CREATE INDEX idx_tasks_site ON tasks(site_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_worker_reports_status ON worker_reports(status);
CREATE INDEX idx_broadcasts_created ON broadcasts(created_at DESC);

-- ===== RLS POLICIES =====
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE punches ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE civil_worker_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE strikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (RLS managed by app role logic)
CREATE POLICY "Authenticated access" ON profiles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON sites FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON assignments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON punches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON task_photos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON civil_worker_photos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON stars FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON strikes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON worker_reports FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON broadcasts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON site_closures FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON audit_log FOR ALL USING (auth.role() = 'authenticated');

-- ===== STORAGE BUCKETS =====
-- Run these in the Supabase dashboard or via API:
-- 1. Create bucket "photos" (public: false)
-- 2. Create bucket "audio" (public: false)
-- 3. Add storage policies allowing authenticated users to upload/download

-- ===== TRIGGER: auto-update updated_at =====
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER sites_updated_at BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at();
