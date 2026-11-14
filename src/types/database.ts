export type Role = 'employee' | 'supervisor' | 'hq' | 'gm' | 'ceo' | 'superuser'
export type SiteStatus = 'requested' | 'ready' | 'active' | 'extended' | 'completed' | 'abandoned'
export type PunchType = 'in' | 'out'
export type AssignmentStatus = 'assigned' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled'
export type ReportStatus = 'pending' | 'actioned' | 'dismissed'
export type SiteDownReason = 'power_failure' | 'local_holiday' | 'natural_calamity' | 'materials_unavailable' | 'tool_shortage' | 'site_clearance'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: Role
  skill: string | null
  daily_wage: number
  is_active: boolean
  photo_url: string | null
  device_id: string | null
  language: string
  star_count: number
  strike_count: number
  created_at: string
  updated_at: string
}

export interface Site {
  id: string
  name: string
  street: string
  state: string
  latitude: number | null
  longitude: number | null
  geofence_radius_meters: number
  supervisor_id: string | null
  status: SiteStatus
  estimated_duration_days: number
  site_down_active: boolean
  site_down_reason: SiteDownReason | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  site_id: string
  title: string
  description: string | null
  status: string
  assigned_to: string | null
  completed_by: string | null
  completed_at: string | null
  created_at: string
}

export interface Assignment {
  id: string
  site_id: string
  employee_id: string
  assigned_date: string
  assigned_by: string | null
  status: AssignmentStatus
  created_at: string
}

export interface Punch {
  id: string
  employee_id: string
  site_id: string | null
  punch_type: PunchType
  punched_at: string
  latitude: number | null
  longitude: number | null
  in_geofence: boolean
  selfie_url: string | null
  device_id: string | null
  synced: boolean
  offline_queued_at: string | null
  created_at: string
}

export interface TaskPhoto {
  id: string
  task_id: string
  employee_id: string
  photo_url: string
  photo_type: string
  created_at: string
}

export interface CivilWorkerPhoto {
  id: string
  employee_id: string
  photo_url: string
  uploaded_by: string | null
  created_at: string
}

export interface Star {
  id: string
  employee_id: string
  awarded_by: string
  reason: string
  created_at: string
}

export interface Strike {
  id: string
  employee_id: string
  issued_by: string
  reason: string
  created_at: string
}

export interface WorkerReport {
  id: string
  employee_id: string
  reported_by: string
  reason: string
  status: ReportStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface Broadcast {
  id: string
  sender_id: string
  message: string | null
  audio_url: string | null
  target_site_id: string | null
  target_role: string | null
  created_at: string
}

export interface SiteClosure {
  id: string
  site_id: string
  reason: SiteDownReason
  start_date: string
  end_date: string | null
  declared_by: string
  created_at: string
}

export interface AuditLog {
  id: string
  actor_id: string
  actor_role: string
  action: string
  description: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id?: string; email: string; full_name: string }; Update: Partial<Profile> }
      sites: { Row: Site; Insert: Partial<Site> & { name: string }; Update: Partial<Site> }
      tasks: { Row: Task; Insert: Partial<Task> & { site_id: string; title: string }; Update: Partial<Task> }
      assignments: { Row: Assignment; Insert: Partial<Assignment> & { site_id: string; employee_id: string; assigned_date: string }; Update: Partial<Assignment> }
      punches: { Row: Punch; Insert: Partial<Punch> & { employee_id: string; punch_type: PunchType }; Update: Partial<Punch> }
      task_photos: { Row: TaskPhoto; Insert: Partial<TaskPhoto> & { task_id: string; employee_id: string; photo_url: string }; Update: Partial<TaskPhoto> }
      civil_worker_photos: { Row: CivilWorkerPhoto; Insert: Partial<CivilWorkerPhoto> & { employee_id: string; photo_url: string }; Update: Partial<CivilWorkerPhoto> }
      stars: { Row: Star; Insert: Partial<Star> & { employee_id: string; awarded_by: string; reason: string }; Update: Partial<Star> }
      strikes: { Row: Strike; Insert: Partial<Strike> & { employee_id: string; issued_by: string; reason: string }; Update: Partial<Strike> }
      worker_reports: { Row: WorkerReport; Insert: Partial<WorkerReport> & { employee_id: string; reported_by: string; reason: string }; Update: Partial<WorkerReport> }
      broadcasts: { Row: Broadcast; Insert: Partial<Broadcast> & { sender_id: string }; Update: Partial<Broadcast> }
      site_closures: { Row: SiteClosure; Insert: Partial<SiteClosure> & { site_id: string; reason: SiteDownReason; start_date: string; declared_by: string }; Update: Partial<SiteClosure> }
      audit_log: { Row: AuditLog; Insert: Partial<AuditLog> & { actor_id: string; actor_role: string; action: string; description: string }; Update: Partial<AuditLog> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
