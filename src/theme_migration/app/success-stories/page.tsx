import BackgroundStripes from "@/src/theme_migration/components/background-stripes"
import AnimatedBackground from "@/src/theme_migration/components/animated-background"
import Navbar from "@/src/theme_migration/components/navbar"
import AnimatedFooter from "@/src/theme_migration/components/animated-footer"
import SuccessStories from "@/src/theme_migration/components/success-stories"

export default function SuccessStoriesPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  return (
    <div className="relative min-h-screen bg-black">
      <AnimatedBackground />
      <BackgroundStripes />

      <div className="relative z-10">
        <Navbar onNavigate={onNavigate} />
        <SuccessStories isPage={true} />
        <AnimatedFooter onNavigate={onNavigate} />
      </div>
    </div>
  )
}
