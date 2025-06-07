import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { LeadStats } from '../types/leads'

export function useLeadStats() {
  return useQuery({
    queryKey: ['lead-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]

      // Get business leads stats
      const [
        { count: totalBusinessLeads },
        { count: newBusinessLeadsToday },
        { count: pendingEnrichment },
        { count: enrichedToday },
        { count: exportedToday }
      ] = await Promise.all([
        supabase.from('business_leads').select('*', { count: 'exact', head: true }),
        supabase.from('business_leads').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('business_leads').select('*', { count: 'exact', head: true }).eq('enrichment_status', 'pending'),
        supabase.from('business_leads').select('*', { count: 'exact', head: true }).gte('date_enriched', today),
        supabase.from('business_leads').select('*', { count: 'exact', head: true }).eq('is_exported_to_crm', true).gte('updated_at', today)
      ])

      // Get buyer leads stats
      const [
        { count: totalBuyerLeads },
        { count: newBuyerLeadsToday }
      ] = await Promise.all([
        supabase.from('buyer_leads').select('*', { count: 'exact', head: true }),
        supabase.from('buyer_leads').select('*', { count: 'exact', head: true }).gte('created_at', today)
      ])

      return {
        business: {
          total: totalBusinessLeads || 0,
          new_today: newBusinessLeadsToday || 0,
          pending_enrichment: pendingEnrichment || 0,
          enriched_today: enrichedToday || 0,
          exported_today: exportedToday || 0,
        },
        buyer: {
          total: totalBuyerLeads || 0,
          new_today: newBuyerLeadsToday || 0,
          pending_enrichment: 0,
          enriched_today: 0,
          exported_today: 0,
        }
      }
    },
    refetchInterval: 60000, // Refresh every minute
  })
}