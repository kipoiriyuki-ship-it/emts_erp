"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { financialPolicyApi, FinancialPolicy } from "@/lib/api/financial-policy"
import { toast } from "sonner"

export default function FinancialPolicyPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [policy, setPolicy] = useState<FinancialPolicy | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    petty_cash_approval_limit: 0,
    large_cash_always_require_approval: false,
    maximum_petty_cash_per_day: 0,
    maximum_petty_cash_per_employee: 0,
    maximum_cash_request_per_project: 0,
  })

  useEffect(() => {
    if (user && !['SUPER_ADMIN', 'DIRECTOR'].includes(user.role?.code || '')) {
      router.push('/dashboard')
      return
    }
    loadPolicy()
  }, [user])

  const loadPolicy = async () => {
    try {
      setLoading(true)
      const data = await financialPolicyApi.getPolicy()
      setPolicy(data)
      setFormData({
        petty_cash_approval_limit: data.petty_cash_approval_limit,
        large_cash_always_require_approval: data.large_cash_always_require_approval,
        maximum_petty_cash_per_day: data.maximum_petty_cash_per_day,
        maximum_petty_cash_per_employee: data.maximum_petty_cash_per_employee,
        maximum_cash_request_per_project: data.maximum_cash_request_per_project,
      })
    } catch (error) {
      console.error("Failed to load financial policy settings", error)
      toast.error("Failed to load policy settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)

    try {
      await financialPolicyApi.updatePolicy(formData)
      toast.success("Financial policy settings updated")
      loadPolicy()
    } catch (error) {
      console.error("Failed to update financial policy settings", error)
      toast.error("Failed to update policy settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Policy Settings</h1>
          <p className="text-muted-foreground mt-1">Manage petty cash and cash request approval policy values.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Only SUPER ADMIN and DIRECTOR can view and update these settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6 sm:grid-cols-2" onSubmit={handleSave}>
              <div className="space-y-2">
                <Label htmlFor="petty_cash_approval_limit">Petty Cash Approval Limit</Label>
                <Input
                  id="petty_cash_approval_limit"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.petty_cash_approval_limit}
                  onChange={(event) => setFormData({
                    ...formData,
                    petty_cash_approval_limit: Number(event.target.value),
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="large_cash_always_require_approval">Large Cash Always Require Approval</Label>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="large_cash_always_require_approval"
                    checked={formData.large_cash_always_require_approval}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      large_cash_always_require_approval: Boolean(checked),
                    })}
                  />
                  <p className="text-sm text-muted-foreground">Require approval for all large cash requests.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maximum_petty_cash_per_day">Maximum Petty Cash Per Day</Label>
                <Input
                  id="maximum_petty_cash_per_day"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.maximum_petty_cash_per_day}
                  onChange={(event) => setFormData({
                    ...formData,
                    maximum_petty_cash_per_day: Number(event.target.value),
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maximum_petty_cash_per_employee">Maximum Petty Cash Per Employee</Label>
                <Input
                  id="maximum_petty_cash_per_employee"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.maximum_petty_cash_per_employee}
                  onChange={(event) => setFormData({
                    ...formData,
                    maximum_petty_cash_per_employee: Number(event.target.value),
                  })}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="maximum_cash_request_per_project">Maximum Cash Request Per Project</Label>
                <Input
                  id="maximum_cash_request_per_project"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.maximum_cash_request_per_project}
                  onChange={(event) => setFormData({
                    ...formData,
                    maximum_cash_request_per_project: Number(event.target.value),
                  })}
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-end gap-3">
                <Button type="submit" disabled={saving || loading}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
