"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { usePageFilters, filterActions } from "@/lib/store"
import { useDebounce } from "@/lib/hooks/use-debounce"
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
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { roomApi, Room } from "@/lib/api/admin-ops"
import { Icon } from "@/components/ui/icon"

export default function RoomsPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  const pageId = "admin-ops-rooms"
  const filters = usePageFilters(pageId)
  const searchQuery = filters.search || ""

  // Debounce search query to reduce API calls (waits 500ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  useEffect(() => {
    fetchRooms()
  }, [debouncedSearchQuery])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const params: Record<string, any> = {}
      if (debouncedSearchQuery) params.search = debouncedSearchQuery

      const response = await roomApi.rooms.list(params)
      setRooms(response.results)
    } catch (error) {
      console.error("Error fetching rooms:", error)
      setRooms([])
    } finally {
      setLoading(false)
    }
  }

  const getRoomTypeBadge = (type: string) => {
    const config: Record<string, string> = {
      meeting: "Meeting Room",
      conference: "Conference",
      training: "Training",
      auditorium: "Auditorium",
      boardroom: "Boardroom",
      huddle: "Huddle Room",
    }
    return config[type] || type
  }

  const stats = {
    total: rooms.length,
    active: rooms.filter(r => r.is_active).length,
    meeting: rooms.filter(r => r.room_type === 'meeting').length,
    conference: rooms.filter(r => r.room_type === 'conference').length,
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
                  <BreadcrumbLink href="/admin-ops">Admin Ops</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin-ops/room-booking">Room Booking</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Rooms</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Meeting Rooms</h1>
              <p className="text-muted-foreground">
                Manage available rooms and facilities
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                <Icon name="Building2" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  All rooms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <Icon name="Building2" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
                <p className="text-xs text-muted-foreground">
                  Available for booking
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meeting Rooms</CardTitle>
                <Icon name="Users" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.meeting}</div>
                <p className="text-xs text-muted-foreground">
                  Standard meetings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conference Rooms</CardTitle>
                <Icon name="Building2" size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.conference}</div>
                <p className="text-xs text-muted-foreground">
                  Large meetings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-[300px]">
                <Icon name="Search" size={16} className="absolute left-2 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={(e) => filterActions.setPageFilter(pageId, { ...filters, search: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => router.push('/admin-ops/room-booking/rooms/new')}>
                <Icon name="Plus" size={16} className="mr-2" />
                Add Room
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Room Name</TableHead>
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead className="w-[100px]">Location</TableHead>
                  <TableHead className="w-[80px] text-center">Capacity</TableHead>
                  <TableHead className="w-[200px]">Facilities</TableHead>
                  <TableHead className="w-[80px]">Status</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : rooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No rooms found
                    </TableCell>
                  </TableRow>
                ) : (
                  rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{room.name}</p>
                          {room.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {room.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{room.code}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getRoomTypeBadge(room.room_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {room.floor && <div>Floor {room.floor}</div>}
                          {room.building && <div className="text-xs text-muted-foreground">{room.building}</div>}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Icon name="Users" size={12} className="text-muted-foreground" />
                          <span className="text-sm">{room.capacity}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {room.has_projector && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Projector">
                              <Icon name="Projector" size={12} />
                            </div>
                          )}
                          {room.has_whiteboard && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Whiteboard">
                              <Icon name="MessageSquare" size={12} />
                            </div>
                          )}
                          {room.has_video_conference && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Video Conference">
                              <Icon name="Monitor" size={12} />
                            </div>
                          )}
                          {room.has_teleconference && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Teleconference">
                              <Icon name="Phone" size={12} />
                            </div>
                          )}
                          {room.has_ac && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground" title="AC">
                              <Icon name="Wind" size={12} />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={room.is_active ? "default" : "secondary"}>
                          {room.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin-ops/room-booking/rooms/${room.id}`)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
