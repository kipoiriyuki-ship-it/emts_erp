"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  FileText, 
  TrendingUp,
  DollarSign,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

const accountingModules = [
  { 
    id: 1, 
    name: "Chart of Accounts", 
    description: "Manage account structure and hierarchy",
    icon: BookOpen,
    href: "/accounting/coa",
    color: "blue"
  },
  { 
    id: 2, 
    name: "Journal Entries", 
    description: "Record and manage journal entries",
    icon: FileText,
    href: "/accounting/journal",
    color: "green"
  },
  { 
    id: 3, 
    name: "General Ledger", 
    description: "View account balances and transactions",
    icon: TrendingUp,
    href: "/accounting/ledger",
    color: "purple"
  },
  { 
    id: 4, 
    name: "Financial Reports", 
    description: "Generate financial statements",
    icon: DollarSign,
    href: "/accounting/reports",
    color: "amber"
  },
]

const recentActivity = [
  { id: 1, type: "Journal Entry", description: "JE-2024-001: Office Supplies Purchase", date: "2024-06-23", amount: 500000 },
  { id: 2, type: "Journal Entry", description: "JE-2024-002: Material Payment", date: "2024-06-22", amount: 25000000 },
  { id: 3, type: "Report Generated", description: "Income Statement - June 2024", date: "2024-06-21", amount: 0 },
  { id: 4, type: "Journal Entry", description: "JE-2024-003: Utility Payment", date: "2024-06-20", amount: 1500000 },
  { id: 5, type: "Account Created", description: "New Account: 1010 - Cash on Hand", date: "2024-06-19", amount: 0 },
]

export default function AccountingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting Module</h1>
          <p className="text-muted-foreground mt-1">Manage financial records and reports</p>
        </div>

        {/* Module Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {accountingModules.map((module) => (
            <Link key={module.id} href={module.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className={`p-3 rounded-lg w-fit mb-2 ${
                    module.color === "blue" ? "bg-blue-100" :
                    module.color === "green" ? "bg-green-100" :
                    module.color === "purple" ? "bg-purple-100" :
                    "bg-amber-100"
                  }`}>
                    <module.icon className={`h-6 w-6 ${
                      module.color === "blue" ? "text-blue-600" :
                      module.color === "green" ? "text-green-600" :
                      module.color === "purple" ? "text-purple-600" :
                      "text-amber-600"
                    }`} />
                  </div>
                  <CardTitle className="text-lg">{module.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                  <div className="flex items-center mt-4 text-sm text-blue-600">
                    <span>Open</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.type} • {activity.date}</p>
                  </div>
                  {activity.amount > 0 && (
                    <p className="font-semibold">{activity.amount.toLocaleString("id-ID")}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
