"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { projectsApi, Project } from "@/lib/api/projects"
import { fieldMonitoringApi, FieldMonitoringRecord } from "@/lib/api/field-monitoring"
import { getStorageUrl } from "@/lib/api/config"
import { ChevronDown, Camera, MapPin, Plus, Search, X, Loader2 } from "lucide-react"
import { useCallback } from "react"
import Link from "next/link"

const PAGE_SIZES = [10, 20, 50]

export default function FieldMonitoringPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [records, setRecords] = useState<FieldMonitoringRecord[]>([])
  const [projectFilter, setProjectFilter] = useState<number | "">("")
  const [areaFilter, setAreaFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("list")
  const [selectedRecord, setSelectedRecord] = useState<FieldMonitoringRecord | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    project_id: "",
    area: "",
    location: "",
    workers: "",
    supervisors: "",
    monitoring_date: "",
    latitude: "",
    longitude: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadProjects()
    loadRecords()
  }, [])

  const loadProjects = async () => {
    try {
      const response = await projectsApi.getProjects({ per_page: 100 })
      const list = Array.isArray(response)
        ? response
        : response?.data?.data ?? response?.data ?? []
      setProjects(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error("Failed to load projects", error)
    }
  }

  const loadRecords = async () => {
    try {
      setLoading(true)
      const params: Record<string, any> = {
        project_id: projectFilter || undefined,
        area: areaFilter || undefined,
        location: locationFilter || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      }
      const response = await fieldMonitoringApi.getRecords(params)
      setRecords(response.data || response)
    } catch (error) {
      console.error("Failed to load field monitoring records", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        record.area.toLowerCase().includes(query) ||
        record.location.toLowerCase().includes(query) ||
        record.project?.name.toLowerCase().includes(query) ||
        record.workers?.join(", ").toLowerCase().includes(query) ||
        record.supervisors?.join(", ").toLowerCase().includes(query)
      )
    })
  }, [records, searchQuery])

  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice(0, pageSize)
  }, [filteredRecords, pageSize])

  const projectOptions = Array.isArray(projects) ? projects : []

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.project_id) errors.project_id = "Pilih proyek terlebih dahulu"
    if (!formData.area.trim()) errors.area = "Area diperlukan"
    if (!formData.location.trim()) errors.location = "Lokasi diperlukan"
    if (!formData.monitoring_date.trim()) errors.monitoring_date = "Tanggal monitoring diperlukan"
    setErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    setSaving(true)

    try {
      const media = await Promise.all(
        mediaFiles.map(async (file) => ({
          file_base64: await readFileAsDataURL(file),
          file_name: file.name,
          file_type: file.type || "application/octet-stream",
          file_size: file.size,
        }))
      )

      await fieldMonitoringApi.createRecord({
        project_id: Number(formData.project_id),
        area: formData.area,
        location: formData.location,
        workers: formData.workers ? formData.workers.split(",").map((item) => item.trim()).filter(Boolean) : [],
        supervisors: formData.supervisors ? formData.supervisors.split(",").map((item) => item.trim()).filter(Boolean) : [],
        monitoring_date: formData.monitoring_date,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined,
        notes: formData.notes,
        media: media.length ? media : undefined,
      })

      toast.success("Field monitoring berhasil dibuat")
      setFormData({
        project_id: "",
        area: "",
        location: "",
        workers: "",
        supervisors: "",
        monitoring_date: "",
        latitude: "",
        longitude: "",
        notes: "",
      })
      setMediaFiles([])
      loadRecords()
      setActiveTab("list")
    } catch (error) {
      console.error("Failed to create record", error)
      toast.error("Gagal menyimpan field monitoring")
    } finally {
      setSaving(false)
    }
  }

  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setMediaFiles((current) => [...current, ...files])
  }

  const removeMediaFile = (index: number) => {
    setMediaFiles((current) => current.filter((_, i) => i !== index))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Field Monitoring</h1>
            <p className="text-muted-foreground mt-1">Kelola monitoring pekerja lapangan dan unggah bukti foto/video.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setActiveTab("create")}>Buat Monitoring Baru</Button>
            <Button variant="outline" onClick={loadRecords}>Refresh</Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Daftar</TabsTrigger>
            <TabsTrigger value="create">Buat Baru</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card className="rounded-xl border border-slate-200 bg-[#F8FAFC] shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <MapPin className="h-8 w-8 text-[#0F4C81]" />
                  <div>
                    <CardTitle className="text-2xl">Field Monitoring</CardTitle>
                    <p className="text-sm text-muted-foreground">Monitoring progres pekerjaan lapangan secara realtime.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                  <div>
                    <Label>Proyek</Label>
                    <Select value={projectFilter === "" ? "" : String(projectFilter)} onValueChange={(value) => setProjectFilter(value === "" ? "" : Number(value))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Semua proyek" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Semua proyek</SelectItem>
                        {projectOptions.map((project) => (
                          <SelectItem key={project.id} value={String(project.id)}>{project.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Lokasi</Label>
                    <Input value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} placeholder="Cari lokasi" className="w-full" />
                  </div>
                  <div>
                    <Label>Tanggal Mulai</Label>
                    <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="w-full" />
                  </div>
                  <div>
                    <Label>Tanggal Akhir</Label>
                    <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="w-full" />
                  </div>
                  <div>
                    <Label>Area</Label>
                    <Input value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} placeholder="Cari area" className="w-full" />
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cari Project, Area, Lokasi, Supervisor, Pekerja" className="w-full" />
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div className="flex flex-wrap gap-2 items-end">
                      <Button className="h-10 px-4" onClick={() => loadRecords()} variant="secondary">
                        <Search className="mr-2 h-4 w-4" />Cari
                      </Button>
                      <Button className="h-10 px-4" variant="ghost" onClick={() => { setProjectFilter(""); setAreaFilter(""); setLocationFilter(""); setFromDate(""); setToDate(""); setSearchQuery(""); loadRecords(); }}>
                        Reset Filter
                      </Button>
                      <Button className="h-10 px-4" onClick={() => setActiveTab("create")}>
                        <Plus className="mr-2 h-4 w-4" />Buat Monitoring Baru
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 items-end justify-end">
                      <Button className="h-10 px-4" variant="outline">Export Excel</Button>
                      <Button className="h-10 px-4" variant="outline">Export PDF</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              {loading ? (
                <div className="p-4">
                  <div className="animate-pulse space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-[16px] bg-white border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/3" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                        <div className="w-40 h-3 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-4 w-48 h-32 text-center">
                    <svg viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                      <rect x="2" y="10" width="60" height="30" rx="6" fill="#EAF2FB" />
                      <circle cx="20" cy="25" r="6" fill="#CDE6FB" />
                      <rect x="34" y="18" width="20" height="2" rx="1" fill="#CDE6FB" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold">Belum ada data monitoring</h3>
                  <p className="text-muted-foreground mt-2">Klik "Buat Monitoring Baru" untuk mulai mengunggah progres pekerjaan.</p>
                  <div className="mt-4 flex justify-center">
                    <Button onClick={() => setActiveTab('create')} className="h-10 px-4">Buat Monitoring Baru</Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-separate" style={{ borderSpacing: 0 }}>
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground">
                        <th className="p-3">Foto Before</th>
                        <th className="p-3">Foto After</th>
                        <th className="p-3">Project</th>
                        <th className="p-3">Area</th>
                        <th className="p-3">Lokasi</th>
                        <th className="p-3">PIC</th>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Progress</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.slice(0, pageSize).map((record) => (
                        <tr key={record.id} className="align-top bg-white border-b border-gray-100 hover:shadow-sm">
                          <td className="p-3 align-middle">
                            {record.media && record.media[0] ? (
                              <img
                                src={getStorageUrl(record.media[0].file_path)}
                                alt={record.media[0].file_name}
                                className="w-20 h-20 object-cover rounded-lg cursor-pointer border"
                                onClick={() => setSelectedRecord(record)}
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-muted-foreground">No</div>
                            )}
                          </td>
                          <td className="p-3 align-middle">
                            {record.media && record.media[1] ? (
                              <img src={getStorageUrl(record.media[1].file_path)} alt={record.media[1].file_name} className="w-20 h-20 object-cover rounded-lg border cursor-pointer" onClick={() => setSelectedRecord(record)} />
                            ) : (
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-muted-foreground">No</div>
                            )}
                          </td>
                          <td className="p-3 align-middle">
                            <div className="font-semibold">{record.project?.name || '-'}</div>
                          </td>
                          <td className="p-3 align-middle">{record.area}</td>
                          <td className="p-3 align-middle">{record.location}</td>
                          <td className="p-3 align-middle">{record.supervisors?.join(', ') || record.workers?.join(', ') || '-'}</td>
                          <td className="p-3 align-middle">{new Date(record.monitoring_date).toLocaleDateString()}</td>
                          <td className="p-3 align-middle">
                            {(() => {
                              const status = (((record as any).status) || 'Draft').toLowerCase()
                              const map: Record<string, string> = {
                                draft: 'bg-gray-200 text-gray-700',
                                progress: 'bg-blue-100 text-blue-700',
                                review: 'bg-yellow-100 text-yellow-800',
                                completed: 'bg-green-100 text-green-700',
                                rejected: 'bg-red-100 text-red-700',
                              }
                              const cls = map[status] || 'bg-gray-200 text-gray-700'
                              return <span className={`inline-block px-3 py-1 rounded-full text-sm ${cls}`}>{((record as any).status) || 'Draft'}</span>
                            })()}
                          </td>
                          <td className="p-3 align-middle">
                            <div className="w-40 bg-gray-100 rounded-full h-3 overflow-hidden">
                              <div className="h-3 bg-[#0F4C81]" style={{ width: `${Math.min(100, (record as any).progress ?? 0)}%` }} />
                            </div>
                            <div className="text-xs mt-1">{((record as any).progress) ?? 0}%</div>
                          </td>
                          <td className="p-3 align-middle">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>Detail</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create">
            <Card className="space-y-4">
              <CardHeader>
                <CardTitle>Buat Catatan Monitoring</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Proyek</Label>
                    <Select value={String(formData.project_id)} onValueChange={(value) => handleFormChange('project_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih proyek" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Pilih proyek</SelectItem>
                        {projectOptions.map((project) => (
                          <SelectItem key={project.id} value={String(project.id)}>{project.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.project_id && <p className="mt-1 text-sm text-destructive">{errors.project_id}</p>}
                  </div>
                  <div>
                    <Label>Area</Label>
                    <Input value={formData.area} onChange={(event) => handleFormChange('area', event.target.value)} placeholder="Nama area" />
                    {errors.area && <p className="mt-1 text-sm text-destructive">{errors.area}</p>}
                  </div>
                  <div>
                    <Label>Lokasi</Label>
                    <Input value={formData.location} onChange={(event) => handleFormChange('location', event.target.value)} placeholder="Detail lokasi lapangan" />
                    {errors.location && <p className="mt-1 text-sm text-destructive">{errors.location}</p>}
                  </div>
                  <div>
                    <Label>Tanggal Monitoring</Label>
                    <Input type="date" value={formData.monitoring_date} onChange={(event) => handleFormChange('monitoring_date', event.target.value)} />
                    {errors.monitoring_date && <p className="mt-1 text-sm text-destructive">{errors.monitoring_date}</p>}
                  </div>
                  <div>
                    <Label>Pekerja</Label>
                    <Input value={formData.workers} onChange={(event) => handleFormChange('workers', event.target.value)} placeholder="Pisahkan dengan koma" />
                  </div>
                  <div>
                    <Label>Supervisor</Label>
                    <Input value={formData.supervisors} onChange={(event) => handleFormChange('supervisors', event.target.value)} placeholder="Pisahkan dengan koma" />
                  </div>
                  <div>
                    <Label>Latitude</Label>
                    <Input type="number" step="0.000001" value={formData.latitude} onChange={(event) => handleFormChange('latitude', event.target.value)} placeholder="Latitude" />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <Input type="number" step="0.000001" value={formData.longitude} onChange={(event) => handleFormChange('longitude', event.target.value)} placeholder="Longitude" />
                  </div>
                </div>

                <div>
                  <Label>Catatan</Label>
                  <Textarea value={formData.notes} onChange={(event) => handleFormChange('notes', event.target.value)} placeholder="Tulis deskripsi singkat" rows={4} />
                </div>

                <div className="grid gap-2">
                  <Label>Bukti Foto / Video</Label>
                  <input type="file" accept="image/*,video/*" multiple onChange={handleMediaChange} className="file-input" />
                  {mediaFiles.length > 0 && (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {mediaFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between gap-2 rounded-lg border p-2">
                          <div className="min-w-0 flex-1 overflow-hidden text-sm text-slate-700">{file.name}</div>
                          <Button variant="ghost" size="icon" onClick={() => removeMediaFile(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button onClick={handleSubmit} disabled={saving}>
                    {saving ? "Menyimpan..." : "Simpan Monitoring"}
                  </Button>
                  <Button variant="ghost" onClick={() => setActiveTab("list")}>Batal</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedRecord && (
          <Card className="border-blue-500/20">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Detail Monitoring</CardTitle>
                <p className="text-sm text-muted-foreground">{selectedRecord.project?.name}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedRecord(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Area</p>
                <p>{selectedRecord.area}</p>
                <p className="text-sm text-muted-foreground">Lokasi</p>
                <p>{selectedRecord.location}</p>
                <p className="text-sm text-muted-foreground">Tanggal Monitoring</p>
                <p>{new Date(selectedRecord.monitoring_date).toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground">Koordinat</p>
                <p>{selectedRecord.latitude ?? '-'}, {selectedRecord.longitude ?? '-'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Pekerja</p>
                <p>{selectedRecord.workers?.join(', ') || '-'}</p>
                <p className="text-sm text-muted-foreground">Supervisor</p>
                <p>{selectedRecord.supervisors?.join(', ') || '-'}</p>
                <p className="text-sm text-muted-foreground">Dibuat oleh</p>
                <p>{selectedRecord.createdBy?.name || '-'}</p>
                <p className="text-sm text-muted-foreground">Catatan</p>
                <p>{selectedRecord.notes || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Galeri Bukti</p>
                  <Badge variant="secondary">{selectedRecord.media?.length || 0} file</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedRecord.media?.map((media) => (
                    <div key={media.id} className="rounded-lg border overflow-hidden bg-slate-50">
                      {media.file_type.startsWith('image/') ? (
                        <img src={getStorageUrl(media.file_path)} alt={media.file_name} className="h-48 w-full object-cover" />
                      ) : (
                        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">{media.file_name}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
