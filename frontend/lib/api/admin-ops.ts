import { apiClient } from './client'

// Room Booking Types
export interface Room {
  id: string
  name: string
  code: string
  room_type: 'meeting' | 'conference' | 'training' | 'auditorium' | 'boardroom' | 'huddle'
  floor: string
  building: string
  capacity: number
  description: string
  has_projector: boolean
  has_whiteboard: boolean
  has_video_conference: boolean
  has_teleconference: boolean
  has_ac: boolean
  requires_approval: boolean
  max_booking_hours: number
  advance_booking_days: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoomBooking {
  id: string
  room: string | Room
  room_name?: string
  booked_by: string
  booked_by_name?: string
  title: string
  description: string
  start_time: string
  end_time: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
  expected_attendees: number
  approved_by?: string
  approved_by_name?: string
  approved_at?: string
  rejection_reason?: string
  cancelled_at?: string
  cancellation_reason?: string
  notes: string
  created_at: string
  updated_at: string
}

// Vehicle Management Types
export interface Vehicle {
  id: string
  name: string
  plate_number: string
  vehicle_type: 'car' | 'mpv' | 'suv' | 'van' | 'bus' | 'motorcycle'
  brand: string
  model: string
  year: number
  color: string
  capacity: number
  status: 'available' | 'in_use' | 'maintenance' | 'unavailable'
  stnk_expiry?: string
  kir_expiry?: string
  insurance_expiry?: string
  last_service_date?: string
  next_service_date?: string
  current_odometer: number
  assigned_driver?: string
  assigned_driver_name?: string
  notes: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Driver {
  id: string
  user: number
  user_name?: string
  license_number: string
  license_type: string
  license_expiry: string
  phone: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VehicleBooking {
  id: string
  vehicle: string | Vehicle
  vehicle_name?: string
  vehicle_plate?: string
  booked_by: string
  booked_by_name?: string
  driver?: string
  driver_name?: string
  purpose: string
  destination: string
  description: string
  start_time: string
  end_time: string
  actual_start_time?: string
  actual_end_time?: string
  passenger_count: number
  passengers: string
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled'
  start_odometer?: number
  end_odometer?: number
  fuel_used?: number
  fuel_cost?: number
  approved_by?: string
  approved_by_name?: string
  approved_at?: string
  rejection_reason?: string
  notes: string
  distance_traveled?: number
  created_at: string
  updated_at: string
}

export interface VehicleMaintenance {
  id: string
  vehicle: string | Vehicle
  vehicle_name?: string
  maintenance_type: string
  description: string
  service_date: string
  odometer_reading: number
  cost: number
  vendor: string
  next_service_odometer?: number
  notes: string
  created_at: string
  updated_at: string
}

// Visitor Log Types
export interface Visitor {
  id: string
  name: string
  company: string
  email: string
  phone: string
  id_type: 'ktp' | 'sim' | 'passport' | 'kitas' | 'other'
  id_number: string
  photo?: string
  notes: string
  is_blacklisted: boolean
  blacklist_reason: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VisitLog {
  id: string
  visitor?: string | Visitor
  visitor_name: string
  visitor_company: string
  visitor_phone: string
  visitor_id_type: 'ktp' | 'sim' | 'passport' | 'kitas' | 'other'
  visitor_id_number: string
  purpose: 'meeting' | 'interview' | 'delivery' | 'vendor' | 'guest' | 'contractor' | 'government' | 'other'
  purpose_detail: string
  host?: string
  host_name: string
  host_department: string
  expected_arrival?: string
  check_in_time?: string
  check_out_time?: string
  status: 'expected' | 'checked_in' | 'checked_out' | 'no_show' | 'cancelled'
  badge_number: string
  belongings: string
  checked_in_by?: string
  checked_out_by?: string
  notes: string
  is_pre_registered: boolean
  pre_registered_by?: string
  duration_minutes?: number
  created_at: string
  updated_at: string
}

export interface VisitorBadge {
  id: string
  badge_number: string
  badge_type: string
  is_available: boolean
  current_holder?: string
  notes: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Room Booking APIs
export const roomApi = {
  rooms: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: Room[], count: number }>('/admin-ops/room-booking/rooms/', params),

    get: (id: string) =>
      apiClient.get<Room>(`/admin-ops/room-booking/rooms/${id}/`),

    create: (data: Partial<Room>) =>
      apiClient.post<Room>('/admin-ops/room-booking/rooms/', data),

    update: (id: string, data: Partial<Room>) =>
      apiClient.patch<Room>(`/admin-ops/room-booking/rooms/${id}/`, data),

    delete: (id: string) =>
      apiClient.delete(`/admin-ops/room-booking/rooms/${id}/`),
  },

  bookings: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: RoomBooking[], count: number }>('/admin-ops/room-booking/bookings/', params),

    get: (id: string) =>
      apiClient.get<RoomBooking>(`/admin-ops/room-booking/bookings/${id}/`),

    create: (data: Partial<RoomBooking>) =>
      apiClient.post<RoomBooking>('/admin-ops/room-booking/bookings/', data),

    update: (id: string, data: Partial<RoomBooking>) =>
      apiClient.patch<RoomBooking>(`/admin-ops/room-booking/bookings/${id}/`, data),

    delete: (id: string) =>
      apiClient.delete(`/admin-ops/room-booking/bookings/${id}/`),

    approve: (id: string, data?: { notes?: string }) =>
      apiClient.post(`/admin-ops/room-booking/bookings/${id}/approve/`, data),

    reject: (id: string, data: { rejection_reason: string }) =>
      apiClient.post(`/admin-ops/room-booking/bookings/${id}/reject/`, data),

    cancel: (id: string, data: { cancellation_reason: string }) =>
      apiClient.post(`/admin-ops/room-booking/bookings/${id}/cancel/`, data),
  },
}

// Vehicle Management APIs
export const vehicleApi = {
  vehicles: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: Vehicle[], count: number }>('/admin-ops/vehicle/vehicles/', params),

    get: (id: string) =>
      apiClient.get<Vehicle>(`/admin-ops/vehicle/vehicles/${id}/`),

    create: (data: Partial<Vehicle>) =>
      apiClient.post<Vehicle>('/admin-ops/vehicle/vehicles/', data),

    update: (id: string, data: Partial<Vehicle>) =>
      apiClient.patch<Vehicle>(`/admin-ops/vehicle/vehicles/${id}/`, data),

    delete: (id: string) =>
      apiClient.delete(`/admin-ops/vehicle/vehicles/${id}/`),
  },

  drivers: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: Driver[], count: number }>('/admin-ops/vehicle/drivers/', params),

    get: (id: string) =>
      apiClient.get<Driver>(`/admin-ops/vehicle/drivers/${id}/`),

    create: (data: Partial<Driver>) =>
      apiClient.post<Driver>('/admin-ops/vehicle/drivers/', data),

    update: (id: string, data: Partial<Driver>) =>
      apiClient.patch<Driver>(`/admin-ops/vehicle/drivers/${id}/`, data),

    delete: (id: string) =>
      apiClient.delete(`/admin-ops/vehicle/drivers/${id}/`),
  },

  bookings: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: VehicleBooking[], count: number }>('/admin-ops/vehicle/bookings/', params),

    get: (id: string) =>
      apiClient.get<VehicleBooking>(`/admin-ops/vehicle/bookings/${id}/`),

    create: (data: Partial<VehicleBooking>) =>
      apiClient.post<VehicleBooking>('/admin-ops/vehicle/bookings/', data),

    update: (id: string, data: Partial<VehicleBooking>) =>
      apiClient.patch<VehicleBooking>(`/admin-ops/vehicle/bookings/${id}/`, data),

    delete: (id: string) =>
      apiClient.delete(`/admin-ops/vehicle/bookings/${id}/`),

    approve: (id: string, data?: { notes?: string }) =>
      apiClient.post(`/admin-ops/vehicle/bookings/${id}/approve/`, data),

    reject: (id: string, data: { rejection_reason: string }) =>
      apiClient.post(`/admin-ops/vehicle/bookings/${id}/reject/`, data),

    start: (id: string, data: { start_odometer: number }) =>
      apiClient.post(`/admin-ops/vehicle/bookings/${id}/start/`, data),

    complete: (id: string, data: { end_odometer: number, fuel_used?: number, fuel_cost?: number }) =>
      apiClient.post(`/admin-ops/vehicle/bookings/${id}/complete/`, data),
  },

  maintenance: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: VehicleMaintenance[], count: number }>('/admin-ops/vehicle/maintenance/', params),

    get: (id: string) =>
      apiClient.get<VehicleMaintenance>(`/admin-ops/vehicle/maintenance/${id}/`),

    create: (data: Partial<VehicleMaintenance>) =>
      apiClient.post<VehicleMaintenance>('/admin-ops/vehicle/maintenance/', data),

    update: (id: string, data: Partial<VehicleMaintenance>) =>
      apiClient.patch<VehicleMaintenance>(`/admin-ops/vehicle/maintenance/${id}/`, data),

    delete: (id: string) =>
      apiClient.delete(`/admin-ops/vehicle/maintenance/${id}/`),
  },
}

// Visitor Log APIs
export const visitorApi = {
  visitors: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: Visitor[], count: number }>('/admin-ops/visitor/visitors/', params),

    get: (id: string) =>
      apiClient.get<Visitor>(`/admin-ops/visitor/visitors/${id}/`),

    create: (data: Partial<Visitor>) =>
      apiClient.post<Visitor>('/admin-ops/visitor/visitors/', data),

    update: (id: string, data: Partial<Visitor>) =>
      apiClient.patch<Visitor>(`/admin-ops/visitor/visitors/${id}/`, data),

    delete: (id: string) =>
      apiClient.delete(`/admin-ops/visitor/visitors/${id}/`),

    blacklist: (id: string, data: { blacklist_reason: string }) =>
      apiClient.post(`/admin-ops/visitor/visitors/${id}/blacklist/`, data),
  },

  logs: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: VisitLog[], count: number }>('/admin-ops/visitor/logs/', params),

    get: (id: string) =>
      apiClient.get<VisitLog>(`/admin-ops/visitor/logs/${id}/`),

    create: (data: Partial<VisitLog>) =>
      apiClient.post<VisitLog>('/admin-ops/visitor/logs/', data),

    update: (id: string, data: Partial<VisitLog>) =>
      apiClient.patch<VisitLog>(`/admin-ops/visitor/logs/${id}/`, data),

    delete: (id: string) =>
      apiClient.delete(`/admin-ops/visitor/logs/${id}/`),

    checkIn: (id: string, data: { badge_number?: string, belongings?: string }) =>
      apiClient.post(`/admin-ops/visitor/logs/${id}/check-in/`, data),

    checkOut: (id: string) =>
      apiClient.post(`/admin-ops/visitor/logs/${id}/check-out/`),
  },

  badges: {
    list: (params?: Record<string, any>) =>
      apiClient.get<{ results: VisitorBadge[], count: number }>('/admin-ops/visitor/badges/', params),

    get: (id: string) =>
      apiClient.get<VisitorBadge>(`/admin-ops/visitor/badges/${id}/`),

    create: (data: Partial<VisitorBadge>) =>
      apiClient.post<VisitorBadge>('/admin-ops/visitor/badges/', data),

    update: (id: string, data: Partial<VisitorBadge>) =>
      apiClient.patch<VisitorBadge>(`/admin-ops/visitor/badges/${id}/`, data),

    delete: (id: string) =>
      apiClient.delete(`/admin-ops/visitor/badges/${id}/`),
  },
}
