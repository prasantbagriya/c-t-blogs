import React from 'react';
import { 
 BarChart3, 
 CheckCircle2, 
 Send, 
 UserCheck, 
 TrendingUp, 
 DollarSign,
 Globe,
 ShieldCheck,
 Calendar
} from 'lucide-react';

function cn(...classes: (string | false | undefined | null)[]) {
 return classes.filter(Boolean).join(' ');
}

interface CampaignReportProps {
 campaign: any;
 insights: any;
 accountName: string;
}

export default function CampaignReport({ campaign, insights, accountName }: CampaignReportProps) {
 const reportDate = new Date().toLocaleString('en-IN', {
 dateStyle: 'long',
 timeStyle: 'short'
 });

 const stats = [
 { label: 'Total Sent', value: insights?.sent || campaign.totalRecipients || 0, icon: <Send size={16} /> },
 { label: 'Delivered', value: insights?.delivered || 0, icon: <UserCheck size={16} /> },
 { label: 'Read Count', value: insights?.read || 0, icon: <CheckCircle2 size={16} /> },
 { label: 'Replies', value: insights?.replied || 0, icon: <TrendingUp size={16} /> }
 ];

 return (
 <div id="campaign-report-capture" className="bg-white text-slate-900 px-3 py-4 lg:p-10 w-full lg:w-[850px] mx-auto border-0 lg:border-2 border-slate-900 font-sans">
 
 {/* ── HEADER ────────────────────────────────────────── */}
 <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-4 border-slate-900 pb-8 mb-8 px-2 sm:px-0">
 <div className="flex items-center gap-3 sm:gap-4">
 <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-none flex items-center justify-center text-white -blue-500/20 flex-shrink-0">
 <BarChart3 size={24} sm:size={32} />
 </div>
 <div>
 <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">ChatWizs</h1>
 <p className="text-[8px] sm:text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1">Campaign Insight Report</p>
 </div>
 </div>
 <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 px-2 sm:px-0">
 <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-none text-blue-700 text-[10px] font-black uppercase mb-2">
 <ShieldCheck size={12} /> Meta Verified
 </div>
 <p className="text-[9px] sm:text-[10px] font-bold text-slate-900">Generated on</p>
 <p className="text-[10px] sm:text-xs font-black text-slate-900">{reportDate}</p>
 </div>
 </div>

 {/* ── CAMPAIGN OVERVIEW ──────────────────────────────── */}
 <div className="grid grid-cols-2 gap-4 lg:gap-8 mb-10 px-2 lg:px-0">
 <div className="col-span-2 lg:col-span-1">
 <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2">Campaign Metadata</h2>
 <div className="space-y-2">
 <div className="flex justify-between py-2 border-b border-slate-200">
 <span className="text-[10px] sm:text-xs font-bold text-slate-900">Campaign Name</span>
 <span className="text-[10px] sm:text-xs font-black text-slate-900 uppercase truncate max-w-[150px]">{campaign.name}</span>
 </div>
 <div className="flex justify-between py-2 border-b border-slate-200">
 <span className="text-[10px] sm:text-xs font-bold text-slate-900">Account Name</span>
 <span className="text-[10px] sm:text-xs font-black text-slate-900 uppercase truncate max-w-[150px]">{accountName}</span>
 </div>
 </div>
 </div>
 <div className="col-span-2 lg:col-span-1 bg-slate-50 rounded-none p-4 sm:p-6 border-2 border-slate-900">
 <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-4">Meta Billed</h2>
 <div className="flex items-baseline gap-2">
 <span className="text-2xl sm:text-4xl font-black text-slate-900">
 ₹{(insights?.estimatedCost || 0).toFixed(2)}
 </span>
 <span className="text-[10px] sm:text-xs font-bold text-slate-900 uppercase">INR</span>
 </div>
 </div>
 </div>

 {/* ── CORE METRICS ───────────────────────────────────── */}
 <div className="mb-10 px-1 lg:px-0">
 <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center">Performance Funnel</h2>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
 {stats.map(s => (
 <div key={s.label} className="p-2 sm:p-4 border border-slate-200 rounded-none text-center">
 <div className="flex justify-center mb-1 sm:mb-2 text-blue-600">{React.cloneElement(s.icon as React.ReactElement, { size: 14 })}</div>
 <p className="text-sm sm:text-[18px] font-black text-slate-900 mb-0.5">{s.value}</p>
 <p className="text-[7px] sm:text-[9px] font-bold uppercase text-slate-400 tracking-widest">{s.label}</p>
 </div>
 ))}
 </div>
 </div>

 {/* ── PERFORMANCE TABLE ──────────────────────────────── */}
 <div className="mb-10">
 <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Metric Distribution Table</h2>
 <div className="overflow-x-auto -mx-1 px-1">
 <table className="w-full text-left border-collapse min-w-[500px]">
 <thead>
 <tr className="bg-slate-900 text-white">
 <th className="p-3 text-[10px] font-black uppercase tracking-widest rounded-none">KPI Metric</th>
 <th className="p-3 text-[10px] font-black uppercase tracking-widest">Total Count</th>
 <th className="p-3 text-[10px] font-black uppercase tracking-widest">Percentage</th>
 <th className="p-3 text-[10px] font-black uppercase tracking-widest rounded-none text-right">Benchmark</th>
 </tr>
 </thead>
 <tbody className="text-[11px] sm:text-xs">
 <tr className="border-b-2 border-slate-900">
 <td className="p-3 sm:p-4 font-bold text-slate-900">Message Delivery</td>
 <td className="p-3 sm:p-4 font-black text-slate-900">{insights?.delivered || 0}</td>
 <td className="p-3 sm:p-4 font-black text-blue-700">
 {campaign.totalRecipients > 0 ? ((insights?.delivered / campaign.totalRecipients) * 100).toFixed(1) : '0'}%
 </td>
 <td className="p-3 sm:p-4 text-right text-slate-900 font-bold">~94.0%</td>
 </tr>
 <tr className="border-b-2 border-slate-900">
 <td className="p-3 sm:p-4 font-bold text-slate-900">Open/Read Rate</td>
 <td className="p-3 sm:p-4 font-black text-slate-900">{insights?.read || 0}</td>
 <td className="p-3 sm:p-4 font-black text-emerald-700">
 {insights?.delivered > 0 ? ((insights?.read / insights.delivered) * 100).toFixed(1) : '0'}%
 </td>
 <td className="p-3 sm:p-4 text-right text-slate-900 font-bold">~72.0%</td>
 </tr>
 <tr className="border-b-2 border-slate-900">
 <td className="p-3 sm:p-4 font-bold text-slate-900">Response Rate</td>
 <td className="p-3 sm:p-4 font-black text-slate-900">{insights?.replied || 0}</td>
 <td className="p-3 sm:p-4 font-black text-rose-700">
 {insights?.read > 0 ? ((insights?.replied / insights.read) * 100).toFixed(1) : '0'}%
 </td>
 <td className="p-3 sm:p-4 text-right text-slate-900 font-bold">~8.5%</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 {/* ── FOOTER ─────────────────────────────────────────── */}
 <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
 <div>
 <p className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase">ChatWiz Analytics Engine v2.0</p>
 <p className="text-[8px] text-slate-400 font-bold max-w-[300px] mt-2">
 This report is generated using the Meta Graph API and reflects data provided by WhatsApp Business Servers.
 </p>
 </div>
 <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
 <div className="flex items-center gap-2 mb-2 text-blue-600">
 <Globe size={12} />
 <span className="text-[8px] sm:text-[10px] font-bold tracking-tighter uppercase whitespace-nowrap">Global Infrastructure Sync</span>
 </div>
 <p className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase">Ref: PRN-{campaign.id ? campaign.id.slice(-6).toUpperCase() : 'N/A'}</p>
 </div>
 </div>
 </div>
 </div>
 );
}
