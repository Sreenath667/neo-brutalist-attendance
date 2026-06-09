# Neo Brutalist Attendance System

This project tracks attendance for B.Tech students with Google OAuth login.

Backend: Node.js + Express + MongoDB
Frontend: Simple static site with neo-brutalist styles

Setup:
- Copy `backend/.env.example` to `backend/.env` and fill values
- `cd backend && npm install`
- `npm run dev` to start server (or `npm start`)
- Serve frontend (e.g., `npx http-server frontend` or open `frontend/index.html`)

Publish to GitHub:

1. Create a new repository on GitHub (website or `gh repo create`).

2. From the project root, initialize git (if not already), commit, and push:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
# add your remote (SSH or HTTPS):
git remote add origin git@github.com:USERNAME/REPO.git
git push -u origin main
```

If you prefer HTTPS and GitHub requires a PAT, use:

```bash
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

Note: this repo includes a basic GitHub Actions workflow at `.github/workflows/nodejs.yml` that installs backend dependencies on push.

Local testing note:
- For quick local testing without a running MongoDB instance, set `SKIP_DB=true` in `backend/.env` (dev only) — the server will mock user data and attendance responses.


