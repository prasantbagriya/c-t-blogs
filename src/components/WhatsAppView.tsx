import React, { useState, useEffect } from 'react';
import { 
 Plus, 
 MessageSquare, 
 Split, 
 CheckSquare, 
 Zap, 
 Users, 
 BarChart3, 
 Wand2, 
 Activity,
 UserPlus,
 ShieldCheck,
 Cpu,
 Smartphone,
 MessageCircle,
 Terminal,
 Layers,
 CheckCircle2,
 RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InboxView } from './InboxView';
import { WhatsAppBulkSendView } from './WhatsAppBulkSendView';
import { FlowBuilderView } from './FlowBuilderView';
import { SalesDashboard } from './agent/SalesDashboard';
import { TemplateApproverView } from './TemplateApproverView';
import { AgentManagementView } from './agent/AgentManagementView';

import { WhatsAppAccountsView } from './WhatsAppAccountsView';
import { db, updateDoc, API_URL, onSnapshot, query, collection } from '../api';

// Modular Components
import { WhatsAppDashboard } from './whatsapp/WhatsAppDashboard';
import { SimpleAutoReplyView } from './whatsapp/SimpleAutoReplyView';
import { CampaignInsightsPanel, CampaignCard } from './whatsapp/CampaignInsights';

const NODES = [
 { id: 'overview', label: 'Overview', desc: 'Insights', icon: <Activity />, color: '#10b981' },
 { id: 'accounts', label: 'Accounts', desc: 'Manage', icon: <Smartphone />, color: '#3b82f6' },
 { id: 'inbox', label: 'Inbox', desc: 'Chats', icon: <MessageSquare />, color: '#6366f1' },
 { id: 'bulksend', label: 'Bulk Send', desc: 'Broadcast', icon: <Plus />, color: '#f97316' },
 { id: 'flows', label: 'Flows', desc: 'Automation', icon: <Split />, color: '#06b6d4' },
 { id: 'templates', label: 'Templates', desc: 'Library', icon: <CheckSquare />, color: '#eab308' },
 { id: 'autoreply', label: 'Auto Reply', desc: 'AI Chat', icon: <Zap />, color: '#ec4899' },
 { id: 'leads', label: 'Lead Hub', desc: 'CRM Pipeline', icon: <Users />, color: '#3b82f6' },
 { id: 'team', label: 'My Team', desc: 'Agent Handoff', icon: <UserPlus />, color: '#f43f5e' },
 { id: 'campaigns', label: 'Insights', desc: 'Performance', icon: <BarChart3 />, color: '#8b5cf6' },

];

export const WhatsAppView = ({
 user,
 campaigns,
 messages,
 activeSubTab,
 setActiveSubTab,
 selectedAccount,
 setSelectedAccount,
 allAccounts,
 onConnectAccount,
 isDarkMode,
 onChatToggle,
}: any) => {
 const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
 const [customerProfiles, setCustomerProfiles] = useState<any[]>([]);
 const [departments, setDepartments] = useState<any[]>([]);
 const [loadingHub, setLoadingHub] = useState(true);
 const [selectedAgentId, setSelectedAgentId] = useState('all');
 const [selectedDeptName, setSelectedDeptName] = useState('all');
 const [selectedChatIdFromLeads, setSelectedChatIdFromLeads] = useState<string | null>(null);

 const isHub = activeSubTab === 'overview';

 useEffect(() => {
 if (isHub) {
 setLoadingHub(true);
 const unsubscribeCP = onSnapshot(collection(db, 'customer_profiles'), (snapshot) => {
 setCustomerProfiles(snapshot.docs.map(d => d.data()));
 setLoadingHub(false);
 });
 const unsubscribeDept = onSnapshot(collection(db, 'departments'), (snapshot) => {
 setDepartments(snapshot.docs.map(d => d.data()));
 });
 return () => { unsubscribeCP(); unsubscribeDept(); };
 }
 }, [isHub]);

 const stats = React.useMemo(() => {
 const filtered = customerProfiles.filter(p => {
 const matchAgent = selectedAgentId === 'all' || p.assignedTo === selectedAgentId;
 const matchDept = selectedDeptName === 'all' || p.department === selectedDeptName;
 return matchAgent && matchDept;
 });
 const totalLeads = filtered.length;
 const admission = filtered.filter(p => p.department === 'Admission' || p.tag === 'Admission').length;
 const support = filtered.filter(p => p.department === 'Support' || p.tag === 'Support').length;
 const highPri = filtered.filter(p => p.isHotLead).length;
 const resolved = filtered.filter(p => p.status === 'Solved').length;
 return { totalLeads, admission, support, highPri, resolvedRate: totalLeads > 0 ? Math.round((resolved / totalLeads) * 100) : 0 };
 }, [customerProfiles, selectedAgentId, selectedDeptName]);

 const recentInbound = React.useMemo(() => {
 const groups: any = {};
 (messages || []).forEach((msg: any) => {
 if (msg.direction === 'outbound' || msg.sender === 'admin') return;
 const id = msg.visitorId || msg.sender;
 if (!groups[id] || new Date(msg.timestamp) > new Date(groups[id].timestamp)) groups[id] = msg;
 });
 return Object.values(groups).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
 }, [messages]);

 const filteredNodes = React.useMemo(() => {
 if (user?.role !== 'subuser') return NODES;
 const waPerms = user?.permissions?.subFeatures?.whatsapp || [];
 return NODES.filter(node => node.id === 'overview' || (node.id === 'bulksend' && waPerms.includes('bulk')) || (node.id === 'campaigns' && waPerms.includes('analytics')) || (node.id === 'inbox' && waPerms.includes('inbox')) || (node.id === 'templates' && waPerms.includes('templates')) || ['flows', 'autoreply'].includes(node.id));
 }, [user]);

 useEffect(() => {
 if (!selectedAccount && allAccounts?.length > 0) {
 setSelectedAccount(allAccounts[0]);
 }
 }, [allAccounts, selectedAccount]);

 if (!selectedAccount && (!allAccounts || allAccounts.length === 0) && activeSubTab !== 'widget' && activeSubTab !== 'accounts') {
 return (
 <div className="flex flex-col items-center justify-center min-h-[500px]">
 <div className="w-full max-w-2xl bg-white dark:bg-[#16161d]/80 py-12 px-10 rounded-none border border-slate-200 dark:border-white/10 text-center">
 <div className="w-16 h-16 bg-slate-900 rounded-none flex items-center justify-center mx-auto mb-6 text-white">
 <Smartphone size={32} />
 </div>
 <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Connect WhatsApp</h1>
 <p className="text-slate-500 mb-8 font-medium">Link your WhatsApp Business API account to start automating your conversations.</p>
 <button onClick={onConnectAccount} className="px-8 py-4 bg-emerald-500 text-white rounded-none flex items-center justify-center gap-3 hover:bg-emerald-600 mx-auto">
 <Plus size={20} />
 <span className="text-xs font-black uppercase tracking-widest">Link My First Account</span>
 </button>
 </div>
 </div>
 );
 }

 return (
 <div className="flex flex-col w-full h-full">
 {isHub ? (
 <WhatsAppDashboard 
 user={user}
 selectedAgentId={selectedAgentId}
 setSelectedAgentId={setSelectedAgentId}
 selectedDeptName={selectedDeptName}
 setSelectedDeptName={setSelectedDeptName}
 departments={departments}
 setDepartments={setDepartments}
 allAccounts={allAccounts}
 selectedAccount={selectedAccount}
 setSelectedAccount={setSelectedAccount}
 onConnectAccount={onConnectAccount}
 stats={stats}
 recentInbound={recentInbound}
 customerProfiles={customerProfiles}
 setActiveSubTab={setActiveSubTab}
 filteredNodes={filteredNodes}
 />
 ) : (
 <div className="flex-1 overflow-y-auto no-scrollbar">
 {activeSubTab === 'accounts' && <WhatsAppAccountsView user={user} onManage={(acc: any) => { setSelectedAccount(acc); setActiveSubTab('settings'); }} />}
 {activeSubTab === 'inbox' && <InboxView user={user} messages={messages} platform="whatsapp" selectedAccount={selectedAccount} isDarkMode={isDarkMode} onChatToggle={onChatToggle} onBack={() => setActiveSubTab('overview')} initialChatId={selectedChatIdFromLeads} />}
 {activeSubTab === 'bulksend' && <WhatsAppBulkSendView user={user} onSuccess={() => {}} selectedAccount={selectedAccount} onNavigate={(tab: string) => setActiveSubTab(tab)} />}
 {activeSubTab === 'flows' && <FlowBuilderView user={user} platform="whatsapp" selectedAccount={selectedAccount} onOpenWidgetSettings={() => setActiveSubTab('widget')} />}
 {activeSubTab === 'templates' && <TemplateApproverView user={user} selectedAccount={selectedAccount} onBack={() => setActiveSubTab('overview')} />}
 {activeSubTab === 'autoreply' && <SimpleAutoReplyView user={user} selectedAccount={selectedAccount} />}
 {activeSubTab === 'leads' && <SalesDashboard user={user} messages={messages} customerProfiles={customerProfiles} departments={departments} onChatSelect={(phone: string) => { setSelectedChatIdFromLeads(phone); setActiveSubTab('inbox'); }} />}
 {activeSubTab === 'team' && <AgentManagementView user={user} />}

 {activeSubTab === 'campaigns' && (
 <div className="p-6 space-y-6">
 <div className="flex items-center justify-between mb-8">
 <div><h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Campaign Insights</h2><p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Real-time Meta performance metrics</p></div>
 <button className="p-3 bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-white rounded-none hover:text-blue-600"><RefreshCw size={20} /></button>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{campaigns.map((c: any) => (<CampaignCard key={c.id} c={c} onClick={() => setSelectedCampaign(c)} />))}</div>
 </div>
 )}
 {activeSubTab === 'settings' && selectedAccount && (
 <div className="p-8 space-y-8 max-w-4xl">
 <div className="flex items-center justify-between">
 <div><h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Account Settings</h2><p className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-[0.2em]">Technical Metadata & API Status</p></div>
 <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-none flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-none" /><span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Connected</span></div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {[
 { label: 'Display Name', value: selectedAccount.name, icon: <MessageCircle size={18} /> },
 { label: 'Phone Number ID', value: selectedAccount.id, icon: <Smartphone size={18} /> },
 { label: 'WhatsApp Business ID', value: selectedAccount.businessId, icon: <ShieldCheck size={18} /> },
 { label: 'API Version', value: 'v18.0 (Latest)', icon: <Terminal size={18} /> }
 ].map((item, i) => (
 <div key={i} className="bg-white dark:bg-[#16161d] p-6 rounded-none border border-slate-200 dark:border-white/5 space-y-4">
 <div className="flex items-center gap-2 text-slate-400">{item.icon}<span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span></div>
 <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200 break-all bg-slate-50 dark:bg-white/5 p-3 rounded-none">{item.value}</p>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 )}
  {/* Mobile Bottom Navigation */}
  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#16161d] border-t border-slate-200 dark:border-white/10 z-60 flex items-center justify-around p-2 pb-safe">
    {[
      { id: 'overview', label: 'Hub', icon: <Activity size={20} /> },
      { id: 'inbox', label: 'Inbox', icon: <MessageSquare size={20} /> },
      { id: 'bulksend', label: 'Broadcast', icon: <Plus size={20} /> },
      { id: 'templates', label: 'Templates', icon: <CheckSquare size={20} /> },
      { id: 'accounts', label: 'Accounts', icon: <Smartphone size={20} /> },
    ].map((item) => {
      const isActive = activeSubTab === item.id;
      return (
        <button
          key={item.id}
          onClick={() => setActiveSubTab(item.id)}
          className={`flex flex-col items-center justify-center p-2 rounded-none min-w-[60px] ${ isActive ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400' }`}
        >
          {item.icon}
          <span className="text-[10px] mt-1 font-bold">{item.label}</span>
        </button>
      );
    })}
  </div>
  
  <AnimatePresence>{selectedCampaign && <CampaignInsightsPanel campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />}</AnimatePresence>
  </div>
  );
};
