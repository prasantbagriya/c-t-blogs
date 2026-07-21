import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useSpring, useTransform, AnimatePresence, useMotionValue } from 'framer-motion'
import { 
  Rocket, Download, Globe, ArrowRight, Shield, Zap, Star, 
  Code, Cpu, Layers, GraduationCap, Menu, X, Terminal,
  Server, Smartphone, Search, Database, Fingerprint,
  Activity, Command, MousePointer2, Box, Sparkles, Mail,
  Send, Lock, FileText, ExternalLink, Quote, ChevronDown
} from 'lucide-react'

// ── DEVELOPMENT PATH HELPER ──────────────────────────────────────────────────
const getDevPath = (path) => {
  if (import.meta.env && import.meta.env.DEV) {
    if (path.startsWith('/youtubevideodownload')) return `http://localhost:5173${path}`
    if (path.startsWith('/tool')) return `http://localhost:5175${path}`
    if (path.startsWith('/portal')) return `http://localhost:5176${path}`
  }
  return path
}

// ── CUSTOM CURSOR COMPONENT ───────────────────────────────────────────────
const CustomCursor = () => {
  const MainRef = useRef(null)
  const InnerRef = useRef(null)

  useEffect(() => {
    const moveCursor = (e) => {
      if (MainRef.current && InnerRef.current) {
        MainRef.current.style.transform = `translate3d(${e.clientX - 22}px, ${e.clientY - 22}px, 0)`
        InnerRef.current.style.transform = `translate3d(${e.clientX - 5}px, ${e.clientY - 5}px, 0)`
      }
    }
    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [])

  return (
    <>
      <div ref={MainRef} className="glow-cursor hidden md:block" />
      <div ref={InnerRef} className="glow-cursor-inner hidden md:block" />
    </>
  )
}

// ── MOUSE-FOLLOW AURA ORB ──────────────────────────────────────────────────
const AuraOrb = () => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 })

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    // FIX: Added { passive: true } — tells browser this handler won't prevent scroll
    // FIX: Added cleanup return — removes listener when component unmounts (memory leak fix)
    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    <motion.div 
      style={{ left: springX, top: springY, x: '-50%', y: '-50%' }}
      className="fixed w-[700px] h-[700px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none z-[-1]"
    />
  )
}

// ── TESTIMONIAL MARQUEE ──────────────────────────────────────────────────
const TestimonialMarquee = () => {
  const testimonials = [
    { name: "Arjun V.", role: "Lead Architect", text: "chatwizs studio transformed our exam infrastructure. The multi-tenant logic is flawless." },
    { name: "Sarah K.", role: "Backend Engineer", text: "The Solar Extractor is a masterpiece of media engineering. Fast and precise." },
    { name: "Vikram R.", role: "Product Manager", text: "Engineering elegance redefined. The UI feels like it's from the future." },
    { name: "Elena D.", role: "UI Designer", text: "The attention to detail in the Indigo Engine is unmatched. Pure digital art." },
    { name: "David M.", role: "Security Officer", text: "Robust security protocols. chatwizs studio is our go-to for sensitive architectures." }
  ]

  return (
    <div className="py-16 overflow-hidden border-y border-white/5 relative z-10 bg-black/20">
      <div className="flex animate-marquee-rtl gap-10 items-center">
        {[...testimonials, ...testimonials].map((t, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass-card-neon p-10 w-[400px] shrink-0 relative group"
          >
            <Quote className="absolute top-8 right-8 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors" size={48} />
            <div className="flex gap-1.5 mb-8">
              {[1,2,3,4,5].map(s => <Star key={s} size={14} className="fill-indigo-500 text-indigo-500" />)}
            </div>
            <p className="text-white/70 text-lg font-medium leading-relaxed mb-8 italic">"{t.text}"</p>
            <div className="flex flex-col">
              <p className="text-sm font-black uppercase tracking-[0.2em] leading-none text-white">{t.name}</p>
              <p className="text-[10px] text-indigo-400 font-bold mt-2 uppercase tracking-[0.3em] opacity-80">{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const ProductShowcase = () => {
  const products = [
    { 
      title: 'EduExam Pro', 
      desc: 'Advanced Examination Management System for institutes. Automated builders, class analytics, and secure portals.',
      path: getDevPath('/portal/'), 
      icon: <GraduationCap size={32} />,
      tags: ['Security', 'Analytics', 'Automated']
    },
    { 
      title: 'Solar Extractor', 
      desc: 'High-fidelity YouTube video & audio downloader. Direct extraction with peak performance headers.',
      path: getDevPath('/youtubevideodownload/'), 
      icon: <Download size={32} />,
      tags: ['Media', 'Direct', 'Fast']
    },
    { 
      title: 'DevForge Kit', 
      desc: 'Financial & Developer utility node containing SIP Forecaster, Compound Interest Simulator, and Prop Firm Evaluator.',
      path: getDevPath('/tool/'), 
      icon: <Command size={32} />,
      tags: ['Financial', 'DevTools', 'Essential']
    },
  ]

  return (
    <section id="products" className="py-12 md:py-24 px-6 max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-10">
        <span className="section-label-premium">Operational Node</span>
        <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic mb-6 text-premium-gradient text-glow-sharp">Product Suite</h2>
        <p className="text-white/50 text-xl font-medium tracking-wide">Architecting high-fidelity solutions for the modern digital landscape.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((p, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -15 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-indigo-600/20 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="glass-card-neon p-12 h-full flex flex-col justify-between relative z-10 overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 group-hover:bg-indigo-600/10 transition-colors rounded-full blur-3xl -mr-10 -mt-10" />
               
               <div>
                 <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 mb-8 shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                   {p.icon}
                 </div>
                 <h4 className="text-2xl font-black uppercase tracking-wider text-white mb-4">{p.title}</h4>
                 <p className="text-white/60 text-sm leading-relaxed mb-8">{p.desc}</p>
                 <div className="flex flex-wrap gap-2 mb-10">
                   {p.tags.map(tag => (
                     <span key={tag} className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">{tag}</span>
                   ))}
                 </div>
               </div>

               <a 
                 href={p.path} 
                 className="flex items-center justify-between group/btn px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all font-black uppercase tracking-[0.2em] text-[10px]"
               >
                 Launch Platform <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
               </a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ── SUB-PAGE COMPONENTS ──────────────────────────────────────────────────
const LegalLayout = ({ title, children }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-32 pb-24 px-6 max-w-4xl mx-auto relative z-10">
    <h2 className="text-6xl font-black mb-16 tracking-tighter uppercase italic text-indigo-500 text-glow-sharp">{title}</h2>
    <div className="space-y-16 text-white/70 leading-relaxed font-medium text-xl">
      {children}
    </div>
  </motion.div>
)

const ContactView = () => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setLoading(true);
    try {
      await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          source: 'chatwizs studio Main Homepage',
          type: 'Direct Inquiry'
        })
      });
      setSent(true);
    } catch (_err) {
      // FIX: Do not expose error details to users — security best practice
      // Log to error monitoring service in production instead
      alert('Message could not be sent. Please email us directly at support@chatwizs.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-10 md:pt-32 pb-8 md:pb-24 px-6 max-w-6xl mx-auto relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 font-inter">
        <div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 md:mb-10 tracking-tighter uppercase italic leading-[0.9] text-glow-sharp">Initiate <br className="hidden md:block" /><span className="text-indigo-500">Contact</span>.</h2>
          <p className="text-white/50 text-base md:text-2xl font-medium mb-8 md:mb-16 leading-relaxed">Building something complex? Let's orchestrate the digital logic together.</p>
          <div className="space-y-10">
            <div className="flex items-center gap-8 group">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl">
                <Mail size={28} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Direct Inbox Access</p>
                <p className="text-xl font-bold text-white">support@chatwizs.com</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="glass-card-neon p-6 md:p-12 relative overflow-hidden">
          {sent ? (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-20 px-4">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-500 border border-indigo-500/30">
                <Send size={32} />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-white">Packet Sent.</h3>
              <p className="text-white/40 text-lg font-medium">Your inquiry has been synchronized with the Studio Hub. I will reach out shortly.</p>
            </motion.div>
          ) : (
            <form className="space-y-6 md:space-y-8 relative z-10" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Subject Identity</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5 focus:border-indigo-500 outline-none transition-all text-white font-bold text-sm md:text-base" 
                  placeholder="Full Name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Communication node</label>
                <input 
                  required
                  type="email" 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5 focus:border-indigo-500 outline-none transition-all text-white font-bold text-sm md:text-base" 
                  placeholder="Email Address" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Inquiry Essence</label>
                <textarea 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5 h-32 md:h-40 focus:border-indigo-500 outline-none transition-all text-white font-bold text-sm md:text-base" 
                  placeholder="Describe the mission..." 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="group w-full py-5 md:py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.3em] text-[11px] md:text-sm rounded-2xl flex items-center justify-center gap-4 shadow-2xl transition-all disabled:opacity-50"
              >
                {loading ? 'Transmitting...' : 'Submit Packet'} <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── MAGNETIC BUTTON ────────────────────────────────────────────────────────
const MagneticButton = ({ children, className, onClick }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { damping: 15, stiffness: 150 })
  const springY = useSpring(y, { damping: 15, stiffness: 150 })

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e
    const { left, top, width, height } = currentTarget.getBoundingClientRect()
    x.set((clientX - (left + width/2)) * 0.45)
    y.set((clientY - (top + height/2)) * 0.45)
  }

  return (
    <motion.button 
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  )
}

const App = () => {
  const [activeView, setActiveView] = useState('home')
  const [isProductsOpen, setIsProductsOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeView])

  const products = [
    { title: 'EduExam Pro', path: getDevPath('/portal/'), icon: <GraduationCap size={16} /> },
    { title: 'Solar Extractor', path: getDevPath('/youtubevideodownload/'), icon: <Download size={16} /> },
    { title: 'DevForge Kit', path: getDevPath('/tool/'), icon: <Command size={16} /> },
    { title: '▻ SIP Calculator', path: getDevPath('/tool/sip-calculator/'), icon: <Activity size={16} /> },
    { title: '▻ Compound Growth', path: getDevPath('/tool/compound-interest-calculator/'), icon: <Sparkles size={16} /> },
    { title: '▻ Prop Firm Evaluator', path: getDevPath('/tool/prop-firm/'), icon: <Terminal size={16} /> },
  ]

  return (
    <div className="min-h-screen relative font-inter text-white selection:bg-indigo-500/30 overflow-x-hidden bg-[#0a0b1a]">
      <CustomCursor />
      <AuraOrb />
      <div className="particles-overlay" />
      <motion.div className="scroll-line" style={{ scaleX }} />
      <div className="mesh-nebula" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 backdrop-blur-3xl bg-black/40">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveView('home')}>
            <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-600 text-white flex items-center justify-center font-black text-xl transition-all group-hover:rotate-12 shadow-xl shadow-indigo-600/30">P</div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter uppercase leading-none">chatwizs studio</span>
              <span className="text-[11px] text-indigo-400 font-bold tracking-[0.4em] uppercase mt-1">Indigo Hub</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setActiveView('home')} className="premium-link">Vision</button>
            <div className="relative" onMouseEnter={() => setIsProductsOpen(true)} onMouseLeave={() => setIsProductsOpen(false)}>
              <button className="flex items-center gap-2 premium-link">
                Products <ChevronDown size={14} className={`transition-transform duration-300 ${isProductsOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isProductsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-60 py-2 bg-zinc-900/90 border border-white/10 backdrop-blur-3xl rounded-2xl shadow-2xl"
                  >
                    {products.map(p => (
                      <a key={p.title} href={p.path} className="flex items-center gap-3 px-6 py-4 hover:bg-white/5 transition-colors group">
                        <div className="text-indigo-400 group-hover:scale-110 transition-transform">{p.icon}</div>
                        <span className="text-white group-hover:text-indigo-400 transition-colors uppercase tracking-[0.2em] text-[10px]">{p.title}</span>
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => setActiveView('contact')} className="premium-link">Inquiry</button>
          </div>

          <button className="md:hidden p-2 text-indigo-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </nav>

      <main>
        {activeView === 'home' && (
          <>
            {/* HERO SECTION */}
            <section className="min-h-screen flex flex-col items-center justify-start pt-32 pb-20 px-6 sm:px-10 relative overflow-hidden">
              {/* Background Orbs & Nebula */}
              <div style={{
                position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)',
                width: '80vw', height: '80vw', maxWidth: 800, maxHeight: 800,
                borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0
              }} />
              
              <div className="relative z-10 text-center w-full max-w-7xl mx-auto">
                {/* Status Badge */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-white/10 bg-indigo-500/10 text-[11px] font-bold uppercase tracking-[0.3em] text-indigo-400 mb-12 shadow-2xl backdrop-blur-xl"
                >
                  <Sparkles size={14} className="animate-pulse" /> Architecture Initialized
                </motion.div>
                
                <h1 className="hero-heading mb-10 text-premium-gradient animate-sweep-container lowercase italic font-black">
                  <span className="block leading-[1.1] tracking-tighter">Architectural</span>
                  <span className="block leading-[1.1] tracking-tighter">Excellence</span>
                </h1>
                
                <p style={{ fontSize: 'clamp(16px, 4vw, 20px)' }} className="text-white/50 max-w-3xl mx-auto mb-16 font-medium leading-relaxed tracking-tight">
                  Deploying high-fidelity digital infrastructure for modern enterprises. <br className="hidden md:block" />
                  Engineering at the intersection of cinematic design and surgical precision.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 relative z-20">
                  <MagneticButton 
                    onClick={() => {
                        const el = document.getElementById('products');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-12 py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-[0_25px_80px_-15px_rgba(99,102,241,0.6)] transition-all uppercase tracking-[0.3em] text-[11px]"
                  >
                    View Ecosystem
                  </MagneticButton>
                  <MagneticButton className="w-full sm:w-auto px-12 py-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-[11px] backdrop-blur-xl">
                    Case Study <ArrowRight size={18} />
                  </MagneticButton>
                </div>
              </div>

              {/* Decorative Scroll Hint */}
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-12 text-white/20 flex flex-col items-center gap-4"
              >
                <span className="text-[10px] uppercase font-black tracking-widest">Scroll to Explore</span>
                <div className="w-1 h-12 rounded-full bg-gradient-to-b from-indigo-500 to-transparent" />
              </motion.div>
            </section>

            {/* PRODUCT LAB (The New Showcase) */}
            <ProductShowcase />

            <section id="bento" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-auto md:auto-rows-[300px]">
                <motion.div whileHover={{ y: -5 }} className="glass-card-neon md:col-span-2 p-8 md:p-12 bg-gradient-to-br from-indigo-600/5 to-transparent">
                  <Shield size={48} className="text-indigo-500 mb-6 md:mb-8" />
                  <h4 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">Security Infrastructure</h4>
                  <p className="text-white/40 text-base md:text-lg font-medium">Multi-tenant isolation and AES-256 bank-grade encryption across all tools.</p>
                </motion.div>
                <div className="glass-card-neon p-8 md:p-10 flex flex-col justify-end min-h-[200px] md:min-h-0">
                   <Activity size={32} md:size={40} className="text-indigo-500 mb-4 md:mb-6" />
                   <h5 className="font-black uppercase tracking-widest text-sm">99.9% Uptime</h5>
                   <p className="text-[10px] md:text-xs text-white/30 mt-2">Global edge distribution stabilized.</p>
                </div>
              </div>
            </section>
          </>
        )}

        {activeView === 'contact' && <ContactView />}
        {activeView === 'privacy' && <LegalLayout title="Privacy Policy">
          <section>
            <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-6">01. Data Governance</h3>
            <p>chatwizs studio implements strict data localization. All temporary buffers are flushed post-session execution.</p>
          </section>
        </LegalLayout>}
        {activeView === 'terms' && <LegalLayout title="Terms Of Use">
          <section>
            <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-6">01. Usage License</h3>
            <p>Subject is granted limited access to chatwizs studio infrastructure for personal and legitimate operational use.</p>
          </section>
        </LegalLayout>}
        
        {activeView === 'home' && <TestimonialMarquee />}
      </main>

      <footer className="pt-16 md:pt-24 pb-8 md:pb-12 px-6 border-t border-white/5 bg-zinc-950/50 backdrop-blur-xl relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-[1rem] bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/20">P</div>
                <span className="text-xl font-black tracking-tighter uppercase">chatwizs studio</span>
              </div>
              <p className="text-white/30 text-xs font-medium leading-relaxed">Defining the digital frontier through code and aesthetic excellence. High-fidelity architecture for the visionaries.</p>
            </div>
            
            <div>
              <h6 className="section-label-premium mb-8">Ecosystem</h6>
              <div className="flex flex-col gap-5">
                {products.map(p => <a key={p.title} href={p.path} className="premium-link">{p.title}</a>)}
              </div>
            </div>

            <div>
              <h6 className="section-label-premium mb-8">Structure</h6>
              <div className="flex flex-col gap-5">
                <button onClick={() => setActiveView('home')} className="text-left premium-link">Vision Hub</button>
                <button onClick={() => setActiveView('contact')} className="text-left premium-link">Collaborate</button>
                <a href="mailto:support@chatwizs.com" className="text-left premium-link">Direct Support</a>
              </div>
            </div>

            <div>
              <h6 className="section-label-premium mb-8">Legal Node</h6>
              <div className="flex flex-col gap-5">
                <button onClick={() => setActiveView('privacy')} className="text-left premium-link">Privacy Protocol</button>
                <button onClick={() => setActiveView('terms')} className="text-left premium-link">Access Terms</button>
              </div>
            </div>
          </div>

        </div>
      </footer>

      {/* Mobile Menu Dropdown (Quick simple version) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-10 gap-8"
          >
            <button className="absolute top-10 right-10 text-white" onClick={() => setIsMenuOpen(false)}><X size={40} /></button>
            {products.map(p => <a key={p.title} href={p.path} className="text-xl md:text-3xl font-black uppercase tracking-[0.1em] md:tracking-tighter hover:text-indigo-500 transition-colors">{p.title}</a>)}
            <div className="divider w-20 h-1 bg-white/10" />
            <button onClick={() => { setActiveView('contact'); setIsMenuOpen(false); }} className="text-xl md:text-3xl font-black uppercase tracking-[0.1em] md:tracking-tighter hover:text-indigo-500 transition-colors">Contact</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
