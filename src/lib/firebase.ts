
// TODO: Replace with your actual Firebase project configuration
// Ensure you have Firebase installed: npm install firebase
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage'; // Added for Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyBdOzkD-E7c70VE1l5YzgSqUPEO_Tm-NQU",
  authDomain: "college-gallery.firebaseapp.com",
  projectId: "college-gallery",
  storageBucket: "college-gallery.firebasestorage.app",
  messagingSenderId: "399494093066",
  appId: "1:399494093066:web:ae8756641be17fff0f82f3"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const storage = getStorage(app); // Initialize Firebase Storage

const googleProvider = new GoogleAuthProvider();
// You can add custom parameters to Google Auth Provider if needed
// googleProvider.setCustomParameters({ prompt: 'select_account' });

export { auth, storage, googleProvider, EmailAuthProvider }; // Export storage

// Example of how to get the current user
// import { useAuthState } from 'react-firebase-hooks/auth'; // You might need to install react-firebase-hooks
// const [user, loading, error] = useAuthState(auth);

