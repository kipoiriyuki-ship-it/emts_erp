"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  Camera,
  User,
  FileSpreadsheet,
  FileText
} from "lucide-react"
import { attendanceApi } from "@/lib/api/attendance"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/toast"
import { exportToExcel } from "@/lib/utils/export-excel"
import { exportToPDF } from "@/lib/utils/export-pdf"

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [todayStats, setTodayStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    onTime: 0,
  })
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)

  const paginatedAttendance = attendanceData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(attendanceData.length / itemsPerPage)

  useEffect(() => {
    loadAttendance()
  }, [])

  const loadAttendance = async () => {
    try {
      setLoading(true)
      const response = await attendanceApi.allAttendance()
      const data = response.data || []
      
      setAttendanceData(data)
      
      // Calculate today's stats
      const today = new Date().toISOString().split('T')[0]
      const todayRecords = data.filter((a: any) => a.date === today)
      
      setTodayStats({
        total: todayRecords.length,
        present: todayRecords.filter((a: any) => a.status === 'present').length,
        absent: todayRecords.filter((a: any) => a.status === 'absent').length,
        late: todayRecords.filter((a: any) => a.status === 'late').length,
        onTime: todayRecords.filter((a: any) => a.status === 'present' && a.check_in_time).length,
      })
    } catch (error) {
      console.error("Error loading attendance:", error)
      addToast({ 
        title: "Error", 
        description: "Failed to load attendance data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading attendance data...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage employee attendance</p>
        </div>

        {/* Today's Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{todayStats.total}</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-2xl font-bold text-green-600">{todayStats.present}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{todayStats.absent}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Late</p>
                  <p className="text-2xl font-bold text-amber-600">{todayStats.late}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">On Time</p>
                  <p className="text-2xl font-bold">{todayStats.onTime}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Attendance Records</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const columns = [
                      { key: 'date', label: 'Date' },
                      { key: 'user', label: 'Name', format: (val: any) => val?.name || '-' },
                      { key: 'check_in_time', label: 'Check In' },
                      { key: 'check_out_time', label: 'Check Out' },
                      { key: 'status', label: 'Status' },
                    ]
                    exportToExcel(attendanceData, columns, 'attendance')
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
                      { key: 'date', label: 'Date' },
                      { key: 'user', label: 'Name', format: (val: any) => val?.name || '-' },
                      { key: 'check_in_time', label: 'Check In' },
                      { key: 'check_out_time', label: 'Check Out' },
                      { key: 'status', label: 'Status' },
                    ]
                    exportToPDF(attendanceData, columns, 'attendance', 'Attendance Report')
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {attendanceData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No attendance records found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Photo</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.date}</TableCell>
                      <TableCell>{record.user?.name || '-'}</TableCell>
                      <TableCell>{record.check_in_time || "-"}</TableCell>
                      <TableCell>{record.check_out_time || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">
                            {record.check_in_lat && record.check_in_lng 
                              ? `${record.check_in_lat.toFixed(4)}, ${record.check_in_lng.toFixed(4)}`
                              : '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.status === "present" ? "success" : record.status === "late" ? "warning" : "destructive"}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.photo_url ? (
                          <Button variant="ghost" size="sm">
                            <Camera className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">No photo</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, attendanceData.length)} of {attendanceData.length} records
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
        </Card>
      </div>
    </DashboardLayout>
  )
}
