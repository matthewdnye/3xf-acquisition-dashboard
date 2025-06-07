import React from 'react'
import { ChevronDown, User, Settings, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../../providers/AuthProvider'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

export function UserMenu() {
  const { user, profile, signOut } = useAuth()
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'manager':
        return 'warning'
      case 'viewer':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-10 px-3"
      >
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600" />
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">
            {profile?.full_name || user?.email?.split('@')[0] || 'User'}
          </div>
          <div className="text-xs text-gray-500">
            {user?.email}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user?.email}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getRoleBadgeVariant(profile?.role || '')}>
                      {profile?.role}
                    </Badge>
                    {profile?.client_id && (
                      <Badge variant="outline">
                        Client User
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <Settings className="w-4 h-4" />
                Profile Settings
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <Shield className="w-4 h-4" />
                Security
              </button>
              
              <hr className="my-2" />
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                <LogOut className="w-4 h-4" />
                Sign out
                <kbd className="ml-auto text-xs text-gray-400">⌘⇧Q</kbd>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}