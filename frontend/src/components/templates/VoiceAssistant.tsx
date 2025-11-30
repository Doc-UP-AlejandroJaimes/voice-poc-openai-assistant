import React, { useState, useEffect } from 'react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { voiceAPI } from '@/services/api'
import { playAudioBlob } from '@/utils/audioPlayer'
import { ConversationSidebar } from '@/components/organisms/ConversationSidebar'
import { VoiceWave } from '@/components/atoms/VoiceWave'
import { MessagePanel } from '@/components/organisms/MessagePanel'
import type { Conversation, ChatMessage } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export const VoiceAssistant: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([])
  const [isInCall, setIsInCall] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showMessagePanel, setShowMessagePanel] = useState(false)
  const { user } = useAuth()

  const {
    isRecording,
    audioBlob,
    error: recordingError,
    startRecording,
    stopRecording,
    clearAudio,
    getAudioFile,
  } = useAudioRecorder()

  // Cargar conversaciones al iniciar
  useEffect(() => {
    loadConversations()
  }, [])

  // Timer de llamada
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      setCallDuration(0)
    }
    return () => clearInterval(interval)
  }, [isInCall])

  // Auto-procesar audio
  useEffect(() => {
    if (audioBlob && !isRecording && isInCall) {
      console.log('Audio disponible, procesando...')
      handleProcessAudio()
    }
  }, [audioBlob, isRecording])

  const loadConversations = async () => {
    try {
      console.log('📥 Cargando conversaciones...')
      const convs = await voiceAPI.getConversations(user!.user_id) 
      console.log('✅ Conversaciones cargadas:', convs.length)
      
      // Convertir a formato del frontend
      const formatted: Conversation[] = convs.map(c => ({
        conversation_id: c.conversation_id,
        user_id: c.user_id,
        title: c.title,
        created_at: c.created_at,
        updated_at: c.updated_at,
      }))
      
      setConversations(formatted)
      
      // Si hay conversaciones, cargar la más reciente
      if (formatted.length > 0) {
        const latestId = formatted[0].conversation_id
        await loadConversation(latestId)
      }
    } catch (err) {
      console.error('❌ Error cargando conversaciones:', err)
    }
  }

  const loadConversation = async (conversationId: number) => {
    try {
      console.log('📥 Cargando conversación:', conversationId)
      const messages = await voiceAPI.getMessages(conversationId)
      console.log('✅ Mensajes cargados:', messages.length)
      
      const formatted: ChatMessage[] = messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.created_at,
      }))
      
      setActiveConversationId(conversationId)
      setConversationHistory(formatted)
    } catch (err) {
      console.error('❌ Error cargando conversación:', err)
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleProcessAudio = async (): Promise<void> => {
    if (!audioBlob) return

    setIsProcessing(true)
    setError(null)

    try {
        const audioFile = getAudioFile()
        if (!audioFile) {
        console.error('No se pudo obtener archivo de audio')
        return
        }

        console.log('⚡ Usando quick interaction...')
        
        // Usar el método rápido (todo en paralelo)
        const result = await voiceAPI.quickVoiceInteraction(audioFile)
        
        console.log('✅ Transcripción:', result.transcription)
        console.log('✅ Respuesta:', result.response)

        const userMessage: ChatMessage = {
        role: 'user',
        content: result.transcription,
        timestamp: new Date().toISOString(),
        }

        const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
        }

        const newHistory = [...conversationHistory, userMessage, assistantMessage]
        setConversationHistory(newHistory)

        setIsPlaying(true)
        setIsProcessing(false)
        console.log('▶️ Reproduciendo audio...')
        await playAudioBlob(result.audio)
        setIsPlaying(false)
        console.log('✅ Audio reproducido')

        clearAudio()

        // Recargar conversaciones después de guardar
        await loadConversations()

        if (isInCall) {
        console.log('🎤 Iniciando nueva grabación...')
        setTimeout(() => {
            startRecording()
        }, 500)
        }
    } catch (err: any) {
        console.error('❌ Error en procesamiento:', err)
        setError(`Error: ${err.message || 'Desconocido'}`)
        setIsProcessing(false)
        setIsPlaying(false)
    }
  }
  const handleToggleCall = async (): Promise<void> => {
    if (isInCall) {
      console.log('📞 Terminando llamada...')
      if (isRecording) {
        stopRecording()
      }
      setIsInCall(false)
      // NO limpiar el historial - mantenerlo visible
    } else {
      console.log('📞 Iniciando llamada...')
      setIsInCall(true)
      setError(null)
      
      setTimeout(async () => {
        await startRecording()
      }, 100)
    }
  }

  const handleNewConversation = async () => {
    setActiveConversationId(null)
    setConversationHistory([])
    setError(null)
    console.log('➕ Nueva conversación iniciada')
  }

  const handleSelectConversation = async (id: number) => {
    await loadConversation(id)
  }

  const getStatusText = (): string => {
    if (isPlaying) return 'Kati está hablando'
    if (isProcessing) return 'Procesando'
    if (isRecording) return 'Escuchando'
    return 'En llamada'
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />

      {/* Main Call Interface */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center w-full max-w-2xl px-8">
          
          {/* Voice Wave Visualization */}
          <div className="mb-12">
            <VoiceWave isActive={isRecording || isPlaying} bars={50} />
          </div>

          {/* Name */}
          <div className="mb-8">
            <h2 className="text-5xl font-light text-white mb-3">Kati</h2>
            <p className="text-slate-400 text-sm tracking-widest uppercase">
              Asistente Virtual Colombiana
            </p>
          </div>

          {/* Call Info */}
          {isInCall ? (
            <div className="mb-12 space-y-4">
              <div className="text-7xl font-extralight text-white tabular-nums tracking-wider">
                {formatDuration(callDuration)}
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  isRecording ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 
                  isProcessing ? 'bg-yellow-500 animate-pulse shadow-lg shadow-yellow-500/50' :
                  isPlaying ? 'bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50' : 
                  'bg-slate-500'
                }`} />
                <p className="text-slate-300 text-base font-light">
                  {getStatusText()}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-12 space-y-2">
              <p className="text-slate-300 text-xl font-light">
                Presiona para iniciar llamada
              </p>
              <p className="text-slate-500 text-sm">
                Habla naturalmente con Kati
              </p>
            </div>
          )}

          {/* Call Button */}
          <button
            onClick={handleToggleCall}
            disabled={isProcessing}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-slate-900 ${
              isInCall
                ? 'bg-red-500 hover:bg-red-600 shadow-2xl shadow-red-500/50 focus:ring-red-400'
                : 'bg-green-500 hover:bg-green-600 shadow-2xl shadow-green-500/50 focus:ring-green-400'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isInCall ? (
              <svg className="w-12 h-12 text-white transform rotate-135" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            )}
          </button>

          {/* Error */}
          {(error || recordingError) && (
            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur">
              <p className="text-red-300 text-sm">{error || recordingError}</p>
            </div>
          )}

          {/* Message Counter */}
          {conversationHistory.length > 0 && (
            <div className="mt-8">
              <p className="text-slate-400 text-sm font-light">
                {conversationHistory.length} {conversationHistory.length === 1 ? 'mensaje' : 'mensajes'} en esta conversación
              </p>
            </div>
          )}

          {/* Botón para ver historial */}
        {conversationHistory.length > 0 && (
        <button
            onClick={() => setShowMessagePanel(true)}
            className="mt-6 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
        >
            Ver historial ({conversationHistory.length} mensajes)
        </button>
        )}
        {/* Message Panel */}
            <MessagePanel
            messages={conversationHistory}
            isOpen={showMessagePanel}
            onClose={() => setShowMessagePanel(false)}
            />
        </div>
      </div>
    </div>
  )
}