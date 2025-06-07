/*
# Create business leads table

1. New Tables
   - `business_leads`
     - `id` (uuid, primary key)
     - `company_name` (text, required) - Name of the business
     - `owner_name` (text, optional) - Business owner name
     - `contact_email` (text, optional) - Primary contact email
     - `contact_phone` (text, optional) - Primary contact phone
     - `website_url` (text, optional) - Company website URL
     - `street_address` (text, optional) - Street address
     - `city` (text, optional) - City
     - `state` (text, optional) - State/Province
     - `postal_code` (text, optional) - ZIP/Postal code
     - `full_address` (text, optional) - Complete formatted address
     - `business_profile_url` (text, optional) - Business profile URL
     - `industry_type` (text, optional) - Industry classification
     - `geography` (text, optional) - Geographic market
     - `domain_age_years` (integer, optional) - Age of domain in years
     - `review_count` (integer, optional) - Number of reviews
     - `star_rating` (numeric, optional) - Average star rating
     - `valuation_range` (text, optional) - Business valuation range
     - `sba_ready_score` (integer, optional) - SBA readiness score
     - `notes` (text, optional) - Additional notes
     - `lead_source` (text, optional) - Source of the lead
     - `data_source` (text, optional) - Data collection source
     - `enrichment_status` (text, default 'pending') - Data enrichment status
     - `tags` (text array, optional) - Classification tags
     - `status` (text, default 'new') - Lead status
     - `is_valid` (boolean, default true) - Data validity flag
     - `is_exported_to_crm` (boolean, default false) - CRM export status
     - `crm_contact_id` (text, optional) - CRM system contact ID
     - `client_id` (uuid, optional) - Reference to clients table
     - `date_scraped` (timestamptz, optional) - Data collection date
     - `date_enriched` (timestamptz, optional) - Data enrichment date
     - `created_at` (timestamptz, default now()) - Record creation timestamp
     - `updated_at` (timestamptz, default now()) - Last update timestamp

2. Security
   - Enable RLS on `business_leads` table
   - Add policy for authenticated users to manage their business leads data

3. Changes
   - Initial table creation for business leads management
   - Foreign key constraint to clients table
*/

CREATE TABLE IF NOT EXISTS business_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  owner_name text,
  contact_email text,
  contact_phone text,
  website_url text,
  street_address text,
  city text,
  state text,
  postal_code text,
  full_address text,
  business_profile_url text,
  industry_type text,
  geography text,
  domain_age_years integer,
  review_count integer,
  star_rating numeric,
  valuation_range text,
  sba_ready_score integer,
  notes text,
  lead_source text,
  data_source text,
  enrichment_status text DEFAULT 'pending',
  tags text[],
  status text DEFAULT 'new',
  is_valid boolean DEFAULT true,
  is_exported_to_crm boolean DEFAULT false,
  crm_contact_id text,
  client_id uuid REFERENCES clients(id),
  date_scraped timestamptz,
  date_enriched timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE business_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage business leads data"
  ON business_leads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_business_leads_company_name ON business_leads(company_name);
CREATE INDEX IF NOT EXISTS idx_business_leads_status ON business_leads(status);
CREATE INDEX IF NOT EXISTS idx_business_leads_enrichment_status ON business_leads(enrichment_status);
CREATE INDEX IF NOT EXISTS idx_business_leads_created_at ON business_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_business_leads_client_id ON business_leads(client_id);