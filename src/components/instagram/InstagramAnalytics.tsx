import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, Heart, MessageCircle, Target, Zap, RefreshCw, Image as ImageIcon, Eye, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { API_URL, getHeaders } from '../../api/common';

export const InstagramAnalytics = ({ user, account }: { user: any; account: any }) => {
  const [insights, setInsights] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [reachData, setReachData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    if (!account?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/instagram/analytics?accountId=${account.id}`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok) {
        setInsights(data.insights || {});
        setMedia(data.media || []);
        // Build reach chart data from insights
        if (data.reachByDay?.length > 0) {
          setReachData(data.reachByDay);
        } else {
          // Fallback to account-level data
          setReachData([
            { name: 'Mon', reach: 0, impressions: 0 },
            { name: 'Tue', reach: 0, impressions: 0 },
            { name: 'Wed', reach: 0, impressions: 0 },
            { name: 'Thu', reach: 0, impressions: 0 },
            { name: 'Fri', reach: 0, impressions: 0 },
            { name: 'Sat', reach: 0, impressions: 0 },
            { name: 'Sun', reach: 0, impressions: 0 },
          ]);
        }
      } else {
        (window as any).showToast?.(data.error || 'Failed to load analytics', 'error');
      }
    } catch (e: any) {
      (window as any).showToast?.(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [account?.id]);

  const kpis = [
    { label: 'Followers', value: (account?.followers_count || 0).toLocaleString(), icon: <Users />, color: '#6366f1', sub: `${account?.follows_count || 0} following` },
    { label: 'Total Posts', value: (account?.media_count || 0).toLocaleString(), icon: <ImageIcon />, color: '#10b981', sub: 'Published content' },
    { label: 'Profile Reach', value: (insights?.reach || 0).toLocaleString(), icon: <Eye />, color: '#ec4899', sub: 'Unique accounts reached' },
    { label: 'Impressions', value: (insights?.impressions || 0).toLocaleString(), icon: <TrendingUp />, color: '#f59e0b', sub: 'Total content views' },
  ];

  return (
    <div className="py-4 sm:py-6 px-2 sm:px-4 lg:px-6 bg-slate-50 dark:bg-[#0f0f13] h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Analytics Dashboard</h2>
          <button onClick={fetchAnalytics} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500 text-white rounded-xl text-[10px] font-bold uppercase hover:opacity-90 disabled:opacity-50 transition-all">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh from Meta
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-[#16161d] p-4 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-pink-400 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: kpi.color }}>
                  {React.cloneElement(kpi.icon as React.ReactElement, { size: 16 })}
                </div>
                {loading && <RefreshCw size={12} className="text-slate-300 animate-spin" />}
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">{kpi.value}</h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1">{kpi.label}</p>
              <p className="text-[8px] text-slate-400 mt-0.5">{kpi.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Engagement Breakdown */}
        {insights && Object.keys(insights).length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#16161d] p-6 rounded-2xl border border-slate-200 dark:border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <Target size={14} className="text-blue-500" /> Engagement Breakdown
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Profile Views', value: insights.profile_views || 0, color: '#6366f1' },
                  { label: 'Website Clicks', value: insights.website_clicks || 0, color: '#10b981' },
                  { label: 'Email Clicks', value: insights.email_contacts || 0, color: '#ec4899' },
                  { label: 'Call Clicks', value: insights.phone_call_clicks || 0, color: '#f59e0b' },
                ].map(item => {
                  const max = Math.max(insights.profile_views || 1, insights.website_clicks || 1, insights.email_contacts || 1, insights.phone_call_clicks || 1, 1);
                  const pct = Math.round((item.value / max) * 100);
                  return (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-600 dark:text-slate-400 uppercase tracking-wide">{item.label}</span>
                        <span className="text-slate-900 dark:text-white">{item.value.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full" style={{ background: item.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-[#16161d] p-6 rounded-2xl border border-slate-200 dark:border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-pink-500" /> Reach Over Time
              </h3>
              {reachData.some(d => d.reach > 0) ? (
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reachData}>
                      <defs>
                        <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: '#1e293b', color: '#fff', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="reach" stroke="#ec4899" strokeWidth={2.5} fill="url(#colorReach)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[180px] flex items-center justify-center flex-col text-center">
                  <TrendingUp size={32} className="text-slate-200 dark:text-slate-700 mb-2" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sync to load chart data</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Media Performance */}
        <div className="bg-white dark:bg-[#16161d] p-6 rounded-2xl border border-slate-200 dark:border-white/5">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">Recent Post Performance</h3>
          {loading ? (
            <div className="flex justify-center py-10"><RefreshCw className="w-6 h-6 text-pink-500 animate-spin" /></div>
          ) : media.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    {['Post', 'Type', 'Likes', 'Comments', 'Reach', 'Posted'].map(h => (
                      <th key={h} className="pb-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                  {media.map(post => (
                    <tr key={post.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {(post.thumbnail_url || post.media_url) ? (
                            <img src={post.thumbnail_url || post.media_url} className="w-9 h-9 rounded-lg object-cover" alt="" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                              <ImageIcon size={12} className="text-slate-400" />
                            </div>
                          )}
                          <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                            {post.caption?.substring(0, 30) || 'No caption'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                          post.media_type === 'VIDEO' ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400' :
                          post.media_type === 'CAROUSEL_ALBUM' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                          'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                        }`}>
                          {post.media_type === 'VIDEO' ? 'Reel' : post.media_type === 'CAROUSEL_ALBUM' ? 'Carousel' : 'Image'}
                        </span>
                      </td>
                      <td className="py-3 text-xs font-bold text-slate-700 dark:text-slate-300">{(post.like_count || 0).toLocaleString()}</td>
                      <td className="py-3 text-xs font-bold text-slate-700 dark:text-slate-300">{(post.comments_count || 0).toLocaleString()}</td>
                      <td className="py-3 text-xs font-bold text-slate-700 dark:text-slate-300">{post.reach ? post.reach.toLocaleString() : '—'}</td>
                      <td className="py-3 text-[10px] text-slate-400">
                        {post.timestamp ? new Date(post.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <ImageIcon size={40} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Click "Refresh from Meta" to load post data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
