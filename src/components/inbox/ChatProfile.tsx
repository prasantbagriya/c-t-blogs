import React, { useState } from 'react';
import { Globe, Phone, TrendingUp, ShieldAlert, Ticket, Star, X } from 'lucide-react';
import { updateDoc, addDoc } from '../../api';

interface ChatProfileProps {
  selectedChat: any;
  onClose: () => void;
  filteredMessages: any[];
  onUpdateLeadStatus?: () => void;
}

export const ChatProfile = ({
  selectedChat,
  onClose,
  filteredMessages,
}: ChatProfileProps) => {
  const [leadRemarks, setLeadRemarks] = useState('');
  const [isUpdatingLead, setIsUpdatingLead] = useState(false);

  const handleUpdateStatus = async (updates: any) => {
    setIsUpdatingLead(true);
    try {
      const cleanPhone = selectedChat.phone || selectedChat.id;
      await updateDoc(`cm-c/${cleanPhone}`, { ...updates, lastInteraction: new Date().toISOString() });
      (window as any).showToast?.("Updated", "success");
    } catch (err) { console.error(err); }
    finally { setIsUpdatingLead(false); }
  };

  const handleCreateTicket = async () => {
    if (!leadRemarks.trim()) return;
    setIsUpdatingLead(true);
    try {
      await addDoc('tk-c', {
        chatId: selectedChat.id,
        customerName: selectedChat.name,
        remarks: leadRemarks,
        status: 'Open',
        createdAt: new Date().toISOString()
      });
      setLeadRemarks('');
      (window as any).showToast?.("Ticket created", "success");
    } catch (err) { console.error(err); }
    finally { setIsUpdatingLead(false); }
  };

  const isWidget = selectedChat?.messages?.[0]?.source === 'widget' || selectedChat?.messages?.[0]?.source === 'website';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111b21]">
      <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile</h3>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all">
          <X size={18} className="text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mb-3 shadow-sm">
            {selectedChat.name ? selectedChat.name[0] : 'U'}
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{selectedChat.name}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {isWidget ? 'Website Visitor' : 'WhatsApp Contact'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Identity</p>
            <div className="flex items-center gap-2">
              {isWidget ? <Globe size={12} className="text-blue-500" /> : <Phone size={12} className="text-blue-500" />}
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{selectedChat.phone || selectedChat.id}</span>
            </div>
          </div>

          {filteredMessages.find(m => m.pageUrl) && (
            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Page</p>
              <div className="flex items-center gap-2">
                <Globe size={12} className="text-slate-400" />
                <a href={[...filteredMessages].reverse().find(m => m.pageUrl)?.pageUrl} target="_blank" className="text-xs font-medium text-blue-600 hover:underline truncate block">
                  {(() => { try { return new URL([...filteredMessages].reverse().find(m => m.pageUrl)?.pageUrl).pathname || 'Home'; } catch { return 'Page'; } })()}
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleUpdateStatus({ status: 'Solved' })} className="py-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-slate-200 dark:border-white/5 transition-all">Solved</button>
            <button onClick={() => handleUpdateStatus({ status: 'Pending' })} className="py-2 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-slate-200 dark:border-white/5 transition-all">Pending</button>
          </div>
          <button onClick={() => handleUpdateStatus({ isHotLead: !selectedChat.isHotLead })} className={`w-full py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${selectedChat.isHotLead ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 text-slate-400 border border-slate-200 dark:border-white/5 hover:bg-slate-100'}`}>
            <Star size={12} fill={selectedChat.isHotLead ? 'currentColor' : 'none'} />
            Mark Hot Lead
          </button>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">New Ticket</p>
          <textarea
            placeholder="Issue details..."
            value={leadRemarks}
            onChange={(e) => setLeadRemarks(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg text-xs outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white resize-none"
            rows={2}
          />
          <button
            onClick={handleCreateTicket}
            disabled={isUpdatingLead || !leadRemarks.trim()}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm disabled:opacity-50 transition-all"
          >
            Create Ticket
          </button>
        </div>

        <button
          onClick={async () => {
             if (!confirm(`Block this contact?`)) return;
             await handleUpdateStatus({ status: 'Blocked' });
          }}
          className="w-full py-2 text-rose-500 hover:bg-rose-50 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-rose-100 transition-all flex items-center justify-center gap-2"
        >
          <ShieldAlert size={14} />
          Block Contact
        </button>
      </div>
    </div>
  );
};
