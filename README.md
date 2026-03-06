# Notes-Taking App

A full-stack notes-taking application where users can sign up, create, edit, and organize notes by colored categories. Built with a warm, aesthetic UI and auto-saving notes.

**Built in a single day — ~6 hours from first commit to fully working app.** Requirements gathering, backend, frontend, Docker, tests, and documentation all completed in one session.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **Backend** | Django 5, Django REST Framework |
| **Database** | PostgreSQL 16 |
| **API Docs** | Swagger / OpenAPI via drf-spectacular |
| **Testing** | pytest, Django TestCase (44 tests) |
| **Containerization** | Docker, Docker Compose |
| **Production Server** | Gunicorn (WSGI) |
| **Hosting** | Azure VM (Ubuntu 24.04, B2s) |

## Features

- **Authentication** — Email/password signup & login with token-based auth
- **Auto-save** — Notes save automatically as you type (debounced)
- **Categories** — Color-coded categories (Random Thoughts, School, Personal) created on signup
- **Filtering** — Filter notes by category via sidebar
- **Responsive grid** — Notes displayed as preview cards in a responsive layout
- **Inline editing** — Edit title, content, and category in a modal editor
- **Live timestamps** — "today", "yesterday", or "Month Day" relative date formatting

## Quick Start (Docker)

```bash
# 1. Clone the repo
git clone https://github.com/ayrtondenner/notes-taking-app.git
cd notes-taking-app

# 2. Set up environment
cp .env.example .env

# 3. Start everything
docker compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Swagger Docs**: http://localhost:8000/api/docs/

## Local Development

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL (or use SQLite for development)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations (SQLite for local dev)
DATABASE_URL=sqlite python manage.py migrate

# Start server
DATABASE_URL=sqlite python manage.py runserver
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Running Tests

```bash
cd backend
DATABASE_URL=sqlite pytest -v
```

All 44 tests should pass, covering:
- User model validation and creation
- Signup/login flows with token generation
- Default category creation on signup
- Note CRUD operations
- Category filtering
- Authorization enforcement (401 on unauthenticated access)
- User data isolation (users cannot see each other's notes)
- Date formatting utility

## API Documentation

Interactive Swagger docs are available at `/api/docs/` when the server is running.

### API Examples (curl)

```bash
# Sign up
curl -X POST http://localhost:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "securepass123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "securepass123"}'

# List categories (use token from login/signup response)
curl http://localhost:8000/api/categories/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"

# Create a note
curl -X POST http://localhost:8000/api/notes/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"category_id": 1}'

# Update a note
curl -X PUT http://localhost:8000/api/notes/1/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Note", "content": "Hello world!", "category_id": 1}'

# List all notes
curl http://localhost:8000/api/notes/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"

# Filter notes by category
curl "http://localhost:8000/api/notes/?category=1" \
  -H "Authorization: Token YOUR_TOKEN_HERE"

# Delete a note
curl -X DELETE http://localhost:8000/api/notes/1/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

## Azure Deployment

The app is deployed to an Azure VM using Docker Compose. Deployment scripts are provided in the `scripts/` directory.

### First-Time Deployment

```bash
# Prerequisites: Azure CLI installed and logged in (az login)
bash scripts/azure-deploy.sh
```

This creates a B2s VM (2 vCPU, 4GB RAM, ~$44/mo), installs Docker, clones the repo, generates secure credentials, and starts all services. The app becomes available at `http://notes-app.eastus.cloudapp.azure.com:3000`.

### VM Management Scripts

| Script | Purpose |
|--------|---------|
| `scripts/azure-deploy.sh` | Full first-time deployment: creates Azure resources, provisions VM, deploys app |
| `scripts/azure-vm-start.sh` | Starts a stopped VM and brings up Docker containers |
| `scripts/azure-vm-stop.sh` | Deallocates VM to stop compute billing (~$14/mo for disk+IP only) |
| `scripts/azure-redeploy.sh` | Pulls latest code from GitHub and rebuilds containers on the VM |

### Why Azure VM?

We evaluated four Azure hosting options:

| Option | Monthly Cost | Docker Compose Support | Always-on |
|--------|-------------|----------------------|-----------|
| **VM (B2s)** | ~$44 | Native | Yes |
| Container Apps | ~$16-26 | No | Scales to zero |
| App Service | ~$42 | Retiring 2027 | Yes |
| Container Instances | ~$56-82 | Retired | Yes |

The VM was chosen for **simplicity** — the existing Docker Compose setup works as-is with no modifications. The other options either require splitting services into separately managed containers, have deprecated Docker Compose support, or cost more for fewer features.

### Production Changes

The following changes were made to prepare for production deployment:

- **Gunicorn** replaces Django's development server (`runserver`) as the WSGI server
- **DEBUG defaults to False** — must be explicitly enabled via `DJANGO_DEBUG=True`
- **API URL is configurable** via `NEXT_PUBLIC_API_URL` environment variable (defaults to `localhost` for local dev)
- **Backend volume mount removed** from Docker Compose (was for live-reload in development)

## Project Structure

```
notes-taking-app/
├── backend/
│   ├── config/          # Django settings, URLs, WSGI
│   ├── accounts/        # Custom User model, auth views
│   │   └── tests/       # User & auth tests
│   ├── notes/           # Category & Note models, views
│   │   └── tests/       # Notes CRUD & integration tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js pages (login, signup, dashboard)
│   │   ├── components/  # React components (auth, dashboard, ui)
│   │   ├── lib/         # API client, auth helpers, utilities
│   │   └── types/       # TypeScript interfaces
│   └── Dockerfile
├── scripts/
│   ├── azure-deploy.sh    # First-time Azure VM deployment
│   ├── azure-vm-start.sh  # Start VM + containers
│   ├── azure-vm-stop.sh   # Stop VM (save costs)
│   └── azure-redeploy.sh  # Pull latest & rebuild
├── docker-compose.yml
├── .env.example
└── REQUIREMENTS.md      # Detailed requirements specification
```

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Custom User model (email-only)** | Django best practice — must be set before first migration. Matches spec requirement of email-only auth. |
| **Token authentication** | Simple and sufficient for this scope. DRF's built-in TokenAuthentication stores tokens in the database. |
| **Debounced auto-save (300ms)** | Balances responsiveness with API call volume. Pending saves flush on editor close. |
| **Category note_count via DB annotation** | Uses `Count('notes')` annotation in queryset instead of per-instance queries. Avoids N+1 problem. |
| **SQLite fallback for local dev** | `DATABASE_URL=sqlite` env var switches to SQLite so developers don't need PostgreSQL locally. |
| **Tailwind CSS v4** | Utility-first CSS with design tokens defined in `@theme` block. Rapid styling matching the Figma spec. |

## AI Tools Used

This project was built with assistance from **Claude Code** (Anthropic's CLI for Claude). Claude was used for:
- Generating the requirements document from design specs and project briefs
- Scaffolding the Django backend and Next.js frontend
- Writing unit and integration tests
- Creating Docker configuration
- Writing this README

## Process Summary

1. **Requirements gathering** — Exported Figma designs and project briefs as offline references
2. **Specification writing** — Created a detailed REQUIREMENTS.md with data models, API endpoints, UI specs, and interaction flows
3. **Backend-first approach** — Built Django models, serializers, views, and tests before touching the frontend
4. **Frontend implementation** — Next.js App Router with TypeScript, Tailwind, and component-based architecture
5. **Dockerization** — Multi-container setup with PostgreSQL, Django, and Next.js
6. **Documentation** — README with setup instructions, API examples, and architecture decisions
