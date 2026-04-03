import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  onboardingDone: boolean;
  createdAt: string;
}

// Register with email + password
export async function registerWithEmail(email: string, password: string, name: string): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  const profile: UserProfile = {
    uid: cred.user.uid,
    name,
    email,
    onboardingDone: false,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', cred.user.uid), profile);
  return profile;
}

// Login with email + password
export async function loginWithEmail(email: string, password: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return getUserProfile(cred.user);
}

// Login with Google — uses redirect (more reliable across domains)
export async function loginWithGoogle(): Promise<UserProfile> {
  // Try popup first, fall back to redirect if blocked
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return handleGoogleUser(cred.user);
  } catch (err: any) {
    // If popup is blocked or closed, use redirect
    if (
      err?.code === 'auth/popup-blocked' ||
      err?.code === 'auth/popup-closed-by-user' ||
      err?.code === 'auth/cancelled-popup-request' ||
      err?.code === 'auth/unauthorized-domain'
    ) {
      // Redirect-based login — page will reload, result handled in handleRedirectResult
      await signInWithRedirect(auth, googleProvider);
      // This line won't be reached because the page navigates away
      return {} as UserProfile;
    }
    throw err;
  }
}

// Handle Google user profile creation/retrieval
async function handleGoogleUser(user: User): Promise<UserProfile> {
  const profileRef = doc(db, 'users', user.uid);
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) {
    const profile: UserProfile = {
      uid: user.uid,
      name: user.displayName || 'User',
      email: user.email || '',
      onboardingDone: false,
      createdAt: new Date().toISOString(),
    };
    await setDoc(profileRef, profile);
    return profile;
  }

  return profileSnap.data() as UserProfile;
}

// Handle redirect result (called on app init)
export async function handleRedirectResult(): Promise<UserProfile | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return handleGoogleUser(result.user);
    }
  } catch (err) {
    console.warn('[MindVibe] Redirect result error:', err);
  }
  return null;
}

// Get user profile from Firestore
export async function getUserProfile(user: User): Promise<UserProfile> {
  const profileRef = doc(db, 'users', user.uid);
  const profileSnap = await getDoc(profileRef);

  if (profileSnap.exists()) {
    return profileSnap.data() as UserProfile;
  }

  // Fallback: create profile from auth user
  const profile: UserProfile = {
    uid: user.uid,
    name: user.displayName || 'User',
    email: user.email || '',
    onboardingDone: false,
    createdAt: new Date().toISOString(),
  };
  await setDoc(profileRef, profile);
  return profile;
}

// Update onboarding status
export async function completeOnboarding(uid: string): Promise<void> {
  await setDoc(doc(db, 'users', uid), { onboardingDone: true }, { merge: true });
}

// Logout
export async function logout(): Promise<void> {
  await signOut(auth);
}

// Auth state listener
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
