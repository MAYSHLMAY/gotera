"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Truck, MapPin, Calendar } from "lucide-react"
import type { Order } from "@/lib/types"

export default function TransportJobs() {
  const [jobs, setJobs] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      const supabase = createClient()

      const { data } = await supabase
        .from("orders")
        .select("*, buyer:profiles!orders_buyer_id_fkey(*), farmer:profiles!orders_farmer_id_fkey(*), listing:listings(*)")
        .eq("status", "confirmed")
        .is("driver_id", null)
        .order("delivery_date", { ascending: true })

      if (data) setJobs(data)
      setLoading(false)
    }

    fetchJobs()
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
      <PageHeader title="Available Jobs" subtitle="Find delivery jobs near you" />

      <div className="p-4">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Truck className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                No Jobs Available
              </h3>
              <p className="text-muted-foreground">
                Check back later for new delivery opportunities
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Link key={job.id} href={`/transport/jobs/${job.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                          {job.listing?.emoji}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {job.listing?.product}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {job.quantity} kg
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-primary">
                        <Calendar className="h-4 w-4" />
                        {new Date(job.delivery_date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-3 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <p className="text-muted-foreground">
                            Pickup: <span className="text-foreground">{job.farmer?.location || "TBD"}</span>
                          </p>
                          <p className="text-muted-foreground">
                            Delivery: <span className="text-foreground">{job.delivery_address}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Buyer: {job.buyer?.business_name || job.buyer?.name}
                      </p>
                      <p className="font-semibold text-primary">
                        ETB {job.total_price.toLocaleString()}
                      </p>
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
