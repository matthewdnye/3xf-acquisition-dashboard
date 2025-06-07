import React, { useState } from 'react'
import { X, Plus, Building2, User } from 'lucide-react'
import { useLeadStore } from '../../stores/leadStore'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { BusinessLeadForm } from './BusinessLeadForm'
import { BuyerLeadForm } from './BuyerLeadForm'

interface AddLeadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddLeadModal({ isOpen, onClose }: AddLeadModalProps) {
  const { activeTab } = useLeadStore()
  const [leadType, setLeadType] = useState<'business' | 'buyer'>(activeTab)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Lead</h2>
              <p className="text-sm text-gray-500">Create a new business or buyer lead</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col max-h-[calc(90vh-120px)]">
          {/* Lead Type Selector */}
          <div className="p-6 border-b border-gray-200">
            <Tabs value={leadType} onValueChange={(value) => setLeadType(value as 'business' | 'buyer')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="business" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Business Lead
                </TabsTrigger>
                <TabsTrigger value="buyer" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Buyer Lead
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto">
            <Tabs value={leadType}>
              <TabsContent value="business" className="m-0">
                <BusinessLeadForm onSuccess={onClose} onCancel={onClose} />
              </TabsContent>
              
              <TabsContent value="buyer" className="m-0">
                <BuyerLeadForm onSuccess={onClose} onCancel={onClose} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}