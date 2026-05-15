"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { Truck, MapPin, Phone, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Order } from "@/lib/types"
import { cn } from "@/lib/utils"

type TabType = "active" | "completed"

export default function ActiveDeliveries() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("active")
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("orders")
      .select("*, buyer:profiles!orders_buyer_id_fkey(*), farmer:profiles!orders_farmer_id_fkey(*), listing:listings(*)")
      .eq("driver_id", user.id)
      .order("delivery_date", { ascending: true })

    if (data) setOrders(data)
    setLoading(false)
  }

  async function markAsDelivered(orderId: string) {
    setProcessingId(orderId)
    const supabase = createClient()

    const { error } = await supabase
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", orderId)

    if (error) {
      toast.error("Failed to update status")
      setProcessingId(null)
      return
    }

    toast.success("Delivery completed!")
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "delivered" } : o))
    )
    setProcessingId(null)
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "active") return order.status === "in-transit"
    return order.status === "delivered"
  })

  const tabs: { value: TabType; label: string; count: number }[] = [
    {
      value: "active",
      label: "Active",
      count: orders.filter((o) => o.status === "in-transit").length,
    },
    {
      value: "completed",
      label: "Completed",
      count: orders.filter((o) => o.status === "delivered").length,
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
      <PageHeader title="My Deliveries" subtitle="Track your deliveries" />

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
              <Truck className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                No {activeTab === "active" ? "Active" : "Completed"} Deliveries
              </h3>
              <p className="text-muted-foreground">
                {activeTab === "active"
                  ? "Accept jobs to start delivering"
                  : "Your completed deliveries will appear here"}
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

                  <div className="mb-3 rounded-lg bg-muted/50 p-3 text-sm">
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="font-medium text-foreground">
                        {order.farmer?.name}
                      </p>
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {order.farmer?.location || "Location TBD"}
                      </p>
                      {order.farmer?.phone && (
                        <a
                          href={`tel:${order.farmer.phone}`}
                          className="flex items-center gap-1 text-primary"
                        >
                          <Phone className="h-3 w-3" />
                          {order.farmer.phone}
                        </a>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Deliver to</p>
                      <p className="font-medium text-foreground">
                        {order.buyer?.business_name || order.buyer?.name}
                      </p>
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {order.delivery_address}
                      </p>
                      {order.buyer?.phone && (
                        <a
                          href={`tel:${order.buyer.phone}`}
                          className="flex items-center gap-1 text-primary"
                        >
                          <Phone className="h-3 w-3" />
                          {order.buyer.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(order.delivery_date).toLocaleDateString()}
                    </p>

                    {order.status === "in-transit" && (
                      <Button
                        size="sm"
                        onClick={() => markAsDelivered(order.id)}
                        disabled={processingId === order.id}
                      >
                        {processingId === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Delivered
                          </>
                        )}
                      </Button>
                    )}
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
