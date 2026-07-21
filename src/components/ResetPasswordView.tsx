import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { API_URL } from '../api/common';

const ResetPasswordView: React.FC = () => {
 const [token, setToken] = useState<string | null>(null);
 const [newPassword, setNewPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [loading, setLoading] = useState(false);
 const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

 useEffect(() => {
 const params = new URLSearchParams(window.location.search);
 setToken(params.get('token'));
 }, []);

 const navigateToLogin = () => {
 window.location.href = '/auth';
 };

 const handleReset = async (e: React.FormEvent) => {
 e.preventDefault();
 if (newPassword !== confirmPassword) {
 return setStatus({ type: 'error', message: 'Passwords do not match' });
 }
 if (newPassword.length < 6) {
 return setStatus({ type: 'error', message: 'Password must be at least 6 characters' });
 }

 setLoading(true);
 setStatus({ type: 'idle', message: '' });

 try {
 const res = await fetch(`${API_URL}/auth/reset-password`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ token, newPassword })
 });

 const data = await res.json();

 if (!res.ok) throw new Error(data.error || 'Failed to reset password');

 setStatus({ type: 'success', message: 'Password reset successfully! You can now login.' });
 setTimeout(() => navigateToLogin(), 3000);

 } catch (err: any) {
 setStatus({ type: 'error', message: err.message });
 } finally {
 setLoading(false);
 }
 };

 if (!token) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
 <div className="max-w-md w-full bg-[#1e293b] rounded-none p-8 border border-slate-800 text-center">
 <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
 <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
 <p className="text-slate-400 mb-6">This password reset link is invalid or has expired.</p>
 <button onClick={navigateToLogin} className="flex items-center justify-center gap-2 text-indigo-400 hover:text-indigo-300 mx-auto">
 <ArrowLeft className="w-4 h-4" /> Back to Login
 </button>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-sans">
 <motion.div 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="max-w-md w-full"
 >
 <div className="bg-[#1e293b] rounded-none p-8 border border-slate-800 ">
 <div className="text-center mb-8">
 <div className="w-16 h-16 bg-indigo-500/10 rounded-none flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
 <Lock className="w-8 h-8 text-indigo-500" />
 </div>
 <h2 className="text-3xl font-bold text-white">Reset Password</h2>
 <p className="text-slate-400 mt-2">Enter your new secure password</p>
 </div>

 {status.type !== 'idle' && (
 <motion.div 
 initial={{ scale: 0.9, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 className={`mb-6 p-4 rounded-none flex items-center gap-3 ${ status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20' }`}
 >
 {status.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
 <span className="text-sm">{status.message}</span>
 </motion.div>
 )}

 <form onSubmit={handleReset} className="space-y-6">
 <div>
 <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
 <input
 type="password"
 required
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 className="w-full bg-slate-900/50 border border-slate-700 rounded-none px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 "
 placeholder="••••••••"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
 <input
 type="password"
 required
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className="w-full bg-slate-900/50 border border-slate-700 rounded-none px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 "
 placeholder="••••••••"
 />
 </div>

 <button
 type="submit"
 disabled={loading || status.type === 'success'}
 className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-none -indigo-600/20"
 >
 {loading ? 'Updating...' : 'Reset Password'}
 </button>

 <button 
 type="button"
 onClick={navigateToLogin}
 className="w-full text-slate-400 hover:text-slate-300 text-sm font-medium "
 >
 Cancel and Return to Login
 </button>
 </form>
 </div>
 </motion.div>
 </div>
 );
};

export default ResetPasswordView;
