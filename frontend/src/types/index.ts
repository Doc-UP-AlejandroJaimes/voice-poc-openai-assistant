export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface VoiceRecorderState {
  isRecording: boolean
  isProcessing: boolean
  isPlaying: boolean
  error: string | null
}

export interface AudioRecorderHook {
  isRecording: boolean
  audioBlob: Blob | null
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearAudio: () => void
  getAudioFile: () => File | null
}

export interface Conversation {
  conversation_id: number
  user_id: number
  title: string
  created_at: string
  updated_at: string
  message_count?: number
  last_message?: string
}

// Nuevos tipos de autenticación
export interface User {
  user_id: number
  username: string
  email: string | null
  full_name: string | null
  is_active: boolean
  created_at: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
  email?: string
  full_name?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}