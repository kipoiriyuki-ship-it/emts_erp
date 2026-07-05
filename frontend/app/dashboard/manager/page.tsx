"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/charts/stat-card"
import { BarChart } from "@/components/charts/bar-chart"
import { LineChart } from "@/components/charts/line-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FolderKanban, 
  TrendingUp, 
  Calendar, 
  Users,
  ArrowRight,
  Clock
} from "lucide-react"
import { dashboardApi, ManagerDashboardData } from "@/lib/api/dashboard"
import { safeArray, safeNumber } from "@/lib/utils/safe-access"

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ManagerDashboardData | null>(null)
  const [charts, setCharts] = useState<any>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const [dashboardResponse, chartsResponse] = await Promise.all([
        dashboardApi.getManagerDashboard(),
        dashboardApi.getCharts(),
      ])
      setData(dashboardResponse)
      setCharts(chartsResponse)
    } catch (error) {
      console.error("Error loading dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Manager Proyek</h1>
          <p className="text-muted-foreground mt-1">Overview proyek dan progress tim</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Proyek"
            value={safeNumber(data.projects?.total)}
            icon={FolderKanban}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Proyek Aktif"
            value={safeNumber(data.projects?.active)}
            icon={FolderKanban}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Proyek Selesai"
            value={safeNumber(data.projects?.completed)}
            icon={FolderKanban}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Progress Rata-rata"
            value={`${safeNumber(data.projects?.avg_progress).toFixed(1)}%`}
            icon={TrendingUp}
            trend={{ value: 0, isPositive: true }}
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {charts?.project_progress && (
            <BarChart
              data={charts.project_progress}
              title="Progress Proyek"
              dataKeys={[{ key: 'progress', color: '#2563EB', name: 'Progress' }]}
              xAxisKey="name"
            />
          )}
          {charts?.team_performance && charts.team_performance.length > 0 && (
            <LineChart
              data={charts.team_performance}
              title="Performa Tim"
              dataKey="performance"
              xAxisKey="member"
              color="#22C55E"
            />
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Proyek Saya</CardTitle>
          </CardHeader>
          <CardContent>
            {safeArray(data.my_projects).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No projects found</p>
            ) : (
              <div className="space-y-4">
                {safeArray(data.my_projects).map((project: any) => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">{project.client_name || '-'}</p>
                      </div>
                      <Badge variant={
                        project.status === "running" ? "success" : 
                        project.status === "completed" ? "default" : 
                        project.status === "hold" ? "warning" : "secondary"
                      }>
                        {project.status || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span className="font-medium">{project.progress || 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Deadline: {project.end_date || '-'}</span>
                      <Button size="sm" variant="outline" className="h-7">
                        Detail
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  Lihat Semua Proyek
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {safeArray(data.recent_progress).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No progress updates found</p>
            ) : (
              <div className="space-y-4">
                {safeArray(data.recent_progress).map((progress: any) => (
                  <div key={progress.id} className="flex gap-4 border-l-2 border-slate-200 pl-4 relative">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full border-2 border-white" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{progress.project?.name || 'Unknown Project'}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{progress.created_at?.split('T')[0] || '-'}</span>
                        </div>
                      </div>
                      <p className="text-sm">{progress.description || '-'}</p>
                      <Badge variant="secondary" className="mt-2">
                        Progress: {progress.percentage || 0}%
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  Lihat Semua Progress
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
