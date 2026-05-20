import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Upload, 
  Plus, 
  Search, 
  RefreshCw, 
  MoreVertical 
} from 'lucide-react';
import { 
  db, 
  query, 
  collection, 
  where, 
  onSnapshot, 
  addDoc 
} from '../api';

interface ContactsViewProps {
  user: any;
  showToast: (msg: string, type: any) => void;
}

export const ContactsView = ({ user, showToast }: ContactsViewProps) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, 'contacts'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setContacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim());

      let importedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const contact: any = { uid: user.uid, tags: ['Imported'], createdAt: new Date().toISOString() };
        headers.forEach((h, idx) => {
          contact[h.toLowerCase()] = values[idx] || '';
        });

        if (contact.phone || contact.number || contact.mobile) {
          contact.phoneNumber = contact.phone || contact.number || contact.mobile;
        }

        if (contact.phoneNumber) {
          await addDoc(collection(db, 'contacts'), contact);
          importedCount++;
        }
      }
      showToast(`Successfully imported ${importedCount} contacts!`, "success");
    } catch (err: any) {
      showToast("Import failed: " + err.message, "error");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredContacts = contacts.filter(c =>
    (c.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phoneNumber?.includes(searchTerm)) ||
    (c.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#16161d] p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-white/5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            Audience & Contacts
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage your customer database and segments</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex-1 sm:flex-none px-4 py-2 sm:px-6 sm:py-3 bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded font-bold text-[11px] sm:text-sm hover:border-blue-500 transition-all flex items-center justify-center gap-2"
          >
            {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Import CSV
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
          <button className="flex-1 sm:flex-none px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded font-bold text-[11px] sm:text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#16161d] rounded-lg border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded-sm text-sm focus:border-blue-500 outline-none transition-colors dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border-transparent">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#1a1a24]/50 border-b border-slate-100 dark:border-white/5">
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-widest">Phone Number</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-widest">Tags</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading contacts...</td></tr>
              ) : filteredContacts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">No contacts found. Import your first batch!</td></tr>
              ) : (
                filteredContacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                          {contact.name?.charAt(0) || <Users className="w-4 h-4" />}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white text-sm">{contact.name || 'Unnamed'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-200">{contact.phoneNumber}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags?.map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-sm text-[10px] font-bold text-slate-500 uppercase">{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
