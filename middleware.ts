import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/tracking', // driver tracking (public)
  '/portal',   // customer portal
]

const ROLE_ROUTES: Record<string, string[]> = {
  admin: ['/'],
  dispatcher: ['/dashboard', '/loads', '/map', '/notifications', '/carriers', '/settings'],
  carrier: ['/dashboard', '/loads', '/map', '/notifications'],
  driver: ['/tracking'],
  customer: ['/portal'],
}

export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
