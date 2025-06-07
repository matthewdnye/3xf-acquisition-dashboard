import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { LeadManagerLayout } from './components/leads/LeadManagerLayout'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Navigate to="/leads\" replace />} />
            <Route path="/leads/*" element={<LeadManagerLayout />} />
            <Route path="/enrichment/*" element={<ComingSoon module="Enrichment Queue" />} />
            <Route path="/matching/*" element={<ComingSoon module="Matchmaking Dashboard" />} />
            <Route path="/campaigns/*" element={<ComingSoon module="Campaign Manager" />} />
            <Route path="/analytics/*" element={<ComingSoon module="Performance Analytics" />} />
            <Route path="/settings/*" element={<ComingSoon module="Settings & Configuration" />} />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </Router>
    </QueryClientProvider>
  )
}

function ComingSoon({ module }: { module: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{module}</h1>
        <p className="text-gray-600">This module is coming soon!</p>
      </div>
    </div>
  )
}

export default App