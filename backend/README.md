# Backend (Express)

This is a minimal Express.js backend skeleton for the project.

Quick start

1. Open a terminal and change to the backend directory:

```powershell
cd backend
```

2. Install dependencies:

```powershell
npm install
```

3. Start in development mode (requires `nodemon`):

```powershell
npm run dev
```

4. Or start production mode:

```powershell
npm start
```

Endpoints

- GET /health — returns { status: 'ok' }
- GET / — simple welcome message

TypeScript notes

This backend has been converted to TypeScript. Key scripts:

- `npm run dev` — run with ts-node-dev for development
- `npm run build` — compile to `dist/`
- `npm start` — run compiled `dist/index.js`
- `npm test` — run Jest tests (ts-jest)

Added routes:

- `GET /health` — health check
- `GET /api/users` — list users
- `GET /api/users/:id` — get user
- `POST /api/users` — create user
- `PUT /api/users/:id` — update user
- `DELETE /api/users/:id` — delete user
- `POST /api/users/login` — simple login by email (demo only)

To install dependencies and run tests:

```powershell
cd backend
npm install
npm run dev    # development
npm test       # run tests
```

Notes

- Add environment variables in a `.env` file and don't commit it.
- If you prefer TypeScript, I can convert this to a TypeScript-based server.
