# VoiceLink Frontend

React + TypeScript + Vite application for VoiceLink community information system.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - UI component library (ready to add components)
- **TanStack Query** - Data fetching and state management
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration values

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
│   └── ui/        # shadcn/ui components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── services/      # API services and external integrations
├── lib/           # Utility functions
├── types/         # TypeScript type definitions
└── assets/        # Static assets
```

## Adding shadcn/ui Components

You can add shadcn/ui components manually  by copying from [shadcn/ui](https://ui.shadcn.com) into `src/components/ui/`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Environment Variables

See `.env.example` for all available environment variables.

## Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Manual Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

### Environment Variables Setup

Set the following environment variables in your Vercel project settings:

- `VITE_FIREBASE_API_KEY` - Your Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Your Firebase app ID

### Automatic Deployments

Once connected to Vercel, every push to the `main` branch will trigger an automatic deployment.

## Contributing

Follow the commit message guidelines in the root `gitpush-guidlines` file.
