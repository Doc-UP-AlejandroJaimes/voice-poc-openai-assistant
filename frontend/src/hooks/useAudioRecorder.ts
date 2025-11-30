import { useState, useRef, useCallback } from 'react'
import type { AudioRecorderHook } from '@/types'

export const useAudioRecorder = (): AudioRecorderHook => {
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startRecording = useCallback(async (): Promise<void> => {
    console.log('🎤 [Hook] startRecording llamado')
    
    try {
      console.log('🎤 [Hook] Limpiando estados...')
      setError(null)
      setAudioBlob(null)

      console.log('🎤 [Hook] Solicitando permiso de micrófono...')
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      console.log('✅ [Hook] Permiso concedido, stream obtenido:', stream)
      console.log('✅ [Hook] Tracks de audio:', stream.getAudioTracks())

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4'
      
      console.log('🎤 [Hook] MIME type seleccionado:', mimeType)

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      console.log('✅ [Hook] MediaRecorder creado:', mediaRecorder)

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        console.log('📦 [Hook] Datos disponibles:', event.data.size, 'bytes')
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        console.log('⏹️ [Hook] Grabación detenida')
        console.log('📦 [Hook] Chunks totales:', audioChunksRef.current.length)
        
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        console.log('🎵 [Hook] Audio blob creado:', audioBlob.size, 'bytes')
        
        setAudioBlob(audioBlob)
        stream.getTracks().forEach((track) => {
          console.log('🛑 [Hook] Deteniendo track:', track)
          track.stop()
        })
      }

      mediaRecorder.onerror = (event: any) => {
        console.error('❌ [Hook] Error en MediaRecorder:', event)
      }

      console.log('▶️ [Hook] Iniciando grabación...')
      mediaRecorder.start()
      console.log('🔴 [Hook] State después de start():', mediaRecorder.state)
      
      setIsRecording(true)
      console.log('✅ [Hook] isRecording = true')

      silenceTimerRef.current = setTimeout(() => {
        console.log('⏱️ [Hook] Timeout alcanzado (5s)')
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('⏸️ [Hook] Deteniendo por timeout...')
          stopRecording()
        }
      }, 3000)

      console.log('✅ [Hook] Grabación iniciada correctamente')

    } catch (err: any) {
      console.error('❌ [Hook] Error al iniciar grabación:', err)
      console.error('❌ [Hook] Error name:', err.name)
      console.error('❌ [Hook] Error message:', err.message)
      setError(`Error: ${err.message}`)
    }
  }, [])

  const stopRecording = useCallback((): void => {
    console.log('⏹️ [Hook] stopRecording llamado')
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      console.log('⏹️ [Hook] Timer limpiado')
    }

    if (mediaRecorderRef.current) {
      console.log('⏹️ [Hook] MediaRecorder state:', mediaRecorderRef.current.state)
      
      if (mediaRecorderRef.current.state === 'recording') {
        console.log('⏹️ [Hook] Deteniendo MediaRecorder...')
        mediaRecorderRef.current.stop()
      }
    }

    setIsRecording(false)
    console.log('✅ [Hook] isRecording = false')
  }, [])

  const clearAudio = useCallback((): void => {
    console.log('🗑️ [Hook] Limpiando audio')
    setAudioBlob(null)
    audioChunksRef.current = []
  }, [])

  const getAudioFile = useCallback((): File | null => {
    console.log('📁 [Hook] getAudioFile llamado')
    if (!audioBlob) {
      console.log('⚠️ [Hook] No hay audioBlob')
      return null
    }
    
    const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })
    console.log('✅ [Hook] File creado:', file.size, 'bytes')
    return file
  }, [audioBlob])

  return {
    isRecording,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    clearAudio,
    getAudioFile,
  }
}