import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, RefreshCw, Settings2, ArrowRight } from 'lucide-react';

interface ConnectionsTabProps {
  PLATFORMS: any[];
  connections: any[];
  razorpaySettings: any;
  setShowRazorpayDashboard: (show: boolean) => void;
  triggerSync: (platformId: string) => void;
  isSyncing: boolean;
  setSelectedPlatform: (p: any) => void;
  onNavigate?: (tab: string) => void;
}

export const ConnectionsTab = ({
  PLATFORMS,
  connections,
  razorpaySettings,
  setShowRazorpayDashboard,
  triggerSync,
  isSyncing,
  setSelectedPlatform,
  onNavigate
}: ConnectionsTabProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {PLATFORMS.map(platform => {
        const isConnected = platform.id === 'google_sheet_automation' 
          ? connections.some(c => c.platform === 'google_sheets')
          : connections.some(c => c.platform === platform.id);
        
        return (
          <div 
            key={platform.id}
            className="bg-white dark:bg-[#16161d] rounded-2xl border border-slate-200 dark:border-white/5 p-5 flex flex-col h-full hover:border-blue-500/50 transition-all shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm" 
                style={{ backgroundColor: platform.color }}
              >
                {React.cloneElement(platform.icon as React.ReactElement, { size: 24 })}
              </div>
              {isConnected && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 size={12} />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Linked</span>
                </div>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">{platform.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 grow leading-relaxed">
              {platform.desc}
            </p>

            <div className="pt-4 border-t border-slate-50 dark:border-white/5">
              {platform.id === 'razorpay' && razorpaySettings ? (
                <button 
                  onClick={() => setShowRazorpayDashboard(true)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                >
                  Manage Dashboard
                </button>
              ) : isConnected ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => triggerSync(platform.id)}
                    disabled={isSyncing}
                    className="flex-1 py-2 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                    Sync
                  </button>
                  <button className="p-2 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-all">
                    <Settings2 size={14} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    if (platform.id === 'widget' && onNavigate) {
                      onNavigate('widget');
                    } else {
                      setSelectedPlatform(platform);
                    }
                  }}
                  className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all"
                >
                  {platform.id === 'widget' ? 'Open Builder' : 'Connect Now'} <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        );
      })}
      {/* Advanced Discovery Section */}
      <div className="col-span-full mt-8 p-6 bg-slate-50 dark:bg-white/2 rounded-4xl border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center">
             <Settings2 size={24} />
           </div>
           <div>
             <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Advanced Page Discovery</h4>
             <p className="text-[10px] font-medium text-slate-500 max-w-md mt-1">If your Instagram account isn't appearing automatically, try linking your Facebook Pages manually to refresh the connection.</p>
           </div>
        </div>
        <button 
          onClick={() => onNavigate?.('manage-pages')}
          className="w-full md:w-auto px-8 py-3 bg-white dark:bg-white/5 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm"
        >
          Manage Pages Manually
        </button>
      </div>
    </div>
  );
};
