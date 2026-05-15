import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { UserRole } from '@/lib/types'

const dashboardRoles: UserRole[] = ['farmer', 'buyer', 'transport']

function copySupabaseCookies(
  from: NextResponse,
  to: NextResponse,
) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value)
  })
}

export async function updateSession(request: NextRequest) {
  const publicPaths = ['/api/ussd', '/api/auth/register']
  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
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
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getUser() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const protectedPaths = ['/farmer', '/buyer', '/transport', '/protected']
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    // no user, redirect to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    const redirectResponse = NextResponse.redirect(url)
    copySupabaseCookies(supabaseResponse, redirectResponse)
    return redirectResponse
  }

  if (user) {
    const pathname = request.nextUrl.pathname
    const visitedDashboard = dashboardRoles.find((role) =>
      pathname.startsWith(`/${role}`),
    )

    if (visitedDashboard) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role && profile.role !== visitedDashboard) {
        const url = request.nextUrl.clone()
        url.pathname = `/${profile.role}`
        const redirectResponse = NextResponse.redirect(url)
        copySupabaseCookies(supabaseResponse, redirectResponse)
        return redirectResponse
      }
    }
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ['/auth/login', '/auth/signup']
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPath && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname = profile?.role ? `/${profile.role}` : '/'
    const redirectResponse = NextResponse.redirect(url)
    copySupabaseCookies(supabaseResponse, redirectResponse)
    return redirectResponse
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
