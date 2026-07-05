"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowUpCircle, ArrowDownCircle, Download } from "lucide-react"
import { reportsApi, CashFlowReport } from "@/lib/api/reports"
import { formatCurrency } from "@/lib/utils"

export default function CashFlowPage() {
  const [report, setReport] = useState<CashFlowReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  const loadReport = async () => {
    try {
      setLoading(true)
      const response = await reportsApi.cashFlow({ start_date: startDate, end_date: endDate })
      setReport(response)
    } catch (error) {
      console.error("Error loading cash flow:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cash Flow Statement</h1>
            <p className="text-muted-foreground mt-1">View cash flow report for a specific period</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto"
                />
              </div>
              <Button onClick={loadReport} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Report"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {report && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Inflow</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(report.summary.total_inflow)}</p>
                    </div>
                    <ArrowUpCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Outflow</p>
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(report.summary.total_outflow)}</p>
                    </div>
                    <ArrowDownCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                      <p className={`text-2xl font-bold ${report.summary.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(report.summary.net_cash_flow)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cash Inflows</CardTitle>
                  <CardDescription>
                    {new Date(report.period.start_date).toLocaleDateString()} - {new Date(report.period.end_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {report.inflows.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No inflow entries</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Journal #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.inflows.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.journal_number}</TableCell>
                            <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                            <TableCell>{item.description || '-'}</TableCell>
                            <TableCell className="text-right text-green-600">
                              {formatCurrency(item.items?.reduce((sum: number, i: any) => sum + i.debit, 0) || 0)}
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
                  <CardTitle>Cash Outflows</CardTitle>
                  <CardDescription>
                    {new Date(report.period.start_date).toLocaleDateString()} - {new Date(report.period.end_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {report.outflows.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No outflow entries</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Journal #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.outflows.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.journal_number}</TableCell>
                            <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                            <TableCell>{item.description || '-'}</TableCell>
                            <TableCell className="text-right text-red-600">
                              {formatCurrency(item.items?.reduce((sum: number, i: any) => sum + i.debit, 0) || 0)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
