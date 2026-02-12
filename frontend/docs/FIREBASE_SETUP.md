# Firebase Setup Guide for VoiceLink

This document explains how to set up Firebase for the VoiceLink project.

## Prerequisites

- Firebase project created at [Firebase Console](https://console.firebase.google.com)
- Firebase account

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Create a project**
3. Name it something like `voicelink-dev` or `voicelink-prod`
4. Accept the default settings and create the project

### 2. Get Firebase Credentials

1. In your Firebase project, click the **Settings** icon (gear) > **Project settings**
2. Go to the **General** tab
3. Scroll down to find your **Web app** configuration
4. Copy the following values to your `.env` file:
   - `apiKey` → `VITE_FIREBASE_API_KEY`
   - `authDomain` → `VITE_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `VITE_FIREBASE_PROJECT_ID`
   - `storageBucket` → `VITE_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `VITE_FIREBASE_APP_ID`

### 3. Enable Firebase Services

#### Authentication
1. Go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - Email/Password
   - Google (optional)
   - Phone Number (optional)

#### Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **Production mode** (we'll adjust rules later)
4. Select your region (recommended: Asia Southeast 1)
5. Create the database

#### Cloud Storage
1. Go to **Storage**
2. Click **Get started**
3. Start in **Production mode**
4. Accept default settings

### 4. Set Up Firestore Collections

Create the following collections in Firestore (empty collections are fine for now):

- `marketPrices` - Market price information
- `transportSchedules` - Transport schedules and routes
- `alerts` - Community alerts and announcements
- `users` - User profiles
- `reporters` - Community contributor information
- `feedback` - User feedback

### 5. Configure Firestore Rules

Replace the default Firestore rules with appropriate rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access for market prices and schedules
    match /marketPrices/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['moderator', 'admin'];
    }
    
    match /transportSchedules/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['moderator', 'admin'];
    }
    
    match /alerts/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['moderator', 'admin'];
    }
    
    // User documents
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth != null;
    }
    
    // Reporters
    match /reporters/{document=**} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId || request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['moderator', 'admin'];
    }
    
    // Feedback
    match /feedback/{document=**} {
      allow create: if true;
      allow read, update, delete: if request.auth.uid == resource.data.userId || request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin'];
    }
  }
}
```

### 6. Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your Firebase credentials

### 7. Test Firebase Connection

The app will automatically:
- Initialize Firebase on startup
- Check for required environment variables
- Only proceed if credentials are provided

If credentials are missing, the app will log an error but won't crash.

## Using Firebase in Components

### Example 1: Using useAuth Hook

```tsx
import { useAuth } from '@/hooks/useAuth';

export function UserProfile() {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user?.displayName}</div>;
}
```

### Example 2: Fetching Market Prices

```tsx
import { marketPriceService } from '@/services/firebaseService';
import { useQuery } from '@tanstack/react-query';

export function MarketPrices() {
  const { data, isLoading } = useQuery({
    queryKey: ['marketPrices'],
    queryFn: () => marketPriceService.getPrices(),
  });
  
  if (isLoading) return <div>Loading prices...</div>;
  
  return (
    <div>
      {data?.map(price => (
        <div key={price.id}>{price.commodity}: {price.price}</div>
      ))}
    </div>
  );
}
```

### Example 3: Adding Alerts

```tsx
import { alertService } from '@/services/firebaseService';

export async function addCommunityAlert(alertData: any) {
  try {
    const id = `alert_${Date.now()}`;
    await alertService.addAlert(id, alertData);
    console.log('Alert added successfully');
  } catch (error) {
    console.error('Failed to add alert:', error);
  }
}
```

## Troubleshooting

### Firebase not initializing?
- Check that all environment variables are filled
- Verify credentials are correct in Firebase Console
- Check browser console for specific errors

### Permission denied errors?
- Review Firestore rules - they may be too restrictive
- Ensure user is authenticated for write operations
- Check user role in Firestore users collection

### Data not loading?
- Verify Firestore collections exist
- Check data permissions in Firestore rules
- Ensure app is using correct Firebase project

## Next Steps

1. Set up authentication screens
2. Create protected routes
3. Add admin panel for moderators
4. Implement real-time listeners with Firestore
5. Set up Cloud Functions for backend logic

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Storage](https://firebase.google.com/docs/storage)
