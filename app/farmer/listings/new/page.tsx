"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { PRODUCTS } from "@/lib/types"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function NewListingPage() {
  const router = useRouter()
  const [product, setProduct] = useState("")
  const [quantity, setQuantity] = useState("")
  const [pricePerKg, setPricePerKg] = useState("")
  const [availableFrom, setAvailableFrom] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const selectedProduct = PRODUCTS.find((p) => p.name === product)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProduct) return

    setIsLoading(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Please log in to create a listing")
      setIsLoading(false)
      return
    }

    const { error } = await supabase.from("listings").insert({
      farmer_id: user.id,
      product: selectedProduct.name,
      emoji: selectedProduct.emoji,
      quantity: parseFloat(quantity),
      price_per_kg: parseFloat(pricePerKg),
      available_from: availableFrom,
      notes: notes || null,
    })

    if (error) {
      toast.error("Failed to create listing")
      console.error(error)
      setIsLoading(false)
      return
    }

    toast.success("Listing created successfully!")
    router.push("/farmer/listings")
  }

  return (
    <div>
      <PageHeader title="New Listing" subtitle="Add produce to sell">
        <Button asChild variant="ghost" size="sm">
          <Link href="/farmer/listings">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
      </PageHeader>

      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Selection */}
              <div className="space-y-2">
                <Label>Select Product</Label>
                <div className="grid grid-cols-4 gap-2">
                  {PRODUCTS.slice(0, 12).map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setProduct(p.name)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors",
                        product === p.name
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-2xl">{p.emoji}</span>
                      <span className="text-xs text-foreground">{p.name}</span>
                    </button>
                  ))}
                </div>
                {PRODUCTS.length > 12 && (
                  <Select value={product} onValueChange={setProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Or select from all products..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCTS.map((p) => (
                        <SelectItem key={p.name} value={p.name}>
                          {p.emoji} {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (kg)</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="e.g., 500"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min="1"
                  step="0.1"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Price per kg (ETB)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 45"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                  required
                  min="1"
                  step="0.5"
                />
              </div>

              {/* Available From */}
              <div className="space-y-2">
                <Label htmlFor="availableFrom">Available From</Label>
                <Input
                  id="availableFrom"
                  type="date"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional details about your produce..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Summary */}
              {product && quantity && pricePerKg && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="mb-2 font-medium text-foreground">Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        Product:{" "}
                        <span className="text-foreground">
                          {selectedProduct?.emoji} {product}
                        </span>
                      </p>
                      <p className="text-muted-foreground">
                        Quantity:{" "}
                        <span className="text-foreground">{quantity} kg</span>
                      </p>
                      <p className="text-muted-foreground">
                        Price:{" "}
                        <span className="text-foreground">
                          ETB {pricePerKg}/kg
                        </span>
                      </p>
                      <p className="font-medium text-primary">
                        Total Value: ETB{" "}
                        {(parseFloat(quantity) * parseFloat(pricePerKg)).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !product || !quantity || !pricePerKg || !availableFrom}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Listing"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
