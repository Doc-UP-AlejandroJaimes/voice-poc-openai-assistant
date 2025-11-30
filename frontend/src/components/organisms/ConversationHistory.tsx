import React from 'react'
import { ConversationMessage } from '@/components/molecules/ConversationMessage'
import { Button } from '@/components/atoms/Button'
import type { ChatMessage } from '@/types'

interface ConversationHistoryProps {
  messages: ChatMessage[]
  onClear: () => void
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  messages,
  onClear,
}) => {
  if (messages.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Conversación</h2>
        <Button onClick={onClear} variant="danger" className="px-4 py-2 text-sm">
          Limpiar Historial
        </Button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {messages.map((message, index) => (
          <ConversationMessage key={index} message={message} />
        ))}
      </div>
    </div>
  )
}