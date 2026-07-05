"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, CheckCircle, XCircle, Loader2, ShieldCheck } from "lucide-react"
import { licenseApi } from "@/lib/api/license"
import { useAuthStore } from "@/lib/store/auth-store"

export default function LicenseActivationPage() {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const { isAuthenticated, licenseStatus } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    licenseStatus: state.licenseStatus,
  }))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    activation_code: "",
  })

  useEffect(() => {
    if (!localStorage.getItem("access_token") && licenseStatus !== "waiting") {
      router.push("/login")
      return
    }

    if (licenseStatus && licenseStatus !== "waiting") {
      router.push("/")
      return
    }
  }, [licenseStatus, router])

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!formData.activation_code.trim()) {
      setError("Activation code is required")
      return
    }

    setLoading(true)
    try {
      const response = await licenseApi.activateAccount({
        activation_code: formData.activation_code.trim().toUpperCase(),
      })

      const accessToken = response.access_token ?? response.token
      if (!accessToken) {
        throw new Error("Activation response is missing access token")
      }

      localStorage.setItem("access_token", accessToken)
      if (response.refresh_token) {
        localStorage.setItem("refresh_token", response.refresh_token)
      }
      setAuth(response.user, accessToken, "active")
      setSuccess(true)

      setTimeout(() => {
        router.push("/dashboard/admin")
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to activate account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center">
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden space-y-6 lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E6ECF2] bg-white px-3 py-2 text-sm text-[#0F4C81] shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              Premium license onboarding
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-[#0F4C81]">Activate EMTS License</h1>
              <p className="max-w-xl text-lg leading-8 text-[#64748B]">
                Securely activate your enterprise workspace and create your administrator account in minutes.
              </p>
            </div>
          </div>

          <Card className="w-full border-0 bg-white/90 shadow-[0_20px_80px_rgba(15,76,129,0.12)] backdrop-blur">
            <CardHeader className="px-6 pt-8 text-center sm:px-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E3F2FD] text-[#1976D2]">
                <Key className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-semibold text-[#0F4C81]">Activate EMTS License</CardTitle>
              <CardDescription className="text-base text-[#64748B]">
                Enter the license activation code provided by the admin team to activate your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-8 sm:px-8">
              <form onSubmit={handleActivate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activation_code">Activation Code *</Label>
              <Input
                id="activation_code"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={formData.activation_code}
                onChange={(e) =>
                  setFormData({ ...formData, activation_code: e.target.value.toUpperCase() })
                }
                disabled={loading || success}
                className="font-mono uppercase"
                required
              />
            </div>


            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Account activated successfully! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading || success}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                "Activate License"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Already have an account?</p>
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
  )
}
