// TrackFlow TMS — Shared TypeScript Types

export type UserRole = 'admin' | 'dispatcher' | 'carrier' | 'driver' | 'customer'

export type LoadStatus =
  | 'booked'
  | 'dispatched'
  | 'at_pickup'
  | 'loaded'
  | 'in_transit'
  | 'at_delivery'
  | 'delivered'
  | 'pod_uploaded'
  | 'completed'
  | 'cancelled'
  | 'exception'

export type RiskLevel = 'on_time' | 'at_risk' | 'late'

export type TrackingSessionStatus = 'pending' | 'active' | 'stopped' | 'expired'

export type DocType = 'bol' | 'pod' | 'lumper' | 'scale_ticket' | 'photo' | 'other'

export type NotificationType =
  | 'load_status'
  | 'tracking_accepted'
  | 'tracking_lost'
  | 'geofence_entered'
  | 'geofence_exited'
  | 'pod_uploaded'
  | 'late_risk'
  | 'exception'
  | 'system'

export type GeofenceType = 'pickup' | 'delivery'

export type CompanyType = 'broker' | 'carrier' | 'shipper'

// ---- Database Row Types ----

export interface Company {
  id: string
  name: string
  type: CompanyType
  mc_number: string | null
  dot_number: string | null
  phone: string | null
  email: string | null
  city: string | null
  state: string | null
  created_at: string
}

export interface UserProfile {
  id: string
  company_id: string | null
  role: UserRole
  full_name: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  company_id: string | null
  name: string
  contact: string | null
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  created_at: string
}

export interface Carrier {
  id: string
  company_id: string | null
  name: string
  mc_number: string | null
  dot_number: string | null
  contact: string | null
  email: string | null
  phone: string | null
  insurance_exp: string | null
  is_active: boolean
  created_at: string
}

export interface Driver {
  id: string
  carrier_id: string | null
  full_name: string
  phone: string | null
  email: string | null
  license_number: string | null
  is_active: boolean
  created_at: string
}

export interface Load {
  id: string
  load_number: string
  company_id: string | null
  customer_id: string | null
  carrier_id: string | null
  driver_id: string | null
  dispatcher_id: string | null

  pickup_name: string | null
  pickup_address: string | null
  pickup_city: string
  pickup_state: string
  pickup_zip: string | null
  pickup_lat: number | null
  pickup_lng: number | null
  pickup_scheduled: string | null
  pickup_actual: string | null

  delivery_name: string | null
  delivery_address: string | null
  delivery_city: string
  delivery_state: string
  delivery_zip: string | null
  delivery_lat: number | null
  delivery_lng: number | null
  delivery_scheduled: string | null
  delivery_actual: string | null

  commodity: string | null
  weight_lbs: number | null
  pieces: number | null
  trailer_type: string | null
  temperature: string | null
  rate_usd: number | null
  carrier_pay_usd: number | null

  status: LoadStatus
  tracking_token: string | null
  eta: string | null
  risk_level: RiskLevel
  special_instructions: string | null
  dispatcher_notes: string | null

  created_at: string
  updated_at: string

  // Joined relations (optional)
  customer?: Customer
  carrier?: Carrier
  driver?: Driver
  dispatcher?: UserProfile
}

export interface TrackingSession {
  id: string
  load_id: string
  driver_id: string | null
  consent_at: string | null
  consent_ip: string | null
  status: TrackingSessionStatus
  stopped_at: string | null
  created_at: string
}

export interface LocationPing {
  id: string
  session_id: string
  load_id: string
  lat: number
  lng: number
  speed_mph: number | null
  heading: number | null
  accuracy_m: number | null
  city: string | null
  state: string | null
  created_at: string
}

export interface LoadEvent {
  id: string
  load_id: string
  event_type: string
  old_status: string | null
  new_status: string | null
  notes: string | null
  actor_id: string | null
  created_at: string
  actor?: UserProfile
}

export interface Document {
  id: string
  load_id: string
  doc_type: DocType
  file_name: string
  file_url: string
  file_size_kb: number | null
  uploaded_by: string | null
  created_at: string
  uploader?: UserProfile
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string | null
  load_id: string | null
  is_read: boolean
  created_at: string
  load?: Pick<Load, 'id' | 'load_number' | 'status'>
}

export interface Geofence {
  id: string
  load_id: string
  type: GeofenceType
  lat: number
  lng: number
  radius_m: number
  triggered: boolean
  triggered_at: string | null
  created_at: string
}

// ---- API Payloads ----

export interface CreateLoadPayload {
  customer_id: string
  carrier_id: string
  driver_id: string
  pickup_city: string
  pickup_state: string
  pickup_address?: string
  pickup_zip?: string
  pickup_scheduled?: string
  delivery_city: string
  delivery_state: string
  delivery_address?: string
  delivery_zip?: string
  delivery_scheduled?: string
  commodity?: string
  weight_lbs?: number
  pieces?: number
  trailer_type?: string
  temperature?: string
  rate_usd?: number
  carrier_pay_usd?: number
  special_instructions?: string
}

export interface LocationPingPayload {
  lat: number
  lng: number
  speed_mph?: number
  heading?: number
  accuracy_m?: number
}

export interface GeofenceCheckResult {
  entered: boolean
  type: GeofenceType
  geofence: Geofence
}

// ---- Dashboard Stats ----

export interface DashboardStats {
  activeLoads: number
  trackingAcceptedPct: number
  loadsWithoutTracking: number
  lateRiskLoads: number
  deliveredToday: number
  podMissing: number
  carrierComplianceAvg: number
}

// ---- Carrier Compliance ----

export interface CarrierCompliance {
  carrier: Carrier
  totalLoads: number
  trackingAcceptanceRate: number
  onTimePickupPct: number
  onTimeDeliveryPct: number
  avgPodHours: number | null
  trackingLostCount: number
  complianceScore: number
}
