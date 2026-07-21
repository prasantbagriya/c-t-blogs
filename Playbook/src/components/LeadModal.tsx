/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Mail, Phone, Download, ShieldCheck, Heart } from "lucide-react";
import { PlaybookItem } from "../types";

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; phone: string }) => Promise<void>;
  item: PlaybookItem | null;
}

export default function LeadModal({ isOpen, onClose, onSubmit, item }: LeadModalProps) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({ name: "", email: "", phone: "" });
      }, 2000);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200"
          >
            {/* Header Graphics */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />
            
            <div className="p-8 pb-4">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                  <Download className="w-6 h-6" />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight mb-2">
                Get Access Now
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                Please provide your details to unlock <span className="text-indigo-600 font-bold">"{item.title}"</span> and start scaling your workflow.
              </p>
            </div>

            <div className="p-8 pt-4">
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 shadow-sm border border-green-200">
                    <Heart className="w-8 h-8 fill-current" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Access Granted!</h3>
                  <p className="text-slate-500 font-medium">Your download is starting shortly...</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative flex items-center group">
                      <User className="absolute left-4 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-indigo-400 focus:bg-white transition-all outline-none"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Official Email</label>
                    <div className="relative flex items-center group">
                      <Mail className="absolute left-4 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        required
                        type="email"
                        placeholder="e.g. rahul@example.com"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-indigo-400 focus:bg-white transition-all outline-none"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                    <div className="relative flex items-center group">
                      <Phone className="absolute left-4 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        required
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-indigo-400 focus:bg-white transition-all outline-none"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 hover:shadow-indigo-600/20 active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Unlock & Download
                        <Download className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  GDPR Protected Access
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100" />
                  ))}
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[8px] font-bold text-indigo-600">
                    +1.2k
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
