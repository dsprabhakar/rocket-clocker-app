-- ============================================================
-- ROCKET CLOCKER — DEMO AUTH USERS
-- Run this in Supabase SQL Editor
-- Creates auth users with password "demo123" so people can
-- log in without needing magic links.
-- ============================================================

-- First, clean up any previous demo auth users and profiles
DELETE FROM audit_log WHERE actor_id IN (SELECT id FROM profiles WHERE email IN (
  'rayaldemohq@gmail.com', 'rayaldemogm@gmail.com', 'ceorayal@gmail.com',
  'demo.sup1@rocket.demo', 'demo.sup2@rocket.demo',
  'demo.worker1@rocket.demo', 'demo.worker2@rocket.demo', 'demo.worker3@rocket.demo'
));
DELETE FROM site_closures WHERE declared_by IN (SELECT id FROM profiles WHERE email LIKE '%@rocket.demo');
DELETE FROM broadcasts WHERE sender_id IN (SELECT id FROM profiles WHERE email IN ('rayaldemohq@gmail.com','rayaldemogm@gmail.com','ceorayal@gmail.com') OR email LIKE '%@rocket.demo');
DELETE FROM worker_reports WHERE reported_by IN (SELECT id FROM profiles WHERE email LIKE '%@rocket.demo');
DELETE FROM strikes WHERE issued_by IN (SELECT id FROM profiles WHERE email LIKE '%@rocket.demo');
DELETE FROM stars WHERE awarded_by IN (SELECT id FROM profiles WHERE email LIKE '%@rocket.demo');
DELETE FROM task_photos WHERE employee_id IN (SELECT id FROM profiles WHERE email LIKE '%@rocket.demo');
DELETE FROM tasks WHERE site_id IN (SELECT id FROM sites WHERE name LIKE 'Demo:%');
DELETE FROM punches WHERE employee_id IN (SELECT id FROM profiles WHERE email LIKE '%@rocket.demo');
DELETE FROM assignments WHERE employee_id IN (SELECT id FROM profiles WHERE email LIKE '%@rocket.demo');

-- Delete old demo profiles (both @rayal.demo and @rocket.demo and gmail demo accounts)
DELETE FROM profiles WHERE email LIKE '%@rayal.demo';
DELETE FROM profiles WHERE email LIKE '%@rocket.demo';
DELETE FROM profiles WHERE email IN ('rayaldemohq@gmail.com', 'rayaldemogm@gmail.com', 'ceorayal@gmail.com');

-- Delete old demo auth users
DELETE FROM auth.identities WHERE provider_id IN (
  SELECT id::text FROM auth.users WHERE email LIKE '%@rocket.demo'
  OR email IN ('rayaldemohq@gmail.com', 'rayaldemogm@gmail.com', 'ceorayal@gmail.com')
);
DELETE FROM auth.users WHERE email LIKE '%@rocket.demo'
  OR email IN ('rayaldemohq@gmail.com', 'rayaldemogm@gmail.com', 'ceorayal@gmail.com');

-- Delete old demo sites
DELETE FROM sites WHERE name LIKE 'Demo:%';

-- ============================================================
-- CREATE 8 DEMO AUTH USERS + MATCHING PROFILES
-- Password for all: demo123
-- ============================================================

DO $$
DECLARE
  uid_hq UUID := gen_random_uuid();
  uid_gm UUID := gen_random_uuid();
  uid_ceo UUID := gen_random_uuid();
  uid_sup1 UUID := gen_random_uuid();
  uid_sup2 UUID := gen_random_uuid();
  uid_w1 UUID := gen_random_uuid();
  uid_w2 UUID := gen_random_uuid();
  uid_w3 UUID := gen_random_uuid();
  hashed_pw TEXT := crypt('demo123', gen_salt('bf'));
  meta JSONB := '{"provider":"email","providers":["email"]}';
BEGIN

  -- ===== AUTH USERS =====

  -- HQ
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', uid_hq, 'authenticated', 'authenticated', 'rayaldemohq@gmail.com', hashed_pw, now(), now(), now(), meta, '{}');
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (uid_hq, uid_hq, jsonb_build_object('sub', uid_hq::text, 'email', 'rayaldemohq@gmail.com'), 'email', uid_hq::text, now(), now(), now());

  -- GM
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', uid_gm, 'authenticated', 'authenticated', 'rayaldemogm@gmail.com', hashed_pw, now(), now(), now(), meta, '{}');
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (uid_gm, uid_gm, jsonb_build_object('sub', uid_gm::text, 'email', 'rayaldemogm@gmail.com'), 'email', uid_gm::text, now(), now(), now());

  -- CEO
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', uid_ceo, 'authenticated', 'authenticated', 'ceorayal@gmail.com', hashed_pw, now(), now(), now(), meta, '{}');
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (uid_ceo, uid_ceo, jsonb_build_object('sub', uid_ceo::text, 'email', 'ceorayal@gmail.com'), 'email', uid_ceo::text, now(), now(), now());

  -- Supervisor 1
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', uid_sup1, 'authenticated', 'authenticated', 'demo.sup1@rocket.demo', hashed_pw, now(), now(), now(), meta, '{}');
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (uid_sup1, uid_sup1, jsonb_build_object('sub', uid_sup1::text, 'email', 'demo.sup1@rocket.demo'), 'email', uid_sup1::text, now(), now(), now());

  -- Supervisor 2
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', uid_sup2, 'authenticated', 'authenticated', 'demo.sup2@rocket.demo', hashed_pw, now(), now(), now(), meta, '{}');
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (uid_sup2, uid_sup2, jsonb_build_object('sub', uid_sup2::text, 'email', 'demo.sup2@rocket.demo'), 'email', uid_sup2::text, now(), now(), now());

  -- Worker 1
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', uid_w1, 'authenticated', 'authenticated', 'demo.worker1@rocket.demo', hashed_pw, now(), now(), now(), meta, '{}');
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (uid_w1, uid_w1, jsonb_build_object('sub', uid_w1::text, 'email', 'demo.worker1@rocket.demo'), 'email', uid_w1::text, now(), now(), now());

  -- Worker 2
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', uid_w2, 'authenticated', 'authenticated', 'demo.worker2@rocket.demo', hashed_pw, now(), now(), now(), meta, '{}');
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (uid_w2, uid_w2, jsonb_build_object('sub', uid_w2::text, 'email', 'demo.worker2@rocket.demo'), 'email', uid_w2::text, now(), now(), now());

  -- Worker 3
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  VALUES ('00000000-0000-0000-0000-000000000000', uid_w3, 'authenticated', 'authenticated', 'demo.worker3@rocket.demo', hashed_pw, now(), now(), now(), meta, '{}');
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (uid_w3, uid_w3, jsonb_build_object('sub', uid_w3::text, 'email', 'demo.worker3@rocket.demo'), 'email', uid_w3::text, now(), now(), now());

  -- ===== MATCHING PROFILES =====

  INSERT INTO profiles (id, email, full_name, phone, role, skill, daily_wage, is_active, language) VALUES
    (uid_hq, 'rayaldemohq@gmail.com', 'Prem', '9876500003', 'hq', NULL, 0, true, 'en'),
    (uid_gm, 'rayaldemogm@gmail.com', 'Suresh', '9876500004', 'gm', NULL, 0, true, 'en'),
    (uid_ceo, 'ceorayal@gmail.com', 'Rajendran', '9876500002', 'ceo', NULL, 0, true, 'en'),
    (uid_sup1, 'demo.sup1@rocket.demo', 'Ravi Teja', '9876500005', 'supervisor', NULL, 0, true, 'te'),
    (uid_sup2, 'demo.sup2@rocket.demo', 'Lakshmi Devi', '9876500006', 'supervisor', NULL, 0, true, 'te'),
    (uid_w1, 'demo.worker1@rocket.demo', 'Srinivas Rao', '9876500101', 'employee', 'Mason', 800, true, 'te'),
    (uid_w2, 'demo.worker2@rocket.demo', 'Ramesh Babu', '9876500102', 'employee', 'Carpenter', 750, true, 'te'),
    (uid_w3, 'demo.worker3@rocket.demo', 'Anjali Kumari', '9876500103', 'employee', 'Electrician', 900, true, 'te');

  -- ===== SITES =====

  INSERT INTO sites (name, street, state, latitude, longitude, geofence_radius_meters, supervisor_id, status, estimated_duration_days) VALUES
    ('Demo: Vijayawada Metro Station', 'MG Road, Vijayawada', 'Andhra Pradesh', 16.5062, 80.6480, 200, uid_sup1, 'active', 180),
    ('Demo: Tirupati Shopping Complex', 'Renigunta Road, Tirupati', 'Andhra Pradesh', 13.6288, 79.4192, 200, uid_sup1, 'active', 120),
    ('Demo: Hyderabad IT Tower', 'HITEC City, Hyderabad', 'Telangana', 17.4435, 78.3772, 200, uid_sup2, 'active', 240),
    ('Demo: Warangal Residential Block', 'Hanamkonda Road, Warangal', 'Telangana', 17.9784, 79.5941, 200, uid_sup2, 'active', 150),
    ('Demo: Guntur Hospital Wing', 'AT Agraharam, Guntur', 'Andhra Pradesh', 16.3067, 80.4365, 200, uid_sup1, 'active', 90);

END $$;

-- ============================================================
-- DONE! 8 demo users created with password: demo123
-- Plus 5 construction sites.
--
-- Demo Login Accounts:
-- ┌─────────────┬──────────────────────────────┬──────────┐
-- │ Role        │ Email                        │ Password │
-- ├─────────────┼──────────────────────────────┼──────────┤
-- │ HQ          │ rayaldemohq@gmail.com        │ demo123  │
-- │ GM          │ rayaldemogm@gmail.com        │ demo123  │
-- │ CEO         │ ceorayal@gmail.com           │ demo123  │
-- │ Supervisor  │ demo.sup1@rocket.demo        │ demo123  │
-- │ Supervisor  │ demo.sup2@rocket.demo        │ demo123  │
-- │ Worker      │ demo.worker1@rocket.demo     │ demo123  │
-- │ Worker      │ demo.worker2@rocket.demo     │ demo123  │
-- │ Worker      │ demo.worker3@rocket.demo     │ demo123  │
-- └─────────────┴──────────────────────────────┴──────────┘
--
-- Your account (dsprabhakar@yahoo.com) = Superuser (unchanged)
-- ============================================================
