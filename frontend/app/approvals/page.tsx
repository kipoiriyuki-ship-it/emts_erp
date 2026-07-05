"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle
} from "lucide-react"
import { approvalApi, Approval } from "@/lib/api/approvals"
import { formatCurrency } from "@/lib/utils"

export default function ApprovalsPage() {
  const [pendingApprovals, setPendingApprovals] = useState<Approval[]>([])
  const [approvedApprovals, setApprovedApprovals] = useState<Approval[]>([])
  const [rejectedApprovals, setRejectedApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"approve" | "reject">("approve")
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null)
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pending, approved, rejected] = await Promise.all([
        approvalApi.getPending(),
        approvalApi.getApproved(),
        approvalApi.getRejected(),
      ])
      setPendingApprovals(pending.data || pending)
      setApprovedApprovals(approved.data || approved)
      setRejectedApprovals(rejected.data || rejected)
    } catch (error) {
      console.error("Error loading approvals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = (approval: Approval) => {
    setSelectedApproval(approval)
    setDialogType("approve")
    setNotes("")
    setDialogOpen(true)
  }

  const handleReject = (approval: Approval) => {
    setSelectedApproval(approval)
    setDialogType("reject")
    setNotes("")
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedApproval) return

    setSubmitting(true)
    try {
      if (dialogType === "approve") {
        await approvalApi.approve(selectedApproval.id, notes)
      } else {
        await approvalApi.reject(selectedApproval.id, notes)
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("Error submitting approval:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const getApprovableType = (type: string) => {
    if (type.includes("LargeCashRequest")) return "Large Cash Request"
    if (type.includes("OperationalExpense")) return "Operational Expense"
    if (type.includes("LeaveRequest")) return "Leave Request"
    if (type.includes("OvertimeRecord")) return "Overtime Request"
    return type
  }

  const renderApprovalCard = (approval: Approval, canAction: boolean = false) => (
    <Card key={approval.id}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={
                approval.status === "pending" ? "secondary" :
                approval.status === "approved" ? "success" :
                "destructive"
              }>
                {approval.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {getApprovableType(approval.approvable_type)}
              </span>
            </div>
            
            {approval.approvable && (
              <div className="space-y-2">
                {approval.approvable.request_number && (
                  <p className="font-semibold">{approval.approvable.request_number}</p>
                )}
                {approval.approvable.description && (
                  <p className="text-sm text-muted-foreground">{approval.approvable.description}</p>
                )}
                {approval.approvable.total_amount && (
                  <p className="text-lg font-bold">{formatCurrency(approval.approvable.total_amount)}</p>
                )}
                {approval.approvable.type && (
                  <p className="text-sm text-muted-foreground">Type: {approval.approvable.type}</p>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Level {approval.current_level} of {approval.required_level}</span>
              {approval.approver && (
                <span>Approver: {approval.approver.name}</span>
              )}
              <span>{new Date(approval.created_at).toLocaleDateString()}</span>
            </div>

            {approval.notes && (
              <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
                <span className="font-medium">Notes: </span>
                {approval.notes}
              </div>
            )}
          </div>

          {canAction && approval.status === "pending" && (
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                variant="default"
                onClick={() => handleApprove(approval)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(approval)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approval Center</h1>
          <p className="text-muted-foreground mt-1">Manage and review approval requests</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                  <p className="text-2xl font-bold">{pendingApprovals.length}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{approvedApprovals.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">{rejectedApprovals.length}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approval Lists */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingApprovals.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedApprovals.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedApprovals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending approvals</p>
                </CardContent>
              </Card>
            ) : (
              pendingApprovals.map((approval) => renderApprovalCard(approval, true))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedApprovals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No approved approvals</p>
                </CardContent>
              </Card>
            ) : (
              approvedApprovals.map((approval) => renderApprovalCard(approval, false))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedApprovals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No rejected approvals</p>
                </CardContent>
              </Card>
            ) : (
              rejectedApprovals.map((approval) => renderApprovalCard(approval, false))
            )}
          </TabsContent>
        </Tabs>

        {/* Approval/Reject Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogType === "approve" ? "Approve Request" : "Reject Request"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {dialogType === "reject" && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Are you sure you want to reject this request? This action cannot be undone.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="notes">
                  {dialogType === "approve" ? "Notes (Optional)" : "Reason (Required)"}
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={dialogType === "approve" ? "Add any notes for this approval..." : "Provide a reason for rejection..."}
                  required={dialogType === "reject"}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant={dialogType === "approve" ? "default" : "destructive"}
                  onClick={handleSubmit}
                  disabled={submitting || (dialogType === "reject" && !notes)}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    dialogType === "approve" ? "Approve" : "Reject"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
