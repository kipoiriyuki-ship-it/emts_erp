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
import { Key, Plus, Copy, Trash2, Loader2 } from "lucide-react"
import { licenseApi, License } from "@/lib/api/license"

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: 'STANDARD' as 'TRIAL' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE',
    max_users: 5,
    max_projects: 10,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
  })

  useEffect(() => {
    loadLicenses()
  }, [])

  const loadLicenses = async () => {
    try {
      setLoading(true)
      const response = await licenseApi.getAll()
      setLicenses(response.licenses)
    } catch (error) {
      console.error("Error loading licenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    try {
      await licenseApi.generate(formData)
      setDialogOpen(false)
      loadLicenses()
      setFormData({
        type: 'STANDARD',
        max_users: 5,
        max_projects: 10,
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: '',
      })
    } catch (error) {
      console.error("Error generating license:", error)
    } finally {
      setGenerating(false)
    }
  }

  const handleDeactivate = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate this license?")) return
    try {
      await licenseApi.deactivate(id)
      loadLicenses()
    } catch (error) {
      console.error("Error deactivating license:", error)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
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
            <h1 className="text-3xl font-bold tracking-tight">License Management</h1>
            <p className="text-muted-foreground mt-1">Generate and manage license codes</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate License
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New License</DialogTitle>
                <DialogDescription>Create a new license code for user activation</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">License Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as typeof formData.type })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRIAL">Trial</SelectItem>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_users">Max Users</Label>
                  <Input
                    id="max_users"
                    type="number"
                    min="1"
                    value={formData.max_users}
                    onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_projects">Max Projects</Label>
                  <Input
                    id="max_projects"
                    type="number"
                    min="1"
                    value={formData.max_projects}
                    onChange={(e) => setFormData({ ...formData, max_projects: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valid_from">Valid From</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valid_until">Valid Until (Optional)</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate License"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Licenses</CardTitle>
            <CardDescription>Manage generated license codes</CardDescription>
          </CardHeader>
          <CardContent>
            {licenses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No licenses generated yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Max Users</TableHead>
                    <TableHead>Max Projects</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Used By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses.map((license) => (
                    <TableRow key={license.id}>
                      <TableCell className="font-mono">
                        <div className="flex items-center gap-2">
                          <span>{license.code}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(license.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{license.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={license.is_active ? "success" : "destructive"}>
                          {license.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {license.is_used && <Badge variant="secondary" className="ml-1">Used</Badge>}
                      </TableCell>
                      <TableCell>{license.max_users}</TableCell>
                      <TableCell>{license.max_projects}</TableCell>
                      <TableCell>{license.valid_until || "Unlimited"}</TableCell>
                      <TableCell>{license.user?.name || "-"}</TableCell>
                      <TableCell>
                        {license.is_active && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeactivate(license.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Deactivate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
