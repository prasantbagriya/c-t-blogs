import React from 'react';
import { CreditCard, FileText, Share2, RefreshCw } from 'lucide-react';
import { 
 AreaChart, 
 Area, 
 XAxis, 
 YAxis,
 CartesianGrid, 
 Tooltip,
 ResponsiveContainer 
} from 'recharts';

interface PaymentsTabProps {
 payments: any[];
 connections: any[];
 API_URL: string;
 user: any;
 showToast: (m: string, t: any) => void;
}

export const PaymentsTab = ({
 payments,
 connections,
 API_URL,
 user,
 showToast
}: PaymentsTabProps) => {
 return (
 <div className="space-y-4">
 <div className="bg-white dark:bg-[#16161d] rounded-none border border-slate-200 dark:border-white/5 overflow-hidden ">
 <div className="p-6 border-b border-slate-50 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
 <CreditCard size={18} className="text-blue-600" /> Transactions
 </h2>
 <p className="text-xs text-slate-500 mt-0.5">Monitor all your Razorpay payments.</p>
 </div>
 <div className="text-left sm:text-right">
 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Total Revenue</p>
 <p className="text-lg font-black text-emerald-500">
 ₹{payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0).toLocaleString()}
 </p>
 </div>
 </div>

 {/* Analytics Chart */}
 {payments.length > 0 && (
 <div className="px-6 py-4 bg-slate-50/30 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
 <div className="h-[150px] w-full">
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
 <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} />
 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} />
 <Tooltip 
 contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '10px' }}
 />
 <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>
 )}

 {/* GOOGLE SHEETS BANNER */}
 {connections.some(c => c.platform === 'google_sheets') && (
 <div className="m-6 p-5 bg-blue-600/5 dark:bg-blue-500/10 rounded-none border border-blue-100 dark:border-blue-500/20">
 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
 <div className="space-y-1.5">
 <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Automation Webhook</h3>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
 Send data from Google Sheets to this URL to trigger automated flows.
 </p>
 <div className="flex items-center gap-2 mt-2">
 <input 
 readOnly 
 value={`${API_URL}/google-sheets/webhook?uid=${user.uid}`} 
 className="flex-grow px-3 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-none text-[10px] font-mono text-slate-600 dark:text-slate-300 outline-none"
 />
 <button 
 onClick={() => { navigator.clipboard.writeText(`${API_URL}/google-sheets/webhook?uid=${user.uid}`); showToast('Copied!', 'success'); }}
 className="p-1.5 bg-blue-600 text-white rounded-none hover:bg-blue-700 "
 >
 <Share2 size={14} />
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
 <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">Order ID</th>
 <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">Customer</th>
 <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">Amount</th>
 <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">Status</th>
 <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">Date</th>
 <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-50 dark:divide-white/5">
 {payments.map(pay => (
 <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-white/5 group">
 <td className="px-6 py-4 text-[10px] font-mono text-slate-500 truncate max-w-[100px]">{pay.orderId}</td>
 <td className="px-6 py-4">
 <div className="flex flex-col">
 <span className="text-xs font-bold text-slate-900 dark:text-white">{pay.customerInfo?.name || 'Guest'}</span>
 <span className="text-[9px] text-slate-400">{pay.customerInfo?.phone || 'Unknown'}</span>
 </div>
 </td>
 <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-xs">
 {pay.currency || 'INR'} {pay.amount}
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-1.5">
 <div className={`w-1.5 h-1.5 rounded-none ${pay.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
 <span className={`text-[9px] font-bold uppercase tracking-widest ${pay.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
 {pay.status}
 </span>
 </div>
 </td>
 <td className="px-6 py-4 text-[10px] text-slate-400">
 {new Date(pay.createdAt).toLocaleDateString()}
 </td>
 <td className="px-6 py-4 text-right">
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
 if(data.success) showToast('Refund initiated!', 'success');
 else throw new Error(data.error);
 } catch(e: any) { showToast(e.message, 'error'); }
 }}
 className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-none "
 >
 <RefreshCw size={12} />
 </button>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {payments.length === 0 && (
 <div className="px-6 py-12 text-center text-slate-400 text-xs italic">No transactions.</div>
 )}
 </div>
 </div>
 </div>
 );
};
