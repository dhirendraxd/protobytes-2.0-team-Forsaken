import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, updateProfile, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setError('Firebase not initialized');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateUserProfile = async (
    displayName: string,
    photoURL?: string
  ) => {
    if (!user) throw new Error('No user logged in');
    try {
      await updateProfile(user, { displayName, photoURL });
      setUser({ ...user, displayName, photoURL: photoURL || null });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    updateUserProfile,
    logout,
    isAuthenticated: !!user,
  };
}
