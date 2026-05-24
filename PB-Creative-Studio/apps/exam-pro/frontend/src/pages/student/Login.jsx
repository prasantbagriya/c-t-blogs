import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Smartphone, LogIn } from 'lucide-react';
import api from '../../api';
import ToastProvider from '../../components/Toast';

export default function StudentLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ mobile: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/student/login', form);
      localStorage.setItem('student_token', res.data.token);
      localStorage.setItem('student_info', JSON.stringify({
        name: res.data.name, mobile: res.data.mobile, class_name: res.data.class_name
      }));
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid mobile or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <ToastProvider />
      <div className="auth-bg" style={{
        background: 'radial-gradient(ellipse at 30% 40%, rgba(16,185,129,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(99,102,241,0.1) 0%, transparent 50%), var(--bg-dark)'
      }} />
      <div className="auth-card" style={{ animation: 'slideUp 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, var(--emerald), #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(16,185,129,0.3)'
          }}>
            <GraduationCap size={30} color="white" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Student Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Enter your mobile number to start exam</p>
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
            <label className="form-label">Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <Smartphone size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-control"
                placeholder="10-digit mobile number"
                value={form.mobile}
                onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                required autoFocus
                style={{ paddingLeft: 44 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-control"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
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

          <button type="submit" className="btn btn-success btn-full" style={{ marginTop: 8, padding: '14px' }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><LogIn size={18} /> Login & Continue</>}
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          Contact your admin if you're not registered yet.
        </p>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
          Admin? <Link to="/admin/login" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Admin Login</Link>
        </p>
      </div>
    </div>
  );
}

