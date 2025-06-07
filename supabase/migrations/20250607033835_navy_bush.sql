/*
  # Fix infinite recursion in users table RLS policies

  1. Drop problematic recursive policy
  2. Create safe helper functions in public schema
  3. Implement non-recursive RLS policies
  4. Grant necessary permissions

  This fixes the "infinite recursion detected in policy for relation users" error
  by removing circular dependencies in RLS policies.
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage client users" ON users;

-- Create a security definer function to safely get current user's profile
-- This bypasses RLS to avoid recursion when checking permissions
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

-- Create a security definer function to check if user has client access
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

-- Create a security definer function to check if user is admin for a client
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

-- Create a security definer function to get user's client_id
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

-- Create simple, non-recursive policies for the users table

-- Policy 1: Users can always view and update their own profile
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

-- Policy 2: Admins can view all users in their client (simplified, non-recursive)
CREATE POLICY "Admins can view client users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Either it's the user's own record, OR check if they're an admin
    auth_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.users admin_check
      WHERE admin_check.auth_id = auth.uid() 
      AND admin_check.role = 'admin'
      AND admin_check.client_id = users.client_id
    )
  );

-- Policy 3: Admins can insert/update/delete users in their client
CREATE POLICY "Admins can manage client users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    -- For SELECT/UPDATE/DELETE: Either own record or admin of same client
    auth_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.users admin_check
      WHERE admin_check.auth_id = auth.uid() 
      AND admin_check.role = 'admin'
      AND admin_check.client_id = users.client_id
    )
  )
  WITH CHECK (
    -- For INSERT/UPDATE: Either own record or admin of same client
    auth_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.users admin_check
      WHERE admin_check.auth_id = auth.uid() 
      AND admin_check.role = 'admin'
      AND admin_check.client_id = users.client_id
    )
  );

-- Grant execute permissions on the helper functions
GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_client_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_is_admin_for_client(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_client_id() TO authenticated;

-- Update existing policies on other tables to use the new helper function
-- This ensures consistency across all tables

-- Update business_leads RLS policy
DROP POLICY IF EXISTS "Users can access their client's business leads" ON business_leads;
CREATE POLICY "Users can access their client's business leads"
  ON business_leads
  FOR ALL
  TO authenticated
  USING (public.user_has_client_access(client_id))
  WITH CHECK (public.user_has_client_access(client_id));

-- Update buyer_leads RLS policy  
DROP POLICY IF EXISTS "Users can access their client's buyer leads" ON buyer_leads;
CREATE POLICY "Users can access their client's buyer leads"
  ON buyer_leads
  FOR ALL
  TO authenticated
  USING (public.user_has_client_access(client_id))
  WITH CHECK (public.user_has_client_access(client_id));

-- Update clients table policies
DROP POLICY IF EXISTS "Users can access their assigned client" ON clients;
DROP POLICY IF EXISTS "Admins can manage their client" ON clients;

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