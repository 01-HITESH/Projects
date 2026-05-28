# RoomMorph AI

AI-powered interior redesign studio prototype. Upload a 2D room photo, generate several design concepts, choose a theme, convert it into an interactive 3D room, then compare and customize the result.

The prototype runs fully locally. It uses deterministic local image and 3D fallbacks instead of external AI services, so no API keys are required.

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
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

macOS or Linux:

```bash
cd services/api
python3 -m venv .venv
./.venv/bin/python -m pip install --only-binary=:all: -r requirements.txt
./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
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

The redesign image source can run in three modes from the upload form:

- `AI real photo` uses OpenAI image editing and requires `OPENAI_API_KEY` on the backend.
- `Upload real after` lets you upload real redesigned room photos and uses them as concept images.
- `Demo renderer` keeps the deterministic offline renderer and is not a real redesigned room photo.

Backend `.env` example:

```text
OPENAI_API_KEY=your_key_here
OPENAI_IMAGE_MODEL=gpt-image-1
```

AI real-photo mode returns an error if the API key is missing or image generation fails. Use `Upload real after` when you already have real redesigned photos.

The backend stores generated uploads and project JSON under `services/api/storage`. This folder is local runtime data and is ignored by Git.

## Production Build Check

```bash
cd apps/web
npm run build
```

## Notes

- Uploaded images must be JPEG, PNG, or WebP.
- The backend allows uploads up to 12 MB by default.
- If ports `3000` or `8000` are already in use, start either app with a different port and update `NEXT_PUBLIC_API_BASE_URL` if the API port changes.
