"use client"

import { useState, useEffect } from "react"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { roomApi, RoomBooking, Room } from "@/lib/api/admin-ops"
import { Icon } from "@/components/ui/icon"

export default function RoomBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<RoomBooking | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchBooking(params.id as string)
    }
  }, [params.id])

  const fetchBooking = async (id: string) => {
    try {
      setLoading(true)
      const bookingData = await roomApi.bookings.get(id)
      setBooking(bookingData)

      // Fetch room details if room ID is available
      if (typeof bookingData.room === 'string') {
        const roomData = await roomApi.rooms.get(bookingData.room)
        setRoom(roomData)
      }
    } catch (error) {
      console.error("Error fetching booking:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!booking) return
    try {
      await roomApi.bookings.approve(booking.id)
      fetchBooking(booking.id)
    } catch (error) {
      console.error("Error approving booking:", error)
    }
  }

  const handleReject = async () => {
    if (!booking) return
    const reason = prompt("Enter rejection reason:")
    if (!reason) return

    try {
      await roomApi.bookings.reject(booking.id, { rejection_reason: reason })
      fetchBooking(booking.id)
    } catch (error) {
      console.error("Error rejecting booking:", error)
    }
  }

  const handleCancel = async () => {
    if (!booking) return
    const reason = prompt("Enter cancellation reason:")
    if (!reason) return

    try {
      await roomApi.bookings.cancel(booking.id, { cancellation_reason: reason })
      fetchBooking(booking.id)
    } catch (error) {
      console.error("Error cancelling booking:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any, className: string }> = {
      pending: { variant: "secondary", className: "bg-yellow-500" },
      approved: { variant: "default", className: "bg-green-500" },
      rejected: { variant: "destructive", className: "" },
      cancelled: { variant: "outline", className: "" },
      completed: { variant: "default", className: "bg-blue-500" },
    }

    const { variant, className } = config[status] || { variant: "secondary", className: "" }

    return (
      <Badge variant={variant} className={className}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    )
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <p>Loading...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!booking) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <p>Booking not found</p>
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
                  <BreadcrumbLink href="/admin-ops">Admin Ops</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin-ops/room-booking">Room Booking</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{booking.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <TopNavbar />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 max-w-full">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <Icon name="ArrowLeft" size={16} />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">{booking.title}</h1>
              <p className="text-muted-foreground">
                {booking.room_name || (typeof booking.room === 'string' ? booking.room : booking.room.name)}
              </p>
            </div>
            <div className="flex gap-2">
              {booking.status === 'pending' && (
                <>
                  <Button variant="outline" onClick={handleReject}>
                    <Icon name="XCircle" size={16} className="mr-2" />
                    Reject
                  </Button>
                  <Button onClick={handleApprove}>
                    <Icon name="CheckCircle" size={16} className="mr-2" />
                    Approve
                  </Button>
                </>
              )}
              {(booking.status === 'pending' || booking.status === 'approved') && (
                <Button variant="destructive" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Booking Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Start Time</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Icon name="Calendar" size={16} className="text-muted-foreground" />
                        <p className="text-sm font-medium">{formatDateTime(booking.start_time)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Time</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Icon name="Clock" size={16} className="text-muted-foreground" />
                        <p className="text-sm font-medium">{formatDateTime(booking.end_time)}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground">Expected Attendees</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Icon name="Users" size={16} className="text-muted-foreground" />
                      <p className="text-sm font-medium">{booking.expected_attendees} people</p>
                    </div>
                  </div>

                  {booking.description && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-sm mt-1">{booking.description}</p>
                      </div>
                    </>
                  )}

                  {booking.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm mt-1">{booking.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Room Facilities */}
              {room && (
                <Card>
                  <CardHeader>
                    <CardTitle>Room Facilities</CardTitle>
                    <CardDescription>
                      {room.name} - Capacity: {room.capacity} people
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Icon name="Projector" size={16} className={room.has_projector ? "text-green-500" : "text-gray-300"} />
                        <span className={room.has_projector ? "text-sm" : "text-sm text-muted-foreground"}>
                          Projector
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="MessageSquare" size={16} className={room.has_whiteboard ? "text-green-500" : "text-gray-300"} />
                        <span className={room.has_whiteboard ? "text-sm" : "text-sm text-muted-foreground"}>
                          Whiteboard
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Monitor" size={16} className={room.has_video_conference ? "text-green-500" : "text-gray-300"} />
                        <span className={room.has_video_conference ? "text-sm" : "text-sm text-muted-foreground"}>
                          Video Conference
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Phone" size={16} className={room.has_teleconference ? "text-green-500" : "text-gray-300"} />
                        <span className={room.has_teleconference ? "text-sm" : "text-sm text-muted-foreground"}>
                          Teleconference
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Wind" size={16} className={room.has_ac ? "text-green-500" : "text-gray-300"} />
                        <span className={room.has_ac ? "text-sm" : "text-sm text-muted-foreground"}>
                          Air Conditioning
                        </span>
                      </div>
                    </div>

                    {room.description && (
                      <>
                        <Separator className="my-4" />
                        <p className="text-sm text-muted-foreground">{room.description}</p>
                      </>
                    )}

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Floor:</span> {room.floor || 'N/A'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Building:</span> {room.building || 'N/A'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rejection/Cancellation Info */}
              {booking.rejection_reason && (
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive">Rejection Reason</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{booking.rejection_reason}</p>
                  </CardContent>
                </Card>
              )}

              {booking.cancellation_reason && (
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive">Cancellation Reason</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{booking.cancellation_reason}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {getStatusBadge(booking.status)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booked By</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{booking.booked_by_name || booking.booked_by}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(booking.created_at).toLocaleDateString('id-ID')}
                  </p>
                </CardContent>
              </Card>

              {booking.approved_by_name && (
                <Card>
                  <CardHeader>
                    <CardTitle>Approved By</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">{booking.approved_by_name}</p>
                    {booking.approved_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(booking.approved_at).toLocaleDateString('id-ID')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Timestamps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{new Date(booking.created_at).toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p>{new Date(booking.updated_at).toLocaleString('id-ID')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
