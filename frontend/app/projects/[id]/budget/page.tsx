"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { projectsApi, Project } from "@/lib/api/projects"
import { budgetApi, Budget } from "@/lib/api/budget"
import { formatCurrency } from "@/lib/utils"

export default function ProjectBudgetPage() {
  const params = useParams()
  const projectId = parseInt(params.id as string)
  const [project, setProject] = useState<Project | null>(null)
  const [budget, setBudget] = useState<Budget | null>(null)
  const [budgetVsActual, setBudgetVsActual] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [projectResponse] = await Promise.all([
        projectsApi.getProject(projectId),
      ])
      setProject(projectResponse)
      
      // Try to get budget for this project
      const budgets = await budgetApi.getBudgets({ project_id: projectId })
      if (budgets.data && budgets.data.length > 0) {
        const projectBudget = budgets.data[0]
        setBudget(projectBudget)
        const vsActual = await budgetApi.getBudgetVsActual(projectBudget.id)
        setBudgetVsActual(vsActual)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

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
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Project Budget Monitoring</h1>
              <p className="text-muted-foreground mt-1">{project?.name}</p>
            </div>
          </div>
          {budget && budget.status === 'draft' && (
            <Button onClick={() => budgetApi.approveBudget(budget.id).then(loadData)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Budget
            </Button>
          )}
        </div>

        {!budget ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No budget defined for this project</p>
              <Button className="mt-4">
                Create Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Budget Summary */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Budget</p>
                      <p className="text-2xl font-bold">{formatCurrency(budget.total_budget)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Actual Spent</p>
                      <p className="text-2xl font-bold">{formatCurrency(budget.actual_amount)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                      <p className={`text-2xl font-bold ${budget.remaining_amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(budget.remaining_amount)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={budget.status === 'active' ? 'success' : budget.status === 'draft' ? 'secondary' : 'default'}>
                        {budget.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Budget vs Actual */}
            {budgetVsActual && (
              <Card>
                <CardHeader>
                  <CardTitle>Budget vs Actual Analysis</CardTitle>
                  <CardDescription>
                    {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium">Total Planned</p>
                        <p className="text-2xl font-bold text-blue-900">{formatCurrency(budgetVsActual.summary.total_planned)}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">Total Actual</p>
                        <p className="text-2xl font-bold text-green-900">{formatCurrency(budgetVsActual.summary.total_actual)}</p>
                      </div>
                    </div>
                    
                    <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${Math.min(budgetVsActual.summary.utilization_percent, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Budget Utilization: {budgetVsActual.summary.utilization_percent.toFixed(1)}%
                    </p>

                    {budgetVsActual.details.length > 0 ? (
                      <div className="space-y-3 mt-6">
                        <h4 className="font-semibold">Budget Details</h4>
                        {budgetVsActual.details.map((detail: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{detail.account_name}</p>
                              <p className="text-sm text-muted-foreground">{detail.account_number}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(detail.planned_amount)}</p>
                              <p className="text-sm text-muted-foreground">Planned</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${detail.actual_amount > detail.planned_amount ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(detail.actual_amount)}
                              </p>
                              <p className="text-sm text-muted-foreground">Actual</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${detail.variance_type === 'favorable' ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(detail.variance)}
                              </p>
                              <p className="text-sm text-muted-foreground">Variance</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No budget details available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
