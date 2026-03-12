export type UserRole = 'hospital' | 'patient'

export interface Hospital {
  id: string
  name: string
  location: string
  phone: string
  email?: string | null
  createdAt: Date
}

export interface Doctor {
  id: string
  hospitalId: string
  name: string
  phone: string
  specialization: string
  image?: string | null
  status: 'IN_OP' | 'IN_IP' | 'EMERGENCY' | 'ON_LEAVE'
  estimatedReturn?: Date | null
  tokenEnabled: boolean
  hospital?: Hospital
  schedules?: DoctorSchedule[]
}

export interface DoctorSchedule {
  id: string
  doctorId: string
  dayOfWeek: number
  openTime: string
  closeTime: string
  maxPatientsPerDay: number
  avgConsultMinutes: number
  isActive: boolean
}

export interface Patient {
  id: string
  name: string
  phone: string
  image?: string | null
  walletBalance: number
  createdAt: Date
}

export interface Token {
  id: string
  doctorId: string
  patientId?: string | null
  tokenNumber: number
  status: 'PENDING' | 'CURRENT' | 'COMPLETED' | 'CANCELLED' | 'SKIPPED'
  date: Date
  fee: number
  isWalkIn: boolean
  patientName?: string | null
  patientPhone?: string | null
  doctor?: Doctor
  patient?: Patient
}

export interface Transaction {
  id: string
  patientId: string
  amount: number
  type: 'CREDIT' | 'DEBIT'
  description: string
  createdAt: Date
}

export interface Notification {
  id: string
  patientId: string
  title: string
  message: string
  read: boolean
  createdAt: Date
}

export interface Favorite {
  id: string
  patientId: string
  hospitalId?: string | null
  doctorId?: string | null
  hospital?: Hospital
  doctor?: Doctor
}

export interface DashboardStats {
  totalTokens: number
  pendingTokens: number
  currentToken: number | null
  completedTokens: number
  cancelledTokens: number
  skippedTokens: number
}
