import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Mock Firebase
jest.mock('@/config/firebase', () => ({
  auth: {},
  db: {},
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Call callback with null user initially
    callback(null);
    return jest.fn(); // Unsubscribe function
  }),
  updateProfile: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('should render children', () => {
      render(
        <AuthProvider>
          <div>Test Child</div>
        </AuthProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should provide initial context values', async () => {
      const TestComponent = () => {
        const { user, loading } = useAuth();
        return <div>{loading ? 'Loading' : 'Loaded'}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Loaded')).toBeInTheDocument();
      });
    });
  });

  describe('useAuth Hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const TestComponent = () => {
        useAuth();
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });

    it('should provide auth functions', () => {
      const TestComponent = () => {
        const { signUp, signIn, signOut } = useAuth();

        return (
          <div>
            <button onClick={() => signUp('email', 'pass', 'name')}>Sign Up</button>
            <button onClick={() => signIn('email', 'pass')}>Sign In</button>
            <button onClick={() => signOut()}>Sign Out</button>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    it('should provide user and profile context', async () => {
      const TestComponent = () => {
        const { user, userProfile, isModerator, loading } = useAuth();

        if (loading) return <div>Loading...</div>;

        return (
          <div>
            <div>User: {user ? 'Present' : 'Not Present'}</div>
            <div>Profile: {userProfile ? 'Present' : 'Not Present'}</div>
            <div>Moderator: {isModerator ? 'Yes' : 'No'}</div>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/user: not present/i)).toBeInTheDocument();
        expect(screen.getByText(/profile: not present/i)).toBeInTheDocument();
        expect(screen.getByText(/moderator: no/i)).toBeInTheDocument();
      });
    });

    it('should provide signOut function', async () => {
      const TestComponent = () => {
        const { signOut } = useAuth();

        return (
          <button onClick={() => signOut()}>Sign Out</button>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      expect(signOutButton).toBeInTheDocument();

      await act(async () => {
        signOutButton.click();
      });

      // signOut should have cleared localStorage
      expect(localStorage.getItem('isLoggedIn')).toBeNull();
    });
  });
});
