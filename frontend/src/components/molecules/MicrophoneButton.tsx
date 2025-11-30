import React from 'react'
import { MicrophoneIcon } from '@/components/atoms/MicrophoneIcon'

interface MicrophoneButtonProps {
  isRecording: boolean
  disabled: boolean
  onClick: () => void
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  isRecording,
  disabled,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 ${
        isRecording
          ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 animate-pulse'
          : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <MicrophoneIcon isRecording={isRecording} />
    </button>
  )
}