import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { BuyerLead, LeadFilters, PaginationParams } from '../types/leads'

export function useBuyerLeads(filters: LeadFilters, pagination: PaginationParams) {
  return useQuery({
    queryKey: ['buyer-leads', filters, pagination],
    queryFn: async () => {
      let query = supabase
        .from('buyer_leads')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }

      if (filters.status?.length) {
        query = query.in('status', filters.status)
      }

      if (filters.industry_type?.length) {
        query = query.overlaps('industries_of_interest', filters.industry_type)
      }

      if (filters.has_email !== undefined) {
        if (filters.has_email) {
          query = query.not('email', 'is', null)
        } else {
          query = query.is('email', null)
        }
      }

      if (filters.has_phone !== undefined) {
        if (filters.has_phone) {
          query = query.not('phone', 'is', null)
        } else {
          query = query.is('phone', null)
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
        data: data as BuyerLead[],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit)
      }
    },
    staleTime: 30000, // 30 seconds
  })
}

export function useBuyerLeadById(id: string) {
  return useQuery({
    queryKey: ['buyer-lead', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buyer_leads')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as BuyerLead
    },
    enabled: !!id,
  })
}

export function useUpdateBuyerLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BuyerLead> }) => {
      const { data, error } = await supabase
        .from('buyer_leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as BuyerLead
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['buyer-leads'] })
      queryClient.setQueryData(['buyer-lead', data.id], data)
    },
  })
}

export function useCreateBuyerLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (lead: Omit<BuyerLead, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('buyer_leads')
        .insert(lead)
        .select()
        .single()

      if (error) throw error
      return data as BuyerLead
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-leads'] })
    },
  })
}

export function useDeleteBuyerLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('buyer_leads')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-leads'] })
    },
  })
}

export function useBulkUpdateBuyerLeads() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Partial<BuyerLead> }) => {
      const { data, error } = await supabase
        .from('buyer_leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .in('id', ids)
        .select()

      if (error) throw error
      return data as BuyerLead[]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-leads'] })
    },
  })
}