import React from 'react'

interface VoiceWaveProps {
  isActive: boolean
  bars?: number
}

export const VoiceWave: React.FC<VoiceWaveProps> = ({ isActive, bars = 40 }) => {
  return (
    <div className="flex items-center justify-center space-x-1 h-32">
      {[...Array(bars)].map((_, i) => {
        const height = isActive 
          ? Math.random() * 80 + 20 
          : 20
        
        const delay = i * 0.05
        
        return (
          <div
            key={i}
            className={`w-1 bg-gradient-to-t from-green-500 to-green-300 rounded-full transition-all ${
              isActive ? 'animate-pulse' : ''
            }`}
            style={{
              height: `${height}px`,
              animationDelay: `${delay}s`,
              opacity: isActive ? 1 : 0.3,
            }}
          />
        )
      })}
    </div>
  )
}