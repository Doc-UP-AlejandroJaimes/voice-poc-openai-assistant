"""
Database configuration and connection
"""
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+psycopg://neondb_owner:npg_pciM6Jga1Zzo@ep-silent-mouse-agengp73-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
)

# Configuración específica para Neon
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,  # 5 minutos (Neon cierra conexiones inactivas)
    pool_size=5,
    max_overflow=10,
    connect_args={
        "connect_timeout": 10,
        "sslmode": "require"  # SSL requerido para Neon
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class Conversation(Base):
    __tablename__ = "conversations"
    
    conversation_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)


class Message(Base):
    __tablename__ = "voice_messages"
    
    message_id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, nullable=False, index=True)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    audio_duration = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.now)


def init_db():
    """Inicializar tablas en la base de datos"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas/verificadas correctamente")
    except Exception as e:
        print(f"❌ Error creando tablas: {str(e)}")
        raise


def get_db():
    """Dependency para obtener sesión de BD"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()