import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, BookOpen, Users, ClipboardCheck,
  Shield, Zap, BarChart3, ArrowRight, Trophy, Clock, Star,
  Menu, X
} from 'lucide-react';

const features = [
  { icon: BookOpen, title: 'Smart Exam Builder', desc: 'Create exams with custom subject limits, question banks, and randomized delivery per student.', color: 'indigo' },
  { icon: Users, title: 'Student Management', desc: 'Add students individually or bulk-upload via CSV. Organize by class with ease.', color: 'indigo' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Real-time charts showing class-wise performance and exam participation statistics.', color: 'emerald' },
  { icon: Clock, title: 'Live Exam Interface', desc: 'Countdown timer, question navigator, anti-tab-switch warnings for fair assessment.', color: 'amber' },
  { icon: ClipboardCheck, title: 'Detailed Results', desc: 'Subject-wise breakdown, score analytics, export to CSV/PDF with one click.', color: 'rose' },
  { icon: Shield, title: 'Secure & Reliable', desc: 'JWT-based auth, anti-cheat exam interface, protected routes for both portals.', color: 'indigo' },
];

const stats = [
  { value: '∞', label: 'Questions' },
  { value: '100%', label: 'Online' },
  { value: '2', label: 'Portals' },
  { value: '24/7', label: 'Available' },
];

const testimonials = [
  { name: "Dr. Rajesh Kumar", role: "School Principal", text: "EduExam Pro has completely transformed our semester planning. Highly secure and intuitive." },
  { name: "Sarah Jenkins", role: "Academy Director", text: "The real-time analytics are a game-changer for student performance tracking." },
  { name: "Amit Sharma", role: "Govt. Exam Coordinator", text: "Safest platform we have used. The anti-tab switch feature is foolproof." },
  { name: "Dr. Elena Vance", role: "University Dean", text: "Scaling to thousands of students was effortless. Exceptional engineering." },
  { name: "Preeti Singh", role: "Coaching Head", text: "The question bank management is surgically precise. Saved us hundreds of hours." },
];

const pricing = [
  { tier: "Starter", price: "Free", features: ["Up to 50 Students", "Basic Question Bank", "Standard Support", "Real-time Monitoring"], color: "emerald " },
  { tier: "Professional", price: "₹999/mo", features: ["1,000+ Students", "Advanced Analytics", "Priority Support", "Custom Branding"], color: "indigo", highlight: true },
  { tier: "Institutional", price: "Custom", features: ["Unlimited Access", "Dedicated Server", "24/7 Phone Support", "API Integration"], color: "rose" },
];

export default function Home() {
  console.log("EDUE XAM FIXED V1");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0b1a', 
      color: '#f1f5f9',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Mesh Background Effect */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: `
          radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%),
          radial-gradient(at 50% 100%, rgba(99, 102, 241, 0.08) 0px, transparent 50%)
        `,
        pointerEvents: 'none',
        zIndex: 0
      }} />
      {/* Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,11,26,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        padding: '0 clamp(16px, 5vw, 40px)', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 900, color: 'white'
          }}>E</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, background: 'linear-gradient(to right, #818cf8, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduExam Pro</div>
            <div style={{ fontSize: 11, color: '#64748b' }} className="hidden sm:block">Exam Management System</div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div style={{ gap: 12 }} className="desktop-nav">
          <a href="/portal/admin/login" className="btn btn-ghost btn-sm">Admin Portal</a>
          <a href="/portal/student/login" className="btn btn-primary btn-sm">Student Login</a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="mobile-toggle p-2 text-indigo-400"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute', top: 68, left: 0, right: 0,
            background: '#0f1129', borderBottom: '1px solid rgba(99,102,241,0.15)',
            padding: 20, display: 'flex', flexDirection: 'column', gap: 10,
            zIndex: 90
          }} className="mobile-only animate-fadeIn">
            <a href="/portal/admin/login" className="btn btn-ghost btn-full" onClick={() => setMobileMenuOpen(false)}>Admin Portal</a>
            <a href="/portal/student/login" className="btn btn-primary btn-full" onClick={() => setMobileMenuOpen(false)}>Student Login</a>
          </div>
        )}
      </header>

      {/* Hero */}
      <section style={{
        padding: 'clamp(60px, 10vh, 100px) clamp(16px, 5vw, 40px) 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* BG orbs */}
        <div style={{
          position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: 20, padding: '8px 18px', marginBottom: 32,
            fontSize: 13, fontWeight: 600, color: '#818cf8'
          }}>
            <Star size={14} fill="currentColor" /> Premium Exam Hub
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 8vw, 72px)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 24,
            background: 'linear-gradient(135deg, #f1f5f9 0%, #818cf8 50%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Conduct Exams<br />Like Never Before
          </h1>

          <p style={{ fontSize: 'clamp(16px, 4vw, 18px)', color: '#94a3b8', lineHeight: 1.7, marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
            A complete online examination system for schools and coaching institutes.
            Manage students, build question banks, conduct live exams, and analyze results.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/student/login" className="btn btn-primary btn-xl animate-pulse-glow" style={{ minWidth: 200 }}>
              Take an Exam <ArrowRight size={20} />
            </a>
            <a href="/admin/login" className="btn btn-ghost btn-xl" style={{ fontSize: 16, padding: '16px 32px', minWidth: 200 }}>
              <Shield size={20} /> Admin Panel
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ padding: '0 clamp(16px, 5vw, 40px) 80px' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1,
          background: 'rgba(99,102,241,0.15)', borderRadius: 16, overflow: 'hidden',
          border: '1px solid rgba(99,102,241,0.15)'
        }}>
          {stats.map(s => (
            <div key={s.label} style={{
              padding: 'clamp(20px, 4vw, 32px) 24px', textAlign: 'center',
              background: '#0f1129', transition: 'background 0.2s'
            }}>
              <div style={{ fontSize: 'clamp(24px, 6vw, 36px)', fontWeight: 900, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '40px clamp(16px, 5vw, 40px) 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 8vw, 60px)' }}>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 40px)', fontWeight: 800, marginBottom: 16 }}>
              Everything You Need
            </h2>
            <p style={{ fontSize: 'clamp(14px, 4vw, 16px)', color: '#94a3b8', maxWidth: 500, margin: '0 auto' }}>
              A fully-featured platform covering the entire exam lifecycle from question creation to result analysis.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 30vw, 360px), 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} className="glass glass-hover" style={{ padding: 32 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  backgroundColor: `rgba(${f.color === 'indigo' ? '99,102,241' : f.color === 'emerald' ? '16,185,129' : f.color === 'amber' ? '245,158,11' : '244,63,94'},0.15)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                  color: f.color === 'indigo' ? '#818cf8' : f.color === 'emerald' ? '#10b981' : f.color === 'amber' ? '#f59e0b' : '#f43f5e'
                }}>
                  <f.icon size={24} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section style={{ padding: '100px clamp(16px, 5vw, 40px)', background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.02))' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 60, alignItems: 'center' }}>
          <div>
             <h2 style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em' }}>
              Built for the <span style={{ color: '#818cf8' }}>Visionary Educators</span> of Tomorrow.
            </h2>
            <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.8, marginBottom: 32 }}>
              EduExam Pro is not just a tool; it's a digital fortress for academic integrity. We've engineered every pixel to ensure that your institution can transition into the future of digital assessments without compromising on quality or security.
            </p>
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9' }}>100%</div>
                <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Uptime</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9' }}>AES-256</div>
                <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Encryption</div>
              </div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              aspectRatio: '16/10', borderRadius: 24, background: 'linear-gradient(45deg, #0f1129, #1a1c35)',
              border: '1px solid rgba(99,102,241,0.2)', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
               <Shield size={80} style={{ color: 'rgba(99,102,241,0.1)' }} />
               <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, #0a0b1a 100%)', opacity: 0.4 }} />
            </div>
          </div>
        </div>
      </section>

      {/* Two Portals CTA */}
      <section style={{ padding: '80px clamp(16px, 5vw, 40px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 40px)', fontWeight: 800, marginBottom: 16 }}>Choose Your Portal</h2>
            <p style={{ color: '#94a3b8' }}>Select the interface that matches your role in the ecosystem.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(300px, 45%, 500px), 1fr))', gap: 48 }}>
            {/* Admin Card */}
            <div style={{
              padding: 'clamp(32px, 5vw, 48px)',
              borderRadius: 32,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
              border: '1px solid rgba(99,102,241,0.3)',
              position: 'relative', overflow: 'hidden'
            }} className="glass-hover">
              <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(99,102,241,0.1)' }} />
              <Shield size={42} style={{ color: '#818cf8', marginBottom: 24 }} />
              <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Admin Portal</h3>
              <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
                Manage the entire exam ecosystem. Add classes, upload students, build question banks, create exams and view analytics.
              </p>
              <a href="/portal/admin/login" className="btn btn-primary" style={{ padding: '16px 32px' }}>
                Go to Admin Panel <ArrowRight size={18} />
              </a>
            </div>

            {/* Student Card */}
            <div style={{
              padding: 'clamp(32px, 5vw, 48px)',
              borderRadius: 32,
              background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))',
              border: '1px solid rgba(16,185,129,0.25)',
              position: 'relative', overflow: 'hidden'
            }} className="glass-hover">
              <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(16,185,129,0.08)' }} />
              <GraduationCap size={42} style={{ color: '#10b981', marginBottom: 24 }} />
              <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Student Portal</h3>
              <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
                Login with your mobile number, view assigned exams, attempt them with a live timer, and see your results instantly.
              </p>
              <a href="/portal/student/login" className="btn btn-success" style={{ padding: '16px 32px' }}>
                Student Login <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '80px clamp(16px, 5vw, 40px)', background: 'rgba(10,11,26,0.3)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 40px)', fontWeight: 800, marginBottom: 16 }}>Institutional Pricing</h2>
            <p style={{ color: '#94a3b8' }}>Transparent, scalable plans for every educational institution.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {pricing.map((p, i) => (
              <div key={i} style={{
                padding: 40, borderRadius: 24, background: '#0f1129',
                border: `1px solid ${p.highlight ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.05)'}`,
                boxShadow: p.highlight ? '0 0 40px rgba(99,102,241,0.1)' : 'none',
                position: 'relative'
              }}>
                {p.highlight && <div style={{ position: 'absolute', top: 20, right: 20, background: '#6366f1', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase' }}>Most Popular</div>}
                <div style={{ color: '#64748b', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{p.tier}</div>
                <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 30 }}>{p.price}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#94a3b8' }}>
                      <Zap size={14} className="text-indigo-400" /> {f}
                    </div>
                  ))}
                </div>
                <button className={`btn btn-full ${p.highlight ? 'btn-primary' : 'btn-ghost'}`}>Get Started</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Marquee */}
      <section style={{ padding: '100px 0', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800 }}>Trusted by Educators</h2>
        </div>
        <div className="marquee-container">
          <div className="marquee-content">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} style={{ 
                minWidth: 400, padding: 32, borderRadius: 24, 
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <p style={{ fontStyle: 'italic', color: '#f1f5f9', marginBottom: 20 }}>"{t.text}"</p>
                <div>
                  <div style={{ fontWeight: 800, color: '#6366f1' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(99,102,241,0.15)', padding: '60px clamp(16px, 5vw, 40px) 40px', background: '#070815' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, textAlign: 'left', marginBottom: 60 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 20, color: '#818cf8', marginBottom: 16 }}>EduExam Pro</div>
              <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>Next-generation examination digital infrastructure for modern enterprises.</p>
            </div>
            <div>
              <h4 style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Portal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a href="/portal/admin/login" className="premium-link" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>Admin Login</a>
                <a href="/portal/student/login" className="premium-link" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>Student Login</a>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a href="/portal/contact-us" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>Contact Us</a>
                <a href="/portal/about-us" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>About Us</a>
                <a href="/portal/refund-policy" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>Refund Policy</a>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Legal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a href="/portal/privacy-policy" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</a>
                <a href="/portal/terms-and-conditions" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>Terms & Conditions</a>
                <a href="/portal/cookies-policy" style={{ fontSize: 13, color: '#94a3b8', textDecoration: 'none' }}>Cookies Policy</a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, textAlign: 'center', color: '#64748b', fontSize: 12 }}>
            © 2026 EduExam Pro — Surgical Precision in Academic Assessment
          </div>
        </div>
      </footer>
    </div>
  );
}
