# KanbanX

KanbanX is a production-grade Trello-inspired Kanban board built utilizing React, Supabase, and modern drag-and-drop principles.

## Features

- **Authentication**: Secure Email magic-link authentication via Supabase Auth.
- **Board Management**: Create, view, and delete boards. RLS ensures strict data ownership.
- **Lists & Cards**: Create dynamic lists and cards within boards.
- **Drag & Drop**: Smooth drag-and-drop experience for both cards and lists using `@hello-pangea/dnd`, with position persistence.
- **Realtime Sync**: Leverages Supabase Realtime to sync changes instantly across multiple connected clients or tabs.
- **Card Details**: Edit card descriptions in a specialized modal view.
- **Security**: Row Level Security (RLS) enabled on all database tables.

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS (for styling utilities, though inline styles used heavily for tutorial clarity).
- **Backend/DB**: Supabase (PostgreSQL, Auth, Realtime).
- **Libraries**: `react-router-dom`, `@hello-pangea/dnd`, `@supabase/supabase-js`.

## Setup

1. **Clone**: Clone the repository.
2. **Install**: Run `npm install` in both `backend` (if using our initial Node template, though currently logic is pure frontend-supabase) or just `frontend` folder.
   *Note: This project evolved to a "Backend-as-a-Service" model with Supabase, effectively moving backend logic to the database layer.*
3. **Environment**: Setup `.env` in `frontend` with:
   ```
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```
4. **Database**: Run the SQL schema provided in `supabase_schema.sql` in your Supabase SQL Editor.
5. **Run**: `npm run dev` in `frontend`.

## Why this project?

Built to demonstrate real-world frontend architecture, state management with optimistic UI updates, realtime systems integration, and enforcing data integrity through database policies.
