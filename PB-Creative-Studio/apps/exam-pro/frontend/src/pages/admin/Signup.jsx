import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, GraduationCap, ArrowRight, CheckCircle, Building, Mail, Phone, Shield } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    mobile: '',
    org_name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          mobile: formData.mobile,
          org_name: formData.org_name
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSuccess(true);
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err) {
      setError(err.message || 'Signup failed. Check your data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0b1a', 
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Gradients */}
      <div style={{
        position: 'absolute', top: '10%', left: '20%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ 
          width: '100%', 
          maxWidth: '560px', 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: 'clamp(32px, 5vw, 48px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', height: '64px', margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 25px -5px rgba(99,102,241,0.4)'
          }}>
            <GraduationCap size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>
            Register Institute
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px' }}>
            Set up your administrator account to get started
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ width: '80px', height: '80px', background: 'rgba(16,185,129,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#10b981' }}
            >
              <CheckCircle size={40} />
            </motion.div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>Registration Successful</h3>
            <p style={{ color: '#94a3b8', fontSize: '15px' }}>Redirecting to login portal...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, textAlign: 'center' }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Institute Name</label>
              <div style={{ position: 'relative' }}>
                <Building size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text" required
                  style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="e.g. ChatWizs Academy"
                  value={formData.org_name}
                  onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="email" required
                    style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
                    placeholder="admin@school.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mobile</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="tel" required
                    style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
                    placeholder="9876543210"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text" required
                  style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
                  placeholder="admin_username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="password" required
                    style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirm</label>
                <div style={{ position: 'relative' }}>
                  <Shield size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="password" required
                    style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '15px',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                marginTop: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 10px 25px -5px rgba(99,102,241,0.4)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {loading ? 'Creating Account...' : 'Register Institute'} <ArrowRight size={18} />
            </button>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>
              Already have an account? 
              <Link to="/admin/login" style={{ color: '#818cf8', fontWeight: 700, marginLeft: '6px', textDecoration: 'none' }}>
                Sign In
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}

