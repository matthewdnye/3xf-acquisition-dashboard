import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          crm_type: string | null
          api_key: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          crm_type?: string | null
          api_key?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          crm_type?: string | null
          api_key?: string | null
          notes?: string | null
          created_at?: string | null
        }
      }
      business_leads: {
        Row: {
          id: string
          company_name: string
          owner_name: string | null
          contact_email: string | null
          contact_phone: string | null
          website_url: string | null
          street_address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          full_address: string | null
          business_profile_url: string | null
          industry_type: string | null
          geography: string | null
          domain_age_years: number | null
          review_count: number | null
          star_rating: number | null
          valuation_range: string | null
          sba_ready_score: number | null
          notes: string | null
          lead_source: string | null
          data_source: string | null
          enrichment_status: string | null
          tags: string[] | null
          status: string | null
          is_valid: boolean | null
          is_exported_to_crm: boolean | null
          crm_contact_id: string | null
          client_id: string | null
          date_scraped: string | null
          date_enriched: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_name: string
          owner_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          website_url?: string | null
          street_address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          full_address?: string | null
          business_profile_url?: string | null
          industry_type?: string | null
          geography?: string | null
          domain_age_years?: number | null
          review_count?: number | null
          star_rating?: number | null
          valuation_range?: string | null
          sba_ready_score?: number | null
          notes?: string | null
          lead_source?: string | null
          data_source?: string | null
          enrichment_status?: string | null
          tags?: string[] | null
          status?: string | null
          is_valid?: boolean | null
          is_exported_to_crm?: boolean | null
          crm_contact_id?: string | null
          client_id?: string | null
          date_scraped?: string | null
          date_enriched?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_name?: string
          owner_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          website_url?: string | null
          street_address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          full_address?: string | null
          business_profile_url?: string | null
          industry_type?: string | null
          geography?: string | null
          domain_age_years?: number | null
          review_count?: number | null
          star_rating?: number | null
          valuation_range?: string | null
          sba_ready_score?: number | null
          notes?: string | null
          lead_source?: string | null
          data_source?: string | null
          enrichment_status?: string | null
          tags?: string[] | null
          status?: string | null
          is_valid?: boolean | null
          is_exported_to_crm?: boolean | null
          crm_contact_id?: string | null
          client_id?: string | null
          date_scraped?: string | null
          date_enriched?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      buyer_leads: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          geography_preference: string | null
          industries_of_interest: string[] | null
          budget_range: string | null
          is_accredited: boolean | null
          skills: string[] | null
          experience_level: string | null
          sba_prequalified: boolean | null
          tags: string[] | null
          status: string | null
          is_exported_to_crm: boolean | null
          crm_contact_id: string | null
          client_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          geography_preference?: string | null
          industries_of_interest?: string[] | null
          budget_range?: string | null
          is_accredited?: boolean | null
          skills?: string[] | null
          experience_level?: string | null
          sba_prequalified?: boolean | null
          tags?: string[] | null
          status?: string | null
          is_exported_to_crm?: boolean | null
          crm_contact_id?: string | null
          client_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          geography_preference?: string | null
          industries_of_interest?: string[] | null
          budget_range?: string | null
          is_accredited?: boolean | null
          skills?: string[] | null
          experience_level?: string | null
          sba_prequalified?: boolean | null
          tags?: string[] | null
          status?: string | null
          is_exported_to_crm?: boolean | null
          crm_contact_id?: string | null
          client_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}