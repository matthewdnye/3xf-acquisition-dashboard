/*
# Create clients table

1. New Tables
   - `clients`
     - `id` (uuid, primary key)
     - `name` (text, required) - Client company name
     - `crm_type` (text, optional) - Type of CRM system
     - `api_key` (text, optional) - API key for CRM integration
     - `notes` (text, optional) - Additional notes about client
     - `created_at` (timestamptz, default now()) - Record creation timestamp

2. Security
   - Enable RLS on `clients` table
   - Add policy for authenticated users to manage their client data

3. Changes
   - Initial table creation for client management system
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  crm_type text,
  api_key text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage client data"
  ON clients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);