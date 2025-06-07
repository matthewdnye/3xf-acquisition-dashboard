import React, { useState } from 'react'
import { Search, Plus, Download, Upload, BarChart3, Settings } from 'lucide-react'
import { useLeadStore } from '../../stores/leadStore'
import { useLeadStats } from '../../hooks/useLeadStats'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { BusinessLeadsTable } from './BusinessLeadsTable'
import { BuyerLeadsTable } from './BuyerLeadsTable'
import { AddLeadModal } from './AddLeadModal'
import { cn, debounce } from '../../lib/utils'

export function LeadManagerLayout() {
  const { 
    activeTab, 
    setActiveTab,
    businessLeadFilters,
    buyerLeadFilters,
    setBusinessLeadFilters,
    setBuyerLeadFilters
  } = useLeadStore()
  
  const { data: stats, isLoading: statsLoading } = useLeadStats()
  const [globalSearch, setGlobalSearch] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Debounced search handler
  const debouncedSearch = debounce((search: string) => {
    if (activeTab === 'business') {
      setBusinessLeadFilters({ ...businessLeadFilters, search })
    } else {
      setBuyerLeadFilters({ ...buyerLeadFilters, search })
    }
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setGlobalSearch(value)
    debouncedSearch(value)
  }

  const handleTabChange = (tab: 'business' | 'buyer') => {
    setActiveTab(tab)
    // Reset search when switching tabs
    setGlobalSearch('')
    setBusinessLeadFilters({ ...businessLeadFilters, search: '' })
    setBuyerLeadFilters({ ...buyerLeadFilters, search: '' })
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead Manager</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your business sellers and buyer leads
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-700">
              {statsLoading ? '...' : (stats?.business.total || 0) + (stats?.buyer.total || 0)}
            </div>
            <div className="text-sm text-blue-600">Total Leads</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-700">
              {statsLoading ? '...' : (stats?.business.new_today || 0) + (stats?.buyer.new_today || 0)}
            </div>
            <div className="text-sm text-green-600">New Today</div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-700">
              {statsLoading ? '...' : stats?.business.pending_enrichment || 0}
            </div>
            <div className="text-sm text-yellow-600">Pending Enrichment</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-700">
              {statsLoading ? '...' : stats?.business.enriched_today || 0}
            </div>
            <div className="text-sm text-purple-600">Enriched Today</div>
          </div>
          
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-indigo-700">
              {statsLoading ? '...' : stats?.business.exported_today || 0}
            </div>
            <div className="text-sm text-indigo-600">Exported Today</div>
          </div>
        </div>
      </div>

      {/* Search and Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search leads..."
              value={globalSearch}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="business" className="flex items-center gap-2">
                Business Leads
                <Badge variant="secondary" className="ml-1">
                  {stats?.business.total || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="buyer" className="flex items-center gap-2">
                Buyer Leads
                <Badge variant="secondary" className="ml-1">
                  {stats?.buyer.total || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="business" className="h-full m-0">
            <BusinessLeadsTable />
          </TabsContent>
          
          <TabsContent value="buyer" className="h-full m-0">
            <BuyerLeadsTable />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Lead Modal */}
      <AddLeadModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  )
}