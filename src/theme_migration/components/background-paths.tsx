"use client"

import React, { useEffect, useState } from "react"

export default function BackgroundPaths() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(true)

  useEffect(() => {
    // Disable heavy background on mobile devices initially
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());

    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener("resize", handleResize);

    if (checkMobile()) {
      return () => window.removeEventListener("resize", handleResize);
    }

    // Use requestAnimationFrame for smooth scrolling on desktop without blocking main thread
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const viewportHeight = window.innerHeight;
          const progress = Math.min(scrollY / viewportHeight, 1);
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    }
  }, [])

  if (isMobile) return null; // Save CPU on mobile completely

  const linesOpacity = 0.6 - scrollProgress * 0.4
  const linesScale = 1 + scrollProgress * 0.1

  return (
    <div
      className="fixed inset-0 z-0 w-screen h-screen pointer-events-none "
      style={{
        opacity: linesOpacity,
        transform: `scale(${linesScale})`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes line-race {
          from { stroke-dashoffset: 0px; }
          to { stroke-dashoffset: -3000px; }
        }
        .animate-line-race-1 { animation: line-race 1.6s ease-in-out infinite; }
        .animate-line-race-2 { animation: line-race 1.2s ease-in-out infinite; }
        .animate-line-race-3 { animation: line-race 2s ease-in-out infinite; }
        .animate-line-race-4 { animation: line-race 1s ease-in-out infinite; }
      `}} />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 2269 2108"
        fill="none"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Animated Purple Lines */}
        <path
          d="M510.086 0.543457L507.556 840.047C506.058 1337.18 318.091 1803.4 1.875 2094.29"
          stroke="#4F46E5"
          strokeWidth="3"
          strokeMiterlimit="10"
          strokeDasharray="100px 99999px"
          className="animate-line-race-1 opacity-60"
        />
        <path
          d="M929.828 0.543457L927.328 829.877C925.809 1334 737.028 1807.4 418.435 2106"
          stroke="#7C3AED"
          strokeWidth="3"
          strokeMiterlimit="10"
          strokeDasharray="100px 99999px"
          className="animate-line-race-2 opacity-60"
        />
        <path
          d="M1341.9 0.543457L1344.4 829.876C1345.92 1334 1534.7 1807.4 1853.29 2106"
          stroke="#4F46E5"
          strokeWidth="3"
          strokeMiterlimit="10"
          strokeDasharray="100px 99999px"
          className="animate-line-race-3 opacity-60"
        />
        <path
          d="M1758.96 0.543457L1761.49 840.047C1762.99 1337.18 1950.96 1803.4 2267.17 2094.29"
          stroke="#7C3AED"
          strokeWidth="3"
          strokeMiterlimit="10"
          strokeDasharray="100px 99999px"
          className="animate-line-race-4 opacity-60"
        />

        {/* Static White Background Lines */}
        <path opacity="0.1" d="M929.828 0.543457L927.328 829.877C925.809 1334 737.028 1807.4 418.435 2106" stroke="white" strokeWidth="1" />
        <path opacity="0.1" d="M510.086 0.543457L507.556 840.047C506.058 1337.18 318.091 1803.4 1.875 2094.29" stroke="white" strokeWidth="1" />
        <path opacity="0.1" d="M1758.96 0.543457L1761.49 840.047C1762.99 1337.18 1950.96 1803.4 2267.17 2094.29" stroke="white" strokeWidth="1" />
        <path opacity="0.1" d="M1341.9 0.543457L1344.4 829.876C1345.92 1334 1534.7 1807.4 1853.29 2106" stroke="white" strokeWidth="1" />
      </svg>
    </div>
  )
}
