import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBKQsDRk63poqKcts8QXV0YBGPpUxDQ7QQ",
  authDomain: "lehrn-app-16e62.firebaseapp.com",
  projectId: "lehrn-app-16e62",
  storageBucket: "lehrn-app-16e62.firebasestorage.app",
  messagingSenderId: "237891528846",
  appId: "1:237891528846:web:12ff958afed6018981c1df",
  measurementId: "G-50TBQZCD60",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
