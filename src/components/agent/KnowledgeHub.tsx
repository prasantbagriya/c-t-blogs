import React, { useState, useEffect } from 'react';
import { 
 BookOpen, 
 Settings, 
 RefreshCw, 
 Plus, 
 Trash2, 
 Globe, 
 FileText, 
 Search,
 CheckCircle2,
 AlertCircle,
 MoreVertical,
 ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, query, where, onSnapshot, updateDoc, syncAgentKnowledge } from '../../api';

export const KnowledgeHub = ({ user }: { user: any }) => {
 const [agent, setAgent] = useState<any>(null);
 const [isSyncing, setIsSyncing] = useState(false);
 const [activeTab, setActiveTab] = useState<'facts' | 'sources'>('facts');

 useEffect(() => {
 if (!user?.uid) return;
 const q = query(collection(db, 'ai_agents'), where('uid', '==', user.uid));
 const unsub = onSnapshot(q, (snapshot) => {
 if (!snapshot.empty) {
 setAgent({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
 }
 });
 return () => unsub();
 }, [user?.uid]);

 const handleSync = async () => {
 if (!agent?.id) return;
 setIsSyncing(true);
 try {
 await syncAgentKnowledge(agent.id);
 alert('Sync Complete');
 } catch (err: any) {
 alert('Error: ' + err.message);
 } finally {
 setIsSyncing(false);
 }
 };

 if (!agent) {
 return (
 <div className="p-12 text-center bg-white dark:bg-[#16161d] rounded-none border border-slate-200 dark:border-white/5">
 <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No AI Agent</h3>
 <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">Please complete the setup wizard to start training.</p>
 </div>
 );
 }

 return (
 <div className="space-y-6 pb-12">
 {/* Knowledge Status Card */}
 <div className="bg-blue-600 p-8 rounded-none text-white relative overflow-hidden">
 <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
 <div className="text-center md:text-left">
 <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
 <BookOpen size={24} />
 <h2 className="text-2xl font-bold uppercase tracking-tight">Agent Knowledge</h2>
 </div>
 <p className="text-sm text-blue-100 font-medium">The agent has learned <span className="font-bold text-white">{agent.knowledgeBase?.length || 0}</span> key facts about your business.</p>
 </div>
 
 <button 
 onClick={handleSync}
 disabled={isSyncing}
 className={`px-8 py-3 bg-white text-blue-600 rounded-none font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:text-white flex items-center gap-2 disabled:opacity-50`}
 >
 {isSyncing ? <RefreshCw className="w-4 h-4 " /> : <RefreshCw className="w-4 h-4" />}
 {isSyncing ? 'Syncing...' : 'Sync Now'}
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
 {/* Sidebar */}
 <div className="lg:col-span-1 space-y-4">
 <div className="bg-white dark:bg-[#16161d] p-6 rounded-none border border-slate-200 dark:border-white/5">
 <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
 <Settings size={14} /> Training Sources
 </h3>
 
 <div className="space-y-3">
 <div className="p-4 bg-slate-50 dark:bg-[#1a1a24] rounded-none border border-slate-100 dark:border-white/5 flex items-center gap-3">
 <Globe size={18} className="text-blue-500" />
 <div className="min-w-0">
 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Website</p>
 <p className="text-[10px] font-bold text-slate-900 dark:text-white truncate">{agent.website || 'N/A'}</p>
 </div>
 </div>
 
 <button className="w-full p-4 bg-white dark:bg-[#16161d] border border-dashed border-slate-200 dark:border-white/10 rounded-none text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 flex items-center justify-center gap-2">
 <Plus size={14} /> Add Document
 </button>
 </div>
 </div>
 
 <div className="bg-[#0f0f13] p-6 rounded-none text-white border border-white/5">
 <div className="flex items-center gap-2 mb-4">
 <RefreshCw size={14} className="text-blue-400" />
 <h4 className="text-[10px] font-bold uppercase tracking-widest">Auto-Sync</h4>
 </div>
 <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-6">Checking for updates every 24 hours.</p>
 <div className="flex items-center justify-between p-3 bg-white/5 rounded-none border border-white/10">
 <span className="text-[10px] font-bold uppercase">Active</span>
 <div className="w-8 h-4 bg-blue-600 rounded-none relative">
 <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-none" />
 </div>
 </div>
 </div>
 </div>

 {/* Content */}
 <div className="lg:col-span-3 space-y-4">
 <div className="flex gap-2">
 <button 
 onClick={() => setActiveTab('facts')}
 className={`px-6 py-2 rounded-none text-[10px] font-bold uppercase tracking-widest ${activeTab === 'facts' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 text-slate-400 '}`}
 >
 Facts
 </button>
 <button 
 onClick={() => setActiveTab('sources')}
 className={`px-6 py-2 rounded-none text-[10px] font-bold uppercase tracking-widest ${activeTab === 'sources' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 text-slate-400 '}`}
 >
 Assets
 </button>
 </div>

 <div className="bg-white dark:bg-[#16161d] rounded-none border border-slate-200 dark:border-white/5 overflow-hidden min-h-[500px]">
 <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
 <div className="relative w-64">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
 <input 
 type="text" 
 placeholder="Search knowledge..." 
 className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#1a1a24] border border-slate-100 dark:border-white/5 rounded-none text-xs outline-none focus:border-blue-500 dark:text-white"
 />
 </div>
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{agent.knowledgeBase?.length || 0} Entries</span>
 </div>

 <div className="p-4 space-y-2">
 {Array.isArray(agent.knowledgeBase) && agent.knowledgeBase.map((fact: any, i: number) => (
 <div 
 key={i}
 className="p-4 bg-white dark:bg-[#13131a] rounded-none border border-slate-100 dark:border-white/5 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-[#1a1a24]"
 >
 <div className="p-2 border border-slate-50 rounded-none bg-slate-50 dark:bg-slate-800">
 <FileText size={14} className="text-blue-500" />
 </div>
 <div className="flex-1">
 <div className="flex justify-between items-start">
 <p className="text-xs font-medium text-slate-900 dark:text-white mb-2 leading-relaxed">{fact.content || fact}</p>
 <button className="p-1 text-slate-300 hover:text-rose-500 ">
 <Trash2 size={14} />
 </button>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{fact.source || 'Website'}</span>
 <span className="w-1 h-1 bg-slate-200 rounded-none" />
 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Verified</span>
 </div>
 </div>
 </div>
 ))}

 {(!agent.knowledgeBase || agent.knowledgeBase.length === 0) && (
 <div className="py-24 text-center opacity-40">
 <BookOpen size={32} className="mx-auto mb-4" />
 <p className="text-[10px] font-bold uppercase tracking-widest">Brain is currently empty</p>
 <button onClick={handleSync} className="text-blue-600 text-[10px] font-bold uppercase mt-4 underline underline-offset-4">Initial Train</button>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};
