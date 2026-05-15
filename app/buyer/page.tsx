"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { Package, ShoppingCart, Search } from "lucide-react"
import type { Profile, Listing, Order } from "@/lib/types"

export default function BuyerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const [profileRes, listingsRes, ordersRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("listings")
          .select("*, farmer:profiles!listings_farmer_id_fkey(*)")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("orders")
          .select("*, farmer:profiles!orders_farmer_id_fkey(*), listing:listings(*)")
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3),
      ])

      if (profileRes.data) setProfile(profileRes.data)
      if (listingsRes.data) setListings(listingsRes.data)
      if (ordersRes.data) setOrders(ordersRes.data)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`Hello, ${profile?.name?.split(" ")[0] || "Buyer"}`}
        subtitle={profile?.business_name || "Find fresh produce"}
      />

      <div className="space-y-6 p-4">
        {/* Search */}
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/buyer/marketplace">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Search for produce...</span>
          </Link>
        </Button>

        {/* Recent Orders */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Your Orders
            </h2>
            <Link
              href="/buyer/orders"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <ShoppingCart className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">No orders yet</p>
                <Button asChild className="mt-4">
                  <Link href="/buyer/marketplace">Browse Marketplace</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {order.listing?.emoji} {order.listing?.product}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.quantity} kg from {order.farmer?.name}
                        </p>
                        <p className="text-sm font-medium text-primary">
                          ETB {order.total_price.toLocaleString()}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Fresh Produce */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Fresh Produce
            </h2>
            <Link
              href="/buyer/marketplace"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>

          {listings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No produce available right now
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/buyer/marketplace/${listing.id}`}
                >
                  <Card className="h-full transition-colors hover:bg-muted/50">
                    <CardContent className="p-4">
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                        {listing.emoji}
                      </div>
                      <p className="font-semibold text-foreground">
                        {listing.product}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {listing.quantity} kg
                      </p>
                      <p className="text-sm font-medium text-primary">
                        ETB {listing.price_per_kg}/kg
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {listing.farmer?.name}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
