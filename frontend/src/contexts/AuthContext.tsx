import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

// User roles
export type UserRole = 'user' | 'contributor' | 'moderator' | 'admin' | 'viewer';

// Extended user profile
export interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  phone_number?: string;
  area_assigned?: string; // For community reporters
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isModerator: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toFriendlyAuthError = (error: unknown, fallbackMessage: string): Error => {
  const authError = error as { code?: string; message?: string } | null;
  const code = authError?.code || '';
  const message = authError?.message || '';

  if (code === 'auth/unauthorized-domain' || message.includes('auth/unauthorized-domain')) {
    return new Error(
      'This app domain is not authorized in Firebase Authentication. Add localhost and 127.0.0.1 to Firebase Console -> Authentication -> Settings -> Authorized domains.'
    );
  }

  return error instanceof Error ? error : new Error(fallbackMessage);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isModerator = userProfile?.role === 'moderator';

  useEffect(() => {
    if (!auth) {
      setUser(null);
      setUserProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Fetch user profile from Firestore
          const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data() as UserProfile);
          }
        } catch (error) {
          console.warn('Profile lookup failed; continuing in offline/unauthenticated mode.', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      if (!auth || !db) {
        return { error: new Error('Firebase not initialized') };
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: fullName
      });

      // Create user profile document in Firestore with base role 'user'
      const profile: UserProfile = {
        user_id: userCredential.user.uid,
        full_name: fullName,
        email: email,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await setDoc(doc(db, 'profiles', userCredential.user.uid), profile);
      setUserProfile(profile);

      return { error: null };
    } catch (error) {
      const authError = toFriendlyAuthError(error, 'Sign up failed');
      return { error: authError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!auth) {
        return { error: new Error('Firebase not initialized') };
      }
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('isLoggedIn', 'true');
      
      return { error: null };
    } catch (error) {
      const authError = toFriendlyAuthError(error, 'Sign in failed');
      return { error: authError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (!auth || !db) {
        return { error: new Error('Firebase not initialized') };
      }
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const profileRef = doc(db, 'profiles', result.user.uid);
      const profileSnap = await getDoc(profileRef);
      if (!profileSnap.exists()) {
        const profile: UserProfile = {
          user_id: result.user.uid,
          full_name: result.user.displayName || result.user.email || 'User',
          email: result.user.email || '',
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await setDoc(profileRef, profile);
        setUserProfile(profile);
      }

      localStorage.setItem('isLoggedIn', 'true');
      return { error: null };
    } catch (error) {
      const authError = toFriendlyAuthError(error, 'Google sign in failed');
      return { error: authError };
    }
  };

  const signOut = async () => {
    try {
      if (!auth) {
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/';
        return;
      }
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, isModerator, signUp, signIn, signInWithGoogle, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
