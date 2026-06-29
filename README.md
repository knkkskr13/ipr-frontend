# IPRMS Frontend

Frontend for the **Immovable Property Returns Management System (IPRMS)** —
a compliance tool for the Government of Tripura implementing Rule-18 of the
Tripura Civil Services (Conduct) Rules, 1988.

Built with **Vite + React + TypeScript + Tailwind CSS v4**, talking to a
Spring Boot backend (`ipr-backend`) over a JSON REST API secured with JWT.

## Stack

- Vite 8 + React 19 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- React Router v7
- Axios

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies all `/api/*`
requests to the backend at `http://localhost:8081` (see `vite.config.ts`).
Run the Spring Boot backend with the `dev` profile (default) on port 8081
and everything will just work — no CORS configuration needed in dev.

## Building for production

```bash
npm run build
```

Output goes to `dist/`. Serve it with any static file server, or behind the
same reverse proxy / domain as the backend so that `/api/v1/*` resolves to
the backend without CORS issues.

If the frontend and backend are deployed on **different origins**, set:

```
VITE_API_BASE_URL=https://your-backend-host.example.com
```

in a `.env` file (or your hosting provider's env settings) before building.
The backend's `CorsConfig` already allowlists `http://localhost:5173`,
`http://localhost:3000`, and a couple of production/ngrok origins — update
that list if you deploy somewhere else.

## Project structure

```
src/
  api/         Axios client + one module per backend resource
  components/  Shared UI (layout, buttons, form fields, modals, etc.)
  context/     AuthContext (JWT/session) and ToastContext (notifications)
  pages/       One file per route
  types/       TypeScript types mirroring every backend DTO exactly
  utils/       Formatting, JWT decoding, token storage, error helpers
```

## Roles & routes

| Role     | Routes |
|----------|--------|
| Employee | `/dashboard`, `/my-returns`, `/my-returns/new`, `/my-returns/:id` |
| Admin    | `/admin/dashboard`, `/admin/returns`, `/admin/returns/:id`, `/admin/employees`, `/admin/notifications` |

`/login` and `/register` are public. Everything else requires a valid JWT
(stored in `localStorage`) and routes you to the right dashboard based on
the `role` claim in the token.

## Notes

- The original design mockups reference an `Emblem_of_Tripura.png` asset
  that wasn't included with the design files. A stylised inline SVG emblem
  (`src/components/Emblem.tsx`) stands in for it — drop a real image into
  `public/` and swap the component's contents if you have one.
- IPR returns follow the status flow `DRAFT → SUBMITTED → APPROVED` (or
  `RETURNED`), matching the backend's `IprStatus` enum. Once submitted, a
  return becomes read-only to the employee; only an Admin can approve it.
- Filing (creating, editing, submitting an IPR return) is only allowed while
  an Admin-configured "filing window" notification is active and within its
  date range — mirroring the backend's `isFilingWindowOpen()` check.
