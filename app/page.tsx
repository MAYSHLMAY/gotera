import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sprout, Store, Truck, ArrowRight, Check } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-primary px-4 pb-16 pt-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-4 -top-4 h-32 w-32 rounded-full bg-white" />
          <div className="absolute -right-8 top-20 h-48 w-48 rounded-full bg-white" />
          <div className="absolute bottom-10 left-1/2 h-24 w-24 rounded-full bg-white" />
        </div>

        <div className="relative">
          <div className="mb-8 flex items-center gap-2">
            <Sprout className="h-8 w-8 text-primary-foreground" />
            <span className="text-2xl font-bold text-primary-foreground">
              Gotera
            </span>
          </div>

          <h1 className="mb-4 text-balance text-3xl font-bold leading-tight text-primary-foreground">
            Fresh From Ethiopian Farms to Your Business
          </h1>
          <p className="mb-8 text-pretty text-lg text-primary-foreground/90">
            Connect directly with local farmers. Get fresh produce at fair
            prices with reliable delivery.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              asChild
              size="lg"
              className="w-full bg-white text-primary hover:bg-white/90"
            >
              <Link href="/auth/signup">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* How It Works */}
      <section className="px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
          How Gotera Works
        </h2>

        <div className="space-y-4">
          <Card>
            <CardContent className="flex items-start gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sprout className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">For Farmers</h3>
                <p className="text-sm text-muted-foreground">
                  List your produce, set fair prices, and sell directly to
                  businesses. No middlemen.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/30">
                <Store className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">For Buyers</h3>
                <p className="text-sm text-muted-foreground">
                  Browse fresh produce from verified farmers. Order in bulk with
                  scheduled delivery.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary">
                <Truck className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">For Transport</h3>
                <p className="text-sm text-muted-foreground">
                  Find delivery jobs, earn money, and help connect farms to
                  businesses.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-secondary/50 px-4 py-12">
        <h2 className="mb-6 text-xl font-bold text-foreground">
          Why Choose Gotera?
        </h2>
        <ul className="space-y-4">
          {[
            "Direct farm-to-business connection",
            "Fair prices for farmers and buyers",
            "Fresh produce, guaranteed quality",
            "Reliable delivery tracking",
            "Support local Ethiopian agriculture",
          ].map((benefit) => (
            <li key={benefit} className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="px-4 py-12">
        <Card className="overflow-hidden">
          <CardContent className="bg-primary p-6 text-center">
            <h2 className="mb-2 text-xl font-bold text-primary-foreground">
              Ready to Get Started?
            </h2>
            <p className="mb-6 text-sm text-primary-foreground/90">
              Join thousands of farmers and businesses on Gotera
            </p>
            <Button
              asChild
              size="lg"
              className="w-full bg-white text-primary hover:bg-white/90"
            >
              <Link href="/auth/signup">Create Your Account</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card px-4 py-6">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sprout className="h-4 w-4" />
          <span>Gotera - Ethiopian Farm Marketplace</span>
        </div>
      </footer>
    </div>
  )
}
