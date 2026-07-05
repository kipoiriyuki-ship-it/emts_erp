"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  FolderKanban, 
  Calendar, 
  DollarSign, 
  Calculator, 
  CheckSquare, 
  Users, 
  FileText,
  Shield,
  Menu,
  X,
  ChevronDown,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authApi } from "@/lib/api/auth"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRouter } from "next/navigation"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  children?: NavItem[]
  permission?: string
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    permission: "MODULE.DASHBOARD",
  },
  {
    title: "Projects",
    href: "/projects",
    icon: <FolderKanban className="h-4 w-4" />,
    permission: "MODULE.PROJECTS",
    children: [
      { title: "Overview", href: "/projects", icon: null },
      { title: "Field Monitoring", href: "/projects/field-monitoring", icon: null, permission: "MODULE.FIELD_MONITORING" },
    ],
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: <Calendar className="h-4 w-4" />,
    permission: "MODULE.ATTENDANCE",
  },
  {
    title: "Cash Flow",
    href: "/cash-flow",
    icon: <DollarSign className="h-4 w-4" />,
    permission: "MODULE.FINANCE",
    children: [
      { title: "Petty Cash", href: "/finance/petty-cash", icon: null, permission: "MODULE.PETTY_CASH" },
      { title: "Large Cash Requests", href: "/finance/large-cash", icon: null, permission: "MODULE.LARGE_CASH" },
    ],
  },
  {
    title: "Accounting",
    href: "/accounting",
    icon: <Calculator className="h-4 w-4" />,
    permission: "MODULE.ACCOUNTING",
    children: [
      { title: "Chart of Accounts", href: "/accounting/coa", icon: null },
      { title: "Journal Entries", href: "/accounting/journal", icon: null },
      { title: "Ledger", href: "/accounting/ledger", icon: null },
      { title: "Reports", href: "/accounting/reports", icon: null, permission: "MODULE.REPORTS" },
    ],
  },
  {
    title: "Approvals",
    href: "/approvals",
    icon: <CheckSquare className="h-4 w-4" />,
    permission: "MODULE.APPROVAL",
  },
  {
    title: "Users",
    href: "/users",
    icon: <Users className="h-4 w-4" />,
    permission: "MODULE.USER_MANAGEMENT",
  },
  {
    title: "Employees",
    href: "/employees",
    icon: <Users className="h-4 w-4" />,
    permission: "MODULE.EMPLOYEE_MANAGEMENT",
  },
  {
    title: "Audit Logs",
    href: "/audit-logs",
    icon: <FileText className="h-4 w-4" />,
    permission: "MODULE.AUDIT_LOG",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Shield className="h-4 w-4" />,
    permission: "MODULE.SETTINGS",
  },
]

interface SidebarProps {
  user?: {
    name: string
    email: string
    role: string
    roleCode?: string
  }
  permissions?: string[]
}

export function Sidebar({ user, permissions = [] }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)

  const financialPolicyItem: NavItem = {
    title: "Financial Policy",
    href: "/settings/financial-policy",
    icon: <Shield className="h-4 w-4" />,
  }

  const isPrivilegedUser = user?.roleCode && ['SUPER_ADMIN', 'DIRECTOR'].includes(user.roleCode)

  const menuItems = isPrivilegedUser
    ? [
        ...navItems.slice(0, 6),
        financialPolicyItem,
        ...navItems.slice(6),
      ]
    : navItems

  const filteredNavItems = menuItems.filter(item => {
    if (!item.permission || isPrivilegedUser) return true
    return permissions.includes(item.permission)
  }).map(item => ({
    ...item,
    children: item.children?.filter(child => {
      if (!child.permission || isPrivilegedUser) return true
      return permissions.includes(child.permission)
    })
  }))

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      logout()
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("remember_login")
      router.push("/login")
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-[#0F4C81] text-white transition-all duration-300 lg:static",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                <span className="text-sm font-semibold">EM</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold tracking-tight">EMTS</span>
                <span className="text-[10px] uppercase tracking-[0.24em] text-sky-100/80">Elyn-MMT System</span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                {item.children && item.children.length > 0 ? (
                  <SubMenuItem item={item} collapsed={collapsed} pathname={pathname} />
                ) : (
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all hover:bg-[#1976D2]",
                        pathname === item.href ? "bg-[#64B5F6] text-white shadow-sm" : "text-slate-100"
                      )}
                    >
                      {item.icon}
                      {!collapsed && <span>{item.title}</span>}
                    </div>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        {!collapsed && user && (
          <div className="border-t border-white/10 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#64B5F6] text-[#0F4C81]">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-2 text-left">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-sky-100/80">{user.role}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>
    </>
  )
}

function SubMenuItem({ item, collapsed, pathname }: { item: NavItem; collapsed: boolean; pathname: string }) {
  const [open, setOpen] = useState(false)

  if (collapsed) {
    return (
      <Link href={item.href}>
        <div className="flex items-center justify-center rounded-xl px-3 py-2 text-slate-100 transition-colors hover:bg-[#1976D2]">
          {item.icon}
        </div>
      </Link>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all hover:bg-[#1976D2]",
          pathname.startsWith(item.href) ? "bg-[#64B5F6] text-white shadow-sm" : "text-slate-100"
        )}
      >
        <div className="flex items-center gap-3">
          {item.icon}
          <span>{item.title}</span>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && item.children && item.children.length > 0 && (
        <ul className="ml-4 mt-1 space-y-1">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link href={child.href}>
                <div
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[#1976D2]",
                    pathname === child.href ? "text-white" : "text-slate-300"
                  )}
                >
                  {child.title}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
