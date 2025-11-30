"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"

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
import { TopNavbar } from "@/components/top-navbar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon"
import { API_BASE_URL } from "@/lib/api/client"

const API_URL = API_BASE_URL.replace('/api/v1', '')

type OrgNode = {
  id: string
  name: string
  position: string
  department: string
  avatar: string | null
  employee_id: string
  children: OrgNode[]
}

// Compact tree node component
function TreeNode({
  node,
  level = 0,
  isLast = false,
}: {
  node: OrgNode
  level?: number
  isLast?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first 2 levels
  const hasChildren = node.children && node.children.length > 0

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative">
      {/* Node */}
      <div
        className={cn(
          "flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group",
          level === 0 && "bg-[#005357]/5 border border-[#005357]/20"
        )}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {/* Expand/Collapse indicator */}
        <div className="w-5 h-5 flex items-center justify-center">
          {hasChildren ? (
            isExpanded ? (
              <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
            ) : (
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            )
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          )}
        </div>

        {/* Avatar */}
        <Avatar className={cn("shrink-0", level === 0 ? "h-12 w-12" : "h-9 w-9")}>
          <AvatarImage src={node.avatar || undefined} alt={node.name} />
          <AvatarFallback
            className={cn(
              "bg-[#005357] text-white",
              level === 0 ? "text-sm" : "text-xs"
            )}
          >
            {getInitials(node.name)}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "font-medium truncate",
                level === 0 ? "text-base" : "text-sm"
              )}
            >
              {node.name}
            </h3>
            {hasChildren && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {node.children.length}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {node.position || "No Position"}
          </p>
          {level === 0 && node.department && (
            <p className="text-xs text-[#005357] font-medium truncate">
              {node.department}
            </p>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-6 mt-1 border-l border-border pl-4 space-y-1">
          {node.children.map((child, index) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              isLast={index === node.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Vertical card chart - shows one level at a time with drill-down
function ChartView({ data }: { data: OrgNode[] }) {
  const [selectedPath, setSelectedPath] = useState<OrgNode[]>([])
  const [currentNodes, setCurrentNodes] = useState<OrgNode[]>(data)
  const [parentNode, setParentNode] = useState<OrgNode | null>(null)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleNodeClick = (node: OrgNode) => {
    if (node.children && node.children.length > 0) {
      setSelectedPath([...selectedPath, node])
      setParentNode(node)
      setCurrentNodes(node.children)
    }
  }

  const handleBack = () => {
    if (selectedPath.length > 0) {
      const newPath = [...selectedPath]
      newPath.pop()
      setSelectedPath(newPath)

      if (newPath.length === 0) {
        setCurrentNodes(data)
        setParentNode(null)
      } else {
        const parent = newPath[newPath.length - 1]
        setParentNode(parent)
        setCurrentNodes(parent.children)
      }
    }
  }

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setSelectedPath([])
      setCurrentNodes(data)
      setParentNode(null)
    } else {
      const newPath = selectedPath.slice(0, index + 1)
      setSelectedPath(newPath)
      const parent = newPath[newPath.length - 1]
      setParentNode(parent)
      setCurrentNodes(parent.children)
    }
  }

  return (
    <div className="p-4">
      {/* Breadcrumb navigation */}
      {selectedPath.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className="text-sm text-[#005357] hover:underline"
          >
            All
          </button>
          {selectedPath.map((node, index) => (
            <React.Fragment key={node.id}>
              <span className="text-muted-foreground">/</span>
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={cn(
                  "text-sm hover:underline",
                  index === selectedPath.length - 1
                    ? "text-foreground font-medium"
                    : "text-[#005357]"
                )}
              >
                {node.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Parent card (if drilling down) */}
      {parentNode && (
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-[#005357] bg-[#005357]/5 max-w-xs">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src={parentNode.avatar || undefined} alt={parentNode.name} />
              <AvatarFallback className="bg-[#005357] text-white">
                {getInitials(parentNode.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm">{parentNode.name}</h3>
              <p className="text-xs text-muted-foreground">{parentNode.position}</p>
              <p className="text-xs text-[#005357]">{parentNode.department}</p>
            </div>
          </div>
          <div className="w-px h-6 bg-border" />
          <div className="text-xs text-muted-foreground mb-2">
            {currentNodes.length} direct report{currentNodes.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Current level nodes in a responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {currentNodes.map((node) => (
          <div
            key={node.id}
            onClick={() => handleNodeClick(node)}
            className={cn(
              "flex flex-col items-center p-3 rounded-lg border bg-card hover:shadow-md transition-all",
              node.children?.length > 0 && "cursor-pointer hover:border-[#005357]"
            )}
          >
            <Avatar className="h-12 w-12 mb-2">
              <AvatarImage src={node.avatar || undefined} alt={node.name} />
              <AvatarFallback className="bg-[#005357] text-white text-sm">
                {getInitials(node.name)}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-medium text-xs text-center leading-tight line-clamp-2">
              {node.name}
            </h3>
            <p className="text-[10px] text-muted-foreground text-center mt-1 line-clamp-2">
              {node.position || "No Position"}
            </p>
            {node.children && node.children.length > 0 && (
              <span className="mt-2 text-[10px] bg-[#005357] text-white px-2 py-0.5 rounded-full">
                {node.children.length} report{node.children.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Back button */}
      {selectedPath.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" size="sm" onClick={handleBack}>
            Back to {selectedPath.length === 1 ? "Top Level" : selectedPath[selectedPath.length - 2]?.name}
          </Button>
        </div>
      )}
    </div>
  )
}

export default function OrganizationStructurePage() {
  const [orgData, setOrgData] = useState<OrgNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState<"tree" | "chart">("tree")

  const fetchOrgChart = useCallback(async () => {
    const token = localStorage.getItem("access_token")
    try {
      const response = await fetch(
        `${API_URL}/api/v1/organization/org-chart/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setOrgData(data)
      } else {
        setError("Failed to fetch organization chart")
      }
    } catch (err) {
      setError("Failed to connect to server")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrgChart()
  }, [fetchOrgChart])

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
                  <BreadcrumbPage>Organization Structure</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-4 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Organization Structure
              </h1>
              <p className="text-muted-foreground text-sm">
                Visual hierarchy of employees and their reporting structure.
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("tree")}
                className={cn(
                  "px-3 py-1.5 text-sm transition-colors",
                  viewMode === "tree"
                    ? "bg-[#005357] text-white"
                    : "bg-background hover:bg-muted"
                )}
              >
                Tree
              </button>
              <button
                onClick={() => setViewMode("chart")}
                className={cn(
                  "px-3 py-1.5 text-sm transition-colors",
                  viewMode === "chart"
                    ? "bg-[#005357] text-white"
                    : "bg-background hover:bg-muted"
                )}
              >
                Chart
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Org Chart */}
          <div className="flex-1 rounded-lg border bg-card overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                Loading organization chart...
              </div>
            ) : orgData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                <Icon name="User" size={24} className="h-16 w-16 mb-4 opacity-20" />
                <p>No organization data available.</p>
                <p className="text-sm mt-1">
                  Add employees with supervisor relationships to build the chart.
                </p>
              </div>
            ) : viewMode === "tree" ? (
              /* Tree View - Fits screen width */
              <div className="p-4 space-y-2">
                {orgData.map((root) => (
                  <TreeNode key={root.id} node={root} level={0} />
                ))}
              </div>
            ) : (
              /* Chart View - Drill-down grid */
              <ChartView data={orgData} />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
