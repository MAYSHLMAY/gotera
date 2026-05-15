"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Truck, Package, TrendingUp } from "lucide-react"
import type { Profile, Order } from "@/lib/types"

export default function TransportDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [availableJobs, setAvailableJobs] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const [profileRes, myOrdersRes, jobsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("orders")
          .select("*, buyer:profiles!orders_buyer_id_fkey(*), farmer:profiles!orders_farmer_id_fkey(*), listing:listings(*)")
          .eq("driver_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("orders")
          .select("*, buyer:profiles!orders_buyer_id_fkey(*), farmer:profiles!orders_farmer_id_fkey(*), listing:listings(*)")
          .eq("status", "confirmed")
          .is("driver_id", null)
          .order("created_at", { ascending: false })
          .limit(5),
      ])

      if (profileRes.data) setProfile(profileRes.data)
      if (myOrdersRes.data) setMyOrders(myOrdersRes.data)
      if (jobsRes.data) setAvailableJobs(jobsRes.data)
      setLoading(false)
    }

    fetchData()
  }, [])

  const activeDeliveries = myOrders.filter((o) => o.status === "in-transit")
  const completedDeliveries = myOrders.filter((o) => o.status === "delivered")

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
        title={`Hello, ${profile?.name?.split(" ")[0] || "Driver"}`}
        subtitle="Find delivery jobs"
      />

      <div className="space-y-6 p-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <Truck className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-2xl font-bold text-foreground">
                {activeDeliveries.length}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="mx-auto mb-2 h-6 w-6 text-accent-foreground" />
              <p className="text-2xl font-bold text-foreground">
                {availableJobs.length}
              </p>
              <p className="text-xs text-muted-foreground">Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-2xl font-bold text-foreground">
                {completedDeliveries.length}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Jobs */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Available Jobs
            </h2>
            <Link
              href="/transport/jobs"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>

          {availableJobs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Truck className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No jobs available right now
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {availableJobs.slice(0, 3).map((job) => (
                <Link key={job.id} href={`/transport/jobs/${job.id}`}>
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {job.listing?.emoji} {job.listing?.product}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {job.quantity} kg
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {job.farmer?.location} → {job.delivery_address}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">
                            {new Date(job.delivery_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Active Deliveries */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              My Deliveries
            </h2>
            <Link
              href="/transport/active"
              className="text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>

          {myOrders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Accept jobs to start delivering
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myOrders.slice(0, 3).map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {order.listing?.emoji} {order.listing?.product}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.quantity} kg
                        </p>
                        <p className="text-xs text-muted-foreground">
                          To: {order.delivery_address}
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
      </div>
    </div>
  )
}
