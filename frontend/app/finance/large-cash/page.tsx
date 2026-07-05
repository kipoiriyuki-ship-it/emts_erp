"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Search, Loader2, Send, CheckCircle, XCircle, FileText } from "lucide-react"
import { largeCashApi, LargeCashRequest, LargeCashItem, LargeCashRequestInput } from "@/lib/api/large-cash"
import { projectsApi, Project } from "@/lib/api/projects"
import { formatCurrency } from "@/lib/utils"

export default function LargeCashPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<LargeCashRequest | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [formData, setFormData] = useState({
    project_id: "",
    type: "material",
    description: "",
    items: [{ description: "", quantity: "", unit_price: "" }],
  })
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [requestsResponse, projectsResponse] = await Promise.all([
        largeCashApi.getRequests({ per_page: 100 }),
        projectsApi.getProjects({ per_page: 100 }),
      ])
      const requestArray = Array.isArray(requestsResponse) ? requestsResponse : requestsResponse.data ?? []
      setRequests(Array.isArray(requestArray) ? requestArray : requestArray.data ?? [])

      const projectArray = Array.isArray(projectsResponse) ? projectsResponse : projectsResponse.data ?? []
      setProjects(Array.isArray(projectArray) ? projectArray : projectArray.data ?? [])
    } catch (error) {
      console.error("Error loading requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingRequest(null)
    setEvidenceFile(null)
    setFormData({
      project_id: "",
      type: "material",
      description: "",
      items: [{ description: "", quantity: "", unit_price: "" }],
    })
    setDialogOpen(true)
  }

  const handleEdit = (request: LargeCashRequest) => {
    setEditingRequest(request)
    setEvidenceFile(null)
    setFormData({
      project_id: request.project_id?.toString() || "",
      type: request.type,
      description: request.description || "",
      items: request.items?.map(item => ({
        description: item.description,
        quantity: item.quantity.toString(),
        unit_price: item.unit_price.toString(),
      })) || [{ description: "", quantity: "", unit_price: "" }],
    })
    setDialogOpen(true)
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: "", unit_price: "" }],
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const readFileAsDataURL = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result)
        } else {
          reject(new Error("Unable to read file"))
        }
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data: LargeCashRequestInput = {
        project_id: formData.project_id ? parseInt(formData.project_id) : null,
        type: formData.type as LargeCashRequestInput["type"],
        description: formData.description,
        items: formData.items.map(item => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price),
        })),
      }

      if (evidenceFile) {
        data.evidence_image = await readFileAsDataURL(evidenceFile)
      }

      if (editingRequest) {
        await largeCashApi.updateRequest(editingRequest.id, data)
      } else {
        await largeCashApi.createRequest(data)
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("Error saving request:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this request?")) return
    setDeleting(id)
    try {
      await largeCashApi.deleteRequest(id)
      loadData()
    } catch (error) {
      console.error("Error deleting request:", error)
    } finally {
      setDeleting(null)
    }
  }

  const handleSubmit = async (id: number) => {
    try {
      await largeCashApi.submitRequest(id)
      loadData()
    } catch (error) {
      console.error("Error submitting request:", error)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await largeCashApi.approveRequest(id)
      loadData()
    } catch (error) {
      console.error("Error approving request:", error)
    }
  }

  const handleReject = async (id: number) => {
    const reason = prompt("Please enter rejection reason:")
    if (!reason) return
    try {
      await largeCashApi.rejectRequest(id, reason)
      loadData()
    } catch (error) {
      console.error("Error rejecting request:", error)
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = 
      request.request_number.toLowerCase().includes(search.toLowerCase()) ||
      request.description?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || request.status === statusFilter
    const matchesType = !typeFilter || request.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)
    }, 0)
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
            <h1 className="text-3xl font-bold tracking-tight">Large Cash Requests</h1>
            <p className="text-muted-foreground mt-1">Manage large cash payment requests</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
            <CardDescription>View and manage large cash requests</CardDescription>
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="subcontractor">Subcontractor</SelectItem>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="project_payment">Project Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No requests found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.request_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{request.description || '-'}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(request.total_amount)}</TableCell>
                      <TableCell>{request.user?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          request.status === 'approved' ? 'success' :
                          request.status === 'rejected' ? 'destructive' :
                          request.status === 'draft' ? 'secondary' :
                          'warning'
                        }>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {request.status === 'draft' && (
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
                              <Button size="sm" variant="outline" onClick={() => handleSubmit(request.id)}>
                                <Send className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {(request.status === 'submitted' || request.status === 'pending') && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleApprove(request.id)}>
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(request.id)}>
                                <XCircle className="h-3 w-3" />
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
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingRequest ? "Edit Request" : "New Request"}</DialogTitle>
              <DialogDescription>
                {editingRequest ? "Update request details" : "Create a new large cash request"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="subcontractor">Subcontractor</SelectItem>
                      <SelectItem value="asset">Asset</SelectItem>
                      <SelectItem value="project_payment">Project Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <select
                    id="project"
                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidence_image">Evidence Image</Label>
                <Input
                  id="evidence_image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)}
                />
                {evidenceFile && (
                  <p className="text-sm text-muted-foreground">Selected file: {evidenceFile.name}</p>
                )}
                {editingRequest?.evidence_image && !evidenceFile && (
                  <p className="text-sm text-muted-foreground">Existing evidence will be kept unless a new file is selected.</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Items *</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addItem}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Item
                  </Button>
                </div>
                <div className="border rounded-lg p-4 space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5 space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                          required
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          placeholder="0"
                          required
                        />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label className="text-xs">Unit Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold">{formatCurrency(calculateTotal())}</span>
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
                    editingRequest ? "Update" : "Create"
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
