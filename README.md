# DeepResearch AI

> Evidence-first AI research and intelligent conversation, built with a multi-agent research pipeline, authenticated user data, long-term memory, feedback learning, and opt-in private training data.

[![Live App](https://img.shields.io/badge/Live%20App-Vercel-black?style=for-the-badge&logo=vercel)](https://deepresearch-ai-nu.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Data-3FCF8E?style=flat-square&logo=supabase)
![LangGraph](https://img.shields.io/badge/Orchestration-LangGraph-purple?style=flat-square)

## Overview

DeepResearch AI is a full-stack research application with two primary modes:

- **Conversation** for fast, interactive AI chat.
- **Deep Research** for multi-step investigations that plan, search, extract, reflect, verify, synthesize, and write a structured report.

The project is designed around explicit research stages instead of asking one model to do everything in a single prompt.

## Live deployment

- **Frontend:** https://deepresearch-ai-nu.vercel.app
- **Backend API:** https://deepresearch-ai-cc22e7fc.fastapicloud.dev
- **API base:** https://deepresearch-ai-cc22e7fc.fastapicloud.dev/api/v1
- **Database/Auth:** Supabase

## Research pipeline

```text
User Query
   │
   ▼
Planner
   │
   ▼
Searcher
   │
   ▼
Extractor
   │
   ▼
Reflection
   │
   ▼
Verifier
   │
   ▼
Synthesizer
   │
   ▼
Writer
   │
   ▼
Structured Research Report
```

### Planner

Breaks the request into research objectives, sub-questions, and evidence requirements.

### Searcher

Finds relevant live sources for each research objective.

### Extractor

Pulls useful claims, facts, and context from collected source material.

### Reflection

Looks for missing coverage, weak evidence, contradictions, and unanswered questions.

### Verifier

Checks whether important claims are actually supported by the gathered evidence.

### Synthesizer

Combines findings across sources into a coherent research state.

### Writer

Turns verified research into a readable, structured final report.

## Features

### Conversation

- Authenticated AI chat
- Conversation history
- Message editing
- File attachments
- Speech-to-text
- Image generation
- Image editing
- User feedback
- Long-term semantic memory
- Correction-based learning signals

### Deep Research

- Seven-stage research pipeline
- Live web research
- PDF-assisted research
- Source-aware synthesis
- Research history
- Follow-up questions
- Research feedback
- Learned source preferences
- Structured final reports

### Adaptive learning foundation

The current release includes the controlled learning foundation completed through **Phase 6**:

- Semantic user memory
- Conversation feedback capture
- Research feedback capture
- Memory consolidation
- Deterministic evaluation framework
- Private training-data collection
- Explicit opt-in before a correction enters the training dataset
- Redaction of obvious secrets/direct identifiers
- Deduplication
- Deterministic train/validation splits
- SFT export
- Preference-data export

> The application does **not** automatically fine-tune or promote a model. The current training workspace manages private, user-approved training examples and dataset exports.

## Security and privacy

DeepResearch AI uses several layers of protection:

- Supabase authentication
- Row Level Security for user-scoped learning data
- Bearer-token authentication between the frontend and FastAPI
- Application-layer encrypted AI payload transport
- Per-user memory, feedback, and training records
- Training capture disabled by default
- No automatic upload of private training exports to a model provider

The frontend public encryption key and backend private encryption key must belong to the same RSA key pair.

## Tech stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase JS / SSR
- Framer Motion
- GSAP
- Three.js / React Three Fiber
- Zustand
- React Markdown

### Backend

- Python 3.12
- FastAPI
- Uvicorn
- LangGraph
- OpenAI-compatible model client
- Tavily
- Supabase REST/Auth
- Deepgram
- Pollinations
- pypdf
- python-docx

### AI providers

- **OpenRouter** — conversation, research, embeddings, and other LLM workloads
- **Tavily** — live web search
- **Deepgram** — speech-to-text
- **Pollinations** — image generation and editing

## Repository structure

```text
deepresearch-ai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── services/
│   │   └── tools/
│   ├── evals/
│   ├── scripts/
│   ├── requirements.txt
│   └── pyproject.toml
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── package.json
├── .github/
│   └── workflows/
└── README.md
```

## Getting started

### Prerequisites

Install:

- Git
- Node.js
- npm
- Python 3.12

Clone the repository:

```bash
git clone https://github.com/Aanu777/deepresearch-ai.git
cd deepresearch-ai
```

## Backend setup

Create and activate a virtual environment.

### Windows PowerShell

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create:

```text
backend/.env
```

Required backend variables:

```env
TAVILY_API_KEY=
OPENROUTER_API_KEY=

SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=

PAYLOAD_PRIVATE_KEY_B64=
PAYLOAD_ENCRYPTION_REQUIRED=true

DEEPGRAM_API_KEY=
POLLINATIONS_API_KEY=
```

Optional model/runtime overrides are defined in `backend/app/core/config.py`.

Start FastAPI:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

## Frontend setup

Open another terminal:

```powershell
cd frontend
npm install
```

Create:

```text
frontend/.env.local
```

Required frontend variables:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

NEXT_PUBLIC_PAYLOAD_PUBLIC_KEY_B64=
```

Start Next.js:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production configuration

The production frontend is deployed on Vercel and the backend is deployed on FastAPI Cloud.

The production frontend API variable is:

```env
NEXT_PUBLIC_API_URL=https://deepresearch-ai-cc22e7fc.fastapicloud.dev/api/v1
```

Do not commit API keys, private encryption keys, access tokens, or `.env` files.

## Testing

### Deterministic AI regression suite

From the repository root:

```powershell
python .\backend\scripts\run_evals.py
```

Or:

```powershell
cd backend
python scripts\run_evals.py
```

The regression suite covers areas including:

- provider output cleanup
- code formatting
- memory parsing
- memory consolidation
- source learning
- conversation quality
- code generation
- private training-data preparation and export

### Frontend production build

```powershell
cd frontend
npm run build
```

## API surface

Main FastAPI route groups:

```text
GET  /health

/api/v1/conversations
/api/v1/research
/api/v1/memory
/api/v1/training
```

The authenticated application should be used for normal API interaction because protected AI routes use bearer authentication and encrypted payload transport.

## Private training data

Training examples are created only when a user explicitly opts in while submitting a correction.

The Training workspace supports:

- viewing private samples
- deleting individual samples
- clearing the dataset
- exporting SFT data
- exporting preference data

Training records are account-scoped with Supabase Row Level Security.

## Development principles

### Modular

Research stages and services have narrow responsibilities and can evolve independently.

### Evidence-first

Research output should stay connected to supporting sources and explicit verification steps.

### Privacy-aware

Learning data is user-scoped and correction capture requires explicit opt-in.

### Testable

Behavior that can be made deterministic is covered by regression evaluations.

### Fail-safe

Optional adaptive-learning features should not prevent the core research/chat experience from functioning.

## Current release

**DeepResearch AI — Phase 6 foundation**

The current stable release includes the complete controlled private training-data pipeline on top of the earlier memory, feedback, source-learning, and evaluation phases.

Phase 7 model-training orchestration is intentionally **not part of the current release**.

## Deployment architecture

```text
Browser
   │
   ├── Next.js frontend ────────────── Vercel
   │
   ├── Authentication ─────────────── Supabase Auth
   │
   └── Encrypted API requests
              │
              ▼
        FastAPI backend ───────────── FastAPI Cloud
              │
              ├── LLMs ───────────── OpenRouter
              ├── Search ─────────── Tavily
              ├── Speech ─────────── Deepgram
              ├── Images ─────────── Pollinations
              └── User learning data ─ Supabase
```

## Author

**Aanu777**

GitHub: https://github.com/Aanu777

---

Built around a simple idea: important questions deserve a research process, not just a single prompt.
