import React from 'react'
import type { ChatMessage } from '@/types'

interface ConversationMessageProps {
  message: ChatMessage
}

export const ConversationMessage: React.FC<ConversationMessageProps> = ({ message }) => {
  const isUser = message.role === 'user'

  return (
    <div
      className={`p-4 rounded-lg ${
        isUser ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
      }`}
    >
      <div className="flex items-start space-x-2">
        <span className="text-2xl">{isUser ? '👤' : '🤖'}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-1">
            {isUser ? 'Tú' : 'Kati'}
          </p>
          <p className="text-gray-800">{message.content}</p>
        </div>
      </div>
    </div>
  )
}