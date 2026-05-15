"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { Plus, Package, ShoppingCart, TrendingUp } from "lucide-react"
import type { Profile, Listing, Order } from "@/lib/types"

export default function FarmerDashboard() {
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
          .select("*")
          .eq("farmer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("orders")
          .select("*, buyer:profiles!orders_buyer_id_fkey(*), listing:listings(*)")
          .eq("farmer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ])

      if (profileRes.data) setProfile(profileRes.data)
      if (listingsRes.data) setListings(listingsRes.data)
      if (ordersRes.data) setOrders(ordersRes.data)
      setLoading(false)
    }

    fetchData()
  }, [])

  const activeListings = listings.filter((l) => l.status === "active")
  const pendingOrders = orders.filter((o) => o.status === "pending")
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.total_price, 0)

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
        title={`Hello, ${profile?.name?.split(" ")[0] || "Farmer"}`}
        subtitle="Manage your farm produce"
      />

      <div className="space-y-6 p-4">
        {/* Quick Actions */}
        <Button asChild className="w-full" size="lg">
          <Link href="/farmer/listings/new">
            <Plus className="mr-2 h-5 w-5" />
            Add New Listing
          </Link>
        </Button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-2xl font-bold text-foreground">
                {activeListings.length}
              </p>
              <p className="text-xs text-muted-foreground">Active Listings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingCart className="mx-auto mb-2 h-6 w-6 text-accent-foreground" />
              <p className="text-2xl font-bold text-foreground">
                {pendingOrders.length}
              </p>
              <p className="text-xs text-muted-foreground">Pending Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-2xl font-bold text-foreground">
                {totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">ETB Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Orders
            </h2>
            <Link
              href="/farmer/orders"
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
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {order.listing?.emoji} {order.listing?.product}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.quantity} kg - {order.buyer?.business_name || order.buyer?.name}
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

        {/* Active Listings */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Your Listings
            </h2>
            <Link
              href="/farmer/listings"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>

          {listings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                <p className="mb-4 text-muted-foreground">
                  No listings yet. Add your first produce!
                </p>
                <Button asChild>
                  <Link href="/farmer/listings/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Listing
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {listings.slice(0, 3).map((listing) => (
                <Card key={listing.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {listing.emoji} {listing.product}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {listing.quantity} kg available
                        </p>
                        <p className="text-sm font-medium text-primary">
                          ETB {listing.price_per_kg}/kg
                        </p>
                      </div>
                      <StatusBadge status={listing.status} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
