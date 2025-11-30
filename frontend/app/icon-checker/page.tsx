"use client"

import { useState } from "react"
import { useIconUsage } from "@/lib/queries/icons/queries"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icon } from "@/components/ui/icon"
import { IconUsage } from "@/lib/queries/icons/types"

export default function IconCheckerPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data, isLoading, error, refetch, isFetching } = useIconUsage()

  const filterIcons = (icons: IconUsage[], query: string) => {
    if (!query) return icons
    return icons.filter((icon) =>
      icon.icon.toLowerCase().includes(query.toLowerCase())
    )
  }

  const filteredLucideIcons = data ? filterIcons(data.lucideIcons, searchQuery) : []
  const filteredHugeIcons = data ? filterIcons(data.hugeIcons, searchQuery) : []
  const filteredDirectIcons = data ? filterIcons(data.directIconUsage, searchQuery) : []

  const getMigrationProgress = () => {
    if (!data) return 0
    const total = data.lucideIcons.reduce((sum, icon) => sum + icon.count, 0)
    const huge = data.hugeIcons.reduce((sum, icon) => sum + icon.count, 0)
    const direct = data.directIconUsage.reduce((sum, icon) => sum + icon.count, 0)
    const migrated = huge + direct
    const percentage = total > 0 ? (migrated / (total + migrated)) * 100 : 0
    return Math.round(percentage)
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4 z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Icon Checker</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Icon Migration Checker</h1>
            <p className="text-muted-foreground mt-1">
              Monitor your migration from Lucide Icons to HugeIcons
            </p>
          </div>

          {/* Stats Cards */}
          {data && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Files Scanned</CardTitle>
                  <Icon name="Info" size={16} className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalFiles}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.filesWithIcons} with icons
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lucide Icons</CardTitle>
                  <Icon name="AlertCircle" size={16} className="text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.lucideIcons.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.lucideIcons.reduce((sum, icon) => sum + icon.count, 0)} usages
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">HugeIcons</CardTitle>
                  <Icon name="CheckCircle" size={16} className="text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.hugeIcons.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.hugeIcons.reduce((sum, icon) => sum + icon.count, 0)} usages
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Migration Progress</CardTitle>
                  <Icon name="TrendingUp" size={16} className="text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getMigrationProgress()}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Via <code>&lt;Icon /&gt;</code> component
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Icon Usage Analysis</CardTitle>
                  <CardDescription>
                    Search and filter icons to track migration progress
                  </CardDescription>
                </div>
                <Button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  variant="outline"
                >
                  <Icon name="RefreshCw" size={16} className={`mr-2 ${isFetching ? "animate-spin" : ""}`} />
                  {isFetching ? "Scanning..." : "Scan Project"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search icons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="py-8 text-center">
                <Icon name="RefreshCw" size={32} className="animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Scanning project for icon usage...</p>
                <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-8 text-center">
                <Icon name="AlertCircle" size={32} className="mx-auto mb-4 text-red-500" />
                <p className="text-red-700 font-medium">Error scanning project</p>
                <p className="text-sm text-red-600 mt-2">{error.message}</p>
                <Button onClick={() => refetch()} variant="outline" className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {data && !isLoading && (
            <Tabs defaultValue="lucide" className="space-y-4">
              <TabsList>
                <TabsTrigger value="lucide">
                  Lucide Icons ({filteredLucideIcons.length})
                </TabsTrigger>
                <TabsTrigger value="huge">
                  HugeIcons ({filteredHugeIcons.length})
                </TabsTrigger>
                <TabsTrigger value="direct">
                  Icon Component ({filteredDirectIcons.length})
                </TabsTrigger>
              </TabsList>

              {/* Lucide Icons Table */}
              <TabsContent value="lucide">
                <Card>
                  <CardHeader>
                    <CardTitle>Lucide Icons Still In Use</CardTitle>
                    <CardDescription>
                      These icons are directly imported from lucide-react and need migration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredLucideIcons.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Icon name="CheckCircle" size={48} className="mx-auto mb-4 text-green-500" />
                        <p className="font-medium">No Lucide icons found!</p>
                        <p className="text-sm mt-2">All icons have been migrated 🎉</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Icon Name</TableHead>
                            <TableHead className="text-center">Usage Count</TableHead>
                            <TableHead>Files</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLucideIcons.map((icon) => (
                            <TableRow key={icon.icon}>
                              <TableCell className="font-medium font-mono">
                                {icon.icon}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline">{icon.count}</Badge>
                              </TableCell>
                              <TableCell>
                                <details className="text-sm">
                                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                    {icon.files.length} file(s)
                                  </summary>
                                  <ul className="mt-2 space-y-1 pl-4">
                                    {icon.files.map((file) => (
                                      <li key={file} className="font-mono text-xs">
                                        {file}
                                      </li>
                                    ))}
                                  </ul>
                                </details>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* HugeIcons Table */}
              <TabsContent value="huge">
                <Card>
                  <CardHeader>
                    <CardTitle>HugeIcons In Use</CardTitle>
                    <CardDescription>
                      These icons are using hugeicons-react directly
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredHugeIcons.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Icon name="Info" size={48} className="mx-auto mb-4" />
                        <p className="font-medium">No HugeIcons found</p>
                        <p className="text-sm mt-2">Start migrating Lucide icons to HugeIcons</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Icon Name</TableHead>
                            <TableHead className="text-center">Usage Count</TableHead>
                            <TableHead>Files</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredHugeIcons.map((icon) => (
                            <TableRow key={icon.icon}>
                              <TableCell className="font-medium font-mono">
                                {icon.icon}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-green-100">
                                  {icon.count}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <details className="text-sm">
                                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                    {icon.files.length} file(s)
                                  </summary>
                                  <ul className="mt-2 space-y-1 pl-4">
                                    {icon.files.map((file) => (
                                      <li key={file} className="font-mono text-xs">
                                        {file}
                                      </li>
                                    ))}
                                  </ul>
                                </details>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Direct Icon Usage Table */}
              <TabsContent value="direct">
                <Card>
                  <CardHeader>
                    <CardTitle>Icon Component Usage</CardTitle>
                    <CardDescription>
                      These icons are using the universal &lt;Icon name="..." /&gt; component
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredDirectIcons.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Icon name="Info" size={48} className="mx-auto mb-4" />
                        <p className="font-medium">No Icon component usage found</p>
                        <p className="text-sm mt-2">
                          Use <code>&lt;Icon name="..." /&gt;</code> for automatic fallback
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Icon Name</TableHead>
                            <TableHead className="text-center">Usage Count</TableHead>
                            <TableHead>Files</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDirectIcons.map((icon) => (
                            <TableRow key={icon.icon}>
                              <TableCell className="font-medium font-mono">
                                {icon.icon}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-blue-100">
                                  {icon.count}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <details className="text-sm">
                                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                    {icon.files.length} file(s)
                                  </summary>
                                  <ul className="mt-2 space-y-1 pl-4">
                                    {icon.files.map((file) => (
                                      <li key={file} className="font-mono text-xs">
                                        {file}
                                      </li>
                                    ))}
                                  </ul>
                                </details>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Last Updated */}
          {data && (
            <p className="text-xs text-muted-foreground text-right">
              Last scanned: {new Date(data.timestamp).toLocaleString()}
            </p>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
