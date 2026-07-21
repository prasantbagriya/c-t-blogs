// Lightweight replacement — no canvas, no animation loop
// Original had 6 canvas orbs animating every single frame

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {/* Static CSS gradient orbs — zero JS, zero CPU */}
      <div style={{
        position: 'absolute', top: '10%', left: '15%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147,51,234,0.05) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', left: '30%',
        width: 450, height: 450, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
    </div>
  );
}
