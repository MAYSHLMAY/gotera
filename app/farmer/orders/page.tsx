"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { ShoppingCart, Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Order } from "@/lib/types"
import { cn } from "@/lib/utils"

type TabType = "pending" | "confirmed" | "completed"

export default function FarmerOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("pending")
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
      .select("*, buyer:profiles!orders_buyer_id_fkey(*), listing:listings(*)")
      .eq("farmer_id", user.id)
      .order("created_at", { ascending: false })

    if (data) setOrders(data)
    setLoading(false)
  }

  async function updateOrderStatus(orderId: string, status: "confirmed" | "declined") {
    setProcessingId(orderId)
    const supabase = createClient()

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)

    if (error) {
      toast.error("Failed to update order")
      setProcessingId(null)
      return
    }

    toast.success(`Order ${status}`)
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    )
    setProcessingId(null)
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "pending") return order.status === "pending"
    if (activeTab === "confirmed")
      return order.status === "confirmed" || order.status === "in-transit"
    return order.status === "delivered" || order.status === "declined"
  })

  const tabs: { value: TabType; label: string; count: number }[] = [
    { value: "pending", label: "Pending", count: orders.filter((o) => o.status === "pending").length },
    {
      value: "confirmed",
      label: "Active",
      count: orders.filter((o) => o.status === "confirmed" || o.status === "in-transit").length,
    },
    {
      value: "completed",
      label: "Completed",
      count: orders.filter((o) => o.status === "delivered" || o.status === "declined").length,
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
      <PageHeader title="Orders" subtitle="Manage incoming orders" />

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
                No {activeTab} Orders
              </h3>
              <p className="text-muted-foreground">
                {activeTab === "pending"
                  ? "You don't have any pending orders to review"
                  : activeTab === "confirmed"
                    ? "No orders are currently being processed"
                    : "No completed orders yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        {order.listing?.emoji} {order.listing?.product}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.quantity} kg
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="mb-3 rounded-lg bg-muted/50 p-3 text-sm">
                    <p className="font-medium text-foreground">
                      {order.buyer?.business_name || order.buyer?.name}
                    </p>
                    <p className="text-muted-foreground">
                      Delivery: {new Date(order.delivery_date).toLocaleDateString()}
                    </p>
                    <p className="text-muted-foreground">
                      Address: {order.delivery_address}
                    </p>
                    {order.note && (
                      <p className="mt-1 text-muted-foreground">
                        Note: {order.note}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-primary">
                      ETB {order.total_price.toLocaleString()}
                    </p>

                    {order.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOrderStatus(order.id, "declined")}
                          disabled={processingId === order.id}
                        >
                          {processingId === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <X className="mr-1 h-4 w-4" />
                              Decline
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "confirmed")}
                          disabled={processingId === order.id}
                        >
                          {processingId === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="mr-1 h-4 w-4" />
                              Accept
                            </>
                          )}
                        </Button>
                      </div>
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
