# RoomMorph AI

AI-powered interior redesign studio prototype.

The app follows a staged production workflow:

1. Upload a 2D room photo.
2. Generate multiple redesigned concepts.
3. Select a preferred theme.
4. Convert the selected concept into an interactive 3D room.
5. Compare before/after and customize the scene.

## Local Apps

- Frontend: `apps/web`
- Backend: `services/api`
- Docs: `docs`

## Run

Backend:

```powershell
cd services\api
python -m pip install --only-binary=:all: -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Frontend:

```powershell
cd apps\web
npm.cmd install
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

