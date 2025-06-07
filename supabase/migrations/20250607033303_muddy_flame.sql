/*
  # Sample Data for Testing Authentication System

  This creates test users and assigns them to a client for testing purposes.
  Run this after setting up the auth system and creating users via the Supabase dashboard.
*/

-- Insert a test client if it doesn't exist
INSERT INTO public.clients (id, name, crm_type, notes) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440001', 
  'Acme Acquisitions', 
  'salesforce',
  'Test client for development and testing'
) ON CONFLICT (id) DO NOTHING;

-- Note: You'll need to create auth users manually via Supabase dashboard first
-- Then update their profiles with client assignment and roles

-- Example: After creating auth users, update their profiles:
-- UPDATE public.users 
-- SET 
--   client_id = '550e8400-e29b-41d4-a716-446655440001',
--   role = 'admin',
--   full_name = 'Admin User'
-- WHERE email = 'admin@test.com';

-- UPDATE public.users 
-- SET 
--   client_id = '550e8400-e29b-41d4-a716-446655440001',
--   role = 'manager',
--   full_name = 'Manager User'
-- WHERE email = 'manager@test.com';

-- UPDATE public.users 
-- SET 
--   client_id = '550e8400-e29b-41d4-a716-446655440001',
--   role = 'viewer',
--   full_name = 'Viewer User'
-- WHERE email = 'viewer@test.com';

-- Update existing leads to belong to the test client
UPDATE public.business_leads 
SET client_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE client_id IS NULL;

UPDATE public.buyer_leads 
SET client_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE client_id IS NULL;