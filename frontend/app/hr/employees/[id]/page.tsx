"use client"

import { useParams, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNavbar } from "@/components/top-navbar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Icon } from "@/components/ui/icon"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useEmployee } from "@/lib/hooks/use-hr-query"

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const { data: employee, isLoading } = useEmployee(employeeId)

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return '??'
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      terminated: "destructive",
    }
    return (
      <Badge variant={variants[status] || "outline"}>
        {status}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="text-muted-foreground">Loading employee details...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!employee) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col items-center justify-center h-screen gap-4">
            <div className="text-muted-foreground">Employee not found</div>
            <Button onClick={() => router.push('/hr/employees')}>Back to Employees</Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/hr/employees">Staff</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{employee.full_name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={employee.avatar} />
                <AvatarFallback className="text-lg">
                  {getInitials(employee.first_name, employee.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{employee.full_name}</h1>
                <p className="text-muted-foreground">{employee.job_title || employee.position || 'N/A'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-mono">{employee.employee_id}</span>
                  {getStatusBadge(employee.employment_status)}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/hr/employees/${employeeId}/edit`)}>
                <Icon name="Edit" size={16} className="mr-2" />
                Edit
              </Button>
              <Button variant="destructive">
                <Icon name="Trash2" size={16} className="mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="User" size={20} />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">First Name</div>
                    <div className="mt-1">{employee.first_name || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Last Name</div>
                    <div className="mt-1">{employee.last_name || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Gender</div>
                    <div className="mt-1">{employee.gender || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Date of Birth</div>
                    <div className="mt-1">{employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Nationality</div>
                    <div className="mt-1">{employee.nationality || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Marital Status</div>
                    <div className="mt-1">{employee.marital_status || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">National ID</div>
                    <div className="mt-1">{employee.national_id || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Tax ID</div>
                    <div className="mt-1">{employee.tax_id || '-'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Mail" size={20} />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Email</div>
                  <div className="mt-1">{employee.personal_email || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Phone</div>
                  <div className="mt-1">{employee.phone || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Mobile</div>
                  <div className="mt-1">{employee.mobile || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Address</div>
                  <div className="mt-1">{employee.address || '-'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">City</div>
                    <div className="mt-1">{employee.city || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Postal Code</div>
                    <div className="mt-1">{employee.postal_code || '-'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Briefcase" size={20} />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Employment Type</div>
                    <div className="mt-1">{employee.employment_type || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div className="mt-1">{getStatusBadge(employee.employment_status)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Department</div>
                    <div className="mt-1">{employee.department?.name || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Position</div>
                    <div className="mt-1">{employee.position || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Job Title</div>
                    <div className="mt-1">{employee.job_title || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Supervisor</div>
                    <div className="mt-1">{employee.supervisor?.full_name || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Join Date</div>
                    <div className="mt-1">{employee.join_date ? new Date(employee.join_date).toLocaleDateString() : '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Contract Start</div>
                    <div className="mt-1">{employee.contract_start_date ? new Date(employee.contract_start_date).toLocaleDateString() : '-'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="CreditCard" size={20} />
                  Bank Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Bank Name</div>
                  <div className="mt-1">{employee.bank_name || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Account Number</div>
                  <div className="mt-1">{employee.bank_account_number || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Account Name</div>
                  <div className="mt-1">{employee.bank_account_name || '-'}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
