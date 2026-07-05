"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/charts/stat-card"
import { LineChart } from "@/components/charts/line-chart"
import { PieChart } from "@/components/charts/pie-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  MapPin,
  ArrowRight,
  LogOut
} from "lucide-react"
import { dashboardApi, EmployeeDashboardData } from "@/lib/api/dashboard"
import { safeArray, safeNumber } from "@/lib/utils/safe-access"

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<EmployeeDashboardData | null>(null)
  const [charts, setCharts] = useState<any>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const [dashboardResponse, chartsResponse] = await Promise.all([
        dashboardApi.getEmployeeDashboard(),
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

  const handleCheckIn = () => {
    // Implement check-in logic
    console.log("Check in")
  }

  const handleCheckOut = () => {
    // Implement check-out logic
    console.log("Check out")
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Karyawan</h1>
          <p className="text-muted-foreground mt-1">Overview jadwal kerja dan tugas harian</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Status Kehadiran Hari Ini"
            value={data.attendance?.today_status === "not_recorded" ? "Belum Absen" : data.attendance?.today_status || "Belum Absen"}
            icon={CheckCircle}
          />
          <StatCard
            title="Hadir Bulan Ini"
            value={`${safeNumber(data.attendance?.this_month_present)} hari`}
            icon={Calendar}
          />
          <div className="p-6 border rounded-lg bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Lokasi Saat Ini</span>
            </div>
            <p className="text-lg font-bold">Office</p>
            <p className="text-xs text-muted-foreground">Jakarta, Indonesia</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {charts?.personal_attendance && (
            <LineChart
              data={charts.personal_attendance}
              title="Kehadiran 30 Hari Terakhir"
              dataKey="hours"
              xAxisKey="date"
              color="#2563EB"
            />
          )}
          {charts?.task_completion && (
            <PieChart
              data={charts.task_completion}
              title="Status Tugas"
              dataKey="value"
              nameKey="name"
            />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Jadwal Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              {safeArray(data.today_schedule).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No schedule for today</p>
              ) : (
                <div className="space-y-4">
                  {safeArray(data.today_schedule).map((schedule: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 border-b pb-3 last:border-0">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{schedule.activity || schedule.title || '-'}</p>
                        <p className="text-xs text-muted-foreground">{schedule.time || '-'}</p>
                        <p className="text-xs text-muted-foreground">{schedule.location || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Absensi</span>
                <Badge variant={data.attendance.today_status === "present" ? "success" : data.attendance.today_status === "late" ? "warning" : "destructive"}>
                  {data.attendance?.today_status === "present" ? "Sudah Hadir" : data.attendance?.today_status === "late" ? "Terlambat" : "Belum Absen"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.attendance?.today_status === "not_recorded" || data.attendance?.today_status === "absent" ? (
                  <Button className="w-full" onClick={handleCheckIn}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check In
                  </Button>
                ) : (
                  <Button className="w-full" variant="destructive" onClick={handleCheckOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Check Out
                  </Button>
                )}
                <div className="text-center text-sm text-muted-foreground">
                  <p>Status: {data.attendance?.today_status || "not_recorded"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Proyek Saya</CardTitle>
          </CardHeader>
          <CardContent>
            {safeArray(data.projects).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No projects assigned</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Proyek</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeArray(data.projects).map((project: any) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.manager?.name || '-'}</TableCell>
                      <TableCell>{project.progress || 0}%</TableCell>
                      <TableCell>
                        <Badge variant={
                          project.status === "running" ? "success" : 
                          project.status === "completed" ? "default" : 
                          project.status === "hold" ? "warning" : "secondary"
                        }>
                          {project.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengingat</CardTitle>
          </CardHeader>
          <CardContent>
            {safeArray(data.reminders).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No reminders</p>
            ) : (
              <div className="space-y-4">
                {safeArray(data.reminders).map((reminder: any) => (
                  <div key={reminder.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                    <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{reminder.title}</p>
                      <p className="text-xs text-muted-foreground">{reminder.reminder_date?.split('T')[0] || '-'}</p>
                      <p className="text-xs text-muted-foreground">{reminder.description || '-'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
