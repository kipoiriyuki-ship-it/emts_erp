"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/charts/stat-card"
import { LineChart } from "@/components/charts/line-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { AreaChart } from "@/components/charts/area-chart"
import { PieChart } from "@/components/charts/pie-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  FolderKanban, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Clock, 
  XCircle,
  ArrowRight,
  Calendar,
  Users,
  Building2
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { dashboardApi, DirectorDashboardData } from "@/lib/api/dashboard"
import { safeNumber, safeArray, formatPercent } from "@/lib/utils/safe-access"

export default function DirectorDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DirectorDashboardData | null>(null)
  const [charts, setCharts] = useState<any>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const [dashboardResponse, chartsResponse] = await Promise.all([
        dashboardApi.getDirectorDashboard(),
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Direktur</h1>
          <p className="text-muted-foreground mt-1">Overview perusahaan dan analisis finansial</p>
        </div>

        {/* Project Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Proyek"
            value={safeNumber(data.stats?.total_projects)}
            icon={FolderKanban}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Proyek Aktif"
            value={safeNumber(data.stats?.active_projects)}
            icon={Building2}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Proyek Selesai"
            value={safeNumber(data.stats?.completed_projects)}
            icon={CheckCircle}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Progress Rata-rata"
            value={formatPercent(data.stats?.total_progress)}
            icon={TrendingUp}
            trend={{ value: 0, isPositive: true }}
          />
        </div>

        {/* Financial Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Saldo Kas"
            value={formatCurrency(safeNumber(data.financial?.cash_balance))}
            icon={DollarSign}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Saldo Bank"
            value={formatCurrency(safeNumber(data.financial?.bank_balance))}
            icon={DollarSign}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Pendapatan Bulan Ini"
            value={formatCurrency(safeNumber(data.financial?.monthly_income))}
            icon={TrendingUp}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Pengeluaran Bulan Ini"
            value={formatCurrency(safeNumber(data.financial?.monthly_expense))}
            icon={TrendingDown}
            trend={{ value: 0, isPositive: false }}
          />
        </div>

        {/* Monthly Profit Card */}
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          <StatCard
            title="Profit Bulan Ini"
            value={formatCurrency(safeNumber(data.financial?.monthly_profit))}
            icon={TrendingUp}
            trend={{ value: 0, isPositive: safeNumber(data.financial?.monthly_profit) >= 0 }}
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {charts?.monthly_revenue_expense && (
            <LineChart
              data={charts.monthly_revenue_expense}
              title="Pendapatan vs Pengeluaran (6 Bulan)"
              dataKey="profit"
              xAxisKey="month"
              color="#2563EB"
            />
          )}
          {charts?.project_status_distribution && (
            <PieChart
              data={charts.project_status_distribution}
              title="Distribusi Status Proyek"
              dataKey="value"
              nameKey="name"
            />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          {charts?.department_expenses && (
            <BarChart
              data={charts.department_expenses}
              title="Pengeluaran per Departemen"
              dataKeys={[{ key: 'value', color: '#2563EB', name: 'Pengeluaran' }]}
              xAxisKey="name"
            />
          )}
        </div>

        {/* Approvals Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Cash Requests</span>
                <Badge variant="warning">{safeNumber(data.approvals?.pending_cash_requests)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {safeNumber(data.approvals?.pending_cash_requests)} large cash requests waiting for approval
              </p>
              <Button variant="outline" className="w-full mt-4">
                Lihat Semua Request
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Expenses</span>
                <Badge variant="warning">{safeNumber(data.approvals?.pending_expenses)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {safeNumber(data.approvals?.pending_expenses)} operational expenses waiting for approval
              </p>
              <Button variant="outline" className="w-full mt-4">
                Lihat Semua Pengeluaran
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Monitoring Lapangan</span>
                <Badge variant="secondary">{safeNumber(data.field_monitoring?.today_records)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {safeNumber(data.field_monitoring?.total_records)} total records, {safeNumber(data.field_monitoring?.this_month_records)} this month.
              </p>
              <Button variant="outline" className="w-full mt-4">
                Lihat Field Monitoring
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Proyek Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {safeArray(data.recent_projects).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No projects found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Proyek</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Nilai Kontrak</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeArray(data.recent_projects).map((project: any) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full transition-all"
                              style={{ width: `${project.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{project.progress || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          project.status === 'running' ? 'default' : 
                          project.status === 'completed' ? 'success' : 
                          project.status === 'hold' ? 'warning' : 'secondary'
                        }>
                          {project.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>{project.manager?.name || '-'}</TableCell>
                      <TableCell>{formatCurrency(project.contract_value || 0)}</TableCell>
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
