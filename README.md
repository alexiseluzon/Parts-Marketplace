# Parts Marketplace — Practice Project

Full-stack CRUD app built to match Inclusion Cloud's Full-Stack Engineer JD:
React, GraphQL, Node.js, TypeScript, auth/authz, cookies & headers.

No database — data lives in memory on the backend and resets on restart.

## Run it

**Terminal 1 — backend**
```
cd backend
cp .env.example .env
npm install
npm run dev
```
Runs at http://localhost:4000/graphql

**Terminal 2 — frontend**
```
cd frontend
npm install
npm run dev
```
Runs at http://localhost:5173

Open http://localhost:5173, register an account, then add/edit/delete parts.
Open DevTools → Application → Cookies to see the httpOnly session cookie,
and Network tab to see the GraphQL requests/headers.

## Stack

- Backend: Express + Apollo Server (GraphQL) + TypeScript, JWT auth via httpOnly cookie
- Frontend: React + TypeScript + Vite, Apollo Client, React Router
