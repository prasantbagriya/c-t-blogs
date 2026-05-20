import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Camera, 
  Save, 
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Zap,
  Fingerprint
} from 'lucide-react';
import { motion } from 'motion/react';
import { updateDoc, uploadFile, compressImage, getFileUrl } from '../api';

interface ProfileViewProps {
  user: any;
}

export const ProfileView = ({ user }: ProfileViewProps) => {
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || 'Business manager using ChatWizs.',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    businessName: user?.businessName || '',
    website: user?.website || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateDoc(`users/${user.uid}`, { 
        ...formData,
        updatedAt: new Date().toISOString()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Error: " + err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressedFile = await compressImage(file);
      const result = await uploadFile(compressedFile);
      const photoURL = result.url;
      await updateDoc(`users/${user.uid}`, { photoURL });
      alert("Profile photo updated.");
    } catch (error) {
       console.error(error);
       alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full h-full p-0 flex flex-col bg-white dark:bg-[#16161d] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 lg:p-4 space-y-8">
        <div className="bg-white dark:bg-[#16161d] p-4 sm:p-5 rounded-lg border border-slate-200 dark:border-white/5 transition-all">
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10">
          <div className="relative">
            <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-lg bg-slate-100 dark:bg-[#1a1a24] p-1 flex items-center justify-center border-2 border-slate-200 dark:border-white/5 overflow-hidden relative">
              {user?.photoURL ? (
                <img src={getFileUrl(user.photoURL)} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-slate-300" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-[#16161d]/80 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              )}
            </div>
            <label className="absolute -bottom-1.5 -right-1.5 w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 cursor-pointer shadow-none">
              <Camera size={18} />
              <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
            </label>
          </div>

          <div className="text-center md:text-left space-y-3">
             <div>
                <span className="text-[9px] font-medium text-blue-600 uppercase tracking-widest">User Profile</span>
                <h2 className="text-xl sm:text-2xl font-medium text-slate-900 dark:text-white mt-1 break-all">{formData.displayName || 'Account User'}</h2>
             </div>
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded text-[9px] font-medium border border-blue-100">
                   <ShieldCheck className="w-3 h-3" />
                   Verified
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded text-[9px] font-medium border border-blue-100">
                   <Zap className="w-3 h-3" />
                   Priority
                </div>
             </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-[#16161d] p-4 sm:p-5 rounded-lg border border-slate-200 dark:border-white/5 space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-2">
                <Fingerprint size={16} className="text-blue-600" />
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">General Settings</h3>
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-slate-700 dark:text-slate-200">Full Name</label>
                <input 
                  type="text" 
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded text-sm font-medium outline-none focus:border-blue-500 transition-colors dark:text-white"
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium text-slate-700 dark:text-slate-200">Email (Read Only)</label>
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-[#1a1a24] text-slate-700 dark:text-slate-200 rounded text-sm font-medium border border-slate-200 dark:border-white/5 cursor-not-allowed italic"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-medium text-slate-700 dark:text-slate-200">About Business</label>
                <textarea 
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded text-sm font-medium outline-none focus:border-blue-500 transition-colors dark:text-white"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium text-slate-700 dark:text-slate-200">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded text-sm font-medium outline-none focus:border-blue-500 transition-colors dark:text-white"
                  placeholder="+91 ..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium text-slate-700 dark:text-slate-200">Business Name</label>
                <input 
                  type="text" 
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded text-sm font-medium outline-none focus:border-blue-500 transition-colors dark:text-white"
                  placeholder="Your Company Name"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1a1a24] p-4 sm:p-5 rounded-lg text-slate-900 dark:text-white space-y-4 border border-slate-200 dark:border-white/5">
             <div>
                <h4 className="text-sm font-medium">Save Settings</h4>
                <p className="text-slate-700 dark:text-slate-200 text-[9px] font-medium leading-relaxed mt-1.5">
                   Changes will be synced across all instances.
                </p>
             </div>
             
             <button 
               type="submit"
               disabled={isSaving}
               className={`w-full py-3 rounded font-medium text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                 saveSuccess 
                 ? 'bg-emerald-500 text-white' 
                 : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
               }`}
             >
               {isSaving ? (
                 <Loader2 size={14} className="animate-spin" />
               ) : saveSuccess ? (
                 <>
                   <CheckCircle2 size={14} /> Updated
                 </>
               ) : (
                 <>
                   <Save size={14} /> Save Changes
                 </>
               )}
             </button>
          </div>

          <div className="p-6 border border-slate-200 dark:border-white/5 rounded-lg bg-slate-50 dark:bg-[#1a1a24]/50 space-y-3">
             <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-600" />
                <span className="text-[10px] font-medium text-slate-700 dark:text-slate-200">Security</span>
             </div>
             <p className="text-[10px] text-slate-500 dark:text-slate-200 leading-relaxed font-medium">
                Your profile data is protected by AES-256 encryption.
             </p>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
};
