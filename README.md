# Relay It Backend

AI-powered backend API for screenshot analysis and intelligent note management. Built for research sessions where users capture screenshots and receive AI-generated insights, summaries, and interactive note editing.

## What It Does

This backend provides RESTful API endpoints that power the Relay It application:

- **Screenshot Analysis** - Analyzes uploaded images using Google's Gemini 2.0 Flash to extract text, identify entities (hotels, restaurants, products, etc.), and generate structured insights
- **Session Management** - Organizes screenshots into sessions with metadata tracking and retrieval
- **AI Summarization** - Creates intelligent summaries from multiple screenshots and entities within a session
- **Interactive Chat** - Enables users to edit markdown notes via natural language commands or ask questions about their research
- **Regeneration** - Re-analyzes screenshots with refined prompts for improved results

## Tech Stack

- **Next.js 16** - API routes with Edge Runtime for fast global deployment
- **TypeScript** - Full type safety across all endpoints
- **Gemini 2.0 Flash Exp** - Google's latest AI model for vision and text generation
- **Supabase** - Authentication and PostgreSQL database
- **Vercel** - Serverless deployment platform

## API Endpoints

- `POST /api/analyze` - Analyze screenshot and extract entities
- `POST /api/summarize` - Generate session summary from entities
- `POST /api/regenerate` - Re-analyze with custom prompts
- `POST /api/chat` - Interactive note editing and Q&A
- `GET /api/sessions` - List all sessions
- `GET /api/sessions/[id]` - Get session details

See [API.md](./API.md) for detailed endpoint documentation.

## Quick Start

```bash
npm install
npm run dev
```

Environment variables required:
- `GEMINI_API_KEY` - Google AI API key

Deployed at: https://relay-that-backend.vercel.app
