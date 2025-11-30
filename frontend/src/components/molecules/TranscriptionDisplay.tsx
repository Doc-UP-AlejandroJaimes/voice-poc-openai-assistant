import React from 'react'

interface TranscriptionDisplayProps {
  text: string
}

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ text }) => {
  if (!text) return null

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <p className="text-sm text-gray-600 mb-1">Dijiste:</p>
      <p className="text-gray-800">{text}</p>
    </div>
  )
}