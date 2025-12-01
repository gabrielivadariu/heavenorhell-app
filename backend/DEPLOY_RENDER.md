# Deploy backend on Render (HTTPS)

1) From `backend/`, init git if needed: `git init` (optional) and push to a repo (GitHub/GitLab) or use Render’s “Public Git Repository” URL.
2) In Render, create a **New Web Service**:
   - Repo: select your repo/branch that contains `/backend`.
   - Root: `/backend` (if asked).
   - Runtime: Node.
   - Build command: `npm install`.
   - Start command: `node index.js` (matching `Procfile`).
3) Environment variables (Render dashboard):
   - `OPENAI_API_KEY` = your key (required).
   - `PORT` = leave blank (Render injects it); we set a hint in `render.yaml`.
4) Deploy. Render will give you an HTTPS URL like `https://heaven-or-hell-api.onrender.com`.
5) Update the mobile app root `.env` with:  
   `EXPO_PUBLIC_API_BASE_URL=https://heaven-or-hell-api.onrender.com`
6) Rebuild the iOS app (Release/Archive) and upload to TestFlight/App Store Connect.

Notes:
- `Procfile` and `render.yaml` are included for Render; you can also use the “Blueprint” deploy with `render.yaml`.
- The backend loads `OPENAI_API_KEY` from env; no code changes needed.
