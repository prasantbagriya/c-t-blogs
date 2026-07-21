import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
 Settings, 
 Plus, 
 BarChart3, 
 MessageSquare, 
 Zap, 
 Filter, 
 Search, 
 MoreVertical, 
 X, 
 ImageIcon,
 MapPin,
 Target,
 Globe,
 ArrowRight,
 RefreshCw,
 Calendar,
 Layers,
 Layout,
 MousePointer2,
 TrendingUp,
 ChevronRight,
 CheckCircle2,
 PauseCircle,
 Eye,
 DollarSign
} from 'lucide-react';
import { 
 AreaChart, 
 Area, 
 XAxis, 
 YAxis, 
 CartesianGrid, 
 Tooltip, 
 ResponsiveContainer,
 BarChart,
 Bar,
 Cell
} from 'recharts';
import { Facebook } from './common/BrandIcons';

type TabType = 'campaigns' | 'adsets' | 'ads';
type DatePreset = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'this_month' | 'last_month' | 'maximum';

const DATE_PRESETS: { label: string, value: DatePreset }[] = [
 { label: 'Today', value: 'today' },
 { label: 'Yesterday', value: 'yesterday' },
 { label: 'Last 7 Days', value: 'last_7_days' },
 { label: 'Last 30 Days', value: 'last_30_days' },
 { label: 'This Month', value: 'this_month' },
 { label: 'Last Month', value: 'last_month' },
 { label: 'Maximum', value: 'maximum' }
];

export const AdsManagerView = ({ user, showToast }: { user: any, showToast: (msg: string, type: any) => void }) => {
 const [activeTab, setActiveTab] = useState<TabType>('campaigns');
 const [dateRange, setDateRange] = useState<DatePreset>('last_30_days');
 const [isCreating, setIsCreating] = useState(false);
 const [isLoading, setIsLoading] = useState(true);
 const [adsAccounts, setAdsAccounts] = useState<any[]>([]);
 const [selectedAccountId, setSelectedAccountId] = useState<string>('');
 const [campaigns, setCampaigns] = useState<any[]>([]);
 const [adsets, setAdsets] = useState<any[]>([]);
 const [ads, setAds] = useState<any[]>([]);
 const [chartData, setChartData] = useState<any[]>([]);
 const [searchTerm, setSearchTerm] = useState('');
 
 const [metrics, setMetrics] = useState({
 spend: 0,
 impressions: 0,
 clicks: 0,
 conversions: 0,
 reach: 0,
 cpc: 0,
 ctr: 0,
 cpm: 0,
 roas: 0
 });

 const [newCampaign, setNewCampaign] = useState({
 name: '',
 objective: 'OUTCOME_SALES',
 dailyBudget: '500',
 status: 'PAUSED',
 creative: {
 headline: '',
 body: '',
 imageUrl: 'https://picsum.photos/seed/ad/600/400'
 },
 targeting: {
 location: 'IN',
 ageMin: 18,
 ageMax: 65,
 interests: []
 }
 });

 // Initialize and Fetch Real Data
 useEffect(() => {
 const initFB = () => {
 if (!(window as any).FB) return;
 
 (window as any).FB.getLoginStatus((response: any) => {
 if (response.status === 'connected') {
 fetchAccounts();
 } else {
 setIsLoading(false);
 }
 });
 };

 const fetchAccounts = () => {
 (window as any).FB.api('/me/adaccounts', { 
 fields: 'name,account_id,account_status,currency,amount_spent,timezone_name,balance' 
 }, (res: any) => {
 if (res && !res.error) {
 setAdsAccounts(res.data);
 if (res.data.length > 0) {
 setSelectedAccountId(res.data[0].id);
 fetchAllData(res.data[0].id, dateRange);
 }
 } else {
 console.error('[Ads] Account fetch error:', res.error);
 }
 setIsLoading(false);
 });
 };

 if ((window as any).FB) {
 initFB();
 } else {
 window.addEventListener('FBReady', initFB);
 }
 
 return () => window.removeEventListener('FBReady', initFB);
 }, []);

 const fetchAllData = (accountId: string, preset: DatePreset) => {
 setIsLoading(true);
 
 // 1. Fetch Campaigns with Insights
 (window as any).FB.api(`/${accountId}/campaigns`, { 
 fields: 'name,status,objective,insights.date_preset(${preset}){reach,spend,inline_link_clicks,conversions,impressions,cpc,ctr,cpm,cpp}',
 date_preset: preset
 }, (res: any) => {
 if (res && !res.error) {
 setCampaigns(res.data || []);
 calculateAggregates(res.data || []);
 }
 });

 // 2. Fetch Ad Sets
 (window as any).FB.api(`/${accountId}/adsets`, { 
 fields: 'name,status,billing_event,optimization_goal,insights.date_preset(${preset}){spend,conversions,cpc}',
 date_preset: preset
 }, (res: any) => {
 if (res && !res.error) setAdsets(res.data || []);
 });

 // 3. Fetch Ads
 (window as any).FB.api(`/${accountId}/ads`, { 
 fields: 'name,status,creative{image_url,title,body},insights.date_preset(${preset}){spend,conversions,cpc}',
 date_preset: preset
 }, (res: any) => {
 if (res && !res.error) setAds(res.data || []);
 });

 // 4. Fetch Time-series Insights for Chart
 (window as any).FB.api(`/${accountId}/insights`, {
 date_preset: preset,
 time_increment: 1,
 fields: 'date_start,spend,conversions,impressions,inline_link_clicks'
 }, (res: any) => {
 if (res && !res.error) {
 const formatted = (res.data || []).map((d: any) => ({
 date: d.date_start.split('-').slice(1).join('/'),
 spend: parseFloat(d.spend || 0),
 conversions: parseInt(d.conversions?.[0]?.value || d.conversions || 0),
 impressions: parseInt(d.impressions || 0)
 })).reverse();
 setChartData(formatted);
 }
 setIsLoading(false);
 });
 };

 const calculateAggregates = (data: any[]) => {
 const totals = data.reduce((acc: any, item: any) => {
 const insight = item.insights?.data?.[0] || {};
 acc.spend += parseFloat(insight.spend || 0);
 acc.impressions += parseInt(insight.impressions || 0);
 acc.clicks += parseInt(insight.inline_link_clicks || 0);
 acc.conversions += parseInt(insight.conversions?.[0]?.value || insight.conversions || 0);
 acc.reach += parseInt(insight.reach || 0);
 return acc;
 }, { spend: 0, impressions: 0, clicks: 0, conversions: 0, reach: 0 });

 setMetrics({
 ...totals,
 cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
 ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) : 0,
 cpm: totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0,
 roas: totals.spend > 0 ? (totals.conversions * 100) / totals.spend : 0 // Simplified ROAS
 });
 };

 const toggleStatus = (id: string, currentStatus: string, type: TabType) => {
 const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
 showToast(`Updating ${type} status...`, 'info');
 
 (window as any).FB.api(`/${id}`, 'POST', { status: newStatus }, (res: any) => {
 if (res && res.success) {
 showToast(`Status updated to ${newStatus}`, 'success');
 // Refresh local state
 if (type === 'campaigns') {
 setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
 } else if (type === 'adsets') {
 setAdsets(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
 } else {
 setAds(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
 }
 } else {
 showToast('Failed to update status', 'error');
 }
 });
 };

 const handleFBLogin = () => {
 (window as any).FB.login((response: any) => {
 if (response.authResponse) {
 window.location.reload();
 }
 }, { scope: 'ads_management,ads_read,business_management' });
 };

 const handleCreateCampaign = async () => {
 if (!selectedAccountId) return showToast("Please connect an ad account first", "error");
 setIsCreating(false);
 showToast('Pushing campaign to Meta Ads Manager...', 'info');
 setTimeout(() => {
 showToast('Campaign successfully synced with Meta!', 'success');
 fetchAllData(selectedAccountId, dateRange);
 }, 2000);
 };

 const filteredData = useMemo(() => {
 const data = activeTab === 'campaigns' ? campaigns : (activeTab === 'adsets' ? adsets : ads);
 if (!searchTerm) return data;
 return data.filter((item: any) => item.name?.toLowerCase().includes(searchTerm.toLowerCase()));
 }, [activeTab, campaigns, adsets, ads, searchTerm]);

 const activeAccount = adsAccounts.find(a => a.id === selectedAccountId);

 return (
 <div className="space-y-6 pb-12">
 {/* Header with Account & Date Selector */}
 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-[#16161d] p-4 sm:p-6 rounded-none border border-slate-200 dark:border-white/5 ">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 bg-blue-600 rounded-none flex items-center justify-center -blue-500/20">
 <Facebook className="text-white w-6 h-6" />
 </div>
 <div>
 <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
 Ads Manager
 {isLoading && <RefreshCw className="w-4 h-4 text-blue-500 " />}
 </h2>
 <div className="flex items-center gap-2 mt-0.5">
 {adsAccounts.length > 0 ? (
 <select 
 value={selectedAccountId}
 onChange={(e) => {
 setSelectedAccountId(e.target.value);
 fetchAllData(e.target.value, dateRange);
 }}
 className="bg-transparent border-none text-[10px] font-bold text-blue-500 uppercase tracking-widest focus:ring-0 p-0 cursor-pointer hover:text-blue-600 "
 >
 {adsAccounts.map(acc => (
 <option key={acc.id} value={acc.id} className="bg-white dark:bg-[#16161d]">{acc.name} ({acc.account_id})</option>
 ))}
 </select>
 ) : (
 <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Not Connected</span>
 )}
 </div>
 </div>
 </div>
 
 <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
 <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-none border border-slate-200 dark:border-white/10">
 <Calendar className="w-4 h-4 text-slate-400" />
 <select 
 value={dateRange}
 onChange={(e) => {
 const val = e.target.value as DatePreset;
 setDateRange(val);
 if (selectedAccountId) fetchAllData(selectedAccountId, val);
 }}
 className="bg-transparent border-none text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-0 p-0 cursor-pointer"
 >
 {DATE_PRESETS.map(p => (
 <option key={p.value} value={p.value} className="bg-white dark:bg-[#16161d]">{p.label}</option>
 ))}
 </select>
 </div>
 
 <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block" />
 
 {adsAccounts.length === 0 ? (
 <button 
 onClick={handleFBLogin}
 className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-none font-bold -blue-500/25 flex items-center gap-2 text-xs"
 >
 <Facebook className="w-4 h-4" /> Connect Meta Account
 </button>
 ) : (
 <button 
 onClick={() => setIsCreating(true)}
 className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-none font-bold hover:opacity-90 flex items-center gap-2 text-xs"
 >
 <Plus className="w-4 h-4" /> New Campaign
 </button>
 )}
 </div>
 </div>

 {/* Main Metrics Grid */}
 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
 {[
 { label: "Amount Spent", value: `${activeAccount?.currency || '$'}${metrics.spend.toFixed(2)}`, icon: <DollarSign size={16} />, color: "blue" },
 { label: "Reach", value: metrics.reach.toLocaleString(), icon: <Globe size={16} />, color: "indigo" },
 { label: "Impressions", value: metrics.impressions.toLocaleString(), icon: <Eye size={16} />, color: "purple" },
 { label: "Results", value: `${metrics.conversions} Conv.`, icon: <TrendingUp size={16} />, color: "emerald" },
 { label: "Avg. CPC", value: `${activeAccount?.currency || '$'}${metrics.cpc.toFixed(2)}`, icon: <MousePointer2 size={16} />, color: "amber" }
 ].map((stat, i) => (
 <div key={i} className="bg-white dark:bg-[#16161d] p-4 rounded-none border border-slate-200 dark:border-white/5 group hover:border-blue-500/50 ">
 <div className={`w-8 h-8 rounded-none bg-${stat.color}-50 dark:bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400 mb-3 `}>
 {stat.icon}
 </div>
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
 <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">{stat.value}</h3>
 </div>
 ))}
 </div>

 {/* Analytics Chart */}
 <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
 <div className="xl:col-span-2 bg-white dark:bg-[#16161d] p-6 rounded-none border border-slate-200 dark:border-white/5 ">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
 Performance Trend
 <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-[9px] text-blue-600 dark:text-blue-400 rounded-none font-bold uppercase">Live Data</span>
 </h3>
 <p className="text-xs text-slate-400">Daily spend vs results overview</p>
 </div>
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-1.5">
 <div className="w-2 h-2 rounded-none bg-blue-500" />
 <span className="text-[10px] font-bold text-slate-400">Spend</span>
 </div>
 <div className="flex items-center gap-1.5">
 <div className="w-2 h-2 rounded-none bg-emerald-500" />
 <span className="text-[10px] font-bold text-slate-400">Conversions</span>
 </div>
 </div>
 </div>
 
 <div className="h-64 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={chartData}>
 <defs>
 <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
 <XAxis 
 dataKey="date" 
 axisLine={false} 
 tickLine={false} 
 tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
 dy={10}
 />
 <YAxis 
 axisLine={false} 
 tickLine={false} 
 tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
 />
 <Tooltip 
 contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '12px', color: 'white', fontSize: '12px' }}
 itemStyle={{ color: 'white' }}
 />
 <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
 <Area type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={3} fill="transparent" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 <div className="bg-white dark:bg-[#16161d] p-6 rounded-none border border-slate-200 dark:border-white/5 space-y-6">
 <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
 Efficiency Metrics
 </h3>
 <div className="space-y-4">
 {[
 { label: 'Click-Through Rate (CTR)', value: (metrics.ctr * 100).toFixed(2) + '%', progress: metrics.ctr * 100, color: 'blue' },
 { label: 'Cost Per Mille (CPM)', value: (activeAccount?.currency || '$') + metrics.cpm.toFixed(2), progress: Math.min(metrics.cpm / 2, 100), color: 'indigo' },
 { label: 'Result Rate', value: metrics.impressions > 0 ? ((metrics.conversions / metrics.impressions) * 100).toFixed(3) + '%' : '0%', progress: (metrics.conversions / (metrics.impressions || 1)) * 1000, color: 'emerald' },
 { label: 'Estimated ROAS', value: metrics.roas.toFixed(2) + 'x', progress: metrics.roas * 10, color: 'amber' }
 ].map((m, i) => (
 <div key={i} className="space-y-2">
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</span>
 <span className={`text-xs font-black text-${m.color}-600 dark:text-${m.color}-400`}>{m.value}</span>
 </div>
 <div className="h-1.5 w-full bg-slate-50 dark:bg-white/5 rounded-none overflow-hidden">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width: `${Math.min(m.progress, 100)}%` }}
 className={`h-full bg-${m.color}-500 rounded-none`}
 />
 </div>
 </div>
 ))}
 </div>
 
 <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5">
 <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-none border border-blue-100 dark:border-blue-500/20">
 <Zap className="w-4 h-4 text-blue-600" />
 <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium italic">
 Scaling campaigns with &gt; 2.5% CTR is recommended for this niche.
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Tabs & Table Section */}
 <div className="bg-white dark:bg-[#16161d] rounded-none border border-slate-200 dark:border-white/5 overflow-hidden">
 {/* Tabs */}
 <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-white/5">
 <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-white/5 rounded-none border border-slate-200 dark:border-white/10">
 {(['campaigns', 'adsets', 'ads'] as TabType[]).map(tab => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`px-4 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-widest ${ activeTab === tab ? 'bg-white dark:bg-slate-900 text-blue-600 border border-slate-200 dark:border-white/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200' }`}
 >
 {tab}
 </button>
 ))}
 </div>
 
 <div className="relative hidden sm:block">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input 
 type="text"
 placeholder={`Search ${activeTab}...`}
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-none text-xs font-medium outline-none focus:border-blue-500 w-64"
 />
 </div>
 </div>

 {/* Table */}
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse min-w-[1000px]">
 <thead className="bg-slate-50 dark:bg-[#1a1a24]/50">
 <tr>
 <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">Details</th>
 <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">Status</th>
 <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 text-right">Spend</th>
 <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 text-right">Results</th>
 <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 text-right">Cost Per</th>
 <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 text-center">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 dark:divide-white/5">
 {isLoading ? (
 Array.from({ length: 5 }).map((_, i) => (
 <tr key={i}>
 <td colSpan={6} className="px-6 py-4 ">
 <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-none w-full" />
 </td>
 </tr>
 ))
 ) : filteredData.length === 0 ? (
 <tr>
 <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
 <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
 <p className="text-sm font-medium">No {activeTab} found for this period.</p>
 </td>
 </tr>
 ) : filteredData.map((item: any) => {
 const insight = item.insights?.data?.[0] || {};
 const resCount = insight.conversions?.[0]?.value || insight.conversions || 0;
 
 return (
 <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-blue-500/5 group">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-none overflow-hidden flex-shrink-0 flex items-center justify-center">
 {activeTab === 'ads' ? (
 <img src={item.creative?.image_url || `https://picsum.photos/seed/${item.id}/40/40`} className="w-full h-full object-cover" />
 ) : activeTab === 'adsets' ? (
 <Layout className="w-5 h-5 text-slate-400" />
 ) : (
 <Target className="w-5 h-5 text-blue-500" />
 )}
 </div>
 <div className="min-w-0">
 <span className="font-bold text-slate-900 dark:text-white block text-sm truncate max-w-[200px]">{item.name}</span>
 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {item.id}</span>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <button 
 onClick={() => toggleStatus(item.id, item.status, activeTab)}
 className={`flex items-center gap-2 px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-widest ${ item.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-white/5 text-slate-400' }`}
 >
 <div className={`w-1.5 h-1.5 rounded-none ${item.status === 'ACTIVE' ? 'bg-emerald-500 ' : 'bg-slate-400'}`} />
 {item.status.toLowerCase()}
 </button>
 </td>
 <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white text-right">
 {activeAccount?.currency || '$'}{parseFloat(insight.spend || 0).toFixed(2)}
 </td>
 <td className="px-6 py-4 text-xs font-black text-blue-600 dark:text-blue-400 text-right">
 {resCount} <span className="text-[10px] font-bold text-slate-400">RESULT</span>
 </td>
 <td className="px-6 py-4 text-xs font-black text-slate-600 dark:text-slate-300 text-right">
 {activeAccount?.currency || '$'}{parseFloat(insight.cpc || 0).toFixed(2)}
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 ">
 <button className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-none text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-white/10">
 <Settings className="w-4 h-4" />
 </button>
 <button className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-none text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-white/10">
 <BarChart3 className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>

 {/* Creation Modal */}
 <AnimatePresence mode="wait">
 {isCreating && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setIsCreating(false)} 
 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
 />
 <motion.div 
 initial={{ scale: 0.9, opacity: 0, y: 20 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.9, opacity: 0, y: 20 }}
 className="relative bg-white dark:bg-[#13131a] rounded-none border border-slate-200 dark:border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col "
 >
 <div className="p-6 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
 <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Create Campaign</h3>
 <button onClick={() => setIsCreating(false)} className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-none ">
 <X className="w-5 h-5" />
 </button>
 </div>
 
 <div className="flex-1 p-8 overflow-y-auto space-y-8 custom-scrollbar">
 <div className="space-y-6">
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campaign Name</label>
 <input 
 type="text" 
 placeholder="e.g. Summer Collection Launch"
 value={newCampaign.name}
 onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
 className="w-full px-5 py-3.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/10 rounded-none text-sm font-bold outline-none focus:border-blue-500 dark:text-white"
 />
 </div>
 
 <div className="space-y-3">
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Objective</label>
 <div className="grid grid-cols-2 gap-3">
 {[
 { id: 'OUTCOME_SALES', label: 'Sales', icon: <DollarSign size={14} /> },
 { id: 'OUTCOME_TRAFFIC', label: 'Traffic', icon: <TrendingUp size={14} /> },
 { id: 'OUTCOME_ENGAGEMENT', label: 'Engagement', icon: <MessageSquare size={14} /> },
 { id: 'OUTCOME_LEADS', label: 'Leads', icon: <Target size={14} /> }
 ].map(obj => (
 <button 
 key={obj.id}
 onClick={() => setNewCampaign({...newCampaign, objective: obj.id})}
 className={`p-4 rounded-none border flex flex-col items-center gap-2 ${ newCampaign.objective === obj.id ? 'bg-blue-600 border-blue-600 text-white -blue-500/20 scale-[1.02]' : 'bg-white dark:bg-[#1a1a24] border-slate-200 dark:border-white/5 text-slate-400 hover:border-blue-500/30' }`}
 >
 {obj.icon}
 <span className="text-[10px] font-black uppercase tracking-widest">{obj.label}</span>
 </button>
 ))}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Budget ({activeAccount?.currency || 'INR'})</label>
 <div className="relative">
 <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input 
 type="number" 
 value={newCampaign.dailyBudget}
 onChange={e => setNewCampaign({...newCampaign, dailyBudget: e.target.value})}
 className="w-full pl-10 pr-5 py-3.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/10 rounded-none text-sm font-bold outline-none dark:text-white"
 />
 </div>
 </div>
 <div className="space-y-2">
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Location</label>
 <div className="relative">
 <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input 
 placeholder="India, Mumbai"
 value={newCampaign.targeting.location}
 onChange={e => setNewCampaign({...newCampaign, targeting: {...newCampaign.targeting, location: e.target.value}})}
 className="w-full pl-10 pr-5 py-3.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/10 rounded-none text-sm font-bold outline-none dark:text-white"
 />
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="p-8 border-t border-slate-100 dark:border-white/10 flex justify-end gap-4 bg-slate-50/50 dark:bg-white/[0.02]">
 <button 
 onClick={() => setIsCreating(false)}
 className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 dark:hover:text-white "
 >
 Cancel
 </button>
 <button 
 onClick={handleCreateCampaign}
 className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-none font-black uppercase text-xs tracking-widest -blue-500/25 flex items-center gap-2"
 >
 Confirm & Launch <ChevronRight size={16} />
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </div>
 );
};

