import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { initializeFirestore, getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import config from "../firebase-applet-config.json";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const firebaseConfig = {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    };

    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("YOUR_API_KEY")) {
      console.warn("Firebase API key is not configured yet. Using local state fallback.");
    }

    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
  }
  return app;
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    const firebaseApp = getFirebaseApp();
    // Use the specific firestoreDatabaseId if configured
    const databaseId = config.firestoreDatabaseId;
    
    try {
      if (databaseId && databaseId !== "(default)") {
        db = getFirestore(firebaseApp, databaseId);
      } else {
        db = getFirestore(firebaseApp);
      }
    } catch (e) {
      db = getFirestore(firebaseApp);
    }
  }
  return db;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    auth = getAuth(firebaseApp);
  }
  return auth;
}

// Generate or retrieve a persistent user ID for local partition of data
export function getOrCreateUserId(): string {
  const STORAGE_KEY = "daily_auto_expense_user_id";
  let userId = localStorage.getItem(STORAGE_KEY);
  if (!userId) {
    userId = `student_${Math.random().toString(36).substring(2, 11)}`;
    localStorage.setItem(STORAGE_KEY, userId);
  }
  return userId;
}

export function setCustomUserId(userId: string): void {
  const STORAGE_KEY = "daily_auto_expense_user_id";
  localStorage.setItem(STORAGE_KEY, userId.trim());
}
