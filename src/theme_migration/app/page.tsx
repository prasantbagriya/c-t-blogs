import Navbar from "@/src/theme_migration/components/navbar"
import Hero from "@/src/theme_migration/components/hero"
import BrandScroll from "@/src/theme_migration/components/brand-scroll"
import HowWeWork from "@/src/theme_migration/components/how-we-work"
import InnovativeServices from "@/src/theme_migration/components/innovative-services"
import Testimonials from "@/src/theme_migration/components/testimonials"
import FAQ from "@/src/theme_migration/components/faq"
import ROICalculatorHome from "@/src/theme_migration/components/roi-calculator-home"
import ServiceGridHome from "@/src/theme_migration/components/service-grid-home"
import AnimatedFooter from "@/src/theme_migration/components/animated-footer"
import BackgroundPaths from "@/src/theme_migration/components/background-paths"
import MouseMoveEffect from "@/src/theme_migration/components/mouse-move-effect"
import PageWrapper from "@/src/theme_migration/components/page-wrapper"
import Pricing from "@/src/theme_migration/components/pricing"
import SEO from "@/src/theme_migration/components/seo"

export default function Home({ onNavigate }: { onNavigate?: (page: string) => void }) {
  return (
    <PageWrapper>
      <SEO 
        title="ChatWizs - Advanced AI Automation & WhatsApp Tool Suite"
        description="Empower your business with ChatWizs. Advanced AI agents, WhatsApp marketing automation, and free utility tools to boost your customer engagement."
        keywords="AI Automation, WhatsApp Tools, Chatbot, WhatsApp Marketing, ChatWizs"
      />
      <div className="relative min-h-screen bg-transparent">
        <MouseMoveEffect />
        <BackgroundPaths />

        <div className="relative z-10">
          <Navbar onNavigate={onNavigate} />
          <Hero onNavigate={onNavigate} />
          <BrandScroll />
          <HowWeWork />
          <InnovativeServices />
          <ROICalculatorHome />
          <Pricing onStart={() => onNavigate?.('auth')} />
          <Testimonials />
          <ServiceGridHome onNavigate={onNavigate} />
          <FAQ />
          <AnimatedFooter onNavigate={onNavigate} />
        </div>
      </div>
    </PageWrapper>
  )
}
