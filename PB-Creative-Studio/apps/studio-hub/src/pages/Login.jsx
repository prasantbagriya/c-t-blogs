import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Send } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/hub/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.token) {
        localStorage.setItem('hub_token', data.token);
        localStorage.setItem('hub_user', data.username);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection to Nebula Engine failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top right, #1e1b4b, #03041a)' }}>
      <div className="glass" style={{ width: '100%', maxWidth: 450, padding: 40, animation: 'fadeIn 0.6s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
           <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, var(--accent), #f472b6)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 30px var(--accent-glow)' }}>
             <Shield size={32} color="white" />
           </div>
           <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>Studio Hub Login</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Enterprise Inquiry Management Portal</p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 12, color: '#f87171', fontSize: 13, marginBottom: 24, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.1em' }}>Manager Username</label>
            <div style={{ position: 'relative' }}>
               <User size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
               <input 
                 required 
                 className="input" 
                 style={{ paddingLeft: 48 }} 
                 placeholder="admin_id" 
                 value={formData.username}
                 onChange={e => setFormData({...formData, username: e.target.value})}
               />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.1em' }}>Secure Password</label>
            <div style={{ position: 'relative' }}>
               <Lock size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
               <input 
                 required 
                 type="password" 
                 className="input" 
                 style={{ paddingLeft: 48 }} 
                 placeholder="••••••••" 
                 value={formData.password}
                 onChange={e => setFormData({...formData, password: e.target.value})}
               />
            </div>
          </div>

          <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 10, height: 54 }}>
            {loading ? 'Authenticating...' : 'Access Command Center'} <Send size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Authorized personnel only. All interactions are logged.</p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
