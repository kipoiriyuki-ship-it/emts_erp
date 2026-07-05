"use client"

import { useEffect, useCallback, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"
import { authApi } from "@/lib/api/auth"

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/license/activate",
]

const SESSION_TIMEOUT_MS = 30 * 60 * 1000
const TOKEN_REFRESH_INTERVAL_MS = 14 * 60 * 1000

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, token, setAuth, logout, isAuthenticated } = useAuthStore()
  const lastActivityRef = useRef(Date.now())

  const clearSession = useCallback(() => {
    logout()
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("remember_login")
    if (!isPublicPath(pathname)) {
      router.push("/login")
    }
  }, [logout, pathname, router])

  const refreshSession = useCallback(async () => {
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) {
      return false
    }

    try {
      const data = await authApi.refresh(refreshToken)
      const accessToken = data.token ?? data.access_token
      if (!accessToken) {
        clearSession()
        return false
      }
      localStorage.setItem("access_token", accessToken)
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token)
      }
      setAuth(data.user, accessToken, data.license_status)
      return true
    } catch {
      clearSession()
      return false
    }
  }, [clearSession, setAuth])

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token")
    if (!accessToken) {
      if (!isPublicPath(pathname)) {
        router.push("/login")
      }
      return
    }

    if (!user || !token) {
      authApi
        .me()
        .then((me) => {
          setAuth(me, accessToken)
        })
        .catch(() => {
          clearSession()
        })
    }
  }, [pathname, user, token, setAuth, clearSession, router])

  useEffect(() => {
    if (!isAuthenticated && isPublicPath(pathname)) {
      return
    }

    const handleActivity = () => {
      lastActivityRef.current = Date.now()
    }

    const events = ["mousedown", "keydown", "scroll", "touchstart"]
    events.forEach((event) => window.addEventListener(event, handleActivity))

    const sessionTimer = window.setInterval(() => {
      if (Date.now() - lastActivityRef.current >= SESSION_TIMEOUT_MS) {
        clearSession()
      }
    }, 60_000)

    const refreshTimer = window.setInterval(() => {
      if (localStorage.getItem("remember_login") === "true") {
        refreshSession()
      }
    }, TOKEN_REFRESH_INTERVAL_MS)

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity))
      window.clearInterval(sessionTimer)
      window.clearInterval(refreshTimer)
    }
  }, [isAuthenticated, pathname, clearSession, refreshSession])

  return <>{children}</>
}
