export interface User {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  auth_id: string
  email: string
  full_name?: string
  client_id?: string
  role: 'admin' | 'manager' | 'viewer'
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  userRole: 'admin' | 'manager' | 'viewer' | null
  clientId: string | null
  permissions: UserPermissions
}

export interface UserPermissions {
  canManageLeads: boolean
  canExportLeads: boolean
  canBulkDelete: boolean
  canEnrichLeads: boolean
  canSetPriority: boolean
  canRetryFailed: boolean
  canCreateMatches: boolean
  canApproveMatches: boolean
  canRejectMatches: boolean
  canCreateCampaigns: boolean
  canEditCampaigns: boolean
  canDeleteCampaigns: boolean
  canViewAnalytics: boolean
  canExportReports: boolean
  canViewFinancials: boolean
  canManageUsers: boolean
  canEditIntegrations: boolean
  canViewApiKeys: boolean
  canAccessSettings: boolean
}

export type AuthAction = 
  | { type: 'SET_USER'; payload: { user: User | null; profile: UserProfile | null } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SIGN_OUT' }