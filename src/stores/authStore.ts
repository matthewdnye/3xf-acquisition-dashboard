import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, UserProfile, UserPermissions } from '../types/auth'

interface AuthStore {
  user: User | null
  profile: UserProfile | null
  clientId: string | null
  userRole: 'admin' | 'manager' | 'viewer' | null
  permissions: UserPermissions
  isAuthenticated: boolean
  
  // Actions
  setAuth: (user: User | null, profile: UserProfile | null) => void
  clearAuth: () => void
  updateProfile: (profile: UserProfile) => void
}

// Calculate permissions based on role
function calculatePermissions(role: 'admin' | 'manager' | 'viewer' | null): UserPermissions {
  const basePermissions: UserPermissions = {
    canManageLeads: false,
    canExportLeads: false,
    canBulkDelete: false,
    canEnrichLeads: false,
    canSetPriority: false,
    canRetryFailed: false,
    canCreateMatches: false,
    canApproveMatches: false,
    canRejectMatches: false,
    canCreateCampaigns: false,
    canEditCampaigns: false,
    canDeleteCampaigns: false,
    canViewAnalytics: false,
    canExportReports: false,
    canViewFinancials: false,
    canManageUsers: false,
    canEditIntegrations: false,
    canViewApiKeys: false,
    canAccessSettings: false,
  }

  switch (role) {
    case 'admin':
      return {
        ...basePermissions,
        canManageLeads: true,
        canExportLeads: true,
        canBulkDelete: true,
        canEnrichLeads: true,
        canSetPriority: true,
        canRetryFailed: true,
        canCreateMatches: true,
        canApproveMatches: true,
        canRejectMatches: true,
        canCreateCampaigns: true,
        canEditCampaigns: true,
        canDeleteCampaigns: true,
        canViewAnalytics: true,
        canExportReports: true,
        canViewFinancials: true,
        canManageUsers: true,
        canEditIntegrations: true,
        canViewApiKeys: true,
        canAccessSettings: true,
      }
    case 'manager':
      return {
        ...basePermissions,
        canManageLeads: true,
        canExportLeads: true,
        canBulkDelete: true,
        canEnrichLeads: true,
        canSetPriority: true,
        canRetryFailed: true,
        canCreateMatches: true,
        canApproveMatches: true,
        canRejectMatches: true,
        canCreateCampaigns: true,
        canEditCampaigns: true,
        canDeleteCampaigns: false,
        canViewAnalytics: true,
        canExportReports: true,
        canViewFinancials: false,
        canManageUsers: false,
        canEditIntegrations: false,
        canViewApiKeys: false,
        canAccessSettings: false,
      }
    case 'viewer':
      return {
        ...basePermissions,
        canManageLeads: true,
        canExportLeads: false,
        canBulkDelete: false,
        canEnrichLeads: false,
        canSetPriority: false,
        canRetryFailed: false,
        canCreateMatches: false,
        canApproveMatches: false,
        canRejectMatches: false,
        canCreateCampaigns: false,
        canEditCampaigns: false,
        canDeleteCampaigns: false,
        canViewAnalytics: true,
        canExportReports: false,
        canViewFinancials: false,
        canManageUsers: false,
        canEditIntegrations: false,
        canViewApiKeys: false,
        canAccessSettings: false,
      }
    default:
      return basePermissions
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      clientId: null,
      userRole: null,
      permissions: calculatePermissions(null),
      isAuthenticated: false,

      setAuth: (user, profile) => {
        const permissions = calculatePermissions(profile?.role || null)
        set({
          user,
          profile,
          clientId: profile?.client_id || null,
          userRole: profile?.role || null,
          permissions,
          isAuthenticated: !!user,
        })
      },

      clearAuth: () => {
        set({
          user: null,
          profile: null,
          clientId: null,
          userRole: null,
          permissions: calculatePermissions(null),
          isAuthenticated: false,
        })
      },

      updateProfile: (profile) => {
        const permissions = calculatePermissions(profile.role)
        set({
          profile,
          clientId: profile.client_id || null,
          userRole: profile.role,
          permissions,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        clientId: state.clientId,
        userRole: state.userRole,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)