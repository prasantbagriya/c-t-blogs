import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';
import api from '../../api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/admin/login', form);
      localStorage.setItem('admin_token', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card" style={{ animation: 'slideUp 0.4s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, var(--accent), var(--violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 8px 32px var(--accent-glow)'
          }}>
            <Shield size={30} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Admin Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sign in to manage your exam platform</p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 10, marginBottom: 20,
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
            color: '#fb7185', fontSize: 14, fontWeight: 500
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-control"
              placeholder="admin"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap" style={{ position: 'relative' }}>
              <input
                className="form-control"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                style={{ paddingRight: 48 }}
              />
              <button type="button" onClick={() => setShowPw(p => !p)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', display: 'flex', alignItems: 'center'
              }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8, padding: '14px' }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/admin/signup" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Create Account</Link>
        </p>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
          Are you a student? <Link to="/student/login" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Student Login</Link>
        </p>
      </div>
    </div>
  );
}

