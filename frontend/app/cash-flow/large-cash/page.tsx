"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DollarSign, 
  TrendingUp,
  Plus,
  FileText,
  AlertCircle
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const largeCashRequests = [
  { id: 1, date: "2024-06-23", requester: "Budi Santoso", project: "Proyek Gedung A", purpose: "Material Purchase", amount: 25000000, status: "pending", urgency: "high" },
  { id: 2, date: "2024-06-22", requester: "Siti Rahayu", project: "Renovasi Kantor", purpose: "Equipment Rental", amount: 15000000, status: "approved", urgency: "medium" },
  { id: 3, date: "2024-06-21", requester: "Ahmad Wijaya", project: "Instalasi Pabrik", purpose: "Labor Payment", amount: 35000000, status: "approved", urgency: "high" },
  { id: 4, date: "2024-06-20", requester: "Dewi Lestari", project: "Perbaikan Jembatan", purpose: "Material Delivery", amount: 12000000, status: "pending", urgency: "low" },
  { id: 5, date: "2024-06-19", requester: "Rina Kusuma", project: "Konstruksi Gudang", purpose: "Subcontractor", amount: 45000000, status: "rejected", urgency: "high" },
]

const projects = [
  { id: 1, name: "Proyek Gedung A" },
  { id: 2, name: "Renovasi Kantor" },
  { id: 3, name: "Instalasi Pabrik" },
  { id: 4, name: "Perbaikan Jembatan" },
  { id: 5, name: "Konstruksi Gudang" },
]

export default function LargeCashPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Large Cash Requests</h1>
            <p className="text-muted-foreground mt-1">Manage significant cash disbursements for projects</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests (This Month)</p>
                  <p className="text-2xl font-bold">Rp 132.000.000</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Approval</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved This Month</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Request Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Large Cash Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Purpose</label>
                  <Input placeholder="e.g., Material Purchase" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (IDR)</label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Urgency</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea placeholder="Provide detailed justification..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Attach Documents</label>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                </div>
                <Button className="w-full">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {largeCashRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{request.purpose}</p>
                        <p className="text-sm text-muted-foreground">{request.project} • {request.requester}</p>
                      </div>
                      <Badge variant={request.urgency === "high" ? "destructive" : request.urgency === "medium" ? "warning" : "secondary"}>
                        {request.urgency}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-lg font-semibold">{formatCurrency(request.amount)}</p>
                        <p className="text-xs text-muted-foreground">{request.date}</p>
                      </div>
                      <Badge variant={request.status === "approved" ? "success" : request.status === "pending" ? "warning" : "destructive"}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Large Cash Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {largeCashRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${request.urgency === "high" ? "bg-red-100" : request.urgency === "medium" ? "bg-amber-100" : "bg-slate-100"}`}>
                      <DollarSign className={`h-4 w-4 ${request.urgency === "high" ? "text-red-600" : request.urgency === "medium" ? "text-amber-600" : "text-slate-600"}`} />
                    </div>
                    <div>
                      <p className="font-medium">{request.purpose}</p>
                      <p className="text-sm text-muted-foreground">{request.project} • {request.date} • Requested by {request.requester}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{formatCurrency(request.amount)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={request.status === "approved" ? "success" : request.status === "pending" ? "warning" : "destructive"}>
                        {request.status}
                      </Badge>
                      <Badge variant={request.urgency === "high" ? "destructive" : request.urgency === "medium" ? "warning" : "secondary"}>
                        {request.urgency}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
