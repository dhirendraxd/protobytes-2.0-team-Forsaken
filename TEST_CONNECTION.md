# Testing Frontend & Backend Connection

This guide will help you verify that the frontend and backend are working and properly connected.

## ✅ Prerequisites

- Both `frontend` and `backend` directories have `node_modules` installed
- You're ready to start development

## 🚀 Step 1: Start the Backend

```bash
cd backend
npm run dev
```

**Expected Output:**
```
> backend@0.1.0 dev
> ts-node-dev --respawn --transpile-only src/index.ts

⚠️ Firebase Admin not configured. Backend will run in offline mode...
🚀 Server is running on port 3000
📡 API available at http://localhost:3000
🌍 Environment: development
```

**What this means:**
- ✅ Backend is running on port 3000
- ⚠️ Firebase is in offline mode (this is expected without credentials)
- ✅ The `/health` endpoint is available

## ✅ Step 2: Test Health Endpoint

In a new terminal, test if the backend is responding:

```bash
curl http://localhost:3000/health
```

Or use Postman/Insomnia to test:
```
GET http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Village Voice Hub API is running",
  "timestamp": "2026-02-12T12:34:56.789Z"
}
```

## 🚀 Step 3: Start the Frontend

In another new terminal:

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.1.0 ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## ✅ Step 4: Check Connection Status

1. Open browser to `http://localhost:5173`
2. Look at the **bottom-right corner** of the screen
3. You should see a **green indicator** with "Backend connected" ✅

**Indicators:**
- 🟢 **Green - "Backend connected"** → Successfully connected!
- 🔴 **Red - Error message** → Connection failed (see troubleshooting)
- 🔵 **Blue - "Checking..."** → Still checking connection

## 📊 Step 5: Test API Endpoints

### Test Market Prices Endpoint

```bash
# In terminal or Postman
curl http://localhost:3000/api/market-prices

# Or with filters
curl "http://localhost:3000/api/market-prices?limit=10&category=rice"
```

**Expected Response (in offline mode):**
```json
{
  "error": "Firebase Admin not configured"
}
```

**This is normal!** The endpoint works, but returns an error because Firebase isn't configured. Once you add credentials, it will return real data.

### Test Other Endpoints

```bash
# Transport schedules
curl http://localhost:3000/api/transport

# Alerts
curl http://localhost:3000/api/alerts

# Authentication
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## ✅ Connection Test Summary

If you see all of these, the connection is working:

1. ✅ Backend server starts on port 3000
2. ✅ `/health` endpoint returns 200 OK
3. ✅ Frontend shows green "Backend connected" indicator
4. ✅ API endpoints respond (even with Firebase errors)
5. ✅ Frontend can fetch data from backend

## 🔧 Troubleshooting

### Backend won't start

**Error:** `Port 3000 already in use`
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or change port in backend/.env
PORT=3001
```

**Error:** `Cannot find module`
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules
npm install
npm run dev
```

### Frontend shows red error

**Error:** "Backend connection failed"

**Solution:**
1. Verify backend is running: `curl http://localhost:3000/health`
2. Check frontend `.env` has correct API URL:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
3. Check browser console for network errors (F12 → Network tab)
4. Verify CORS is enabled in backend (it should be by default)

### Frontend can't start

**Error:** `Port 5173 already in use`
```bash
# Kill the process
lsof -i :5173
kill -9 <PID>

# Or change port in frontend package.json
npm run dev -- --port 5174
```

**Error:** `Module not found`
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

## 🎯 Next Steps After Connection Test

Once connection is verified:

1. **Add Firebase Credentials:**
   - Get credentials from Firebase Console
   - Add to `backend/.env` and `frontend/.env`
   - Restart backend to initialize Firebase

2. **Test Data Endpoints:**
   ```bash
   # Add market price data
   curl -X POST http://localhost:3000/api/market-prices \
     -H "Content-Type: application/json" \
     -d '{
       "commodity": "Rice",
       "price": 1500,
       "unit": "kg",
       "market": "Kalimati"
     }'
   ```

3. **Explore Frontend Pages:**
   - Visit Market Prices page
   - Check Transport Schedules
   - View Community Alerts

## 📊 Architecture Diagram

```
Frontend (React)          Backend (Express)       Firebase
Port 5173                 Port 3000               Cloud
├─ http://localhost:5173  │                       │
│  ├─ App.tsx            ├─ /health          ├─ Firestore
│  ├─ Services/          ├─ /api/market-prices   ├─ Auth
│  │  └─ apiClient.ts    ├─ /api/transport       └─ Storage
│  └─ Hooks/             ├─ /api/alerts
│     └─ useApi.ts       └─ /api/auth
│
└─────────────────────────────────────────────────────
        axios requests with CORS
```

## 🔐 Security Notes

- ✅ CORS is configured to allow `http://localhost:5173`
- ✅ Requests include `Content-Type: application/json`
- ✅ Auth tokens are stored in localStorage
- ⚠️ Don't commit `.env` files with real credentials
- ⚠️ Use `.env.example` templates for reference

## 📝 Logs to Watch

**Backend logs to monitor:**
```
🚀 Server is running on port 3000
📡 API available at http://localhost:3000
GET /health 200
GET /api/market-prices 503 (Firebase not configured)
POST /api/auth/login 400 (Missing email/password)
```

**Frontend logs (Console - F12):**
```
Connection status: connected
Fetching market prices...
API error: Firebase not configured
```

---

## ✨ Success Criteria

Your setup is working if:

- [ ] Backend starts without errors
- [ ] `/health` endpoint returns 200
- [ ] Frontend shows green connection indicator
- [ ] No network errors in browser console
- [ ] No error logs in terminal

**Congratulations! 🎉 Frontend and backend are connected and ready for development!**

---

For more details, see:
- [DEVELOPMENT.md](../DEVELOPMENT.md) - Development guide
- [backend/SETUP.md](../backend/SETUP.md) - Backend API documentation
- [frontend/README.md](../frontend/README.md) - Frontend setup
