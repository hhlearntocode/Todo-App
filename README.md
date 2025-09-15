# To-Do App – Preliminary Assignment Submission

⚠️ Please complete all sections marked with the ✍️ icon — these are required for your submission.

👀 Please check `ASSIGNMENT.md` in this repository for assignment requirements.

## 🚀 Project Setup & Usage
How to install and run your project:

✍️ Steps
```bash
# 1) Install dependencies at the monorepo root
pnpm install

# 2) Backend env setup
cp apps/api/env.example apps/api/.env

# 3) (Optional) Initialize database (uses Prisma + SQLite)
pnpm --filter @todo-app/api db:migrate
pnpm --filter @todo-app/api seed

# 4) Start both Frontend and Backend for development
pnpm dev

# Individual servers (alternative)
pnpm --filter @todo-app/api dev     # API: http://localhost:3001
pnpm --filter @todo-app/web dev     # Web: http://localhost:5173
```

Notes
- If you use npm: replace `pnpm` with `npm run` equivalents and run inside each app directory.
- If you see a missing dependency error like `@radix-ui/react-progress`, install it in web:
  `pnpm -F @todo-app/web add @radix-ui/react-progress`.

## 🔗 Deployed Web URL or APK file
✍️ [Paste your link here]

## 🎥 Demo Video
Demo video link (≤ 2 minutes):

📌 Video Upload Guideline: when uploading your demo video to YouTube, please set the visibility to Unlisted.
- “Unlisted” videos can only be viewed by users who have the link.
- The video will not appear in search results or on your channel.
- Share the link in your README so mentors can access it.

✍️ [Paste your video link here]

## 💻 Project Introduction

### a. Overview
✍️ A modern full‑stack To‑Do app for personal productivity. Users can create, organize, filter, and complete tasks with powerful views like Do Now, Calendar, and an Analytics dashboard to understand productivity patterns.

### b. Key Features & Function Manual
✍️
- Task CRUD: add, edit, delete, complete/incomplete
- Priorities, due dates, tags, search and filters
- Bulk actions for multi‑select operations
- Views: All, Today, Upcoming, Completed, High Priority, Do Now, Calendar
- Calendar View: fully scrollable grid; detects deadline collisions with robust logic (dedup + valid title)
- Analytics Page (separate route `/analytics`):
  - Time‑range selector (Past 7/30/90 days)
  - Daily completions, hourly productivity, weekly pattern
  - Procrastination pattern learning and insights
  - Smart notifications (optimal reminder, urgent threshold)
  - Realistic vs. official deadline suggestions
- Navigation UX: each main view has its own route; re‑clicking the same view reliably reloads

### c. Unique Features (What’s special about this app?)
✍️
- “Do Now” prioritization based on deadline pressure and priority
- Analytics that turns history into insights: best work times, procrastination patterns, and buffer suggestions
- Smart deadline recommendations tailored to personal behavior

### d. Technology Stack and Implementation Methods
✍️
- Frontend: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, Radix UI, React Router
- State/Data: Zustand, TanStack Query
- Backend: Node.js (Fastify), Prisma ORM, SQLite (dev) / PostgreSQL (prod)
- Tooling: pnpm workspaces, ESLint/Prettier, Vitest/Playwright, Docker

### e. Service Architecture & Database structure (when used)
✍️
- Monorepo with `apps/api` (Fastify + Prisma) and `apps/web` (React)
- Core tables: `Task`, `Tag`, and many‑to‑many `TaskTags`
- Task fields include priority, dueDate, estimated/actual minutes, timestamps — enabling time‑tracking analytics

## 🧠 Reflection

### a. If you had more time, what would you expand?
✍️ Advanced collaboration (shared lists, roles), recurring tasks, sub‑tasks/dependencies, calendar integrations, mobile app, and richer offline support.

### b. If you integrate AI APIs more for your app, what would you do?
✍️ Natural‑language task creation, AI‑powered task breakdown, deadline predictions, behavioral notifications, and smarter Do‑Now prioritization based on personal patterns.

## ✅ Checklist
- [x] Code runs without errors
- [x] All required features implemented (add/edit/delete/complete tasks)
- [x] All ✍️ sections are filled (or left with explicit prompts)

