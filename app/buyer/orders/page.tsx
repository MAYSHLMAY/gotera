"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { ShoppingCart } from "lucide-react"
import type { Order } from "@/lib/types"
import { cn } from "@/lib/utils"

type TabType = "active" | "completed"

export default function BuyerOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("active")

  useEffect(() => {
    async function fetchOrders() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from("orders")
        .select("*, farmer:profiles!orders_farmer_id_fkey(*), listing:listings(*)")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false })

      if (data) setOrders(data)
      setLoading(false)
    }

    fetchOrders()
  }, [])

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "active") {
      return ["pending", "confirmed", "in-transit"].includes(order.status)
    }
    return ["delivered", "declined"].includes(order.status)
  })

  const tabs: { value: TabType; label: string; count: number }[] = [
    {
      value: "active",
      label: "Active",
      count: orders.filter((o) =>
        ["pending", "confirmed", "in-transit"].includes(o.status)
      ).length,
    },
    {
      value: "completed",
      label: "Completed",
      count: orders.filter((o) =>
        ["delivered", "declined"].includes(o.status)
      ).length,
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="My Orders" subtitle="Track your orders" />

      <div className="p-4">
        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                    activeTab === tab.value
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-foreground/10 text-foreground"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                No {activeTab === "active" ? "Active" : "Completed"} Orders
              </h3>
              <p className="text-muted-foreground">
                {activeTab === "active"
                  ? "Your active orders will appear here"
                  : "Your completed orders will appear here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                        {order.listing?.emoji}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {order.listing?.product}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.quantity} kg
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3 text-sm">
                    <p className="text-muted-foreground">
                      From: <span className="text-foreground">{order.farmer?.name}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Delivery:{" "}
                      <span className="text-foreground">
                        {new Date(order.delivery_date).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Address:{" "}
                      <span className="text-foreground">{order.delivery_address}</span>
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      ETB {order.total_price.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
