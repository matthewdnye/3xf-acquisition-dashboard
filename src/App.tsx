import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './providers/AuthProvider'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { Login } from './pages/auth/Login'
import { LeadManagerLayout } from './components/leads/LeadManagerLayout'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ComingSoon({ module }: { module: string }) {
  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{module}</h1>
        <p className="text-gray-600">This module is coming soon!</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/auth/login" element={<Login />} />
            
            {/* Protected app routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/leads" replace />} />
                <Route path="/leads/*" element={<LeadManagerLayout />} />
                <Route path="/enrichment/*" element={<ComingSoon module="Enrichment Queue" />} />
                <Route path="/matching/*" element={<ComingSoon module="Matchmaking Dashboard" />} />
                <Route path="/campaigns/*" element={<ComingSoon module="Campaign Manager" />} />
                <Route path="/analytics/*" element={<ComingSoon module="Performance Analytics" />} />
                <Route path="/settings/*" element={<ComingSoon module="Settings & Configuration" />} />
              </Route>
            </Route>

            {/* Redirect any unknown routes to login */}
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App