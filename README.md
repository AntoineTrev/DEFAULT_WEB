# Fullstack Vue 3 + PocketBase Project

This repository contains a fullstack web application with a **Vue 3 frontend** and a **PocketBase backend**, fully containerized with Docker and orchestrated via Docker Compose. Pre-commit hooks, linting, formatting, and type-checking are included.

---

## Project Structure

```
.
├── README.md
├── backend
├── docker-compose.yml
├── .env.template
└── frontend
```

* `frontend/` – Vue 3 app (Vite + TypeScript)
* `backend/` – PocketBase with custom entrypoint
* `docker-compose.yml` – Docker Compose configuration for dev/prod
* `.env.template` – Environment variables

---

## Environment Variables

Create a `.env` file at the root of the project base on `.env.template`:

```env
# Frontend
FRONTEND_PORT=8080
FRONTEND_OPEN_BROWSER=false

# Backend
BACKEND_PORT=8081
BACKEND_ADMIN_EMAIL=
BACKEND_ADMIN_PASSWORD=
```

---

## Requirements

* [Node.js](https://nodejs.org/) >= 20
* [Yarn](https://yarnpkg.com/)
* [Docker](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/)

---

## Building for Production

### Docker Dev (with users fixtures)

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Docker Prod

```bash
docker-compose -f docker-compose.prod.yml up --build
```

* Frontend: `http://localhost:8080`
* Backend: `http://localhost:8081`

---

## Pre-commit & Code Quality

This project uses **Husky**, **Lint-Staged**, **ESLint**, and **Prettier**:

* Automatically run formatting, linting, and type-checking before commits.
* Run manually:

```bash
# Format code
yarn format

# Lint code
yarn lint

# Type-check
yarn typecheck
```
