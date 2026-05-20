import React, { useState } from 'react';
import { 
  Zap, 
  Sun, 
  Moon, 
  Bell, 
  MessageSquare, 
  CheckSquare, 
  BarChart3, 
  Shield, 
  Globe, 
  Users, 
  ChevronRight, 
  UserCircle 
} from 'lucide-react';
import { Facebook } from '../common/BrandIcons';

interface SettingsViewProps {
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  currentUser: any;
  onConnectFacebook: () => void;
  onOpenUsers: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  isDarkMode, 
  setIsDarkMode, 
  currentUser, 
  onConnectFacebook, 
  onOpenUsers 
}) => {
  const [preferences, setPreferences] = useState({
    newMessage: true,
    templateStatus: true,
    campaignPerformance: false,
    securityAlerts: true,
    marketingEmails: false
  });

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-full space-y-4 sm:space-y-8 pb-8">
      <div className="py-2 sm:py-4 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">Settings</h2>
        <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-200">Manage your account preferences and notification settings.</p>
      </div>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-[#16161d] rounded-lg border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-200">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Appearance
          </h3>
          <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-200 mt-1">Customize how ChatWizs looks for you.</p>
        </div>
        <div className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
          <div className="flex gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 dark:bg-[#16161d] rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-200">
              {isDarkMode ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</p>
              <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-200 max-w-[180px] sm:max-w-md">Switch between light and dark themes.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-all relative ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-0.5 sm:top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'left-5 sm:left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#16161d] rounded-lg border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Notification Preferences
          </h3>
          <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-200 mt-1">Choose what updates you want to receive.</p>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[
            { id: 'newMessage', label: 'New Message Alerts', desc: 'Get notified when a customer sends you a new message.', icon: <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" /> },
            { id: 'templateStatus', label: 'Template Approval', desc: 'Receive alerts when your message templates are approved or rejected.', icon: <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" /> },
            { id: 'campaignPerformance', label: 'Campaign Reports', desc: 'Weekly summaries of your bulk messaging and ad campaign results.', icon: <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" /> },
            { id: 'securityAlerts', label: 'Security Alerts', desc: 'Important notifications about your account security and login activity.', icon: <Shield className="w-4 h-4 sm:w-5 sm:h-5" /> }
          ].map((item) => (
            <div key={item.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 dark:bg-[#16161d] rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-200">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-200 max-w-[170px] sm:max-w-md">{item.desc}</p>
                </div>
              </div>
              <button 
                onClick={() => togglePreference(item.id as keyof typeof preferences)}
                className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-all relative ${preferences[item.id as keyof typeof preferences] ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 sm:top-1 w-4 h-4 bg-white rounded-full transition-all ${preferences[item.id as keyof typeof preferences] ? 'left-5 sm:left-7' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-[#16161d]/50 flex justify-end gap-3">
          <button className="px-4 py-2 text-[10px] sm:text-sm font-bold text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-widest">Cancel</button>
          <button className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-[10px] sm:text-sm hover:bg-blue-700 transition-all uppercase tracking-widest">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#16161d] rounded-lg border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Connected Accounts
          </h3>
          <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-200 mt-1">Manage your linked social accounts.</p>
        </div>
        <div className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
          <div className="flex gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1877F2]/10 rounded-lg flex items-center justify-center text-[#1877F2]">
              <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Facebook</p>
              <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-200 max-w-[170px] sm:max-w-md">
                {currentUser?.facebookId ? `Linked as ${currentUser.displayName}` : 'Connect your Facebook account.'}
              </p>
            </div>
          </div>
          {currentUser?.facebookId ? (
            <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded h-fit">
              Active
            </span>
          ) : (
            <button 
              onClick={onConnectFacebook}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1877F2] text-white rounded-lg font-bold text-[10px] sm:text-sm hover:bg-[#166fe5] transition-all uppercase tracking-widest"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* White-labeling Section */}
      <div className="bg-white dark:bg-[#16161d] rounded-lg border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            White-label & Branding
          </h3>
          <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-200 mt-1">Customize the platform identity for your brand.</p>
        </div>
        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Brand Name</label>
              <input 
                type="text" 
                placeholder="e.g. My Agency"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 rounded-lg text-xs sm:text-sm outline-none focus:border-blue-500 transition-colors dark:text-white" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Brand Logo (URL)</label>
              <input 
                type="text" 
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 rounded-lg text-xs sm:text-sm outline-none focus:border-blue-500 transition-colors dark:text-white" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Primary Theme Color</label>
              <div className="flex gap-3 mt-1">
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                  <button 
                    key={color}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-[#16161d] shadow-sm transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                  />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 cursor-pointer text-xs">+</div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Custom Domain (CNAME)</label>
              <input 
                type="text" 
                placeholder="app.yourbrand.com"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 rounded-lg text-xs sm:text-sm outline-none focus:border-blue-500 transition-colors dark:text-white font-mono" 
              />
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-[#16161d]/50 flex justify-end gap-3 border-t border-slate-100 dark:border-white/5">
           <button className="px-4 sm:px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold text-[10px] sm:text-sm hover:bg-emerald-700 transition-all uppercase tracking-widest">
              Update Brand
           </button>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white dark:bg-[#16161d] rounded-lg border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            User Management
          </h3>
          <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-200 mt-1">Manage sub-users, roles, and platform permissions.</p>
        </div>
        <div className="p-4 sm:p-6">
          <button 
            onClick={onOpenUsers}
            className="w-full flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-lg hover:border-blue-500 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Admin Control Panel</p>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-200">Configure team access and security policies.</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Account Details Section */}
      <div className="bg-white dark:bg-[#16161d] rounded-lg border border-slate-200 dark:border-white/5 p-4 sm:p-6">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <UserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          Account Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1 sm:space-y-2">
            <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
            <input 
              readOnly
              type="text" 
              defaultValue={currentUser?.displayName || "User"} 
              className="w-full px-4 py-2 sm:py-3 bg-slate-50 dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-lg text-xs sm:text-sm focus:border-blue-500 outline-none transition-colors dark:text-white" 
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
            <input 
              readOnly
              type="email" 
              defaultValue={currentUser?.email || "No email"} 
              className="w-full px-4 py-2 sm:py-3 bg-slate-50 dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-lg text-xs sm:text-sm focus:border-blue-500 outline-none transition-colors dark:text-white" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
