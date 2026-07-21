import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
 BarChart3, 
 X, 
 Activity, 
 RefreshCw, 
 Send, 
 UserCheck, 
 CheckCircle2, 
 TrendingUp, 
 DollarSign, 
 Check, 
 Clock, 
 Maximize2,
 Plus,
 ArrowLeft,
 ChevronRight
} from 'lucide-react';
import { API_URL, safeJson } from '../../api';
import CampaignReport from '../analytics/CampaignReport';
import { downloadCampaignReport } from '../../utils/reportGenerator';

export const CampaignCard = ({ c, onClick }: { c: any; onClick: () => void; key?: any }) => {
 return (
 <button
 onClick={onClick}
 className="w-full text-left p-5 bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded-none hover:border-blue-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
 >
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-none bg-slate-50 dark:bg-[#16161d] flex items-center justify-center text-slate-700 dark:text-slate-200">
 <BarChart3 size={20} />
 </div>
 <div>
 <div className="flex wrap items-center gap-2">
 <h4 className="font-medium text-sm text-slate-900 dark:text-white uppercase tracking-tight">{c.name}</h4>
 <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#16161d] text-slate-900 text-[10px] rounded-none border border-slate-200 dark:border-white/5 font-medium">
 {c.timestamp?.toDate ? c.timestamp.toDate().toLocaleDateString([], { day: '2-digit', month: 'short' }) : (c.timestamp?.slice(5, 10) || 'SENT')}
 </span>
 </div>
 <div className="flex items-center gap-3 mt-1">
 <div className="flex items-center gap-1.5">
 <div className="w-1.5 h-1.5 rounded-none bg-emerald-500" />
 <p className="text-[10px] text-slate-900 dark:text-slate-200 font-medium uppercase tracking-widest leading-none">
 {c.successCount || 0}/{c.totalRecipients || 0} Delivered
 </p>
 </div>
 <p className="text-[9px] text-blue-500 font-medium uppercase tracking-widest italic">{c.templateCategory || 'Marketing'}</p>
 </div>
 </div>
 </div>

 <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-none border-slate-50 dark:border-white/5 pt-3 sm:pt-0">
 <div className="flex items-center gap-1.5">
 <span className="text-[9px] font-medium text-emerald-500 uppercase tracking-[0.2em]">Meta Synced</span>
 <Activity size={12} className="text-emerald-500" />
 </div>
 <div className="flex items-center gap-3">
 <span className={`px-2.5 py-1 ${c.status === 'Sent' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'} dark:bg-[#16161d] text-[8px] font-medium uppercase rounded-none border border-current opacity-80 tracking-widest`}>
 {c.status}
 </span>
 <ChevronRight size={16} className="text-slate-300" />
 </div>
 </div>
 </button>
 );
};

export const CampaignInsightsPanel = ({ campaign, onClose }: { campaign: any, onClose: () => void }) => {
 const [insights, setInsights] = useState<any>(null);
 const [loading, setLoading] = useState(true);

 const fetchInsights = async () => {
 setLoading(true);
 try {
 const res = await fetch(`${API_URL}/whatsapp/campaigns/${campaign.id}/insights`, {
 headers: { 'Authorization': `Bearer ${localStorage.getItem('chatwiz_token')}` }
 });
 const data = await safeJson(res);
 if (res.ok) {
 setInsights(data);
 }
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchInsights();
 }, [campaign.id]);

 const stats = [
 { label: 'Sent', value: insights?.sent || campaign.totalRecipients || 0, icon: <Send size={14} />, color: 'text-blue-600', bg: 'bg-blue-50' },
 { label: 'Delivered', value: insights?.delivered || 0, icon: <UserCheck size={14} />, color: 'text-blue-600', bg: 'bg-blue-50' },
 { label: 'Read', value: insights?.read || 0, icon: <CheckCircle2 size={14} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
 { label: 'Replies', value: insights?.replied || 0, icon: <TrendingUp size={14} />, color: 'text-amber-600', bg: 'bg-amber-50' }
 ];

 const [isExporting, setIsExporting] = useState(false);
 const [showFullReport, setShowFullReport] = useState(false);

 return (
 <motion.div 
 initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
 className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white dark:bg-[#16161d] border-l border-slate-200 dark:border-white/10 z-100 flex flex-col"
 >
 <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
 <div className="flex-1 min-w-0 pr-4">
 <div className="flex items-center gap-2">
 <BarChart3 size={14} className="text-blue-600 shrink-0" />
 <h3 className="text-[11px] sm:text-sm font-medium uppercase tracking-tight text-slate-900 dark:text-white truncate">Meta Campaign Report</h3>
 </div>
 <p className="text-[9px] sm:text-[10px] font-medium text-slate-700 dark:text-slate-200 mt-0.5 truncate">{campaign.name}</p>
 </div>
 <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-[#1a1a24] rounded-none shrink-0">
 <X size={20} className="text-slate-700 dark:text-slate-200" />
 </button>
 </div>

 <div className="flex-1 overflow-y-auto px-3 py-4 sm:p-6 space-y-8">
 <div className="p-5 bg-linear-to-r from-slate-900 to-blue-950 rounded-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/5">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-none flex items-center justify-center border border-white/10 backdrop-blur-md">
 <Activity size={18} className="text-blue-400" />
 </div>
 <div>
 <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-[0.2em] text-blue-300">Account Quality</p>
 <p className="text-xs sm:text-sm font-medium text-white flex items-center gap-2 mt-0.5 sm:mt-1">
 {insights?.qualityRating || 'OPTIMAL'}
 <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-none" />
 </p>
 </div>
 </div>
 <button 
 onClick={fetchInsights} 
 disabled={loading}
 className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-none border border-white/10 disabled:opacity-50"
 >
 <RefreshCw size={14} />
 <span className="text-xs font-medium leading-none">Sync Now</span>
 </button>
 </div>

 <div className="grid grid-cols-2 gap-4">
 {stats.map(s => (
 <div key={s.label} className="p-5 border border-slate-100 dark:border-white/5 rounded-none bg-white dark:bg-[#1a1a24]">
 <div className="flex items-center gap-2 mb-4">
 <div className={`p-2 rounded-none ${s.bg} ${s.color}`}>
 {s.icon}
 </div>
 <span className="text-[9px] font-medium uppercase tracking-widest text-slate-700 dark:text-slate-200">{s.label}</span>
 </div>
 <div className="flex items-baseline gap-1">
 <p className="text-2xl font-medium text-slate-900 dark:text-white leading-none">{s.value}</p>
 <p className="text-[10px] text-slate-300 font-medium">Total</p>
 </div>
 <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-[#13131a] rounded-none overflow-hidden">
 <motion.div 
 initial={{ width: 0 }} animate={{ width: `${(s.value / (insights?.sent || campaign.totalRecipients || 1)) * 100}%` }}
 className={`h-full ${s.color.replace('text', 'bg')}`} 
 />
 </div>
 </div>
 ))}
 </div>

 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <DollarSign size={14} className="text-blue-600" />
 <h4 className="text-[10px] font-medium uppercase tracking-widest text-slate-900">Facebook Charges</h4>
 </div>
 </div>
 <div className="p-6 bg-slate-900 dark:bg-[#0a0a0e] rounded-none text-white border border-slate-800 dark:border-white/5 relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-5">
 <DollarSign size={120} />
 </div>
 <div className="relative z-10">
 <div className="flex justify-between items-start">
 <div>
 <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest">Calculated Spending</p>
 <div className="flex items-baseline gap-2 mt-1">
 <h3 className="text-4xl font-medium">
 {insights?.estimatedCost ? `₹${insights.estimatedCost.toFixed(2)}` : '---'}
 </h3>
 <span className="text-[10px] text-slate-400 font-medium uppercase">INR</span>
 </div>
 </div>
 <div className="p-3 bg-blue-500/10 rounded-none border border-blue-500/20">
 <BarChart3 size={24} className="text-blue-400" />
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="p-6 bg-slate-50 dark:bg-[#13131a] border-t border-slate-200 dark:border-white/10 flex gap-3">
 <button 
 onClick={() => setShowFullReport(true)}
 className="flex-1 py-2.5 bg-blue-600 text-white rounded-none font-medium text-xs hover:bg-blue-700 flex items-center justify-center gap-2"
 >
 <Maximize2 size={14} /> Full Report
 </button>
 </div>

 <AnimatePresence>
 {showFullReport && (
 <motion.div 
 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
 className="fixed inset-0 bg-white dark:bg-[#0a0a0e] z-999 flex flex-col overflow-hidden"
 >
 <header className="h-16 lg:h-20 border-b border-slate-100 dark:border-white/10 flex items-center justify-between px-3 lg:px-8 bg-white dark:bg-[#13131a] sticky top-0 z-10">
 <div className="flex items-center gap-2 flex-1 min-w-0">
 <button onClick={() => setShowFullReport(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-none text-slate-900 dark:text-slate-600">
 <ArrowLeft size={18} />
 </button>
 <div>
 <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Campaign Report</h3>
 <p className="text-[10px] font-medium text-blue-500 mt-0.5 uppercase">{campaign.name}</p>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <button 
 disabled={isExporting}
 onClick={async () => {
 setIsExporting(true);
 await downloadCampaignReport(campaign.name);
 setIsExporting(false);
 }}
 className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-none flex items-center gap-2 disabled:opacity-50"
 >
 {isExporting ? <RefreshCw size={12} /> : <Plus size={12} />}
 <span>{isExporting ? 'Generating...' : 'Download PDF'}</span>
 </button>
 <button onClick={() => setShowFullReport(false)} className="p-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-none">
 <X size={18} />
 </button>
 </div>
 </header>
 <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0a0a0e] p-12">
 <div className="max-w-5xl mx-auto">
 <CampaignReport 
 campaign={campaign} 
 insights={insights} 
 accountName={localStorage.getItem('chatwiz_wa_acc_name') || 'Main Account'} 
 />
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 );
};
