"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MapPin, User, Loader2, Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import type { Listing, Profile } from "@/lib/types"

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<(Listing & { farmer: Profile }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [quantity, setQuantity] = useState(10)
  const [deliveryDate, setDeliveryDate] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [note, setNote] = useState("")
  const [showOrderForm, setShowOrderForm] = useState(false)

  useEffect(() => {
    async function fetchListing() {
      const supabase = createClient()
      const { data } = await supabase
        .from("listings")
        .select("*, farmer:profiles!listings_farmer_id_fkey(*)")
        .eq("id", params.id)
        .single()

      if (data) setListing(data as Listing & { farmer: Profile })
      setLoading(false)
    }

    fetchListing()
  }, [params.id])

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!listing) return

    setOrdering(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Please log in to place an order")
      setOrdering(false)
      return
    }

    const totalPrice = quantity * listing.price_per_kg
    const orderRes = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: listing.id,
        farmerId: listing.farmer_id,
        quantity,
        totalPrice,
        deliveryDate,
        deliveryAddress,
        note: note || null,
      }),
    })

    if (!orderRes.ok) {
      const err = await orderRes.json().catch(() => ({}))
      toast.error(err.error || "Failed to place order")
      setOrdering(false)
      return
    }

    toast.success("Order placed successfully!")
    router.push("/buyer/orders")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Listing not found</p>
        <Button asChild className="mt-4">
          <Link href="/buyer/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    )
  }

  const totalPrice = quantity * listing.price_per_kg
  const minDate = new Date(listing.available_from) > new Date() 
    ? listing.available_from 
    : new Date().toISOString().split("T")[0]

  return (
    <div>
      <PageHeader title="Product Details">
        <Button asChild variant="ghost" size="sm">
          <Link href="/buyer/marketplace">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <div className="space-y-4 p-4">
        {/* Product Info */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10 text-5xl">
                {listing.emoji}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {listing.product}
                </h2>
                <p className="text-2xl font-bold text-primary">
                  ETB {listing.price_per_kg}/kg
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Available</p>
                <p className="font-semibold text-foreground">
                  {listing.quantity} kg
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">From</p>
                <p className="font-semibold text-foreground">
                  {new Date(listing.available_from).toLocaleDateString()}
                </p>
              </div>
            </div>

            {listing.notes && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="text-foreground">{listing.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Farmer Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {listing.farmer?.name}
                </p>
                {listing.farmer?.location && (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {listing.farmer.location}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Form */}
        {!showOrderForm ? (
          <Button
            onClick={() => setShowOrderForm(true)}
            className="w-full"
            size="lg"
          >
            Place Order
          </Button>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Order Details
              </h3>
              <form onSubmit={handleOrder} className="space-y-4">
                {/* Quantity */}
                <div className="space-y-2">
                  <Label>Quantity (kg)</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 10))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.min(
                            listing.quantity,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        )
                      }
                      className="text-center"
                      min="1"
                      max={listing.quantity}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuantity(Math.min(listing.quantity, quantity + 10))
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Max: {listing.quantity} kg
                  </p>
                </div>

                {/* Delivery Date */}
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    required
                    min={minDate}
                  />
                </div>

                {/* Delivery Address */}
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Delivery Address</Label>
                  <Input
                    id="deliveryAddress"
                    placeholder="Enter full delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                  />
                </div>

                {/* Note */}
                <div className="space-y-2">
                  <Label htmlFor="note">Note (optional)</Label>
                  <Textarea
                    id="note"
                    placeholder="Any special instructions..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Total */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        ETB {totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {quantity} kg x ETB {listing.price_per_kg}/kg
                    </p>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowOrderForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={ordering || !deliveryDate || !deliveryAddress}
                  >
                    {ordering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing...
                      </>
                    ) : (
                      "Confirm Order"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
