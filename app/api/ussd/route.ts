import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/africastalking'
import type { Listing, Order, Profile } from '@/lib/types'

function ussdResponse(text: string) {
  return new Response(text, { headers: { 'Content-Type': 'text/plain' } })
}

async function getProfileByPhone(phone: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('phone', phone)
    .maybeSingle()
  return data as Profile | null
}

async function getOldestPendingOrder(farmerId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('orders')
    .select(
      '*, buyer:profiles!orders_buyer_id_fkey(*), listing:listings(*)'
    )
    .eq('farmer_id', farmerId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  return data as
    | (Order & { buyer: Profile; listing: Listing })
    | null
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const phoneNumber = formData.get('phoneNumber')?.toString() ?? ''
  const text = formData.get('text')?.toString() ?? ''

  if (!phoneNumber) {
    return ussdResponse('END Invalid request.')
  }

  const profile = await getProfileByPhone(phoneNumber)
  const isRegistered = !!profile

  if (text === '') {
    if (!isRegistered) {
      return ussdResponse(
        'CON Welcome to Gotera ጎተራ\nYou are not registered.\n1. Register as farmer\n0. Exit'
      )
    }
    return ussdResponse(
      'CON Welcome to Gotera ጎተራ\n1. New orders\n2. My listings\n3. My earnings\n0. Exit'
    )
  }

  if (text === '0') {
    return ussdResponse('END Thank you for using Gotera ጎተራ!')
  }

  if (!isRegistered) {
    if (text === '1') {
      return ussdResponse('CON Enter your full name:')
    }
    if (text.startsWith('1*')) {
      const name = text.split('*')[1]?.trim()
      if (!name) {
        return ussdResponse('CON Enter your full name:')
      }
      const supabase = createAdminClient()
      const { error } = await supabase.from('profiles').insert({
        name,
        phone: phoneNumber,
        role: 'farmer',
      })
      if (error) {
        console.error('USSD registration error:', error)
        return ussdResponse('END Registration failed. Please try again later.')
      }
      return ussdResponse(
        'END Registered! Welcome to Gotera. Buyers will now find your farm.'
      )
    }
    return ussdResponse(
      'CON Welcome to Gotera ጎተራ\nYou are not registered.\n1. Register as farmer\n0. Exit'
    )
  }

  const farmer = profile!

  if (text === '1') {
    const order = await getOldestPendingOrder(farmer.id)
    if (!order) {
      return ussdResponse('END No new orders right now. Check back later!')
    }
    const buyerName =
      order.buyer?.business_name || order.buyer?.name || 'A buyer'
    const product = order.listing?.product ?? 'produce'
    return ussdResponse(
      `CON New order!\n${buyerName} wants ${order.quantity}kg ${product}\nTotal: ${order.total_price} ETB\nDelivery: ${order.delivery_date}\n\n1. Accept\n2. Decline`
    )
  }

  if (text === '1*1') {
    const order = await getOldestPendingOrder(farmer.id)
    if (!order) {
      return ussdResponse('END No pending order found.')
    }
    const supabase = createAdminClient()
    await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', order.id)

    const product = order.listing?.product ?? 'produce'
    const buyerPhone = order.buyer?.phone
    if (buyerPhone) {
      await sendSMS(
        buyerPhone,
        `Gotera: Your order of ${order.quantity}kg ${product} from ${farmer.name} is confirmed! Delivery on ${order.delivery_date}. -Gotera`
      )
    }
    return ussdResponse(
      'END Order accepted! The buyer has been notified. Well done!'
    )
  }

  if (text === '1*2') {
    const order = await getOldestPendingOrder(farmer.id)
    if (!order) {
      return ussdResponse('END No pending order found.')
    }
    const supabase = createAdminClient()
    await supabase
      .from('orders')
      .update({ status: 'declined' })
      .eq('id', order.id)

    const product = order.listing?.product ?? 'produce'
    const buyerPhone = order.buyer?.phone
    if (buyerPhone) {
      await sendSMS(
        buyerPhone,
        `Gotera: ${farmer.name} could not fulfil your ${product} order. Please order from another farmer at gotera.et -Gotera`
      )
    }
    return ussdResponse('END Order declined. The buyer has been notified.')
  }

  if (text === '2') {
    const supabase = createAdminClient()
    const { data: listings } = await supabase
      .from('listings')
      .select('*')
      .eq('farmer_id', farmer.id)
      .eq('status', 'active')
      .limit(3)

    if (!listings?.length) {
      return ussdResponse('END You have no active listings.')
    }
    const lines = listings
      .map(
        (l) =>
          `${l.emoji}${l.product}: ${l.quantity}kg @ ${l.price_per_kg} ETB`
      )
      .join('\n')
    return ussdResponse(`END Your listings:\n${lines}`)
  }

  if (text === '3') {
    const supabase = createAdminClient()
    const { data: orders } = await supabase
      .from('orders')
      .select('total_price')
      .eq('farmer_id', farmer.id)
      .in('status', ['confirmed', 'delivered'])

    const total =
      orders?.reduce((sum, o) => sum + (o.total_price ?? 0), 0) ?? 0
    const count = orders?.length ?? 0
    return ussdResponse(
      `END Your earnings:\n${total} ETB total\nfrom ${count} completed orders.`
    )
  }

  return ussdResponse(
    'CON Welcome to Gotera ጎተራ\n1. New orders\n2. My listings\n3. My earnings\n0. Exit'
  )
}
