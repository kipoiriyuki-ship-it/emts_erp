"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  Search,
  Loader2
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { pettyCashApi } from "@/lib/api/petty-cash"
import { financeApi } from "@/lib/api/finance"

export default function CashFlowPage() {
  const [pettyCashRequests, setPettyCashRequests] = useState<any[]>([])
  const [largeCashRequests, setLargeCashRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pettyResponse, largeResponse] = await Promise.all([
        pettyCashApi.getTransactions({ per_page: 100 }),
        financeApi.getLargeCashRequests({ per_page: 100 }),
      ])

      const pettyData = Array.isArray(pettyResponse)
        ? pettyResponse
        : pettyResponse.data ?? pettyResponse
      const largeData = Array.isArray(largeResponse)
        ? largeResponse
        : largeResponse.data ?? largeResponse

      setPettyCashRequests(Array.isArray(pettyData) ? pettyData : pettyData.data ?? [])
      setLargeCashRequests(Array.isArray(largeData) ? largeData : largeData.data ?? [])
    } catch (error) {
      console.error("Error loading cash flow data:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalPettyCash = pettyCashRequests.reduce((sum, request) => sum + (request.amount || 0), 0)
  const totalLargeCash = largeCashRequests.reduce((sum, request) => sum + (request.amount || request.total_amount || 0), 0)
  const pendingRequests = largeCashRequests.filter((request) => request.status === "pending").length
  const approvedThisMonth = largeCashRequests.filter((request) => request.status === "approved").length

  const filteredPettyCash = pettyCashRequests.filter((request) => {
    const lowerSearch = search.toLowerCase()
    const matchesSearch =
      request.transaction_number?.toLowerCase().includes(lowerSearch) ||
      request.description?.toLowerCase().includes(lowerSearch) ||
      request.receipt_number?.toLowerCase().includes(lowerSearch)
    const matchesStatus = !statusFilter || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredLargeCash = largeCashRequests.filter((request) => {
    const lowerSearch = search.toLowerCase()
    const matchesSearch =
      request.request_number?.toLowerCase().includes(lowerSearch) ||
      request.description?.toLowerCase().includes(lowerSearch) ||
      request.project?.name?.toLowerCase().includes(lowerSearch)
    const matchesStatus = !statusFilter || request.status === statusFilter
    return matchesSearch && matchesStatus
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
            <h1 className="text-3xl font-bold tracking-tight">Cash Flow Management</h1>
            <p className="text-muted-foreground mt-1">Manage petty cash and large cash requests</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Petty Cash Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalPettyCash)}</p>
                </div>
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Large Cash Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalLargeCash)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold">{pendingRequests}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved Requests</p>
                  <p className="text-2xl font-bold">{approvedThisMonth}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full rounded-md border p-2 pl-10"
              placeholder="Search cash flow records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border p-2"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
          </select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Petty Cash Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPettyCash.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.transaction_date || request.date}</TableCell>
                    <TableCell>{request.requester?.name || request.requester}</TableCell>
                    <TableCell>{request.description || request.purpose}</TableCell>
                    <TableCell>{formatCurrency(request.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === "approved" ? "success" : request.status === "pending" ? "warning" : "destructive"}>
                        {request.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Large Cash Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLargeCash.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.created_at || request.date}</TableCell>
                    <TableCell>{request.user?.name || request.requester}</TableCell>
                    <TableCell>{request.project?.name || request.project}</TableCell>
                    <TableCell>{request.description || request.purpose}</TableCell>
                    <TableCell>{formatCurrency(request.total_amount || request.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === "approved" ? "success" : request.status === "pending" ? "warning" : "destructive"}>
                        {request.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
