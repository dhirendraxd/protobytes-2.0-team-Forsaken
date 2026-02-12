# VoiceLink Development Setup Guide

A community information system for rural villages in Nepal combining voice-based (IVR) and web-based interfaces.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ with npm
- Firebase account
- Git

### Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd protobytes-2.0-team-Forsaken
```

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add Firebase credentials to .env
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_PROJECT_ID=...
# (get from Firebase Console)

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

#### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add Firebase credentials to .env
# FIREBASE_PROJECT_ID=...
# FIREBASE_PRIVATE_KEY=...
# FIREBASE_CLIENT_EMAIL=...

# Start development server
npm run dev
```

Backend runs at: `http://localhost:3000`

---

## 📁 Project Structure

```
├── frontend/                 # React + TypeScript Web App
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client & Firebase services
│   │   ├── types/           # TypeScript type definitions
│   │   └── App.tsx          # Main app component
│   └── package.json
│
├── backend/                  # Express.js API Server
│   ├── routes/              # API route handlers
│   ├── middleware/          # Express middleware
│   ├── config/              # Configuration files
│   ├── controllers/         # Business logic
│   ├── index.js            # Server entry point
│   └── package.json
│
├── README.md               # Project documentation
└── gitpush-guidlines       # Git commit guidelines
```

---

## 🔧 Development Workflow

### Running Both Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Frontend Features

- ✅ React 18 + TypeScript
- ✅ Tailwind CSS styling
- ✅ shadcn/ui components
- ✅ Firebase authentication
- ✅ TanStack Query for data fetching
- ✅ Responsive design

**Available Pages:**
- Home page with feature overview
- Market prices dashboard
- Transport schedules
- Community alerts
- User dashboard
- Moderator dashboard
- Authentication pages

### Backend API Endpoints

**Health Check:**
```bash
GET /health
```

**Market Prices:**
```bash
GET    /api/market-prices           # List prices
GET    /api/market-prices/:id       # Single price
POST   /api/market-prices           # Add price
PUT    /api/market-prices/:id       # Update price
```

**Transport:**
```bash
GET    /api/transport               # List schedules
GET    /api/transport/:id           # Single schedule
POST   /api/transport               # Add schedule
PUT    /api/transport/:id           # Update schedule
```

**Alerts:**
```bash
GET    /api/alerts                  # List alerts
GET    /api/alerts/:id              # Single alert
POST   /api/alerts                  # Add alert
PUT    /api/alerts/:id              # Update alert
```

**Authentication:**
```bash
POST   /api/auth/signup             # Register
POST   /api/auth/login              # Login
POST   /api/auth/logout             # Logout
```

---

## 🔐 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_AUTH_DOMAIN=...
```

### Backend (.env)
```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
JWT_SECRET=your_secret_key
```

---

## 🧪 Testing

### Frontend
```bash
cd frontend
npm run lint      # Run ESLint
npm run build     # Build for production
```

### Backend
```bash
cd backend
npm run lint      # Run ESLint
npm run test      # Run tests
npm run build     # Build TypeScript
```

---

## 📦 Build & Deploy

### Frontend Build
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Backend Build
```bash
cd backend
npm run build
npm start
```

---

## 🤝 Git Workflow

Follow commit guidelines from `gitpush-guidlines` file:

```bash
# Example commits:
git commit -m "feat(frontend): add market prices page"
git commit -m "fix(api): handle empty response"
git commit -m "docs: update setup instructions"
```

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
- ✓ Check backend is running on port 3000
- ✓ Verify `VITE_API_URL` in frontend `.env`
- ✓ Check CORS configuration in backend
- ✓ Look for errors in browser console

### Firebase not working
- ✓ Verify credentials in `.env` files
- ✓ Ensure Firebase project has Firestore enabled
- ✓ Check that required collections exist
- ✓ Review Firestore security rules

### Port conflicts
```bash
# Find process using port
lsof -i :3000        # Backend
lsof -i :5173        # Frontend

# Kill process
kill -9 <PID>
```

---

## 📚 Documentation

- **Backend Setup:** See [backend/SETUP.md](backend/SETUP.md)
- **Frontend README:** See [frontend/README.md](frontend/README.md)
- **Project Details:** See [README.md](README.md)

---

## 📋 Features Roadmap

### Phase 1 (Current)
- ✅ React frontend setup
- ✅ Express backend setup
- ✅ Firebase integration
- ✅ API connection
- ⭐ User authentication

### Phase 2
- Community alert system
- Market price tracking
- Transport schedule management
- Contributor dashboard

### Phase 3
- IVR system integration
- Real-time notifications
- Admin dashboard
- Analytics & reporting

---

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com)
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)

---

## 💡 Tips

1. **Check Connection:** Backend status is shown in frontend (bottom-right corner)
2. **Hot Reload:** Both services support automatic reloading on file changes
3. **API Testing:** Use tools like Postman or curl to test backend endpoints
4. **Console Logs:** Check both browser and terminal console for errors

---

## ⚡ Quick Commands

```bash
# Start everything
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Build for production
cd frontend && npm run build
cd backend && npm run build

# Clean dependencies
rm -rf frontend/node_modules
rm -rf backend/node_modules
npm install (in both directories)
```

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review backend/SETUP.md for API details
3. Check frontend/README.md for frontend setup
4. File an issue on GitHub

---

**Happy Coding! 🚀**

Last Updated: February 12, 2026
