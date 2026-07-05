"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatCard } from "@/components/charts/stat-card"
import { LineChart } from "@/components/charts/line-chart"
import { BarChart } from "@/components/charts/bar-chart"
import { PieChart } from "@/components/charts/pie-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  ArrowRight,
  Calendar,
  Building2
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { dashboardApi, AccountingDashboardData } from "@/lib/api/dashboard"
import { safeArray, safeNumber } from "@/lib/utils/safe-access"

export default function AccountingDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AccountingDashboardData | null>(null)
  const [charts, setCharts] = useState<any>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const [dashboardResponse, chartsResponse] = await Promise.all([
        dashboardApi.getAccountingDashboard(),
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
          <p className="text-muted-foreground">Loading accounting data...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Akuntansi</h1>
          <p className="text-muted-foreground mt-1">Overview finansial dan laporan akuntansi</p>
        </div>

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
            icon={Building2}
            trend={{ value: 0, isPositive: true }}
          />
          <StatCard
            title="Pendapatan Bulan Ini"
            value={formatCurrency(safeNumber(data.financial?.monthly_revenue))}
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
          {charts?.expense_categories && (
            <PieChart
              data={charts.expense_categories}
              title="Kategori Pengeluaran"
              dataKey="value"
              nameKey="name"
            />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          {charts?.cash_flow && (
            <BarChart
              data={charts.cash_flow}
              title="Arus Kas (6 Bulan)"
              dataKeys={[
                { key: 'cash_in', color: '#22C55E', name: 'Cash In' },
                { key: 'cash_out', color: '#EF4444', name: 'Cash Out' }
              ]}
              xAxisKey="month"
            />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Jurnal Hari Ini</span>
                <Badge variant="success">{safeNumber(data.journal?.today_entries)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {safeNumber(data.journal?.today_entries)} journal entries created today
              </p>
              <Button variant="outline" className="w-full mt-4">
                Buat Jurnal Baru
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Jurnal Draft</span>
                <Badge variant="warning">{safeNumber(data.journal?.pending_journals)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                {safeNumber(data.journal?.pending_journals)} journals waiting to be posted
              </p>
              <Button variant="outline" className="w-full mt-4">
                Review Draft Journals
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Jurnal Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {safeArray(data.recent_journals).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No journals found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor Jurnal</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dibuat Oleh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeArray(data.recent_journals).map((journal: any) => (
                    <TableRow key={journal.id}>
                      <TableCell className="font-medium">{journal.journal_number}</TableCell>
                      <TableCell>{journal.date}</TableCell>
                      <TableCell>{journal.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={journal.status === "posted" ? "success" : "warning"}>
                          {journal.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{journal.creator?.name || '-'}</TableCell>
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
