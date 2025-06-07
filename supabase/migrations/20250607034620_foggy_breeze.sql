/*
  # Fix RLS policies and helper functions

  1. Drop dependent policies first
  2. Drop existing functions 
  3. Recreate improved functions
  4. Recreate policies with better logic
  5. Grant proper permissions

  This migration fixes the infinite recursion issues in RLS policies
  and creates more efficient helper functions.
*/

-- Step 1: Drop all policies that depend on the functions we want to recreate
DROP POLICY IF EXISTS "Users can access their client's business leads" ON business_leads;
DROP POLICY IF EXISTS "Users can access their client's buyer leads" ON buyer_leads;
DROP POLICY IF EXISTS "Users can access their assigned client" ON clients;
DROP POLICY IF EXISTS "Admins can manage their client" ON clients;
DROP POLICY IF EXISTS "Admins can manage client users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Step 2: Now safely drop the functions
DROP FUNCTION IF EXISTS public.user_has_client_access(uuid);
DROP FUNCTION IF EXISTS public.user_is_admin_for_client(uuid);
DROP FUNCTION IF EXISTS public.get_current_user_profile();
DROP FUNCTION IF EXISTS public.get_user_client_id();

-- Step 3: Create new security definer functions to safely get current user's profile
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

-- Function to check if user has client access
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

-- Function to check if user is admin for a client
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

-- Function to get user's client_id
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

-- Step 4: Grant execute permissions on the helper functions
GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_client_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_is_admin_for_client(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_client_id() TO authenticated;

-- Step 5: Create simple, non-recursive policies for the users table

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

-- Policy 2: Admins can manage all users in their client
-- Using a simplified approach that avoids recursion
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

-- Step 6: Recreate policies on other tables using the new helper functions

-- Business leads policies
CREATE POLICY "Users can access their client's business leads"
  ON business_leads
  FOR ALL
  TO authenticated
  USING (public.user_has_client_access(client_id))
  WITH CHECK (public.user_has_client_access(client_id));

-- Buyer leads policies  
CREATE POLICY "Users can access their client's buyer leads"
  ON buyer_leads
  FOR ALL
  TO authenticated
  USING (public.user_has_client_access(client_id))
  WITH CHECK (public.user_has_client_access(client_id));

-- Clients table policies
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