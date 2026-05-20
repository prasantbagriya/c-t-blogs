import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Copy, 
  Check, 
  Settings, 
  MessageSquare, 
  Palette, 
  Layout, 
  Save, 
  Plus, 
  Trash2,
  ExternalLink,
  Code2,
  Smartphone,
  Monitor,
  RefreshCw,
  Zap,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { API_URL, getHeaders } from '../api/common';
import { db, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from '../api';

interface WidgetSettings {
  id?: string;
  uid: string;
  name: string;
  businessName: string;
  greeting: string;
  primaryColor: string;
  secondaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  welcomeMessage: string;
  bubbleSize?: number;
  themeStyle?: 'solid' | 'gradient';
  gradientColor?: string;
  bubbleIcon?: string;
  iconColor?: string;
  isEnabled?: boolean;
}

const DEFAULT_SETTINGS: Partial<WidgetSettings> = {
  name: 'Main Website Widget',
  businessName: 'ChatWizs Support',
  greeting: 'Hi there! How can we help you today?',
  primaryColor: '#6366f1',
  secondaryColor: '#ffffff',
  themeStyle: 'solid',
  gradientColor: '#8b5cf6',
  position: 'bottom-right',
  welcomeMessage: 'Welcome to ChatWizs! Send us a message and our AI will assist you.',
  bubbleIcon: 'MessageSquare',
  iconColor: '#ffffff',
  isEnabled: true
};

export function WidgetConfigView({ user, showToast, onNavigate }: { user: any; showToast: any; onNavigate?: (tab: string, payload?: any) => void }) {
  const [widgets, setWidgets] = useState<WidgetSettings[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<WidgetSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [previewSize, setPreviewSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [widgetFlows, setWidgetFlows] = useState<any[]>([]);

  useEffect(() => {
    // Load from backend (source of truth for widget.js)
    const loadWidgets = async () => {
      try {
        const res = await fetch(`${API_URL}/widgets`, { headers: getHeaders() });
        if (res.ok) {
          const data: WidgetSettings[] = await res.json();
          setWidgets(data);
          if (data.length > 0 && !selectedWidget) setSelectedWidget(data[0]);
        }
      } catch (e) {
        // Fallback to Firestore snapshot
        const q = query(collection(db, 'widget_settings'), where('uid', '==', user.parentId || user.uid));
        const unsub = onSnapshot(q, (snap) => {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as WidgetSettings));
          setWidgets(data);
          if (data.length > 0 && !selectedWidget) setSelectedWidget(data[0]);
        });
        return unsub;
      } finally {
        setLoading(false);
      }
    };
    loadWidgets();
  }, [user.uid]);

  // Fetch widget flows for the flow connection dropdown
  useEffect(() => {
    const q = query(collection(db, 'chat_flows_widget'), where('uid', '==', user.parentId || user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setWidgetFlows(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    });
    return () => unsub();
  }, [user.uid]);

  const handleSave = async () => {
    if (!selectedWidget) return;
    setIsSaving(true);
    const payload = {
      ...selectedWidget,
      uid: user.parentId || user.uid,
      updatedAt: new Date().toISOString()
    };
    console.log('[WidgetConfig] Saving settings:', payload);
    try {
      if (selectedWidget.id) {
        console.log('[WidgetConfig] Updating existing widget:', selectedWidget.id);
        const res = await fetch(`${API_URL}/widgets`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Backend sync failed');

        // Also update Firestore for real-time dashboard sync
        try {
          await updateDoc(doc(db, 'widget_settings', selectedWidget.id), payload);
        } catch (_) { /* Non-critical — backend is source of truth */ }
        
        showToast('Widget settings updated!', 'success');
      } else {
        // Create new widget on backend
        const res = await fetch(`${API_URL}/widgets`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ ...payload, uid: user.parentId || user.uid, createdAt: new Date().toISOString() })
        });
        if (!res.ok) throw new Error('Failed to create widget');
        const data = await res.json();
        const newId = data.id || selectedWidget.id;

        // Mirror to Firestore
        try {
          await addDoc(collection(db, 'widget_settings'), { ...payload, id: newId });
        } catch (_) { /* Non-critical */ }

        setSelectedWidget({ ...selectedWidget, id: newId });
        showToast('New widget created!', 'success');
      }
    } catch (err: any) {
      console.error('[WidgetConfig] Save Error:', err);
      alert('Save Failed: ' + err.message);
      showToast('Save failed: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedWidget({ ...DEFAULT_SETTINGS, uid: user.uid } as WidgetSettings);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this widget?')) return;
    try {
      await deleteDoc(doc(db, 'widget_settings', id));
      showToast('Widget deleted', 'info');
      if (selectedWidget?.id === id) setSelectedWidget(widgets[0] || null);
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Copied to clipboard!', 'success');
  };

  const getEmbedCode = (id: string) => {
    // C-9 FIX: Ensure script URL is absolute for cross-domain embedding
    let backendBase = '';
    if (API_URL.startsWith('http')) {
      backendBase = API_URL.replace(/\/api$/, '');
    } else {
      // Fallback to current origin if API_URL is relative (common in production)
      backendBase = window.location.origin;
    }
    return `<!-- ChatWizs Widget -->\n<script src="${backendBase}/sdk/widget.js" data-id="${id}" async></script>\n<!-- End ChatWizs Widget -->`;
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] dark:bg-[#0a0a0f] overflow-y-auto md:overflow-hidden custom-scrollbar">
      {/* Header */}
      <div className="px-6 py-6 bg-white dark:bg-[#16161d] border-b border-slate-200 dark:border-white/5 flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <Globe className="w-6 h-6 text-indigo-500" />
              Website Widgets
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Create and manage chat widgets for your websites.
            </p>
          </div>
          <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-3 w-full sm:w-auto mt-4 sm:mt-0">
            <button
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className={`w-full sm:w-auto px-2 sm:px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap text-[12px] sm:text-sm ${
                showMobilePreview 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              <Smartphone className="w-4 h-4 flex-shrink-0" />
              Preview
            </button>
            <button
              onClick={() => onNavigate && onNavigate('inbox')}
              className="w-full sm:w-auto px-2 sm:px-4 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-lg font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap text-[12px] sm:text-sm"
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Open </span>Inbox
            </button>
            <button
              onClick={handleCreateNew}
              className="w-full sm:w-auto px-2 sm:px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap text-[12px] sm:text-sm"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              New<span className="hidden sm:inline"> Widget</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:flex-1 md:overflow-hidden min-h-min md:min-h-0">
        {/* Sidebar - Widget List */}
        <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#16161d] overflow-y-auto custom-scrollbar flex-shrink-0 max-h-[35vh] md:max-h-full">
          <div className="p-3 md:p-4 flex flex-col space-y-2 w-full">
            {widgets.map(w => (
              <button
                key={w.id}
                onClick={() => setSelectedWidget(w)}
                className={`w-full flex-shrink-0 p-3 rounded-lg text-left transition-all flex items-center gap-3 border ${
                  selectedWidget?.id === w.id 
                    ? 'bg-slate-50 dark:bg-white/5 border-indigo-500 shadow-sm' 
                    : 'bg-transparent border-slate-200 dark:border-white/5 md:border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <div className={`w-10 h-10 rounded-md flex items-center justify-center text-white font-bold flex-shrink-0 ${
                  selectedWidget?.id === w.id ? 'bg-indigo-600' : 'bg-slate-400 dark:bg-slate-700'
                }`}>
                  {(w.name || 'W').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white truncate text-sm">{w.name}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{w.businessName || 'No Name'}</div>
                </div>
                {w.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(w.id!);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </button>
            ))}
            {widgets.length === 0 && (
              <div className="p-4 text-center text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-white/5 rounded-lg">
                No widgets created yet.
              </div>
            )}
          </div>
        </div>

        {/* Main Editor */}
        {selectedWidget ? (
          <div className="flex flex-col xl:flex-row md:flex-1 md:overflow-hidden">
            {/* Form */}
            <div className="flex-1 overflow-visible md:overflow-y-auto p-4 lg:p-6 pb-20 custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-6">
              
              {/* General Settings */}
              <section className="bg-white dark:bg-[#16161d] p-3 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center rounded-lg">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">General Settings</h3>
                    </div>
                  </div>
                  {selectedWidget.id && (
                    <button
                      onClick={() => onNavigate && onNavigate('inbox', { type: 'website', id: selectedWidget.id, name: selectedWidget.name })}
                      className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      View Chats
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Widget Name</label>
                    <input
                      type="text"
                      value={selectedWidget.name}
                      onChange={e => setSelectedWidget({ ...selectedWidget, name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 rounded-lg outline-none focus:border-indigo-500 text-slate-900 dark:text-white text-sm transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Business Name</label>
                    <input
                      type="text"
                      value={selectedWidget.businessName}
                      onChange={e => setSelectedWidget({ ...selectedWidget, businessName: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 rounded-lg outline-none focus:border-indigo-500 text-slate-900 dark:text-white text-sm transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Greeting Headline</label>
                  <input
                    type="text"
                    value={selectedWidget.greeting}
                    onChange={e => setSelectedWidget({ ...selectedWidget, greeting: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 rounded-lg outline-none focus:border-indigo-500 text-slate-900 dark:text-white text-sm transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Welcome Message (First AI Prompt)</label>
                  <textarea
                    rows={3}
                    value={selectedWidget.welcomeMessage}
                    onChange={e => setSelectedWidget({ ...selectedWidget, welcomeMessage: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 rounded-lg outline-none focus:border-indigo-500 text-slate-900 dark:text-white text-sm transition-colors resize-none custom-scrollbar"
                  />
                </div>
              </section>

              {/* Flow Automation */}
              <section className="bg-white dark:bg-[#16161d] p-3 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center rounded-lg">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Flow Automation</h3>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Connected Flow</label>
                  <select
                    value={(selectedWidget as any).connectedFlowId || ''}
                    onChange={e => setSelectedWidget({ ...selectedWidget, connectedFlowId: e.target.value } as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 rounded-lg outline-none focus:border-indigo-500 text-slate-900 dark:text-white text-sm transition-colors cursor-pointer"
                  >
                    <option value="">— No Flow (Manual Agent Only) —</option>
                    {widgetFlows.map(f => (
                      <option key={f.id} value={f.id}>{f.name || `Flow ${f.id.slice(0, 8)}`} • {f.status || 'Draft'}</option>
                    ))}
                  </select>
                  {widgetFlows.length === 0 && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      No widget flows found. Go to Flow Builder and set Trigger Channel to "Website Only" to create one.
                    </p>
                  )}
                </div>
              </section>

              {/* Design */}
              <section className="bg-white dark:bg-[#16161d] p-3 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center rounded-lg">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Design</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Primary Brand Color</label>
                    <div className="flex gap-2 items-center">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-white/5 flex-shrink-0">
                        <input
                          type="color"
                          value={selectedWidget.primaryColor}
                          onChange={e => setSelectedWidget({ ...selectedWidget, primaryColor: e.target.value })}
                          className="absolute inset-[-10px] w-16 h-16 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={selectedWidget.primaryColor}
                        onChange={e => setSelectedWidget({ ...selectedWidget, primaryColor: e.target.value })}
                        className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 rounded-lg outline-none focus:border-indigo-500 text-slate-900 dark:text-white text-sm transition-colors uppercase font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Position on Page</label>
                    <select
                      value={selectedWidget.position}
                      onChange={e => setSelectedWidget({ ...selectedWidget, position: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 rounded-lg outline-none focus:border-indigo-500 text-slate-900 dark:text-white text-sm transition-colors cursor-pointer"
                    >
                      <option value="bottom-right">Bottom Right corner</option>
                      <option value="bottom-left">Bottom Left corner</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Bubble Size (px)</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="range"
                        min="40"
                        max="100"
                        value={selectedWidget.bubbleSize || 60}
                        onChange={e => setSelectedWidget({ ...selectedWidget, bubbleSize: parseInt(e.target.value) })}
                        className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 w-8">{selectedWidget.bubbleSize || 60}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Bubble Icon Color</label>
                    <div className="flex gap-2 items-center">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-white/5 flex-shrink-0">
                        <input
                          type="color"
                          value={selectedWidget.iconColor || '#ffffff'}
                          onChange={e => setSelectedWidget({ ...selectedWidget, iconColor: e.target.value })}
                          className="absolute inset-[-10px] w-16 h-16 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={selectedWidget.iconColor || '#ffffff'}
                        onChange={e => setSelectedWidget({ ...selectedWidget, iconColor: e.target.value })}
                        className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 rounded-lg outline-none focus:border-indigo-500 text-slate-900 dark:text-white text-sm transition-colors uppercase font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Bubble Icon</label>
                    <select
                      value={selectedWidget.bubbleIcon || 'MessageSquare'}
                      onChange={e => setSelectedWidget({ ...selectedWidget, bubbleIcon: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 rounded-lg outline-none focus:border-indigo-500 text-slate-900 dark:text-white text-sm transition-colors cursor-pointer"
                    >
                      <option value="MessageSquare">Message Square</option>
                      <option value="Sparkles">Magic Sparkles</option>
                      <option value="Zap">Quick Zap</option>
                      <option value="Smartphone">Chat Phone</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Theme Style</label>
                    <select
                      value={selectedWidget.themeStyle || 'solid'}
                      onChange={e => setSelectedWidget({ ...selectedWidget, themeStyle: e.target.value as any })}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 rounded-lg outline-none focus:border-indigo-500 text-slate-900 dark:text-white text-sm transition-colors cursor-pointer"
                    >
                      <option value="solid">Solid Color</option>
                      <option value="gradient">Gradient Blend</option>
                    </select>
                  </div>
                  {selectedWidget.themeStyle === 'gradient' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Gradient Secondary Color</label>
                      <div className="flex gap-2 items-center">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-white/5 flex-shrink-0">
                          <input
                            type="color"
                            value={selectedWidget.gradientColor || '#8b5cf6'}
                            onChange={e => setSelectedWidget({ ...selectedWidget, gradientColor: e.target.value })}
                            className="absolute inset-[-10px] w-16 h-16 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={selectedWidget.gradientColor || '#8b5cf6'}
                          onChange={e => setSelectedWidget({ ...selectedWidget, gradientColor: e.target.value })}
                          className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 rounded-lg outline-none focus:border-indigo-500 text-slate-900 dark:text-white text-sm transition-colors uppercase font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Integration Script */}
              <section className="bg-white dark:bg-[#16161d] p-3 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center rounded-lg">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Integration Script</h3>
                  </div>
                </div>

                {selectedWidget.id ? (
                  <div className="relative group">
                    <pre className="p-4 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 rounded-lg overflow-x-auto text-[13px] font-mono leading-relaxed custom-scrollbar">
                      {getEmbedCode(selectedWidget.id)}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(getEmbedCode(selectedWidget.id!), selectedWidget.id!)}
                      className="absolute top-2 right-2 px-3 py-1.5 bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      {copiedId === selectedWidget.id ? (
                        <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copy Code</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-lg text-slate-500 text-sm flex items-center gap-3">
                    <Layout className="w-5 h-5 flex-shrink-0" />
                    <p>Save your settings to generate the integration script.</p>
                  </div>
                )}
              </section>
              {/* Action Buttons - Part of the page flow */}
              <section className="bg-white dark:bg-[#16161d] p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Actions</h3>
                  <p className="text-xs text-slate-500">Save changes or permanently remove this widget.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => selectedWidget.id && handleDelete(selectedWidget.id)}
                    className="w-full sm:w-auto px-5 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-xs border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Widget
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-500/20"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Settings
                  </button>
                </div>
              </section>
              </div>
            </div>

            {/* Preview Panel - Hidden by default on all screens, opened via Preview button */}
            <div className={`transition-all duration-300 
              ${showMobilePreview ? 'fixed inset-0 z-[100] bg-[#f8fafc] dark:bg-[#0a0a0f] p-4 flex flex-col xl:relative xl:inset-auto xl:z-10 xl:flex xl:p-6' : 'hidden'}
              ${previewSize === 'sm' ? 'xl:w-[350px]' : previewSize === 'lg' ? 'xl:w-[500px]' : 'xl:w-[400px]'} 
              border-t xl:border-t-0 xl:border-l border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#0a0a0f]`}
            >
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white">Live Preview</h4>
                  <div className="flex items-center gap-2">
                    <div className="hidden xl:flex bg-white dark:bg-[#16161d] p-1 rounded-md border border-slate-200 dark:border-white/5 shadow-sm">
                      <button onClick={() => setPreviewSize('sm')} className={`px-2.5 py-1 text-[10px] rounded uppercase tracking-wider font-bold transition-all ${previewSize === 'sm' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>S</button>
                      <button onClick={() => setPreviewSize('md')} className={`px-2.5 py-1 text-[10px] rounded uppercase tracking-wider font-bold transition-all ${previewSize === 'md' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>M</button>
                      <button onClick={() => setPreviewSize('lg')} className={`px-2.5 py-1 text-[10px] rounded uppercase tracking-wider font-bold transition-all ${previewSize === 'lg' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>L</button>
                    </div>
                    {showMobilePreview && (
                      <button 
                        onClick={() => setShowMobilePreview(false)}
                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-sm"
                      >
                        <span className="text-lg leading-none font-bold">&times;</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="hidden xl:flex bg-white dark:bg-[#16161d] p-1 rounded-md border border-slate-200 dark:border-white/5 self-end">
                  <button
                    onClick={() => setViewMode('desktop')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('mobile')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className={`flex-1 relative transition-all duration-300 ${viewMode === 'mobile' ? 'mx-auto max-w-[320px] w-full aspect-[9/18] rounded-[24px] border-[6px] border-slate-800 shadow-2xl' : 'w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-white/5'} flex flex-col overflow-hidden shadow-sm`}>
                {viewMode === 'desktop' && (
                  <div className="h-10 bg-slate-100 dark:bg-[#16161d] border-b border-slate-200 dark:border-white/5 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                )}

                <div className="flex-1 p-4 relative bg-white dark:bg-[#0f0f13]">
                  <div className="w-3/4 h-6 bg-slate-100 dark:bg-[#16161d] rounded-md mb-3" />
                  <div className="w-1/2 h-3 bg-slate-100 dark:bg-[#16161d] rounded-md mb-6" />
                  <div className="space-y-2">
                    <div className="w-full h-24 bg-slate-50 dark:bg-[#16161d] rounded-lg" />
                    <div className="w-full h-24 bg-slate-50 dark:bg-[#16161d] rounded-lg" />
                  </div>

                  {/* The Widget Preview */}
                  <div className={`absolute ${selectedWidget.position === 'bottom-right' ? 'bottom-4 right-4' : 'bottom-4 left-4'} flex flex-col items-end gap-3`}>
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="w-64 bg-white dark:bg-[#16161d] rounded-lg shadow-lg border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col"
                    >
                      <div 
                        className="p-3 flex items-center gap-2 text-white"
                        style={selectedWidget.themeStyle === 'gradient' ? { background: `linear-gradient(135deg, ${selectedWidget.primaryColor}, ${selectedWidget.gradientColor || '#8b5cf6'})` } : { backgroundColor: selectedWidget.primaryColor }}
                      >
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                          {(selectedWidget.businessName || 'S').charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm truncate leading-tight">{selectedWidget.businessName || 'Support'}</div>
                          <div className="text-[10px] opacity-80 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 flex-1 bg-slate-50 dark:bg-[#0f0f13] space-y-3 h-48 overflow-y-auto">
                        <div className="bg-white dark:bg-[#16161d] border border-slate-100 dark:border-white/5 text-slate-800 dark:text-slate-200 p-2.5 rounded-lg rounded-tl-sm text-xs shadow-sm max-w-[85%]">
                          {selectedWidget.greeting || 'Hello!'}
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-[#16161d] border-t border-slate-100 dark:border-white/5 flex gap-2">
                        <div className="flex-1 h-8 bg-slate-50 dark:bg-[#0f0f13] border border-slate-200 dark:border-white/5 rounded-md flex items-center px-2">
                          <span className="text-[10px] text-slate-400">Type a message...</span>
                        </div>
                        <div 
                          className="w-8 h-8 rounded-md flex items-center justify-center"
                          style={{ 
                            background: selectedWidget.themeStyle === 'gradient' ? `linear-gradient(135deg, ${selectedWidget.primaryColor}, ${selectedWidget.gradientColor || '#8b5cf6'})` : selectedWidget.primaryColor,
                            color: selectedWidget.iconColor || '#ffffff'
                          }}
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                        </div>
                      </div>
                    </motion.div>
                    
                    <div 
                      className={`rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${selectedWidget.position === 'bottom-left' ? 'self-start' : 'self-end'}`}
                      style={{ 
                        width: `${selectedWidget.bubbleSize || 60}px`,
                        height: `${selectedWidget.bubbleSize || 60}px`,
                        background: selectedWidget.themeStyle === 'gradient' ? `linear-gradient(135deg, ${selectedWidget.primaryColor}, ${selectedWidget.gradientColor || '#8b5cf6'})` : selectedWidget.primaryColor,
                        color: selectedWidget.iconColor || '#ffffff'
                      }}
                    >
                      {selectedWidget.bubbleIcon === 'Sparkles' ? <Sparkles style={{ width: (selectedWidget.bubbleSize || 60) * 0.4, height: (selectedWidget.bubbleSize || 60) * 0.4 }} /> :
                       selectedWidget.bubbleIcon === 'Zap' ? <Zap style={{ width: (selectedWidget.bubbleSize || 60) * 0.4, height: (selectedWidget.bubbleSize || 60) * 0.4 }} /> :
                       selectedWidget.bubbleIcon === 'Smartphone' ? <Smartphone style={{ width: (selectedWidget.bubbleSize || 60) * 0.4, height: (selectedWidget.bubbleSize || 60) * 0.4 }} /> :
                       <MessageSquare style={{ width: (selectedWidget.bubbleSize || 60) * 0.4, height: (selectedWidget.bubbleSize || 60) * 0.4 }} />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <Globe className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a widget from the sidebar or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
