"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sprout, Eye, EyeOff, Loader2, Tractor, Store, Truck } from "lucide-react"
import { toast } from "sonner"
import type { UserRole } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ETHIOPIAN_REGIONS, BUSINESS_TYPES } from "@/lib/types"

const roles: { value: UserRole; label: string; icon: typeof Tractor; description: string }[] = [
  {
    value: "farmer",
    label: "Farmer",
    icon: Tractor,
    description: "Sell your produce",
  },
  {
    value: "buyer",
    label: "Buyer",
    icon: Store,
    description: "Buy fresh produce",
  },
  {
    value: "transport",
    label: "Transport",
    icon: Truck,
    description: "Deliver orders",
  },
]

// Convert phone to email format for Supabase
function phoneToEmail(phone: string): string {
  // Remove all non-numeric characters and ensure it starts with country code
  const cleaned = phone.replace(/\D/g, "")
  return `${cleaned}@gotera.et`
}

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("") // Optional, only for buyers
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRole) return

    setIsLoading(true)
    const supabase = createClient()

    const authEmail = phoneToEmail(phone)

    const registerRes = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: authEmail,
        password,
        name,
        phone,
        role: selectedRole,
        location,
        businessName,
        businessType,
        contactEmail: email || undefined,
      }),
    })

    const registerData = await registerRes.json()

    if (!registerRes.ok) {
      toast.error(registerData.error || "Failed to create account")
      setIsLoading(false)
      return
    }

    // Immediately sign in after signup (no email verification needed)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    })

    if (signInError) {
      console.error("[v0] Auto sign-in error:", signInError)
      toast.error("Account created! Please sign in manually.")
      router.push("/auth/login")
      setIsLoading(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error("Account created! Please sign in manually.")
      router.push("/auth/login")
      setIsLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || !profile?.role) {
      console.error("Profile fetch error:", profileError)
      toast.error("Account created but could not load your profile. Please sign in.")
      router.push("/auth/login")
      setIsLoading(false)
      return
    }

    toast.success("Welcome to Gotera!")
    router.push(`/${profile.role}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 flex-col items-center px-4 py-8">
        <Link href="/" className="mb-6 flex items-center gap-2 text-primary">
          <Sprout className="h-8 w-8" />
          <span className="text-2xl font-bold">Gotera</span>
        </Link>

        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-1 pb-4 text-center">
            <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
            <p className="text-sm text-muted-foreground">
              {step === 1 ? "Choose your role" : "Your details"}
            </p>
            {/* Progress indicator */}
            <div className="flex justify-center gap-2 pt-2">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-2 w-12 rounded-full transition-colors",
                    s <= step ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <div className="space-y-3">
                  {roles.map((role) => {
                    const Icon = role.icon
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => {
                          setSelectedRole(role.value)
                          setStep(2)
                        }}
                        className={cn(
                          "flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors",
                          selectedRole === role.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{role.label}</h3>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+251 9XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be your login identifier
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        minLength={6}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      At least 6 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location/Region</Label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your region" />
                      </SelectTrigger>
                      <SelectContent>
                        {ETHIOPIAN_REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Email field - only for buyers, optional */}
                  {selectedRole === "buyer" && (
                    <div className="space-y-2">
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        For order receipts and updates
                      </p>
                    </div>
                  )}

                  {selectedRole === "buyer" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          placeholder="Your business name"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type</Label>
                        <Select value={businessType} onValueChange={setBusinessType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            {BUSINESS_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading || !name || !phone || password.length < 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
