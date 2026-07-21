"use client"

import React, { useEffect, useState } from "react"
import BackgroundPaths from "./background-paths"

interface PageWrapperProps {
  children: React.ReactNode
  showSpline?: boolean
}

export default function PageWrapper({ children, showSpline = true }: PageWrapperProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showSplineScene, setShowSplineScene] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const viewportHeight = window.innerHeight
      const progress = Math.min(scrollY / viewportHeight, 1)
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!showSpline) return;

    const reveal = () => setShowSplineScene(true);
    const idleId = window.setTimeout(reveal, 6000);
    window.addEventListener("pointermove", reveal, { once: true, passive: true });
    window.addEventListener("scroll", reveal, { once: true, passive: true });
    window.addEventListener("keydown", reveal, { once: true });

    return () => {
      window.clearTimeout(idleId);
      window.removeEventListener("pointermove", reveal);
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("keydown", reveal);
    };
  }, [showSpline]);

  const splineOpacity = 1 - scrollProgress

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BackgroundPaths />
      
      {/* Global Background Elements */}
      {showSpline && showSplineScene && (
        <div 
          className="fixed right-[-10%] top-0 w-[60%] h-screen pointer-events-none z-0 hidden lg:block"
          style={{ opacity: splineOpacity, visibility: 'visible' }}
        >
          <spline-viewer
            url="https://prod.spline.design/ZxKIijKh056svcM5/scene.splinecode"
            style={{ width: '100%', height: '100%' }}
          ></spline-viewer>
        </div>
      )}

      {/* Base Background Glows */}
      <div className="fixed inset-0 bg-black -z-10" />
      <div className="fixed inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 -z-10" />

      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
