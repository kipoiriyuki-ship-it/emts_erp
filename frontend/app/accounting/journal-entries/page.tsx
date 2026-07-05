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
import { Plus, Edit, Trash2, Search, Loader2, Send, XCircle, BookOpen } from "lucide-react"
import { journalEntriesApi, JournalEntry, JournalItem } from "@/lib/api/journal-entries"
import { chartOfAccountsApi } from "@/lib/api/chart-of-accounts"
import { formatCurrency } from "@/lib/utils"

export default function JournalEntriesPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [periodFilter, setPeriodFilter] = useState("")
  const [formData, setFormData] = useState({
    date: "",
    description: "",
    period: "",
    items: [{ account_id: "", debit: "", credit: "", description: "" }],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [entriesResponse, accountsResponse] = await Promise.all([
        journalEntriesApi.getEntries(),
        journalEntriesApi.getAccounts(),
      ])
      setEntries(entriesResponse.data || entriesResponse)
      setAccounts(accountsResponse)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingEntry(null)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: "",
      period: new Date().toISOString().slice(0, 7),
      items: [{ account_id: "", debit: "", credit: "", description: "" }],
    })
    setDialogOpen(true)
  }

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setFormData({
      date: entry.date,
      description: entry.description || "",
      period: entry.period,
      items: entry.items?.map(item => ({
        account_id: item.account_id.toString(),
        debit: item.debit.toString(),
        credit: item.credit.toString(),
        description: item.description || "",
      })) || [{ account_id: "", debit: "", credit: "", description: "" }],
    })
    setDialogOpen(true)
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { account_id: "", debit: "", credit: "", description: "" }],
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        ...formData,
        items: formData.items.map(item => ({
          account_id: parseInt(item.account_id),
          debit: parseFloat(item.debit) || 0,
          credit: parseFloat(item.credit) || 0,
          description: item.description,
        })),
      }

      if (editingEntry) {
        await journalEntriesApi.updateEntry(editingEntry.id, data)
      } else {
        await journalEntriesApi.createEntry(data)
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("Error saving entry:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this journal entry?")) return
    setDeleting(id)
    try {
      await journalEntriesApi.deleteEntry(id)
      loadData()
    } catch (error) {
      console.error("Error deleting entry:", error)
    } finally {
      setDeleting(null)
    }
  }

  const handlePost = async (id: number) => {
    if (!confirm("Are you sure you want to post this journal entry?")) return
    try {
      await journalEntriesApi.postEntry(id)
      loadData()
    } catch (error) {
      console.error("Error posting entry:", error)
    }
  }

  const handleCancel = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this journal entry?")) return
    try {
      await journalEntriesApi.cancelEntry(id)
      loadData()
    } catch (error) {
      console.error("Error cancelling entry:", error)
    }
  }

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = 
      entry.journal_number.toLowerCase().includes(search.toLowerCase()) ||
      entry.description?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || entry.status === statusFilter
    const matchesPeriod = !periodFilter || entry.period === periodFilter
    return matchesSearch && matchesStatus && matchesPeriod
  })

  const calculateTotals = () => {
    const totalDebit = formData.items.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0)
    const totalCredit = formData.items.reduce((sum, item) => sum + (parseFloat(item.credit) || 0), 0)
    return { totalDebit, totalCredit }
  }

  const { totalDebit, totalCredit } = calculateTotals()
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

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
            <h1 className="text-3xl font-bold tracking-tight">Journal Entries</h1>
            <p className="text-muted-foreground mt-1">Manage journal entries and postings</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Journal Entries</CardTitle>
            <CardDescription>View and manage journal entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Period (YYYY-MM)"
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="w-[150px]"
              />
            </div>

            {filteredEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No journal entries found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Journal #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Total Debit</TableHead>
                    <TableHead>Total Credit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.journal_number}</TableCell>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell>{entry.period}</TableCell>
                      <TableCell className="max-w-xs truncate">{entry.description || '-'}</TableCell>
                      <TableCell>{formatCurrency(entry.total_debit)}</TableCell>
                      <TableCell>{formatCurrency(entry.total_credit)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          entry.status === 'posted' ? 'success' :
                          entry.status === 'cancelled' ? 'destructive' :
                          'secondary'
                        }>
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {entry.status === 'draft' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(entry.id)}
                                disabled={deleting === entry.id}
                              >
                                {deleting === entry.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handlePost(entry.id)}>
                                <Send className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {entry.status === 'posted' && (
                            <Button size="sm" variant="destructive" onClick={() => handleCancel(entry.id)}>
                              <XCircle className="h-3 w-3" />
                            </Button>
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
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingEntry ? "Edit Journal Entry" : "New Journal Entry"}</DialogTitle>
              <DialogDescription>
                {editingEntry ? "Update journal entry details" : "Create a new journal entry"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">Period *</Label>
                  <Input
                    id="period"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    placeholder="2024-06"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Journal Items *</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addItem}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Item
                  </Button>
                </div>
                <div className="border rounded-lg p-4 space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4 space-y-1">
                        <Label className="text-xs">Account</Label>
                        <Select value={item.account_id} onValueChange={(value) => updateItem(index, 'account_id', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id.toString()}>
                                {account.account_number} - {account.account_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label className="text-xs">Debit</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.debit}
                          onChange={(e) => updateItem(index, 'debit', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label className="text-xs">Credit</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.credit}
                          onChange={(e) => updateItem(index, 'credit', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 2}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total Debit:</span>
                  <span className="text-xl font-bold">{formatCurrency(totalDebit)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total Credit:</span>
                  <span className="text-xl font-bold">{formatCurrency(totalCredit)}</span>
                </div>
              </div>

              {!isBalanced && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <XCircle className="h-4 w-4" />
                  <span>Journal entry is not balanced. Debits must equal credits.</span>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || !isBalanced}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingEntry ? "Update" : "Create"
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
