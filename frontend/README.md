# YojanaSaarthi Frontend

A React + TypeScript + Vite frontend prototype for the YojanaSaarthi academic project.

## 1. Requirements
- Node.js 20.19+ or 22.12+
- npm
- Git (if working with your team repository)

Check installations:
```bash
node -v
npm -v
git --version
```

## 2. Run locally
Open this folder in VS Code, then open Terminal:
```bash
npm install
copy .env.example .env
npm run dev
```
Open the local URL printed by Vite (normally http://localhost:5173).

On macOS/Linux, use `cp .env.example .env` instead of `copy`.

## 3. Demo mode and backend integration
The app starts in demo mode:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_USE_MOCK_DATA=true
```
This allows the UI to work without the backend. When the backend team confirms the API routes and JSON response shape:
1. Edit `src/services/api.ts`.
2. Match the request body, endpoint paths and response mapping to the backend.
3. Set `VITE_USE_MOCK_DATA=false` in `.env`.
4. Restart `npm run dev`.

Current assumed endpoints (placeholders, NOT confirmed):
- `POST /api/recommendations` — expects citizen profile and returns `Scheme[]`.
- `POST /api/assistant` — expects `{ question, scheme_name }` and returns `{ answer }`.

Ask backend teammates for their actual routes, request schema, response schema, and CORS configuration before switching off mock mode.

## 4. Build check
```bash
npm run build
```
Production output is written to `dist/`.

## 5. Suggested Git workflow
Do not overwrite your teammates' backend files. If the team repository already exists:
```bash
git clone YOUR_TEAM_REPOSITORY_URL
cd YOUR_REPOSITORY_FOLDER
git checkout -b feature/frontend
```
Copy this frontend folder's contents into the agreed frontend directory (for example `frontend/`), then:
```bash
git add frontend
git commit -m "Build YojanaSaarthi frontend MVP"
git push -u origin feature/frontend
```
If you have already cloned the repository, do not clone it again. Run `git status`, create your feature branch, and add only the frontend files.

## 6. Important academic-demo note
Scheme names and descriptions are illustrative starter content. Match all scheme rules, eligibility, benefits, documents and official application URLs against authoritative government sources before presenting them as factual. Match scores are demo values, not an eligibility engine. The assistant is a mock response until connected to the team's real AI/RAG backend. Do not collect Aadhaar numbers, OTPs, passwords or bank credentials in this prototype.
