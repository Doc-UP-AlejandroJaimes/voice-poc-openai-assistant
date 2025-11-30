import React, { useState } from 'react'
import { LoginForm } from '@/components/molecules/LoginForm'
import { RegisterForm } from '@/components/molecules/RegisterForm'
import { useAuth } from '@/contexts/AuthContext'

export const AuthModal: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const { login, register } = useAuth()

  const handleLogin = async (username: string, password: string) => {
    await login({ username, password })
  }

  const handleRegister = async (
    username: string,
    password: string,
    email?: string,
    fullName?: string
  ) => {
    await register({ username, password, email, full_name: fullName })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </div>
          <h1 className="text-4xl font-light text-white mb-2">Kati</h1>
          <p className="text-slate-400 text-sm">Asistente Virtual Colombiana</p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white text-center">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <p className="text-slate-400 text-sm text-center mt-2">
              {isLogin
                ? 'Ingresa tus credenciales para continuar'
                : 'Completa el formulario para registrarte'}
            </p>
          </div>

          {isLogin ? (
            <LoginForm
              onSubmit={handleLogin}
              onSwitchToRegister={() => setIsLogin(false)}
            />
          ) : (
            <RegisterForm
              onSubmit={handleRegister}
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-xs">
            Powered by OpenAI · FastAPI · React
          </p>
        </div>
      </div>
    </div>
  )
}