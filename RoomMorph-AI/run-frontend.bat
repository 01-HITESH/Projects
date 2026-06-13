@echo off
cd /d "%~dp0apps\web"
set NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
