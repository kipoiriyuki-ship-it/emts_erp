"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { employeesApi, Employee } from "@/lib/api/employees"
import { Search, User as UserIcon, Mail, Building2, Calendar, Clock, Edit, Trash2, MoreHorizontal, Loader2, Eye } from "lucide-react"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [divisionFilter, setDivisionFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      setLoading(true)
      const response = await employeesApi.getEmployees({ per_page: 100 })
      const employeesData = Array.isArray(response)
        ? response
        : response.data ?? response
      setEmployees(Array.isArray(employeesData) ? employeesData : employeesData.data ?? [])
    } catch (error) {
      console.error("Error loading employees:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const lowerSearch = search.toLowerCase()
    const matchesSearch =
      (employee.name ?? "").toLowerCase().includes(lowerSearch) ||
      (employee.email ?? "").toLowerCase().includes(lowerSearch) ||
      employee.username?.toLowerCase().includes(lowerSearch) ||
      employee.nik?.toLowerCase().includes(lowerSearch) ||
      employee.division?.toLowerCase().includes(lowerSearch)
    const matchesDivision = !divisionFilter || employee.division === divisionFilter
    const matchesStatus = !statusFilter || employee.status === statusFilter
    return matchesSearch && matchesDivision && matchesStatus
  })

  const activeEmployees = employees.filter((e) => e.status === "active").length
  const inactiveEmployees = employees.filter((e) => e.status === "inactive").length
  const divisions = [...new Set(employees.map((e) => e.division).filter(Boolean))]

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
            <p className="text-muted-foreground mt-1">Manage company employees and their information</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{employees.length}</p>
                </div>
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{activeEmployees}</p>
                </div>
                <UserIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold text-red-600">{inactiveEmployees}</p>
                </div>
                <UserIcon className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">Employee List</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="p-2 border rounded-md"
              >
                <option value="">All Divisions</option>
                {divisions.map((division) => (
                  <option key={division ?? "unknown"} value={division ?? ""}>
                    {division ?? "Unknown Division"}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border rounded-md"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Employee</th>
                        <th className="text-left p-3">Username</th>
                        <th className="text-left p-3">Division</th>
                        <th className="text-left p-3">Position</th>
                        <th className="text-left p-3">Role</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Join Date</th>
                        <th className="text-left p-3">Last Login</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-4 text-center text-muted-foreground">
                            No employees match your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredEmployees.map((employee) => (
                          <tr key={employee.id} className="border-b hover:bg-slate-50">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <UserIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{employee.name}</p>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    <span>{employee.email}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-sm">{employee.username || "-"}</td>
                            <td className="p-3 text-sm">
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                {employee.division || "-"}
                              </div>
                            </td>
                            <td className="p-3 text-sm">
                              {typeof employee.position === "string"
                                ? employee.position
                                : employee.position?.name || "-"}
                            </td>
                            <td className="p-3 text-sm">{employee.role?.name || "-"}</td>
                            <td className="p-3">
                              <Badge variant={employee.status === "active" ? "success" : "secondary"}>
                                {employee.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-sm">
                              {employee.join_date ? (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  {new Date(employee.join_date).toLocaleDateString()}
                                </div>
                              ) : "-"}
                            </td>
                            <td className="p-3 text-sm">
                              {employee.last_login_at ? (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  {new Date(employee.last_login_at).toLocaleString()}
                                </div>
                              ) : "-"}
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedEmployee(employee)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Select an employee to view attendance details.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
