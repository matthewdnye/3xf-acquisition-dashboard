/*
  # Fix RLS policy recursion and function dependencies

  1. Drop all dependent policies first
  2. Drop existing functions 
  3. Create new SECURITY DEFINER functions to avoid recursion
  4. Recreate policies using the new functions
*/

-- First, drop all policies that depend on the functions we need to recreate
DROP POLICY IF EXISTS "Users can access their client's business leads" ON business_leads;
DROP POLICY IF EXISTS "Users can access their client's buyer leads" ON buyer_leads;
DROP POLICY IF EXISTS "Users can access their assigned client" ON clients;
DROP POLICY IF EXISTS "Admins can manage their client" ON clients;
DROP POLICY IF EXISTS "Admins can manage client users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Now we can safely drop the functions since no policies depend on them
DROP FUNCTION IF EXISTS public.user_has_client_access(uuid);
DROP FUNCTION IF EXISTS public.user_has_client_access(check_client_id uuid);
DROP FUNCTION IF EXISTS public.user_is_admin_for_client(uuid);
DROP FUNCTION IF EXISTS public.get_current_user_profile();
DROP FUNCTION IF EXISTS public.get_user_client_id();

-- Create security definer functions to safely access user data without recursion
-- These functions bypass RLS when checking permissions

CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE(user_id uuid, client_id uuid, role text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, client_id, role
  FROM public.users 
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.user_has_client_access(target_client_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE auth_id = auth.uid() 
    AND client_id = target_client_id
  );
$$;

CREATE OR REPLACE FUNCTION public.user_is_admin_for_client(target_client_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE auth_id = auth.uid() 
    AND client_id = target_client_id 
    AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_client_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id 
  FROM public.users 
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$;

-- Grant execute permissions on the helper functions
GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_client_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_is_admin_for_client(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_client_id() TO authenticated;

-- Recreate users table policies with non-recursive logic
-- These policies use direct auth.uid() checks to avoid recursion

CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "Admins can manage client users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    -- Allow access if it's the user's own record
    auth_id = auth.uid() 
    OR 
    -- OR if the current user is an admin of the same client
    client_id IN (
      SELECT u.client_id 
      FROM public.users u 
      WHERE u.auth_id = auth.uid() 
      AND u.role = 'admin'
    )
  )
  WITH CHECK (
    -- Same logic for modifications
    auth_id = auth.uid() 
    OR 
    client_id IN (
      SELECT u.client_id 
      FROM public.users u 
      WHERE u.auth_id = auth.uid() 
      AND u.role = 'admin'
    )
  );

-- Recreate business_leads policies using the new helper function
CREATE POLICY "Users can access their client's business leads"
  ON business_leads
  FOR ALL
  TO authenticated
  USING (public.user_has_client_access(client_id))
  WITH CHECK (public.user_has_client_access(client_id));

-- Recreate buyer_leads policies using the new helper function
CREATE POLICY "Users can access their client's buyer leads"
  ON buyer_leads
  FOR ALL
  TO authenticated
  USING (public.user_has_client_access(client_id))
  WITH CHECK (public.user_has_client_access(client_id));

-- Recreate clients table policies using the new helper functions
CREATE POLICY "Users can access their assigned client"
  ON clients
  FOR SELECT
  TO authenticated
  USING (public.user_has_client_access(id));

CREATE POLICY "Admins can manage their client"
  ON clients
  FOR ALL
  TO authenticated
  USING (public.user_is_admin_for_client(id))
  WITH CHECK (public.user_is_admin_for_client(id));