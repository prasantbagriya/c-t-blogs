import React from 'react';
import { motion } from 'motion/react';
import {
 MessageSquare,
 Send,
 TrendingUp,
 Activity,
 ArrowUpRight,
 Zap,
 Star,
 Users,
 BarChart3,
} from 'lucide-react';
import {
 AreaChart,
 Area,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 PieChart,
 Pie,
 Cell,
} from 'recharts';
import type { DashboardTab } from './DashboardLayout';

interface DashboardOverviewProps {
 campaigns: any[];
 messages: any[];
 setActiveTab: (tab: DashboardTab) => void;
 setActiveSubTab: (tab: string) => void;
}

const STATS = (totalSent: number, activeCampaigns: number, successCount: number, revenue: number = 24500) => [
 {
 label: 'Total Revenue',
 value: `₹${revenue.toLocaleString()}`,
 icon: <BarChart3 style={{ width: '18px', height: '18px' }} />,
 color: '#8b5cf6',
 },
 {
 label: 'Social Reach',
 value: '12.4K',
 icon: <Zap style={{ width: '18px', height: '18px' }} />,
 color: '#000000',
 },
 {
 label: 'Total Leads',
 value: (successCount * 2).toLocaleString(),
 icon: <Users style={{ width: '18px', height: '18px' }} />,
 color: '#3b82f6',
 },
 {
 label: 'Flow Completion',
 value: '68.5%',
 icon: <TrendingUp style={{ width: '18px', height: '18px' }} />,
 color: '#f59e0b',
 },
];

const CHART_DATA_EMPTY = [];

const PIE_DATA = [
 { name: 'WhatsApp', value: 100, color: '#10b981' },
];

export default function DashboardOverview({
 campaigns,
 messages,
 setActiveTab,
 setActiveSubTab,
}: DashboardOverviewProps) {
 const [isMobile, setIsMobile] = React.useState(false);

 React.useEffect(() => {
 const check = () => setIsMobile(window.innerWidth < 1024);
 check();
 window.addEventListener('resize', check);
 return () => window.removeEventListener('resize', check);
 }, []);

 // Calculate Channel Share
 const channelStats = messages.reduce((acc: any, m: any) => {
 const source = m.source === 'widget' || m.source === 'website' ? 'Website' : 
 m.source === 'instagram' ? 'Instagram' :
 m.source === 'threads' ? 'Threads' : 'WhatsApp';
 acc[source] = (acc[source] || 0) + 1;
 return acc;
 }, {});

 const totalMessages = messages.length || 1;
 const pieData = Object.entries(channelStats).map(([name, count]) => ({
 name,
 value: Math.round(((count as number) / totalMessages) * 100),
 color: name === 'WhatsApp' ? '#10b981' : 
 name === 'Instagram' ? '#ec4899' :
 name === 'Threads' ? '#000000' : '#6366f1'
 })).sort((a, b) => b.value - a.value);

 const totalSent = campaigns.reduce((acc, c) => acc + (c.totalRecipients || c.sent || 0), 0);
 const successCount = campaigns.reduce((acc, c) => acc + (c.successCount || 0), 0);
 const activeCampaigns = campaigns.length;

 const chartData =
 campaigns.length > 0
 ? campaigns.slice(-7).map((c) => ({
 name: c.timestamp?.toDate ? c.timestamp.toDate().toLocaleDateString([], { weekday: 'short' }) : 'Campaign',
 messages: c.totalRecipients || c.sent || 0,
 delivered: c.successCount || 0,
 }))
 : CHART_DATA_EMPTY;

 const stats = STATS(totalSent, activeCampaigns, successCount);

 return (
 <div className="flex flex-col gap-6">

 {/* Header */}
 <div className="flex flex-col gap-1">
 <h1 className="text-xl font-medium text-slate-900 dark:text-white">Dashboard Overview</h1>
 <p className="text-[10px] text-slate-700 dark:text-slate-200 font-medium">Platform activity and performance summary.</p>
 </div>

 {/* Stat Cards (No Shadows) */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
 {stats.map((stat, i) => (
 <div
 key={i}
 className="bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 p-4 rounded-none flex flex-col gap-3"
 >
 <div className="flex items-center gap-2">
 <div 
 className="w-8 h-8 rounded-none flex items-center justify-center text-white"
 style={{ background: stat.color }}
 >
 {stat.icon}
 </div>
 <span className="text-[8px] font-medium text-slate-700 dark:text-slate-200 uppercase tracking-widest">{stat.label}</span>
 </div>
 <div className="text-xl font-medium text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
 </div>
 ))}
 </div>

 {/* Charts (No Shadows) */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
 <div className="lg:col-span-8 bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 p-4 rounded-none">
 <h3 className="text-xs font-medium text-slate-900 dark:text-white mb-6 uppercase tracking-widest">Message Analytics</h3>
 <div className="h-48">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={chartData}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
 <Tooltip />
 <Area type="monotone" dataKey="messages" stroke="#3b82f6" fill="#3b82f620" strokeWidth={1.5} />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 <div className="lg:col-span-4 bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 p-4 rounded-none">
 <h3 className="text-xs font-medium text-slate-900 dark:text-white mb-6 uppercase tracking-widest">Channel Share</h3>
 <div className="h-40">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={pieData} innerRadius={35} outerRadius={50} dataKey="value" strokeWidth={0}>
 {pieData.map((entry, index) => (
 <Cell key={index} fill={entry.color} />
 ))}
 </Pie>
 </PieChart>
 </ResponsiveContainer>
 </div>
 <div className="mt-4 space-y-2">
 {pieData.map(item => (
 <div key={item.name} className="flex justify-between items-center text-xs font-semibold">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-none" style={{ background: item.color }} />
 <span className="text-slate-500">{item.name}</span>
 </div>
 <span className="text-slate-900 dark:text-slate-200">{item.value}%</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Quick Action (Fluid Banner) */}
 <div className="bg-slate-900 dark:bg-blue-900 p-8 rounded-none flex flex-col md:flex-row items-center justify-between gap-6">
 <div>
 <h3 className="text-xl font-bold text-white">Start a new campaign</h3>
 <p className="text-sm text-slate-400 mt-1">Ready to scale your business messaging?</p>
 </div>
 <button 
 onClick={() => { setActiveTab('whatsapp'); setActiveSubTab('bulksend'); }}
 className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-none whitespace-nowrap"
 >
 Create Broadcast
 </button>
 </div>
 </div>
 );
}
