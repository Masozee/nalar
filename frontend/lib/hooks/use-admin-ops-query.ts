/**
 * TanStack Query hooks for Admin Operations module
 * Rooms, Room Bookings, Vehicles, Drivers, Vehicle Bookings, Vehicle Maintenance, Visitor Logs
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  roomApi,
  vehicleApi,
  visitorApi,
  type Room,
  type RoomBooking,
  type Vehicle,
  type Driver,
  type VehicleBooking,
  type VehicleMaintenance,
  type Visitor,
  type VisitLog,
  type VisitorBadge,
} from '@/lib/api/admin-ops'

// ============================================================================
// Query Keys
// ============================================================================

export const adminOpsKeys = {
  // Rooms
  rooms: {
    all: ['rooms'] as const,
    lists: () => [...adminOpsKeys.rooms.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...adminOpsKeys.rooms.lists(), params] as const,
    details: () => [...adminOpsKeys.rooms.all, 'detail'] as const,
    detail: (id: string) => [...adminOpsKeys.rooms.details(), id] as const,
  },

  // Room Bookings
  roomBookings: {
    all: ['room-bookings'] as const,
    lists: () => [...adminOpsKeys.roomBookings.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...adminOpsKeys.roomBookings.lists(), params] as const,
    details: () => [...adminOpsKeys.roomBookings.all, 'detail'] as const,
    detail: (id: string) => [...adminOpsKeys.roomBookings.details(), id] as const,
  },

  // Vehicles
  vehicles: {
    all: ['vehicles'] as const,
    lists: () => [...adminOpsKeys.vehicles.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...adminOpsKeys.vehicles.lists(), params] as const,
    details: () => [...adminOpsKeys.vehicles.all, 'detail'] as const,
    detail: (id: string) => [...adminOpsKeys.vehicles.details(), id] as const,
  },

  // Drivers
  drivers: {
    all: ['drivers'] as const,
    lists: () => [...adminOpsKeys.drivers.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...adminOpsKeys.drivers.lists(), params] as const,
    details: () => [...adminOpsKeys.drivers.all, 'detail'] as const,
    detail: (id: string) => [...adminOpsKeys.drivers.details(), id] as const,
  },

  // Vehicle Bookings
  vehicleBookings: {
    all: ['vehicle-bookings'] as const,
    lists: () => [...adminOpsKeys.vehicleBookings.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...adminOpsKeys.vehicleBookings.lists(), params] as const,
    details: () => [...adminOpsKeys.vehicleBookings.all, 'detail'] as const,
    detail: (id: string) => [...adminOpsKeys.vehicleBookings.details(), id] as const,
  },

  // Vehicle Maintenance
  vehicleMaintenance: {
    all: ['vehicle-maintenance'] as const,
    lists: () => [...adminOpsKeys.vehicleMaintenance.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...adminOpsKeys.vehicleMaintenance.lists(), params] as const,
    details: () => [...adminOpsKeys.vehicleMaintenance.all, 'detail'] as const,
    detail: (id: string) => [...adminOpsKeys.vehicleMaintenance.details(), id] as const,
  },

  // Visitors
  visitors: {
    all: ['visitors'] as const,
    lists: () => [...adminOpsKeys.visitors.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...adminOpsKeys.visitors.lists(), params] as const,
    details: () => [...adminOpsKeys.visitors.all, 'detail'] as const,
    detail: (id: string) => [...adminOpsKeys.visitors.details(), id] as const,
  },

  // Visitor Logs
  visitorLogs: {
    all: ['visitor-logs'] as const,
    lists: () => [...adminOpsKeys.visitorLogs.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...adminOpsKeys.visitorLogs.lists(), params] as const,
    details: () => [...adminOpsKeys.visitorLogs.all, 'detail'] as const,
    detail: (id: string) => [...adminOpsKeys.visitorLogs.details(), id] as const,
  },

  // Visitor Badges
  visitorBadges: {
    all: ['visitor-badges'] as const,
    lists: () => [...adminOpsKeys.visitorBadges.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...adminOpsKeys.visitorBadges.lists(), params] as const,
    details: () => [...adminOpsKeys.visitorBadges.all, 'detail'] as const,
    detail: (id: string) => [...adminOpsKeys.visitorBadges.details(), id] as const,
  },
}

// ============================================================================
// Rooms
// ============================================================================

export interface RoomQueryParams {
  page?: number
  page_size?: number
  search?: string
  room_type?: string
  floor?: string
  building?: string
  is_active?: boolean
  ordering?: string
}

export function useRooms(params: RoomQueryParams = {}) {
  return useQuery({
    queryKey: adminOpsKeys.rooms.list(params),
    queryFn: async () => {
      const response = await roomApi.rooms.list(params)
      return {
        results: response.results,
        count: response.count,
        pageCount: params.page_size
          ? Math.ceil(response.count / params.page_size)
          : 1,
      }
    },
  })
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: adminOpsKeys.rooms.detail(id),
    queryFn: () => roomApi.rooms.get(id),
    enabled: !!id,
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Room>) => roomApi.rooms.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.rooms.lists() })
    },
  })
}

export function useUpdateRoom(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Room>) => roomApi.rooms.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.rooms.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.rooms.detail(id) })
    },
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => roomApi.rooms.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.rooms.lists() })
    },
  })
}

// ============================================================================
// Room Bookings
// ============================================================================

export interface RoomBookingQueryParams {
  page?: number
  page_size?: number
  search?: string
  room?: string
  status?: string
  booked_by?: string
  date_from?: string
  date_to?: string
  ordering?: string
}

export function useRoomBookings(params: RoomBookingQueryParams = {}) {
  return useQuery({
    queryKey: adminOpsKeys.roomBookings.list(params),
    queryFn: async () => {
      const response = await roomApi.bookings.list(params)
      return {
        results: response.results,
        count: response.count,
        pageCount: params.page_size
          ? Math.ceil(response.count / params.page_size)
          : 1,
      }
    },
  })
}

export function useRoomBooking(id: string) {
  return useQuery({
    queryKey: adminOpsKeys.roomBookings.detail(id),
    queryFn: () => roomApi.bookings.get(id),
    enabled: !!id,
  })
}

export function useCreateRoomBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<RoomBooking>) => roomApi.bookings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.roomBookings.lists() })
    },
  })
}

export function useUpdateRoomBooking(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<RoomBooking>) => roomApi.bookings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.roomBookings.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.roomBookings.detail(id) })
    },
  })
}

export function useDeleteRoomBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => roomApi.bookings.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.roomBookings.lists() })
    },
  })
}

// Room Booking Workflow Actions
export function useApproveRoomBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      roomApi.bookings.approve(id, notes ? { notes } : undefined),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.roomBookings.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.roomBookings.detail(id) })
    },
  })
}

export function useRejectRoomBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, rejection_reason }: { id: string; rejection_reason: string }) =>
      roomApi.bookings.reject(id, { rejection_reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.roomBookings.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.roomBookings.detail(id) })
    },
  })
}

export function useCancelRoomBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, cancellation_reason }: { id: string; cancellation_reason: string }) =>
      roomApi.bookings.cancel(id, { cancellation_reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.roomBookings.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.roomBookings.detail(id) })
    },
  })
}

// ============================================================================
// Vehicles
// ============================================================================

export interface VehicleQueryParams {
  page?: number
  page_size?: number
  search?: string
  vehicle_type?: string
  status?: string
  is_active?: boolean
  ordering?: string
}

export function useVehicles(params: VehicleQueryParams = {}) {
  return useQuery({
    queryKey: adminOpsKeys.vehicles.list(params),
    queryFn: async () => {
      const response = await vehicleApi.vehicles.list(params)
      return {
        results: response.results,
        count: response.count,
        pageCount: params.page_size
          ? Math.ceil(response.count / params.page_size)
          : 1,
      }
    },
  })
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: adminOpsKeys.vehicles.detail(id),
    queryFn: () => vehicleApi.vehicles.get(id),
    enabled: !!id,
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Vehicle>) => vehicleApi.vehicles.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicles.lists() })
    },
  })
}

export function useUpdateVehicle(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Vehicle>) => vehicleApi.vehicles.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicles.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicles.detail(id) })
    },
  })
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => vehicleApi.vehicles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicles.lists() })
    },
  })
}

// ============================================================================
// Drivers
// ============================================================================

export interface DriverQueryParams {
  page?: number
  page_size?: number
  search?: string
  is_active?: boolean
  ordering?: string
}

export function useDrivers(params: DriverQueryParams = {}) {
  return useQuery({
    queryKey: adminOpsKeys.drivers.list(params),
    queryFn: async () => {
      const response = await vehicleApi.drivers.list(params)
      return {
        results: response.results,
        count: response.count,
        pageCount: params.page_size
          ? Math.ceil(response.count / params.page_size)
          : 1,
      }
    },
  })
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: adminOpsKeys.drivers.detail(id),
    queryFn: () => vehicleApi.drivers.get(id),
    enabled: !!id,
  })
}

export function useCreateDriver() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Driver>) => vehicleApi.drivers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.drivers.lists() })
    },
  })
}

export function useUpdateDriver(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Driver>) => vehicleApi.drivers.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.drivers.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.drivers.detail(id) })
    },
  })
}

export function useDeleteDriver() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => vehicleApi.drivers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.drivers.lists() })
    },
  })
}

// ============================================================================
// Vehicle Bookings
// ============================================================================

export interface VehicleBookingQueryParams {
  page?: number
  page_size?: number
  search?: string
  vehicle?: string
  status?: string
  booked_by?: string
  driver?: string
  date_from?: string
  date_to?: string
  ordering?: string
}

export function useVehicleBookings(params: VehicleBookingQueryParams = {}) {
  return useQuery({
    queryKey: adminOpsKeys.vehicleBookings.list(params),
    queryFn: async () => {
      const response = await vehicleApi.bookings.list(params)
      return {
        results: response.results,
        count: response.count,
        pageCount: params.page_size
          ? Math.ceil(response.count / params.page_size)
          : 1,
      }
    },
  })
}

export function useVehicleBooking(id: string) {
  return useQuery({
    queryKey: adminOpsKeys.vehicleBookings.detail(id),
    queryFn: () => vehicleApi.bookings.get(id),
    enabled: !!id,
  })
}

export function useCreateVehicleBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<VehicleBooking>) => vehicleApi.bookings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicleBookings.lists() })
    },
  })
}

export function useUpdateVehicleBooking(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<VehicleBooking>) => vehicleApi.bookings.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicleBookings.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicleBookings.detail(id) })
    },
  })
}

export function useDeleteVehicleBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => vehicleApi.bookings.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicleBookings.lists() })
    },
  })
}

// Vehicle Booking Workflow Actions
export function useApproveVehicleBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      vehicleApi.bookings.approve(id, notes ? { notes } : undefined),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicleBookings.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicleBookings.detail(id) })
    },
  })
}

export function useRejectVehicleBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, rejection_reason }: { id: string; rejection_reason: string }) =>
      vehicleApi.bookings.reject(id, { rejection_reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicleBookings.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicleBookings.detail(id) })
    },
  })
}

export function useStartVehicleBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, start_odometer }: { id: string; start_odometer: number }) =>
      vehicleApi.bookings.start(id, { start_odometer }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicleBookings.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicleBookings.detail(id) })
    },
  })
}

export function useCompleteVehicleBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      end_odometer,
      fuel_used,
      fuel_cost,
    }: {
      id: string
      end_odometer: number
      fuel_used?: number
      fuel_cost?: number
    }) => vehicleApi.bookings.complete(id, { end_odometer, fuel_used, fuel_cost }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicleBookings.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicleBookings.detail(id) })
    },
  })
}

// ============================================================================
// Vehicle Maintenance
// ============================================================================

export interface VehicleMaintenanceQueryParams {
  page?: number
  page_size?: number
  search?: string
  vehicle?: string
  maintenance_type?: string
  date_from?: string
  date_to?: string
  ordering?: string
}

export function useVehicleMaintenances(params: VehicleMaintenanceQueryParams = {}) {
  return useQuery({
    queryKey: adminOpsKeys.vehicleMaintenance.list(params),
    queryFn: async () => {
      const response = await vehicleApi.maintenance.list(params)
      return {
        results: response.results,
        count: response.count,
        pageCount: params.page_size
          ? Math.ceil(response.count / params.page_size)
          : 1,
      }
    },
  })
}

export function useVehicleMaintenance(id: string) {
  return useQuery({
    queryKey: adminOpsKeys.vehicleMaintenance.detail(id),
    queryFn: () => vehicleApi.maintenance.get(id),
    enabled: !!id,
  })
}

export function useCreateVehicleMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<VehicleMaintenance>) => vehicleApi.maintenance.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicleMaintenance.lists() })
    },
  })
}

export function useUpdateVehicleMaintenance(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<VehicleMaintenance>) => vehicleApi.maintenance.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicleMaintenance.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicleMaintenance.detail(id) })
    },
  })
}

export function useDeleteVehicleMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => vehicleApi.maintenance.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.vehicleMaintenance.lists() })
    },
  })
}

// ============================================================================
// Visitors
// ============================================================================

export interface VisitorQueryParams {
  page?: number
  page_size?: number
  search?: string
  is_blacklisted?: boolean
  ordering?: string
}

export function useVisitors(params: VisitorQueryParams = {}) {
  return useQuery({
    queryKey: adminOpsKeys.visitors.list(params),
    queryFn: async () => {
      const response = await visitorApi.visitors.list(params)
      return {
        results: response.results,
        count: response.count,
        pageCount: params.page_size
          ? Math.ceil(response.count / params.page_size)
          : 1,
      }
    },
  })
}

export function useVisitor(id: string) {
  return useQuery({
    queryKey: adminOpsKeys.visitors.detail(id),
    queryFn: () => visitorApi.visitors.get(id),
    enabled: !!id,
  })
}

export function useCreateVisitor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Visitor>) => visitorApi.visitors.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitors.lists() })
    },
  })
}

export function useUpdateVisitor(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Visitor>) => visitorApi.visitors.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitors.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitors.detail(id) })
    },
  })
}

export function useDeleteVisitor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => visitorApi.visitors.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitors.lists() })
    },
  })
}

export function useBlacklistVisitor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, blacklist_reason }: { id: string; blacklist_reason: string }) =>
      visitorApi.visitors.blacklist(id, { blacklist_reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitors.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitors.detail(id) })
    },
  })
}

// ============================================================================
// Visitor Logs
// ============================================================================

export interface VisitorLogQueryParams {
  page?: number
  page_size?: number
  search?: string
  visitor?: string
  status?: string
  purpose?: string
  host?: string
  date_from?: string
  date_to?: string
  ordering?: string
}

export function useVisitorLogs(params: VisitorLogQueryParams = {}) {
  return useQuery({
    queryKey: adminOpsKeys.visitorLogs.list(params),
    queryFn: async () => {
      const response = await visitorApi.logs.list(params)
      return {
        results: response.results,
        count: response.count,
        pageCount: params.page_size
          ? Math.ceil(response.count / params.page_size)
          : 1,
      }
    },
  })
}

export function useVisitorLog(id: string) {
  return useQuery({
    queryKey: adminOpsKeys.visitorLogs.detail(id),
    queryFn: () => visitorApi.logs.get(id),
    enabled: !!id,
  })
}

export function useCreateVisitorLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<VisitLog>) => visitorApi.logs.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitorLogs.lists() })
    },
  })
}

export function useUpdateVisitorLog(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<VisitLog>) => visitorApi.logs.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitorLogs.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitorLogs.detail(id) })
    },
  })
}

export function useDeleteVisitorLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => visitorApi.logs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitorLogs.lists() })
    },
  })
}

// Visitor Log Workflow Actions
export function useCheckInVisitor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      badge_number,
      belongings,
    }: {
      id: string
      badge_number?: string
      belongings?: string
    }) => visitorApi.logs.checkIn(id, { badge_number, belongings }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitorLogs.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitorLogs.detail(id) })
    },
  })
}

export function useCheckOutVisitor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => visitorApi.logs.checkOut(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitorLogs.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitorLogs.detail(id) })
    },
  })
}

// ============================================================================
// Visitor Badges
// ============================================================================

export interface VisitorBadgeQueryParams {
  page?: number
  page_size?: number
  search?: string
  is_available?: boolean
  ordering?: string
}

export function useVisitorBadges(params: VisitorBadgeQueryParams = {}) {
  return useQuery({
    queryKey: adminOpsKeys.visitorBadges.list(params),
    queryFn: async () => {
      const response = await visitorApi.badges.list(params)
      return {
        results: response.results,
        count: response.count,
        pageCount: params.page_size
          ? Math.ceil(response.count / params.page_size)
          : 1,
      }
    },
  })
}

export function useVisitorBadge(id: string) {
  return useQuery({
    queryKey: adminOpsKeys.visitorBadges.detail(id),
    queryFn: () => visitorApi.badges.get(id),
    enabled: !!id,
  })
}

export function useCreateVisitorBadge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<VisitorBadge>) => visitorApi.badges.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitorBadges.lists() })
    },
  })
}

export function useUpdateVisitorBadge(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<VisitorBadge>) => visitorApi.badges.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitorBadges.lists() })
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitorBadges.detail(id) })
    },
  })
}

export function useDeleteVisitorBadge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => visitorApi.badges.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOpsKeys.visitorBadges.lists() })
    },
  })
}
