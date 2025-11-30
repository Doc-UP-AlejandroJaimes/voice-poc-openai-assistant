export interface TranscriptionResponse {
  text: string
  duration?: number
}

export interface ChatRequest {
  message: string
  conversation_history: Array<{
    role: string
    content: string
  }>
}

export interface ChatResponse {
  response: string
  conversation_history: Array<{
    role: string
    content: string
    timestamp: string
  }>
}

export interface TTSRequest {
  text: string
  voice?: string
}

export interface HealthResponse {
  status: string
  version: string
  timestamp: string
}