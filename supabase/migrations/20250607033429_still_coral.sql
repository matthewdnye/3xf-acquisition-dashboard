/*
  # Assign Test User Permissions
  
  This migration assigns proper client access and roles to test users.
  Run this after creating test users through the authentication system.
*/

-- Update the user to be an admin for the test client
-- Replace 'test@example.com' with the actual email you used
UPDATE public.users 
SET 
  client_id = (SELECT id FROM public.clients WHERE name = 'Acme Acquisitions' LIMIT 1),
  role = 'admin',
  full_name = 'Test Admin User',
  is_active = true
WHERE email = 'test@example.com';

-- Create additional test users with different roles
-- First, you'll need to create these auth users via Supabase dashboard or app signup

-- Manager user (after creating auth user with manager@test.com)
UPDATE public.users 
SET 
  client_id = (SELECT id FROM public.clients WHERE name = 'Acme Acquisitions' LIMIT 1),
  role = 'manager',
  full_name = 'Test Manager User',
  is_active = true
WHERE email = 'manager@test.com';

-- Viewer user (after creating auth user with viewer@test.com)  
UPDATE public.users 
SET 
  client_id = (SELECT id FROM public.clients WHERE name = 'Acme Acquisitions' LIMIT 1),
  role = 'viewer',
  full_name = 'Test Viewer User',
  is_active = true
WHERE email = 'viewer@test.com';

-- Verify the users were created and assigned properly
SELECT 
  u.email,
  u.full_name,
  u.role,
  u.is_active,
  c.name as client_name
FROM public.users u
LEFT JOIN public.clients c ON u.client_id = c.id
WHERE u.email IN ('test@example.com', 'manager@test.com', 'viewer@test.com');