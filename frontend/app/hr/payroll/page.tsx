"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Search, Loader2, Calendar, DollarSign, PlayCircle, CheckCircle } from "lucide-react"
import { payrollApi, Payroll } from "@/lib/api/payroll"
import { employeesApi } from "@/lib/api/employees"
import { formatCurrency } from "@/lib/utils"

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [periodFilter, setPeriodFilter] = useState("")
  const [formData, setFormData] = useState({
    employee_id: "",
    period: "",
    start_date: "",
    end_date: "",
    basic_salary: "",
    allowances: "",
    deductions: "",
    tax: "",
    insurance: "",
    notes: "",
  })
  const [generateFormData, setGenerateFormData] = useState({
    period: "",
    start_date: "",
    end_date: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [payrollsResponse, employeesResponse] = await Promise.all([
        payrollApi.getPayrolls(),
        employeesApi.getEmployees(),
      ])
      setPayrolls(payrollsResponse.data || payrollsResponse)
      setEmployees(employeesResponse.data || employeesResponse)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingPayroll(null)
    setFormData({
      employee_id: "",
      period: "",
      start_date: "",
      end_date: "",
      basic_salary: "",
      allowances: "",
      deductions: "",
      tax: "",
      insurance: "",
      notes: "",
    })
    setDialogOpen(true)
  }

  const handleEdit = (payroll: Payroll) => {
    setEditingPayroll(payroll)
    setFormData({
      employee_id: payroll.employee_id.toString(),
      period: payroll.period,
      start_date: payroll.start_date,
      end_date: payroll.end_date,
      basic_salary: payroll.basic_salary.toString(),
      allowances: payroll.allowances.toString(),
      deductions: payroll.deductions.toString(),
      tax: payroll.tax.toString(),
      insurance: payroll.insurance.toString(),
      notes: payroll.notes || "",
    })
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        ...formData,
        employee_id: parseInt(formData.employee_id),
        basic_salary: parseFloat(formData.basic_salary),
        allowances: formData.allowances ? parseFloat(formData.allowances) : 0,
        deductions: formData.deductions ? parseFloat(formData.deductions) : 0,
        tax: formData.tax ? parseFloat(formData.tax) : 0,
        insurance: formData.insurance ? parseFloat(formData.insurance) : 0,
      }

      if (editingPayroll) {
        await payrollApi.updatePayroll(editingPayroll.id, data)
      } else {
        await payrollApi.createPayroll(data)
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("Error saving payroll:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payroll?")) return
    setDeleting(id)
    try {
      await payrollApi.deletePayroll(id)
      loadData()
    } catch (error) {
      console.error("Error deleting payroll:", error)
    } finally {
      setDeleting(null)
    }
  }

  const handleProcess = async (id: number) => {
    if (!confirm("Are you sure you want to process this payroll?")) return
    try {
      await payrollApi.processPayroll(id)
      loadData()
    } catch (error) {
      console.error("Error processing payroll:", error)
    }
  }

  const handleMarkAsPaid = async (id: number) => {
    if (!confirm("Are you sure you want to mark this payroll as paid?")) return
    try {
      await payrollApi.markAsPaid(id)
      loadData()
    } catch (error) {
      console.error("Error marking payroll as paid:", error)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    try {
      await payrollApi.generatePeriod(generateFormData)
      setGenerateDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("Error generating payroll:", error)
    } finally {
      setGenerating(false)
    }
  }

  const filteredPayrolls = payrolls.filter((payroll) => {
    const matchesSearch = 
      payroll.employee?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      payroll.employee?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      payroll.employee?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      payroll.period.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || payroll.status === statusFilter
    const matchesPeriod = !periodFilter || payroll.period === periodFilter
    return matchesSearch && matchesStatus && matchesPeriod
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
            <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
            <p className="text-muted-foreground mt-1">Manage employee payroll and salary payments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setGenerateDialogOpen(true)}>
              <Calendar className="h-4 w-4 mr-2" />
              Generate Period
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Payroll
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Payrolls</CardTitle>
            <CardDescription>View and manage payroll records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payrolls..."
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
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Period (e.g., 2024-06)"
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="w-[150px]"
              />
            </div>

            {filteredPayrolls.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No payroll records found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayrolls.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell className="font-medium">
                        {payroll.employee?.first_name} {payroll.employee?.last_name}
                      </TableCell>
                      <TableCell>{payroll.period}</TableCell>
                      <TableCell>{formatCurrency(payroll.basic_salary)}</TableCell>
                      <TableCell>{formatCurrency(payroll.overtime_pay)}</TableCell>
                      <TableCell>{formatCurrency(payroll.allowances)}</TableCell>
                      <TableCell>{formatCurrency(payroll.deductions + payroll.tax + payroll.insurance)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(payroll.net_salary)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          payroll.status === 'paid' ? 'success' :
                          payroll.status === 'processed' ? 'default' :
                          'secondary'
                        }>
                          {payroll.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {payroll.status === 'draft' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(payroll)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(payroll.id)}
                                disabled={deleting === payroll.id}
                              >
                                {deleting === payroll.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleProcess(payroll.id)}>
                                <PlayCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {payroll.status === 'processed' && (
                            <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(payroll.id)}>
                              <CheckCircle className="h-3 w-3" />
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPayroll ? "Edit Payroll" : "New Payroll"}</DialogTitle>
              <DialogDescription>
                {editingPayroll ? "Update payroll details" : "Create a new payroll record"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee *</Label>
                <Select value={formData.employee_id} onValueChange={(value) => setFormData({ ...formData, employee_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={formData.start_date}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="basic_salary">Basic Salary *</Label>
                <Input
                  id="basic_salary"
                  type="number"
                  step="0.01"
                  value={formData.basic_salary}
                  onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="allowances">Allowances</Label>
                  <Input
                    id="allowances"
                    type="number"
                    step="0.01"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deductions">Deductions</Label>
                  <Input
                    id="deductions"
                    type="number"
                    step="0.01"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insurance">Insurance</Label>
                  <Input
                    id="insurance"
                    type="number"
                    step="0.01"
                    value={formData.insurance}
                    onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
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
                    editingPayroll ? "Update" : "Create"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Generate Dialog */}
        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Payroll for Period</DialogTitle>
              <DialogDescription>
                Generate payroll records for all active employees for a specific period
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gen_period">Period *</Label>
                <Input
                  id="gen_period"
                  value={generateFormData.period}
                  onChange={(e) => setGenerateFormData({ ...generateFormData, period: e.target.value })}
                  placeholder="2024-06"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gen_start_date">Start Date *</Label>
                  <Input
                    id="gen_start_date"
                    type="date"
                    value={generateFormData.start_date}
                    onChange={(e) => setGenerateFormData({ ...generateFormData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gen_end_date">End Date *</Label>
                  <Input
                    id="gen_end_date"
                    type="date"
                    value={generateFormData.end_date}
                    onChange={(e) => setGenerateFormData({ ...generateFormData, end_date: e.target.value })}
                    min={generateFormData.start_date}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setGenerateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate"
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
