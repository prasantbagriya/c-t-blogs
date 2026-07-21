import React from 'react';
import { 
 Users, 
 LayoutGrid, 
 Plus, 
 TrendingUp, 
 Zap, 
 History,
 ChevronRight
} from 'lucide-react';
import { updateDoc } from '../../api';

interface WhatsAppDashboardProps {
 user: any;
 selectedAgentId: string;
 setSelectedAgentId: (id: string) => void;
 selectedDeptName: string;
 setSelectedDeptName: (name: string) => void;
 departments: any[];
 setDepartments: (depts: any[]) => void;
 allAccounts: any[];
 stats: any;
 recentInbound: any[];
 customerProfiles: any[];
 setActiveSubTab: (tab: string) => void;
}

const FeatureNode = ({ node, isActive, onClick }: any) => {
 return (
 <button
 onClick={onClick}
 className={`w-full flex items-center justify-between p-1.5 bg-slate-50 dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-none hover:border-blue-500 group ${isActive ? "border-blue-500 bg-white dark:bg-[#1a1a24] ring-2 ring-blue-500/10" : ""}`}
 >
 <div className="flex items-center gap-4">
 <div 
 className="w-10 h-10 rounded-none flex items-center justify-center text-white"
 style={{ background: node.color }}
 >
 {React.cloneElement(node.icon as React.ReactElement, { size: 18 })}
 </div>
 <div className="text-left">
 <h3 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-none">{node.label}</h3>
 <p className="text-[10px] text-slate-500 mt-1 font-medium sm:hidden">{node.desc}</p>
 </div>
 </div>
 <ChevronRight className="text-slate-300 group-hover:text-blue-500" size={16} />
 </button>
 );
};

export const WhatsAppDashboard = ({
 user,
 selectedAgentId,
 setSelectedAgentId,
 selectedDeptName,
 setSelectedDeptName,
 departments,
 setDepartments,
 allAccounts,
 stats,
 recentInbound,
 customerProfiles,
 setActiveSubTab,
 filteredNodes,
 selectedAccount,
 setSelectedAccount,
 onConnectAccount
}: any) => {
 return (
 <div className="space-y-6 pb-10">
 {/* Account Selection Header - Like Threads */}
 <div className="px-3 pt-3 flex items-center justify-between">
 <div className="flex items-center gap-1 p-1 bg-white dark:bg-[#16161d] rounded-none border border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar max-w-[calc(100vw-40px)] sm:max-w-none">
 {allAccounts?.map((acc: any) => (
 <button
 key={acc.id}
 onClick={() => setSelectedAccount(acc)}
 className={`px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-tight whitespace-nowrap ${ selectedAccount?.id === acc.id ? "bg-emerald-500 text-white" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" }`}
 >
 {acc.name || acc.phoneNumber}
 </button>
 ))}
 <button 
 onClick={onConnectAccount}
 className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-none flex-none border border-dashed border-slate-200 dark:border-white/10"
 title="Link New WhatsApp Account"
 >
 <Plus size={14} />
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-3 pt-0 px-3">
 <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded-none">
 <Users size={14} className="text-blue-500 shrink-0" />
 <select value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)} className="flex-1 bg-transparent border-none text-[8px] sm:text-xs font-bold uppercase tracking-widest outline-none text-slate-700 dark:text-slate-200 cursor-pointer min-w-0">
 <option value="all">All Agents</option>
 <option value={user.uid}>Me (Admin)</option>
 {allAccounts?.filter((a: any) => a.role === 'subuser').map((a: any) => (<option key={a.uid} value={a.uid}>{a.displayName}</option>))}
 </select>
 </div>
 <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded-none">
 <LayoutGrid size={14} className="text-emerald-500 shrink-0" />
 <select value={selectedDeptName} onChange={(e) => setSelectedDeptName(e.target.value)} className="flex-1 bg-transparent border-none text-[8px] sm:text-xs font-bold uppercase tracking-widest outline-none text-slate-700 dark:text-slate-200 cursor-pointer min-w-0">
 <option value="all">All Departments</option>
 {departments.map(d => (<option key={d.id} value={d.name}>{d.name}</option>))}
 </select>
 </div>
 <button 
 onClick={() => { const name = prompt('Enter Department Name:'); if (name) { updateDoc(`departments/dept_${Date.now()}`, { name, uid: user.uid }); (window as any).showToast('Department created!', 'success'); setDepartments([...departments, { id: `dept_${Date.now()}`, name }]); } }} 
 className="flex items-center justify-center gap-1.5 px-2 py-2 sm:py-2.5 bg-slate-900 text-white rounded-none text-[8px] sm:text-xs font-bold uppercase tracking-widest hover:bg-black"
 >
 <Plus size={14} className="shrink-0" /> <span className="truncate">Add Dept</span>
 </button>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <div className="lg:col-span-2 bg-white dark:bg-[#16161d] p-6 sm:p-8 rounded-none border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden group">
 <div className="absolute -right-10 -bottom-10 opacity-[0.03]"><TrendingUp size={240} /></div>
 <div className="relative">
 <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-none border-4 border-blue-500/10 flex items-center justify-center">
 <div className="text-center">
 <p className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{stats.totalLeads}</p>
 <p className="text-[9px] font-bold text-slate-600 tracking-wider mt-1">Total CRM</p>
 </div>
 </div>
 <div className="absolute -top-1 -right-1 w-7 h-7 bg-blue-600 rounded-none flex items-center justify-center text-white border-2 border-white dark:border-[#16161d]"><Zap size={12} className="fill-current" /></div>
 </div>
 <div className="flex-1 space-y-5 relative z-10 w-full text-center sm:text-left">
 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
 <div>
 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Lead Capture Hub</h3>
 <p className="text-[10px] font-bold text-slate-600 tracking-wider mt-1 uppercase">Real-time automation active</p>
 </div>
 <button onClick={() => setActiveSubTab('leads')} className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-none text-[10px] font-bold hover:bg-blue-700 tracking-widest">CRM PIPELINE</button>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[ 
 { label: 'Admission', val: stats.admission.toString().padStart(2, '0'), color: 'text-emerald-500' }, 
 { label: 'Support', val: stats.support.toString().padStart(2, '0'), color: 'text-blue-500' }, 
 { label: 'Hot Leads', val: stats.highPri.toString().padStart(2, '0'), color: 'text-rose-500' }, 
 { label: 'Resolved', val: `${stats.resolvedRate}%`, color: 'text-amber-500' } 
 ].map((s, i) => (
 <div key={i} className="p-3 bg-slate-50 dark:bg-[#1a1a24] rounded-none border border-slate-100 dark:border-white/5">
 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-1">{s.label}</p>
 <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 <div className="bg-white dark:bg-[#16161d] p-6 rounded-none border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col h-full min-h-[300px]">
 <div className="flex items-center justify-between mb-6">
 <p className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">Live Activity Feed</p>
 <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-none" /><span className="text-[9px] font-bold text-emerald-500 uppercase">Live</span></div>
 </div>
 <div className="flex-1 space-y-5">
 {recentInbound.length === 0 ? (
 <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-30 text-slate-400">
 <History size={32} className="mb-3" />
 <p className="text-[10px] font-bold uppercase tracking-widest">No recent messages</p>
 </div>
 ) : recentInbound.map((msg: any, i: number) => (
 <div key={i} className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveSubTab('inbox')}>
 <div className="w-10 h-10 rounded-none bg-slate-50 dark:bg-[#1a1a24] border border-slate-100 dark:border-white/5 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:text-blue-600 group-hover:bg-blue-50">{msg.senderName?.[0] || 'U'}</div>
 <div className="flex-1 min-w-0">
 <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{msg.senderName || msg.sender}</p>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{msg.text}</p>
 </div>
 <div className="text-right shrink-0">
 <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
 <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">{customerProfiles.find(p => p.phone === msg.sender)?.department || 'Unsorted'}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pb-6">
 {filteredNodes.map(node => (<FeatureNode key={node.id} node={node} isActive={false} onClick={() => setActiveSubTab(node.id)} />))}
 </div>
 </div>
 );
};
