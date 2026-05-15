"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, User, Phone, Calendar, Package, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Order, Profile, Listing } from "@/lib/types"

type OrderWithRelations = Order & {
  buyer: Profile
  farmer: Profile
  listing: Listing
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<OrderWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    async function fetchJob() {
      const supabase = createClient()
      const { data } = await supabase
        .from("orders")
        .select("*, buyer:profiles!orders_buyer_id_fkey(*), farmer:profiles!orders_farmer_id_fkey(*), listing:listings(*)")
        .eq("id", params.id)
        .single()

      if (data) setJob(data as OrderWithRelations)
      setLoading(false)
    }

    fetchJob()
  }, [params.id])

  async function handleAcceptJob() {
    if (!job) return

    setAccepting(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Please log in")
      setAccepting(false)
      return
    }

    const { error } = await supabase
      .from("orders")
      .update({
        driver_id: user.id,
        status: "in-transit",
      })
      .eq("id", job.id)
      .eq("status", "confirmed")
      .is("driver_id", null)

    if (error) {
      toast.error("Failed to accept job. It may have been taken.")
      setAccepting(false)
      return
    }

    toast.success("Job accepted! Start your delivery.")
    router.push("/transport/active")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Job not found</p>
        <Button asChild className="mt-4">
          <Link href="/transport/jobs">Back to Jobs</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Job Details">
        <Button asChild variant="ghost" size="sm">
          <Link href="/transport/jobs">
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
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-4xl">
                {job.listing?.emoji}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {job.listing?.product}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {job.quantity} kg
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Delivery Date</p>
                  <p className="font-medium text-foreground">
                    {new Date(job.delivery_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Order Value</p>
                  <p className="font-medium text-foreground">
                    ETB {job.total_price.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Route */}
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 font-semibold text-foreground">Route</h3>
            <div className="relative pl-6">
              <div className="absolute left-2 top-2 h-[calc(100%-16px)] w-0.5 bg-primary/30" />
              
              <div className="relative mb-6">
                <div className="absolute -left-4 top-1 h-3 w-3 rounded-full bg-primary" />
                <p className="text-xs text-muted-foreground">Pickup from</p>
                <p className="font-medium text-foreground">{job.farmer?.name}</p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {job.farmer?.location || "Location TBD"}
                </p>
                {job.farmer?.phone && (
                  <p className="flex items-center gap-1 text-sm text-primary">
                    <Phone className="h-3 w-3" />
                    {job.farmer.phone}
                  </p>
                )}
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-1 h-3 w-3 rounded-full border-2 border-primary bg-white" />
                <p className="text-xs text-muted-foreground">Deliver to</p>
                <p className="font-medium text-foreground">
                  {job.buyer?.business_name || job.buyer?.name}
                </p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {job.delivery_address}
                </p>
                {job.buyer?.phone && (
                  <p className="flex items-center gap-1 text-sm text-primary">
                    <Phone className="h-3 w-3" />
                    {job.buyer.phone}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Note */}
        {job.note && (
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 font-semibold text-foreground">
                Delivery Note
              </h3>
              <p className="text-muted-foreground">{job.note}</p>
            </CardContent>
          </Card>
        )}

        {/* Accept Button */}
        {job.status === "confirmed" && !job.driver_id && (
          <Button
            onClick={handleAcceptJob}
            className="w-full"
            size="lg"
            disabled={accepting}
          >
            {accepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              "Accept This Job"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
