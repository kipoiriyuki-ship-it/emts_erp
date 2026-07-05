"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"

const roleRouteMap: Record<string, string> = {
  SUPER_ADMIN: "admin",
  ADMIN: "admin",
  DIRECTOR: "director",
  PROJECT_MANAGER: "manager",
  MANAGER: "manager",
  ACCOUNTING: "accounting",
  EMPLOYEE: "employee",
  STAFF: "employee",
}

export default function DashboardRedirectPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    const roleCode = user?.role?.code
    const route = roleCode ? roleRouteMap[roleCode] || "admin" : "admin"
    router.replace(`/dashboard/${route}`)
  }, [router, user])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to dashboard...</p>
    </div>
  )
}
