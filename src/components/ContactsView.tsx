import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Upload, 
  Plus, 
  Search, 
  RefreshCw, 
  MoreVertical,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import { 
  db, 
  query, 
  collection, 
  where, 
  onSnapshot, 
  addDoc,
  updateDoc,
  deleteDoc,
  doc
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
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', phoneNumber: '', email: '', tags: '' });
  
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

  const handleOpenModal = (contact?: any) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name || '',
        phoneNumber: contact.phoneNumber || '',
        email: contact.email || '',
        tags: contact.tags ? contact.tags.join(', ') : ''
      });
    } else {
      setEditingContact(null);
      setFormData({ name: '', phoneNumber: '', email: '', tags: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleSaveContact = async () => {
    if (!formData.phoneNumber) {
      showToast("Phone number is required", "error");
      return;
    }

    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    const contactData = {
      uid: user.uid,
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      tags: tagsArray,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingContact) {
        await updateDoc(doc(db, 'contacts', editingContact.id), contactData);
        showToast("Contact updated successfully", "success");
      } else {
        await addDoc(collection(db, 'contacts'), { ...contactData, createdAt: new Date().toISOString() });
        showToast("Contact added successfully", "success");
      }
      handleCloseModal();
    } catch (error: any) {
      showToast("Error saving contact: " + error.message, "error");
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      await deleteDoc(doc(db, 'contacts', id));
      showToast("Contact deleted", "success");
    } catch (error: any) {
      showToast("Error deleting contact: " + error.message, "error");
    }
  };

  const filteredContacts = contacts.filter(c =>
    (c.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phoneNumber?.includes(searchTerm)) ||
    (c.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.tags?.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-6 relative">
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
            className="flex-1 sm:flex-none px-4 py-2 sm:px-6 sm:py-3 bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded font-bold text-[11px] sm:text-sm hover:border-blue-500 transition-all flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200"
          >
            {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Import CSV
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
          <button 
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded font-bold text-[11px] sm:text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
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
              placeholder="Search by name, phone, email or tags..."
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
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">No contacts found. Add your first contact or import a CSV!</td></tr>
              ) : (
                filteredContacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                          {contact.name?.charAt(0) || <Users className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-white text-sm">{contact.name || 'Unnamed'}</span>
                          {contact.email && <span className="text-xs text-slate-500">{contact.email}</span>}
                        </div>
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
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(contact)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                          title="Edit Contact"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#16161d] w-full max-w-md rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded py-2 px-3 text-sm focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Phone Number <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded py-2 px-3 text-sm focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                  placeholder="e.g. 919876543210 (with country code)"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded py-2 px-3 text-sm focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                  placeholder="e.g. john@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Tags (comma separated)</label>
                <input 
                  type="text" 
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded py-2 px-3 text-sm focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                  placeholder="e.g. VIP, Leads, Webinar 2024"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#1a1a24] border-t border-slate-100 dark:border-white/10 flex justify-end gap-3">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 rounded transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveContact}
                className="px-4 py-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors text-sm shadow-lg shadow-blue-500/20"
              >
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
