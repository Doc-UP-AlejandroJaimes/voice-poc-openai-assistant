# Voice Assistant POC - Backend

FastAPI backend for Voice Assistant POC using OpenAI APIs.

## Features

- **Speech-to-Text**: Convert audio to text using OpenAI Whisper
- **Chat Completion**: Get intelligent responses using GPT-4
- **Text-to-Speech**: Convert text responses to speech using OpenAI TTS
- **Complete Voice Interaction**: End-to-end voice conversation pipeline

## Prerequisites

- Python 3.11 or higher
- OpenAI API key

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Create a `.env` file with your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run the Application

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or use Python directly
python -m app.main
```

## API Endpoints

### Health Check
- `GET /` - Root endpoint
- `GET /health` - Health check

### Voice Operations
- `POST /api/voice/transcribe` - Transcribe audio to text
- `POST /api/voice/chat` - Get chat completion
- `POST /api/voice/tts` - Convert text to speech
- `POST /api/voice/complete-interaction` - Complete voice interaction pipeline

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py       # Pydantic models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── openai_service.py          # OpenAI API wrapper
│   │   └── conversation_service.py    # Conversation management
│   └── routers/
│       ├── __init__.py
│       └── voice.py         # Voice API routes
├── requirements.txt
├── .env
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| OPENAI_API_KEY | OpenAI API key | Required |
| APP_NAME | Application name | Voice Assistant POC |
| ENVIRONMENT | Environment (development/production) | development |
| ALLOWED_ORIGINS | CORS allowed origins | http://localhost:5173,http://localhost:3000 |
| WHISPER_MODEL | Whisper model | whisper-1 |
| GPT_MODEL | GPT model | gpt-4-turbo-preview |
| TTS_MODEL | TTS model | tts-1 |
| TTS_VOICE | TTS voice | alloy |

## Available TTS Voices

- `alloy` - Neutral and balanced
- `echo` - Warm and reassuring
- `fable` - Expressive and animated
- `onyx` - Deep and authoritative
- `nova` - Energetic and friendly
- `shimmer` - Bright and cheerful

## Testing with cURL

### Transcribe Audio
```bash
curl -X POST "http://localhost:8000/api/voice/transcribe" \
  -F "audio=@your_audio_file.mp3"
```

### Chat Completion
```bash
curl -X POST "http://localhost:8000/api/voice/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how are you?",
    "conversation_history": []
  }'
```

### Text-to-Speech
```bash
curl -X POST "http://localhost:8000/api/voice/tts" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test.",
    "voice": "alloy"
  }' \
  --output response.mp3
```

## License

MIT