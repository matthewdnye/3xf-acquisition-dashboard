import React, { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table'
import { 
  ChevronDown, 
  ChevronUp,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Star,
  MapPin,
  Building2,
  TrendingUp
} from 'lucide-react'
import { useBusinessLeads, useUpdateBusinessLead } from '../../hooks/useBusinessLeads'
import { useLeadStore } from '../../stores/leadStore'
import { BusinessLead } from '../../types/leads'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { cn, formatDate } from '../../lib/utils'

const columnHelper = createColumnHelper<BusinessLead>()

export function BusinessLeadsTable() {
  const {
    businessLeadFilters,
    selectedBusinessLeads,
    setSelectedBusinessLeads,
    toggleBusinessLead,
    openDetailModal,
    tablePageSize
  } = useLeadStore()

  const [pagination, setPagination] = useState({
    page: 1,
    limit: tablePageSize,
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc'
  })

  const { data: leadsData, isLoading, error } = useBusinessLeads(businessLeadFilters, pagination)
  const updateLead = useUpdateBusinessLead()

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await updateLead.mutateAsync({
        id: leadId,
        updates: { status: newStatus as BusinessLead['status'] }
      })
    } catch (error) {
      console.error('Failed to update lead status:', error)
    }
  }

  const getEnrichmentStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'enriching':
        return <Badge variant="warning">Enriching</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getSbaScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value)
            const selectedIds = new Set<string>()
            if (value) {
              table.getRowModel().rows.forEach(row => {
                selectedIds.add(row.original.id)
              })
            }
            setSelectedBusinessLeads(selectedIds)
          }}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedBusinessLeads.has(row.original.id)}
          onCheckedChange={() => toggleBusinessLead(row.original.id)}
        />
      ),
      size: 50,
    }),
    
    columnHelper.accessor('company_name', {
      header: 'Company',
      cell: ({ row }) => (
        <div className="space-y-1">
          <button
            onClick={() => openDetailModal(row.original.id, 'business')}
            className="font-medium text-blue-600 hover:text-blue-800 text-left"
          >
            {row.original.company_name}
          </button>
          {row.original.owner_name && (
            <div className="text-sm text-gray-500">{row.original.owner_name}</div>
          )}
        </div>
      ),
    }),

    columnHelper.accessor('industry_type', {
      header: 'Industry',
      cell: ({ getValue }) => {
        const industry = getValue()
        return industry ? (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{industry}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
    }),

    columnHelper.accessor('geography', {
      header: 'Location',
      cell: ({ row }) => {
        const { city, state, geography } = row.original
        const location = geography || (city && state ? `${city}, ${state}` : city || state)
        return location ? (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{location}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
    }),

    columnHelper.accessor('valuation_range', {
      header: 'Valuation',
      cell: ({ getValue }) => {
        const range = getValue()
        return range ? (
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">{range}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
    }),

    columnHelper.accessor('sba_ready_score', {
      header: 'SBA Score',
      cell: ({ getValue }) => {
        const score = getValue()
        return score ? (
          <div className={cn('text-sm font-medium', getSbaScoreColor(score))}>
            {score}/100
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
    }),

    columnHelper.accessor('enrichment_status', {
      header: 'Enrichment',
      cell: ({ getValue }) => getEnrichmentStatusBadge(getValue()),
    }),

    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => (
        <Select
          value={row.original.status || 'new'}
          onValueChange={(value) => handleStatusChange(row.original.id, value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="disqualified">Disqualified</SelectItem>
          </SelectContent>
        </Select>
      ),
    }),

    columnHelper.accessor('tags', {
      header: 'Tags',
      cell: ({ getValue }) => {
        const tags = getValue()
        return tags && tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
    }),

    columnHelper.accessor('created_at', {
      header: 'Created',
      cell: ({ getValue }) => {
        const date = getValue()
        return date ? (
          <span className="text-sm text-gray-500">{formatDate(date)}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openDetailModal(row.original.id, 'business')}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      ),
      size: 100,
    }),
  ], [selectedBusinessLeads, toggleBusinessLead, setSelectedBusinessLeads, openDetailModal, updateLead])

  const table = useReactTable({
    data: leadsData?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: leadsData?.totalPages || 0,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' 
        ? updater({ pageIndex: pagination.page - 1, pageSize: pagination.limit })
        : updater
      
      setPagination(prev => ({
        ...prev,
        page: newPagination.pageIndex + 1,
        limit: newPagination.pageSize,
      }))
    },
  })

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading leads</div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())
                    }
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <tr key={index}>
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="text-gray-500">
                    <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium">No business leads found</h3>
                    <p className="mt-1">Get started by importing your first leads.</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    selectedBusinessLeads.has(row.original.id) && 'bg-blue-50'
                  )}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, leadsData?.count || 0)} of{' '}
            {leadsData?.count || 0} results
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, leadsData?.totalPages || 0) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={page === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}