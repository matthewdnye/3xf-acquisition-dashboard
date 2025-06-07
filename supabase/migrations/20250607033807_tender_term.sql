/*
  # Fix infinite recursion in users table RLS policies

  1. Security Functions
    - Create helper function to check user client access safely
    - Create function to check if user is admin safely
  
  2. Updated Policies
    - Replace problematic "Admins can manage client users" policy
    - Use security definer functions to avoid recursion
    
  3. Changes
    - Drop existing problematic policy
    - Create new safe policies using helper functions
*/

-- Create a security definer function to check if user has client access
-- This function runs with elevated privileges to avoid RLS recursion
CREATE OR REPLACE FUNCTION auth.user_has_client_access(target_client_id uuid)
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
CREATE OR REPLACE FUNCTION auth.user_is_admin_for_client(target_client_id uuid)
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
CREATE OR REPLACE FUNCTION auth.get_user_client_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id 
  FROM public.users 
  WHERE auth_id = auth.uid();
$$;

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage client users" ON users;

-- Create new policies that don't cause recursion
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

-- Create a safe policy for admins to manage users in their client
-- This policy only applies to users with the same client_id
CREATE POLICY "Admins can manage users in same client"
  ON users
  FOR ALL
  TO authenticated
  USING (
    -- User can access if it's their own record OR they are admin of the same client
    auth_id = auth.uid() 
    OR (
      client_id = auth.get_user_client_id()
      AND auth.user_is_admin_for_client(auth.get_user_client_id())
    )
  )
  WITH CHECK (
    -- User can modify if it's their own record OR they are admin of the same client
    auth_id = auth.uid() 
    OR (
      client_id = auth.get_user_client_id()
      AND auth.user_is_admin_for_client(auth.get_user_client_id())
    )
  );

-- Update the user_has_client_access function to use the new auth functions
CREATE OR REPLACE FUNCTION public.user_has_client_access(target_client_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.user_has_client_access(target_client_id);
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION auth.user_has_client_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION auth.user_is_admin_for_client(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION auth.get_user_client_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_client_access(uuid) TO authenticated;