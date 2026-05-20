import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RefreshCw,
  ChevronLeft,
  Plus,
  Users,
  MessageSquare,
  BarChart3,
  Zap,
  Settings,
  ShieldCheck,
  ExternalLink,
  Globe,
  Sparkles,
  LayoutGrid,
  FileText,
  ArrowRight,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Facebook, Instagram } from '../common/BrandIcons';
import { getFacebookPages, connectFacebookPage, connectInstagramWithFacebook } from '../../api';
import { FacebookPageManager } from '../facebook/FacebookPageManager';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
const FB_BLUE = '#1877F2';

export function ManagePagesView({
  user,
  showToast,
  setActiveTab
}: {
  user: any;
  showToast: (m: string, t: any) => void;
  setActiveTab?: (tab: any) => void;
}) {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState('overview');

  const fetchPages = async () => {
    setLoading(true);
    try {
      const data = await getFacebookPages();
      setPages(data);
      // Auto-select first connected page
      const connected = data.find((p: any) => p.isConnected);
      if (connected && !selectedPage) setSelectedPage(connected);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const handleConnect = async (page: any) => {
    setConnecting(page.id);
    try {
      await connectFacebookPage(page);
      showToast(`${page.name} connected successfully`, 'success');
      await fetchPages();
      setSelectedPage({ ...page, isConnected: true });
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setConnecting(null);
    }
  };

  const handleLinkFacebook = async () => {
    const currentUid = user?.uid || user?.id;
    if (!currentUid) { showToast('Session expired. Refresh the page.', 'error'); return; }
    setLoading(true);
    try {
      await connectInstagramWithFacebook(currentUid);
      await new Promise(r => setTimeout(r, 3000));
      await fetchPages();
      showToast('Facebook Account Linked!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const FEATURES = [
    { id: 'feed',      label: 'Page Feed',    desc: 'Posts & Updates',    icon: <LayoutGrid />,    color: 'bg-blue-600' },
    { id: 'inbox',     label: 'Inbox',         desc: 'Page Messages',      icon: <MessageSquare />, color: 'bg-indigo-600' },
    { id: 'analytics', label: 'Analytics',     desc: 'Page Insights',      icon: <BarChart3 />,     color: 'bg-purple-600' },
    { id: 'flow',      label: 'Flow Builder',  desc: 'Automation',         icon: <Zap />,           color: 'bg-emerald-600' },
    { id: 'publisher', label: 'Publisher',     desc: 'Create Post',        icon: <FileText />,      color: 'bg-rose-600' },
    { id: 'settings',  label: 'Settings',      desc: 'Page Config',        icon: <Settings />,      color: 'bg-slate-600' },
  ];

  // ── Loading ──────────────────────────────────────────────
  if (loading && pages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-[#0a0a0f]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // ── No pages ─────────────────────────────────────────────
  if (pages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#0a0a0f]">
        <div className="w-20 h-20 bg-[#1877F2] rounded-xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-600/30">
          <Facebook size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
          Connect Facebook Page
        </h2>
        <p className="text-slate-500 max-w-sm mb-8 font-medium">
          Link your Facebook account to manage your pages, posts, and automation flows from one place.
        </p>
        <button
          onClick={handleLinkFacebook}
          disabled={loading}
          className="px-8 py-4 bg-[#1877F2] text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-600/30 disabled:opacity-60"
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Facebook size={16} />}
          Connect Now
        </button>
        <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-50 text-center">
          Make sure to disable adblockers for smooth connection
        </p>
      </div>
    );
  }

  // ── If viewing FacebookPageManager ───────────────────────
  if (selectedPage?.isConnected && activeSubTab !== 'overview') {
    return (
      <FacebookPageManager
        pageId={selectedPage.id}
        onBack={() => setActiveSubTab('overview')}
        showToast={showToast}
      />
    );
  }

  // ── Main Dashboard ───────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#f9fafb] dark:bg-[#0a0a0b]">
      {/* ── Minimalist Header ── */}
      <header className="px-6 py-5 bg-white/80 dark:bg-[#0f0f11]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (activeSubTab !== 'overview') {
                setActiveSubTab('overview');
              } else {
                setActiveTab?.('overview');
              }
            }}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-500 hover:text-black dark:hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Facebook Pages
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {selectedPage?.name || 'Managing Accounts'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchPages} 
            disabled={loading} 
            className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-full text-slate-400 hover:text-black dark:hover:text-white transition-all border border-slate-200/50 dark:border-white/5"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-5xl mx-auto p-6 space-y-8 pb-32"
          >
            {/* ── Account Selector (Threads Style) ── */}
            <section>
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Connected Pages</h3>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                {pages.filter(p => p.isConnected).map(page => (
                  <button
                    key={page.id}
                    onClick={() => setSelectedPage(page)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border shrink-0",
                      selectedPage?.id === page.id
                        ? "bg-white dark:bg-[#151518] border-blue-500/30 text-slate-900 dark:text-white shadow-xl shadow-blue-500/5 ring-1 ring-blue-500/10"
                        : "bg-white/50 dark:bg-white/2 border-slate-200/50 dark:border-white/5 text-slate-500 hover:bg-white dark:hover:bg-white/5"
                    )}
                  >
                    <div className="relative">
                      <img 
                        src={page.picture?.data?.url} 
                        className={cn("w-8 h-8 rounded-lg object-cover grayscale-[0.5]", selectedPage?.id === page.id && "grayscale-0")} 
                        alt="" 
                      />
                      {selectedPage?.id === page.id && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-[#151518]" />
                      )}
                    </div>
                    <span className="text-xs font-black tracking-tight">{page.name}</span>
                  </button>
                ))}
                
                <button
                  onClick={handleLinkFacebook}
                  className="flex items-center gap-2 px-4 py-3 bg-[#1877F2]/10 text-[#1877F2] rounded-2xl border border-[#1877F2]/20 hover:bg-[#1877F2]/20 transition-all shrink-0"
                >
                  <Plus size={16} />
                  <span className="text-xs font-black tracking-tight uppercase">Add Page</span>
                </button>
              </div>
            </section>

            {selectedPage ? (
              <>
                {/* ── Profile Hero Card ── */}
                <section>
                  <div className="relative overflow-hidden bg-white dark:bg-[#111114] p-8 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Facebook size={120} />
                    </div>
                    
                    <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-indigo-400 p-1 shadow-2xl">
                          {selectedPage.picture?.data?.url ? (
                            <img
                              src={selectedPage.picture.data.url}
                              className="w-full h-full rounded-[1.8rem] object-cover border-4 border-white dark:border-[#111114]"
                              alt={selectedPage.name}
                            />
                          ) : (
                            <div className="w-full h-full rounded-[1.8rem] bg-blue-600 flex items-center justify-center border-4 border-white dark:border-[#111114]">
                              <Facebook size={32} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-[#16161d] rounded-2xl flex items-center justify-center shadow-xl border border-slate-100 dark:border-white/5">
                          <Facebook size={18} className="text-[#1877F2]" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                            {selectedPage.name}
                          </h2>
                          <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center gap-1.5 border border-emerald-500/20">
                            <ShieldCheck size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Linked</span>
                          </div>
                        </div>
                        
                        <p className="text-slate-400 font-bold text-sm mt-2 max-w-lg">
                          {selectedPage.category || 'Professional Facebook Page'} • {(selectedPage.fan_count || 0).toLocaleString()} Followers
                        </p>
                        
                        <div className="flex flex-wrap gap-4 mt-6">
                           <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                             <Users size={14} className="text-blue-500" />
                             <span className="text-xs font-black text-slate-600 dark:text-slate-300">{(selectedPage.fan_count || 0).toLocaleString()}</span>
                           </div>
                           {selectedPage.instagram_business_account && (
                             <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                               <Instagram size={14} className="text-rose-500" />
                               <span className="text-xs font-black text-rose-500">IG Linked</span>
                             </div>
                           )}
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-2">
                        <button 
                          onClick={fetchPages}
                          className="px-6 py-3 bg-[#1877F2] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                        >
                          Refresh Data
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── Feature Bento Grid ── */}
                <section>
                  <div className="flex items-center justify-between mb-6 px-2">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Page Capabilities</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURES.map((feat) => (
                      <button
                        key={feat.id}
                        onClick={() => setActiveSubTab(feat.id)}
                        className="group bg-white dark:bg-[#111114] border border-slate-200/60 dark:border-white/5 p-6 rounded-[2rem] flex flex-col gap-5 text-left hover:border-blue-500/40 hover:shadow-2xl hover:-translate-y-1 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl", feat.color)}>
                            {React.cloneElement(feat.icon as React.ReactElement, { size: 24 })}
                          </div>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-white/5 group-hover:bg-blue-500/10 transition-colors">
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {feat.label}
                          </h3>
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">
                            {feat.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* ── Secondary Pages ── */}
                {pages.filter(p => !p.isConnected).length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6 px-2">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Manageable Pages</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pages.filter(p => !p.isConnected).map(page => (
                        <div 
                          key={page.id} 
                          className="flex items-center justify-between p-5 bg-white dark:bg-[#111114] rounded-[2rem] border border-slate-200/60 dark:border-white/5 hover:border-blue-500/20 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-white/5">
                              {page.picture?.data?.url ? (
                                <img src={page.picture.data.url} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center"><Facebook size={20} className="text-slate-300" /></div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{page.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{(page.fan_count || 0).toLocaleString()} followers</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleConnect(page)}
                            disabled={connecting === page.id}
                            className="w-10 h-10 flex items-center justify-center bg-[#1877F2]/10 text-[#1877F2] rounded-xl hover:bg-[#1877F2] hover:text-white transition-all disabled:opacity-50"
                          >
                            {connecting === page.id ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={18} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="py-24 text-center">
                <div className="w-24 h-24 bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                  <Facebook size={40} className="text-blue-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Active Page</h2>
                <p className="text-slate-500 font-bold text-sm max-w-sm mx-auto mt-4 uppercase tracking-widest">
                  Select a connected page from the list above or link a new one to begin.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
