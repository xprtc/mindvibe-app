import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  onAuthChange,
  getUserProfile,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  logout as firebaseLogout,
  completeOnboarding as firebaseCompleteOnboarding,
  handleRedirectResult,
  type UserProfile,
} from '../services/authService';

export type AppView = 'landing' | 'login' | 'loading';

export interface SessionUser {
  uid: string;
  name: string;
  email: string;
  onboardingDone: boolean;
}

interface SessionContextValue {
  user: SessionUser | null;
  loading: boolean;
  view: AppView;
  setView: (v: AppView) => void;
  loginEmail: (email: string, password: string) => Promise<void>;
  registerEmail: (email: string, password: string, name: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;
  authError: string | null;
  clearError: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppView>('loading');
  const [authError, setAuthError] = useState<string | null>(null);

  // Handle Google redirect result on mount
  useEffect(() => {
    handleRedirectResult().catch((err) =>
      console.warn('[MindVibe] Redirect check:', err)
    );
  }, []);

  // Listen for Firebase auth state changes
  useEffect(() => {
    // Hard timeout — never spin longer than 3s
    const timeout = setTimeout(() => {
      console.warn('[MindVibe] Auth timeout — showing landing page');
      setLoading(false);
    }, 3000);

    let cancelled = false;

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (cancelled) return;
      console.log('[MindVibe] Auth state:', firebaseUser ? firebaseUser.email : 'not logged in');

      if (firebaseUser) {
        // Use basic auth data immediately — don't wait for Firestore
        const basicUser = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          onboardingDone: true, // skip onboarding for existing Firebase users
        };

        if (!cancelled) {
          setUser(basicUser);
          clearTimeout(timeout);
          setLoading(false);
        }

        // Then try to load/create Firestore profile in background
        try {
          const profile = await getUserProfile(firebaseUser);
          if (!cancelled) {
            setUser({
              uid: profile.uid,
              name: profile.name,
              email: profile.email,
              onboardingDone: profile.onboardingDone,
            });
          }
        } catch (err) {
          console.warn('[MindVibe] Firestore profile sync failed (using auth data):', err);
        }
      } else {
        if (!cancelled) {
          setUser(null);
          clearTimeout(timeout);
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  // Update view based on auth state
  useEffect(() => {
    if (!loading && !user) {
      setView('landing');
    }
  }, [user, loading]);

  const clearError = useCallback(() => setAuthError(null), []);

  const handleLoginEmail = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    try {
      const profile = await loginWithEmail(email, password);
      setUser({
        uid: profile.uid,
        name: profile.name,
        email: profile.email,
        onboardingDone: profile.onboardingDone,
      });
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setAuthError('E-Mail oder Passwort falsch.');
      } else if (code === 'auth/wrong-password') {
        setAuthError('Passwort falsch.');
      } else {
        setAuthError('Anmeldung fehlgeschlagen. Versuche es nochmal.');
      }
      throw err;
    }
  }, []);

  const handleRegisterEmail = useCallback(async (email: string, password: string, name: string) => {
    setAuthError(null);
    try {
      const profile = await registerWithEmail(email, password, name);
      setUser({
        uid: profile.uid,
        name: profile.name,
        email: profile.email,
        onboardingDone: profile.onboardingDone,
      });
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setAuthError('Diese E-Mail ist bereits registriert.');
      } else if (code === 'auth/weak-password') {
        setAuthError('Passwort muss mindestens 6 Zeichen lang sein.');
      } else {
        setAuthError('Registrierung fehlgeschlagen.');
      }
      throw err;
    }
  }, []);

  const handleLoginGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      const profile = await loginWithGoogle();
      setUser({
        uid: profile.uid,
        name: profile.name,
        email: profile.email,
        onboardingDone: profile.onboardingDone,
      });
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError('Google-Anmeldung fehlgeschlagen.');
      }
      throw err;
    }
  }, []);

  const handleLogout = useCallback(() => {
    firebaseLogout();
    setUser(null);
    setView('landing');
  }, []);

  const handleCompleteOnboarding = useCallback(() => {
    if (!user) return;
    firebaseCompleteOnboarding(user.uid);
    setUser((prev) => prev ? { ...prev, onboardingDone: true } : prev);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      view,
      setView,
      loginEmail: handleLoginEmail,
      registerEmail: handleRegisterEmail,
      loginGoogle: handleLoginGoogle,
      logout: handleLogout,
      completeOnboarding: handleCompleteOnboarding,
      authError,
      clearError,
    }),
    [user, loading, view, handleLoginEmail, handleRegisterEmail, handleLoginGoogle, handleLogout, handleCompleteOnboarding, authError, clearError]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
