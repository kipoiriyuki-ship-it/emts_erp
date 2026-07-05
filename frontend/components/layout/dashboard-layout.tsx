"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { useAuthStore } from "@/lib/store/auth-store"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = useAuthStore((state) => state.user)

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar
        user={user ? {
          name: user.name || "User",
          email: user.email || "",
          role: user.role?.name || "User",
          roleCode: user.role?.code || "",
        } : undefined}
        permissions={user?.permissions || []}
      />

      <div className="flex flex-1 flex-col lg:pl-64">
        <Header onMenuClick={() => setMobileOpen(!mobileOpen)} />

        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
