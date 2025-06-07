import React from 'react'
import { useAuth } from '../../providers/AuthProvider'

interface RoleGuardProps {
  allowedRoles: ('admin' | 'manager' | 'viewer')[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { profile } = useAuth()

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface PermissionGuardProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { permissions } = useAuth()

  // Type assertion to access dynamic permission
  if (!(permissions as any)[permission]) {
    return <>{fallback}</>
  }

  return <>{children}</>
}