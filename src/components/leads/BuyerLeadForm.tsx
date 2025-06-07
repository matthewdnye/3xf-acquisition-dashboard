import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Save, X } from 'lucide-react'
import { useCreateBuyerLead } from '../../hooks/useBuyerLeads'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import toast from 'react-hot-toast'

const buyerLeadSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  geography_preference: z.string().optional(),
  industries_of_interest: z.array(z.string()).optional(),
  budget_range: z.string().optional(),
  experience_level: z.string().optional(),
  is_accredited: z.boolean().optional(),
  sba_prequalified: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
})

type BuyerLeadFormData = z.infer<typeof buyerLeadSchema>

interface BuyerLeadFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function BuyerLeadForm({ onSuccess, onCancel }: BuyerLeadFormProps) {
  const createLead = useCreateBuyerLead()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<BuyerLeadFormData>({
    resolver: zodResolver(buyerLeadSchema),
  })

  const watchedAccredited = watch('is_accredited')
  const watchedSbaPrequalified = watch('sba_prequalified')

  const onSubmit = async (data: BuyerLeadFormData) => {
    try {
      // Clean up empty strings to null for optional fields
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === '' ? null : value
        ])
      )

      await createLead.mutateAsync(cleanedData)
      toast.success('Buyer lead created successfully!')
      onSuccess()
    } catch (error) {
      console.error('Error creating buyer lead:', error)
      toast.error('Failed to create buyer lead')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <Input
              id="first_name"
              {...register('first_name')}
              placeholder="John"
              className={errors.first_name ? 'border-red-500' : ''}
            />
            {errors.first_name && (
              <p className="text-sm text-red-600 mt-1">{errors.first_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <Input
              id="last_name"
              {...register('last_name')}
              placeholder="Doe"
              className={errors.last_name ? 'border-red-500' : ''}
            />
            {errors.last_name && (
              <p className="text-sm text-red-600 mt-1">{errors.last_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john.doe@email.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>

      {/* Investment Preferences */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="geography_preference" className="block text-sm font-medium text-gray-700 mb-1">
              Geography Preference
            </label>
            <Input
              id="geography_preference"
              {...register('geography_preference')}
              placeholder="e.g., Northeast, California, Remote"
            />
          </div>

          <div>
            <label htmlFor="budget_range" className="block text-sm font-medium text-gray-700 mb-1">
              Budget Range
            </label>
            <Select onValueChange={(value) => setValue('budget_range', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select budget range" />
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
            <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700 mb-1">
              Experience Level
            </label>
            <Select onValueChange={(value) => setValue('experience_level', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first-time">First-time Buyer</SelectItem>
                <SelectItem value="experienced">Experienced</SelectItem>
                <SelectItem value="serial">Serial Entrepreneur</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Qualifications</label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_accredited"
                checked={watchedAccredited || false}
                onCheckedChange={(checked) => setValue('is_accredited', !!checked)}
              />
              <label htmlFor="is_accredited" className="text-sm text-gray-700">
                Accredited Investor
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sba_prequalified"
                checked={watchedSbaPrequalified || false}
                onCheckedChange={(checked) => setValue('sba_prequalified', !!checked)}
              />
              <label htmlFor="sba_prequalified" className="text-sm text-gray-700">
                SBA Pre-qualified
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Industries of Interest */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Industries of Interest</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'Restaurant',
            'Retail',
            'Healthcare',
            'Technology',
            'Manufacturing',
            'Real Estate',
            'Professional Services',
            'Automotive',
            'Beauty & Wellness',
            'Education',
            'Entertainment',
            'Other'
          ].map((industry) => (
            <div key={industry} className="flex items-center space-x-2">
              <Checkbox
                id={`industry-${industry}`}
                onCheckedChange={(checked) => {
                  const current = watch('industries_of_interest') || []
                  if (checked) {
                    setValue('industries_of_interest', [...current, industry])
                  } else {
                    setValue('industries_of_interest', current.filter(i => i !== industry))
                  }
                }}
              />
              <label htmlFor={`industry-${industry}`} className="text-sm text-gray-700">
                {industry}
              </label>
            </div>
          ))}
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