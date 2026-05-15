"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { Plus, Package } from "lucide-react"
import type { Listing } from "@/lib/types"

export default function FarmerListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchListings() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("farmer_id", user.id)
        .order("created_at", { ascending: false })

      if (data) setListings(data)
      setLoading(false)
    }

    fetchListings()
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
      <PageHeader title="My Listings" subtitle="Manage your produce listings">
        <Button asChild size="sm">
          <Link href="/farmer/listings/new">
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Link>
        </Button>
      </PageHeader>

      <div className="p-4">
        {listings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                No Listings Yet
              </h3>
              <p className="mb-6 text-muted-foreground">
                Start selling by adding your first produce listing
              </p>
              <Button asChild>
                <Link href="/farmer/listings/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Listing
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/farmer/listings/${listing.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                          {listing.emoji}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {listing.product}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {listing.quantity} kg available
                          </p>
                          <p className="text-sm font-medium text-primary">
                            ETB {listing.price_per_kg}/kg
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={listing.status} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
