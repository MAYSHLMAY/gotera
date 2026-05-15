"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { ArrowLeft, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Listing } from "@/lib/types"

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchListing() {
      const supabase = createClient()
      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("id", params.id)
        .single()

      if (data) setListing(data)
      setLoading(false)
    }

    fetchListing()
  }, [params.id])

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this listing?")) return

    setDeleting(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", params.id)

    if (error) {
      toast.error("Failed to delete listing")
      setDeleting(false)
      return
    }

    toast.success("Listing deleted")
    router.push("/farmer/listings")
  }

  async function markAsSold() {
    const supabase = createClient()
    const { error } = await supabase
      .from("listings")
      .update({ status: "sold" })
      .eq("id", params.id)

    if (error) {
      toast.error("Failed to update listing")
      return
    }

    toast.success("Listing marked as sold")
    setListing((prev) => (prev ? { ...prev, status: "sold" } : null))
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
          <Link href="/farmer/listings">Back to Listings</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Listing Details">
        <Button asChild variant="ghost" size="sm">
          <Link href="/farmer/listings">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <div className="space-y-4 p-4">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-4xl">
                  {listing.emoji}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {listing.product}
                  </h2>
                  <StatusBadge status={listing.status} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="text-lg font-semibold text-foreground">
                    {listing.quantity} kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price per kg</p>
                  <p className="text-lg font-semibold text-primary">
                    ETB {listing.price_per_kg}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-lg font-semibold text-foreground">
                    ETB {(listing.quantity * listing.price_per_kg).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available From</p>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(listing.available_from).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {listing.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-foreground">{listing.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {listing.status === "active" && (
          <div className="flex gap-3">
            <Button onClick={markAsSold} variant="outline" className="flex-1">
              Mark as Sold
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
