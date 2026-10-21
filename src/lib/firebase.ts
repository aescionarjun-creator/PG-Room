import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyAFuLUUbbRR0YVLFzDt_9kVKJgaNEwZnHM",
  authDomain: "stayzy-dac67.firebaseapp.com",
  projectId: "stayzy-dac67",
  storageBucket: "stayzy-dac67.firebasestorage.app",
  messagingSenderId: "560994400726",
  appId: "1:560994400726:web:17ad9fedcc79914d510c77",
  measurementId: "G-YK0MFDPWJF",
};

// Initialize or reuse existing Firebase app
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize analytics conditionally on client-side only
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };
