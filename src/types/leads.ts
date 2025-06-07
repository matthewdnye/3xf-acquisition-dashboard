export interface BusinessLead {
  id: string
  company_name: string
  owner_name?: string
  contact_email?: string
  contact_phone?: string
  website_url?: string
  street_address?: string
  city?: string
  state?: string
  postal_code?: string
  full_address?: string
  business_profile_url?: string
  industry_type?: string
  geography?: string
  domain_age_years?: number
  review_count?: number
  star_rating?: number
  valuation_range?: string
  sba_ready_score?: number
  notes?: string
  lead_source?: string
  data_source?: string
  enrichment_status?: 'pending' | 'enriching' | 'completed' | 'failed'
  tags?: string[]
  status?: 'new' | 'contacted' | 'qualified' | 'disqualified'
  is_valid?: boolean
  is_exported_to_crm?: boolean
  crm_contact_id?: string
  client_id?: string
  date_scraped?: string
  date_enriched?: string
  created_at?: string
  updated_at?: string
}

export interface BuyerLead {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  geography_preference?: string
  industries_of_interest?: string[]
  budget_range?: string
  is_accredited?: boolean
  skills?: string[]
  experience_level?: string
  sba_prequalified?: boolean
  tags?: string[]
  status?: 'new' | 'contacted' | 'qualified' | 'disqualified'
  is_exported_to_crm?: boolean
  crm_contact_id?: string
  client_id?: string
  created_at?: string
  updated_at?: string
}

export interface LeadFilters {
  search?: string
  status?: string[]
  industry_type?: string[]
  geography?: string[]
  enrichment_status?: string[]
  lead_source?: string[]
  valuation_range?: string[]
  sba_score_min?: number
  sba_score_max?: number
  has_email?: boolean
  has_phone?: boolean
  tags?: string[]
  date_range?: {
    start: string
    end: string
  }
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface LeadStats {
  total: number
  new_today: number
  pending_enrichment: number
  enriched_today: number
  exported_today: number
}