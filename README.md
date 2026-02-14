# VoiceLink Communication Platform

## Team Information

**Team Name**: Team Forsaken

**Team Members**:
- Dhiren - dhiren@example.com - dhirendraxd
- Ritendra - ritentam404@gmail.com - RitenTam
- Shishir - shishirjoshi65@gmail.com - Shishirjoshi
- Hitesh - hitesh18nayak@gmail.com - hitesh

## Project Details

**Project Title**: VoiceLink Communication Platform

**Category**: [x] Open Innovation

**Problem Statement**: SMEs and organizations lack affordable, easy-to-use communication platforms to reach their customers through multiple channels (SMS, voice calls). Current solutions are expensive, complex, and require technical expertise. VoiceLink solves this by providing a simple, pay-as-you-go platform for bulk communications with built-in analytics.

**Solution Overview**: VoiceLink is a cloud-based SaaS platform that empowers SMEs and organizations to send SMS, voice messages, and automated communications to their customers effortlessly. It offers bulk SMS sending, voice message campaigns, contact management, real-time analytics, team management, and multi-language support. Users can schedule campaigns, create message templates, receive two-way SMS, and segment contacts by demographics. With an intuitive dashboard and pay-as-you-go pricing model, VoiceLink makes professional communication accessible to businesses of all sizes.

## Technical Stack

**Frontend**: React, TypeScript, Vite, shadcn/ui, Tailwind CSS

**Backend**: Node.js, Express, Firebase

**Other Technologies**: Twilio API, React Router, TanStack Query, Firebase Authentication, Firestore

## Installation & Setup

Step-by-step instructions to run your project:

```bash
# Clone the repository
git clone https://github.com/dhirendraxd/protobytes-2.0-team-Forsaken.git

# Navigate to project
cd protobytes-2.0-team-Forsaken

# Install dependencies
npm install

# Start development server
npm run dev
```

### Firebase Setup

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


## Demo

[https://protobytes-2-0-team-forsaken.vercel.app/]

---

Built with ❤️ by Team Forsaken in Nepal
