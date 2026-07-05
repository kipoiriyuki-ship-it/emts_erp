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
import { Plus, Edit, Trash2, Search, Loader2, User, Building2, Briefcase, FileSpreadsheet, FileText } from "lucide-react"
import { employeesApi, Employee, Department, Position } from "@/lib/api/employees"
import { usersApi } from "@/lib/api/users"
import { useToast } from "@/components/ui/toast"
import { exportToExcel } from "@/lib/utils/export-excel"
import { exportToPDF } from "@/lib/utils/export-pdf"
import { Pagination } from "@/components/ui/pagination"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { addToast } = useToast()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    user_id: "",
    employee_id: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Indonesia",
    department_id: "",
    position_id: "",
    hire_date: "",
    employment_type: "full_time",
    employment_status: "active",
    salary: "",
    bank_name: "",
    bank_account_number: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    education_level: "",
    institution: "",
    degree: "",
    skills: "",
    notes: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [employeesResponse, departmentsResponse, positionsResponse, usersResponse] = await Promise.all([
        employeesApi.getEmployees(),
        employeesApi.getDepartments(),
        employeesApi.getPositions(),
        usersApi.getUsers(),
      ])
      setEmployees(employeesResponse.data || employeesResponse)
      setDepartments(departmentsResponse)
      setPositions(positionsResponse)
      setUsers(usersResponse.data || usersResponse)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingEmployee(null)
    setErrors({})
    setFormData({
      user_id: "",
      employee_id: "",
      first_name: "",
      last_name: "",
      date_of_birth: "",
      gender: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postal_code: "",
      country: "Indonesia",
      department_id: "",
      position_id: "",
      hire_date: "",
      employment_type: "full_time",
      employment_status: "active",
      salary: "",
      bank_name: "",
      bank_account_number: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
      education_level: "",
      institution: "",
      degree: "",
      skills: "",
      notes: "",
    })
    setDialogOpen(true)
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setErrors({})
    setFormData({
      user_id: employee.user_id?.toString() || employee.user?.id?.toString() || "",
      employee_id: employee.employee_id || "",
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      date_of_birth: employee.date_of_birth || "",
      gender: employee.gender || "",
      phone: employee.phone || "",
      address: employee.address || "",
      city: employee.city || "",
      state: employee.state || "",
      postal_code: employee.postal_code || "",
      country: employee.country || "Indonesia",
      department_id: employee.department_id?.toString() || "",
      position_id: employee.position_id?.toString() || "",
      hire_date: employee.hire_date || "",
      employment_type: employee.employment_type || "full_time",
      employment_status: employee.employment_status || "active",
      salary: employee.salary?.toString() || "",
      bank_name: employee.bank_name || "",
      bank_account_number: employee.bank_account_number || "",
      emergency_contact_name: employee.emergency_contact_name || "",
      emergency_contact_phone: employee.emergency_contact_phone || "",
      emergency_contact_relationship: employee.emergency_contact_relationship || "",
      education_level: employee.education_level || "",
      institution: employee.institution || "",
      degree: employee.degree || "",
      skills: employee.skills || "",
      notes: employee.notes || "",
    })
    setDialogOpen(true)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.user_id) newErrors.user_id = "User is required"
    if (!formData.employee_id) newErrors.employee_id = "Employee ID is required"
    if (!formData.first_name) newErrors.first_name = "First name is required"
    if (!formData.last_name) newErrors.last_name = "Last name is required"
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required"
    if (!formData.gender) newErrors.gender = "Gender is required"
    if (!formData.phone) newErrors.phone = "Phone is required"
    if (!formData.department_id) newErrors.department_id = "Department is required"
    if (!formData.position_id) newErrors.position_id = "Position is required"
    if (!formData.hire_date) newErrors.hire_date = "Hire date is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      const data = {
        ...formData,
        user_id: parseInt(formData.user_id),
        department_id: formData.department_id ? parseInt(formData.department_id) : undefined,
        position_id: formData.position_id ? parseInt(formData.position_id) : undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
      }

      if (editingEmployee) {
        await employeesApi.updateEmployee(editingEmployee.id, data)
        addToast({ title: "Success", description: "Employee updated successfully" })
      } else {
        await employeesApi.createEmployee(data)
        addToast({ title: "Success", description: "Employee created successfully" })
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      console.error("Error saving employee:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to save employee. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return
    setDeleting(id)
    try {
      await employeesApi.deleteEmployee(id)
      addToast({ title: "Success", description: "Employee deleted successfully" })
      loadData()
    } catch (error) {
      console.error("Error deleting employee:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to delete employee. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeleting(null)
    }
  }

  const filteredEmployees = employees.filter((employee) =>
    (employee.first_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (employee.last_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (employee.employee_id ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (employee.user?.email ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredEmployees.length / pageSize)
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

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
            <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
            <p className="text-muted-foreground mt-1">Manage employee records and information</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Employees</CardTitle>
            <CardDescription>View and manage employee records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-between items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const columns = [
                      { key: 'employee_id', label: 'Employee ID' },
                      { key: 'first_name', label: 'First Name' },
                      { key: 'last_name', label: 'Last Name' },
                      { key: 'department', label: 'Department', format: (val: any) => val?.name || '-' },
                      { key: 'position', label: 'Position', format: (val: any) => val?.name || '-' },
                      { key: 'employment_status', label: 'Status' },
                      { key: 'employment_type', label: 'Type' },
                      { key: 'hire_date', label: 'Hire Date', format: (val: string) => new Date(val).toLocaleDateString() },
                    ]
                    exportToExcel(filteredEmployees, columns, 'employees')
                  }}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const columns = [
                      { key: 'employee_id', label: 'Employee ID' },
                      { key: 'first_name', label: 'First Name' },
                      { key: 'last_name', label: 'Last Name' },
                      { key: 'department', label: 'Department', format: (val: any) => val?.name || '-' },
                      { key: 'position', label: 'Position', format: (val: any) => val?.name || '-' },
                      { key: 'employment_status', label: 'Status' },
                      { key: 'employment_type', label: 'Type' },
                      { key: 'hire_date', label: 'Hire Date', format: (val: string) => new Date(val).toLocaleDateString() },
                    ]
                    exportToPDF(filteredEmployees, columns, 'employees', 'Employees Report')
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            {filteredEmployees.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No employees found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.employee_id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                          <p className="text-sm text-muted-foreground">{employee.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{employee.department?.name || "-"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{employee.position?.name || "-"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          employee.employment_status === "active" ? "success" :
                          employee.employment_status === "on_leave" ? "warning" :
                          "destructive"
                        }>
                          {employee.employment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{employee.employment_type}</TableCell>
                      <TableCell>{new Date(employee.hire_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(employee)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(employee.id)}
                            disabled={deleting === employee.id}
                          >
                            {deleting === employee.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {filteredEmployees.length > 0 && (
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingEmployee ? "Edit Employee" : "Create Employee"}</DialogTitle>
              <DialogDescription>
                {editingEmployee ? "Update employee information" : "Add a new employee to the system"}
              </DialogDescription>
            </DialogHeader>
            <div className="h-[calc(90vh-140px)] overflow-y-auto pr-4">
              <form onSubmit={handleSave} className="space-y-4">
                {/* Basic Information */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="user">User Account *</Label>
                      <Select value={formData.user_id} onValueChange={(value) => setFormData({ ...formData, user_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employee_id">Employee ID *</Label>
                      <Input
                        id="employee_id"
                        value={formData.employee_id}
                        onChange={(e) => setFormData({ ...formData, employee_id: e.target.value.toUpperCase() })}
                        placeholder="EMP-001"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={users.find(u => u.id.toString() === formData.user_id)?.email || ""}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-3">Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input
                        id="postal_code"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Employment */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Employment
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select value={formData.department_id} onValueChange={(value) => setFormData({ ...formData, department_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Select value={formData.position_id} onValueChange={(value) => setFormData({ ...formData, position_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((pos) => (
                            <SelectItem key={pos.id} value={pos.id.toString()}>
                              {pos.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hire_date">Hire Date *</Label>
                      <Input
                        id="hire_date"
                        type="date"
                        value={formData.hire_date}
                        onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employment_type">Employment Type *</Label>
                      <Select value={formData.employment_type} onValueChange={(value) => setFormData({ ...formData, employment_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full Time</SelectItem>
                          <SelectItem value="part_time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employment_status">Employment Status *</Label>
                      <Select value={formData.employment_status} onValueChange={(value) => setFormData({ ...formData, employment_status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on_leave">On Leave</SelectItem>
                          <SelectItem value="resigned">Resigned</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary</Label>
                      <Input
                        id="salary"
                        type="number"
                        step="0.01"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Information */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-3">Bank Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">Bank Name</Label>
                      <Input
                        id="bank_name"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bank_account_number">Bank Account Number</Label>
                      <Input
                        id="bank_account_number"
                        value={formData.bank_account_number}
                        onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-3">Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_name">Contact Name</Label>
                      <Input
                        id="emergency_contact_name"
                        value={formData.emergency_contact_name}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                      <Input
                        id="emergency_contact_phone"
                        value={formData.emergency_contact_phone}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                      <Input
                        id="emergency_contact_relationship"
                        value={formData.emergency_contact_relationship}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-3">Education</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="education_level">Education Level</Label>
                      <Input
                        id="education_level"
                        value={formData.education_level}
                        onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                        placeholder="Bachelor's, Master's, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="institution">Institution</Label>
                      <Input
                        id="institution"
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="degree">Degree</Label>
                      <Input
                        id="degree"
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional */}
                <div>
                  <h3 className="font-semibold mb-3">Additional Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills</Label>
                      <Input
                        id="skills"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        placeholder="Comma-separated skills"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
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
                      editingEmployee ? "Update" : "Create"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
