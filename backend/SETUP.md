# VoiceLink Backend Setup & API Documentation

## Prerequisites

- Node.js 16+ and npm
- Firebase project with credentials
- Optional: PostgreSQL and Redis (for production)

## Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from template:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173  # Frontend URL

# Firebase (required)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_email@appspot.gserviceaccount.com

# JWT & API
JWT_SECRET=your_secret_key
```

## Running the Backend

### Development Mode (with hot reload)
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```bash
GET /health
```
Response:
```json
{
  "status": "ok",
  "message": "Village Voice Hub API is running",
  "timestamp": "2026-02-12T00:00:00Z"
}
```

### Market Prices
```bash
# Get all prices
GET /api/market-prices?limit=50&category=rice&location=Kathmandu

# Get single price
GET /api/market-prices/:id

# Add new price (authenticated)
POST /api/market-prices
{
  "commodity": "Rice",
  "price": 1500,
  "unit": "kg",
  "market": "Kalimati",
  "category": "grain"
}

# Update price (authenticated)
PUT /api/market-prices/:id
```

### Transport Schedules
```bash
# Get all schedules
GET /api/transport?limit=50&route=Kathmandu-Pokhara

# Get single schedule
GET /api/transport/:id

# Add new schedule (authenticated)
POST /api/transport
{
  "route": "Kathmandu-Pokhara",
  "operator": "Sajha Yatayat",
  "departureTime": "08:00",
  "arrivalTime": "12:00",
  "fare": 300
}

# Update schedule (authenticated)
PUT /api/transport/:id
```

### Community Alerts
```bash
# Get all alerts
GET /api/alerts?limit=50&category=health

# Get single alert
GET /api/alerts/:id

# Add new alert (authenticated)
POST /api/alerts
{
  "title": "Flood Warning",
  "description": "Heavy rainfall expected",
  "severity": "high",
  "category": "weather",
  "location": "Kathmandu Valley"
}

# Update alert (authenticated)
PUT /api/alerts/:id
```

### Authentication
```bash
# Sign up
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}

# Logout
POST /api/auth/logout
```

### Contributors
```bash
# Get all contributors
GET /api/contributors

# Register as contributor (authenticated)
POST /api/contributors
{
  "name": "John Doe",
  "email": "john@example.com",
  "location": "Kathmandu",
  "phoneNumber": "+977-9841234567"
}
```

## Running Frontend & Backend Together

### Terminal 1 - Start Backend
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:3000`

### Terminal 2 - Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

The frontend will automatically connect to the backend at `http://localhost:3000/api`.

## Connection Status

The frontend displays a connection status indicator at the bottom-right corner:
- 🟢 **Green** - Backend is connected
- 🔴 **Red** - Backend is disconnected
- 🔵 **Blue** - Checking connection

## Testing the Connection

1. Ensure both services are running
2. Open `http://localhost:5173` in your browser
3. Check the connection status indicator in the bottom-right
4. Navigate to market prices, transport, or alerts pages to test data fetching

## Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is already in use
lsof -i :3000

# Change port in .env
PORT=3001
```

### Frontend can't connect to backend
- Verify backend is running: `http://localhost:3000/health`
- Check `VITE_API_URL` in frontend `.env` is correct
- Check CORS settings in backend (should allow `http://localhost:5173`)
- Check browser console for network errors

### Firebase errors
- Verify Firebase credentials in backend `.env`
- Check Firebase project has Firestore enabled
- Ensure collections exist in Firestore (marketPrices, transportSchedules, alerts)

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

## Database Schemas

### Market Prices Collection
```javascript
{
  id: string,
  commodity: string,
  price: number,
  unit: string,
  market: string,
  location: string,
  category: string,
  trend: 'up' | 'down' | 'stable',
  updatedAt: timestamp,
  createdAt: timestamp
}
```

### Transport Schedules Collection
```javascript
{
  id: string,
  route: string,
  operator: string,
  departureTime: string (HH:mm),
  arrivalTime: string (HH:mm),
  fare: number,
  capacity: number,
  frequency: string,
  delayStatus: boolean,
  delayMinutes: number,
  contactNumber: string,
  updatedAt: timestamp,
  createdAt: timestamp
}
```

### Alerts Collection
```javascript
{
  id: string,
  title: string,
  description: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  category: string,
  location: string,
  isActive: boolean,
  createdBy: string,
  expiresAt: timestamp,
  updatedAt: timestamp,
  createdAt: timestamp
}
```

## Next Steps

1. Set up authentication pages
2. Implement protected routes
3. Add form validation and error handling
4. Create admin dashboard for moderators
5. Implement real-time updates with Firestore listeners
6. Add IVR system integration

## Support

For issues or questions, please file an issue on GitHub.
