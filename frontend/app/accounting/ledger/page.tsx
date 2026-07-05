"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Calendar,
  Loader2,
  BookOpen,
  FileSpreadsheet,
  FileText
} from "lucide-react"
import { ledgerApi, LedgerEntry, AccountLedger } from "@/lib/api/ledger"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"
import { exportToExcel } from "@/lib/utils/export-excel"
import { exportToPDF } from "@/lib/utils/export-pdf"

export default function LedgerPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [selectedAccount, setSelectedAccount] = useState<AccountLedger | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingLedger, setLoadingLedger] = useState(false)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const { addToast } = useToast()

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const response = await ledgerApi.getAccounts()
      setAccounts(response.data || response)
    } catch (error) {
      console.error("Error loading accounts:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to load accounts",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAccountLedger = async (accountId: number) => {
    try {
      setLoadingLedger(true)
      const response = await ledgerApi.getAccountLedger(accountId, {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      setSelectedAccount(response)
    } catch (error) {
      console.error("Error loading ledger:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to load ledger data",
        variant: "destructive"
      })
    } finally {
      setLoadingLedger(false)
    }
  }

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = 
      account.account_number.toLowerCase().includes(search.toLowerCase()) ||
      account.account_name.toLowerCase().includes(search.toLowerCase())
    const matchesType = !typeFilter || account.account_type === typeFilter
    return matchesSearch && matchesType
  })

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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">General Ledger</h1>
            <p className="text-muted-foreground mt-1">View account balances and transactions</p>
          </div>
          {selectedAccount && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const columns = [
                    { key: 'date', label: 'Date', format: (val: string) => new Date(val).toLocaleDateString() },
                    { key: 'description', label: 'Description' },
                    { key: 'debit', label: 'Debit', format: (val: number) => formatCurrency(val) },
                    { key: 'credit', label: 'Credit', format: (val: number) => formatCurrency(val) },
                    { key: 'balance', label: 'Balance', format: (val: number) => formatCurrency(val) },
                  ]
                  exportToExcel(selectedAccount.entries, columns, `ledger-${selectedAccount.account.account_number}`)
                }}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const columns = [
                    { key: 'date', label: 'Date', format: (val: string) => new Date(val).toLocaleDateString() },
                    { key: 'description', label: 'Description' },
                    { key: 'debit', label: 'Debit', format: (val: number) => formatCurrency(val) },
                    { key: 'credit', label: 'Credit', format: (val: number) => formatCurrency(val) },
                    { key: 'balance', label: 'Balance', format: (val: number) => formatCurrency(val) },
                  ]
                  exportToPDF(selectedAccount.entries, columns, `ledger-${selectedAccount.account.account_number}`, `Ledger - ${selectedAccount.account.account_number} ${selectedAccount.account.account_name}`)
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search accounts..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Account Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="asset">Assets</SelectItem>
              <SelectItem value="liability">Liabilities</SelectItem>
              <SelectItem value="equity">Equity</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Account List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAccounts.map((account) => (
            <Card 
              key={account.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => loadAccountLedger(account.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{account.account_number}</CardTitle>
                    <p className="text-sm text-muted-foreground">{account.account_name}</p>
                  </div>
                  <Badge variant="secondary">{account.account_type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Balance Type</p>
                  <Badge variant="outline">{account.balance_type}</Badge>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Transactions
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Account Transactions */}
        {selectedAccount && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedAccount.account.account_number} - {selectedAccount.account.account_name}</span>
                <div className="flex gap-2">
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Opening Balance</p>
                      <p className="font-semibold">{formatCurrency(selectedAccount.opening_balance)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Closing Balance</p>
                      <p className="font-semibold">{formatCurrency(selectedAccount.closing_balance)}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedAccount(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {selectedAccount.entries.length} transactions found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-4">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-auto"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-auto"
                />
                <Button 
                  variant="outline"
                  onClick={() => loadAccountLedger(selectedAccount.account.id)}
                >
                  Apply Filter
                </Button>
              </div>

              {loadingLedger ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : selectedAccount.entries.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No transactions found</p>
              ) : (
                <div className="space-y-3">
                  {selectedAccount.entries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(entry.date).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <p className="font-medium">{entry.description || entry.journalItem?.journal?.description || '-'}</p>
                          {entry.journalItem?.journal && (
                            <p className="text-xs text-muted-foreground">
                              Ref: {entry.journalItem.journal.journal_number}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Debit</p>
                          {entry.debit > 0 ? (
                            <p className="font-semibold text-green-600">{formatCurrency(entry.debit)}</p>
                          ) : (
                            <p className="text-muted-foreground">-</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Credit</p>
                          {entry.credit > 0 ? (
                            <p className="font-semibold text-red-600">{formatCurrency(entry.credit)}</p>
                          ) : (
                            <p className="text-muted-foreground">-</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Balance</p>
                          <p className="font-semibold">{formatCurrency(entry.balance || 0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
