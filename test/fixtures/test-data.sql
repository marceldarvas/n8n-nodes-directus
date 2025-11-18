-- Integration Test Data Setup for Directus
-- This file contains SQL to populate a test Directus instance with sample data

-- ============================================
-- Clean up existing test data
-- ============================================

DELETE FROM directus_activity WHERE TRUE;
DELETE FROM directus_revisions WHERE TRUE;
DELETE FROM directus_flows WHERE id LIKE 'test-%';
DELETE FROM directus_presets WHERE bookmark LIKE 'Test%';
DELETE FROM directus_users WHERE email LIKE '%@test.example.com';
DELETE FROM directus_roles WHERE name LIKE 'Test %';

-- ============================================
-- Create Test Roles
-- ============================================

INSERT INTO directus_roles (id, name, icon, description) VALUES
  ('test-role-admin', 'Test Administrator', 'admin_panel_settings', 'Test admin role'),
  ('test-role-editor', 'Test Editor', 'edit', 'Test editor role'),
  ('test-role-viewer', 'Test Viewer', 'visibility', 'Test viewer role')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- ============================================
-- Create Test Users
-- ============================================

INSERT INTO directus_users (id, email, password, status, role, first_name, last_name) VALUES
  ('test-user-1', 'admin@test.example.com', '$argon2id$v=19$m=65536,t=3,p=4$password', 'active', 'test-role-admin', 'Test', 'Admin'),
  ('test-user-2', 'editor@test.example.com', '$argon2id$v=19$m=65536,t=3,p=4$password', 'active', 'test-role-editor', 'Test', 'Editor'),
  ('test-user-3', 'viewer@test.example.com', '$argon2id$v=19$m=65536,t=3,p=4$password', 'active', 'test-role-viewer', 'Test', 'Viewer')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  role = EXCLUDED.role;

-- ============================================
-- Create Test Flows
-- ============================================

INSERT INTO directus_flows (id, name, icon, color, description, status, trigger, accountability, options) VALUES
  (
    'test-flow-webhook',
    'Test Webhook Flow',
    'webhook',
    '#6644FF',
    'Test flow triggered by webhook',
    'active',
    'webhook',
    'all',
    '{"method":"POST","async":false}'
  ),
  (
    'test-flow-schedule',
    'Test Schedule Flow',
    'schedule',
    '#FF6644',
    'Test flow triggered by schedule',
    'active',
    'schedule',
    'all',
    '{"cron":"0 * * * *"}'
  ),
  (
    'test-flow-manual',
    'Test Manual Flow',
    'play_arrow',
    '#44FF66',
    'Test flow triggered manually',
    'active',
    'manual',
    'all',
    '{}'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  trigger = EXCLUDED.trigger;

-- ============================================
-- Create Test Collection for Items
-- ============================================

-- Note: This would need to be done via Directus API or schema migration
-- CREATE TABLE IF NOT EXISTS test_articles (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   status VARCHAR(20) DEFAULT 'draft',
--   title VARCHAR(255),
--   content TEXT,
--   author UUID REFERENCES directus_users(id),
--   published_date TIMESTAMP,
--   date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- ============================================
-- Create Test Presets
-- ============================================

INSERT INTO directus_presets (id, bookmark, user, role, collection, search, layout, layout_query, layout_options, filter) VALUES
  (
    'test-preset-1',
    'Test Published Articles',
    NULL,
    'test-role-editor',
    'test_articles',
    NULL,
    'tabular',
    NULL,
    NULL,
    '{"status":{"_eq":"published"}}'
  ),
  (
    'test-preset-2',
    'Test Draft Articles',
    NULL,
    'test-role-editor',
    'test_articles',
    NULL,
    'tabular',
    NULL,
    NULL,
    '{"status":{"_eq":"draft"}}'
  )
ON CONFLICT (id) DO UPDATE SET
  bookmark = EXCLUDED.bookmark,
  collection = EXCLUDED.collection,
  filter = EXCLUDED.filter;

-- ============================================
-- Sample Activity Logs (auto-generated)
-- ============================================

-- Activity logs will be automatically generated when operations are performed

-- ============================================
-- Test Summary
-- ============================================

-- Display created test data
SELECT 'Test Roles Created:' as info, COUNT(*) as count FROM directus_roles WHERE id LIKE 'test-%';
SELECT 'Test Users Created:' as info, COUNT(*) as count FROM directus_users WHERE id LIKE 'test-%';
SELECT 'Test Flows Created:' as info, COUNT(*) as count FROM directus_flows WHERE id LIKE 'test-%';
SELECT 'Test Presets Created:' as info, COUNT(*) as count FROM directus_presets WHERE id LIKE 'test-%';

-- ============================================
-- Usage Instructions
-- ============================================

/*
To load this test data into your Directus instance:

1. Connect to your test Directus database:
   psql -h localhost -U directus -d directus_test

2. Run this SQL file:
   \i test/fixtures/test-data.sql

3. Or use Directus CLI:
   npx directus database install

4. Set environment variables in .env.test:
   TEST_DIRECTUS_URL=http://localhost:8055
   TEST_DIRECTUS_TOKEN=your-test-token
   TEST_FLOW_ID=test-flow-webhook
   TEST_ROLE_ID=test-role-editor

5. Run integration tests:
   npm run test:integration
*/
