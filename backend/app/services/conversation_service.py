"""
Conversation management service
Handles conversation state and history
"""
from typing import List, Dict
from app.models.schemas import ChatMessage
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ConversationService:
    """Service for managing conversation state"""
    
    def __init__(self):
        """Initialize conversation service"""
        self.conversations: Dict[str, List[ChatMessage]] = {}
    
    def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str
    ) -> List[ChatMessage]:
        """
        Add a message to conversation history
        
        Args:
            conversation_id: Unique conversation identifier
            role: Message role ('user' or 'assistant')
            content: Message content
            
        Returns:
            Updated conversation history
        """
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = []
        
        message = ChatMessage(
            role=role,
            content=content,
            timestamp=datetime.now()
        )
        
        self.conversations[conversation_id].append(message)
        logger.info(f"Added {role} message to conversation {conversation_id}")
        
        return self.conversations[conversation_id]
    
    def get_conversation(self, conversation_id: str) -> List[ChatMessage]:
        """
        Get conversation history
        
        Args:
            conversation_id: Unique conversation identifier
            
        Returns:
            Conversation history
        """
        return self.conversations.get(conversation_id, [])
    
    def clear_conversation(self, conversation_id: str) -> None:
        """
        Clear conversation history
        
        Args:
            conversation_id: Unique conversation identifier
        """
        if conversation_id in self.conversations:
            del self.conversations[conversation_id]
            logger.info(f"Cleared conversation {conversation_id}")
    
    def get_messages_for_api(
        self,
        conversation_id: str,
        max_messages: int = 10
    ) -> List[Dict[str, str]]:
        """
        Get conversation messages formatted for OpenAI API
        
        Args:
            conversation_id: Unique conversation identifier
            max_messages: Maximum number of messages to include
            
        Returns:
            List of message dictionaries
        """
        conversation = self.get_conversation(conversation_id)
        
        # Get last N messages
        recent_messages = conversation[-max_messages:] if len(conversation) > max_messages else conversation
        
        # Convert to API format
        return [
            {"role": msg.role, "content": msg.content}
            for msg in recent_messages
        ]


# Global service instance
conversation_service = ConversationService()