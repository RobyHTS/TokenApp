import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function getDayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[day]
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'IN_OP': return 'text-green-600 bg-green-50'
    case 'IN_IP': return 'text-blue-600 bg-blue-50'
    case 'EMERGENCY': return 'text-red-600 bg-red-50'
    case 'ON_LEAVE': return 'text-gray-600 bg-gray-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'IN_OP': return 'In OP'
    case 'IN_IP': return 'In IP'
    case 'EMERGENCY': return 'Emergency'
    case 'ON_LEAVE': return 'On Leave'
    default: return status
  }
}

export function getTokenStatusColor(status: string): string {
  switch (status) {
    case 'PENDING': return 'text-yellow-600 bg-yellow-50'
    case 'CURRENT': return 'text-blue-600 bg-blue-50'
    case 'COMPLETED': return 'text-green-600 bg-green-50'
    case 'CANCELLED': return 'text-red-600 bg-red-50'
    case 'SKIPPED': return 'text-orange-600 bg-orange-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}
