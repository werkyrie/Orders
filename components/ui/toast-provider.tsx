"use client"

import type * as React from "react"

import { Toaster } from "@/components/ui/toaster"

interface ToastProviderProps {
  children: React.ReactNode
}

function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}

export { ToastProvider }
