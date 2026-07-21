import React, { useState, useRef } from "react"
import { motion, useSpring, useMotionValue } from "framer-motion"

const SpotlightCard = ({ children, className = "" }) => {
  const containerRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 20, stiffness: 150 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  const handleMouseMove = ({ clientX, clientY }) => {
    if (!containerRef.current) return
    const { left, top } = containerRef.current.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`group relative rounded-2xl border border-white/10 bg-zinc-900/40 p-1 overflow-hidden ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,255,255,0.15), transparent 40%)`,
        }}
      />
      <div className="relative rounded-xl bg-zinc-950/80 p-6 h-full">
        {children}
      </div>
    </div>
  )
}

export default SpotlightCard
