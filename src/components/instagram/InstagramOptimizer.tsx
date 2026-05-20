import React, { useState, useEffect } from 'react';
import { Target, Sparkles, RefreshCw, Save, CheckCircle2, AlertCircle, TrendingUp, Search, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { API_URL, getHeaders } from '../../api/common';

export const InstagramOptimizer = ({ user, account }: { user: any; account: any }) => {
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'bio' | 'hashtags' | 'strategy'>('bio');

  const handleOptimize = async () => {
    if (!account?.id) return;
    setOptimizing(true);
    try {
      const res = await fetch(`${API_URL}/instagram/optimize`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ accountId: account.id })
      });
      const data = await res.json();
      if (res.ok) {
        setSuggestions(data.suggestions);
        (window as any).showToast?.('Optimization suggestions ready!', 'success');
      } else {
        (window as any).showToast?.(data.error || 'Optimization failed', 'error');
      }
    } catch (e: any) {
      (window as any).showToast?.(e.message, 'error');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="py-4 sm:py-6 px-2 sm:px-4 lg:px-6 bg-slate-50 dark:bg-[#0f0f13] h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-[#16161d] p-6 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600">
              <Target size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">AI Profile Optimizer</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Boost reach & engagement with AI-driven SEO</p>
            </div>
          </div>
          <button 
            onClick={handleOptimize}
            disabled={optimizing}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20"
          >
            {optimizing ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {optimizing ? 'Analyzing Profile...' : 'Run SEO Audit'}
          </button>
        </div>

        {!suggestions ? (
          <div className="bg-white dark:bg-[#16161d] p-12 rounded-3xl border border-slate-200 dark:border-white/5 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Search size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Ready for growth?</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Our AI will analyze your current bio, posting patterns, and industry trends to suggest high-impact improvements.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Navigation */}
            <div className="space-y-2">
              {[
                { id: 'bio', label: 'Bio & Name', icon: <RefreshCw size={14} />, color: 'text-pink-500' },
                { id: 'hashtags', label: 'Hashtag Clusters', icon: <Hash size={14} />, color: 'text-blue-500' },
                { id: 'strategy', label: 'Growth Strategy', icon: <TrendingUp size={14} />, color: 'text-emerald-500' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white dark:bg-[#1a1a24] border-blue-600 shadow-lg' 
                      : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-white/5'}`}>
                    {tab.icon}
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-slate-900 dark:text-white' : ''}`}>
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Right Column: Content */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-[#16161d] p-8 rounded-3xl border border-slate-200 dark:border-white/5"
                >
                  {activeTab === 'bio' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recommended Bio</h4>
                        <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 relative group">
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {suggestions.bio}
                          </p>
                          <button className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 bg-white dark:bg-[#1a1a24] rounded-lg shadow-md transition-all text-blue-600 hover:scale-110">
                            <Save size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                          <h5 className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Keywords Found</h5>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {suggestions.keywords?.map((kw: string) => (
                              <span key={kw} className="px-2 py-0.5 bg-white dark:bg-white/5 text-emerald-600 text-[8px] font-black rounded-full uppercase tracking-tighter border border-emerald-500/10">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20">
                          <h5 className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-1">CTA Strength</h5>
                          <p className="text-xs font-bold text-blue-700 mt-1">{suggestions.ctaStrength || 'Strong'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'hashtags' && (
                    <div className="space-y-6">
                       {suggestions.hashtagClusters?.map((cluster: any, idx: number) => (
                         <div key={idx} className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{cluster.label}</h4>
                            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-wrap gap-2">
                               {cluster.tags.map((tag: string) => (
                                 <span key={tag} className="text-blue-500 text-xs font-bold hover:underline cursor-pointer">#{tag}</span>
                               ))}
                            </div>
                         </div>
                       ))}
                    </div>
                  )}

                  {activeTab === 'strategy' && (
                    <div className="space-y-6">
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content Pillars</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {suggestions.strategy?.pillars?.map((pillar: any, idx: number) => (
                               <div key={idx} className="p-4 bg-white dark:bg-[#1a1a24] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                                  <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase">{pillar.title}</h5>
                                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{pillar.description}</p>
                               </div>
                             ))}
                          </div>
                       </div>
                       <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white">
                          <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80">Pro Tip</h4>
                          <p className="text-sm font-bold mt-2 leading-relaxed italic">"{suggestions.strategy?.proTip}"</p>
                       </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
