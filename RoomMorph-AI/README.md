# RoomMorph AI

AI-powered interior redesign studio prototype. Upload a real room photo, generate several photoreal redesign concepts, choose a theme, convert it into an interactive 3D room, then compare and customize the result.

The redesign concept step uses OpenAI image editing by default. The 3D scene builder remains local and deterministic.

## Project Structure

- `apps/web` - Next.js frontend
- `services/api` - FastAPI backend
- `docs` - architecture notes

## Requirements

Install these on the device before running the project:

- Git
- Node.js 20 or newer
- npm, included with Node.js
- Python 3.11 or newer
- OpenAI API key for real image generation

## Clone

```bash
git clone https://github.com/01-HITESH/Projects.git
cd Projects/RoomMorph-AI
```

## Run Locally

Use two terminal windows: one for the backend and one for the frontend.

### 1. Start the Backend

Windows PowerShell:

```powershell
cd services\api
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --only-binary=:all: -r requirements.txt
copy .env.example .env
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Edit `services/api/.env` and set:

```text
OPENAI_API_KEY=your_api_key_here
```

macOS or Linux:

```bash
cd services/api
python3 -m venv .venv
./.venv/bin/python -m pip install --only-binary=:all: -r requirements.txt
cp .env.example .env
./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Edit `services/api/.env` and set:

```text
OPENAI_API_KEY=your_api_key_here
```

Backend URLs:

- Health check: `http://127.0.0.1:8000/health`
- API docs: `http://127.0.0.1:8000/docs`

### 2. Start the Frontend

Windows PowerShell:

```powershell
cd apps\web
npm.cmd install
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

macOS or Linux:

```bash
cd apps/web
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open the app:

```text
http://127.0.0.1:3000
```

## Configuration

The default frontend expects the backend at `http://localhost:8000`. To use a different API URL, create `apps/web/.env.local`:

```text
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

The redesign flow calls the OpenAI Image API edit endpoint by default and stores generated concepts under `services/api/storage`. To test without API usage, set this in `services/api/.env`:

```text
IMAGE_GENERATION_PROVIDER=local
```

The backend stores generated uploads and project JSON under `services/api/storage`. This folder is local runtime data and is ignored by Git.

Product workflow trade-offs and validation prompts are captured in `docs/PRODUCT_STRATEGY.md`.

## Production Build Check

```bash
cd apps/web
npm run build
```

## Notes

- Uploaded images must be JPEG, PNG, or WebP.
- The backend allows uploads up to 12 MB by default.
- If ports `3000` or `8000` are already in use, start either app with a different port and update `NEXT_PUBLIC_API_BASE_URL` if the API port changes.
