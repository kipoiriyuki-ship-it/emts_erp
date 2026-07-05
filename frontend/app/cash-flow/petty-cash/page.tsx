"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  DollarSign, 
  Wallet,
  Plus,
  FileText
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const pettyCashBalance = 50000000
const recentTransactions = [
  { id: 1, date: "2024-06-23", description: "Office Supplies", amount: -500000, type: "expense", requester: "Budi Santoso" },
  { id: 2, date: "2024-06-22", description: "Transportation", amount: -250000, type: "expense", requester: "Siti Rahayu" },
  { id: 3, date: "2024-06-21", description: "Site Materials", amount: -1500000, type: "expense", requester: "Ahmad Wijaya" },
  { id: 4, date: "2024-06-20", description: "Replenishment", amount: 5000000, type: "income", requester: "Finance Dept" },
  { id: 5, date: "2024-06-19", description: "Printing", amount: -100000, type: "expense", requester: "Dewi Lestari" },
]

export default function PettyCashPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Petty Cash Management</h1>
            <p className="text-muted-foreground mt-1">Manage small cash transactions</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>

        {/* Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{formatCurrency(pettyCashBalance)}</p>
            <p className="text-sm text-muted-foreground mt-2">Available for disbursement</p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Request Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Petty Cash Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Purpose</label>
                  <Input placeholder="e.g., Office Supplies" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (IDR)</label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea placeholder="Provide details about the request..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Attach Receipt (Optional)</label>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Upload Receipt
                  </Button>
                </div>
                <Button className="w-full">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date} • {transaction.requester}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                      </p>
                      <Badge variant={transaction.type === "income" ? "success" : "secondary"} className="text-xs">
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-100" : "bg-red-100"}`}>
                      <DollarSign className={`h-4 w-4 ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`} />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date} • Requested by {transaction.requester}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                    </p>
                    <Badge variant={transaction.type === "income" ? "success" : "secondary"}>
                      {transaction.type}
                    </Badge>
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
