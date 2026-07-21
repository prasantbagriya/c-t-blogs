import React from 'react';
import { 
 ArrowLeft, 
 TrendingUp, 
 CreditCard, 
 Zap, 
 Share2, 
 CheckCircle2, 
 ExternalLink, 
 RefreshCw,
 Plus
} from 'lucide-react';
import { 
 AreaChart, 
 Area, 
 XAxis, 
 YAxis, 
 CartesianGrid, 
 Tooltip, 
 ResponsiveContainer 
} from 'recharts';

interface RazorpayDashboardProps {
 payments: any[];
 razorpaySettings: any;
 setShowRazorpayDashboard: (show: boolean) => void;
 setShowLinkModal: (show: boolean) => void;
 API_URL: string;
 showToast: (m: string, t: any) => void;
 searchQuery: string;
 setSearchQuery: (q: string) => void;
 user: any;
}

export const RazorpayDashboard = ({
 payments,
 razorpaySettings,
 setShowRazorpayDashboard,
 setShowLinkModal,
 API_URL,
 showToast,
 searchQuery,
 setSearchQuery,
 user
}: RazorpayDashboardProps) => {
 return (
 <div className="space-y-8 fade-in slide-in-from-right-8 ">
 {/* BACK BUTTON */}
 <div className="flex items-center justify-between">
 <button 
 onClick={() => setShowRazorpayDashboard(false)}
 className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-black text-[10px] uppercase tracking-widest group"
 >
 <ArrowLeft size={16} className="group-hover:-translate-x-1 " /> Back to All Integrations
 </button>
 <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-none border border-emerald-500/20">
 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-none " />
 <span className="text-[10px] font-black uppercase tracking-widest">Razorpay LIVE</span>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* STATS CARDS */}
 <div className="bg-white dark:bg-[#16161d] p-8 rounded-none border border-slate-200 dark:border-white/5 relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-4 opacity-5 "><TrendingUp size={64} /></div>
 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Collection</p>
 <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
 ₹{payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0).toLocaleString()}
 </h2>
 <div className="mt-4 flex items-center gap-2">
 <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-[9px] font-black rounded-none">+12.4%</span>
 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Growth vs Last Month</span>
 </div>
 </div>
 <div className="bg-white dark:bg-[#16161d] p-8 rounded-none border border-slate-200 dark:border-white/5 relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-4 opacity-5 "><CreditCard size={64} /></div>
 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Active Subscriptions</p>
 <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
 {payments.filter(p => p.type === 'subscription' && p.status === 'paid').length}
 </h2>
 <div className="mt-4 flex items-center gap-2">
 <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[9px] font-black rounded-none">Healthy</span>
 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Recurring Revenue</span>
 </div>
 </div>
 <div className="bg-white dark:bg-[#16161d] p-8 rounded-none border border-slate-200 dark:border-white/5 flex flex-col justify-center gap-4 border-dashed border-blue-500/20">
 <button 
 onClick={() => setShowLinkModal(true)}
 className="w-full py-4 bg-blue-600 text-white rounded-none font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 hover:scale-[1.02] -blue-500/20 flex items-center justify-center gap-2"
 >
 <Plus size={18} /> Create Payment Link
 </button>
 <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest opacity-60 italic">Collect payments manually</p>
 </div>
 </div>

 {/* WEBHOOK SETUP CARD */}
 <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-blue-600/20 dark:to-blue-900/20 p-8 rounded-none border border-white/10 relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Zap size={120} className="text-white" /></div>
 <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
 <div className="space-y-4">
 <h3 className="text-xl font-black text-white uppercase tracking-tight">Webhook Configuration</h3>
 <p className="text-sm text-slate-300 leading-relaxed max-w-md">
 To automate WhatsApp payment status updates, copy this URL to your Razorpay Dashboard 
 <strong> (Settings &rsaquo; Webhooks)</strong>. Use event: <code>payment.captured</code>.
 </p>
 <div className="flex items-center gap-2">
 <input 
 readOnly 
 value={`${API_URL}/payments/razorpay/webhook`} 
 className="flex-grow px-4 py-3 bg-white/10 border border-white/20 rounded-none text-xs font-mono text-white outline-none"
 />
 <button 
 onClick={() => { navigator.clipboard.writeText(`${API_URL}/payments/razorpay/webhook`); showToast('Copied to clipboard!', 'success'); }}
 className="p-3 bg-white/10 hover:bg-white/20 rounded-none text-white "
 >
 <Share2 size={16} />
 </button>
 </div>
 </div>
 <div className="bg-white/5 rounded-none p-6 border border-white/10">
 <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Recommended Settings</h4>
 <ul className="space-y-3">
 <li className="flex items-center gap-3 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
 <CheckCircle2 size={14} className="text-emerald-500" /> Webhook Secret: <code>{razorpaySettings?.webhookSecret || 'Not Set'}</code>
 </li>
 <li className="flex items-center gap-3 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
 <CheckCircle2 size={14} className="text-emerald-500" /> Events: payment.captured, payment.failed
 </li>
 </ul>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* REVENUE CHART */}
 <div className="bg-white dark:bg-[#16161d] rounded-none border border-slate-200 dark:border-white/5 overflow-hidden ">
 <div className="p-8 border-b border-slate-50 dark:border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-600/5 to-transparent">
 <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
 <TrendingUp className="text-blue-600" size={18} /> Revenue Trends
 </h3>
 </div>
 <div className="px-8 py-10 bg-slate-50/50 dark:bg-white/5">
 <div className="h-[280px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={
 Array.from({ length: 7 }, (_, i) => {
 const d = new Date();
 d.setDate(d.getDate() - (6 - i));
 const dateStr = d.toLocaleDateString();
 const dailyTotal = payments
 .filter(p => p.status === 'paid' && new Date(p.createdAt).toLocaleDateString() === dateStr)
 .reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
 return { name: dateStr.split('/')[0] + '/' + dateStr.split('/')[1], amount: dailyTotal };
 })
 }>
 <defs>
 <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 800}} />
 <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', padding: '16px' }} />
 <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorMain)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 {/* RECENT TRANSACTIONS */}
 <div className="bg-white dark:bg-[#16161d] rounded-none border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col">
 <div className="p-8 border-b border-slate-50 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Transaction History</h3>
 <div className="relative w-full sm:w-64">
 <input 
 type="text" 
 placeholder="Search Customer or ID..." 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 rounded-none outline-none text-[10px] font-bold dark:text-white border border-transparent focus:border-blue-500/50 "
 />
 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
 </div>
 </div>
 </div>
 <div className="flex-grow overflow-auto max-h-[450px] custom-scrollbar">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
 <th className="px-8 py-4 text-[9px] font-black uppercase text-slate-400">Customer</th>
 <th className="px-8 py-4 text-[9px] font-black uppercase text-slate-400">Amount</th>
 <th className="px-8 py-4 text-[9px] font-black uppercase text-slate-400">Status</th>
 <th className="px-8 py-4 text-[9px] font-black uppercase text-slate-400 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-50 dark:divide-white/5">
 {payments.filter(p => 
 (p.customerInfo?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
 (p.orderId || '').toLowerCase().includes(searchQuery.toLowerCase())
 ).map(pay => (
 <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 group">
 <td className="px-8 py-5">
 <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{pay.customerInfo?.name || 'Guest User'}</p>
 <p className="text-[9px] text-slate-400 font-mono tracking-tighter uppercase">{pay.orderId}</p>
 <p className="text-[8px] text-slate-400 mt-1">{new Date(pay.createdAt).toLocaleDateString()} {new Date(pay.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
 </td>
 <td className="px-8 py-5">
 <div className="flex flex-col">
 <span className="font-black text-sm text-slate-900 dark:text-white">₹{pay.amount}</span>
 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{pay.type || 'One-time'}</span>
 </div>
 </td>
 <td className="px-8 py-5">
 <span className={`px-2 py-1 rounded-none text-[9px] font-black uppercase tracking-widest ${pay.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : pay.status === 'refunded' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
 {pay.status}
 </span>
 </td>
 <td className="px-8 py-5 text-right">
 <div className="flex justify-end gap-2">
 {pay.status === 'paid' && (
 <button 
 onClick={async () => {
 if(!confirm('Refund this payment?')) return;
 try {
 const res = await fetch(`${API_URL}/payments/razorpay/refund`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ paymentId: pay.paymentId, amount: pay.amount, uid: user.uid })
 });
 const data = await res.json();
 if(data.success) showToast('Refunded!', 'success');
 else throw new Error(data.error);
 } catch(e: any) { showToast(e.message, 'error'); }
 }}
 className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 rounded-none opacity-0 group-hover:opacity-100"
 title="Refund"
 >
 <RefreshCw size={14} />
 </button>
 )}
 <button className="p-2 text-slate-400 hover:text-blue-500 rounded-none opacity-0 group-hover:opacity-100">
 <ExternalLink size={14} />
 </button>
 </div>
 </td>
 </tr>
 ))}
 {payments.length === 0 && (
 <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 text-xs italic uppercase font-bold tracking-widest">No transactions yet</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 );
};
