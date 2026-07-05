"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/charts/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ArrowLeft,
  Edit,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  TrendingUp,
  FileText,
  Download,
  Paperclip,
  AlertTriangle,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { projectsApi, Project, ProjectDoc } from "@/lib/api/projects"
import { getApiOrigin } from "@/lib/api/config"

export default function ProjectDetailPage() {
  const params = useParams()
  const projectIdParam = params?.id
  const projectId = Array.isArray(projectIdParam) ? projectIdParam[0] : projectIdParam
  const [project, setProject] = useState<Project | null>(null)
  const [documents, setDocuments] = useState<ProjectDoc[]>([])
  const [budgetSummary, setBudgetSummary] = useState<any>(null)
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentTitle, setDocumentTitle] = useState("")
  const [documentDescription, setDocumentDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null)

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return
      try {
        setLoading(true)
        const projectData = await projectsApi.getProject(parseInt(projectId, 10))
        const [budget, activityLogsData] = await Promise.all([
          projectsApi.getBudgetSummary(parseInt(projectId, 10)),
          projectsApi.getActivityLogs(parseInt(projectId, 10)),
        ])
        setProject(projectData)
        setDocuments(projectData.documents || [])
        setBudgetSummary(budget)
        setActivityLogs(activityLogsData || [])
      } catch (error) {
        console.error("Error loading project detail:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [projectId])

  useEffect(() => {
    if (project?.documents) {
      setDocuments(project.documents)
    }
  }, [project])

  const backendUrl = getApiOrigin()

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

  const handleUploadDocument = async () => {
    if (!project || !selectedFile) {
      return
    }

    if (!documentTitle.trim()) {
      setUploadError("Judul dokumen diperlukan.")
      return
    }

    setUploadError(null)
    setUploading(true)

    try {
      const fileBase64 = await readFileAsDataURL(selectedFile)
      const uploadedDoc = await projectsApi.uploadDocument(project.id, {
        title: documentTitle,
        description: documentDescription || undefined,
        file_base64: fileBase64,
        file_name: selectedFile.name,
        file_type: selectedFile.type || "application/octet-stream",
        file_size: selectedFile.size,
      })

      setDocuments((current) => [uploadedDoc, ...current])
      setSelectedFile(null)
      setDocumentTitle("")
      setDocumentDescription("")
      toast.success("Dokumen berhasil diunggah")
    } catch (error) {
      console.error("Document upload failed:", error)
      setUploadError("Unggah dokumen gagal. Silakan coba lagi.")
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadDocument = async (doc: ProjectDoc) => {
    await projectsApi.downloadDocument(project!.id, doc.id)
  }

  const handleDeleteDocument = async (doc: ProjectDoc) => {
    if (!project) return

    setDeletingDocId(doc.id)
    try {
      await projectsApi.deleteDocument(project.id, doc.id)
      setDocuments((current) => current.filter((item) => item.id !== doc.id))
      toast.success("Dokumen berhasil dihapus")
    } catch (error) {
      console.error("Document delete failed:", error)
      toast.error("Gagal menghapus dokumen")
    } finally {
      setDeletingDocId(null)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">Loading project details...</div>
      </DashboardLayout>
    )
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">Project not found.</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <p className="text-muted-foreground mt-1">{project.client_name} • {project.location || "-"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Nilai Proyek"
            value={formatCurrency(project.contract_value)}
            icon={DollarSign}
          />
          <StatCard
            title="Progress"
            value={`${project.progress}%`}
            icon={TrendingUp}
          />
          <StatCard
            title="Status"
            value={project.status}
            icon={DollarSign}
          />
          <StatCard
            title="Ukuran Tim"
            value={project.members?.length ?? 0}
            icon={Users}
          />
        </div>

        {/* Project Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Proyek</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Mulai:</span>
                  <span className="font-medium">{new Date(project.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Selesai:</span>
                  <span className="font-medium">{project.end_date ? new Date(project.end_date).toLocaleDateString() : "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Lokasi:</span>
                  <span className="font-medium">{project.location || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-medium">{budgetSummary ? formatCurrency(budgetSummary.budget?.total_budget || 0) : "-"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Manager:</span>
                  <span className="font-medium">{project.manager?.name || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Tim:</span>
                  <span className="font-medium">{project.members?.length ?? 0} orang</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={project.status === "running" ? "success" : project.status === "completed" ? "default" : "secondary"}>
                    {project.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Sisa Budget:</span>
                  <span className={`font-medium ${budgetSummary?.remaining_budget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {budgetSummary ? formatCurrency(budgetSummary.remaining_budget) : "-"}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Deskripsi:</p>
              <p className="text-sm">{project.description || "Tidak ada deskripsi proyek."}</p>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress Total</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle>Milestone</CardTitle>
            </CardHeader>
            <CardContent>
              {project.milestones?.length ? (
                <div className="space-y-4">
                  {project.milestones.map((milestone: any, index: number) => (
                    <div key={milestone.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          milestone.status === "completed" ? "bg-green-600" :
                          milestone.status === "in_progress" ? "bg-blue-600" :
                          "bg-slate-300"
                        }`} />
                        {project.milestones && index < project.milestones.length - 1 && (
                          <div className="w-0.5 h-12 bg-slate-200 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{milestone.title}</p>
                          <Badge variant={milestone.status === "completed" ? "success" : milestone.status === "in_progress" ? "default" : "secondary"}>
                            {milestone.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : "-"}</p>
                        {typeof milestone.progress === "number" && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{milestone.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${milestone.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada milestone tersedia.</p>
              )}
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle>Anggota Tim</CardTitle>
            </CardHeader>
            <CardContent>
              {project.members?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.members.map((member: any) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.user?.name || member.name || "-"}</TableCell>
                        <TableCell>{member.role || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="success">active</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada anggota tim terdaftar.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLogs.length ? (
              <div className="space-y-3">
                {activityLogs.slice(0, 5).map((log: any, index: number) => (
                  <div key={index} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{log.description}</p>
                    <p className="text-xs text-muted-foreground">{log.user?.name || '-'} • {new Date(log.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada log aktivitas proyek.</p>
            )}
          </CardContent>
        </Card>

        {/* Project Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Dokumen Proyek</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length ? (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 bg-slate-50">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-muted-foreground">{doc.file_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadDocument(doc)}
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Download className="h-4 w-4" />
                          Unduh
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc)}
                          disabled={deletingDocId === doc.id}
                          className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {deletingDocId === doc.id ? "Menghapus..." : "Hapus"}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{doc.file_type}</span>
                      <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                      {doc.uploader?.name && <span>Diunggah oleh {doc.uploader.name}</span>}
                    </div>
                    {doc.description && <p className="text-sm text-slate-700">{doc.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Tidak ada dokumen proyek yang tersedia.</p>
            )}

            <div className="mt-6 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Judul Dokumen</label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Contoh: Foto lapangan"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Deskripsi</label>
                <textarea
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  className="w-full resize-none rounded-md border border-input px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={3}
                  placeholder="Catatan singkat tentang dokumen"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Pilih File</label>
                <input
                  type="file"
                  accept="*/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-700"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-slate-600">File siap diunggah: {selectedFile.name}</p>
                )}
              </div>

              {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

              <Button
                variant="outline"
                disabled={!selectedFile || !documentTitle.trim() || uploading}
                onClick={handleUploadDocument}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                {uploading ? 'Mengunggah...' : 'Unggah Dokumen'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
