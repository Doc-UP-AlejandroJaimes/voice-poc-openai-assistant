import React from 'react'

interface StatusIndicatorProps {
  status: 'ready' | 'recording' | 'processing' | 'playing'
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const statusConfig = {
    ready: { color: 'bg-gray-500', text: 'Listo', animate: false },
    recording: { color: 'bg-red-500', text: 'Grabando...', animate: true },
    processing: { color: 'bg-blue-500', text: 'Procesando...', animate: true },
    playing: { color: 'bg-green-500', text: 'Reproduciendo...', animate: true },
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-3 h-3 ${config.color} rounded-full ${
          config.animate ? 'animate-pulse' : ''
        }`}
      />
      <span className={`text-${config.color.replace('bg-', '')} font-medium`}>
        {config.text}
      </span>
    </div>
  )
}