"use client"

import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusStyles: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  sold: "bg-muted text-muted-foreground",
  expired: "bg-destructive/10 text-destructive",
  pending: "bg-accent/50 text-accent-foreground",
  confirmed: "bg-primary/10 text-primary",
  declined: "bg-destructive/10 text-destructive",
  "in-transit": "bg-blue-100 text-blue-700",
  delivered: "bg-primary/20 text-primary",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[status] || "bg-muted text-muted-foreground",
        className
      )}
    >
      {status.replace("-", " ")}
    </span>
  )
}
