# protobytes-2.0-team-Forsaken

## Team Information

### Team Name
Forsaken

### Team Members
- [Dhirendra] - [dhirendraxd@gmail.com] - [dhirendraxd]
- [Hitesh] - [Email] - [GitHub Username]
- [Ritendra] - [Email] - [GitHub Username]
- [Shishir] - [Email] - [GitHub Username]

---

## Project Details

### Project Title
VoiceLink

### Category
- [x] Open Innovation

### Problem Statement
Rural villages in Nepal face a significant information accessibility gap due to limited internet infrastructure, high data costs, and digital literacy barriers. Farmers cannot access current market prices before heading to markets, leading to unfavorable deals and exploitation by middlemen. Communities lack reliable access to transport schedules, emergency alerts, and critical announcements, leaving them isolated from vital information needed for informed decision-making.

### Solution Overview
VoiceLink is a dual-interface community information platform that bridges the digital divide by providing critical information through both voice-based (IVR) and web-based interfaces. The system enables communities without reliable internet to access real-time market prices, transport schedules, local alerts, and community announcements through simple phone calls on basic feature phones. Combined with a modern web dashboard for internet-enabled users, VoiceLink creates an inclusive, 24/7 accessible information ecosystem in Nepali and English, empowering rural communities with timely information while providing feedback channels for community-driven reporting.

---

## Technical Stack

### Frontend
React, TypeScript, Vite, shadcn/ui, Tailwind CSS

### Backend
Node.js, Express.js, Firebase

### Database
Firebase Firestore, PostgreSQL

### Other Technologies
IVR Systems (Twilio/Vonage), Redis (caching), i18next (internationalization), TanStack Query, Firebase Authentication

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
