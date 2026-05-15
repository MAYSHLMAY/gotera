"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Package, Search } from "lucide-react"
import type { Listing } from "@/lib/types"
import { PRODUCTS } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    async function fetchListings() {
      const supabase = createClient()

      const { data } = await supabase
        .from("listings")
        .select("*, farmer:profiles!listings_farmer_id_fkey(*)")
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (data) setListings(data)
      setLoading(false)
    }

    fetchListings()
  }, [])

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.product
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesCategory = selectedCategory
      ? listing.product === selectedCategory
      : true
    return matchesSearch && matchesCategory
  })

  const categories = PRODUCTS.filter((p) =>
    listings.some((l) => l.product === p.name)
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Marketplace" subtitle="Browse fresh produce" />

      <div className="p-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search produce..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  selectedCategory === cat.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Listings */}
        {filteredListings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                No Produce Found
              </h3>
              <p className="text-muted-foreground">
                {search
                  ? "Try a different search term"
                  : "Check back later for new listings"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredListings.map((listing) => (
              <Link key={listing.id} href={`/buyer/marketplace/${listing.id}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                      {listing.emoji}
                    </div>
                    <p className="font-semibold text-foreground">
                      {listing.product}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {listing.quantity} kg available
                    </p>
                    <p className="text-sm font-medium text-primary">
                      ETB {listing.price_per_kg}/kg
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {listing.farmer?.name} - {listing.farmer?.location}
                    </p>
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
