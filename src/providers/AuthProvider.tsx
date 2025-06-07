import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { User, UserProfile, AuthContextType, AuthAction, UserPermissions } from '../types/auth'
import toast from 'react-hot-toast'

// Auth reducer
function authReducer(
  state: { user: User | null; profile: UserProfile | null; loading: boolean },
  action: AuthAction
) {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile,
        loading: false,
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      }
    case 'SIGN_OUT':
      return {
        user: null,
        profile: null,
        loading: false,
      }
    default:
      return state
  }
}

// Calculate user permissions based on role
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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    profile: null,
    loading: true,
  })

  // Fetch user profile
  const fetchUserProfile = async (user: SupabaseUser): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('auth_id', user.id)

      return data as UserProfile
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      return null
    }
  }

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          dispatch({ type: 'SET_LOADING', payload: false })
          return
        }

        if (session?.user && mounted) {
          const profile = await fetchUserProfile(session.user)
          dispatch({
            type: 'SET_USER',
            payload: {
              user: session.user as User,
              profile,
            },
          })
        } else if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchUserProfile(session.user)
        dispatch({
          type: 'SET_USER',
          payload: {
            user: session.user as User,
            profile,
          },
        })
      } else if (event === 'SIGNED_OUT' || !session) {
        dispatch({ type: 'SIGN_OUT' })
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Auth methods
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }
  }

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    } else {
      dispatch({ type: 'SIGN_OUT' })
      toast.success('Signed out successfully')
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!state.user) throw new Error('No user logged in')

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('auth_id', state.user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    dispatch({
      type: 'SET_USER',
      payload: {
        user: state.user,
        profile: data as UserProfile,
      },
    })
  }

  const contextValue: AuthContextType = {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    signIn,
    signInWithMagicLink,
    signInWithGoogle,
    signUp,
    signOut,
    updateProfile,
    userRole: state.profile?.role || null,
    clientId: state.profile?.client_id || null,
    permissions: calculatePermissions(state.profile?.role || null),
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}