"""
Pydantic models for request and response validation
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# Modelos de autenticación
class UserCreate(BaseModel):
    """Modelo para crear usuario"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    email: Optional[str] = None
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    """Modelo para login"""
    username: str
    password: str


class UserResponse(BaseModel):
    """Modelo de respuesta de usuario"""
    user_id: int
    username: str
    email: Optional[str]
    full_name: Optional[str]
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    """Modelo de token JWT"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ConversationDB(BaseModel):
    """Conversación en base de datos"""
    conversation_id: Optional[int] = None
    user_id: str
    title: str
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class MessageDB(BaseModel):
    """Mensaje en base de datos"""
    message_id: Optional[int] = None
    conversation_id: int
    role: str
    content: str
    audio_duration: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.now)


class TranscriptionResponse(BaseModel):
    """Response model for speech-to-text transcription"""
    text: str = Field(..., description="Transcribed text from audio")
    duration: Optional[float] = Field(None, description="Audio duration in seconds")


class ChatMessage(BaseModel):
    """Model for a single chat message"""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(default_factory=datetime.now)


class ChatRequest(BaseModel):
    """Request model for chat completion"""
    message: str = Field(..., description="User message")
    conversation_history: List[ChatMessage] = Field(
        default_factory=list,
        description="Previous conversation messages"
    )


class ChatResponse(BaseModel):
    """Response model for chat completion"""
    response: str = Field(..., description="Assistant's response")
    conversation_history: List[ChatMessage] = Field(..., description="Updated conversation history")


class TTSRequest(BaseModel):
    """Request model for text-to-speech"""
    text: str = Field(..., description="Text to convert to speech")
    voice: Optional[str] = Field(None, description="Voice option (alloy, echo, fable, onyx, nova, shimmer)")


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    timestamp: datetime = Field(default_factory=datetime.now)