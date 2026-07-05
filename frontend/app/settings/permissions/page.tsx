"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Search, Loader2, Shield } from "lucide-react"
import { permissionsApi, Permission } from "@/lib/api/permissions"
import { useToast } from "@/components/ui/toast"

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [moduleFilter, setModuleFilter] = useState("")
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    module: "",
    description: "",
  })

  const modules = ["USERS", "PROJECTS", "FINANCE", "ACCOUNTING", "ATTENDANCE", "REPORTS", "SETTINGS", "APPROVALS", "AUDIT"]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await permissionsApi.getPermissions()
      setPermissions(response.permissions)
    } catch (error) {
      console.error("Error loading permissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingPermission(null)
    setFormData({
      name: "",
      code: "",
      module: "",
      description: "",
    })
    setDialogOpen(true)
  }

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission)
    setFormData({
      name: permission.name,
      code: permission.code,
      module: permission.module,
      description: permission.description || "",
    })
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingPermission) {
        await permissionsApi.updatePermission(editingPermission.id, formData)
        addToast({ title: "Success", description: "Permission updated successfully" })
      } else {
        await permissionsApi.createPermission(formData)
        addToast({ title: "Success", description: "Permission created successfully" })
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("Error saving permission:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to save permission. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this permission?")) return
    setDeleting(id)
    try {
      await permissionsApi.deletePermission(id)
      addToast({ title: "Success", description: "Permission deleted successfully" })
      loadData()
    } catch (error) {
      console.error("Error deleting permission:", error)
      addToast({ 
        title: "Error", 
        description: "Cannot delete permission assigned to roles",
        variant: "destructive"
      })
    } finally {
      setDeleting(null)
    }
  }

  const filteredPermissions = permissions.filter((perm) => {
    const matchesSearch = perm.name.toLowerCase().includes(search.toLowerCase()) ||
                         perm.code.toLowerCase().includes(search.toLowerCase())
    const matchesModule = !moduleFilter || perm.module === moduleFilter
    return matchesSearch && matchesModule
  })

  const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = []
    acc[perm.module].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

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
            <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
            <p className="text-muted-foreground mt-1">Manage system permissions and access controls</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Permission
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Permissions</CardTitle>
            <CardDescription>View and manage system permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Modules</SelectItem>
                  {modules.map((module) => (
                    <SelectItem key={module} value={module}>{module}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {Object.keys(groupedPermissions).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No permissions found</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([module, modulePerms]) => (
                  <div key={module}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {module}
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {modulePerms.map((perm) => (
                          <TableRow key={perm.id}>
                            <TableCell className="font-medium">{perm.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{perm.code}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{perm.description || "-"}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(perm)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(perm.id)}
                                  disabled={deleting === perm.id}
                                >
                                  {deleting === perm.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPermission ? "Edit Permission" : "Create Permission"}</DialogTitle>
              <DialogDescription>
                {editingPermission ? "Update permission information" : "Add a new permission to the system"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="View Users"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="USERS.VIEW"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="module">Module</Label>
                <Select value={formData.module} onValueChange={(value) => setFormData({ ...formData, module: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module} value={module}>{module}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Permission to view users list"
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
                    editingPermission ? "Update" : "Create"
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
