# Saarthi

Saarthi helps college students understand administrative notices without having to decode dense circulars on their own. Upload a PDF or image to get a multilingual, student-friendly summary, important dates, deadlines, and action items.

## Features

- Upload PDF, PNG, and JPEG notices.
- Extract searchable PDF text locally; use Gemini Vision OCR for scanned pages and image notices.
- Analyze extracted notice text in English, Hindi, or Marathi.
- Review grounded summaries, key points, original notice text, important dates, deadline urgency, and action items.
- Check AI explanations against the original notice before acting.

## Technology

- Frontend: React, Vite, Tailwind CSS, and lucide-react.
- Backend: FastAPI, PyMuPDF, Pillow, and the Google GenAI SDK.
- Configuration: `python-dotenv` loads the backend environment file.

## Prerequisites

- Windows PowerShell
- Python 3.10 or newer
- Node.js 20.19+ (or 22.12+) and npm
- A Google Gemini API key for OCR of scanned/image notices and AI analysis

## Local setup

### Backend

In a PowerShell terminal:

```powershell
cd C:\Users\User\Documents\Notiva\backend
py -3 -m venv .venv
Copy-Item .env.example .env
notepad .env
```

Add your Gemini API key to `GEMINI_API_KEY` in `backend\.env`. Keep this file private; it is excluded by `.gitignore`. Keep the provided `GEMINI_MODEL` value unless you intentionally configure another supported model.

Install dependencies and start the API:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8001
```

The API health check is available at `http://127.0.0.1:8001/health`.

### Frontend

In a second PowerShell terminal:

```powershell
cd C:\Users\User\Documents\Notiva\frontend
npm.cmd install
npm.cmd run dev
```

Open the local Vite URL printed in the terminal (normally `http://127.0.0.1:5173`).

## Tests and checks

```powershell
cd C:\Users\User\Documents\Notiva\backend
.\.venv\Scripts\python.exe test_main.py

cd C:\Users\User\Documents\Notiva\frontend
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Automated backend tests mock Gemini responses; they do not require live Gemini API calls.
