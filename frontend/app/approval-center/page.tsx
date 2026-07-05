"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  DollarSign,
  FileText,
  Calendar,
  User,
  Paperclip,
  AlertCircle,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { approvalApi } from "@/lib/api/approval"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/toast"

export default function ApprovalCenterPage() {
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([])
  const [recentApprovals, setRecentApprovals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const { addToast } = useToast()

  useEffect(() => {
    loadApprovals()
  }, [])

  const loadApprovals = async () => {
    try {
      setLoading(true)
      const [pending, approved, rejected] = await Promise.all([
        approvalApi.pending(),
        approvalApi.approved(),
        approvalApi.rejected()
      ])
      setPendingApprovals(pending || [])
      setRecentApprovals([...(approved || []), ...(rejected || [])].slice(0, 10))
    } catch (error) {
      console.error("Error loading approvals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    setActionLoading(id)
    try {
      await approvalApi.approve(id)
      await loadApprovals()
      addToast({ title: "Success", description: "Approval successful!" })
    } catch (error: any) {
      addToast({ 
        title: "Error", 
        description: `Approval failed: ${error.response?.data?.message || error.message}`,
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: number) => {
    let reason = ""
    while (!reason) {
      reason = prompt("Enter rejection reason:") || ""
      if (!reason) return
    }

    setActionLoading(id)
    try {
      await approvalApi.reject(id, reason)
      await loadApprovals()
      addToast({ title: "Success", description: "Request rejected!" })
    } catch (error: any) {
      addToast({ 
        title: "Error", 
        description: `Rejection failed: ${error.response?.data?.message || error.message}`,
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReturnRevision = async (id: number) => {
    let reason = ""
    while (!reason) {
      reason = prompt("Enter revision notes:") || ""
      if (!reason) return
    }

    setActionLoading(id)
    try {
      await approvalApi.returnRevision(id, reason)
      await loadApprovals()
      addToast({ title: "Success", description: "Request returned for revision." })
    } catch (error: any) {
      addToast({ 
        title: "Error", 
        description: `Return for revision failed: ${error.response?.data?.message || error.message}`,
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const approvalStats = {
    pending: pendingApprovals.length,
    approvedThisWeek: recentApprovals.filter((a: any) => a.status === 'approved').length,
    rejectedThisWeek: recentApprovals.filter((a: any) => a.status === 'rejected').length,
    totalAmountPending: pendingApprovals.reduce((sum: number, a: any) => sum + (a.amount || 0), 0),
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading approvals...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approval Center</h1>
          <p className="text-muted-foreground mt-1">Review and approve pending requests</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                  <p className="text-2xl font-bold">{approvalStats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved This Week</p>
                  <p className="text-2xl font-bold text-green-600">{approvalStats.approvedThisWeek}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected This Week</p>
                  <p className="text-2xl font-bold text-red-600">{approvalStats.rejectedThisWeek}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pending Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(approvalStats.totalAmountPending)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search approvals..." className="pl-9" />
        </div>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pending approvals</p>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          approval.approvable_type?.includes('Cash') ? "bg-blue-100" : "bg-purple-100"
                        }`}>
                          {approval.approvable_type?.includes('Cash') ? (
                            <DollarSign className="h-5 w-5 text-blue-600" />
                          ) : (
                            <FileText className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{approval.approvable?.title || approval.approvable_type}</p>
                          <p className="text-sm text-muted-foreground">{approval.approvable_type}</p>
                        </div>
                      </div>
                      {approval.urgency && (
                        <Badge variant={approval.urgency === "high" ? "destructive" : "secondary"}>
                          {approval.urgency}
                        </Badge>
                      )}
                    </div>
                  
<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{approval.approvable?.request_number || approval.approvable?.title || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{approval.approvable?.submitted_at?.split('T')[0] || approval.created_at?.split('T')[0] || '-'}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Project: </span>
                          <span>{approval.approvable?.project?.name || approval.approvable?.project || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">{formatCurrency(approval.approvable?.total_amount || approval.approvable?.amount || 0)}</span>
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{approval.approvable?.user?.name || approval.approver?.name || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4" />
                          <span>{approval.approvable?.documents_url || approval.approvable?.receipt_url ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="text-sm col-span-2">
                          <span className="font-medium">Catatan: </span>
                          <span>{approval.approvable?.description || approval.notes || '-'}</span>
                        </div>
                      </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => handleReturnRevision(approval.id)}
                      disabled={actionLoading === approval.id}
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Return Revision
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleReject(approval.id)}
                      disabled={actionLoading === approval.id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleApprove(approval.id)}
                      disabled={actionLoading === approval.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </CardContent>
        </Card>

        {/* Recent Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {recentApprovals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent approvals</p>
            ) : (
              <div className="space-y-3">
                {recentApprovals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        approval.status === "approved" ? "bg-green-100" : "bg-red-100"
                      }`}>
                        {approval.status === "approved" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{approval.approvable?.title || approval.approvable_type}</p>
                        <p className="text-xs text-muted-foreground">{approval.approver?.name} • {approval.created_at?.split('T')[0]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {approval.approvable?.amount && (
                        <p className="font-semibold">{formatCurrency(approval.approvable.amount)}</p>
                      )}
                      <Badge variant={approval.status === "approved" ? "secondary" : "destructive"}>
                        {approval.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
