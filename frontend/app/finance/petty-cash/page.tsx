"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Search, Loader2, ArrowUpCircle, ArrowDownCircle, CheckCircle, XCircle, Wallet } from "lucide-react"
import { pettyCashApi, PettyCashTransaction, PettyCashSummary, PettyCashTransactionInput } from "@/lib/api/petty-cash"
import { formatCurrency } from "@/lib/utils"

export default function PettyCashPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [summary, setSummary] = useState<PettyCashSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<PettyCashTransaction | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [formData, setFormData] = useState({
    transaction_type: "out",
    amount: "",
    transaction_date: "",
    category_id: "",
    description: "",
    notes: "",
    receipt_number: "",
  })
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [transactionsResponse, summaryResponse] = await Promise.all([
        pettyCashApi.getTransactions(),
        pettyCashApi.getSummary(),
      ])
      setTransactions(transactionsResponse.data || transactionsResponse)
      setSummary(summaryResponse)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTransaction(null)
    setReceiptFile(null)
    setFormData({
      transaction_type: "out",
      amount: "",
      transaction_date: new Date().toISOString().split('T')[0],
      category_id: "",
      description: "",
      notes: "",
      receipt_number: "",
    })
    setDialogOpen(true)
  }

  const handleEdit = (transaction: PettyCashTransaction) => {
    setEditingTransaction(transaction)
    setReceiptFile(null)
    setFormData({
      transaction_type: transaction.transaction_type,
      amount: transaction.amount.toString(),
      transaction_date: transaction.transaction_date,
      category_id: transaction.category_id?.toString() || "",
      description: transaction.description,
      notes: transaction.notes || "",
      receipt_number: transaction.receipt_number || "",
    })
    setDialogOpen(true)
  }

  const readFileAsDataURL = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result)
        } else {
          reject(new Error("Unable to read file"))
        }
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data: PettyCashTransactionInput = {
        transaction_type: formData.transaction_type as PettyCashTransactionInput["transaction_type"],
        amount: parseFloat(formData.amount),
        transaction_date: formData.transaction_date,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        description: formData.description,
        notes: formData.notes,
        receipt_number: formData.receipt_number,
      }

      if (receiptFile) {
        data.receipt_image = await readFileAsDataURL(receiptFile)
      }

      if (editingTransaction) {
        await pettyCashApi.updateTransaction(editingTransaction.id, data)
      } else {
        await pettyCashApi.createTransaction(data)
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("Error saving transaction:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return
    setDeleting(id)
    try {
      await pettyCashApi.deleteTransaction(id)
      loadData()
    } catch (error) {
      console.error("Error deleting transaction:", error)
    } finally {
      setDeleting(null)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await pettyCashApi.approveTransaction(id)
      loadData()
    } catch (error) {
      console.error("Error approving transaction:", error)
    }
  }

  const handleReject = async (id: number) => {
    try {
      await pettyCashApi.rejectTransaction(id)
      loadData()
    } catch (error) {
      console.error("Error rejecting transaction:", error)
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.transaction_number.toLowerCase().includes(search.toLowerCase()) ||
      transaction.description.toLowerCase().includes(search.toLowerCase()) ||
      transaction.receipt_number?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || transaction.status === statusFilter
    const matchesType = !typeFilter || transaction.transaction_type === typeFilter
    return matchesSearch && matchesStatus && matchesType
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
            <h1 className="text-3xl font-bold tracking-tight">Petty Cash Management</h1>
            <p className="text-muted-foreground mt-1">Track and manage small cash transactions</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total In</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_in)}</p>
                  </div>
                  <ArrowUpCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Out</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.total_out)}</p>
                  </div>
                  <ArrowDownCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-2xl font-bold">{formatCurrency(summary.balance)}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>View and manage petty cash transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="in">In</SelectItem>
                  <SelectItem value="out">Out</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No transactions found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.transaction_number}</TableCell>
                      <TableCell>{new Date(transaction.transaction_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.transaction_type === 'in' ? 'success' : 'destructive'}>
                          {transaction.transaction_type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                      <TableCell className={transaction.transaction_type === 'in' ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{transaction.requester?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.status === 'approved' ? 'success' :
                          transaction.status === 'rejected' ? 'destructive' :
                          'warning'
                        }>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {transaction.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(transaction)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(transaction.id)}
                                disabled={deleting === transaction.id}
                              >
                                {deleting === transaction.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleApprove(transaction.id)}>
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(transaction.id)}>
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTransaction ? "Edit Transaction" : "New Transaction"}</DialogTitle>
              <DialogDescription>
                {editingTransaction ? "Update transaction details" : "Create a new petty cash transaction"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transaction_type">Transaction Type *</Label>
                <Select value={formData.transaction_type} onValueChange={(value) => setFormData({ ...formData, transaction_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Money In</SelectItem>
                    <SelectItem value="out">Money Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction_date">Date *</Label>
                <Input
                  id="transaction_date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt_number">Receipt Number</Label>
                <Input
                  id="receipt_number"
                  value={formData.receipt_number}
                  onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt_image">Receipt Upload</Label>
                <Input
                  id="receipt_image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                />
                {receiptFile && (
                  <p className="text-sm text-muted-foreground">Selected file: {receiptFile.name}</p>
                )}
                {editingTransaction?.receipt_image && !receiptFile && (
                  <p className="text-sm text-muted-foreground">Existing receipt will be kept unless a new file is selected.</p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingTransaction ? "Update" : "Create"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
