import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import GlobalNavbar from './GlobalNavbar';
import GlobalFooter from './GlobalFooter';

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

      <GlobalNavbar />

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

      <GlobalFooter />
    </div>
  );
}
