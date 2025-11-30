# Voice Assistant POC - Kati

Asistente de voz con autenticación JWT, usando OpenAI APIs.

## Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Edita con tus credenciales
uvicorn app.main:app --reload --port 8001
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env  # Edita con tu backend URL
npm run dev
```

## Environment Variables

Ver `.env.example` en cada carpeta.