import React, { useState, useEffect } from 'react';
import { Settings, User, Link, Mail, Phone, Globe, RefreshCw, Save, ShieldCheck, Unlink, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { API_URL, getHeaders } from '../../api/common';

export const InstagramSettings = ({ user, account, onAccountUpdate }: { user: any; account: any; onAccountUpdate?: (acc: any) => void }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [form, setForm] = useState({ biography: '', website: '', email: '' });

  useEffect(() => {
    if (account) {
      setProfile(account);
      setForm({ biography: account.biography || '', website: account.website || '', email: account.email || '' });
    }
  }, [account]);

  const handleSync = async () => {
    if (!account?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/instagram/accounts/${account.id}/sync`, { method: 'POST', headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.account) {
        setProfile(data.account);
        setForm({ biography: data.account.biography || '', website: data.account.website || '', email: data.account.email || '' });
        onAccountUpdate?.(data.account);
        (window as any).showToast?.('Profile synced from Meta!', 'success');
      } else {
        (window as any).showToast?.(data.error || 'Sync failed', 'error');
      }
    } catch (e: any) { (window as any).showToast?.(e.message, 'error'); }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    if (!confirm(`Disconnect @${account?.username}? This will remove the account from ChatWiz but won't affect your Instagram.`)) return;
    setDisconnecting(true);
    try {
      const res = await fetch(`${API_URL}/instagram/accounts/${account?.id}`, { method: 'DELETE', headers: getHeaders() });
      if (res.ok) {
        (window as any).showToast?.('Instagram account disconnected.', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const d = await res.json();
        (window as any).showToast?.(d.error || 'Disconnect failed', 'error');
      }
    } catch (e: any) { (window as any).showToast?.(e.message, 'error'); }
    setDisconnecting(false);
  };

  if (!account) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <p className="text-[10px] font-black uppercase tracking-widest">No account selected</p>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto pt-3 px-3 pb-0 bg-white dark:bg-[#0a0a0f] no-scrollbar">
      <div className="max-w-2xl mx-auto space-y-3">

        {/* Profile Card */}
        <div className="bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              {profile?.profilePicture ? (
                <img src={profile.profilePicture} className="w-16 h-16 rounded-xl object-cover border-2 border-slate-900 dark:border-white shadow-md" alt="" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-2xl font-black shadow-md">
                  {(profile?.username || 'I')[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">@{profile?.username || 'username'}</h2>
                  {profile?.is_verified && <ShieldCheck size={14} className="text-blue-500" />}
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-0.5">{profile?.account_type || 'Business'} Account</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{(profile?.followers_count || 0).toLocaleString()} followers</span>
                  <span className="text-[9px] text-slate-200 dark:text-white/10">•</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{(profile?.media_count || 0)} posts</span>
                </div>
              </div>
            </div>
            <button onClick={handleSync} disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-lg">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Sync Profile
            </button>
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-white/5">
            {[
              { label: 'Instagram ID', value: profile?.instagramId || '—', icon: <User size={12} /> },
              { label: 'Page ID', value: profile?.pageId || '—', icon: <Link size={12} /> },
              { label: 'Page Name', value: profile?.pageName || '—', icon: <Globe size={12} /> },
              { label: 'Connected', value: profile?.connectedAt ? new Date(profile.connectedAt).toLocaleDateString('en-IN') : '—', icon: <ShieldCheck size={12} /> },
              { label: 'Last Synced', value: profile?.lastSynced ? new Date(profile.lastSynced).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—', icon: <RefreshCw size={12} /> },
              { label: 'Status', value: profile?.status || 'active', icon: <ShieldCheck size={12} /> },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-1 opacity-70">
                  {item.icon} {item.label}
                </p>
                <p className="text-[10px] font-black text-slate-700 dark:text-slate-200 truncate">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Token Info */}
        <div className="bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-xl p-6 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> Access Token Status
          </h3>
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
            <div>
              <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">Page Access Token Active</p>
              <p className="text-[9px] text-emerald-600/70 font-bold mt-0.5">Token: {profile?.pageAccessToken ? `...${profile.pageAccessToken.slice(-8)}` : 'Not available'}</p>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 mt-4 leading-relaxed font-bold uppercase tracking-widest opacity-60">
            ⚠️ Access tokens expire after ~60 days. Click "Sync" regularly or reconnect via "Login with Instagram" if API calls start failing.
          </p>
        </div>

        {/* Danger Zone — Disconnect */}
        <div className="bg-white dark:bg-[#16161d] border border-red-500/20 rounded-xl p-6 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
            <AlertTriangle size={14} /> Danger Zone
          </h3>
          <p className="text-[10px] text-slate-500 mb-4 font-medium">
            Disconnecting removes this Instagram account from ChatWiz. Your actual Instagram account remains unaffected.
          </p>
          <button onClick={handleDisconnect} disabled={disconnecting}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20">
            <Unlink size={14} />
            {disconnecting ? 'Disconnecting...' : `Disconnect @${profile?.username}`}
          </button>
        </div>
      </div>
    </div>
  );
};
