# VoiceLink

A voice-based community information system for rural villages in Nepal. Provides critical information to communities without requiring internet access.

## Project Overview

**VoiceLink** bridges the digital divide by offering both:
- **Voice-based IVR system** - No internet needed, just call
- **Web interface** - For those with internet access

## Features

### User Features
- 📞 Voice-based information access (IVR system)
- 📊 Real-time market prices
- 🚌 Transport schedules with delay alerts
- 📢 Community alerts and announcements
- 👥 Community reporter network
- 🌐 Dual language support (English & Nepali)

### Moderator Portal Features ✨
- 📝 **Weekly Briefings Management** - Create/edit IVR content with text, audio, or TTS
- 📱 **SMS Alert Center** - Send urgent notifications with cost estimation
- ✅ **Content Approval Workflow** - Review and approve community submissions
- 📁 **Category Manager** - Organize content categories for IVR navigation
- 🌍 **Region-Based Targeting** - Tailor content to specific geographic areas

> **Access**: Navigate to `/moderator` when logged in to manage community content

For detailed moderator documentation, see [MODERATOR_PORTAL_DOCS.md](MODERATOR_PORTAL_DOCS.md)

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Cloud Functions)
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

Firebase is already configured with credentials. You just need to enable services:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Open project: **yadu-portfolio**
3. Enable **Authentication** (Email/Password)
4. Create **Firestore Database**
5. Add sample data to collections (see `FIREBASE_SETUP.md`)

**No environment variables needed** - credentials are in `src/config/firebase.ts`

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
