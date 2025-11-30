"""
OpenAI API service wrapper
Handles all interactions with OpenAI API
"""
from openai import OpenAI
from app.config import settings
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)


class OpenAIService:
    """Service class for OpenAI API operations"""
    
    def __init__(self):
        """Initialize OpenAI client"""
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.whisper_model = settings.whisper_model
        self.gpt_model = settings.gpt_model
        self.tts_model = settings.tts_model
        self.tts_voice = settings.tts_voice
    
    async def transcribe_audio(self, audio_file) -> str:
        """
        Transcribe audio file to text using Whisper
        
        Args:
            audio_file: Audio file object (bytes or file-like)
            
        Returns:
            Transcribed text
        """
        try:
            logger.info("Starting audio transcription")
            
            transcription = self.client.audio.transcriptions.create(
                model=self.whisper_model,
                file=audio_file,
                response_format="text"
            )
            
            logger.info(f"Transcription successful: {transcription[:50]}...")
            return transcription
            
        except Exception as e:
            logger.error(f"Transcription error: {str(e)}")
            raise
    
    async def get_chat_completion_stream(
        self,
        message: str,
        conversation_history: List[Dict[str, str]] = None
    ):
        """
        Get streaming chat completion from GPT
        """
        try:
            logger.info("Getting streaming chat completion")
            
            messages = []
            messages.append({
                "role": "system",
                "content": """Eres Kati, una asistente virtual con acento colombiano, muy natural y conversacional.

                PERSONALIDAD Y ESTILO:
                - Hablas como una colombiana real, cálida y amigable
                - Usas expresiones colombianas naturales: "¡Uy sí!", "Claro que sí", "Con mucho gusto", "¡Listo!"
                - Tu tono es cercano, como hablar con una amiga
                - Eres profesional pero no formal en exceso
                - Respondes de forma concisa y directa (máximo 3-4 oraciones)

                EXPRESIONES COLOMBIANAS QUE USAS:
                - "¿Cómo estás?" en lugar de "¿Cómo te va?"
                - "Con gusto" o "Con mucho gusto"
                - "¡Uy!" para expresar sorpresa
                - "Bacano" o "Chévere" para cosas positivas
                - "¿Me entiendes?" o "¿Cierto?" al final de explicaciones

                EVITA:
                - Expresiones de España (vale, tío, guay)
                - Expresiones mexicanas (órale, wey, chido)
                - Expresiones argentinas (che, boludo)
                - Lenguaje demasiado formal o robótico
                - Respuestas muy largas

                EJEMPLOS:
                Usuario: "¿Cómo estás?"
                Tú: "¡Uy, muy bien! ¿Y tú qué más? ¿En qué te puedo ayudar hoy?"

                Usuario: "¿Qué tiempo hace?"
                Tú: "Claro, con gusto te ayudo. ¿De qué ciudad me preguntas? Dime la ciudad y te digo el clima."

                RECUERDA: Eres natural, conversacional y colombiana. No suenas como robot ni como española.
                """
            })
            
            if conversation_history:
                messages.extend(conversation_history)
            
            messages.append({
                "role": "user",
                "content": message
            })
            
            stream = self.client.chat.completions.create(
                model=self.gpt_model,
                messages=messages,
                temperature=0.8,
                max_tokens=150,
                stream=True
            )
            
            full_response = ""
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    full_response += chunk.choices[0].delta.content
            
            logger.info(f"Streaming chat completion successful")
            return full_response
            
        except Exception as e:
            logger.error(f"Streaming chat completion error: {str(e)}")
            raise
    
    async def text_to_speech(self, text: str, voice: str = None) -> bytes:
        """
        Convert text to speech using OpenAI TTS
        
        Args:
            text: Text to convert
            voice: Voice option (optional, uses default from settings)
            
        Returns:
            Audio bytes
        """
        try:
            logger.info("Converting text to speech")
            
            selected_voice = voice or self.tts_voice
            
            response = self.client.audio.speech.create(
                model=self.tts_model,
                voice=selected_voice,
                input=text,
                response_format="mp3"
            )
            
            audio_bytes = b""
            for chunk in response.iter_bytes():
                audio_bytes += chunk
            
            logger.info(f"TTS conversion successful, audio size: {len(audio_bytes)} bytes")
            return audio_bytes
            
        except Exception as e:
            logger.error(f"TTS error: {str(e)}")
            raise


# Global service instance
openai_service = OpenAIService()