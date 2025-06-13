"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"

export type UserRole = "admin" | "viewer"

export interface AuthUser {
  uid: string
  email: string
  role: UserRole
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useAuthProvider() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user role from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          const userData = userDoc.data()

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            role: userData?.role || "viewer",
          })
        } catch (err) {
          console.error("Error fetching user role:", err)
          setError("Failed to load user permissions")
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null)
      setLoading(true)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      // Get user role from Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))
      const userData = userDoc.data()

      if (!userData) {
        throw new Error("User profile not found")
      }

      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email || "",
        role: userData.role || "viewer",
      })

      return true
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Login failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth)
      setUser(null)
      setError(null)
    } catch (err: any) {
      console.error("Logout error:", err)
      setError(err.message || "Logout failed")
    }
  }

  return {
    user,
    loading,
    login,
    logout,
    error,
  }
}

export { AuthContext }
