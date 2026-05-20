import Navbar from "@/src/theme_migration/components/navbar"
import AnimatedFooter from "@/src/theme_migration/components/animated-footer"
import ArtistsPage from "@/src/theme_migration/components/artists-page"
import PageWrapper from "@/src/theme_migration/components/page-wrapper"

export default function Artists({ onNavigate }: { onNavigate?: (page: string) => void }) {
  return (
    <PageWrapper>
      <div className="relative z-10">
        <Navbar onNavigate={onNavigate} />
        <ArtistsPage onNavigate={onNavigate} />
        <AnimatedFooter onNavigate={onNavigate} />
      </div>
    </PageWrapper>
  )
}
