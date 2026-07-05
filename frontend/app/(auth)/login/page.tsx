"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authApi } from "@/lib/api/auth"
import { useAuthStore } from "@/lib/store/auth-store"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Sparkles, Lock, Mail } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [rememberMe, setRememberMe] = useState(false)

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const data = await authApi.login({ email, password })

      if (data.license_status === 'waiting') {
        if (!data.user) {
          throw new Error('Login response is missing user data')
        }
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.setItem('remember_login', rememberMe ? 'true' : 'false')
        setAuth(data.user, '', 'waiting')
        router.push('/license/activate')
        return
      }

      const accessToken = data.access_token ?? data.token

      if (!accessToken) {
        throw new Error('Login response is missing access token')
      }

      localStorage.setItem('access_token', accessToken)
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token)
      }
      localStorage.setItem('remember_login', rememberMe ? 'true' : 'false')
      setAuth(data.user, accessToken, data.license_status ?? 'active')

      const roleMap: Record<string, string> = {
        SUPER_ADMIN: 'admin',
        ADMIN: 'admin',
        DIRECTOR: 'director',
        PROJECT_MANAGER: 'manager',
        MANAGER: 'manager',
        STAFF: 'employee',
        EMPLOYEE: 'employee',
        ACCOUNTING: 'accounting',
      }

      const dashboardRoute = roleMap[data.user.role?.code] || 'admin'
      router.push(`/dashboard/${dashboardRoute}`)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="hidden space-y-6 lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E6ECF2] bg-white px-3 py-2 text-sm text-[#0F4C81] shadow-sm">
              <Sparkles className="h-4 w-4" />
              Enterprise Monitoring & Financial Management System
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-[#0F4C81] sm:text-5xl">
                Welcome to EMTS
              </h1>
              <p className="max-w-xl text-lg leading-8 text-[#64748B]">
                A premium operating layer for field monitoring, project delivery, and finance management across engineering and industrial organizations.
              </p>
            </div>
            <div className="rounded-3xl border border-[#E6ECF2] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,76,129,0.08)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E3F2FD] text-[#1976D2]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#1E293B]">Secure enterprise access</p>
                  <p className="text-sm text-[#64748B]">Role-based workflow with audit-friendly visibility.</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="w-full border-0 bg-white/90 shadow-[0_20px_80px_rgba(15,76,129,0.12)] backdrop-blur">
            <CardHeader className="space-y-4 px-6 pt-8 sm:px-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F4C81] text-white shadow-lg">
                <span className="text-xl font-semibold">EM</span>
              </div>
              <div className="space-y-1 text-center">
                <CardTitle className="text-3xl font-semibold text-[#0F4C81]">EMTS</CardTitle>
                <CardDescription className="text-base text-[#64748B]">
                  Enterprise Monitoring & Financial Management System
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-8 sm:px-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-[#1E293B]">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (errors.email) setErrors({ ...errors, email: undefined })
                      }}
                      className={errors.email ? "border-red-300 pl-10" : "pl-10"}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-[#1E293B]">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errors.password) setErrors({ ...errors, password: undefined })
                      }}
                      className={errors.password ? "border-red-300 pl-10" : "pl-10"}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E6ECF2] bg-[#FAFBFC] px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="remember" className="cursor-pointer text-sm text-[#64748B]">
                      Remember me
                    </Label>
                  </div>
                  <a href="/forgot-password" className="text-sm font-medium text-[#1976D2] hover:underline">
                    Forgot Password
                  </a>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <div className="mt-5 text-center text-sm text-[#64748B]">
                <p>If you have a license activation code, please log in with your registered email first.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
