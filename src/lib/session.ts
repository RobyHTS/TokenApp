import { cookies } from 'next/headers'
import { db } from './db'

export interface SessionData {
  userId: string
  role: 'hospital' | 'patient'
  name: string
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')

  if (!sessionCookie) return null

  try {
    const session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
    return session as SessionData
  } catch {
    return null
  }
}

export function createSessionToken(data: SessionData): string {
  return Buffer.from(JSON.stringify(data)).toString('base64')
}
