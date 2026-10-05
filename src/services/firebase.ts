/**
 * Firebase service abstraction layer.
 * Replace mock imports with real Firebase SDK when hardware is ready.
 *
 * To enable real Firebase:
 *  1. Set EXPO_PUBLIC_USE_MOCK=false in .env
 *  2. Fill in Firebase config in .env
 *  3. Uncomment the Firebase initialization block below
 */

// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getMessaging } from 'firebase/messaging';

// const firebaseConfig = {
//   apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
// };

// export const firebaseApp = initializeApp(firebaseConfig);
// export const auth = getAuth(firebaseApp);
// export const db = getFirestore(firebaseApp);
// export const messaging = getMessaging(firebaseApp);

export const IS_MOCK_MODE = true; // process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const firebaseApp = null;
export const auth = null;
export const db = null;
