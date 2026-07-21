import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Zap, FileText, CreditCard } from 'lucide-react';

interface IntegrationModalsProps {
 selectedPlatform: any;
 setSelectedPlatform: (p: any) => void;
 formData: any;
 setFormData: (d: any) => void;
 handleConnect: () => void;
 showLinkModal: boolean;
 setShowLinkModal: (show: boolean) => void;
 API_URL: string;
 user: any;
 showToast: (m: string, t: any) => void;
}

export const IntegrationModals = ({
 selectedPlatform,
 setSelectedPlatform,
 formData,
 setFormData,
 handleConnect,
 showLinkModal,
 setShowLinkModal,
 API_URL,
 user,
 showToast
}: IntegrationModalsProps) => {
 return (
 <>
 <AnimatePresence>
 {selectedPlatform && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <motion.div 
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 onClick={() => setSelectedPlatform(null)}
 className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
 />
 <motion.div 
 initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
 className="bg-white dark:bg-[#16161d] w-full max-w-md rounded-none border border-slate-200 dark:border-white/10 relative z-10 p-6"
 >
 <div className="flex items-center gap-3 mb-6">
 <div className="w-10 h-10 rounded-none flex items-center justify-center text-white " style={{ backgroundColor: selectedPlatform.color }}>
 {React.cloneElement(selectedPlatform.icon as React.ReactElement, { size: 20 })}
 </div>
 <div>
 <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Link {selectedPlatform.name}</h3>
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Integration Setup</p>
 </div>
 </div>

 <div className="space-y-4">
 {selectedPlatform.id === 'shopify' && (
 <div className="flex bg-slate-50 dark:bg-white/5 p-1 rounded-none border border-slate-200 dark:border-white/5 mb-2">
 <button 
 onClick={() => setFormData({...formData, method: 'oauth'})}
 className={`flex-1 py-2 rounded-none text-[10px] font-bold uppercase tracking-widest ${(!formData.method || formData.method === 'oauth') ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white' : 'text-slate-400'}`}
 >
 Automatic
 </button>
 <button 
 onClick={() => setFormData({...formData, method: 'manual'})}
 className={`flex-1 py-2 rounded-none text-[10px] font-bold uppercase tracking-widest ${formData.method === 'manual' ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white' : 'text-slate-400'}`}
 >
 Manual
 </button>
 </div>
 )}

 {selectedPlatform.id === 'shopify' && (
 <div className="space-y-1.5">
 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Store Subdomain</label>
 <input 
 type="text"
 placeholder="e.g. store-name"
 value={formData.shopName || ''}
 onChange={(e) => setFormData({...formData, shopName: e.target.value})}
 className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#202c33] border border-slate-200 dark:border-white/5 rounded-none outline-none focus:border-blue-500 text-sm dark:text-white"
 />
 </div>
 )}

 {formData.method === 'manual' && (
 <>
 <div className="space-y-1.5">
 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">API Key</label>
 <input 
 type="text"
 placeholder="Admin API Key"
 value={formData.apiKey || ''}
 onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
 className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#202c33] border border-slate-200 dark:border-white/5 rounded-none outline-none focus:border-blue-500 text-sm dark:text-white"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Access Token</label>
 <input 
 type="password"
 placeholder="shpat_..."
 value={formData.accessToken || ''}
 onChange={(e) => setFormData({...formData, accessToken: e.target.value})}
 className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#202c33] border border-slate-200 dark:border-white/5 rounded-none outline-none focus:border-blue-500 text-sm dark:text-white"
 />
 </div>
 </>
 )}

 {selectedPlatform.id === 'razorpay' && (
 <div className="space-y-3">
 <div className="space-y-1.5">
 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Key ID</label>
 <input 
 type="text"
 placeholder="rzp_..."
 value={formData.keyId || ''}
 onChange={(e) => setFormData({...formData, keyId: e.target.value})}
 className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#202c33] border border-slate-200 dark:border-white/5 rounded-none outline-none focus:border-blue-500 text-sm dark:text-white"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Key Secret</label>
 <input 
 type="password"
 placeholder="••••••••••••••••"
 value={formData.keySecret || ''}
 onChange={(e) => setFormData({...formData, keySecret: e.target.value})}
 className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#202c33] border border-slate-200 dark:border-white/5 rounded-none outline-none focus:border-blue-500 text-sm dark:text-white"
 />
 </div>
 </div>
 )}

 {selectedPlatform.id === 'google_sheets' && (
 <div className="space-y-1.5">
 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Spreadsheet ID</label>
 <input 
 type="text"
 placeholder="e.g. 1aBC... (from URL)"
 value={formData.spreadsheetId || ''}
 onChange={(e) => setFormData({...formData, spreadsheetId: e.target.value})}
 className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#202c33] border border-slate-200 dark:border-white/5 rounded-none outline-none focus:border-blue-500 text-sm dark:text-white"
 />
 </div>
 )}

 <div className="flex gap-3 pt-4">
 <button 
 onClick={() => setSelectedPlatform(null)}
 className="flex-1 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-none font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 "
 >
 Cancel
 </button>
 <button 
 onClick={handleConnect}
 className="flex-1 py-2.5 bg-blue-600 text-white rounded-none font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 "
 >
 Connect
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 <AnimatePresence>
 {showLinkModal && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowLinkModal(false)} />
 <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="relative bg-white dark:bg-[#16161d] w-full max-w-sm rounded-none p-6 border border-slate-200 dark:border-white/10">
 <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Payment Link</h3>
 <div className="space-y-3">
 <div className="space-y-1.5">
 <label className="text-[10px] font-bold uppercase text-slate-400">Amount (INR)</label>
 <input id="linkAmount" type="number" placeholder="500" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#202c33] border border-slate-200 dark:border-white/5 rounded-none outline-none focus:border-blue-500 dark:text-white text-sm" />
 </div>
 <div className="space-y-1.5">
 <label className="text-[10px] font-bold uppercase text-slate-400">Description</label>
 <input id="linkDesc" type="text" placeholder="Consultation" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#202c33] border border-slate-200 dark:border-white/5 rounded-none outline-none focus:border-blue-500 dark:text-white text-sm" />
 </div>
 </div>
 <button 
 onClick={async () => { 
 const amount = (document.getElementById('linkAmount') as HTMLInputElement).value;
 const desc = (document.getElementById('linkDesc') as HTMLInputElement).value;
 if(!amount) return showToast('Amount is required', 'error');
 
 try {
 const res = await fetch(`${API_URL}/payments/razorpay/create-order`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ amount, description: desc, uid: user.uid, paymentType: 'manual_link' })
 });
 const data = await res.json();
 if(data.id) {
 const link = `https://rzp.io/l/${data.id}`;
 navigator.clipboard.writeText(link);
 showToast('Copied!', 'success'); 
 setShowLinkModal(false); 
 } else throw new Error(data.error);
 } catch(e: any) { showToast(e.message, 'error'); }
 }} 
 className="w-full mt-6 py-2.5 bg-blue-600 text-white rounded-none font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 "
 >
 Generate & Copy
 </button>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </>
 );
};
