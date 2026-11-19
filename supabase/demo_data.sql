-- ============================================================
-- ROCKET CLOCKER — SEED DATA (Profiles + Sites only)
-- Run this in Supabase SQL Editor AFTER migration.sql
--
-- All transactions (punches, assignments, tasks, stars, etc.)
-- will be created through the apps during the demo.
-- ============================================================

-- Clean up any previous demo data (safe to re-run)
DELETE FROM audit_log WHERE actor_id IN (SELECT id FROM profiles WHERE email LIKE '%@rayal.demo');
DELETE FROM site_closures WHERE declared_by IN (SELECT id FROM profiles WHERE email LIKE '%@rayal.demo');
DELETE FROM broadcasts WHERE sender_id IN (SELECT id FROM profiles WHERE email LIKE '%@rayal.demo');
DELETE FROM worker_reports WHERE reported_by IN (SELECT id FROM profiles WHERE email LIKE '%@rayal.demo');
DELETE FROM strikes WHERE issued_by IN (SELECT id FROM profiles WHERE email LIKE '%@rayal.demo');
DELETE FROM stars WHERE awarded_by IN (SELECT id FROM profiles WHERE email LIKE '%@rayal.demo');
DELETE FROM task_photos WHERE employee_id IN (SELECT id FROM profiles WHERE email LIKE '%@rayal.demo');
DELETE FROM tasks WHERE site_id IN (SELECT id FROM sites WHERE name LIKE 'Demo:%');
DELETE FROM punches WHERE employee_id IN (SELECT id FROM profiles WHERE email LIKE '%@rayal.demo');
DELETE FROM assignments WHERE employee_id IN (SELECT id FROM profiles WHERE email LIKE '%@rayal.demo');
DELETE FROM sites WHERE name LIKE 'Demo:%';
DELETE FROM profiles WHERE email LIKE '%@rayal.demo';

-- ============================================================
-- 1. PROFILES (16 demo users)
-- ============================================================
-- Auth note: These profiles won't have Supabase Auth entries.
-- For the demo, log in with YOUR real account (dsprabhakar@yahoo.com)
-- which has role=superuser and can see all views.
-- To demo other roles, change your profile's role in Supabase:
--   UPDATE profiles SET role = 'employee' WHERE email = 'dsprabhakar@yahoo.com';
-- Then refresh the app. Change it back to 'superuser' when done.

-- Supervisors
INSERT INTO profiles (email, full_name, phone, role, skill, daily_wage, is_active, language)
VALUES
  ('ravi.teja@rayal.demo', 'Ravi Teja', '9876500005', 'supervisor', NULL, 0, true, 'te'),
  ('lakshmi.devi@rayal.demo', 'Lakshmi Devi', '9876500006', 'supervisor', NULL, 0, true, 'te');

-- Employees (10 workers)
INSERT INTO profiles (email, full_name, phone, role, skill, daily_wage, is_active, language)
VALUES
  ('srinivas.rao@rayal.demo', 'Srinivas Rao', '9876500101', 'employee', 'Mason', 800, true, 'te'),
  ('ramesh.babu@rayal.demo', 'Ramesh Babu', '9876500102', 'employee', 'Carpenter', 750, true, 'te'),
  ('anjali.kumari@rayal.demo', 'Anjali Kumari', '9876500103', 'employee', 'Electrician', 900, true, 'te'),
  ('prakash.reddy@rayal.demo', 'Prakash Reddy', '9876500104', 'employee', 'Plumber', 850, true, 'te'),
  ('kavitha.devi@rayal.demo', 'Kavitha Devi', '9876500105', 'employee', 'Painter', 700, true, 'te'),
  ('nagaraju.m@rayal.demo', 'Nagaraju M', '9876500106', 'employee', 'Welder', 950, true, 'te'),
  ('bhavani.s@rayal.demo', 'Bhavani S', '9876500107', 'employee', 'Helper', 600, true, 'te'),
  ('chandra.mohan@rayal.demo', 'Chandra Mohan', '9876500108', 'employee', 'Mason', 800, true, 'te'),
  ('durga.prasad@rayal.demo', 'Durga Prasad', '9876500109', 'employee', 'Carpenter', 750, true, 'te'),
  ('padma.latha@rayal.demo', 'Padma Latha', '9876500110', 'employee', 'Electrician', 900, true, 'te');

-- HQ, GM, CEO (these would use the web apps in real life)
INSERT INTO profiles (email, full_name, phone, role, skill, daily_wage, is_active, language)
VALUES
  ('priya.sharma@rayal.demo', 'Priya Sharma', '9876500003', 'hq', NULL, 0, true, 'en'),
  ('suresh.naidu@rayal.demo', 'Suresh Naidu', '9876500004', 'gm', NULL, 0, true, 'en'),
  ('venkat.reddy@rayal.demo', 'Venkat Reddy', '9876500002', 'ceo', NULL, 0, true, 'en');

-- ============================================================
-- 2. SITES (5 construction sites across AP & Telangana)
-- ============================================================
INSERT INTO sites (name, street, state, latitude, longitude, geofence_radius_meters, supervisor_id, status, estimated_duration_days)
VALUES
  ('Demo: Vijayawada Metro Station', 'MG Road, Vijayawada', 'Andhra Pradesh', 16.5062, 80.6480, 200,
    (SELECT id FROM profiles WHERE email = 'ravi.teja@rayal.demo'), 'active', 180),
  ('Demo: Tirupati Shopping Complex', 'Renigunta Road, Tirupati', 'Andhra Pradesh', 13.6288, 79.4192, 200,
    (SELECT id FROM profiles WHERE email = 'ravi.teja@rayal.demo'), 'active', 120),
  ('Demo: Hyderabad IT Tower', 'HITEC City, Hyderabad', 'Telangana', 17.4435, 78.3772, 200,
    (SELECT id FROM profiles WHERE email = 'lakshmi.devi@rayal.demo'), 'active', 240),
  ('Demo: Warangal Residential Block', 'Hanamkonda Road, Warangal', 'Telangana', 17.9784, 79.5941, 200,
    (SELECT id FROM profiles WHERE email = 'lakshmi.devi@rayal.demo'), 'active', 150),
  ('Demo: Guntur Hospital Wing', 'AT Agraharam, Guntur', 'Andhra Pradesh', 16.3067, 80.4365, 200,
    (SELECT id FROM profiles WHERE email = 'ravi.teja@rayal.demo'), 'active', 90);

-- ============================================================
-- DONE! Seed data loaded.
--
-- Your account (dsprabhakar@yahoo.com, role=superuser) can
-- see everything. See the Demo Walkthrough for step-by-step
-- instructions on how to demo each app.
-- ============================================================
