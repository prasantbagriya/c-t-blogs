import React, { Suspense, useEffect, useRef, useState } from 'react';
import Navbar from "@/src/theme_migration/components/navbar"
import Hero from "@/src/theme_migration/components/hero"
import PageWrapper from "@/src/theme_migration/components/page-wrapper"
import SEO from "@/src/theme_migration/components/seo"

// Lazy loaded below-the-fold components
const BrandScroll = React.lazy(() => import("@/src/theme_migration/components/brand-scroll"));
const HowWeWork = React.lazy(() => import("@/src/theme_migration/components/how-we-work"));
const InnovativeServices = React.lazy(() => import("@/src/theme_migration/components/innovative-services"));
const Testimonials = React.lazy(() => import("@/src/theme_migration/components/testimonials"));
const FAQ = React.lazy(() => import("@/src/theme_migration/components/faq"));
const ROICalculatorHome = React.lazy(() => import("@/src/theme_migration/components/roi-calculator-home"));
const ServiceGridHome = React.lazy(() => import("@/src/theme_migration/components/service-grid-home"));
const AnimatedFooter = React.lazy(() => import("@/src/theme_migration/components/animated-footer"));
const Pricing = React.lazy(() => import("@/src/theme_migration/components/pricing"));

// Lazy load heavy background animations
const MouseMoveEffect = React.lazy(() => import("@/src/theme_migration/components/mouse-move-effect"));

const Loader = () => <div className="h-24 w-full flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-indigo-500/30 border-t-indigo-600 animate-spin" /></div>;

function DeferredSection({
  children,
  minHeight = 360,
  rootMargin = '900px',
}: {
  children: React.ReactNode;
  minHeight?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || shouldRender) return;

    if (!('IntersectionObserver' in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  return (
    <div ref={ref} style={!shouldRender ? { minHeight } : undefined}>
      {shouldRender ? <Suspense fallback={<Loader />}>{children}</Suspense> : null}
    </div>
  );
}

export default function Home({ onNavigate }: { onNavigate?: (page: string) => void }) {
  return (
    <PageWrapper>
      <SEO 
        title="ChatWizs - Advanced AI Automation & WhatsApp Tool Suite"
        description="Empower your business with ChatWizs. Advanced AI agents, WhatsApp marketing automation, and free utility tools to boost your customer engagement."
        keywords="AI Automation, WhatsApp Tools, Chatbot, WhatsApp Marketing, ChatWizs"
      />
      <div className="relative min-h-screen bg-transparent">
        <DeferredSection minHeight={0} rootMargin="0px">
          <MouseMoveEffect />
        </DeferredSection>

        <div className="relative z-10">
          <Navbar onNavigate={onNavigate} />
          <Hero onNavigate={onNavigate} />
          
          <DeferredSection minHeight={220}>
            <BrandScroll />
            <HowWeWork />
          </DeferredSection>
          <DeferredSection minHeight={560}>
            <InnovativeServices />
          </DeferredSection>
          <DeferredSection minHeight={720}>
            <ROICalculatorHome />
            <Pricing onStart={() => onNavigate?.('auth')} />
          </DeferredSection>
          <DeferredSection minHeight={620}>
            <Testimonials />
            <ServiceGridHome onNavigate={onNavigate} />
            <FAQ />
            <AnimatedFooter onNavigate={onNavigate} />
          </DeferredSection>
        </div>
      </div>
    </PageWrapper>
  )
}

