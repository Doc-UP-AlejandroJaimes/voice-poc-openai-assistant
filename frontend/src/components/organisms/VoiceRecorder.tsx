import React from 'react'
import { MicrophoneButton } from '@/components/molecules/MicrophoneButton'
import { Button } from '@/components/atoms/Button'

interface VoiceRecorderProps {
  isRecording: boolean
  hasAudio: boolean
  isProcessing: boolean
  isPlaying: boolean
  onStartStop: () => void
  onSend: () => void
  onClear: () => void
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  hasAudio,
  isProcessing,
  isPlaying,
  onStartStop,
  onSend,
  onClear,
}) => {
  const disabled = isProcessing || isPlaying

  return (
    <div>
      {/* Microphone Button */}
      <div className="flex justify-center mb-8">
        <MicrophoneButton
          isRecording={isRecording}
          disabled={disabled}
          onClick={onStartStop}
        />
      </div>

      {/* Action Buttons */}
      {hasAudio && !isRecording && (
        <div className="flex justify-center space-x-4">
          <Button onClick={onSend} disabled={disabled} variant="primary">
            Enviar y Obtener Respuesta
          </Button>
          <Button onClick={onClear} disabled={disabled} variant="secondary">
            Limpiar
          </Button>
        </div>
      )}
    </div>
  )
}