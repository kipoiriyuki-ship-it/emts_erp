"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Building2, Download } from "lucide-react"
import { reportsApi, BalanceSheetReport } from "@/lib/api/reports"
import { formatCurrency } from "@/lib/utils"

export default function BalanceSheetPage() {
  const [report, setReport] = useState<BalanceSheetReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0])

  const loadReport = async () => {
    try {
      setLoading(true)
      const response = await reportsApi.balanceSheet(asOfDate)
      setReport(response)
    } catch (error) {
      console.error("Error loading balance sheet:", error)
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
            <h1 className="text-3xl font-bold tracking-tight">Balance Sheet</h1>
            <p className="text-muted-foreground mt-1">View balance sheet as of a specific date</p>
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
                <label className="text-sm font-medium">As of Date</label>
                <Input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
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
                      <p className="text-sm text-muted-foreground">Total Assets</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(report.summary.total_assets)}</p>
                    </div>
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Liabilities</p>
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(report.summary.total_liabilities)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Equity</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(report.summary.total_equity)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Assets</CardTitle>
                  <CardDescription>As of {new Date(report.as_of_date).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  {report.assets.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No assets found</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Account #</TableHead>
                          <TableHead>Account Name</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.assets.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-medium">{account.account_number}</TableCell>
                            <TableCell>{account.account_name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold bg-muted">
                          <TableCell colSpan={2} className="text-right">Total Assets</TableCell>
                          <TableCell className="text-right">{formatCurrency(report.summary.total_assets)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Liabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.liabilities.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No liabilities found</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Account #</TableHead>
                            <TableHead>Account Name</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.liabilities.map((account) => (
                            <TableRow key={account.id}>
                              <TableCell className="font-medium">{account.account_number}</TableCell>
                              <TableCell>{account.account_name}</TableCell>
                              <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-bold bg-muted">
                            <TableCell colSpan={2} className="text-right">Total Liabilities</TableCell>
                            <TableCell className="text-right">{formatCurrency(report.summary.total_liabilities)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Equity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {report.equity.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No equity accounts found</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Account #</TableHead>
                            <TableHead>Account Name</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.equity.map((account) => (
                            <TableRow key={account.id}>
                              <TableCell className="font-medium">{account.account_number}</TableCell>
                              <TableCell>{account.account_name}</TableCell>
                              <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-bold bg-muted">
                            <TableCell colSpan={2} className="text-right">Total Equity</TableCell>
                            <TableCell className="text-right">{formatCurrency(report.summary.total_equity)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Liabilities & Equity</p>
                        <p className="text-2xl font-bold">{formatCurrency(report.summary.total_liabilities_equity)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
