// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getAnalytics, isSupported } from "firebase/analytics"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqnQYT1H1u7BjpCIzVtn9InJq2TjvOLyE",
  authDomain: "shop-and-orders.firebaseapp.com",
  projectId: "shop-and-orders",
  storageBucket: "shop-and-orders.firebasestorage.app",
  messagingSenderId: "689238140548",
  appId: "1:689238140548:web:e2a1a12bad61371ce744d1",
  measurementId: "G-KN9FFNEESW",
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)
const auth = getAuth(app)

// Initialize Analytics conditionally (only in browser environment)
const analytics = typeof window !== "undefined" ? isSupported().then((yes) => (yes ? getAnalytics(app) : null)) : null

export { app, db, auth, analytics }

// Export Firebase configuration for verification
export const firebaseConfigExport = firebaseConfig

// Helper function to check Firebase connection
export const checkFirebaseConnection = async () => {
  try {
    // Simple test to verify Firestore connection
    const testDoc = await import("firebase/firestore").then(({ doc, getDoc }) => getDoc(doc(db, "test", "connection")))
    console.log("✅ Firebase connection successful")
    return true
  } catch (error) {
    console.error("❌ Firebase connection failed:", error)
    return false
  }
}
