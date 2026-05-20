import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Shield, 
  Mail, 
  Phone, 
  MessageSquare, 
  Trash2, 
  Edit2,
  CheckCircle2,
  Clock,
  Filter,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from '../../api/db';

interface Agent {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'manager';
  status: 'online' | 'offline' | 'busy';
  assignedChats: number;
  lastActive: any;
  specialization?: string;
}

export const AgentManagementView = ({ user }: { user: any }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newAgent, setNewAgent] = useState({ name: '', email: '', role: 'agent', specialization: 'General' });

  useEffect(() => {
    const q = query(collection(db, 'agents'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAgents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agent));
      setAgents(fetchedAgents);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleAddAgent = async () => {
    if (!newAgent.name || !newAgent.email) return;
    try {
      await addDoc(collection(db, 'agents'), {
        ...newAgent,
        ownerId: user.uid,
        status: 'offline',
        assignedChats: 0,
        lastActive: Date.now()
      });
      setShowAddModal(false);
      setNewAgent({ name: '', email: '', role: 'agent', specialization: 'General' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (confirm('Are you sure you want to remove this agent?')) {
      await deleteDoc(doc(db, 'agents', id));
    }
  };

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-3 sm:py-4 lg:py-6 px-0 w-full space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#16161d] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-medium text-slate-900 dark:text-white tracking-tight">Team Management</h2>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Control access & chat assignments</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search team..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded-xl text-xs outline-none focus:border-blue-500 transition-all w-64"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            <UserPlus size={16} /> Add Agent
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <div key={agent.id} className="bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:border-blue-500/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{agent.status}</span>
               </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
               <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-[#1a1a24] border border-slate-100 dark:border-white/5 flex items-center justify-center text-xl font-bold text-blue-500">
                  {agent.name[0]}
               </div>
               <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{agent.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[8px] font-bold uppercase tracking-widest border border-blue-100 dark:border-blue-500/10">
                      {agent.role}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">{agent.specialization}</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="p-3 bg-slate-50 dark:bg-[#1a1a24] rounded-xl border border-slate-100 dark:border-white/5">
                  <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Response</p>
                  <p className="text-sm font-bold text-blue-500">2m 14s</p>
               </div>
               <div className="p-3 bg-slate-50 dark:bg-[#1a1a24] rounded-xl border border-slate-100 dark:border-white/5">
                  <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mb-1">Solved Today</p>
                  <p className="text-sm font-bold text-emerald-500">12/15</p>
               </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-white/5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                     <Mail size={12} />
                     <span className="text-[10px] font-medium">{agent.email}</span>
                  </div>
               </div>
               <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-[#1a1a24] rounded-xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                     <MessageSquare size={12} className="text-blue-500" />
                     <span className="text-[10px] font-bold text-slate-900 dark:text-white">{agent.assignedChats}</span>
                     <span className="text-[9px] text-slate-500 font-medium">Active Chats</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteAgent(agent.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                     <Trash2 size={12} />
                  </button>
               </div>
            </div>
          </div>
        ))}

        {filteredAgents.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-[#16161d]/50 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl">
             <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1a1a24] shadow-sm flex items-center justify-center text-slate-300 mb-4">
                <Users size={32} />
             </div>
             <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">No Team Members Found</h3>
             <p className="text-[10px] text-slate-500 mt-2 max-w-[200px] text-center italic">Add your first agent to start delegating WhatsApp conversations.</p>
          </div>
        )}
      </div>

      {/* Add Agent Sidebar */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-[101] w-full max-w-md h-full bg-white dark:bg-[#13131a] border-l border-slate-200 dark:border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-[#1a1a24]/50">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Team Member</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Configure new agent access</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors bg-white dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                  <input 
                    type="text" 
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full p-4 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                  <input 
                    type="email" 
                    value={newAgent.email}
                    onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                    placeholder="agent@company.com"
                    className="w-full p-4 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Role</label>
                    <select 
                      value={newAgent.role}
                      onChange={(e) => setNewAgent({...newAgent, role: e.target.value as any})}
                      className="w-full p-4 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all"
                    >
                      <option value="agent">Agent</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Dept/Focus</label>
                    <input 
                      type="text" 
                      value={newAgent.specialization}
                      onChange={(e) => setNewAgent({...newAgent, specialization: e.target.value})}
                      placeholder="e.g. Sales"
                      className="w-full p-4 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl">
                   <div className="flex gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg h-fit">
                         <Shield size={16} className="text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-blue-900 dark:text-blue-100">Access Control</p>
                         <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5 leading-relaxed">Agents can only access assigned chats and cannot delete conversation logs.</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 dark:bg-[#1a1a24]/50 border-t border-slate-100 dark:border-white/5 flex gap-4">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-4 bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddAgent}
                  className="flex-1 px-4 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
                >
                  Create Profile
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
