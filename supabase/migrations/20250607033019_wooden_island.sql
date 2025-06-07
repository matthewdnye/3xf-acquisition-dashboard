/*
  # User Management and Authentication Schema

  1. New Tables
    - `users` - User profiles linked to auth.users with client association and roles
  
  2. Security
    - Enable RLS on users table
    - Create policies for user data access
    - Add auth trigger for automatic profile creation
  
  3. Functions
    - `handle_new_user()` - Creates user profile on signup
    - `user_has_client_access()` - Reusable RLS function for all modules
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  client_id uuid REFERENCES clients(id),
  role text DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'viewer')),
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
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

-- Admins can manage all users in their client
CREATE POLICY "Admins can manage client users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT client_id FROM users WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, created_at)
  VALUES (new.id, new.email, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Reusable function to check client access (for all module RLS policies)
CREATE OR REPLACE FUNCTION public.user_has_client_access(check_client_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN check_client_id IN (
    SELECT client_id FROM public.users WHERE auth_id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing tables to use the new RLS function
DROP POLICY IF EXISTS "Users can manage business leads data" ON business_leads;
CREATE POLICY "Users can access their client's business leads"
  ON business_leads
  FOR ALL
  TO authenticated
  USING (public.user_has_client_access(client_id))
  WITH CHECK (public.user_has_client_access(client_id));

DROP POLICY IF EXISTS "Users can manage buyer leads data" ON buyer_leads;
CREATE POLICY "Users can access their client's buyer leads"
  ON buyer_leads
  FOR ALL
  TO authenticated
  USING (public.user_has_client_access(client_id))
  WITH CHECK (public.user_has_client_access(client_id));

DROP POLICY IF EXISTS "Users can manage client data" ON clients;
CREATE POLICY "Users can access their assigned client"
  ON clients
  FOR SELECT
  TO authenticated
  USING (id IN (SELECT client_id FROM users WHERE auth_id = auth.uid()));

-- Allow admins to manage their client
CREATE POLICY "Admins can manage their client"
  ON clients
  FOR ALL
  TO authenticated
  USING (
    id IN (
      SELECT client_id FROM users WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );