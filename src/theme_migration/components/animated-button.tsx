"use client"

import type * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/src/theme_migration/lib/utils"

interface AnimatedButtonProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "ghost" | "slim"
  size?: "default" | "sm" | "lg"
  onClick?: () => void
  type?: "button" | "submit"
  href?: string
  disabled?: boolean
  gradient?: string
}

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}

const sharedTransition = {
  type: "spring",
  stiffness: 200,
  damping: 15,
  duration: 0.2,
}

export default function AnimatedButton({
  children,
  className,
  variant = "default",
  size = "default",
  onClick,
  type = "button",
  href,
  disabled = false,
}: AnimatedButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    default: "px-6 py-2.5",
    lg: "px-8 py-3 text-lg",
  }

  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-white dark:text-black",
    outline: "border border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground dark:border-slate-200",
    ghost: "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
    slim: "bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 text-sm dark:bg-white dark:text-black",
  }

  const buttonContent = (
    <motion.div
      className={cn(
        "relative inline-block rounded-xl overflow-visible group",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      style={{ perspective: "600px" }}
      whileHover={disabled ? undefined : "hover"}
      initial="initial"
    >
      {/* Rainbow border on hover */}
      <motion.div
        className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity "
        style={{
          background: "linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)",
          backgroundSize: "400% 400%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      <motion.div
        className={cn(
          "relative z-10 rounded-xl  font-medium flex items-center justify-center",
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        variants={itemVariants}
        transition={sharedTransition}
        style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
      >
        {children}
      </motion.div>
      <motion.div
        className={cn(
          "absolute inset-0 z-10 rounded-xl  font-medium flex items-center justify-center",
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        variants={backVariants}
        transition={sharedTransition}
        style={{ transformStyle: "preserve-3d", transformOrigin: "center top", rotateX: 90 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )

  if (href) {
    return (
      <a href={href} className="inline-block">
        {buttonContent}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className="inline-block">
      {buttonContent}
    </button>
  )
}
