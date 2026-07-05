"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Search, Loader2, Calendar, Clock, CheckCircle, XCircle, FileSpreadsheet, FileText } from "lucide-react"
import { leaveApi, LeaveRequest, LeaveRequestInput } from "@/lib/api/leave"
import { useToast } from "@/components/ui/toast"
import { exportToExcel } from "@/lib/utils/export-excel"
import { exportToPDF } from "@/lib/utils/export-pdf"

export default function LeaveRequestsPage() {
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    type: "",
    start_date: "",
    end_date: "",
    reason: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await leaveApi.getLeaveRequests()
      setLeaveRequests(response.data || response)
    } catch (error) {
      console.error("Error loading leave requests:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to load leave requests",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingRequest(null)
    setFormData({
      type: "",
      start_date: "",
      end_date: "",
      reason: "",
    })
    setDialogOpen(true)
  }

  const handleEdit = (request: LeaveRequest) => {
    setEditingRequest(request)
    setFormData({
      type: request.type,
      start_date: request.start_date,
      end_date: request.end_date,
      reason: request.reason,
    })
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: LeaveRequestInput = {
        type: formData.type as LeaveRequestInput["type"],
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
      }

      if (editingRequest) {
        await leaveApi.updateLeaveRequest(editingRequest.id, payload)
        addToast({ title: "Success", description: "Leave request updated successfully" })
      } else {
        await leaveApi.createLeaveRequest(payload)
        addToast({ title: "Success", description: "Leave request submitted successfully" })
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("Error saving leave request:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to save leave request",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this leave request?")) return
    setDeleting(id)
    try {
      await leaveApi.deleteLeaveRequest(id)
      addToast({ title: "Success", description: "Leave request deleted successfully" })
      loadData()
    } catch (error) {
      console.error("Error deleting leave request:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to delete leave request",
        variant: "destructive"
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleApprove = async (id: number) => {
    if (!confirm("Are you sure you want to approve this leave request?")) return
    try {
      await leaveApi.approveRequest(id)
      addToast({ title: "Success", description: "Leave request approved successfully" })
      loadData()
    } catch (error) {
      console.error("Error approving leave request:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to approve leave request",
        variant: "destructive"
      })
    }
  }

  const handleReject = async (id: number) => {
    const reason = prompt("Please enter rejection reason:")
    if (!reason) return
    try {
      await leaveApi.rejectRequest(id, reason)
      addToast({ title: "Success", description: "Leave request rejected successfully" })
      loadData()
    } catch (error) {
      console.error("Error rejecting leave request:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to reject leave request",
        variant: "destructive"
      })
    }
  }

  const filteredRequests = leaveRequests.filter((request) => {
    const matchesSearch = 
      request.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      request.type.toLowerCase().includes(search.toLowerCase()) ||
      request.reason.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date)
      const end = new Date(formData.end_date)
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    }
    return 1
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leave Requests</h1>
            <p className="text-muted-foreground mt-1">Manage employee leave requests and approvals</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Leave Requests</CardTitle>
                <CardDescription>View and manage leave requests</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const columns = [
                      { key: 'user', label: 'Employee', format: (val: any) => val?.name || '-' },
                      { key: 'type', label: 'Type' },
                      { key: 'start_date', label: 'Start Date', format: (val: string) => new Date(val).toLocaleDateString() },
                      { key: 'end_date', label: 'End Date', format: (val: string) => new Date(val).toLocaleDateString() },
                      { key: 'days', label: 'Days' },
                      { key: 'reason', label: 'Reason' },
                      { key: 'status', label: 'Status' },
                    ]
                    exportToExcel(filteredRequests, columns, 'leave-requests')
                  }}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const columns = [
                      { key: 'user', label: 'Employee', format: (val: any) => val?.name || '-' },
                      { key: 'type', label: 'Type' },
                      { key: 'start_date', label: 'Start Date', format: (val: string) => new Date(val).toLocaleDateString() },
                      { key: 'end_date', label: 'End Date', format: (val: string) => new Date(val).toLocaleDateString() },
                      { key: 'days', label: 'Days' },
                      { key: 'reason', label: 'Reason' },
                      { key: 'status', label: 'Status' },
                    ]
                    exportToPDF(filteredRequests, columns, 'leave-requests', 'Leave Requests Report')
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No leave requests found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.user?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(request.start_date).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">to {new Date(request.end_date).toLocaleDateString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>{request.days} day(s)</TableCell>
                      <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                      <TableCell>
                        <Badge variant={
                          request.status === 'approved' ? 'success' :
                          request.status === 'rejected' ? 'destructive' :
                          'warning'
                        }>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {request.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleApprove(request.id)}>
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(request.id)}>
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {(request.status === 'pending' && request.user_id === 1) && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(request)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(request.id)}
                                disabled={deleting === request.id}
                              >
                                {deleting === request.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRequest ? "Edit Leave Request" : "New Leave Request"}</DialogTitle>
              <DialogDescription>
                {editingRequest ? "Update your leave request" : "Submit a new leave request"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Leave Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual Leave</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal Leave</SelectItem>
                    <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    <SelectItem value="maternity">Maternity Leave</SelectItem>
                    <SelectItem value="paternity">Paternity Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={formData.start_date}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Total days: {calculateDays()}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Please provide a reason for your leave request"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingRequest ? "Update" : "Submit"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
