import { create } from 'zustand'
import { LeadFilters } from '../types/leads'

interface LeadStore {
  // Selected lead IDs for bulk operations
  selectedBusinessLeads: Set<string>
  selectedBuyerLeads: Set<string>
  
  // Active filters
  businessLeadFilters: LeadFilters
  buyerLeadFilters: LeadFilters
  
  // View preferences
  viewMode: 'table' | 'cards'
  tablePageSize: number
  activeTab: 'business' | 'buyer'
  
  // UI state
  isDetailModalOpen: boolean
  detailModalLeadId: string | null
  detailModalType: 'business' | 'buyer' | null
  
  // Actions
  setSelectedBusinessLeads: (ids: Set<string>) => void
  setSelectedBuyerLeads: (ids: Set<string>) => void
  toggleBusinessLead: (id: string) => void
  toggleBuyerLead: (id: string) => void
  clearAllSelections: () => void
  
  setBusinessLeadFilters: (filters: LeadFilters) => void
  setBuyerLeadFilters: (filters: LeadFilters) => void
  clearBusinessFilters: () => void
  clearBuyerFilters: () => void
  
  setViewMode: (mode: 'table' | 'cards') => void
  setTablePageSize: (size: number) => void
  setActiveTab: (tab: 'business' | 'buyer') => void
  
  openDetailModal: (leadId: string, type: 'business' | 'buyer') => void
  closeDetailModal: () => void
}

export const useLeadStore = create<LeadStore>((set, get) => ({
  // Initial state
  selectedBusinessLeads: new Set(),
  selectedBuyerLeads: new Set(),
  businessLeadFilters: {},
  buyerLeadFilters: {},
  viewMode: 'table',
  tablePageSize: 25,
  activeTab: 'business',
  isDetailModalOpen: false,
  detailModalLeadId: null,
  detailModalType: null,
  
  // Selection actions
  setSelectedBusinessLeads: (ids) => set({ selectedBusinessLeads: ids }),
  setSelectedBuyerLeads: (ids) => set({ selectedBuyerLeads: ids }),
  
  toggleBusinessLead: (id) => set((state) => {
    const newSelected = new Set(state.selectedBusinessLeads)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    return { selectedBusinessLeads: newSelected }
  }),
  
  toggleBuyerLead: (id) => set((state) => {
    const newSelected = new Set(state.selectedBuyerLeads)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    return { selectedBuyerLeads: newSelected }
  }),
  
  clearAllSelections: () => set({
    selectedBusinessLeads: new Set(),
    selectedBuyerLeads: new Set(),
  }),
  
  // Filter actions
  setBusinessLeadFilters: (filters) => set({ businessLeadFilters: filters }),
  setBuyerLeadFilters: (filters) => set({ buyerLeadFilters: filters }),
  clearBusinessFilters: () => set({ businessLeadFilters: {} }),
  clearBuyerFilters: () => set({ buyerLeadFilters: {} }),
  
  // View actions
  setViewMode: (mode) => set({ viewMode: mode }),
  setTablePageSize: (size) => set({ tablePageSize: size }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // Modal actions
  openDetailModal: (leadId, type) => set({
    isDetailModalOpen: true,
    detailModalLeadId: leadId,
    detailModalType: type,
  }),
  
  closeDetailModal: () => set({
    isDetailModalOpen: false,
    detailModalLeadId: null,
    detailModalType: null,
  }),
}))