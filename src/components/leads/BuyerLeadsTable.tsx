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
  MoreHorizontal,
  Eye,
  User,
  MapPin,
  DollarSign,
  Award,
  GraduationCap
} from 'lucide-react'
import { useBuyerLeads, useUpdateBuyerLead } from '../../hooks/useBuyerLeads'
import { useLeadStore } from '../../stores/leadStore'
import { BuyerLead } from '../../types/leads'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { cn, formatDate } from '../../lib/utils'

const columnHelper = createColumnHelper<BuyerLead>()

export function BuyerLeadsTable() {
  const {
    buyerLeadFilters,
    selectedBuyerLeads,
    setSelectedBuyerLeads,
    toggleBuyerLead,
    openDetailModal,
    tablePageSize
  } = useLeadStore()

  const [pagination, setPagination] = useState({
    page: 1,
    limit: tablePageSize,
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc'
  })

  const { data: leadsData, isLoading, error } = useBuyerLeads(buyerLeadFilters, pagination)
  const updateLead = useUpdateBuyerLead()

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      await updateLead.mutateAsync({
        id: leadId,
        updates: { status: newStatus as BuyerLead['status'] }
      })
    } catch (error) {
      console.error('Failed to update lead status:', error)
    }
  }

  const getSbaStatusBadge = (prequalified?: boolean) => {
    if (prequalified === true) return <Badge variant="success">Yes</Badge>
    if (prequalified === false) return <Badge variant="destructive">No</Badge>
    return <Badge variant="secondary">Unknown</Badge>
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
            setSelectedBuyerLeads(selectedIds)
          }}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedBuyerLeads.has(row.original.id)}
          onCheckedChange={() => toggleBuyerLead(row.original.id)}
        />
      ),
      size: 50,
    }),
    
    columnHelper.display({
      id: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const { first_name, last_name, email } = row.original
        const fullName = [first_name, last_name].filter(Boolean).join(' ')
        
        return (
          <div className="space-y-1">
            <button
              onClick={() => openDetailModal(row.original.id, 'buyer')}
              className="font-medium text-blue-600 hover:text-blue-800 text-left flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              {fullName || 'Unnamed Contact'}
            </button>
            {email && (
              <div className="text-sm text-gray-500">{email}</div>
            )}
          </div>
        )
      },
    }),

    columnHelper.accessor('phone', {
      header: 'Phone',
      cell: ({ getValue }) => {
        const phone = getValue()
        return phone ? (
          <span className="text-sm">{phone}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
    }),

    columnHelper.accessor('geography_preference', {
      header: 'Geography',
      cell: ({ getValue }) => {
        const geography = getValue()
        return geography ? (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{geography}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
    }),

    columnHelper.accessor('industries_of_interest', {
      header: 'Industries',
      cell: ({ getValue }) => {
        const industries = getValue()
        return industries && industries.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {industries.slice(0, 2).map((industry, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {industry}
              </Badge>
            ))}
            {industries.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{industries.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
    }),

    columnHelper.accessor('budget_range', {
      header: 'Budget',
      cell: ({ getValue }) => {
        const budget = getValue()
        return budget ? (
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">{budget}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
    }),

    columnHelper.accessor('experience_level', {
      header: 'Experience',
      cell: ({ getValue }) => {
        const experience = getValue()
        return experience ? (
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-gray-400" />
            <span className="text-sm capitalize">{experience}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
    }),

    columnHelper.accessor('sba_prequalified', {
      header: 'SBA Ready',
      cell: ({ getValue }) => getSbaStatusBadge(getValue()),
    }),

    columnHelper.accessor('is_accredited', {
      header: 'Accredited',
      cell: ({ getValue }) => {
        const accredited = getValue()
        return accredited !== undefined ? (
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-gray-400" />
            <Badge variant={accredited ? "success" : "secondary"}>
              {accredited ? "Yes" : "No"}
            </Badge>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
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
            onClick={() => openDetailModal(row.original.id, 'buyer')}
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
  ], [selectedBuyerLeads, toggleBuyerLead, setSelectedBuyerLeads, openDetailModal, updateLead])

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
                    <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium">No buyer leads found</h3>
                    <p className="mt-1">Get started by importing your first buyer leads.</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    selectedBuyerLeads.has(row.original.id) && 'bg-blue-50'
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