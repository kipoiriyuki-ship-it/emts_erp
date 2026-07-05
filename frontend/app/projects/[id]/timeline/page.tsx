"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Loader2,
  Plus
} from "lucide-react"
import Link from "next/link"
import { projectsApi, Project, ProjectMilestone } from "@/lib/api/projects"

export default function ProjectTimelinePage() {
  const params = useParams()
  const projectId = parseInt(params.id as string)
  const [project, setProject] = useState<Project | null>(null)
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([])
  const [timelineItems, setTimelineItems] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'milestone' | 'progress'>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [projectResponse, milestonesResponse, timelineResponse] = await Promise.all([
        projectsApi.getProject(projectId),
        projectsApi.getMilestones(projectId),
        projectsApi.getTimeline(projectId),
      ])
      setProject(projectResponse)
      setMilestones(milestonesResponse)
      setTimelineItems(timelineResponse.items || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = timelineItems
    .filter((item) => filter === 'all' || item.type === filter)
    .sort((a, b) => {
      const comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const groupedItems = filteredItems.reduce((acc, item) => {
    const date = new Date(item.date)
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    if (!acc[monthKey]) acc[monthKey] = [] as any[]
    acc[monthKey].push(item)
    return acc
  }, {} as Record<string, any[]>)

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
              <h1 className="text-3xl font-bold tracking-tight">Project Timeline</h1>
              <p className="text-muted-foreground mt-1">{project?.name}</p>
            </div>
          </div>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Export Calendar
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua aktivitas</SelectItem>
              <SelectItem value="milestone">Milestone</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Terlama dahulu</SelectItem>
              <SelectItem value="desc">Terbaru dahulu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {Object.keys(groupedItems).length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No milestones defined yet</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add First Milestone
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedItems as Record<string, any[]>).map(([month, monthItems]) => {
              const items = monthItems as any[]
              return (
              <div key={month}>
                <h3 className="text-xl font-semibold mb-4">{month}</h3>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <Card key={`${item.type}-${item.id}`}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              item.type === 'milestone' && item.status === 'completed' ? "bg-green-600 border-green-600" :
                              item.type === 'milestone' && item.status === 'in_progress' ? "bg-blue-600 border-blue-600" :
                              item.type === 'milestone' && item.status === 'delayed' ? "bg-red-600 border-red-600" :
                              item.type === 'progress' ? "bg-purple-600 border-purple-600" :
                              "bg-white border-slate-300"
                            }`} />
                            {index < monthItems.length - 1 && (
                              <div className="w-0.5 h-full bg-slate-200 mt-2" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant={
                                    item.type === 'milestone' && item.status === 'completed' ? 'success' :
                                    item.type === 'milestone' && item.status === 'in_progress' ? 'default' :
                                    item.type === 'milestone' && item.status === 'delayed' ? 'destructive' :
                                    'secondary'
                                  }>
                                    {item.type === 'milestone' ? item.status : 'progress'}
                                  </Badge>
                                  <p className="font-semibold">{item.title}</p>
                                </div>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(item.date).toLocaleDateString()}</span>
                                  </div>
                                  {item.progress > 0 && (
                                    <div className="flex items-center gap-1">
                                      <span>Progress: {item.progress}%</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {item.type === 'milestone' && item.status === 'completed' && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                              {item.type === 'milestone' && item.status === 'in_progress' && (
                                <Clock className="h-5 w-5 text-blue-600" />
                              )}
                              {item.type === 'milestone' && item.status === 'delayed' && (
                                <Clock className="h-5 w-5 text-red-600" />
                              )}
                              {item.type === 'milestone' && item.status === 'pending' && (
                                <Circle className="h-5 w-5 text-slate-300" />
                              )}
                              {item.type === 'progress' && (
                                <Clock className="h-5 w-5 text-purple-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
