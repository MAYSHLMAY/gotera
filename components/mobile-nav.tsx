"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/lib/types"
import {
  Home,
  Package,
  ShoppingCart,
  Truck,
  User,
  Plus,
  LogOut,
} from "lucide-react"

interface MobileNavProps {
  role: UserRole
  onLogout: () => void
}

export function MobileNav({ role, onLogout }: MobileNavProps) {
  const pathname = usePathname()

  const farmerLinks = [
    { href: "/farmer", icon: Home, label: "Home" },
    { href: "/farmer/listings", icon: Package, label: "Listings" },
    { href: "/farmer/listings/new", icon: Plus, label: "New" },
    { href: "/farmer/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/farmer/profile", icon: User, label: "Profile" },
  ]

  const buyerLinks = [
    { href: "/buyer", icon: Home, label: "Home" },
    { href: "/buyer/marketplace", icon: Package, label: "Market" },
    { href: "/buyer/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/buyer/profile", icon: User, label: "Profile" },
  ]

  const transportLinks = [
    { href: "/transport", icon: Home, label: "Home" },
    { href: "/transport/jobs", icon: Truck, label: "Jobs" },
    { href: "/transport/active", icon: Package, label: "Active" },
    { href: "/transport/profile", icon: User, label: "Profile" },
  ]

  const links =
    role === "farmer"
      ? farmerLinks
      : role === "buyer"
        ? buyerLinks
        : transportLinks

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span>{link.label}</span>
            </Link>
          )
        })}
        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  )
}
