"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { usePageFilters, filterActions } from "@/lib/store"
import { useDebounce } from "@/lib/hooks/use-debounce"

import { AppSidebar } from "@/components/app-sidebar"
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
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TopNavbar } from "@/components/top-navbar"
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { createDepartmentColumns, type Department } from "./columns"
import { API_BASE_URL } from "@/lib/api/client"

const API_URL = API_BASE_URL.replace('/api/v1', '')

export default function DepartmentsPage() {
  const pageId = "organization-departments"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const statusFilter = (filters.status as "all" | "active" | "inactive") || "all"

  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    parent: "",
  })

  const fetchDepartments = async () => {
    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch(`${API_URL}/api/v1/organization/departments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const deptList = data.results || data
        setDepartments(deptList)
      } else {
        setError("Failed to fetch departments")
      }
    } catch (err) {
      setError("Failed to connect to server")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleOpenCreate = () => {
    setEditingDepartment(null)
    setFormData({
      name: "",
      code: "",
      description: "",
      parent: "",
    })
    setIsOpen(true)
  }

  const handleOpenEdit = (department: Department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || "",
      parent: department.parent || "",
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("access_token")

    const payload = {
      name: formData.name,
      code: formData.code,
      description: formData.description,
      parent: formData.parent || null,
    }

    try {
      const url = editingDepartment
        ? `${API_URL}/api/v1/organization/departments/${editingDepartment.id}/`
        : `${API_URL}/api/v1/organization/departments/`

      const response = await fetch(url, {
        method: editingDepartment ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setIsOpen(false)
        fetchDepartments()
      } else {
        const data = await response.json()
        setError(data.detail || "Failed to save department")
      }
    } catch (err) {
      setError("Failed to connect to server")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return

    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch(
        `${API_URL}/api/v1/organization/departments/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (response.ok) {
        fetchDepartments()
      } else {
        setError("Failed to delete department")
      }
    } catch (err) {
      setError("Failed to connect to server")
    }
  }

  const columns = useMemo(
    () => createDepartmentColumns(handleOpenEdit, handleDelete),
    [handleOpenEdit, handleDelete]
  )

  const filteredDepartments = useMemo(() => {
    let filtered = departments

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (dept) =>
          dept.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          dept.code.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((dept) => dept.is_active)
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((dept) => !dept.is_active)
    }

    return filtered
  }, [debouncedSearchQuery, statusFilter, departments])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Departments</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">
              Manage organizational departments and their structure.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Search, Filter and Add Button */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search departments..."
                  value={searchQuery}
                  onChange={(e) => filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Icon name="Filter" size={16} />
                    {statusFilter === "all" ? "All Status" : statusFilter === "active" ? "Active" : "Inactive"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => filterActions.setPageFilter(pageId, { ...filters, status: "all" })}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => filterActions.setPageFilter(pageId, { ...filters, status: "active" })}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => filterActions.setPageFilter(pageId, { ...filters, status: "inactive" })}>
                    Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button
              onClick={handleOpenCreate}
              className="bg-[#005357] hover:bg-[#004145] text-white"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Add Department
            </Button>
          </div>

          {/* Departments Table */}
          <DataTable
            columns={columns}
            data={filteredDepartments}
            isLoading={isLoading}
            emptyMessage={
              searchQuery || statusFilter !== "all"
                ? "No departments match your search criteria."
                : "No departments found. Create your first department."
            }
          />
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? "Edit Department" : "Create New Department"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Department Name</FieldLabel>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter department name"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="code">Department Code</FieldLabel>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g., HR, FIN, IT"
                    required
                  />
                  <FieldDescription>
                    A unique short code for the department.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of the department"
                  />
                </Field>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#005357] hover:bg-[#004145] text-white"
                  >
                    {editingDepartment ? "Update Department" : "Create Department"}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
