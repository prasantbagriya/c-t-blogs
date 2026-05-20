import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw,
  MessageSquare,
  Zap,
  BarChart3,
  ExternalLink,
  Plus,
  Trash2,
  Settings2,
  Users,
  Layout,
  Globe
} from 'lucide-react';
import { Instagram } from './common/BrandIcons';
import { db, collection, query, where, onSnapshot, updateDoc, doc, deleteDoc } from '../api';

interface InstagramDashboardProps {
  user: any;
  onOpenIntegrations: () => void;
  showToast: (m: string, t: any) => void;
}

export function InstagramDashboard({ user, onOpenIntegrations, showToast }: InstagramDashboardProps) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'instagram_accounts'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const accs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAccounts(accs);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this Instagram account?')) return;
    try {
      await deleteDoc(doc(db, 'instagram_accounts', id));
      showToast('Instagram account disconnected', 'success');
    } catch (e: any) {
      showToast('Failed to disconnect', 'error');
    }
  };

  const toggleStatus = async (account: any) => {
    try {
      await updateDoc(doc(db, 'instagram_accounts', account.id), {
        status: account.status === 'active' ? 'paused' : 'active'
      });
      showToast(`Automation ${account.status === 'active' ? 'paused' : 'resumed'}`, 'info');
    } catch (e: any) {
      showToast('Status update failed', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Instagram Handles...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 rounded-xl text-white shadow-lg shadow-pink-500/20">
                <Instagram size={24} />
             </div>
             <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Instagram Business Center</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your linked accounts and AI automation settings.</p>
        </div>
        <button 
          onClick={onOpenIntegrations}
          className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2 group"
        >
          <Plus size={16} /> Link New Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-white dark:bg-[#16161d] rounded-[3rem] border border-slate-200 dark:border-white/5 p-20 text-center space-y-6 shadow-2xl shadow-black/5">
           <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300">
              <Instagram size={48} />
           </div>
           <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Instagram Handles Linked</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">Connect your Instagram Business account via Meta to start automating your Direct Messages and Comments.</p>
           </div>
           <button 
             onClick={onOpenIntegrations}
             className="px-10 py-4 bg-gradient-to-tr from-purple-600 to-pink-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-pink-500/30 transition-all"
           >
             Get Started Now
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accounts.map(acc => (
            <motion.div 
              key={acc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#16161d] rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl shadow-black/5 group"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-tr from-purple-100 to-pink-100 flex items-center justify-center text-pink-600 shadow-inner overflow-hidden">
                      {acc.profilePicture ? (
                        <img src={acc.profilePicture} alt={acc.username} className="w-full h-full object-cover" />
                      ) : (
                        <Instagram size={32} />
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white dark:border-[#16161d] flex items-center justify-center ${acc.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                       <CheckCircle2 size={10} className="text-white" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleStatus(acc)}
                      className={`p-3 rounded-2xl transition-all ${acc.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}
                      title={acc.status === 'active' ? 'Pause Automation' : 'Resume Automation'}
                    >
                      <Zap size={18} className={acc.status === 'active' ? 'fill-current' : ''} />
                    </button>
                    <button 
                      onClick={() => handleDelete(acc.id)}
                      className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">@{acc.username}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{acc.displayName || 'Instagram Business'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 py-6 border-y border-slate-50 dark:border-white/5">
                  <div className="text-center p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-pink-500/30 transition-all">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Messages</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{acc.analytics?.totalMessages || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-blue-500/30 transition-all">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Handoffs</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{acc.analytics?.handoffs || 0}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Linked Page</span>
                     <span className="text-[10px] font-bold text-slate-600 dark:text-slate-200">{acc.pageId ? 'Synced with Meta' : 'Manual Connect'}</span>
                  </div>
                  <button 
                    className="w-full py-4 bg-slate-900 dark:bg-white/5 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Manage Settings <Settings2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* QUICK INFO */}
      <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 p-8 rounded-[3rem] border border-pink-500/10 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-pink-500/5">
         <div className="p-4 bg-white dark:bg-[#16161d] rounded-[2rem] shadow-xl text-pink-600">
            <Zap size={40} />
         </div>
         <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">AI Automation is Active</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Your Instagram handles are currently synced with the **Global Flow Engine**. All inbound DMs and comments will be handled by the AI based on your "Instagram Dedicated" flows.
            </p>
         </div>
         <button 
           onClick={() => window.open('https://chatwizs.com/docs/instagram', '_blank')}
           className="px-8 py-3 border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
         >
            Read Guide
         </button>
      </div>
    </div>
  );
}
