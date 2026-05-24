import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LegalLayout({ children, title }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0b1a', 
      color: '#f1f5f9',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Mesh Background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: `
          radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.08) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.08) 0px, transparent 50%)
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
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 900, color: 'white'
            }}>E</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, background: 'linear-gradient(to right, #818cf8, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduExam Pro</div>
            </div>
          </Link>
        </div>

        <button 
          className="md:hidden p-2 text-indigo-400"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {mobileMenuOpen && (
          <div style={{
            position: 'absolute', top: 68, left: 0, right: 0,
            background: '#0f1129', borderBottom: '1px solid rgba(99,102,241,0.15)',
            padding: 20, display: 'flex', flexDirection: 'column', gap: 10,
            zIndex: 90
          }} className="md:hidden animate-fadeIn">
            <a href="/portal/admin/login" className="btn btn-ghost btn-full">Admin Portal</a>
            <a href="/portal/student/login" className="btn btn-primary btn-full">Student Login</a>
          </div>
        )}
      </header>

      <main style={{ position: 'relative', zIndex: 1, padding: 'clamp(60px, 10vh, 100px) clamp(16px, 5vw, 40px)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: 900, marginBottom: 40, background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.5))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          <div className="prose-custom">
            {children}
          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid rgba(99,102,241,0.15)', padding: '24px clamp(16px, 5vw, 40px)', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
        <span style={{ fontWeight: 700, color: '#818cf8' }}>EduExam Pro</span> — © 2026
      </footer>
    </div>
  );
}
