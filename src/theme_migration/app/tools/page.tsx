"use client"

import { useEffect } from "react"
import Navbar from "@/src/theme_migration/components/navbar"
import AnimatedFooter from "@/src/theme_migration/components/animated-footer"
import FreeTools from "@/src/theme_migration/components/free-tools"
import PageWrapper from "@/src/theme_migration/components/page-wrapper"

export default function PublicTools({ onNavigate }: { onNavigate?: (page: string) => void }) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <PageWrapper>
      <div className="relative z-10">
        <Navbar onNavigate={onNavigate} />
        <FreeTools onNavigate={onNavigate} />
        <AnimatedFooter onNavigate={onNavigate} />
      </div>
    </PageWrapper>
  )
}
