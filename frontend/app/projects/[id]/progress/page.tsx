"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  ArrowLeft,
  Plus,
  Calendar,
  TrendingUp,
  Camera,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { projectsApi, ProjectProgress, Project } from "@/lib/api/projects"

export default function ProjectProgressPage() {
  const params = useParams()
  const projectId = parseInt(params.id as string)
  const [project, setProject] = useState<Project | null>(null)
  const [progressEntries, setProgressEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    percentage: "",
    description: "",
    challenges: "",
    solutions: "",
  })

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [projectResponse] = await Promise.all([
        projectsApi.getProject(projectId),
      ])
      setProject(projectResponse)
      setProgressEntries(projectResponse.progressRecords || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await projectsApi.addProgress(projectId, {
        date: formData.date,
        percentage: parseInt(formData.percentage),
        description: formData.description,
        challenges: formData.challenges || undefined,
        solutions: formData.solutions || undefined,
      })
      setDialogOpen(false)
      setFormData({
        date: new Date().toISOString().split('T')[0],
        percentage: "",
        description: "",
        challenges: "",
        solutions: "",
      })
      loadData()
    } catch (error) {
      console.error("Error adding progress:", error)
    } finally {
      setSaving(false)
    }
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
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Project Progress</h1>
              <p className="text-muted-foreground mt-1">{project?.name}</p>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Progress
          </Button>
        </div>

        {/* Progress Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Progress</p>
                  <p className="text-2xl font-bold">{project?.progress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold">{progressEntries.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">With Challenges</p>
                  <p className="text-2xl font-bold">{progressEntries.filter((e) => e.challenges).length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contract Value</p>
                  <p className="text-2xl font-bold">{project?.contract_value ? project.contract_value.toLocaleString() : '-'}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Entries */}
        <div className="space-y-4">
          {progressEntries.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No progress entries yet</p>
                <Button onClick={() => setDialogOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Progress
                </Button>
              </CardContent>
            </Card>
          ) : (
            progressEntries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{entry.description || 'Progress Update'}</CardTitle>
                      <CardDescription>{new Date(entry.date).toLocaleDateString()}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success">+{entry.percentage}%</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {entry.challenges && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-amber-800">Challenge</p>
                            <p className="text-sm text-amber-700">{entry.challenges}</p>
                            {entry.solutions && (
                              <>
                                <p className="font-medium text-sm text-green-800 mt-2">Solution</p>
                                <p className="text-sm text-green-700">{entry.solutions}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add Progress Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Progress Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProgress} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="percentage">Persentase Progress (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                    placeholder="0-100"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi pekerjaan yang dilakukan..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="challenges">Kendala (Opsional)</Label>
                <Textarea
                  id="challenges"
                  value={formData.challenges}
                  onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                  placeholder="Jika ada kendala, jelaskan di sini..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="solutions">Solusi (Opsional)</Label>
                <Textarea
                  id="solutions"
                  value={formData.solutions}
                  onChange={(e) => setFormData({ ...formData, solutions: e.target.value })}
                  placeholder="Solusi untuk kendala yang dihadapi..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Progress"
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
