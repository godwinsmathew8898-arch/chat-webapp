# Authentication deployment settings

## Local development

Keep `frontend/.env` set to:

```env
VITE_API_URL=http://localhost:5000
```

Use `backend/.env.example` as the backend settings template. Fill in your MongoDB Atlas URI and token secrets privately. Start the backend from `backend/` with `npm run dev` and the frontend from `frontend/` with `npm run dev`. Open `http://localhost:5173`.

The local backend uses `PORT=5000`, `CLIENT_URL=http://localhost:5173`, and `NODE_ENV=development`. Refresh cookies use HttpOnly, SameSite=Lax, and no Secure flag locally.

## Render backend

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Set `CLIENT_URL=https://chat-webapp-phi.vercel.app` (no trailing slash).
- Set `NODE_ENV=production`.
- Set `MONGO_URI`, `ACCESS_TOKEN_SECRET`, and `REFRESH_TOKEN_SECRET` privately in Render's Environment settings.
- Leave `PORT` to Render; the server reads `process.env.PORT`.
- Keep the service's outbound IP ranges active in MongoDB Atlas's IP access list.

The production refresh cookie uses HttpOnly, Secure, SameSite=None, Path=/, and a seven-day lifetime. Logout uses the same cookie scope and security options, with an expired lifetime instead.

## Vercel frontend

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL=https://web-chatapp-ar79.onrender.com` (no trailing slash) for the production environment.
- Redeploy after changing the variable: Vite embeds it during the build.

The local `.env` files are ignored by Git. Do not upload them or place backend secrets in `VITE_` variables, which are exposed in the browser bundle.

## Verify after deploying

1. Log in and check the login response has a `refreshToken` Set-Cookie header with HttpOnly, Secure, SameSite=None, and Path=/.
2. Refresh the page. `/api/auth/refresh` should send the cookie and return the user and access token; React restores them into memory.
3. Check protected requests use an Authorization: Bearer header and CORS responses allow the exact frontend origin with credentials.
4. Log out, then refresh. The cookie should be cleared and the login screen should remain visible.

The frontend never reads the HttpOnly cookie or stores the access token in localStorage. Browsers that block third-party cookies can still block cookies between the Vercel and Render domains even with SameSite=None; use the browser's cookie diagnostics to distinguish that from server errors.
