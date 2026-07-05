"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  ChevronRight,
  Folder,
  Loader2,
  Edit,
  Trash2,
  FileSpreadsheet,
  FileText
} from "lucide-react"
import { chartOfAccountsApi } from "@/lib/api/chart-of-accounts"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"
import { exportToExcel } from "@/lib/utils/export-excel"
import { exportToPDF } from "@/lib/utils/export-pdf"

export default function COAPage() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const { addToast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [formData, setFormData] = useState({
    account_number: "",
    account_name: "",
    account_type: "asset" as "asset" | "liability" | "equity" | "revenue" | "expense",
    parent_id: null as number | null,
    balance_type: "debit" as "debit" | "credit",
    is_active: true,
  })

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const response = await chartOfAccountsApi.getAccounts()
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

  const handleCreate = () => {
    setEditingAccount(null)
    setFormData({
      account_number: "",
      account_name: "",
      account_type: "asset",
      parent_id: null,
      balance_type: "debit",
      is_active: true,
    })
    setDialogOpen(true)
  }

  const handleEdit = (account: any) => {
    setEditingAccount(account)
    setFormData({
      account_number: account.account_number,
      account_name: account.account_name,
      account_type: account.account_type,
      parent_id: account.parent_id || null,
      balance_type: account.balance_type,
      is_active: account.is_active,
    })
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingAccount) {
        await chartOfAccountsApi.updateAccount(editingAccount.id, formData)
        addToast({ title: "Success", description: "Account updated successfully" })
      } else {
        await chartOfAccountsApi.createAccount(formData)
        addToast({ title: "Success", description: "Account created successfully" })
      }
      setDialogOpen(false)
      loadAccounts()
    } catch (error: any) {
      console.error("Error saving account:", error)
      addToast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to save account",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this account?")) return
    setDeleting(id)
    try {
      await chartOfAccountsApi.deleteAccount(id)
      addToast({ title: "Success", description: "Account deleted successfully" })
      loadAccounts()
    } catch (error: any) {
      console.error("Error deleting account:", error)
      addToast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to delete account",
        variant: "destructive"
      })
    } finally {
      setDeleting(null)
    }
  }

  const filteredAccounts = accounts.filter((account) =>
    account.account_name?.toLowerCase().includes(search.toLowerCase()) ||
    account.account_number?.toLowerCase().includes(search.toLowerCase())
  )

  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage)

  const groupedAccounts = paginatedAccounts.reduce((acc: any, account: any) => {
    const type = account.account_type || 'other'
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(account)
    return acc
  }, {})

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
            <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
            <p className="text-muted-foreground mt-1">Manage account structure and hierarchy</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const columns = [
                  { key: 'account_number', label: 'Account Number' },
                  { key: 'account_name', label: 'Account Name' },
                  { key: 'account_type', label: 'Type' },
                  { key: 'balance_type', label: 'Balance Type' },
                  { key: 'balance', label: 'Balance', format: (val: number) => formatCurrency(val) },
                ]
                exportToExcel(accounts, columns, 'chart-of-accounts')
              }}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const columns = [
                  { key: 'account_number', label: 'Account Number' },
                  { key: 'account_name', label: 'Account Name' },
                  { key: 'account_type', label: 'Type' },
                  { key: 'balance_type', label: 'Balance Type' },
                  { key: 'balance', label: 'Balance', format: (val: number) => formatCurrency(val) },
                ]
                exportToPDF(accounts, columns, 'chart-of-accounts', 'Chart of Accounts Report')
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search accounts..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Account Tree */}
        <div className="space-y-4">
          {Object.keys(groupedAccounts).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No accounts found</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedAccounts).map(([type, typeAccounts]: [string, any]) => (
              <Card key={type}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Folder className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg capitalize">{type}</CardTitle>
                      <Badge variant="secondary">{typeAccounts.length} accounts</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {typeAccounts.map((account: any) => (
                      <div key={account.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{account.account_number} - {account.account_name}</p>
                            <p className="text-xs text-muted-foreground">{account.balance_type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-semibold">{formatCurrency(account.balance || 0)}</p>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(account.id)}
                            disabled={deleting === account.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAccounts.length)} of {filteredAccounts.length} accounts
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingAccount ? "Edit Account" : "Create Account"}</DialogTitle>
              <DialogDescription>
                {editingAccount ? "Update account details" : "Add a new account to the chart of accounts"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="account_name">Account Name</Label>
                  <Input
                    id="account_name"
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="account_type">Account Type</Label>
                  <Select
                    value={formData.account_type}
                    onValueChange={(value: any) => setFormData({ ...formData, account_type: value })}
                  >
                    <SelectTrigger id="account_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asset">Asset</SelectItem>
                      <SelectItem value="liability">Liability</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="parent_id">Parent Account (Optional)</Label>
                  <Select
                    value={formData.parent_id?.toString() || ""}
                    onValueChange={(value) => setFormData({ ...formData, parent_id: value ? parseInt(value) : null })}
                  >
                    <SelectTrigger id="parent_id">
                      <SelectValue placeholder="No parent (root account)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No parent (root account)</SelectItem>
                      {accounts
                        .filter((a: any) => a.id !== editingAccount?.id)
                        .map((account: any) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.account_number} - {account.account_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="balance_type">Balance Type</Label>
                  <Select
                    value={formData.balance_type}
                    onValueChange={(value: any) => setFormData({ ...formData, balance_type: value })}
                  >
                    <SelectTrigger id="balance_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">Debit</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {editingAccount ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
