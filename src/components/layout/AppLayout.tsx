import React, { useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { 
  Menu, 
  X, 
  Users, 
  Zap, 
  Heart, 
  Megaphone, 
  BarChart3, 
  Settings, 
  Sparkles 
} from 'lucide-react'
import { useAuth } from '../../providers/AuthProvider'
import { UserMenu } from './UserMenu'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { cn } from '../../lib/utils'

const navigation = [
  {
    name: 'Lead Manager',
    href: '/leads',
    icon: Users,
    description: 'Manage business and buyer leads',
    requiredRole: 'viewer' as const,
  },
  {
    name: 'Enrichment Queue',
    href: '/enrichment',
    icon: Zap,
    description: 'Data enrichment and processing',
    requiredRole: 'manager' as const,
  },
  {
    name: 'Matchmaking',
    href: '/matching',
    icon: Heart,
    description: 'Match buyers with businesses',
    requiredRole: 'manager' as const,
  },
  {
    name: 'Campaign Manager',
    href: '/campaigns',
    icon: Megaphone,
    description: 'Create and manage campaigns',
    requiredRole: 'manager' as const,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Performance insights and reports',
    requiredRole: 'viewer' as const,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'System configuration',
    requiredRole: 'admin' as const,
  },
]

export function AppLayout() {
  const { profile, permissions } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const roleHierarchy = { viewer: 1, manager: 2, admin: 3 }
  const userRoleLevel = roleHierarchy[profile?.role || 'viewer']

  const filteredNavigation = navigation.filter(item => {
    const requiredRoleLevel = roleHierarchy[item.requiredRole]
    return userRoleLevel >= requiredRoleLevel
  })

  const isCurrentPath = (href: string) => {
    return location.pathname.startsWith(href)
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo and header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">3X Freedom</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {profile?.full_name || 'User'}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {profile?.role}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = isCurrentPath(item.href)
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-blue-600" : "text-gray-400"
                  )} />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              © 2025 3X Freedom Dashboard
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Breadcrumbs */}
              <div className="hidden md:flex items-center text-sm text-gray-600">
                <span>Dashboard</span>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">
                  {navigation.find(item => isCurrentPath(item.href))?.name || 'Page'}
                </span>
              </div>
            </div>

            <UserMenu />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}