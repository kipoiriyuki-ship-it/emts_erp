"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter,
  ArrowRight,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Loader2,
  FileSpreadsheet,
  FileText,
  Printer,
  Edit,
  Trash2,
  AlertCircle
} from "lucide-react"
import { projectsApi, Project } from "@/lib/api/projects"
import { exportToExcel } from "@/lib/utils/export-excel"
import { exportToPDF } from "@/lib/utils/export-pdf"
import { Pagination } from "@/components/ui/pagination"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"
import Link from "next/link"

export default function ProjectsPage() {
  const { addToast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: "",
    client_name: "",
    location: "",
    contract_value: "",
    start_date: "",
    end_date: "",
    description: "",
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const response = await projectsApi.getProjects({ per_page: 100 })
      const projectArray = Array.isArray(response) ? response : response.data ?? []
      const data = Array.isArray(projectArray) ? projectArray : projectArray.data ?? []
      setProjects(data)
    } catch (error) {
      console.error("Error loading projects:", error)
      addToast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name) newErrors.name = "Project name is required"
    if (!formData.client_name) newErrors.client_name = "Client name is required"
    if (!formData.contract_value) newErrors.contract_value = "Contract value is required"
    if (!formData.start_date) newErrors.start_date = "Start date is required"
    if (formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = "End date must be after start date"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = () => {
    setEditingProject(null)
    setFormData({
      name: "",
      client_name: "",
      location: "",
      contract_value: "",
      start_date: "",
      end_date: "",
      description: "",
    })
    setErrors({})
    setDialogOpen(true)
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      client_name: project.client_name,
      location: project.location || "",
      contract_value: project.contract_value.toString(),
      start_date: project.start_date,
      end_date: project.end_date || "",
      description: project.description || "",
    })
    setErrors({})
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    try {
      const data = {
        name: formData.name,
        client_name: formData.client_name,
        location: formData.location,
        contract_value: parseFloat(formData.contract_value),
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        description: formData.description,
      }

      if (editingProject) {
        await projectsApi.updateProject(editingProject.id, data)
        addToast({
          title: "Success",
          description: "Project updated successfully",
        })
      } else {
        await projectsApi.createProject(data)
        addToast({
          title: "Success",
          description: "Project created successfully",
        })
      }

      setDialogOpen(false)
      loadProjects()
    } catch (error: any) {
      console.error("Error saving project:", error)
      addToast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to save project",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete project "${name}"?`)) return

    setDeleting(id)
    try {
      await projectsApi.deleteProject(id)
      addToast({
        title: "Success",
        description: "Project deleted successfully",
      })
      loadProjects()
    } catch (error: any) {
      console.error("Error deleting project:", error)
      addToast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete project",
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.client_name.toLowerCase().includes(search.toLowerCase()) ||
      project.project_number.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredProjects.length / pageSize)
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=600,width=800")
    if (!printWindow) return

    const htmlContent = `
      <html>
        <head>
          <title>Projects Report</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            h1 { text-align: center; }
          </style>
        </head>
        <body>
          <h1>Projects Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Project #</th>
                <th>Name</th>
                <th>Client</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProjects.map(p => `
                <tr>
                  <td>${p.project_number}</td>
                  <td>${p.name}</td>
                  <td>${p.client_name}</td>
                  <td>${p.status}</td>
                  <td>${p.progress}%</td>
                  <td>${formatCurrency(p.contract_value)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.print()
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
            <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
            <p className="text-muted-foreground mt-1">Kelola semua proyek konstruksi</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Proyek Baru
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Proyek</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
                <FolderKanban className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Proyek Aktif</p>
                  <p className="text-2xl font-bold">{projects.filter(p => p.status === "running").length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Nilai</p>
                  <p className="text-2xl font-bold">{formatCurrency(projects.reduce((sum, p) => sum + (p.contract_value || 0), 0))}</p>
                </div>
                <DollarSign className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tim</p>
                  <p className="text-2xl font-bold">{projects.reduce((sum, p) => sum + (p.members?.length || 0), 0)}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 justify-between flex-wrap">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari proyek..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setStatusFilter("")}>
              <Filter className="h-4 w-4 mr-2" />
              Semua Status
            </Button>
            <Button variant="outline" onClick={() => setStatusFilter("running")}>
              Running
            </Button>
            <Button variant="outline" onClick={() => setStatusFilter("planning")}>
              Planning
            </Button>
            <Button variant="outline" onClick={() => setStatusFilter("completed")}>
              Completed
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const columns = [
                  { key: 'project_number', label: 'Project #' },
                  { key: 'name', label: 'Name' },
                  { key: 'client_name', label: 'Client' },
                  { key: 'status', label: 'Status' },
                  { key: 'progress', label: 'Progress', format: (val: number) => `${val}%` },
                  { key: 'start_date', label: 'Start Date', format: (val: string) => new Date(val).toLocaleDateString() },
                  { key: 'end_date', label: 'End Date', format: (val: string) => val ? new Date(val).toLocaleDateString() : '-' },
                  { key: 'contract_value', label: 'Value', format: (val: number) => formatCurrency(val) },
                ]
                exportToExcel(filteredProjects, columns, 'projects')
                addToast({
                  title: "Success",
                  description: "Projects exported to Excel",
                })
              }}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const columns = [
                  { key: 'project_number', label: 'Project #' },
                  { key: 'name', label: 'Name' },
                  { key: 'client_name', label: 'Client' },
                  { key: 'status', label: 'Status' },
                  { key: 'progress', label: 'Progress', format: (val: number) => `${val}%` },
                  { key: 'start_date', label: 'Start Date', format: (val: string) => new Date(val).toLocaleDateString() },
                  { key: 'end_date', label: 'End Date', format: (val: string) => val ? new Date(val).toLocaleDateString() : '-' },
                  { key: 'contract_value', label: 'Value', format: (val: number) => formatCurrency(val) },
                ]
                exportToPDF(filteredProjects, columns, 'projects', 'Projects Report')
                addToast({
                  title: "Success",
                  description: "Projects exported to PDF",
                })
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{project.client_name}</p>
                    <p className="text-xs text-muted-foreground">{project.project_number}</p>
                    {project.location && <p className="text-xs text-muted-foreground">{project.location}</p>}
                  </div>
                  <Badge variant={
                    project.status === "running" ? "success" : 
                    project.status === "completed" ? "default" : 
                    project.status === "hold" ? "destructive" : 
                    "secondary"
                  }>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nilai Proyek</span>
                    <span className="font-semibold">{formatCurrency(project.contract_value)}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(project.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{project.members?.length || 0} tim</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t space-y-2">
                    <p className="text-sm text-muted-foreground">Manager: {project.manager?.name || '-'}</p>
                    <div className="flex gap-2">
                      <Link href={`/projects/${project.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
                          Detail
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(project)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(project.id, project.name)}
                        disabled={deleting === project.id}
                      >
                        {deleting === project.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No projects found</p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {filteredProjects.length > 0 && (
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
            <DialogDescription>
              {editingProject ? "Update project details" : "Create a new construction project"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className={errors.client_name ? "border-red-500" : ""}
                />
                {errors.client_name && <p className="text-xs text-red-500">{errors.client_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Jakarta"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract_value">Contract Value *</Label>
                <Input
                  id="contract_value"
                  type="number"
                  value={formData.contract_value}
                  onChange={(e) => setFormData({ ...formData, contract_value: e.target.value })}
                  className={errors.contract_value ? "border-red-500" : ""}
                  placeholder="0"
                />
                {errors.contract_value && <p className="text-xs text-red-500">{errors.contract_value}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className={errors.start_date ? "border-red-500" : ""}
                />
                {errors.start_date && <p className="text-xs text-red-500">{errors.start_date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className={errors.end_date ? "border-red-500" : ""}
                />
                {errors.end_date && <p className="text-xs text-red-500">{errors.end_date}</p>}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
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
                  editingProject ? "Update" : "Create"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
