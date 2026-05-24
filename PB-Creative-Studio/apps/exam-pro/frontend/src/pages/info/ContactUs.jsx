import { useState } from 'react';
import LegalLayout from '../../components/LegalLayout';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactUsPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          source: 'EduExam Pro Portal',
          type: 'Support Enquiry'
        })
      });
      setSent(true);
    } catch (err) {
      alert('Failed to send inquiry. Please try the direct email listed below.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LegalLayout title="Contact Us">
      <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.6, marginBottom: 40 }}>
        Have questions about institutional licensing or need technical support? Our specialized support team is available 24/7 to ensure your operations run smoothly.
      </p>

      {sent ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(16,185,129,0.05)', borderRadius: 24, border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Send size={32} />
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Enquiry Received</h3>
          <p style={{ color: '#94a3b8' }}>Our team has been notified via the Studio Hub and will contact you shortly.</p>
          <button onClick={() => setSent(false)} style={{ marginTop: 24, padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 20, marginBottom: 60 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: '#64748b', marginBottom: 8, letterSpacing: '0.1em' }}>Full Name</label>
              <input required type="text" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: 16, borderRadius: 12, background: '#0f1129', border: '1px solid rgba(99,102,241,0.2)', color: '#fff', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: '#64748b', marginBottom: 8, letterSpacing: '0.1em' }}>Email Address</label>
              <input required type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: 16, borderRadius: 12, background: '#0f1129', border: '1px solid rgba(99,102,241,0.2)', color: '#fff', outline: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: '#64748b', marginBottom: 8, letterSpacing: '0.1em' }}>How can we help?</label>
            <textarea required placeholder="Briefly describe your inquiry..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} style={{ width: '100%', padding: 16, borderRadius: 12, background: '#0f1129', border: '1px solid rgba(99,102,241,0.2)', color: '#fff', outline: 'none', height: 120, resize: 'none' }} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: 16, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            {loading ? 'Sending...' : 'Send Enquiry'} <Send size={18} />
          </button>
        </form>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24, borderRadius: 16, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
          <Mail className="text-indigo-400" />
          <div>
            <div style={{ fontWeight: 700 }}>Email Support</div>
            <div style={{ color: '#94a3b8' }}>support@prasantbagriya.online</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24, borderRadius: 16, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
          <Phone className="text-indigo-400" />
          <div>
            <div style={{ fontWeight: 700 }}>Direct Line</div>
            <div style={{ color: '#94a3b8' }}>+91 (Support Operations)</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24, borderRadius: 16, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
          <MapPin className="text-indigo-400" />
          <div>
            <div style={{ fontWeight: 700 }}>Headquarters</div>
            <div style={{ color: '#94a3b8' }}>Prasant Bagriya Digital Infrastructure</div>
          </div>
        </div>
      </div>
    </LegalLayout>
  );
}
