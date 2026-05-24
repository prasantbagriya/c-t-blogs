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
    <div className="auth-page" style={{ background: '#0a0b1a', fontFamily: "'Inter', sans-serif" }}>
      <div className="auth-bg" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
        style={{ maxWidth: '520px' }}
      >
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center mb-4 shadow-xl shadow-indigo-600/30">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h1 className="text-3xl mb-2 font-bold text-white tracking-tight">Create Admin Account</h1>
          <p className="text-white/50 text-[13px] font-medium leading-relaxed mb-3 mb-8">
            Initialize your institute infrastructure
          </p>
        </div>

        {success ? (
          <div className="text-center py-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500"
            >
              <CheckCircle size={40} />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Registration Successful</h3>
            <p className="text-zinc-400 text-sm">Redirecting you to login portal...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Institute Name</label>
              <div className="input-icon-wrap">
                <Building className="icon" />
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Institute Name"
                  value={formData.org_name}
                  onChange={(e) => setFormData({ ...formData, org_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-icon-wrap">
                  <Mail className="icon" />
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div className="input-icon-wrap">
                  <Phone className="icon" />
                  <input
                    type="tel"
                    required
                    className="form-control"
                    placeholder="9876543210"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-icon-wrap">
                <User className="icon" />
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="admin_username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-icon-wrap">
                  <Lock className="icon" />
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm</label>
                <div className="input-icon-wrap">
                  <Shield className="icon" />
                  <input
                    type="password"
                    required
                    className="form-control"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full py-4 mt-6 font-black uppercase tracking-[0.3em] text-[11px] rounded-xl shadow-[0_10px_40px_-10px_rgba(99,102,241,0.6)] border border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {loading ? 'Processing System...' : 'Create Admin Access'} <ArrowRight size={14} className="ml-2" />
            </button>

            <p className="text-center text-white/40 text-[11px] font-bold uppercase tracking-widest mt-2">
              Already have an account? <Link to="/admin/login" className="text-indigo-400 hover:text-white transition-colors ml-2 font-black">LOGIN</Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
