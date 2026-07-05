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
import { Plus, Edit, Trash2, Search, Loader2, Clock, CheckCircle, XCircle, FileSpreadsheet, FileText } from "lucide-react"
import { overtimeApi, OvertimeRecord } from "@/lib/api/overtime"
import { useToast } from "@/components/ui/toast"
import { exportToExcel } from "@/lib/utils/export-excel"
import { exportToPDF } from "@/lib/utils/export-pdf"

export default function OvertimePage() {
  const [overtimeRecords, setOvertimeRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<OvertimeRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
    type: "regular" as "regular" | "weekend" | "holiday",
    reason: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await overtimeApi.getOvertimeRecords()
      setOvertimeRecords(response.data || response)
    } catch (error) {
      console.error("Error loading overtime records:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to load overtime records",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingRecord(null)
    setFormData({
      date: "",
      start_time: "",
      end_time: "",
      type: "regular",
      reason: "",
    })
    setDialogOpen(true)
  }

  const handleEdit = (record: OvertimeRecord) => {
    setEditingRecord(record)
    setFormData({
      date: record.date,
      start_time: record.start_time,
      end_time: record.end_time,
      type: record.type,
      reason: record.reason,
    })
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingRecord) {
        await overtimeApi.updateOvertimeRecord(editingRecord.id, formData)
        addToast({ title: "Success", description: "Overtime request updated successfully" })
      } else {
        await overtimeApi.createOvertimeRecord(formData)
        addToast({ title: "Success", description: "Overtime request submitted successfully" })
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("Error saving overtime record:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to save overtime request",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this overtime record?")) return
    setDeleting(id)
    try {
      await overtimeApi.deleteOvertimeRecord(id)
      addToast({ title: "Success", description: "Overtime request deleted successfully" })
      loadData()
    } catch (error) {
      console.error("Error deleting overtime record:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to delete overtime request",
        variant: "destructive"
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleApprove = async (id: number) => {
    if (!confirm("Are you sure you want to approve this overtime request?")) return
    try {
      await overtimeApi.approveRecord(id)
      addToast({ title: "Success", description: "Overtime request approved successfully" })
      loadData()
    } catch (error) {
      console.error("Error approving overtime record:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to approve overtime request",
        variant: "destructive"
      })
    }
  }

  const handleReject = async (id: number) => {
    const reason = prompt("Please enter rejection reason:")
    if (!reason) return
    try {
      await overtimeApi.rejectRecord(id, reason)
      addToast({ title: "Success", description: "Overtime request rejected successfully" })
      loadData()
    } catch (error) {
      console.error("Error rejecting overtime record:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to reject overtime request",
        variant: "destructive"
      })
    }
  }

  const calculateHours = () => {
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`)
      const end = new Date(`2000-01-01T${formData.end_time}`)
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }
    return 0
  }

  const getRateMultiplier = () => {
    return formData.type === 'regular' ? 1.5 : 2.0
  }

  const filteredRecords = overtimeRecords.filter((record) => {
    const matchesSearch = 
      record.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      record.type.toLowerCase().includes(search.toLowerCase()) ||
      record.reason.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || record.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
            <h1 className="text-3xl font-bold tracking-tight">Overtime Management</h1>
            <p className="text-muted-foreground mt-1">Manage employee overtime requests and approvals</p>
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
                <CardTitle>All Overtime Requests</CardTitle>
                <CardDescription>View and manage overtime requests</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const columns = [
                      { key: 'user', label: 'Employee', format: (val: any) => val?.name || '-' },
                      { key: 'date', label: 'Date', format: (val: string) => new Date(val).toLocaleDateString() },
                      { key: 'start_time', label: 'Start Time' },
                      { key: 'end_time', label: 'End Time' },
                      { key: 'hours', label: 'Hours' },
                      { key: 'type', label: 'Type' },
                      { key: 'rate', label: 'Rate' },
                      { key: 'reason', label: 'Reason' },
                      { key: 'status', label: 'Status' },
                    ]
                    exportToExcel(filteredRecords, columns, 'overtime-requests')
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
                      { key: 'date', label: 'Date', format: (val: string) => new Date(val).toLocaleDateString() },
                      { key: 'start_time', label: 'Start Time' },
                      { key: 'end_time', label: 'End Time' },
                      { key: 'hours', label: 'Hours' },
                      { key: 'type', label: 'Type' },
                      { key: 'rate', label: 'Rate' },
                      { key: 'reason', label: 'Reason' },
                      { key: 'status', label: 'Status' },
                    ]
                    exportToPDF(filteredRecords, columns, 'overtime-requests', 'Overtime Requests Report')
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

            {filteredRecords.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No overtime requests found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.user?.name || '-'}</TableCell>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{record.start_time}</div>
                          <div className="text-muted-foreground">to {record.end_time}</div>
                        </div>
                      </TableCell>
                      <TableCell>{record.hours.toFixed(2)}h</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.type}</Badge>
                      </TableCell>
                      <TableCell>{record.rate}x</TableCell>
                      <TableCell className="max-w-xs truncate">{record.reason}</TableCell>
                      <TableCell>
                        <Badge variant={
                          record.status === 'approved' ? 'success' :
                          record.status === 'rejected' ? 'destructive' :
                          'warning'
                        }>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {record.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleApprove(record.id)}>
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(record.id)}>
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {(record.status === 'pending' && record.user_id === 1) && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(record.id)}
                                disabled={deleting === record.id}
                              >
                                {deleting === record.id ? (
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
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Edit Overtime Request" : "New Overtime Request"}</DialogTitle>
              <DialogDescription>
                {editingRecord ? "Update your overtime request" : "Submit a new overtime request"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Hours: {calculateHours().toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Rate: {getRateMultiplier()}x</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Overtime Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as "regular" | "weekend" | "holiday" })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular (1.5x)</SelectItem>
                    <SelectItem value="weekend">Weekend (2.0x)</SelectItem>
                    <SelectItem value="holiday">Holiday (2.0x)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Please provide a reason for your overtime request"
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
                    editingRecord ? "Update" : "Submit"
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
