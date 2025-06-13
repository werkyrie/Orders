"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Database, CheckCircle, AlertCircle, Loader2, User, LogOut, Shield, Eye } from "lucide-react"
import { useAuth } from "../../hooks/use-auth"

interface HeaderProps {
  firebaseStatus: "checking" | "connected" | "error"
}

export function Header({ firebaseStatus }: HeaderProps) {
  const { user, logout } = useAuth()

  const FirebaseStatusBadge = () => {
    switch (firebaseStatus) {
      case "checking":
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Checking Firebase...
          </Badge>
        )
      case "connected":
        return (
          <Badge variant="default" className="gap-1 bg-green-600 text-white">
            <CheckCircle className="h-3 w-3" />
            Firebase Connected
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Firebase Error
          </Badge>
        )
      default:
        return null
    }
  }

  const getRoleIcon = (role: string) => {
    return role === "admin" ? <Shield className="h-4 w-4" /> : <Eye className="h-4 w-4" />
  }

  const getRoleBadgeColor = (role: string) => {
    return role === "admin" ? "bg-purple-600 text-white" : "bg-blue-600 text-white"
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Shop Management System</h1>
        <p className="text-muted-foreground">Manage your shops, orders, and advance orders with Firebase</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Firebase Status */}
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-muted-foreground" />
          <FirebaseStatusBadge />
        </div>

        {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                {user.email}
                <Badge className={`gap-1 ${getRoleBadgeColor(user.role)}`}>
                  {getRoleIcon(user.role)}
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <User className="h-4 w-4 mr-2" />
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                {getRoleIcon(user.role)}
                <span className="ml-2">{user.role.charAt(0).toUpperCase() + user.role.slice(1)} Access</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
