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

  // Fetch user profile with better error handling
  const fetchUserProfile = async (user: SupabaseUser): Promise<UserProfile | null> => {
    try {
      console.log('Fetching user profile for:', user.email)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        
        // If user doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('User profile not found, creating new profile...')
          
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              auth_id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
              role: 'viewer',
              is_active: true,
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating user profile:', createError)
            return null
          }

          console.log('Created new user profile:', newProfile)
          return newProfile as UserProfile
        }
        
        return null
      }

      console.log('Fetched user profile:', data)

      // Update last login
      try {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('auth_id', user.id)
      } catch (updateError) {
        console.warn('Failed to update last login:', updateError)
      }

      return data as UserProfile
    } catch (error) {
      console.error('Unexpected error in fetchUserProfile:', error)
      return null
    }
  }

  // Initialize auth state with timeout
  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    // Set a timeout to ensure loading doesn't hang forever
    const timeoutDuration = 10000 // 10 seconds
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization timed out, setting loading to false')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }, timeoutDuration)

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            dispatch({ type: 'SET_LOADING', payload: false })
          }
          return
        }

        console.log('Session check complete. User:', session?.user?.email || 'none')

        if (session?.user && mounted) {
          const profile = await fetchUserProfile(session.user)
          if (mounted) {
            dispatch({
              type: 'SET_USER',
              payload: {
                user: session.user as User,
                profile,
              },
            })
          }
        } else if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('Auth state change:', event, session?.user?.email || 'none')

      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const profile = await fetchUserProfile(session.user)
          if (mounted) {
            dispatch({
              type: 'SET_USER',
              payload: {
                user: session.user as User,
                profile,
              },
            })
          }
        } catch (error) {
          console.error('Error handling sign in:', error)
          if (mounted) {
            dispatch({ type: 'SET_LOADING', payload: false })
          }
        }
      } else if (event === 'SIGNED_OUT' || !session) {
        if (mounted) {
          dispatch({ type: 'SIGN_OUT' })
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('Token refreshed for user:', session.user.email)
        // Don't refetch profile on token refresh, just update the user
        if (mounted) {
          dispatch({
            type: 'SET_USER',
            payload: {
              user: session.user as User,
              profile: state.profile,
            },
          })
        }
      }
    })

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      subscription.unsubscribe()
    }
  }, [])

  // Auth methods
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email)
      
      // Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.log('Sign in failed:', signInError.message)
        
        // If user doesn't exist, try to create account
        if (signInError.message.includes('Invalid login credentials')) {
          console.log('Attempting to create account...')
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                full_name: email.split('@')[0],
              }
            },
          })

          if (signUpError) {
            console.error('Sign up error:', signUpError)
            throw signUpError
          }

          if (signUpData.user && !signUpData.user.email_confirmed_at) {
            throw new Error('Please check your email for a confirmation link!')
          }

          console.log('Account created successfully')
          return
        }
        
        throw signInError
      }

      console.log('Sign in successful:', signInData.user?.email)
    } catch (error: any) {
      console.error('Authentication error:', error)
      throw error
    }
  }

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
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
        redirectTo: `${window.location.origin}/`,
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