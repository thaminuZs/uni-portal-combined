# UniPortal

Web portal for university operations: dashboards for campus services (lecturers, canteens, libraries), user registration and login, and role-specific admin or student views. This repository contains a **Next.js** web app and a **Docker-based** backend under `backend/`.

## Repository layout

| Path | Description |
|------|-------------|
| `frontend/` | Next.js application (UI) |
| `backend/src/` | Gateway, microservices, and `docker-compose.yml` |

---

## Frontend

The UI lives in **`frontend/`**. It is a [Next.js](https://nextjs.org/) **16** app using the App Router, [React](https://react.dev/) **19**, and [TypeScript](https://www.typescriptlang.org/).

### Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, [Tailwind CSS](https://tailwindcss.com/) v4 (via `@tailwindcss/postcss`)
- **Motion:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Fonts:** [Geist](https://vercel.com/font) (Sans + Mono) via `next/font`
- **Linting:** ESLint 9 with `eslint-config-next`

### App routes

| Route | Purpose |
|-------|---------|
| `/` | Home dashboard; loads summary data and renders **Admin** or **Student** dashboards after login |
| `/login` | Sign in |
| `/register` | Create an account |

### Source layout

- `frontend/src/app/` — `layout.tsx`, global styles, and route segments (`page.tsx` per route)
- `frontend/src/components/` — `AdminDashboard.tsx`, `StudentDashboard.tsx` (forms and tables that call the backend)

### API usage from the browser

Client components call the backend gateway over HTTP. The codebase currently targets:

**`http://localhost:8080`** (path prefix **`/api/...`**).

Run the Docker stack so the gateway is listening on port **8080** before using the dashboard or auth flows from the UI.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended; aligns with Next.js 16)
- npm (lockfile: `frontend/package-lock.json`)

### Install and run (development)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build    # production build
npm run start    # run production server (after build)
npm run lint     # ESLint
```

### Path alias

TypeScript resolves `@/*` to `frontend/src/*` (see `frontend/tsconfig.json`).

---

## Backend (Docker)

Services are defined in **`backend/src/docker-compose.yml`**. You need [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/).

```bash
cd backend/src
docker compose build
docker compose up -d
```

Useful ports on the host:

| Port | Service |
|------|---------|
| **8080** | API gateway (what the frontend calls) |
| **8888** | [Dozzle](https://dozzle.dev/) log viewer |
| **28015** | MongoDB (mapped from the container’s `27017`) |

Configure secrets (for example `JWT_SECRET` in Compose and in service env blocks) before any shared or production deployment.

---

## API surface (quick reference)

All routes below go through the gateway at **`http://localhost:8080`**.

| Area | Base path |
|------|-----------|
| Dashboard | `GET /api/dashboard` |
| Auth | `/api/auth` (e.g. register, login) |
| Lecturers | `/api/lecturers` |
| Canteens | `/api/canteens` |
| Libraries | `/api/libraries` |

For request and response shapes, inspect the individual service handlers under `backend/src/services/` or the gateway routing under `backend/src/gateway/`.

---

## License

Specify your license here if the project is published.
