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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TopNavbar } from "@/components/top-navbar"
import { Icon } from "@/components/ui/icon"
import { DataTable } from "@/components/ui/data-table"
import { createPositionColumns, type Position } from "./columns"
import { API_BASE_URL } from "@/lib/api/client"

type Department = {
  id: string
  name: string
  code: string
}

const API_URL = API_BASE_URL.replace('/api/v1', '')

export default function PositionsPage() {
  const pageId = "organization-positions"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const statusFilter = (filters.status as "all" | "active" | "inactive") || "all"

  const [positions, setPositions] = useState<Position[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    department: "",
    level: "1",
    min_salary: "",
    max_salary: "",
  })

  const fetchPositions = async () => {
    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch(`${API_URL}/api/v1/organization/positions/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const positionList = data.results || data
        setPositions(positionList)
      } else {
        setError("Failed to fetch positions")
      }
    } catch (err) {
      setError("Failed to connect to server")
    } finally {
      setIsLoading(false)
    }
  }

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
        setDepartments(data.results || data)
      }
    } catch (err) {
      console.error("Failed to fetch departments")
    }
  }

  useEffect(() => {
    fetchPositions()
    fetchDepartments()
  }, [])

  const filteredPositions = useMemo(() => {
    let filtered = positions

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (pos) =>
          pos.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          pos.code.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((pos) => pos.is_active)
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((pos) => !pos.is_active)
    }

    return filtered
  }, [debouncedSearchQuery, statusFilter, positions])

  const handleOpenCreate = () => {
    setEditingPosition(null)
    setFormData({
      name: "",
      code: "",
      description: "",
      department: "",
      level: "1",
      min_salary: "",
      max_salary: "",
    })
    setIsOpen(true)
  }

  const handleOpenEdit = (position: Position) => {
    setEditingPosition(position)
    setFormData({
      name: position.name,
      code: position.code,
      description: position.description || "",
      department: position.department || "",
      level: position.level.toString(),
      min_salary: position.min_salary || "",
      max_salary: position.max_salary || "",
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
      department: formData.department || null,
      level: parseInt(formData.level),
      min_salary: formData.min_salary || null,
      max_salary: formData.max_salary || null,
    }

    try {
      const url = editingPosition
        ? `${API_URL}/api/v1/organization/positions/${editingPosition.id}/`
        : `${API_URL}/api/v1/organization/positions/`

      const response = await fetch(url, {
        method: editingPosition ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setIsOpen(false)
        fetchPositions()
      } else {
        const data = await response.json()
        setError(data.detail || "Failed to save position")
      }
    } catch (err) {
      setError("Failed to connect to server")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this position?")) return

    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch(
        `${API_URL}/api/v1/organization/positions/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (response.ok) {
        fetchPositions()
      } else {
        setError("Failed to delete position")
      }
    } catch (err) {
      setError("Failed to connect to server")
    }
  }

  // Define columns after handler functions are defined
  const columns = useMemo(
    () => createPositionColumns(handleOpenEdit, handleDelete),
    [handleOpenEdit, handleDelete]
  )

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
                  <BreadcrumbPage>Positions</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Positions</h1>
            <p className="text-muted-foreground">
              Manage job positions and salary ranges.
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
                  placeholder="Search positions..."
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
              Add Position
            </Button>
          </div>

          {/* Positions Table */}
          <DataTable
            columns={columns}
            data={filteredPositions}
            isLoading={isLoading}
            emptyMessage={
              searchQuery || statusFilter !== "all"
                ? "No positions match your search criteria."
                : "No positions found. Create your first position."
            }
          />
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingPosition ? "Edit Position" : "Create New Position"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Position Name</FieldLabel>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter position name"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="code">Position Code</FieldLabel>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g., MGR, DEV, HR"
                    required
                  />
                  <FieldDescription>
                    A unique short code for the position.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="department">Department</FieldLabel>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      setFormData({ ...formData, department: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="level">Job Level</FieldLabel>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    required
                  />
                  <FieldDescription>
                    Job grade/level (1 = entry level, higher = senior).
                  </FieldDescription>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="min_salary">Min Salary</FieldLabel>
                    <Input
                      id="min_salary"
                      type="number"
                      min="0"
                      value={formData.min_salary}
                      onChange={(e) =>
                        setFormData({ ...formData, min_salary: e.target.value })
                      }
                      placeholder="0"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="max_salary">Max Salary</FieldLabel>
                    <Input
                      id="max_salary"
                      type="number"
                      min="0"
                      value={formData.max_salary}
                      onChange={(e) =>
                        setFormData({ ...formData, max_salary: e.target.value })
                      }
                      placeholder="0"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of the position"
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
                    {editingPosition ? "Update Position" : "Create Position"}
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
