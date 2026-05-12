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
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error: authError } = await supabase.auth.getUser()
  const user = data?.user

  const pathname = request.nextUrl.pathname

  // Allow public routes
  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r))
  if (isPublic) return supabaseResponse

  // Redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect root to dashboard
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
