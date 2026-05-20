import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Plus, 
  Trash2, 
  MessageCircle, 
  ChevronRight,
  Zap,
  X
} from 'lucide-react';
import { 
  db, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  connectWhatsAppWithFacebook,
  handleDatabaseError,
  OperationType,
  uploadFile
} from '../api';

interface WhatsAppAccountsViewProps {
  user: any;
  onManage: (acc: any) => void;
}

export const WhatsAppAccountsView = ({ user, onManage }: WhatsAppAccountsViewProps) => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'whatsapp_accounts'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const accs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAccounts(accs);
      setLoading(false);
    }, (error) => {
      handleDatabaseError(error, OperationType.LIST, 'whatsapp_accounts');
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleConnectWithFacebook = async () => {
    try {
      setLoading(true);
      await connectWhatsAppWithFacebook(user.uid);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to connect WhatsApp account:', error);
      handleDatabaseError(error, OperationType.CREATE, 'whatsapp_accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this WhatsApp account?')) {
      try {
        await deleteDoc(doc(db, 'whatsapp_accounts', id));
      } catch (error) {
        handleDatabaseError(error, OperationType.DELETE, 'whatsapp_accounts');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-[#16161d] p-3.5 sm:p-6 rounded-lg border border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-blue-600">Accounts Manager</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-medium text-slate-900 dark:text-white mb-2">
            WhatsApp Accounts
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 font-normal max-w-sm leading-relaxed">
            Manage your high-throughput Business API instances and monitors.
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-medium text-sm hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/10"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Add New Account
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-[#16161d] p-4 sm:p-5 rounded-lg border border-slate-200 dark:border-white/5 animate-pulse h-48" />
          ))
        ) : accounts.length === 0 ? (
          <div className="col-span-full bg-slate-50 dark:bg-[#16161d]/50 p-16 rounded-lg border border-slate-200 dark:border-white/5 text-center">
            <Smartphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">No Accounts Linked</h3>
            <p className="text-sm text-slate-700 dark:text-slate-200 mb-8 max-w-xs mx-auto font-normal">
              Please connect your Meta Business WhatsApp number to start messaging.
            </p>
            <button 
              onClick={handleConnectWithFacebook}
              className="bg-blue-600 text-white px-8 py-3 rounded font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all"
            >
              Connect with Meta
            </button>
          </div>
        ) : (
          accounts.map(acc => (
            <div 
              key={acc.id}
              className="bg-white dark:bg-[#16161d] p-3 rounded-lg border border-slate-200 dark:border-white/5 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className={`w-8 h-8 rounded flex items-center justify-center ${acc.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-500'}`}>
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-medium uppercase tracking-wider ${acc.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                      {acc.status === 'active' ? 'Online' : 'Offline'}
                    </span>
                    <button 
                      onClick={() => handleDeleteAccount(acc.id)}
                      className="p-1 text-slate-600 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white truncate">{acc.name || 'Account'}</h3>
                  <p className="text-[10px] font-normal text-slate-700 dark:text-slate-200 mt-0.5 uppercase tracking-widest">{acc.phoneNumber || 'N/A'}</p>
                </div>
              </div>
              
              <button 
                onClick={() => onManage(acc)}
                className={`w-full py-2 rounded font-medium text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  acc.status === 'pending_config'
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {acc.status === 'pending_config' ? 'Setup' : 'Settings'}
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#13131a] w-full max-w-md rounded-lg overflow-hidden border border-slate-200 dark:border-white/10">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Connect Account</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="p-8 bg-blue-600 text-white rounded-lg">
                  <Zap className="w-8 h-8 mb-4 opacity-50" />
                  <h3 className="text-lg font-bold mb-2">Meta Connection</h3>
                  <p className="text-xs font-medium opacity-80 leading-relaxed mb-8">Authorise ChatWizs to send and receive messages on your behalf via Meta's Business SDK.</p>
                  <button 
                    onClick={handleConnectWithFacebook}
                    className="w-full py-3 bg-white text-blue-600 rounded-xl font-medium text-sm active:scale-95 transition-all shadow-sm"
                  >
                    Connect with Meta
                  </button>
                </div>
                <p className="text-[9px] text-center text-slate-600 uppercase tracking-widest">Secure AES-256 Link</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
