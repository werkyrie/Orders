"use client"

import { useAuth } from "../hooks/use-auth"
import { AuthProvider } from "../components/auth/auth-provider"
import { LoginForm } from "../components/auth/login-form"
import ShopManagementTable from "../shop-management-table"
import { Loader2 } from "lucide-react"

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Loading...</h2>
          <p className="text-muted-foreground">Checking authentication status</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return <ShopManagementTable />
}

export default function Page() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
