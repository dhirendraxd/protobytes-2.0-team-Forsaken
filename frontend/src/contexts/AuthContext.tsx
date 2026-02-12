import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isModerator = userProfile?.role === 'moderator';

  useEffect(() => {
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
      const authError = error instanceof Error ? error : new Error('Sign up failed');
      return { error: authError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('isLoggedIn', 'true');
      
      return { error: null };
    } catch (error) {
      const authError = error instanceof Error ? error : new Error('Sign in failed');
      return { error: authError };
    }
  };

  const signOut = async () => {
    try {
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
    <AuthContext.Provider value={{ user, userProfile, isModerator, signUp, signIn, signOut, loading }}>
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
