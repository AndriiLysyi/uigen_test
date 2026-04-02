# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language; Claude generates them via tool calls into a virtual file system (no disk writes), previewed live in an iframe.

## Commands

```bash
npm run setup        # First-time: install deps + generate Prisma client + run migrations
npm run dev          # Start dev server (Next.js with Turbopack)
npm run build        # Production build
npm run lint         # ESLint check
npm run test         # Run all Vitest tests
npx vitest run src/path/to/file.test.ts  # Run a single test file
npm run db:reset     # Reset SQLite database
```

Requires `ANTHROPIC_API_KEY` in `.env`. Without it, the app falls back to a `MockLanguageModel` that returns static code.

> **Node.js 25+**: `dev` and `test` scripts load `node-compat.cjs` via `--require` to polyfill removed `localStorage`/`sessionStorage` globals.

## Architecture

### Data Flow

1. User sends a message → `ChatContext` → POST `/api/chat`
2. `/api/chat/route.ts` streams a response from Claude using the Vercel AI SDK (`maxTokens: 10000`, `maxSteps: 40`)
3. Claude calls `str_replace_editor` or `file_manager` tools to modify files
4. Updated `VirtualFileSystem` state is returned and stored in `FileSystemContext`
5. `PreviewFrame` re-renders the iframe whenever the file system changes
6. On finish, if a session is present, the project (messages + FS) is saved to SQLite via Prisma

### Key Abstractions

**`VirtualFileSystem`** (`src/lib/file-system.ts`): In-memory file store. Serializes to/from JSON for database persistence. The entire component workspace lives here — no actual files are written to disk. Every project requires `/App.jsx` as the entry point.

**`jsx-transformer.ts`** (`src/lib/transform/`): Transforms virtual file contents into a runnable HTML document injected into the preview iframe. Uses Babel standalone for JSX → JS transpilation; generates a dynamic import map where local files become blob URLs and unknown third-party packages are resolved through the `esm.sh` CDN.

**`provider.ts`** (`src/lib/`): Wraps `@ai-sdk/anthropic` and exports the language model (`claude-haiku-4-5`). Contains `MockLanguageModel` used as a fallback when no API key is configured. The mock runs a deterministic 4-step flow: create component → enhance component → create `App.jsx` → text summary.

**Tools** (`src/lib/tools/`):
- `str_replace_editor`: File editor with four commands — `view`, `create`, `str_replace`, `insert`
- `file_manager`: File operations — `rename`, `delete`

**`generation.tsx`** (`src/lib/prompts/`): System prompt sent to Claude. Controls how it generates components (Tailwind CSS, `@/` alias imports, `/App.jsx` entry point).

### State Management

Two React contexts, both defined in `src/lib/contexts/`:
- `FileSystemContext`: Owns the `VirtualFileSystem` instance, the currently selected file, and the `handleToolCall()` dispatcher that processes AI tool calls
- `ChatContext`: Owns chat message history and streaming state; calls `/api/chat` and wires tool calls to `FileSystemContext`

### Auth & Persistence

- Session-based JWT auth (`jose` + `bcrypt`) via server actions in `src/actions/`
- Authenticated users: projects and messages persisted to SQLite via Prisma (`User` and `Project` models; `Project.data` stores serialized VirtualFileSystem as JSON, `Project.messages` stores chat history as JSON)
- Anonymous users: session tracked in `anon-work-tracker.ts` using `sessionStorage` (cleared on tab close); no DB persistence

### UI Layout

Three-panel layout in `src/app/main-content.tsx`:
- Left panel (35%): `ChatInterface` — message list + input
- Right panel (65%): Tabs
  - **Preview**: `PreviewFrame` (sandboxed iframe)
  - **Code**: `FileTree` + `CodeEditor` (Monaco)

### Path Alias

`@/*` maps to `src/*` throughout the codebase.
