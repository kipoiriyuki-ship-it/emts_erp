"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/charts/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Users, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { dashboardApi, AdminDashboardData } from "@/lib/api/dashboard"
import { Attendance } from "@/lib/types"
import { safeArray, safeNumber } from "@/lib/utils/safe-access"

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AdminDashboardData | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const response = await dashboardApi.getAdminDashboard()
      setData(response)
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrasi</h1>
          <p className="text-muted-foreground mt-1">Overview operasional harian dan administrasi</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Hadir Hari Ini"
            value={safeNumber(data.attendance?.today_present)}
            icon={Users}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Terlambat"
            value={safeNumber(data.attendance?.today_late)}
            icon={Clock}
            trend={{ value: 0, isPositive: false }}
          />
          <StatCard
            title="Absen"
            value={safeNumber(data.attendance?.today_absent)}
            icon={XCircle}
            trend={{ value: 0, isPositive: false }}
          />
          <StatCard
            title="Pengeluaran Pending"
            value={safeNumber(data.expenses?.pending_expenses)}
            icon={DollarSign}
            trend={{ value: 0, isPositive: false }}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Absensi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Jam Kerja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeArray<Attendance>(data.recent_attendance).length > 0 ? (
                  safeArray<Attendance>(data.recent_attendance).map((attendance) => (
                    <TableRow key={attendance.id}>
                      <TableCell className="font-medium">{attendance.user?.name}</TableCell>
                      <TableCell>{attendance.check_in_time || "-"}</TableCell>
                      <TableCell>{attendance.check_out_time || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={attendance.status === "present" ? "success" : attendance.status === "late" ? "warning" : "destructive"}>
                          {attendance.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{attendance.work_hours > 0 ? `${attendance.work_hours} jam` : "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Tidak ada data absensi hari ini
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
