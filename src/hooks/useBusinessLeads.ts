import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { BusinessLead, LeadFilters, PaginationParams } from '../types/leads'

export function useBusinessLeads(filters: LeadFilters, pagination: PaginationParams) {
  return useQuery({
    queryKey: ['business-leads', filters, pagination],
    queryFn: async () => {
      let query = supabase
        .from('business_leads')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters.search) {
        query = query.or(`company_name.ilike.%${filters.search}%,owner_name.ilike.%${filters.search}%,contact_email.ilike.%${filters.search}%`)
      }

      if (filters.status?.length) {
        query = query.in('status', filters.status)
      }

      if (filters.industry_type?.length) {
        query = query.in('industry_type', filters.industry_type)
      }

      if (filters.enrichment_status?.length) {
        query = query.in('enrichment_status', filters.enrichment_status)
      }

      if (filters.lead_source?.length) {
        query = query.in('lead_source', filters.lead_source)
      }

      if (filters.sba_score_min !== undefined) {
        query = query.gte('sba_ready_score', filters.sba_score_min)
      }

      if (filters.sba_score_max !== undefined) {
        query = query.lte('sba_ready_score', filters.sba_score_max)
      }

      if (filters.has_email !== undefined) {
        if (filters.has_email) {
          query = query.not('contact_email', 'is', null)
        } else {
          query = query.is('contact_email', null)
        }
      }

      if (filters.has_phone !== undefined) {
        if (filters.has_phone) {
          query = query.not('contact_phone', 'is', null)
        } else {
          query = query.is('contact_phone', null)
        }
      }

      if (filters.tags?.length) {
        query = query.overlaps('tags', filters.tags)
      }

      if (filters.date_range) {
        query = query.gte('created_at', filters.date_range.start)
          .lte('created_at', filters.date_range.end)
      }

      // Apply sorting
      if (pagination.sortBy) {
        query = query.order(pagination.sortBy, { 
          ascending: pagination.sortOrder === 'asc' 
        })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit
      query = query.range(offset, offset + pagination.limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return {
        data: data as BusinessLead[],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit)
      }
    },
    staleTime: 30000, // 30 seconds
  })
}

export function useBusinessLeadById(id: string) {
  return useQuery({
    queryKey: ['business-lead', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_leads')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as BusinessLead
    },
    enabled: !!id,
  })
}

export function useUpdateBusinessLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BusinessLead> }) => {
      const { data, error } = await supabase
        .from('business_leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as BusinessLead
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['business-leads'] })
      queryClient.setQueryData(['business-lead', data.id], data)
    },
  })
}

export function useCreateBusinessLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (lead: Omit<BusinessLead, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('business_leads')
        .insert(lead)
        .select()
        .single()

      if (error) throw error
      return data as BusinessLead
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-leads'] })
    },
  })
}

export function useDeleteBusinessLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('business_leads')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-leads'] })
    },
  })
}

export function useBulkUpdateBusinessLeads() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<BusinessLead> }) => {
      const { data, error } = await supabase
        .from('business_leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .in('id', ids)
        .select()

      if (error) throw error
      return data as BusinessLead[]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-leads'] })
    },
  })
}