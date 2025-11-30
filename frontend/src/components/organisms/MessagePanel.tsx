import React from 'react'
import type { ChatMessage } from '@/types'

interface MessagePanelProps {
  messages: ChatMessage[]
  isOpen: boolean
  onClose: () => void
}

export const MessagePanel: React.FC<MessagePanelProps> = ({
  messages,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 border-l border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-white font-semibold">Historial de Chat</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 mt-8">
            <p>No hay mensajes en esta conversación</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-slate-700 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs opacity-70 font-semibold">
                    {msg.role === 'user' ? '👤 Tú' : '🤖 Kati'}
                  </span>
                  <span className="text-xs opacity-50">
                    {new Date(msg.timestamp).toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}