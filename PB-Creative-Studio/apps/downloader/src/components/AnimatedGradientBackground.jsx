"use client"

import { motion } from "framer-motion"
import React, { useEffect, useRef } from "react"

/**
 * AnimatedGradientBackground
 *
 * A sophisticated radial gradient background with a breathing animation.
 * Ported from user-provided reference.
 */
const AnimatedGradientBackground = ({
  startingGap = 125,
  Breathing = true, // Enabled by default for better impact
  gradientColors = ["#050505", "#0F0B05", "#1F1505", "#2D1D05", "#3D2505", "#0F0B05", "#050505"],
  gradientStops = [35, 50, 60, 70, 80, 90, 100],
  animationSpeed = 0.05, // Slightly faster for more life
  breathingRange = 10,
  containerStyle = {},
  topOffset = 0,
  containerClassName = "",
}) => {
  // Validation: Ensure gradientStops and gradientColors lengths match
  if (gradientColors.length !== gradientStops.length) {
    throw new Error(
      `GradientColors and GradientStops must have the same length.
     Received gradientColors length: ${gradientColors.length},
     gradientStops length: ${gradientStops.length}`,
    )
  }

  const containerRef = useRef(null)

  useEffect(() => {
    let animationFrame
    let width = startingGap
    let directionWidth = 1

    const animateGradient = () => {
      if (width >= startingGap + breathingRange) directionWidth = -1
      if (width <= startingGap - breathingRange) directionWidth = 1

      if (!Breathing) directionWidth = 0
      width += directionWidth * animationSpeed

      const gradientStopsString = gradientStops.map((stop, index) => `${gradientColors[index]} ${stop}%`).join(", ")

      const gradient = `radial-gradient(${width}% ${width + topOffset}% at 50% 20%, ${gradientStopsString})`

      if (containerRef.current) {
        containerRef.current.style.background = gradient
      }

      animationFrame = requestAnimationFrame(animateGradient)
    }

    animationFrame = requestAnimationFrame(animateGradient)

    return () => cancelAnimationFrame(animationFrame) // Cleanup animation
  }, [startingGap, Breathing, gradientColors, gradientStops, animationSpeed, breathingRange, topOffset])

  return (
    <motion.div
      key="animated-gradient-background"
      initial={{
        opacity: 0,
        scale: 1.1,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          duration: 2,
          ease: [0.25, 0.1, 0.25, 1], // Cubic bezier easing
        },
      }}
      className={`fixed inset-0 overflow-hidden pointer-events-none -z-10 ${containerClassName}`}
    >
      <div ref={containerRef} style={containerStyle} className="absolute inset-0 transition-transform" />
    </motion.div>
  )
}

export default AnimatedGradientBackground
