import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Zap, 
  Filter, 
  MoreVertical, 
  MessageSquare, 
  Phone, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Search,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, query, where, onSnapshot, updateDoc } from '../../api';

interface Lead {
  id: string;
  name: string;
  platform: string;
  status: 'new' | 'contacted' | 'closed' | 'lost';
  intent: 'hot' | 'warm' | 'cool';
  lastMessage: string;
  timestamp: string;
  avatar?: string;
}

export const SalesDashboard = ({ user, messages, customerProfiles, departments: initialDepts, onChatSelect }: { user: any, messages?: any[], customerProfiles?: any[], departments?: any[], onChatSelect?: (phone: string) => void }) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'hot' | 'warm'>('all');
  const [viewType, setViewType] = useState<'kanban' | 'list'>('kanban');
  const [selectedDept, setSelectedDept] = useState('all');

  useEffect(() => {
    if (!user?.uid) return;

    if (customerProfiles) {
      setLeads(customerProfiles);
      setLoading(false);
    } else {
      const unsubLeads = onSnapshot(query('customer_profiles'), (snapshot) => {
        setLeads(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
      return () => unsubLeads();
    }
  }, [user?.uid, customerProfiles]);

  useEffect(() => {
    if (initialDepts) {
      setDepartments(initialDepts);
    } else {
      const unsubDepts = onSnapshot(query('departments'), (snapshot) => {
        setDepartments(snapshot.docs.map(d => d.data()));
      });
      return () => unsubDepts();
    }
  }, [initialDepts]);

  const filteredLeads = React.useMemo(() => {
    return leads.filter(l => {
      const matchDept = selectedDept === 'all' || l.department === selectedDept;
      const matchTab = activeTab === 'all' || (activeTab === 'hot' && l.isHotLead) || (activeTab === 'warm' && l.intent === 'warm');
      return matchDept && matchTab;
    });
  }, [leads, selectedDept, activeTab]);

  const stats = [
    { label: 'Leads', value: filteredLeads.length, color: 'text-blue-600', icon: <Users size={18} /> },
    { label: 'Active', value: filteredLeads.filter(l => l.isHotLead).length, color: 'text-rose-600', icon: <Zap size={18} /> },
    { label: 'Resolved', value: filteredLeads.filter(l => l.status === 'Solved').length, color: 'text-emerald-600', icon: <TrendingUp size={18} /> },
    { label: 'Time Saved', value: '42h', color: 'text-amber-600', icon: <Clock size={18} /> },
  ];

  const columns = [
    { id: 'new', label: 'Inbound', icon: <Plus size={14} /> },
    { id: 'contacted', label: 'Follow-up', icon: <MessageSquare size={14} /> },
    { id: 'closed', label: 'Closed', icon: <CheckCircle2 size={14} /> },
  ];

  const updateStatus = async (leadId: string, newStatus: string) => {
    try {
      await updateDoc(`customer_profiles/${leadId}`, { status: newStatus });
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 px-4 lg:px-10">
      {/* Header & Stats */}
      <div className="bg-white dark:bg-[#16161d] p-6 rounded-lg border border-slate-200 dark:border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sales Pipeline</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Manage leads and conversions</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="flex bg-slate-100 dark:bg-[#1a1a24] p-1 rounded border border-slate-200 dark:border-white/5 mr-2">
              <button 
                onClick={() => setViewType('kanban')}
                className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${viewType === 'kanban' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Kanban
              </button>
              <button 
                onClick={() => setViewType('list')}
                className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${viewType === 'list' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                List
              </button>
            </div>
            
            <select 
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            <button className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
              <Plus size={14} /> Lead
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="p-4 bg-slate-50 dark:bg-[#1a1a24] rounded border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className={stat.color}>{stat.icon}</div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline View */}
      {viewType === 'kanban' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 font-bold text-[10px] text-slate-900 dark:text-white uppercase tracking-widest">
                  <div className="p-1 bg-slate-100 dark:bg-[#1a1a24] rounded border border-transparent dark:border-white/5">{column.icon}</div>
                  {column.label}
                </div>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#1a1a24] rounded text-[10px] font-bold text-slate-500 border border-transparent dark:border-white/5">
                  {filteredLeads.filter(l => l.status === column.id || (!l.status && column.id === 'new')).length}
                </span>
              </div>

              <div className="space-y-3 min-h-[500px]">
                <AnimatePresence mode="popLayout">
                  {filteredLeads.filter(l => l.status === column.id || (!l.status && column.id === 'new')).map((lead) => (
                    <motion.div
                      key={lead.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white dark:bg-[#16161d] p-4 rounded-lg border border-slate-200 dark:border-white/5 transition-all group shadow-sm hover:border-blue-500/30"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 dark:bg-[#1a1a24] rounded flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm relative border border-slate-200 dark:border-white/5">
                            {lead.name?.[0] || 'L'}
                            {lead.isHotLead && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 text-white rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                                <Zap size={8} className="fill-current" />
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{lead.name || 'Anonymous'}</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                  {lead.platform === 'whatsapp' ? <MessageSquare size={10} /> : <TrendingUp size={10} />}
                                  {lead.platform || 'WhatsApp'}
                                </span>
                                {lead.department && (
                                    <span className="px-1 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[7px] font-bold rounded uppercase">
                                        {lead.department}
                                    </span>
                                )}
                            </div>
                          </div>
                        </div>
                        <button className="p-1 text-slate-300 hover:text-slate-600">
                          <MoreVertical size={14} />
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-500 dark:text-slate-200 line-clamp-2 italic mb-3 px-1">
                        "{lead.lastMessage || lead.lastInboundMessage || 'No conversation history.'}"
                      </p>

                      {lead.lastFlowSubmission && (
                        <div className="mb-4 p-2 bg-slate-50 dark:bg-[#1a1a24] rounded border border-slate-100 dark:border-white/5">
                          <p className="text-[8px] font-bold text-blue-500 uppercase mb-1">Form Data</p>
                          <div className="space-y-0.5">
                            {Object.entries(lead.lastFlowSubmission.data || {}).slice(0, 3).map(([k, v]) => (
                              <p key={k} className="text-[9px] text-slate-600 dark:text-slate-300 truncate">
                                <span className="font-bold">{k}:</span> {String(v)}
                              </p>
                            ))}
                            {Object.keys(lead.lastFlowSubmission.data || {}).length > 3 && (
                              <p className="text-[8px] text-slate-400 italic mt-1">+ more fields</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => onChatSelect?.(lead.phone || lead.id)}
                            className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded text-blue-600 transition-colors"
                          >
                            <MessageSquare size={14} />
                          </button>
                          <button className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded text-emerald-600 transition-colors">
                            <Phone size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => updateStatus(lead.id, column.id === 'new' ? 'contacted' : 'closed')}
                          className="p-1.5 bg-slate-50 dark:bg-[#1a1a24] hover:bg-blue-600 hover:text-white rounded text-slate-400 transition-colors border border-transparent dark:border-white/5"
                        >
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {filteredLeads.filter(l => l.status === column.id || (!l.status && column.id === 'new')).length === 0 && (
                  <div className="py-16 text-center border border-dashed border-slate-100 dark:border-white/10 rounded-lg bg-slate-50/10">
                    <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">No leads</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#16161d] rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#1a1a24] border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 tracking-wider">Lead Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 tracking-wider">Dept</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 tracking-wider">Platform</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredLeads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/10 text-blue-600 rounded flex items-center justify-center font-bold text-xs uppercase">
                          {lead.name?.[0] || 'L'}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white block">{lead.name || 'Anonymous'}</span>
                          <span className="text-[9px] text-slate-400 font-medium">{lead.phone || lead.visitorId || 'No Contact'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] rounded uppercase font-bold tracking-tight">
                        {lead.department || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        {lead.platform === 'whatsapp' ? <MessageSquare size={12} className="text-emerald-500" /> : <TrendingUp size={12} className="text-blue-500" />}
                        {lead.platform || 'WhatsApp'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="max-w-[150px]">
                         {lead.lastFlowSubmission ? (
                           <div className="flex flex-col gap-1">
                             <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">Form Data:</span>
                             <div className="text-[10px] text-slate-600 dark:text-slate-300 truncate">
                               {Object.entries(lead.lastFlowSubmission.data || {})
                                 .map(([k, v]) => `${k}: ${v}`)
                                 .join(', ')}
                             </div>
                           </div>
                         ) : (
                           <span className="text-[9px] text-slate-400">No form submitted</span>
                         )}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{lead.status || 'New'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lead.lastFlowSubmission && (
                          <button 
                            onClick={() => {
                              const dataStr = Object.entries(lead.lastFlowSubmission.data || {})
                                .map(([k, v]) => `${k}: ${v}`)
                                .join('\n');
                              alert(`Form Submission Data:\n\n${dataStr}`);
                            }}
                            className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg text-amber-500 transition-colors"
                            title="View Form Data"
                          >
                            <TrendingUp size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => onChatSelect?.(lead.phone || lead.id)}
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-500 transition-colors"
                        >
                          <MessageSquare size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredLeads.length === 0 && (
            <div className="py-20 text-center">
              <Users size={32} className="mx-auto text-slate-200 mb-2" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Zero Leads Match Filter</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
