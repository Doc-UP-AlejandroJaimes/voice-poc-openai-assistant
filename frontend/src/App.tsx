import React from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/organisms/AuthModal'
import { VoiceAssistant } from '@/components/templates/VoiceAssistant'

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Cargando...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <VoiceAssistant /> : <AuthModal />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App