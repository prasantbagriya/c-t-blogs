"use client"

import { useEffect, useState } from "react"

export default function MouseMoveEffect() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());

    if (checkMobile()) return;

    let ticking = false;
    const handleMouseMove = (event: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setMousePosition({ x: event.clientX, y: event.clientY });
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  if (isMobile) return null; // No mouse effect on touch devices

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      style={{
        background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.05), transparent 80%)`,
      }}
    />
  )
}
