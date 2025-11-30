import axios from 'axios'
import type {
  TranscriptionResponse,
  // ChatRequest,
  ChatResponse,
  // TTSRequest,
  HealthResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data)
    return response.data
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials)
    return response.data
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/api/auth/me')
    return response.data
  },

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  },
}

export const voiceAPI = {
  async transcribeAudio(audioFile: File): Promise<string> {
    const formData = new FormData()
    formData.append('audio', audioFile)

    const response = await apiClient.post<TranscriptionResponse>(
      '/api/voice/transcribe',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response.data.text
  },

  async getChatCompletion(
    message: string,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/api/voice/chat', {
      message,
      conversation_history: conversationHistory,
    })

    return response.data
  },

  async textToSpeech(text: string, voice: string | null = null): Promise<Blob> {
    const response = await apiClient.post<Blob>(
      '/api/voice/tts',
      { text, voice },
      {
        responseType: 'blob',
      }
    )

    return response.data
  },

  async quickVoiceInteraction(audioFile: File): Promise<{
    audio: Blob
    transcription: string
    response: string
  }> {
    const formData = new FormData()
    formData.append('audio', audioFile)

    const response = await apiClient.post('/api/voice/quick-interaction', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    })

    const transcriptionB64 = response.headers['x-transcription'] || ''
    const responseTextB64 = response.headers['x-response-text'] || ''

    const transcription = transcriptionB64 ? atob(transcriptionB64) : ''
    const responseText = responseTextB64 ? atob(responseTextB64) : ''

    return {
      audio: response.data,
      transcription: transcription,
      response: responseText,
    }
  },

  async createConversation(userId: number, title: string): Promise<any> {
    const response = await apiClient.post('/api/voice/create-conversation', null, {
      params: { user_id: userId, title }
    })
    return response.data
  },

  async getConversations(userId: number): Promise<any[]> {
    const response = await apiClient.get(`/api/voice/conversations/${userId}`)
    return response.data
  },

  async getMessages(conversationId: number): Promise<any[]> {
    const response = await apiClient.get(`/api/voice/messages/${conversationId}`)
    return response.data
  },

  async saveMessage(
    conversationId: number,
    role: string,
    content: string,
    audioDuration: number | null = null
  ): Promise<any> {
    const response = await apiClient.post('/api/voice/save-message', null, {
      params: {
        conversation_id: conversationId,
        role,
        content,
        audio_duration: audioDuration
      }
    })
    return response.data
  },

  async healthCheck(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>('/health')
    return response.data
  },
}