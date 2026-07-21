"use client"

import type React from "react"
import { Button } from "@/src/theme_migration/components/ui/button"
import { cn } from "@/src/theme_migration/lib/utils"

interface GlowButtonProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
}

export default function GlowButton({
  children,
  className,
  variant = "default",
  size = "default",
  onClick,
  type = "button",
  disabled = false,
}: GlowButtonProps) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg blur opacity-0 group-hover:opacity-75 group-hover:" />
      <Button
        type={type}
        variant={variant}
        size={size}
        className={cn(
          "relative bg-blue-600 hover:bg-blue-700 text-white border-0  ",
          className,
        )}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </Button>
    </div>
  )
}
