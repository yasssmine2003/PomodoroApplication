# 🍅 YasFlow — Pomodoro Productivity App

A modern, full-stack Pomodoro productivity application built with **React + Vite** (frontend) and **FastAPI + SQLite** (backend).

---

## ✨ Features

- ⏱️ Pomodoro timer with focus, short break, and long break sessions
- ✅ Task management with priorities, categories, and tags
- 📊 Daily & weekly productivity statistics
- 🔥 Streak tracking
- ⚙️ Fully customizable timer settings
- 💬 Custom motivational quotes
- 🔐 User authentication (JWT)
- 📦 Offline-first with localStorage fallback

---

## 🗂️ Project Structure

```
.
├── src/                    # React + Vite frontend
│   ├── api.ts              # FastAPI client (typed fetch wrapper)
│   ├── store.tsx           # Global state + backend sync
│   ├── types.ts            # TypeScript types
│   ├── App.tsx             # Root app component
│   ├── components/         # Reusable UI components
│   ├── pages/              # App pages (Dashboard, Timer, Tasks, Stats, Settings)
│   └── hooks/              # Custom React hooks
│
├── backend/                # FastAPI Python backend
│   ├── run.py              # Start script
│   ├── .env                # Environment variables (not committed)
│   ├── .env.example        # Environment variable template
│   ├── requirements.txt    # Python dependencies
│   └── app/
│       ├── main.py         # FastAPI app + CORS + routers
│       ├── database.py     # SQLAlchemy engine & session
│       ├── core/
│       │   ├── config.py   # Settings from environment
│       │   └── security.py # JWT + password hashing
│       ├── models/
│       │   └── domain.py   # DB models: User, Task, PomodoroSession, UserSettings
│       ├── schemas/
│       │   └── schemas.py  # Pydantic request/response schemas
│       └── api/v1/
│           ├── auth.py     # Register, Login, Me
│           ├── tasks.py    # CRUD for tasks
│           ├── sessions.py # Log Pomodoro sessions
│           ├── settings.py # User settings
│           ├── stats.py    # Today/weekly/all-time stats
│           └── appdata.py  # Bulk data load (single request on startup)
│
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm** (or pnpm)
- **Python** 3.10+

---

### 1. Frontend

```bash
# Install dependencies
npm install

# Start the dev server (runs on http://localhost:8443)
npm run dev
```

---

### 2. Backend

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Copy the environment file and edit as needed
copy .env.example .env

# Start the FastAPI server (runs on http://localhost:8000)
python run.py
```

> 📌 The SQLite database file `backend/flowtime.db` is created **automatically** on first start. No setup required.

---

## 🌐 API

| URL | Description |
|-----|-------------|
| `http://localhost:8000/docs` | Interactive Swagger API documentation |
| `http://localhost:8000/redoc` | ReDoc API documentation |
| `http://localhost:8000/health` | Health check |

### Main Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Create a new account |
| `POST` | `/api/v1/auth/login` | Login and receive JWT token |
| `GET` | `/api/v1/auth/me` | Get current user info |
| `GET` | `/api/v1/appdata` | Bulk load all user data |
| `GET/POST` | `/api/v1/tasks` | List / create tasks |
| `PATCH/DELETE` | `/api/v1/tasks/{id}` | Update / delete a task |
| `GET/POST` | `/api/v1/sessions` | List / log Pomodoro sessions |
| `GET/PUT` | `/api/v1/settings` | Get / update user settings |
| `GET` | `/api/v1/stats/summary` | Today + weekly stats + streak |

---

## 🗄️ Database

**Default:** SQLite (zero configuration, stored in `backend/flowtime.db`)

**Switch to PostgreSQL:** Update `DATABASE_URL` in `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/flowtime
```

Then install the PostgreSQL driver:

```bash
pip install psycopg2-binary
```

All tables are created automatically by SQLAlchemy on server startup — no migrations needed for initial setup.

---

## ⚙️ Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | *(insecure default)* | JWT signing key — **change in production!** |
| `DATABASE_URL` | `sqlite:///./flowtime.db` | Database connection string |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `43200` (30 days) | JWT token expiry |
| `CORS_ORIGINS` | `["http://localhost:5173", ...]` | Allowed frontend origins |

---

## 🔒 Security Notes

- Change `SECRET_KEY` to a strong random value before deploying:
  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```
- Never commit `backend/.env` or `backend/flowtime.db` to version control (already in `.gitignore`)
- Set specific `CORS_ORIGINS` in production (remove the wildcard `"*"`)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 19 + TypeScript |
| Frontend build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Backend framework | FastAPI |
| Backend server | Uvicorn |
| ORM | SQLAlchemy 2.0 |
| Database | SQLite (PostgreSQL compatible) |
| Authentication | JWT (PyJWT) + bcrypt |
| Validation | Pydantic v2 |
