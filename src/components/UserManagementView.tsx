import React, { useState, useEffect } from 'react';
import { 
 Users, UserPlus, Shield, Check, X, Edit2, Trash2, 
 Settings, Smartphone, MessageSquare, Send, BarChart3,
 CheckSquare, Zap, Lock, Eye, EyeOff, Plus, ChevronRight,
 ArrowLeft, LayoutDashboard, Database, LayoutGrid, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { API_URL, getHeaders, safeJson, updateDoc, onSnapshot, query } from '../api';

interface UserManagementViewProps {
 user: any;
 whatsappAccounts: any[];
 onBack?: () => void;
}

export function UserManagementView({ user, whatsappAccounts, onBack }: UserManagementViewProps) {
 const [subUsers, setSubUsers] = useState<any[]>([]);
 const [departments, setDepartments] = useState<any[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [isDeptLoading, setIsDeptLoading] = useState(false);
 const [isFormOpen, setIsFormOpen] = useState(false);
 const [editingUser, setEditingUser] = useState<any>(null);

 const [formData, setFormData] = useState({
 email: '',
 password: '',
 displayName: '',
 department: '',
 permissions: {
 features: ['overview', 'whatsapp'] as string[],
 subFeatures: {
 whatsapp: ['inbox', 'bulk', 'analytics', 'templates'] as string[]
 },
 accounts: [] as string[]
 }
 });

 const FEATURES = [
 { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={14} />, color: '#6366f1' },
 { id: 'accounts', label: 'Accounts', icon: <Database size={14} />, color: '#06b6d4' },
 { id: 'whatsapp', label: 'WhatsApp', icon: <Send size={14} />, color: '#10b981' },
 { id: 'contacts', label: 'Contacts', icon: <Users size={14} />, color: '#f59e0b' },
 { id: 'ads', label: 'Marketing', icon: <BarChart3 size={14} />, color: '#f97316' },
 ];

 const WHATSAPP_SUBFEATURES = [
 { id: 'inbox', label: 'Inbox', icon: <MessageSquare size={12} /> },
 { id: 'bulk', label: 'Broadcast', icon: <Send size={12} /> },
 { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={12} /> },
 { id: 'templates', label: 'Flows', icon: <CheckSquare size={12} /> }
 ];

 useEffect(() => {
 setIsLoading(true);
 setIsDeptLoading(true);

 const unsubscribeUsers = onSnapshot(query('users/sub-users'), (snapshot) => {
 setSubUsers(snapshot.docs.map((d: any) => d.data()));
 setIsLoading(false);
 });

 const unsubscribeDepts = onSnapshot(query('departments'), (snapshot) => {
 setDepartments(snapshot.docs.map((d: any) => d.data()));
 setIsDeptLoading(false);
 });

 return () => {
 unsubscribeUsers();
 unsubscribeDepts();
 };
 }, [user.uid]);

 const handleAddDepartment = async () => {
 const name = prompt('Enter Department Name:');
 if (!name) return;
 try {
 await updateDoc(`departments/dept_${Date.now()}`, { name, uid: user.uid });
 (window as any).showToast('Department created!', 'success');
 } catch (e) {
 console.error(e);
 }
 };

 const handleDeleteDept = async (id: string) => {
 if (!confirm('Delete this department?')) return;
 try {
 await fetch(`${API_URL}/departments/${id}`, { method: 'DELETE', headers: getHeaders() });
 } catch (e) {
 console.error(e);
 }
 };

 const handleSaveUser = async (e: React.FormEvent) => {
 e.preventDefault();
 const method = editingUser ? 'PATCH' : 'POST';
 const url = editingUser 
 ? `${API_URL}/users/sub-users/${editingUser.uid}`
 : `${API_URL}/users/sub-users`;

 try {
 const res = await fetch(url, {
 method,
 headers: getHeaders(),
 body: JSON.stringify(formData)
 });
 if (res.ok) {
 setIsFormOpen(false);
 resetForm();
 } else {
 const err = await res.json();
 alert(err.error || 'Failed to save user');
 }
 } catch (e) {
 alert('Error saving user');
 }
 };

 const handleDeleteUser = async (uid: string) => {
 if (!confirm('Permanent action: Delete this user?')) return;
 try {
 await fetch(`${API_URL}/users/sub-users/${uid}`, { method: 'DELETE', headers: getHeaders() });
 } catch (e) {
 console.error(e);
 }
 };

 const resetForm = () => {
 setFormData({
 email: '',
 password: '',
 displayName: '',
 department: '',
 permissions: {
 features: ['overview', 'whatsapp'],
 subFeatures: { whatsapp: ['inbox', 'bulk', 'analytics', 'templates'] },
 accounts: []
 }
 });
 setEditingUser(null);
 };

 const toggleFeature = (id: string) => {
 const features = [...formData.permissions.features];
 if (features.includes(id)) {
 setFormData({
 ...formData,
 permissions: { ...formData.permissions, features: features.filter(f => f !== id) }
 });
 } else {
 setFormData({
 ...formData,
 permissions: { ...formData.permissions, features: [...features, id] }
 });
 }
 };

 const toggleSubFeature = (id: string) => {
 const sub = [...(formData.permissions.subFeatures.whatsapp || [])];
 if (sub.includes(id)) {
 setFormData({
 ...formData,
 permissions: {
 ...formData.permissions,
 subFeatures: { ...formData.permissions.subFeatures, whatsapp: sub.filter(s => s !== id) }
 }
 });
 } else {
 setFormData({
 ...formData,
 permissions: {
 ...formData.permissions,
 subFeatures: { ...formData.permissions.subFeatures, whatsapp: [...sub, id] }
 }
 });
 }
 };

 const toggleAccount = (id: string) => {
 const accs = [...formData.permissions.accounts];
 if (accs.includes(id)) {
 setFormData({
 ...formData,
 permissions: { ...formData.permissions, accounts: accs.filter(a => a !== id) }
 });
 } else {
 setFormData({
 ...formData,
 permissions: { ...formData.permissions, accounts: [...accs, id] }
 });
 }
 };

 return (
 <div className="flex flex-col gap-6 px-0 max-w-6xl">
 {/* Simple Header */}
 <div className="flex flex-col gap-1">
 {onBack && (
 <button 
 onClick={onBack}
 className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-600 mb-2"
 >
 <ArrowLeft size={14} /> Back to Settings
 </button>
 )}
 <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 sm:gap-2">
 <div>
 <h1 className="text-2xl font-bold text-slate-600 dark:text-slate-200 leading-tight">Team Operations</h1>
 <p className="text-sm font-medium text-slate-500 dark:text-slate-200">Manage your agents, departments, and platform access.</p>
 </div>
 <div className="flex gap-2">
 <button 
 onClick={handleAddDepartment}
 className="px-4 py-2.5 bg-slate-100 dark:bg-[#1a1a24] text-slate-700 dark:text-slate-200 text-sm font-medium rounded-none flex items-center gap-2 border border-slate-200 dark:border-white/5 "
 >
 <LayoutGrid size={16} />
 <span className="hidden sm:inline">Add Department</span>
 </button>
 <button 
 onClick={() => { resetForm(); setIsFormOpen(true); }}
 className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-none flex items-center gap-2 -blue-500/20"
 >
 <Plus size={16} />
 <span className="hidden sm:inline">Add Agent</span>
 </button>
 </div>
 </div>
 </div>

 {/* Main Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
 
 {/* Left Column: Departments Management */}
 <div className="lg:col-span-1 space-y-4">
 <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Departments</h3>
 <div className="bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-none overflow-hidden ">
 {isDeptLoading ? (
 <div className="p-10 text-center text-[10px] font-bold text-slate-400 uppercase ">Syncing...</div>
 ) : departments.length === 0 ? (
 <div className="p-10 text-center">
 <Layers size={24} className="mx-auto text-slate-200 mb-2" />
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Depts</p>
 </div>
 ) : (
 <div className="divide-y divide-slate-100 dark:divide-white/5">
 {departments.map(dept => (
 <div key={dept.id} className="p-3 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-[#1a1a24] ">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-none bg-blue-500" />
 <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{dept.name}</span>
 </div>
 <button onClick={() => handleDeleteDept(dept.id)} className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 ">
 <Trash2 size={12} />
 </button>
 </div>
 ))}
 </div>
 )}
 <button onClick={handleAddDepartment} className="w-full p-3 text-[10px] font-bold text-blue-500 uppercase tracking-widest border-t border-slate-100 dark:border-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/10 ">
 + Create New
 </button>
 </div>
 </div>

 {/* Right Column: Agents List */}
 <div className="lg:col-span-3 space-y-4">
 <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Agents & Sub-Users</h3>
 {isLoading ? (
 <div className="py-20 text-center text-slate-700 dark:text-slate-200 font-bold text-sm">Syncing team...</div>
 ) : subUsers.length === 0 ? (
 <div className="py-20 bg-white dark:bg-[#16161d] border border-dashed border-slate-200 dark:border-white/10 rounded-none text-center ">
 <Users size={32} className="mx-auto text-slate-300 dark:text-[#252535] mb-4 opacity-50" />
 <p className="text-sm font-bold text-slate-500 dark:text-slate-200">Start by adding your first team member.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {subUsers.map(u => (
 <div key={u.uid} className="bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 p-5 rounded-none hover:border-blue-500 group ">
 <div className="flex justify-between items-start mb-4">
 <div className="flex items-center gap-3">
 <div className="w-12 h-12 rounded-none bg-slate-100 dark:bg-[#1f1f2a] flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-lg leading-none border border-slate-200 dark:border-white/5">
 {u.displayName?.[0]}
 </div>
 <div className="overflow-hidden">
 <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm leading-tight flex items-center gap-2">
 {u.displayName}
 {u.department && <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[8px] rounded-none uppercase font-bold">{u.department}</span>}
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-200 truncate mt-0.5">{u.email}</p>
 </div>
 </div>
 <div className="flex gap-1">
 <button 
 onClick={() => { setEditingUser(u); setFormData({ email: u.email, password: u.password, displayName: u.displayName, department: u.department || '', permissions: u.permissions }); setIsFormOpen(true); }}
 className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-none "
 >
 <Edit2 size={16} />
 </button>
 <button 
 onClick={() => handleDeleteUser(u.uid)}
 className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-none "
 >
 <Trash2 size={16} />
 </button>
 </div>
 </div>

 <div className="flex flex-col gap-3 pt-4 border-t border-slate-50 dark:border-white/5">
 <div className="flex flex-wrap gap-1.5">
 {u.permissions.features.map(f => (
 <span key={f} className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-[#1f1f2a] dark:text-slate-200 px-2 py-0.5 rounded-none uppercase tracking-tighter">
 {f}
 </span>
 ))}
 </div>
 {u.permissions.features.includes('whatsapp') && u.permissions.subFeatures?.whatsapp && (
 <div className="flex items-center gap-2 opacity-80">
 <Smartphone size={10} className="text-emerald-500" />
 <span className="text-[9px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest truncate">
 {u.permissions.subFeatures.whatsapp.join(' • ')}
 </span>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Slide-over Form */}
 <AnimatePresence>
 {isFormOpen && (
 <>
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFormOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300]" />
 <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween' }} className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white dark:bg-[#13131a] z-[310] flex flex-col border-l border-slate-200 dark:border-white/10 ">
 <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#13131a]">
 <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
 {editingUser ? <Edit2 size={20} className="text-blue-500" /> : <UserPlus size={20} className="text-blue-500" />}
 {editingUser ? 'Edit Team Member' : 'New Team Member'}
 </h3>
 <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white ">
 <X size={20} />
 </button>
 </div>

 <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
 <div className="flex flex-col gap-4">
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Name</label>
 <input required type="text" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} placeholder="Agent Name"
 className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/10 rounded-none text-sm font-medium focus:border-blue-500 outline-none dark:text-white"
 />
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email</label>
 <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@example.com"
 className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/10 rounded-none text-sm font-medium focus:border-blue-500 outline-none dark:text-white"
 />
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Password</label>
 <input required={!editingUser} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={editingUser ? "••••••••" : "Set password"}
 className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/10 rounded-none text-sm font-medium focus:border-blue-500 outline-none dark:text-white"
 />
 </div>
 <div className="flex flex-col gap-1.5">
 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Department</label>
 <select 
 value={formData.department} 
 onChange={e => setFormData({...formData, department: e.target.value})}
 className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/10 rounded-none text-sm font-medium focus:border-blue-500 outline-none dark:text-white"
 >
 <option value="">Unassigned</option>
 {departments.map(dept => (
 <option key={dept.id} value={dept.name}>{dept.name}</option>
 ))}
 </select>
 </div>
 </div>

 <div className="space-y-6 pt-8 border-t border-slate-100 dark:border-white/10">
 <div className="space-y-4">
 <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em] px-1">Feature Access</h4>
 <div className="grid grid-cols-1 gap-2">
 {FEATURES.map(f => (
 <button key={f.id} type="button" onClick={() => toggleFeature(f.id)}
 className={`flex items-center gap-3 px-4 py-3 rounded-none border text-sm font-medium ${ formData.permissions.features.includes(f.id) ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-500/50 text-blue-600 dark:text-blue-400 ' : 'bg-white dark:bg-[#16161d] border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-200 hover:border-blue-500/30' }`}
 >
 {f.icon}
 <span>{f.label}</span>
 {formData.permissions.features.includes(f.id) && <Check size={14} className="ml-auto" />}
 </button>
 ))}
 </div>
 </div>

 {formData.permissions.features.includes('whatsapp') && (
 <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/10">
 <h4 className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
 WhatsApp Capabilities
 </h4>
 <div className="grid grid-cols-2 gap-2">
 {WHATSAPP_SUBFEATURES.map(sf => (
 <button key={sf.id} type="button" onClick={() => toggleSubFeature(sf.id)}
 className={`flex items-center gap-2.5 px-4 py-2.5 rounded-none border text-[10px] font-bold ${ formData.permissions.subFeatures.whatsapp?.includes(sf.id) ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400 ' : 'bg-white dark:bg-[#16161d] border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-200 hover:border-emerald-500/30' }`}
 >
 {sf.icon}
 <span className="truncate uppercase tracking-widest">{sf.label}</span>
 </button>
 ))}
 </div>
 </div>
 )}

 <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/10">
 <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em] px-1">Authorized Accounts</h4>
 <div className="flex flex-col gap-2">
 {whatsappAccounts.map(acc => (
 <button key={acc.id} type="button" onClick={() => toggleAccount(acc.id)}
 className={`w-full flex items-center gap-3 px-4 py-3 rounded-none border text-left ${ formData.permissions.accounts.includes(acc.id) ? 'bg-slate-900 dark:bg-blue-600 border-transparent text-white ' : 'bg-white dark:bg-[#16161d] border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-200 hover:border-blue-500/30' }`}
 >
 <div className="text-xs font-bold leading-none">{acc.phoneNumber}</div>
 <div className={`text-[8px] ml-auto tracking-widest uppercase opacity-40 ${formData.permissions.accounts.includes(acc.id) ? 'text-white' : ''}`}>ID: {acc.id.slice(0,6)}</div>
 {formData.permissions.accounts.includes(acc.id) && <Check size={16} className="ml-1" />}
 </button>
 ))}
 </div>
 </div>
 </div>
 </form>

 <div className="p-6 border-t border-slate-200 dark:border-white/10 flex gap-3 bg-white dark:bg-[#13131a]">
 <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-3 px-4 bg-slate-100 dark:bg-[#1a1a24] text-slate-600 dark:text-slate-200 rounded-none font-bold text-xs uppercase tracking-widest border border-transparent dark:border-white/5">Cancel</button>
 <button type="submit" onClick={handleSaveUser} className="flex-[2] py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-none font-bold text-xs uppercase tracking-widest -blue-500/20">
 {editingUser ? 'Save Changes' : 'Invite Agent'}
 </button>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </div>
 );
}
