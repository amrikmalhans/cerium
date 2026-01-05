# Cerium Frontend - Chat UI

A modern chat interface for interacting with OpenAI models.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env.local` file in the `apps/frontend` directory:
```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# For API routes (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# API Configuration
API_BASE_URL=http://localhost:8000

# Web App URL (for redirects)
NEXT_PUBLIC_WEB_URL=http://localhost:3000
```

**Important Notes:**
- `NEXT_PUBLIC_*` variables are required and must be prefixed with `NEXT_PUBLIC_` to be accessible in client-side code
- After creating/updating `.env.local`, **restart your dev server** for changes to take effect
- `API_BASE_URL` should point to your FastAPI backend (default: http://localhost:8000)

3. Run the development server:
```bash
pnpm dev
```

The app will be available at http://localhost:3001

## Features

- **RAG (Retrieval-Augmented Generation)**: Automatically retrieves relevant documents from your knowledge base before generating responses
- Chat interface with OpenAI models
- Support for multiple OpenAI models (GPT-4o, GPT-4, GPT-3.5 Turbo, etc.)
- Real-time message display with retrieval status
- Shows which documents were used to answer your question
- Model selection
- Clear conversation history

## How RAG Works

1. When you send a message, the system first searches your knowledge base for relevant documents using semantic search
2. The retrieved documents are included as context in the prompt to the LLM
3. The LLM generates a response using both the retrieved context and its general knowledge
4. You can see which documents were used in the response

## Usage

1. Make sure your FastAPI backend is running (the one with the `/retrieve` endpoint)
2. Select a model from the dropdown
3. Type your message and press Enter or click Send
4. The system will:
   - Search your knowledge base for relevant information
   - Generate a response using the retrieved context
   - Show you which documents were used
5. Use the Clear button to reset the conversation

