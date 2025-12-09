"use client"

import { TopNavbar } from "@/components/top-navbar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import {
  useOrganizationOverview,
  usePublicationsStats,
  useDepartmentStats,
  useEmployeeDemographics,
} from "@/lib/hooks/use-dashboard-query"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

import { format } from "date-fns"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"

// Color palettes
const COLORS = {
  primary: ["#005357", "#007A80", "#00A3AA", "#33B8BD", "#66CDD1"],
  secondary: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"],
}

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useOrganizationOverview()
  const { data: publications, isLoading: publicationsLoading } = usePublicationsStats()
  const { data: departments, isLoading: departmentsLoading } = useDepartmentStats()
  const { data: demographics, isLoading: demographicsLoading } = useEmployeeDemographics()

  const isLoading = overviewLoading || publicationsLoading || departmentsLoading || demographicsLoading

  return (
    <>
      <header className="bg-background sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b p-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <TopNavbar />
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Organization overview and key metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Last updated: {format(new Date(), "MMM d, yyyy HH:mm")}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Icon name="Loader2" size={48} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Icon name="Users" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview?.total_employees || 0}</div>
                  <p className="text-xs text-muted-foreground">Active staff members</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Departments</CardTitle>
                  <Icon name="Building" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview?.total_departments || 0}</div>
                  <p className="text-xs text-muted-foreground">Organizational units</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Positions</CardTitle>
                  <Icon name="BadgeCheck" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview?.total_positions || 0}</div>
                  <p className="text-xs text-muted-foreground">Job positions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Publications</CardTitle>
                  <Icon name="BookOpen" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview?.total_publications || 0}</div>
                  <p className="text-xs text-muted-foreground">Published research</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Publications Trend</CardTitle>
                  <CardDescription>Monthly submissions (last 12 months)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={publications?.monthly_trend || []}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary[0]} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={COLORS.primary[0]} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(value) => format(new Date(value), "MMM yy")}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => format(new Date(value), "MMMM yyyy")}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke={COLORS.primary[0]}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Distribution</CardTitle>
                  <CardDescription>Employees by department (top 10)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departments?.departments_by_employee_count || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="employee_count" fill={COLORS.primary[1]}>
                        {(departments?.departments_by_employee_count || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Publications by Type</CardTitle>
                  <CardDescription>Distribution of publication categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={publications?.publications_by_type || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) =>
                          `${props.publication_type}: ${(props.percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="publication_type"
                      >
                        {(publications?.publications_by_type || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.secondary[index % COLORS.secondary.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Publications by Year</CardTitle>
                  <CardDescription>Annual publication output (last 5 years)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={publications?.publications_by_year || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill={COLORS.primary[2]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 3 */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Growth</CardTitle>
                  <CardDescription>New employee joins (last 24 months)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={demographics?.join_date_trend || []}>
                      <defs>
                        <linearGradient id="colorJoins" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary[3]} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={COLORS.primary[3]} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(value) => format(new Date(value), "MMM yy")}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => format(new Date(value), "MMMM yyyy")}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke={COLORS.primary[3]}
                        fillOpacity={1}
                        fill="url(#colorJoins)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Publications by Indexation</CardTitle>
                  <CardDescription>Distribution by indexing service</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={publications?.publications_by_indexation || []}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="indexation" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="count" fill={COLORS.primary[4]}>
                        {(publications?.publications_by_indexation || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.secondary[index % COLORS.secondary.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 4 */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Employee Demographics</CardTitle>
                  <CardDescription>Gender distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={demographics?.employees_by_gender || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) =>
                          `${props.gender}: ${(props.percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="gender"
                      >
                        {(demographics?.employees_by_gender || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Staff Distribution</CardTitle>
                  <CardDescription>Employees by department (top 10)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={demographics?.employees_by_department || []}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="department_name" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="count" fill={COLORS.primary[0]}>
                        {(demographics?.employees_by_department || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Publications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Publications</CardTitle>
                <CardDescription>Latest 10 published research outputs</CardDescription>
              </CardHeader>

              <CardContent>
                <DataTable
                  columns={columns}
                  data={publications?.recent_publications || []}
                  isLoading={publicationsLoading}
                />
              </CardContent>

            </Card>
          </>
        )}
      </div>
    </>
  )
}
