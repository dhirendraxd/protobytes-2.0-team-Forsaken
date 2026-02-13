# VoiceLink Communication Platform

A cloud-based SaaS platform that empowers SMEs and organizations to send SMS, voice messages, and automated communications to their customers effortlessly.

## Project Overview

**VoiceLink** is your complete communication solution offering:
- **SMS Campaigns** - Bulk SMS sending to unlimited contacts
- **Voice Messages** - Automated voicemail delivery
- **Contact Management** - Import and organize your customer database
- **Analytics Dashboard** - Track delivery, engagement, and ROI

## Features

### Core Platform Features
- 📱 **Bulk SMS Sending** - Send personalized SMS to thousands at once
- 🎤 **Voice Message Campaigns** - Upload audio or use text-to-speech
- 📊 **Contact List Management** - Import CSV, organize by groups
- 📈 **Real-time Analytics** - Track delivery status and engagement
- 💰 **Pay-as-you-go Pricing** - No subscriptions, only pay for what you send
- 🔒 **Secure & Reliable** - Enterprise-grade infrastructure

### Business Tools
- 📝 **Message Templates** - Save and reuse common messages
- ⏰ **Schedule Campaigns** - Send at optimal times
- 👥 **Team Management** - Multiple users with role-based access
- 🌍 **Multi-language Support** - Communicate in your customers' language
- 📞 **Two-way SMS** - Receive replies and engage in conversations
- 🎯 **Targeted Campaigns** - Segment contacts by demographics

> **Get Started**: Sign up at `/auth` and start sending messages in minutes

For API documentation and integration guides, see [API_DOCS.md](API_DOCS.md)

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Node.js + Express + Firebase
- **Database**: PostgreSQL + Redis (caching)
- **SMS/Voice**: Twilio API integration
- **Routing**: React Router
- **State**: TanStack Query

## Getting Started

### Prerequisites

- Node.js & npm installed ([nvm recommended](https://github.com/nvm-sh/nvm))
- Firebase account

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project
cd village-voice-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

### Firebase Setup

Use environment variables for Firebase in local and production:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password + Google if used)
3. Create **Firestore Database**
4. Add your Firebase web config values to `frontend/.env` (local) and Vercel env vars (prod)

Required variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### Vercel Deployment (Production)

1. Import this repo in Vercel.
2. Set **Root Directory** to project root (keep `vercel.json` in root).
3. Add all `VITE_FIREBASE_*` variables in Vercel Project Settings -> Environment Variables.
4. In Firebase Authentication -> Settings -> Authorized domains, add:
- your Vercel domain (e.g. `your-app.vercel.app`)
- any custom domain you attach
5. Deploy.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/      # Reusable UI components
├── contexts/        # React contexts (Auth, etc.)
├── hooks/          # Custom hooks
├── lib/            # Utilities
├── pages/          # Route components
└── config/         # Configuration files
```

## IVR System

When users call the hotline:
- **Press 1**: Market prices
- **Press 2**: Transport schedules  
- **Press 3**: Local alerts
- **Press 4**: Leave voice message

## Contributing

This is a community-driven project aimed at empowering rural communities. Contributions are welcome!

## License

MIT

---

Built with ❤️ for rural communities in Nepal
