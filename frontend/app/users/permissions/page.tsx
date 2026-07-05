"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, CheckCircle, XCircle, Shield, Users } from "lucide-react"
import { rolesApi, Role } from "@/lib/api/roles"
import { permissionsApi, Permission } from "@/lib/api/permissions"

export default function PermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [rolesResponse, permissionsResponse] = await Promise.all([
          rolesApi.getRoles(),
          permissionsApi.getPermissions(),
        ])

        setRoles(rolesResponse.roles)
        setPermissions(permissionsResponse.permissions)
      } catch (error) {
        console.error("Error loading permissions data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const groupedPermissions = permissions.reduce((groups, permission) => {
    const moduleKey = permission.module || "Other"
    if (!groups[moduleKey]) {
      groups[moduleKey] = []
    }
    groups[moduleKey].push(permission)
    return groups
  }, {} as Record<string, Permission[]>)

  const totalGranted = roles.reduce((sum, role) => sum + (role.permissions?.length || 0), 0)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permission Matrix</h1>
          <p className="text-muted-foreground mt-1">View permission assignments for each role</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Role Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-slate-500" />
                  <span className="text-sm font-medium">{role.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => (
            <Card key={moduleName}>
              <CardHeader>
                <CardTitle>{moduleName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-3 border-b">Permission</th>
                        {roles.map((role) => (
                          <th key={role.id} className="text-center p-3 border-b min-w-[120px]">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">{role.name}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {modulePermissions.map((permission) => (
                        <tr key={permission.id} className="border-b">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{permission.name}</p>
                                <p className="text-xs text-muted-foreground mt-1 font-mono">{permission.code}</p>
                              </div>
                            </div>
                          </td>
                          {roles.map((role) => {
                            const rolePermissionCodes = new Set(role.permissions?.map((perm) => perm.code) || [])
                            const hasPermission = rolePermissionCodes.has(permission.code)
                            return (
                              <td key={role.id} className="text-center p-3">
                                {hasPermission ? (
                                  <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Permission Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">Total Permissions</p>
                  <p className="text-2xl font-bold">{permissions.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">Total Roles</p>
                  <p className="text-2xl font-bold">{roles.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-medium">Total Grants</p>
                  <p className="text-2xl font-bold">{totalGranted}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
