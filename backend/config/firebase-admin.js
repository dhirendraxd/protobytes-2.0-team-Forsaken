const admin = require('firebase-admin');

const hasEnvConfig = Boolean(
  process.env.FIREBASE_SERVICE_ACCOUNT ||
  (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)
);

// Provide a lightweight stub so the backend can start without Firebase creds.
if (!hasEnvConfig) {
  console.warn('⚠️ Firebase Admin not configured. Backend will run in offline mode; protected routes will return 503.');
  const missingCredError = () => {
    const err = new Error('Firebase Admin not configured');
    err.status = 503;
    err.statusCode = 503;
    return err;
  };

  module.exports = {
    firebaseAvailable: false,
    auth: () => ({
      verifyIdToken: async () => { throw missingCredError(); },
      getUser: async () => { throw missingCredError(); },
    }),
    firestore: () => ({
      collection: () => { throw missingCredError(); },
    }),
  };
  return;
}

// Initialize Firebase Admin SDK when credentials are present
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n'),
        };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
  }
}

admin.firebaseAvailable = true;

module.exports = admin;
