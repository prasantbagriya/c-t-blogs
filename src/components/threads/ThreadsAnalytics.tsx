import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Heart, MessageCircle, Repeat, Eye, ArrowUpRight, RefreshCw, Layers } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URL, getHeaders } from '../../api/common';

const dummyData = [
 { name: 'Mon', views: 400, interactions: 240 },
 { name: 'Tue', views: 300, interactions: 139 },
 { name: 'Wed', views: 200, interactions: 980 },
 { name: 'Thu', views: 278, interactions: 390 },
 { name: 'Fri', views: 189, interactions: 480 },
 { name: 'Sat', views: 239, interactions: 380 },
 { name: 'Sun', views: 349, interactions: 430 },
];

export const ThreadsAnalytics = ({ user, account }: { user: any; account: any }) => {
 const [loading, setLoading] = useState(false);
 const [stats, setStats] = useState<any>(null);
 const [chartData, setChartData] = useState<any[]>([]);

 useEffect(() => {
 fetchStats();
 }, [account]);

 const fetchStats = async () => {
 if (!account?.id) return;
 setLoading(true);
 try {
 const res = await fetch(`${API_URL}/threads/analytics?accountId=${account.id}`, { headers: getHeaders() });
 const data = await res.json();
 if (data.success) {
 setStats(data.stats);
 if (data.daily_metrics) {
 setChartData(data.daily_metrics);
 } else {
 // Fallback to chartData if provided in stats
 setChartData(data.stats?.chartData || []);
 }
 (window as any).showToast("Analytics synced with Meta", "success");
 }
 } catch (e) { 
 console.error(e); 
 (window as any).showToast("Sync failed", "error");
 } finally { 
 setLoading(false); 
 }
 };

 const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

 return (
 <div className="pt-3 px-3 pb-20 bg-slate-50 dark:bg-[#0f0f13]">
 <div className="mx-auto space-y-3">
 
 {/* Stats Grid */}
 <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
 {[
 { label: 'Followers', value: stats?.followers?.toLocaleString() || '0', icon: <Users size={18} />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
 { label: 'Total Views', value: stats?.views?.toLocaleString() || '0', icon: <Eye size={18} />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
 { label: 'Likes', value: stats?.likes?.toLocaleString() || '0', icon: <Heart size={18} />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
 { label: 'Replies', value: stats?.replies?.toLocaleString() || '0', icon: <MessageCircle size={18} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
 { label: 'Reposts', value: stats?.reposts?.toLocaleString() || '0', icon: <Repeat size={18} />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
 ].map((stat, idx) => (
 <div key={idx} className="bg-white dark:bg-[#16161d] p-4 sm:p-6 rounded-none border border-slate-200 dark:border-white/5 ">
 <div className="flex items-center justify-between mb-4">
 <div className={cn("p-2 rounded-none", stat.bg, stat.color)}>
 {stat.icon}
 </div>
 <div className="flex items-center gap-1 text-emerald-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
 <ArrowUpRight size={10} />
 Live
 </div>
 </div>
 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
 <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{stat.value}</h3>
 </div>
 ))}
 </div>

 {/* Charts Section */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
 <div className="lg:col-span-2 bg-white dark:bg-[#16161d] p-5 sm:p-8 rounded-none border border-slate-200 dark:border-white/5 ">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
 <div>
 <h3 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Performance Overview</h3>
 <p className="text-[9px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Growth metrics for last 7 days</p>
 </div>
 <div className="flex items-center gap-2">
 <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 rounded-none">
 <div className="w-2 h-2 rounded-none bg-blue-500 " />
 <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest">Views</span>
 </div>
 </div>
 </div>

 <div className="h-64 sm:h-72 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={chartData.length > 0 ? chartData : dummyData}>
 <defs>
 <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.1} />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} dy={10} />
 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} />
 <Tooltip 
 contentStyle={{ 
 borderRadius: '12px', 
 backgroundColor: '#000', 
 border: 'none', 
 color: '#fff',
 boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
 fontSize: '11px',
 fontWeight: '900'
 }}
 itemStyle={{ color: '#fff' }}
 />
 <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 <div className="bg-black dark:bg-[#16161d] text-white p-8 rounded-none flex flex-col justify-between border border-white/5 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-none -mr-16 -mt-16 " />
 <div className="relative z-10">
 <div className="w-12 h-12 bg-white/10 rounded-none flex items-center justify-center mb-6">
 <Layers size={24} className="text-white" />
 </div>
 <h3 className="text-xl font-black tracking-tight leading-tight uppercase">Threads<br/>Insights Hub</h3>
 <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-4 leading-relaxed">
 Real-time engagement tracking powered by Meta Graph API.
 </p>
 </div>
 <div className="pt-8 border-t border-white/10 mt-8 relative z-10">
 <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest opacity-60 mb-3">
 <span>Momentum</span>
 <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-none" /> Live</span>
 </div>
 <div className="h-1.5 w-full bg-white/10 rounded-none overflow-hidden">
 <div className="h-full bg-white w-3/4 rounded-none" />
 </div>
 <button 
 onClick={fetchStats}
 disabled={loading}
 className="w-full mt-6 py-3 bg-white text-black rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white disabled:opacity-50"
 >
 {loading ? <RefreshCw size={14} className=" inline mr-2" /> : null}
 {loading ? 'Syncing...' : 'Sync Live Data'}
 </button>
 </div>
 </div>
 </div>

 </div>
 </div>
 );
};
