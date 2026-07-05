"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, Download } from "lucide-react"
import { reportsApi, TrialBalanceReport } from "@/lib/api/reports"
import { formatCurrency } from "@/lib/utils"

export default function TrialBalancePage() {
  const [report, setReport] = useState<TrialBalanceReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0])

  const loadReport = async () => {
    try {
      setLoading(true)
      const response = await reportsApi.trialBalance(asOfDate)
      setReport(response)
    } catch (error) {
      console.error("Error loading trial balance:", error)
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
            <h1 className="text-3xl font-bold tracking-tight">Trial Balance</h1>
            <p className="text-muted-foreground mt-1">View trial balance report as of a specific date</p>
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
                      <p className="text-sm text-muted-foreground">Total Debits</p>
                      <p className="text-2xl font-bold">{formatCurrency(report.total_debits)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Credits</p>
                      <p className="text-2xl font-bold">{formatCurrency(report.total_credits)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={report.is_balanced ? "success" : "destructive"}>
                        {report.is_balanced ? "Balanced" : "Not Balanced"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Trial Balance - {new Date(report.as_of_date).toLocaleDateString()}</CardTitle>
                <CardDescription>
                  {report.accounts.length} accounts with balances
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : report.accounts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No accounts found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account #</TableHead>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.accounts.map((account, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{account.account_number}</TableCell>
                          <TableCell>{account.account_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{account.account_type}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {account.debit > 0 ? formatCurrency(account.debit) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {account.credit > 0 ? formatCurrency(account.credit) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-muted">
                        <TableCell colSpan={3} className="text-right">Total</TableCell>
                        <TableCell className="text-right">{formatCurrency(report.total_debits)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(report.total_credits)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
