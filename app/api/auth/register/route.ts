import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      name,
      phone,
      role,
      location,
      businessName,
      businessType,
    } = body as {
      email: string
      password: string
      name: string
      phone: string
      role: UserRole
      location?: string
      businessName?: string
      businessType?: string
    }

    if (!email || !password || !name || !phone || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const validRoles: UserRole[] = ['farmer', 'buyer', 'transport']
    const profileRole = String(role).trim() as UserRole
    if (!validRoles.includes(profileRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    console.log('[register] Saving profile with role:', profileRole)

    const supabase = createAdminClient()

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, phone, role: profileRole },
      })

    if (authError) {
      console.error('Auth createUser error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      name,
      phone,
      email: body.contactEmail || null,
      role: profileRole,
      location: location || null,
      business_name: businessName || null,
      business_type: businessType || null,
    })

    if (profileError) {
      console.error('Profile insert error:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    const { data: savedProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    console.log('[register] Profile role in database:', savedProfile?.role)

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      role: savedProfile?.role ?? profileRole,
    })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
