"""
Voice endpoints for transcription, chat, and TTS
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.services.openai_service import OpenAIService
from app.models.schemas import TranscriptionResponse, ChatRequest, ChatResponse, TTSRequest
from app.database import get_db, Conversation, Message, User
from app.auth import get_current_active_user
from datetime import datetime
import asyncio
import base64
import io
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/voice", tags=["voice"])

openai_service = OpenAIService()


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Transcribe audio to text using Whisper
    """
    try:
        logger.info(f"User {current_user.username} - Transcribing audio file: {audio.filename}")
        
        audio_bytes = await audio.read()
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = audio.filename or "audio.wav"
        
        text = await openai_service.transcribe_audio(audio_file)
        
        return TranscriptionResponse(text=text)
        
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=ChatResponse)
async def chat_completion(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get chat completion from GPT y guardar en BD
    """
    try:
        logger.info(f"User {current_user.username} - Chat request: {request.message[:50]}...")
        
        # Convert conversation history to API format
        history = [
            {"role": msg.role, "content": msg.content}
            for msg in request.conversation_history
        ]
        
        # Get completion usando el método correcto
        response = await openai_service.get_chat_completion_stream(
            message=request.message,
            conversation_history=history
        )
        
        # Update conversation history
        updated_history = request.conversation_history.copy()
        updated_history.append({"role": "user", "content": request.message})
        updated_history.append({"role": "assistant", "content": response})
        
        # GUARDAR EN BD
        try:
            conversation = db.query(Conversation).filter(
                Conversation.user_id == current_user.user_id
            ).order_by(Conversation.updated_at.desc()).first()
            
            if not conversation:
                conversation = Conversation(
                    user_id=current_user.user_id,
                    title=f"Conversación {datetime.now().strftime('%d/%m %H:%M')}",
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                db.add(conversation)
                db.commit()
                db.refresh(conversation)
                logger.info(f"Nueva conversación creada: {conversation.conversation_id}")
            
            # Guardar mensaje del usuario
            user_message = Message(
                conversation_id=conversation.conversation_id,
                role="user",
                content=request.message,
                created_at=datetime.now()
            )
            db.add(user_message)
            
            # Guardar respuesta del asistente
            assistant_message = Message(
                conversation_id=conversation.conversation_id,
                role="assistant",
                content=response,
                created_at=datetime.now()
            )
            db.add(assistant_message)
            
            # Actualizar timestamp de conversación
            conversation.updated_at = datetime.now()
            
            db.commit()
            logger.info(f"Mensajes guardados en conversación {conversation.conversation_id}")
            
        except Exception as db_error:
            logger.error(f"Error guardando en BD: {str(db_error)}")
            db.rollback()
        
        return ChatResponse(
            response=response,
            conversation_history=updated_history
        )
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tts")
async def text_to_speech(
    request: TTSRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Convert text to speech
    """
    try:
        logger.info(f"User {current_user.username} - TTS request: {request.text[:50]}...")
        
        audio_content = await openai_service.text_to_speech(
            text=request.text,
            voice=request.voice
        )
        
        return StreamingResponse(
            io.BytesIO(audio_content),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=speech.mp3"
            }
        )
        
    except Exception as e:
        logger.error(f"TTS endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quick-interaction")
async def quick_voice_interaction(
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Interacción de voz optimizada - procesa TTS en paralelo con guardado en BD
    """
    try:
        logger.info(f"User {current_user.username} - Quick interaction started")
        
        # 1. Transcribir
        audio_bytes = await audio.read()
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = audio.filename or "audio.webm"
        
        transcription = await openai_service.transcribe_audio(audio_file)
        logger.info(f"✅ Transcription: {transcription}")
        
        # 2. GPT response usando el método correcto
        response = await openai_service.get_chat_completion_stream(
            message=transcription,
            conversation_history=[]
        )
        logger.info(f"✅ GPT response: {response[:50]}...")
        
        # 3. TTS y BD en paralelo
        async def generate_audio():
            return await openai_service.text_to_speech(text=response)
        
        async def save_to_db():
            try:
                conversation = db.query(Conversation).filter(
                    Conversation.user_id == current_user.user_id
                ).order_by(Conversation.updated_at.desc()).first()
                
                if not conversation:
                    conversation = Conversation(
                        user_id=current_user.user_id,
                        title=f"Conversación {datetime.now().strftime('%d/%m %H:%M')}",
                        created_at=datetime.now(),
                        updated_at=datetime.now()
                    )
                    db.add(conversation)
                    db.commit()
                    db.refresh(conversation)
                    logger.info(f"✅ Nueva conversación: {conversation.conversation_id}")
                
                # Guardar mensajes
                db.add(Message(
                    conversation_id=conversation.conversation_id,
                    role="user",
                    content=transcription,
                    created_at=datetime.now()
                ))
                db.add(Message(
                    conversation_id=conversation.conversation_id,
                    role="assistant",
                    content=response,
                    created_at=datetime.now()
                ))
                conversation.updated_at = datetime.now()
                db.commit()
                logger.info(f"✅ Mensajes guardados")
            except Exception as e:
                logger.error(f"❌ Error guardando en BD: {str(e)}")
                db.rollback()
        
        # Ejecutar en paralelo
        audio_response, _ = await asyncio.gather(
            generate_audio(),
            save_to_db()
        )
        
        logger.info("✅ Quick interaction complete")
        
        # Codificar en base64
        transcription_b64 = base64.b64encode(transcription.encode('utf-8')).decode('ascii')
        response_b64 = base64.b64encode(response.encode('utf-8')).decode('ascii')
        
        return StreamingResponse(
            io.BytesIO(audio_response),
            media_type="audio/mpeg",
            headers={
                "X-Transcription": transcription_b64,
                "X-Response-Text": response_b64,
            }
        )
        
    except Exception as e:
        logger.error(f"❌ Quick interaction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-conversation")
async def create_conversation(
    user_id: int,
    title: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crear nueva conversación"""
    # Verificar que el usuario solo cree sus propias conversaciones
    if current_user.user_id != user_id:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    try:
        conversation = Conversation(
            user_id=user_id,
            title=title,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        
        logger.info(f"Conversación creada: {conversation.conversation_id}")
        
        return {
            "conversation_id": conversation.conversation_id,
            "status": "created"
        }
        
    except Exception as e:
        logger.error(f"Error creando conversación: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/{user_id}")
async def get_conversations(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtener conversaciones de un usuario"""
    # Verificar que el usuario solo acceda a sus propias conversaciones
    if current_user.user_id != user_id:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    try:
        conversations = db.query(Conversation).filter(
            Conversation.user_id == user_id
        ).order_by(
            Conversation.updated_at.desc()
        ).all()
        
        return [
            {
                "conversation_id": conv.conversation_id,
                "user_id": conv.user_id,
                "title": conv.title,
                "created_at": conv.created_at.isoformat(),
                "updated_at": conv.updated_at.isoformat()
            }
            for conv in conversations
        ]
        
    except Exception as e:
        logger.error(f"Error obteniendo conversaciones: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/messages/{conversation_id}")
async def get_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtener mensajes de una conversación"""
    # Verificar que la conversación pertenece al usuario
    conversation = db.query(Conversation).filter(
        Conversation.conversation_id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    
    if conversation.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    try:
        messages = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(
            Message.created_at.asc()
        ).all()
        
        return [
            {
                "message_id": msg.message_id,
                "role": msg.role,
                "content": msg.content,
                "audio_duration": msg.audio_duration,
                "created_at": msg.created_at.isoformat()
            }
            for msg in messages
        ]
        
    except Exception as e:
        logger.error(f"Error obteniendo mensajes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))