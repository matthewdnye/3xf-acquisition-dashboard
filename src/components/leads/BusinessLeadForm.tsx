import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Save, X } from 'lucide-react'
import { useCreateBusinessLead } from '../../hooks/useBusinessLeads'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import toast from 'react-hot-toast'

const businessLeadSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  owner_name: z.string().optional(),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  street_address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  industry_type: z.string().optional(),
  geography: z.string().optional(),
  valuation_range: z.string().optional(),
  lead_source: z.string().optional(),
  notes: z.string().optional(),
})

type BusinessLeadFormData = z.infer<typeof businessLeadSchema>

interface BusinessLeadFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function BusinessLeadForm({ onSuccess, onCancel }: BusinessLeadFormProps) {
  const createLead = useCreateBusinessLead()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<BusinessLeadFormData>({
    resolver: zodResolver(businessLeadSchema),
  })

  const onSubmit = async (data: BusinessLeadFormData) => {
    try {
      // Clean up empty strings to null for optional fields
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === '' ? null : value
        ])
      )

      await createLead.mutateAsync(cleanedData)
      toast.success('Business lead created successfully!')
      onSuccess()
    } catch (error) {
      console.error('Error creating business lead:', error)
      toast.error('Failed to create business lead')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Business Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <Input
              id="company_name"
              {...register('company_name')}
              placeholder="Enter company name"
              className={errors.company_name ? 'border-red-500' : ''}
            />
            {errors.company_name && (
              <p className="text-sm text-red-600 mt-1">{errors.company_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700 mb-1">
              Owner Name
            </label>
            <Input
              id="owner_name"
              {...register('owner_name')}
              placeholder="Enter owner name"
            />
          </div>

          <div>
            <label htmlFor="industry_type" className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <Input
              id="industry_type"
              {...register('industry_type')}
              placeholder="e.g., Restaurant, Retail, Healthcare"
            />
          </div>

          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="contact_email"
              type="email"
              {...register('contact_email')}
              placeholder="contact@company.com"
              className={errors.contact_email ? 'border-red-500' : ''}
            />
            {errors.contact_email && (
              <p className="text-sm text-red-600 mt-1">{errors.contact_email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <Input
              id="contact_phone"
              {...register('contact_phone')}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <Input
              id="website_url"
              {...register('website_url')}
              placeholder="https://company.com"
              className={errors.website_url ? 'border-red-500' : ''}
            />
            {errors.website_url && (
              <p className="text-sm text-red-600 mt-1">{errors.website_url.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="street_address" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <Input
              id="street_address"
              {...register('street_address')}
              placeholder="123 Main Street"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <Input
              id="city"
              {...register('city')}
              placeholder="New York"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <Input
              id="state"
              {...register('state')}
              placeholder="NY"
            />
          </div>

          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <Input
              id="postal_code"
              {...register('postal_code')}
              placeholder="10001"
            />
          </div>

          <div>
            <label htmlFor="geography" className="block text-sm font-medium text-gray-700 mb-1">
              Geography/Region
            </label>
            <Input
              id="geography"
              {...register('geography')}
              placeholder="Northeast"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="valuation_range" className="block text-sm font-medium text-gray-700 mb-1">
              Valuation Range
            </label>
            <Select onValueChange={(value) => setValue('valuation_range', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select valuation range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-100k">Under $100K</SelectItem>
                <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                <SelectItem value="5m-plus">$5M+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="lead_source" className="block text-sm font-medium text-gray-700 mb-1">
              Lead Source
            </label>
            <Select onValueChange={(value) => setValue('lead_source', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select lead source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="social-media">Social Media</SelectItem>
                <SelectItem value="cold-outreach">Cold Outreach</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="advertisement">Advertisement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Add any additional notes about this lead..."
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Creating...' : 'Create Lead'}
        </Button>
      </div>
    </form>
  )
}