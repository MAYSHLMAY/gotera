import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/africastalking'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    listingId,
    farmerId,
    quantity,
    totalPrice,
    deliveryDate,
    deliveryAddress,
    note,
  } = body

  if (
    !listingId ||
    !farmerId ||
    !quantity ||
    totalPrice == null ||
    !deliveryDate ||
    !deliveryAddress
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      buyer_id: user.id,
      listing_id: listingId,
      farmer_id: farmerId,
      quantity,
      total_price: totalPrice,
      delivery_date: deliveryDate,
      delivery_address: deliveryAddress,
      note: note || null,
    })
    .select('id')
    .single()

  if (orderError) {
    console.error('Order creation error:', orderError)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  const [{ data: farmer }, { data: buyer }, { data: listing }] = await Promise.all([
    admin.from('profiles').select('phone, name').eq('id', farmerId).single(),
    admin.from('profiles').select('name, business_name').eq('id', user.id).single(),
    admin.from('listings').select('product, price_per_kg').eq('id', listingId).single(),
  ])

  if (farmer?.phone && listing) {
    const buyerLabel = buyer?.business_name || buyer?.name || 'A buyer'
    await sendSMS(
      farmer.phone,
      `Gotera Order Alert!\n${buyerLabel} wants ${quantity}kg ${listing.product}\nPrice: ${listing.price_per_kg} ETB/kg — Total: ${totalPrice} ETB\nDelivery needed: ${deliveryDate}\nDial *572# to accept or decline.\n-Gotera`
    )
  }

  return NextResponse.json({ success: true, orderId: order.id })
}
