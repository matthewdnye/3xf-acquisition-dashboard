/*
# Create buyer leads table

1. New Tables
   - `buyer_leads`
     - `id` (uuid, primary key)
     - `first_name` (text, optional) - Buyer's first name
     - `last_name` (text, optional) - Buyer's last name
     - `email` (text, optional) - Primary contact email
     - `phone` (text, optional) - Primary contact phone
     - `geography_preference` (text, optional) - Preferred geographic area
     - `industries_of_interest` (text array, optional) - Industries of interest
     - `budget_range` (text, optional) - Available budget range
     - `is_accredited` (boolean, default false) - Accredited investor status
     - `skills` (text array, optional) - Relevant skills/experience
     - `experience_level` (text, optional) - Business experience level
     - `sba_prequalified` (boolean, default false) - SBA pre-qualification status
     - `tags` (text array, optional) - Classification tags
     - `status` (text, default 'new') - Lead status
     - `is_exported_to_crm` (boolean, default false) - CRM export status
     - `crm_contact_id` (text, optional) - CRM system contact ID
     - `client_id` (uuid, optional) - Reference to clients table
     - `created_at` (timestamptz, default now()) - Record creation timestamp
     - `updated_at` (timestamptz, default now()) - Last update timestamp

2. Security
   - Enable RLS on `buyer_leads` table
   - Add policy for authenticated users to manage their buyer leads data

3. Changes
   - Initial table creation for buyer leads management
   - Foreign key constraint to clients table
*/

CREATE TABLE IF NOT EXISTS buyer_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text,
  last_name text,
  email text,
  phone text,
  geography_preference text,
  industries_of_interest text[],
  budget_range text,
  is_accredited boolean DEFAULT false,
  skills text[],
  experience_level text,
  sba_prequalified boolean DEFAULT false,
  tags text[],
  status text DEFAULT 'new',
  is_exported_to_crm boolean DEFAULT false,
  crm_contact_id text,
  client_id uuid REFERENCES clients(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE buyer_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage buyer leads data"
  ON buyer_leads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_buyer_leads_first_name ON buyer_leads(first_name);
CREATE INDEX IF NOT EXISTS idx_buyer_leads_last_name ON buyer_leads(last_name);
CREATE INDEX IF NOT EXISTS idx_buyer_leads_email ON buyer_leads(email);
CREATE INDEX IF NOT EXISTS idx_buyer_leads_status ON buyer_leads(status);
CREATE INDEX IF NOT EXISTS idx_buyer_leads_created_at ON buyer_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_buyer_leads_client_id ON buyer_leads(client_id);