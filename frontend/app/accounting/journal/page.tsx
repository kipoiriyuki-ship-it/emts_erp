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
  FileText,
  Calendar,
  DollarSign,
  Loader2,
  Eye,
  CheckCircle,
  FileSpreadsheet
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { journalEntriesApi } from "@/lib/api/journal-entries"
import { useToast } from "@/components/ui/toast"
import { exportToExcel } from "@/lib/utils/export-excel"
import { exportToPDF } from "@/lib/utils/export-pdf"

export default function JournalPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<any>(null)
  const [viewingEntry, setViewingEntry] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [posting, setPosting] = useState<number | null>(null)
  const { addToast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    period: new Date().toISOString().slice(0, 7),
    items: [] as any[],
  })
  const [itemFormData, setItemFormData] = useState({
    account_id: "",
    debit: 0,
    credit: 0,
    description: "",
  })

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      setLoading(true)
      const response = await journalEntriesApi.getEntries()
      setEntries(response.data || response)
    } catch (error) {
      console.error("Error loading journal entries:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to load journal entries",
        variant: "destructive"
      })
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
      items: [],
    })
    setDialogOpen(true)
  }

  const handleView = (entry: any) => {
    setViewingEntry(entry)
    setViewDialogOpen(true)
  }

  const handlePost = async (id: number) => {
    if (!confirm("Are you sure you want to post this journal entry?")) return
    setPosting(id)
    try {
      await journalEntriesApi.postEntry(id)
      addToast({ title: "Success", description: "Journal entry posted successfully" })
      loadEntries()
    } catch (error: any) {
      console.error("Error posting entry:", error)
      addToast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to post journal entry",
        variant: "destructive"
      })
    } finally {
      setPosting(null)
    }
  }

  const handleAddItem = () => {
    if (!itemFormData.account_id || (itemFormData.debit === 0 && itemFormData.credit === 0)) {
      addToast({ 
        title: "Error", 
        description: "Please fill in account and at least one amount",
        variant: "destructive"
      })
      return
    }
    setFormData({
      ...formData,
      items: [...formData.items, { ...itemFormData, account_id: parseInt(itemFormData.account_id) }],
    })
    setItemFormData({ account_id: "", debit: 0, credit: 0, description: "" })
  }

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.items.length < 2) {
      addToast({ 
        title: "Error", 
        description: "Journal entry must have at least 2 items",
        variant: "destructive"
      })
      return
    }
    const totalDebit = formData.items.reduce((sum, item) => sum + item.debit, 0)
    const totalCredit = formData.items.reduce((sum, item) => sum + item.credit, 0)
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      addToast({ 
        title: "Error", 
        description: "Journal entry must be balanced (debits must equal credits)",
        variant: "destructive"
      })
      return
    }
    setSaving(true)
    try {
      await journalEntriesApi.createEntry(formData)
      addToast({ title: "Success", description: "Journal entry created successfully" })
      setDialogOpen(false)
      loadEntries()
    } catch (error: any) {
      console.error("Error saving entry:", error)
      addToast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to save journal entry",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const filteredEntries = entries.filter((entry) =>
    entry.description?.toLowerCase().includes(search.toLowerCase()) ||
    entry.journal_number?.toLowerCase().includes(search.toLowerCase())
  )

  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)

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
            <p className="text-muted-foreground mt-1">Record and manage journal entries</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const columns = [
                  { key: 'journal_number', label: 'Journal Number' },
                  { key: 'date', label: 'Date' },
                  { key: 'description', label: 'Description' },
                  { key: 'total_debit', label: 'Total Debit', format: (val: number) => formatCurrency(val) },
                  { key: 'total_credit', label: 'Total Credit', format: (val: number) => formatCurrency(val) },
                  { key: 'status', label: 'Status' },
                ]
                exportToExcel(entries, columns, 'journal-entries')
              }}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const columns = [
                  { key: 'journal_number', label: 'Journal Number' },
                  { key: 'date', label: 'Date' },
                  { key: 'description', label: 'Description' },
                  { key: 'total_debit', label: 'Total Debit', format: (val: number) => formatCurrency(val) },
                  { key: 'total_credit', label: 'Total Credit', format: (val: number) => formatCurrency(val) },
                  { key: 'status', label: 'Status' },
                ]
                exportToPDF(entries, columns, 'journal-entries', 'Journal Entries Report')
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Journal Entry
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search journal entries..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Journal Entries List */}
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No journal entries found</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {paginatedEntries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{entry.journal_number}</CardTitle>
                        <p className="text-sm text-muted-foreground">{entry.description}</p>
                      </div>
                    </div>
                    <Badge variant={entry.status === "posted" ? "success" : "warning"}>
                      {entry.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{entry.date}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Debit</p>
                      <div className="flex items-center gap-1 mt-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-600">{formatCurrency(entry.total_debit || 0)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Credit</p>
                      <div className="flex items-center gap-1 mt-1">
                        <DollarSign className="h-4 w-4 text-red-600" />
                        <span className="font-medium text-red-600">{formatCurrency(entry.total_credit || 0)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created By</p>
                      <p className="font-medium mt-1">{entry.created_by?.name || '-'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleView(entry)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {entry.status === "pending" && (
                      <Button 
                        size="sm" 
                        onClick={() => handlePost(entry.id)}
                        disabled={posting === entry.id}
                      >
                        {posting === entry.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Post
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredEntries.length)} of {filteredEntries.length} entries
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

        {/* Create Journal Entry Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Journal Entry</DialogTitle>
              <DialogDescription>
                Create a new journal entry with debit and credit items
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="period">Period</Label>
                    <Input
                      id="period"
                      type="month"
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                
                <div className="border rounded-lg p-4">
                  <Label className="text-base font-semibold">Journal Items</Label>
                  <div className="mt-3 space-y-2">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                        <span className="flex-1 text-sm">Account ID: {item.account_id}</span>
                        <span className="text-sm text-green-600">Debit: {formatCurrency(item.debit)}</span>
                        <span className="text-sm text-red-600">Credit: {formatCurrency(item.credit)}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    <div className="col-span-2">
                      <Label htmlFor="account_id">Account</Label>
                      <Select
                        value={itemFormData.account_id}
                        onValueChange={(value) => setItemFormData({ ...itemFormData, account_id: value })}
                      >
                        <SelectTrigger id="account_id">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* This should be populated from chart of accounts API */}
                          <SelectItem value="1">Cash</SelectItem>
                          <SelectItem value="2">Accounts Receivable</SelectItem>
                          <SelectItem value="3">Revenue</SelectItem>
                          <SelectItem value="4">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="debit">Debit</Label>
                      <Input
                        id="debit"
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemFormData.debit || ""}
                        onChange={(e) => setItemFormData({ ...itemFormData, debit: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="credit">Credit</Label>
                      <Input
                        id="credit"
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemFormData.credit || ""}
                        onChange={(e) => setItemFormData({ ...itemFormData, credit: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleAddItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                  
                  <div className="mt-3 flex justify-between text-sm">
                    <span>Total Debit: <strong className="text-green-600">{formatCurrency(formData.items.reduce((sum, item) => sum + item.debit, 0))}</strong></span>
                    <span>Total Credit: <strong className="text-red-600">{formatCurrency(formData.items.reduce((sum, item) => sum + item.credit, 0))}</strong></span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || formData.items.length < 2}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Create Entry
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Journal Entry Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Journal Entry Details</DialogTitle>
              <DialogDescription>
                {viewingEntry?.journal_number}
              </DialogDescription>
            </DialogHeader>
            {viewingEntry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Date</Label>
                    <p className="font-medium">{viewingEntry.date}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Period</Label>
                    <p className="font-medium">{viewingEntry.period}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <Badge variant={viewingEntry.status === "posted" ? "success" : "warning"}>
                      {viewingEntry.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Description</Label>
                    <p className="font-medium">{viewingEntry.description}</p>
                  </div>
                </div>
                
                <div className="border rounded-lg">
                  <div className="p-3 bg-slate-50 border-b">
                    <Label className="text-base font-semibold">Journal Items</Label>
                  </div>
                  <div className="p-3">
                    {viewingEntry.items?.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between py-2 border-b last:border-0">
                        <span>{item.account?.account_number} - {item.account?.account_name}</span>
                        <div className="flex gap-4">
                          <span className="text-green-600 w-24 text-right">{formatCurrency(item.debit)}</span>
                          <span className="text-red-600 w-24 text-right">{formatCurrency(item.credit)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-slate-50 border-t flex justify-between font-semibold">
                    <span>Total</span>
                    <div className="flex gap-4">
                      <span className="text-green-600 w-24 text-right">{formatCurrency(viewingEntry.total_debit || 0)}</span>
                      <span className="text-red-600 w-24 text-right">{formatCurrency(viewingEntry.total_credit || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
