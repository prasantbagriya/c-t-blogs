import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  CheckSquare,
  Plus,
  Trash2,
  Smartphone,
  Image as ImageIcon,
  Video,
  FileText,
  Type,
  ChevronRight,
  X,
  AlertCircle,
  HelpCircle,
  Hash,
  ArrowRight,
  ExternalLink,
  Phone,
  Layout,
  Globe,
  CheckCircle2,
  Clock,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Strikethrough,
  Code,
  ArrowLeft,
  Eye,
  Pencil,
  Copy,
  CopyIcon,
  Info,
  ShieldCheck,
  KeyRound,
  Sparkles,
  FileStack,
  RefreshCw,
  Filter,
  Search,
  ListFilter,
  Check,
  ArrowDownUp,
  Edit2,
  Layers,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WhatsAppFlowFormBuilder } from './WhatsAppFlowFormBuilder';
import { API_URL, getHeaders } from '../api/common';

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

import {
  db,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  handleDatabaseError,
  OperationType,
  safeJson,
  uploadFile
} from '../api';

interface TemplateApproverViewProps {
  user: any;
  selectedAccount: any;
  onBack?: () => void;
}

type HeaderType = 'None' | 'Text' | 'Image' | 'Video' | 'Document';
type ButtonType = 'Quick Reply' | 'Call to Action';
type CTAType = 'Visit Website' | 'Call Phone Number';

interface TemplateButton {
  id: string;
  type: ButtonType;
  text: string;
  ctaType?: CTAType;
  urlType?: 'Static' | 'Dynamic';
  url?: string;
  phoneNumber?: string;
}


import { WhatsAppPreview } from './template/WhatsAppPreview';
import { TemplateStatusPipeline } from './template/TemplateStatusPipeline';
import { CATEGORIES, LANGUAGES, langMap, categoryMap } from './template/constants';

// --- Sub Components moved to ./template/ ---

export const TemplateApproverView = ({ user, selectedAccount, onBack }: TemplateApproverViewProps) => {
  const [activeView, setActiveView] = useState<'list' | 'create' | 'flow-form' | 'selection'>('selection');
  const [activeTab, setActiveTab] = useState<'templates' | 'flows'>('templates');
  const [showTemplates, setShowTemplates] = useState(true);
  const [showFlows, setShowFlows] = useState(true);
  const [activeLanguageFilter, setActiveLanguageFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [flows, setFlows] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [showOnlyMyData, setShowOnlyMyData] = useState(false);
  const [editingFlow, setEditingFlow] = useState<any>(null);

  useEffect(() => {
    if (!selectedAccount) return;
    
    const constraints = [
      where('whatsappAccountId', '==', selectedAccount.id)
    ];
    
    if (user.role !== 'admin') {
      constraints.push(where('uid', '==', user.parentId || user.uid));
    }

    const q = query(
      collection(db, 'whatsapp_flows'),
      ...constraints
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const flowList = snapshot.docs.map(doc => ({
        id: doc.id,
        dataType: 'flow' as const,
        ...doc.data()
      }));
      setFlows(flowList.sort((a, b) => {
        const dateA = (a as any).updatedAt?.seconds || 0;
        const dateB = (b as any).updatedAt?.seconds || 0;
        return dateB - dateA;
      }));
    });
    
    return () => unsubscribe();
  }, [user.uid, user.parentId, selectedAccount]);

  const handleDeleteFlow = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this flow?")) {
      try {
        await deleteDoc(doc(db, 'whatsapp_flows', id));
        (window as any).showToast("Flow deleted", "success");
      } catch (err) {
        (window as any).showToast("Failed to delete flow", "error");
      }
    }
  };

  const handleSync = async () => {
    if (!selectedAccount || isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_URL}/whatsapp/templates/sync/${selectedAccount.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('chatwiz_token')}` }
      });
      const data = await safeJson(res);
      if (res.ok) {
        setLastSync(new Date().toLocaleTimeString());
        alert("Templates synced with Meta assets successfully.");
      } else throw new Error(data.error);
    } catch (err: any) {
      alert("Sync failed: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Marketing');
  const [language, setLanguage] = useState('English (US)');
  const [headerType, setHeaderType] = useState<HeaderType>('None');
  const [headerText, setHeaderText] = useState('');
  const [body, setBody] = useState('');
  const [footer, setFooter] = useState('');
  const [buttons, setButtons] = useState<TemplateButton[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  const mediaUrl = React.useMemo(() => {
    if (selectedFile) return URL.createObjectURL(selectedFile);
    return undefined;
  }, [selectedFile]);

  useEffect(() => {
    if (category === 'Authentication') {
      setBody('Your verification code is {{1}}. For security, do not share this code.');
      setFooter('Expires in 5 minutes');
      setButtons([{
        id: Math.random().toString(36).substr(2, 9),
        type: 'Call to Action',
        text: 'Copy Code',
        otpType: 'Copy Code'
      } as any]);
    }
  }, [category]);

  const handleEdit = (t: any) => {
    setEditingTemplateId(t.id);
    setName(t.name);
    setCategory(t.category ? (t.category.charAt(0) + t.category.slice(1).toLowerCase()) : 'Marketing');
    setLanguage(t.language || 'en_US');

    // Parse components
    const bodyComp = t.components.find((c: any) => c.type === 'BODY');
    const headerComp = t.components.find((c: any) => c.type === 'HEADER');
    const footerComp = t.components.find((c: any) => c.type === 'FOOTER');
    const buttonComp = t.components.find((c: any) => c.type === 'BUTTONS');

    if (bodyComp) setBody(bodyComp.text);
    if (headerComp) {
      setHeaderType(headerComp.format ? (headerComp.format.charAt(0) + headerComp.format.slice(1).toLowerCase() as any) : 'None');
      setHeaderText(headerComp.text || '');
    } else {
      setHeaderType('None');
    }
    if (footerComp) setFooter(footerComp.text);
    if (buttonComp) {
      setButtons(buttonComp.buttons.map((b: any, idx: number) => ({
        id: idx.toString(),
        type: b.type === 'QUICK_REPLY' ? 'Quick Reply' : 'Call to Action',
        text: b.text,
        ctaType: b.type === 'PHONE_NUMBER' ? 'Call Phone Number' : (b.type === 'URL' ? 'Visit Website' : undefined),
        url: b.url,
        phoneNumber: b.phone_number
      })));
    } else {
      setButtons([]);
    }

    setActiveView('create');
  };

  const handleEditFlow = (flow: any) => {
    setEditingFlow(flow);
    setActiveView('flow-form');
  };

  const applyFormatting = (tag: string) => {
    if (!bodyRef.current) return;
    const start = bodyRef.current.selectionStart;
    const end = bodyRef.current.selectionEnd;
    const text = body;
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    let newText;
    if (selected) {
      newText = `${before}${tag}${selected}${tag}${after}`;
    } else {
      newText = `${before}${tag}${tag}${after}`;
    }

    setBody(newText);

    // Reset focus and selection
    setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.focus();
        const cursorPosition = start + tag.length + (selected ? selected.length : 0);
        bodyRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
  };

  const syncTemplates = async () => {
    if (!selectedAccount) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_URL}/whatsapp/templates/sync/${selectedAccount.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('chatwiz_token')}` }
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || 'Sync failed');
    } catch (error: any) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (selectedAccount) {
      syncTemplates();
    }
  }, [selectedAccount?.id]);

  useEffect(() => {
    setIsLoading(true);
    if (!selectedAccount) {
      setIsLoading(false);
      return;
    }
    let q;
    const constraints = [where('whatsappAccountId', '==', selectedAccount.id)];
    
    if (user.role !== 'admin') {
      constraints.push(where('uid', '==', user.parentId || user.uid));
    }
    
    q = query(collection(db, 'templates'), ...constraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        dataType: 'template' as const,
        ...doc.data() 
      }));
      setTemplates(docs);
      setIsLoading(false);
    }, (error) => {
      handleDatabaseError(error, OperationType.LIST, 'templates');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid, user.parentId, selectedAccount]);

  const handleAddButton = (type: ButtonType | 'URL') => {
    const isCTA = type === 'Call to Action' || type === 'URL';
    const ctaButtons = buttons.filter(b => b.type === 'Call to Action');
    
    if (type === 'Quick Reply' && buttons.filter(b => b.type === 'Quick Reply').length >= 3) {
      alert('Maximum 3 Quick Reply buttons allowed');
      return;
    }
    if (isCTA && ctaButtons.length >= 2) {
      alert('Maximum 2 Call to Action buttons allowed');
      return;
    }

    const newBtn: TemplateButton = {
      id: Math.random().toString(36).substr(2, 9),
      type: isCTA ? 'Call to Action' : 'Quick Reply',
      text: type === 'URL' ? 'Visit Website' : (type === 'Call to Action' ? 'Call Now' : ''),
      ctaType: type === 'URL' ? 'Visit Website' : (type === 'Call to Action' ? 'Call Phone Number' : undefined),
      urlType: type === 'URL' ? 'Static' : undefined,
      url: type === 'URL' ? 'https://' : '',
      phoneNumber: ''
    };
    setButtons([...buttons, newBtn]);
  };

  const removeButton = (id: string) => {
    setButtons(buttons.filter(b => b.id !== id));
  };

  const updateButton = (id: string, updates: Partial<TemplateButton>) => {
    setButtons(buttons.map(b => b.id === id ? { ...b, ...updates } : b));
  };


  const resetForm = () => {
    setName('');
    setCategory('Marketing');
    setLanguage('English (US)');
    setHeaderType('None');
    setHeaderText('');
    setBody('');
    setFooter('');
    setButtons([]);
    setSelectedFile(null);
    setEditingTemplateId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Strict Validation
    const mappedCategory = categoryMap[category];
    const mappedLanguage = langMap[language];
    const accountId = selectedAccount?.id;

    if (!name.trim()) return alert('Template Name is required.');
    if (!body.trim()) return alert('Message Body is required.');
    if (!mappedCategory) return alert('Please select a valid Category.');
    if (!mappedLanguage) return alert('Please select a valid Language.');
    if (!accountId) return alert('No WhatsApp Account selected. Please select an account first.');

    setIsSubmitting(true);
    try {
      const formattedName = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      const components: any[] = [];

      if (headerType !== 'None') {
        const headerComp: any = { type: 'HEADER', format: headerType.toUpperCase() };
        if (headerType === 'Text') {
          headerComp.text = headerText;
        }
        components.push(headerComp);
      }

      components.push({ type: 'BODY', text: body.trim() });

      if (footer.trim()) {
        components.push({ type: 'FOOTER', text: footer.trim() });
      }

      if (buttons.length > 0) {
        components.push({
          type: 'BUTTONS',
          buttons: buttons.map(btn => {
            if ((btn as any).otpType === 'Copy Code') {
              return {
                type: 'OTP',
                otp_type: 'COPY_CODE',
                text: btn.text
              };
            }

            const b: any = { text: btn.text };
            b.type = btn.type.toUpperCase().replace(/\s+/g, '_');

            if (btn.type === 'Call to Action') {
              if (btn.ctaType === 'Visit Website') {
                b.type = 'URL';
                b.url = btn.url;
              } else {
                b.type = 'PHONE_NUMBER';
                b.phone_number = btn.phoneNumber;
              }
            } else if (btn.type === 'Quick Reply') {
              b.type = 'QUICK_REPLY';
            }
            return b;
          })
        });
      }

      const templateData = {
        name: formattedName,
        category: categoryMap[category],
        language: langMap[language],
        components,
        status: 'PENDING',
        uid: user.parentId || user.uid,
        whatsappAccountId: selectedAccount?.id || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        headerType,
        headerText,
        content: body,
        footer,
        buttons: buttons
      };

      let headerHandle = null;
      if (headerType !== 'None' && headerType !== 'Text' && selectedFile) {
        setIsSubmitting(true);
        // Upload to Meta specifically to get the handle 'h'
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('whatsappAccountId', selectedAccount.id);

        const uploadRes = await fetch(`${API_URL}/whatsapp/media-upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('chatwiz_token')}` },
          body: formData
        });

        const uploadData = await safeJson(uploadRes);
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Meta Media Upload failed');
        headerHandle = uploadData.handle;
      }

      const res = await fetch(`${API_URL}/whatsapp/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('chatwiz_token')}`
        },
        body: JSON.stringify({
          name: formattedName,
          category: categoryMap[category],
          language: langMap[language],
          components,
          headerHandle, // Pass the Meta handle here
          whatsappAccountId: selectedAccount?.id
        })
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      if (editingTemplateId) {
        await updateDoc(doc(db, 'templates', editingTemplateId), templateData);
        (window as any).showToast("Template updated successfully.", "success");
      } else {
        await addDoc('templates', templateData);
        (window as any).showToast("Template submitted for approval.", "success");
      }
      resetForm();
      setActiveView('list');
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTemplates = React.useMemo(() => {
    if (!showTemplates) return [];
    
    const list = templates.filter(t => {
      const matchesAccount = t.whatsappAccountId === selectedAccount?.id;
      const matchesCategory = activeCategoryFilter === 'All' || t.category === activeCategoryFilter.toUpperCase();
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter.toUpperCase();
      const matchesLanguage = activeLanguageFilter === 'All' || t.language === activeLanguageFilter;
      const matchesSearch = !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.content || t.components?.find((c: any) => c.type === 'BODY')?.text)?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesAccount && matchesCategory && matchesStatus && matchesSearch && matchesLanguage;
    });

    const uniqueMap = new Map();
    list.forEach(t => {
      const existing = uniqueMap.get(t.name);
      if (!existing || (existing.status !== 'APPROVED' && t.status === 'APPROVED')) {
        uniqueMap.set(t.name, t);
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) => {
      const isPendingA = a.status === 'PENDING' || a.status === 'IN_REVIEW';
      const isPendingB = b.status === 'PENDING' || b.status === 'IN_REVIEW';
      if (isPendingA && !isPendingB) return -1;
      if (!isPendingA && isPendingB) return 1;
      
      const getTimestamp = (t: any) => {
        const date = t.updatedAt || t.lastUpdated || t.createdAt;
        if (!date) return 0;
        if (typeof date === 'object' && date.seconds) return date.seconds;
        return new Date(date).getTime() / 1000;
      };
      return getTimestamp(b) - getTimestamp(a);
    });
  }, [templates, selectedAccount, activeCategoryFilter, statusFilter, searchQuery, activeLanguageFilter, showTemplates]);

  const filteredFlows = React.useMemo(() => {
    if (!showFlows) return [];
    
    return flows.filter(f => {
      const matchesAccount = f.whatsappAccountId === selectedAccount?.id;
      const matchesSearch = !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || (f.status || 'DRAFT').toUpperCase() === statusFilter.toUpperCase();
      
      return matchesAccount && matchesSearch && matchesStatus;
    });
  }, [flows, selectedAccount, searchQuery, statusFilter, showFlows]);

  const combinedList = React.useMemo(() => {
    let combined = [
      ...filteredTemplates.map(t => ({ ...t, dataType: 'template' as const })),
      ...filteredFlows.map(f => ({ ...f, dataType: 'flow' as const }))
    ];

    if (showOnlyMyData && user) {
      combined = combined.filter(item => (item as any).uid === user.uid);
    }
    
    return combined.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      
      const getTimestamp = (item: any) => {
        const date = item.updatedAt || item.createdAt;
        if (!date) return 0;
        if (typeof date === 'object' && date.seconds) return date.seconds;
        return new Date(date).getTime() / 1000;
      };

      return sortBy === 'newest' 
        ? getTimestamp(b) - getTimestamp(a)
        : getTimestamp(a) - getTimestamp(b);
    });
  }, [filteredTemplates, filteredFlows, sortBy, showOnlyMyData, user]);

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Delete template? This will also remove it from Meta WhatsApp Manager.')) {
      try {
        const res = await fetch(`${API_URL}/whatsapp/templates/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        if (res.ok) {
          setTemplates(prev => prev.filter(item => item.id !== id));
          (window as any).showToast("Template deleted", "success");
        } else {
          const data = await res.json();
          alert('Error: ' + (data.error || 'Failed to delete template'));
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert('Failed to delete template. Check connection.');
      }
    }
  };

  if (activeView === 'flow-form') {
    return (
      <WhatsAppFlowFormBuilder 
        user={user}
        selectedAccount={selectedAccount}
        editingFlow={editingFlow}
        onBack={() => { setActiveView('list'); setEditingFlow(null); setShowTemplates(false); setShowFlows(true); setActiveTab('flows'); }}
        onSave={() => { setActiveView('list'); setEditingFlow(null); setShowTemplates(false); setShowFlows(true); setActiveTab('flows'); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {(activeView !== 'selection' || onBack) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 bg-white dark:bg-[#16161d] p-4 sm:p-5 rounded-none border border-slate-200 dark:border-white/5 transition-all">
          <div className="flex items-center gap-4">
            {activeView === 'selection' && onBack && (
              <button
                onClick={onBack}
                className="w-10 h-10 bg-slate-100 dark:bg-[#1a1a24] hover:bg-slate-200 dark:hover:bg-white/5 rounded-none flex items-center justify-center text-slate-600 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            {activeView === 'create' && (
              <button
                onClick={() => setActiveView('list')}
                className="w-10 h-10 bg-slate-100 dark:bg-[#1a1a24] hover:bg-slate-200 dark:hover:bg-white/5 rounded-none flex items-center justify-center text-slate-600 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            {activeView === 'list' && (
              <button
                onClick={() => setActiveView('selection')}
                className="w-10 h-10 bg-slate-100 dark:bg-[#1a1a24] hover:bg-slate-200 dark:hover:bg-white/5 rounded-none flex items-center justify-center text-slate-600 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            
            {activeView === 'selection' ? (
              <div>
                <h2 className="text-xl font-medium text-slate-900 dark:text-white">WhatsApp Asset Library</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-0.5">
                   <div className="flex items-center gap-2">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Return to Dashboard</p>
                   </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-medium text-slate-900 dark:text-white">
                  {activeView === 'list' 
                    ? (showTemplates && showFlows ? 'Combined Library' : (showTemplates ? 'Meta Templates' : 'WhatsApp Flows')) 
                    : (activeView === 'flow-form' ? 'Flow Builder' : 'Template Creator')}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-0.5">
                   <div className="flex items-center gap-2">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                        {activeView === 'list' 
                          ? (showTemplates && !showFlows ? 'Manage official messaging assets' : (!showTemplates && showFlows ? 'Build interactive forms' : 'Manage your messaging assets')) 
                          : (activeView === 'flow-form' ? 'Design interactive flows' : 'Design for Meta approval')}
                      </p>
                      {activeView === 'list' && lastSync && activeTab === 'templates' && (
                        <span className="text-[9px] text-emerald-500 font-medium uppercase tracking-tighter">Synced {lastSync}</span>
                      )}
                   </div>
                </div>
              </div>
            )}
          </div>

          {activeView === 'create' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`p-2 rounded-none border border-slate-200 dark:border-white/5 transition-colors ${showPreview ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600' : 'bg-white dark:bg-[#16161d] text-slate-700 dark:text-slate-200'}`}
                title="Toggle Preview"
              >
                <Smartphone size={18} />
              </button>
              <div className="w-[1px] h-6 bg-slate-200 dark:bg-[#1a1a24] mx-1" />
            </div>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView + (activeView === 'list' ? (showTemplates + String(showFlows) + searchQuery + statusFilter + activeLanguageFilter) : '')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {activeView === 'selection' ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh] py-6 sm:py-8 px-4 sm:px-6">
              <div className="text-center mb-8 sm:mb-10 max-w-2xl px-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight uppercase">WhatsApp Asset Library</h2>
                <p className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em] font-bold leading-relaxed">Select a category to manage your messaging blueprints</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
                {/* Meta Template Card */}
                <div 
                  onClick={() => { setShowTemplates(true); setShowFlows(false); setActiveView('list'); setActiveTab('templates'); }}
                  className="group relative bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 p-5 sm:p-6 rounded-none cursor-pointer hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-none flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Layers size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">Meta Templates</h3>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed mb-4 font-medium">
                    Professional message blueprints with buttons.
                  </p>
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-[8px] uppercase tracking-widest pt-3 border-t border-slate-100 dark:border-white/5">
                    Open Templates <ArrowRight size={10} />
                  </div>
                </div>

                {/* WhatsApp Flow Card */}
                <div 
                  onClick={() => { setShowTemplates(false); setShowFlows(true); setActiveView('list'); setActiveTab('flows'); }}
                  className="group relative bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 p-5 sm:p-6 rounded-none cursor-pointer hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-none flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Sparkles size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">WhatsApp Flows</h3>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed mb-4 font-medium">
                    Interactive multi-screen lead flows.
                  </p>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-[8px] uppercase tracking-widest pt-3 border-t border-slate-100 dark:border-white/5">
                    Open Flows <ArrowRight size={10} />
                  </div>
                </div>

                {/* Combined Card */}
                <div 
                  onClick={() => { setShowTemplates(true); setShowFlows(true); setActiveView('list'); setActiveTab('templates'); }}
                  className="group relative bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 p-5 sm:p-6 rounded-none cursor-pointer hover:border-slate-900 dark:hover:border-white transition-all duration-300"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white rounded-none flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <List size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">Combined Library</h3>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed mb-4 font-medium">
                    Manage all assets from a single view.
                  </p>
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-[8px] uppercase tracking-widest pt-3 border-t border-slate-100 dark:border-white/5">
                    View All <ArrowRight size={10} />
                  </div>
                </div>
              </div>

              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full sm:w-auto">
                 <button 
                  onClick={() => setActiveView('create')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Create Template
                </button>
                <button 
                  onClick={() => setActiveView('flow-form')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 text-white rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} /> Build New Flow
                </button>
              </div>
            </div>
          ) : activeView === 'list' ? (
            <>
            <div className="w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white dark:bg-[#16161d] p-4 rounded-none border border-slate-200 dark:border-white/5 shadow-none">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 dark:text-slate-200" size={14} />
                      <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded-none py-2 pl-10 pr-4 text-xs outline-none focus:border-blue-500 transition-colors dark:text-white"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => setIsFilterSidebarOpen(true)}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-none text-[9px] sm:text-[10px] font-medium uppercase tracking-wider transition-all border ${activeCategoryFilter !== 'All' || statusFilter !== 'All'
                          ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500/30'
                          : 'bg-white dark:bg-[#1a1a24] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Filter size={12} className="sm:w-3.5 sm:h-3.5" />
                        Filters
                      </button>

                      <button
                        onClick={handleSync}
                        disabled={isSyncing || !selectedAccount}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-none text-[9px] sm:text-[10px] font-medium uppercase tracking-wider hover:bg-slate-800 transition-all shadow-none disabled:opacity-50"
                      >
                        <RefreshCw size={12} className={cn("sm:w-3.5 sm:h-3.5", isSyncing ? 'animate-spin' : '')} />
                        Sync
                      </button>
                      
                      <button
                        onClick={() => {
                          if (activeTab === 'flows') {
                            setActiveView('flow-form');
                          } else {
                            setActiveView('create');
                          }
                        }}
                        className="flex-[1.5] sm:flex-none flex items-center justify-center gap-1.5 px-2 sm:px-4 py-2 bg-emerald-600 text-white rounded-none text-[9px] sm:text-[10px] font-medium uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-none"
                      >
                        <Plus size={14} className="sm:w-4 sm:h-4" />
                        Add New
                      </button>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="space-y-4 pt-4">
                      {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-50 dark:bg-[#16161d] rounded-none border border-slate-200 dark:border-white/5 animate-pulse" />)}
                    </div>
                  ) : (
                    <div className="flex flex-col lg:flex-row gap-6 items-start pt-4">
                      {activeTab === 'templates' ? (
                        <>
                          <div className="flex-1 w-full space-y-2">
                            {((showTemplates && showFlows) ? combinedList : filteredTemplates).length === 0 ? (
                               <div className="bg-white dark:bg-[#16161d] rounded-none border border-slate-200 dark:border-white/5 p-20 text-center">
                                  <MessageSquare className="w-12 h-12 text-slate-400 dark:text-slate-200 mx-auto mb-4" />
                                  <h3 className="text-lg font-normal text-slate-900 dark:text-white uppercase tracking-tight">No Items Found</h3>
                                  <p className="text-xs text-slate-700 dark:text-slate-200 mt-2 uppercase tracking-widest">Create your first messaging blueprint to start.</p>
                               </div>
                            ) : (
                              ((showTemplates && showFlows) ? combinedList : filteredTemplates).map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => (item as any).dataType === 'template' ? setPreviewTemplate(item) : null}
                                  className={cn(
                                    "group flex items-center justify-between p-4 bg-white dark:bg-[#16161d] border transition-all cursor-pointer rounded",
                                    previewTemplate?.id === item.id
                                      ? "border-blue-500 shadow-sm ring-1 ring-blue-500/10"
                                      : "border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10"
                                  )}
                                >
                                  <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={cn(
                                      "w-10 h-10 rounded-none flex items-center justify-center shrink-0 border",
                                      (item as any).dataType === 'template'
                                        ? (item.status === 'APPROVED' ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600" : "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-600")
                                        : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600"
                                    )}>
                                      {(item as any).dataType === 'template' ? <FileText size={18} /> : <Sparkles size={18} />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate uppercase tracking-tight max-w-[150px] sm:max-w-none">{item.name}</h4>
                                        <span className={cn(
                                          "px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-none",
                                          item.status === 'APPROVED' || item.status === 'PUBLISHED' ? "bg-emerald-500/10 text-emerald-500" :
                                            item.status === 'REJECTED' ? "bg-rose-500/10 text-rose-500" :
                                              "bg-blue-500/10 text-blue-500"
                                        )}>
                                          {item.status || 'DRAFT'}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                                        <span className="flex items-center gap-1 shrink-0">
                                           {(item as any).dataType === 'template' ? <><Layers size={12} /> {item.category}</> : <><Smartphone size={12} /> Interactive Flow</>}
                                        </span>
                                        <span className="flex items-center gap-1 shrink-0"><Clock size={12} /> {(item as any).updatedAt?.seconds ? new Date((item as any).updatedAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                                      </div>
                                    </div>
                                  </div>
    
                                  <div className="flex items-center gap-2 transition-all">
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setPreviewTemplate(item);
                                      }} 
                                      className="p-2 text-slate-400 hover:text-blue-500 rounded-none transition-all" 
                                      title="View"
                                    >
                                      <Eye size={14} />
                                    </button>
                                    {(item as any).dataType === 'template' || (item as any).components ? (
                                      <>
                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-2 text-slate-400 hover:text-blue-500 rounded-none transition-all" title="Edit Template"><Edit2 size={14} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(item.id); }} className="p-2 text-slate-400 hover:text-rose-500 rounded-none transition-all" title="Delete Template"><Trash2 size={14} /></button>
                                      </>
                                    ) : (
                                      <>
                                        <button onClick={(e) => { e.stopPropagation(); handleEditFlow(item); }} className="p-2 text-slate-400 hover:text-emerald-500 rounded-none transition-all" title="Edit Flow"><Edit2 size={14} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteFlow(item.id); }} className="p-2 text-slate-400 hover:text-rose-500 rounded-none transition-all" title="Delete Flow"><Trash2 size={14} /></button>
                                      </>
                                    )}
                                    <ChevronRight size={14} className="text-slate-300 ml-1" />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
    
                          <AnimatePresence>
                            {previewTemplate && (
                              <>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewTemplate(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[400]" />
                                <motion.div
                                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                  className="fixed right-0 top-0 bottom-0 w-full max-w-[400px] bg-white dark:bg-[#13131a] border-l border-slate-200 dark:border-white/5 z-[401] flex flex-col shadow-2xl h-full"
                                >
                                  <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Live Preview</h4>
                                    </div>
                                    <button onClick={() => setPreviewTemplate(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-none transition-colors"><X size={16} /></button>
                                  </div>
                                  <div className="flex-1 overflow-y-auto px-0 sm:px-1 py-4 bg-slate-50/30 dark:bg-transparent">
                                    <div className="max-w-[320px] mx-auto">
                                      {(previewTemplate as any).dataType === 'flow' ? (
                                        <div className="w-full max-w-[280px] mx-auto bg-[#e5ddd5] dark:bg-[#0b141a] rounded-[2.5rem] border-[8px] border-slate-900 dark:border-[#202c33] aspect-[9/18.5] overflow-hidden relative shadow-2xl flex flex-col scale-[0.9] origin-top mt-4">
                                          {/* Phone Notch */}
                                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 dark:bg-[#202c33] rounded-b-2xl z-20 flex items-center justify-center">
                                            <div className="w-8 h-1 bg-slate-800 rounded-full" />
                                          </div>
    
                                          {/* Status Bar Background */}
                                          <div className="h-7 bg-[#075e54] dark:bg-[#202c33] shrink-0" />
    
                                          <div className="bg-[#075e54] dark:bg-[#202c33] pt-0 pb-3 px-4 flex items-center gap-2 relative z-10">
                                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">F</div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-white text-[10px] font-bold truncate">{(previewTemplate as any).name}</p>
                                              <p className="text-[#9de1fe] text-[7px] font-medium uppercase tracking-tighter">Flow Interface</p>
                                            </div>
                                          </div>
                                          <div className="flex-1 p-4 bg-white dark:bg-[#0b141a] overflow-y-auto">
                                            <div className="space-y-4">
                                              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-lg">
                                                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1 flex items-center gap-1"><Sparkles size={10} /> Active Flow</p>
                                                <p className="text-[9px] text-slate-500 dark:text-slate-400">Previewing the first screen of your interactive flow.</p>
                                              </div>
                                              {(previewTemplate as any).screens?.[0]?.fields?.map((f: any, i: number) => (
                                                <div key={i} className="space-y-1">
                                                  <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">{f.label || 'Input Field'}</p>
                                                  <div className="w-full h-8 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded px-2 flex items-center">
                                                    <span className="text-[9px] text-slate-400 italic">{f.placeholder || '...'}</span>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                          <div className="p-4 bg-white dark:bg-[#0b141a] border-t border-slate-100 dark:border-white/5">
                                            <div className="w-full py-2 bg-[#00a884] text-white rounded-none font-bold text-[10px] text-center uppercase tracking-widest shadow-sm">Continue</div>
                                          </div>
                                        </div>
                                      ) : (
                                        <WhatsAppPreview
                                          headerType={previewTemplate.components?.find((c: any) => c.type === 'HEADER')?.format === 'TEXT' ? 'Text' : (previewTemplate.components?.find((c: any) => c.type === 'HEADER')?.format === 'IMAGE' ? 'Image' : (previewTemplate.components?.find((c: any) => c.type === 'HEADER')?.format === 'VIDEO' ? 'Video' : 'None'))}
                                          headerText={previewTemplate.components?.find((c: any) => c.type === 'HEADER')?.text}
                                          content={previewTemplate.content || previewTemplate.components?.find((c: any) => c.type === 'BODY')?.text}
                                          footer={previewTemplate.footer || previewTemplate.components?.find((c: any) => c.type === 'FOOTER')?.text}
                                          buttons={previewTemplate.buttons || previewTemplate.components?.find((c: any) => c.type === 'BUTTONS')?.buttons?.map((b: any) => ({
                                            text: b.text,
                                            ctaType: b.type === 'PHONE_NUMBER' ? 'Call Phone Number' : (b.type === 'URL' ? 'Visit Website' : undefined)
                                          })) || []}
                                          accountName={selectedAccount?.name}
                                          isVerified={selectedAccount?.isVerified || selectedAccount?.official}
                                          templateId={previewTemplate.name}
                                        />
                                      )}
                                    </div>
                                    <div className="mt-8 space-y-4 px-2">
                                      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-4 rounded-none">
                                        <h5 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Info size={12} /> {(previewTemplate as any).dataType === 'flow' ? 'Flow' : 'Template'} Details</h5>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-[9px] text-slate-500 uppercase font-medium">Status</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{previewTemplate.status}</p>
                                          </div>
                                          <div>
                                            <p className="text-[9px] text-slate-500 uppercase font-medium">Language</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{previewTemplate.language || 'en_US'}</p>
                                          </div>
                                          <div className="col-span-2 pt-2 border-t border-blue-100/50">
                                            <p className="text-[9px] text-slate-500 uppercase font-medium">{(previewTemplate as any).dataType === 'flow' ? 'Flow' : 'Template'} ID</p>
                                            <p className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 mt-1 break-all bg-white/50 dark:bg-black/20 p-1.5 rounded-none border border-blue-100/30">
                                              {previewTemplate.id}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => { 
                                          if ((previewTemplate as any).dataType === 'flow' || (previewTemplate as any).screens) {
                                            handleEditFlow(previewTemplate);
                                          } else {
                                            handleEdit(previewTemplate); 
                                          }
                                          setPreviewTemplate(null); 
                                        }} 
                                        className="w-full py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg"
                                      >
                                        Edit this {(previewTemplate as any).dataType === 'flow' ? 'Flow' : 'Template'}
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <div className="flex-1 w-full space-y-2">
                          {flows.filter(f => !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-none">
                              <div className="w-16 h-16 bg-slate-50 dark:bg-[#1a1a24] rounded-none flex items-center justify-center mb-4 text-slate-300"><Sparkles size={32} /></div>
                              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 uppercase tracking-tight">No Flows Found</h3>
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-6">Create your first interactive lead flow</p>
                              <button onClick={() => setActiveView('flow-form')} className="px-6 py-2.5 bg-emerald-600 text-white rounded-none text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95">Start Building</button>
                            </div>
                          ) : (
                            <div className="flex flex-col space-y-2">
                              {flows.filter(f => !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(flow => (
                                <div key={flow.id} className="group flex items-center justify-between p-4 bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded transition-all">
                                   <div className="flex items-center gap-4 flex-1 min-w-0">
                                      <div className="w-10 h-10 rounded-none bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                                         <Sparkles size={18} />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                         <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate uppercase tracking-tight">{flow.name}</h4>
                                            <span className={cn(
                                              "px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-none",
                                              flow.status === 'PUBLISHED' || flow.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" :
                                              flow.status === 'PENDING_APPROVAL' ? "bg-blue-500/10 text-blue-500" :
                                              "bg-slate-500/10 text-slate-500"
                                            )}>
                                              {flow.status || 'DRAFT'}
                                            </span>
                                         </div>
                                         <div className="flex items-center gap-3 text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                                            <span className="flex items-center gap-1"><Smartphone size={12} /> {flow.structure?.screens?.length || flow.screens?.length || 0} Screens</span>
                                            <span className="flex items-center gap-1"><Clock size={12} /> Updated {flow.updatedAt?.seconds ? new Date(flow.updatedAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                                            {flow.metaFlowId && <span className="text-slate-400 font-normal ml-2">ID: {flow.metaFlowId}</span>}
                                         </div>
                                      </div>
                                   </div>
    
                                   <div className="flex items-center gap-1 opacity-100 transition-opacity pl-4">
                                      <button onClick={() => setPreviewTemplate(flow)} className="p-2 text-slate-400 hover:text-blue-500 rounded-none transition-all"><Eye size={14} /></button>
                                      <button onClick={() => handleEditFlow(flow)} className="p-2 text-slate-400 hover:text-emerald-500 rounded-none transition-all"><Edit2 size={14} /></button>
                                      <button onClick={() => handleDeleteFlow(flow.id)} className="p-2 text-slate-400 hover:text-rose-500 rounded-none transition-all"><Trash2 size={14} /></button>
                                      <ChevronRight size={14} className="text-slate-300 ml-1" />
                                   </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
            </div>
            </>
          ) : (
            <div className={`grid ${showPreview ? 'lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px]' : 'grid-cols-1'} gap-1 items-start`}>
              <div className={`bg-white dark:bg-[#16161d] p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-white/5 space-y-6 ${!showPreview ? 'w-full' : ''}`}>
                <div className="pt-2 pb-3 border-b border-slate-100 dark:border-white/5">
                  <TemplateStatusPipeline status={editingTemplateId ? (templates.find(t => t.id === editingTemplateId)?.status || 'PENDING') : 'DRAFT'} />
                </div>
                <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-white/5 mb-2">
                  <div>
                    <h3 className="text-xl font-medium text-slate-900 dark:text-white">{editingTemplateId ? 'Edit Template' : 'Create New Template'}</h3>
                    <p className="text-[10px] font-medium text-slate-700 dark:text-slate-200 tracking-wider uppercase mt-1">Design message blueprint for approval</p>
                  </div>
                  {editingTemplateId && (
                    <button
                      onClick={() => { setEditingTemplateId(null); resetForm(); setActiveView('list'); }}
                      className="text-blue-600 text-[10px] font-medium uppercase hover:underline"
                    >
                      Reset & New
                    </button>
                  )}
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-medium text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-4 block">1. Basic Info</label>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-[9px] font-medium text-slate-500 uppercase">Template Name</p>
                        <input
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-200 rounded text-xs font-medium outline-none focus:border-blue-500 transition-colors dark:text-white"
                          placeholder="e.g. welcome_msg"
                          value={name}
                          onChange={(e) => {
                            const val = e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                            setName(val);
                          }}
                          disabled={!!editingTemplateId}
                        />
                        {editingTemplateId && <p className="text-[8px] text-amber-500 font-medium mt-1 uppercase">Name cannot be changed</p>}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-medium text-slate-500 uppercase">Category</p>
                        <select
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-200 rounded text-xs font-medium outline-none dark:text-white appearance-none cursor-pointer"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          disabled={!!editingTemplateId}
                        >
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-medium text-slate-500 uppercase">Language</p>
                        <select
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-200 rounded text-xs font-medium outline-none dark:text-white appearance-none cursor-pointer"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                        >
                          {LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                    <div className="flex justify-between items-center mb-6">
                      <label className="text-[10px] font-medium text-slate-700 dark:text-slate-200 uppercase tracking-widest">2. Message Structure</label>
                      {category === 'Authentication' && (
                        <span className="flex items-center gap-1 text-[9px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          <ShieldCheck size={10} />
                          OTP Template Powered
                        </span>
                      )}
                    </div>

                    {category !== 'Authentication' && (
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between">
                          <p className="text-[9px] font-medium text-slate-500 uppercase">Header</p>
                          <select
                            className="text-[9px] bg-slate-100 dark:bg-[#1a1a24] border-none rounded px-2 py-1 dark:text-white outline-none font-medium"
                            value={headerType}
                            onChange={(e) => setHeaderType(e.target.value as HeaderType)}
                          >
                            <option value="None">None</option>
                            <option value="Text">Text</option>
                            <option value="Image">Image</option>
                            <option value="Video">Video</option>
                            <option value="Document">Document</option>
                          </select>
                        </div>

                        {headerType !== 'None' && headerType !== 'Text' && (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="group relative h-28 bg-slate-50 dark:bg-[#1a1a24] border-2 border-dashed border-slate-200 dark:border-slate-200 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 transition-all overflow-hidden"
                          >
                            {selectedFile ? (
                              <div className="absolute inset-0 bg-white dark:bg-[#16161d] p-2 flex flex-col items-center justify-center text-center">
                                <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center text-blue-600 mb-1">
                                  {headerType === 'Image' && <ImageIcon size={20} />}
                                  {headerType === 'Video' && <Video size={20} />}
                                  {headerType === 'Document' && <FileText size={20} />}
                                </div>
                                <p className="text-[10px] font-medium text-slate-900 dark:text-white truncate w-full px-4">{selectedFile.name}</p>
                                <p className="text-[8px] text-slate-700 dark:text-slate-200 font-medium uppercase">Click to change</p>
                              </div>
                            ) : (
                              <>
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:text-blue-500 group-hover:scale-110 transition-all">
                                  <Plus size={20} />
                                </div>
                                <p className="text-[10px] font-medium text-slate-700 dark:text-slate-200 uppercase tracking-widest">Select {headerType}</p>
                              </>
                            )}
                            <input
                              type="file" ref={fileInputRef} className="hidden"
                              accept={headerType === 'Image' ? 'image/*' : (headerType === 'Video' ? 'video/*' : '.pdf,.doc,.docx')}
                              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            />
                          </div>
                        )}

                        {headerType === 'Text' && (
                          <input
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-200 rounded text-xs font-medium outline-none focus:border-blue-500 transition-colors dark:text-white"
                            placeholder="Header Text"
                            value={headerText}
                            onChange={(e) => setHeaderText(e.target.value)}
                          />
                        )}
                      </div>
                    )}

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <button
                            type="button" onClick={() => applyFormatting('*')}
                            className="w-7 h-7 flex items-center justify-center bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-200 rounded text-slate-600 dark:text-slate-200 hover:bg-white transition-colors"
                            title="Bold"
                          >
                            <BoldIcon size={12} />
                          </button>
                          <button
                            type="button" onClick={() => applyFormatting('_')}
                            className="w-7 h-7 flex items-center justify-center bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-200 rounded text-slate-600 dark:text-slate-200 hover:bg-white transition-colors"
                            title="Italic"
                          >
                            <ItalicIcon size={12} />
                          </button>
                          <button
                            type="button" onClick={() => applyFormatting('~')}
                            className="w-7 h-7 flex items-center justify-center bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-200 rounded text-slate-600 dark:text-slate-200 hover:bg-white transition-colors"
                            title="Strikethrough"
                          >
                            <Strikethrough size={12} />
                          </button>
                          <button
                            type="button" onClick={() => applyFormatting('```')}
                            className="w-7 h-7 flex items-center justify-center bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-200 rounded text-slate-600 dark:text-slate-200 hover:bg-white transition-colors ml-1"
                            title="Monospace"
                          >
                            <Code size={12} />
                          </button>
                        </div>
                        <button
                          type="button" onClick={() => setBody(body + '{{1}}')}
                          className="text-[9px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded border border-blue-100 dark:border-blue-900/40"
                        >
                          + Add Variable
                        </button>
                      </div>
                      <textarea
                        ref={bodyRef}
                        className="w-full px-4 py-4 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-200 rounded text-sm font-medium outline-none focus:border-blue-500 transition-colors dark:text-white min-h-[140px] resize-none"
                        placeholder="Type your message body..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-medium text-slate-500 uppercase">Footer (Optional)</p>
                      <input
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-slate-200 rounded text-xs font-medium outline-none dark:text-white"
                        value={footer}
                        onChange={(e) => setFooter(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                    <label className="text-[10px] font-medium text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-4 block">3. Buttons (Max 3)</label>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <button 
                        type="button" 
                        onClick={() => handleAddButton('Quick Reply')} 
                        className="px-4 py-2 bg-slate-100 dark:bg-[#1a1a24] text-slate-600 dark:text-slate-200 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-200 flex items-center gap-2"
                      >
                        <MessageSquare size={14} />
                        Quick Reply
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleAddButton('URL')} 
                        className="px-4 py-2 bg-slate-100 dark:bg-[#1a1a24] text-slate-600 dark:text-slate-200 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-200 flex items-center gap-2"
                      >
                        <Globe size={14} />
                        Website Link
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleAddButton('Call to Action')} 
                        className="px-4 py-2 bg-slate-100 dark:bg-[#1a1a24] text-slate-600 dark:text-slate-200 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-amber-50 hover:text-amber-600 transition-all border border-transparent hover:border-amber-200 flex items-center gap-2"
                      >
                        <Phone size={14} />
                        Call Number
                      </button>
                    </div>

                    <div className="space-y-2">
                      {buttons.map(btn => (
                        <div key={btn.id} className="p-4 bg-slate-50 dark:bg-[#1a1a24]/50 rounded-lg border border-slate-200 dark:border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <select 
                              className="text-[8px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded uppercase tracking-widest border border-blue-200/50 dark:border-blue-500/20 outline-none cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                              value={btn.type === 'Call to Action' ? (btn.ctaType === 'Visit Website' ? 'URL' : 'Call') : 'Quick Reply'}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'Quick Reply') {
                                  updateButton(btn.id, { 
                                    type: 'Quick Reply', 
                                    ctaType: undefined, 
                                    urlType: undefined, 
                                    url: undefined, 
                                    phoneNumber: undefined,
                                    text: btn.text || 'Reply'
                                  });
                                } else if (val === 'URL') {
                                  updateButton(btn.id, { 
                                    type: 'Call to Action', 
                                    ctaType: 'Visit Website', 
                                    urlType: 'Static', 
                                    url: 'https://',
                                    text: btn.text || 'Visit Website'
                                  });
                                } else {
                                  updateButton(btn.id, { 
                                    type: 'Call to Action', 
                                    ctaType: 'Call Phone Number', 
                                    phoneNumber: '',
                                    text: btn.text || 'Call Now'
                                  });
                                }
                              }}
                            >
                              <option value="Quick Reply">Quick Reply</option>
                              <option value="URL">🔗 Website Link</option>
                              <option value="Call">📞 Call Number</option>
                            </select>
                            <button onClick={() => removeButton(btn.id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors">
                              <X size={14} />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div className="space-y-1">
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Button Text</p>
                              <input 
                                className="w-full px-3 py-2 bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded text-xs font-medium outline-none focus:border-blue-500 transition-colors dark:text-white"
                                placeholder="e.g. Visit Website"
                                value={btn.text}
                                onChange={(e) => updateButton(btn.id, { text: e.target.value })}
                              />
                            </div>

                            {btn.type === 'Call to Action' && (
                              <>
                                <div className="space-y-1">
                                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Action Type</p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button 
                                      type="button"
                                      onClick={() => updateButton(btn.id, { ctaType: 'Visit Website', text: btn.text || 'Visit Website' })}
                                      className={`py-2 px-2 rounded text-[10px] font-bold border transition-all flex items-center justify-center gap-2 ${btn.ctaType === 'Visit Website' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-[#16161d] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-200'}`}
                                    >
                                      <Globe size={12} />
                                      Visit Website
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => updateButton(btn.id, { ctaType: 'Call Phone Number', text: btn.text || 'Call Now' })}
                                      className={`py-2 px-2 rounded text-[10px] font-bold border transition-all flex items-center justify-center gap-2 ${btn.ctaType === 'Call Phone Number' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-[#16161d] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-200'}`}
                                    >
                                      <Phone size={12} />
                                      Call Number
                                    </button>
                                  </div>
                                </div>

                                {btn.ctaType === 'Visit Website' && (
                                  <div className="space-y-4 animate-in slide-in-from-top-1 duration-200 pt-2">
                                    <div className="space-y-1">
                                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">URL Type</p>
                                      <div className="flex gap-4">
                                        {['Static', 'Dynamic'].map((type) => (
                                          <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                            <div 
                                              onClick={() => updateButton(btn.id, { urlType: type as any })}
                                              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${btn.urlType === type ? 'border-blue-500 bg-blue-500' : 'border-slate-300 dark:border-slate-600'}`}
                                            >
                                              {btn.urlType === type && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-700 dark:text-slate-200">{type}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Website URL</p>
                                      <div className="relative">
                                        <input 
                                          className="w-full pl-8 pr-3 py-2 bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded text-xs outline-none focus:border-blue-500 transition-colors dark:text-white"
                                          placeholder="https://example.com"
                                          value={btn.url}
                                          onChange={(e) => updateButton(btn.id, { url: e.target.value })}
                                        />
                                        <Globe size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                      </div>
                                      {btn.urlType === 'Dynamic' && (
                                        <p className="text-[8px] text-blue-500 font-medium mt-1">Append variables like <span className="bg-blue-50 px-1 rounded">{'{{1}}'}</span> at the end of your URL.</p>
                                      )}
                                    </div>
                                  </div>
                                )}


                                {btn.ctaType === 'Call Phone Number' && (
                                  <div className="space-y-1 animate-in slide-in-from-top-1 duration-200 pt-2">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Phone Number</p>
                                    <div className="relative">
                                      <input 
                                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded text-xs outline-none dark:text-white"
                                        placeholder="919876543210"
                                        value={btn.phoneNumber}
                                        onChange={(e) => updateButton(btn.id, { phoneNumber: e.target.value.replace(/\D/g, '') })}
                                      />
                                      <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                   <button
                    onClick={() => {
                      setActiveView('list');
                      setEditingTemplateId(null);
                      setName('');
                      setCategory('Marketing');
                      setLanguage('en_US');
                      setHeaderType('None');
                      setHeaderText('');
                      setBody('');
                      setFooter('');
                      setButtons([]);
                    }}
                    className="flex-1 px-6 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-200 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSubmit} disabled={isSubmitting}
                    className="flex-2 px-10 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Clock className="animate-spin" size={14} /> : <Send size={14} />}
                    {editingTemplateId ? 'Update Template' : 'Submit'}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6 lg:sticky lg:top-6"
                  >
                    <div className="bg-white dark:bg-[#16161d] p-0 py-6 rounded-lg border border-slate-200 dark:border-white/5">
                      <h3 className="text-[9px] font-medium text-slate-700 dark:text-slate-200 uppercase tracking-widest mb-6 text-center">Live Preview</h3>
                      <WhatsAppPreview
                        headerType={headerType}
                        headerText={headerText}
                        content={body}
                        footer={footer}
                        buttons={buttons}
                        mediaUrl={mediaUrl}
                        accountName={selectedAccount?.name}
                        isVerified={selectedAccount?.isVerified || selectedAccount?.official}
                        templateId={editingTemplateId ? templates.find(t => t.id === editingTemplateId)?.name : name || 'New Template'}
                      />
                    </div>

                    <div className="p-6 border border-slate-100 dark:border-white/5 rounded-lg space-y-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-amber-500" />
                        <span className="text-[10px] font-medium text-slate-700 dark:text-slate-200 uppercase tracking-widest">Policy Guidelines</span>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
                        Content must comply with Meta's Business Policy. Templates are usually reviewed within 24 hours. Once approved, the status will update automatically.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Filter Sidebar Drawer */}
      <AnimatePresence>
        {isFilterSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[200]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[85%] sm:w-[350px] bg-white dark:bg-[#16161d] border-l border-slate-200 dark:border-white/5 z-[201] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-[#1a1a24]/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-none bg-blue-600 flex items-center justify-center text-white">
                    <ListFilter size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-white">Filters</h3>
                    <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-widest">Refine your library</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFilterSidebarOpen(false)}
                  className="p-2 bg-white dark:bg-[#1a1a24] border border-slate-200 rounded-none text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-8">


                {/* Category Filter - Only for Templates */}
                {showTemplates && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 uppercase tracking-widest">
                      <Layout size={12} className="text-amber-500" />
                      Category
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {['All', 'Marketing', 'Utility', 'Authentication'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategoryFilter(cat)}
                          className={`w-full text-left px-4 py-3 rounded-none border text-[11px] font-bold uppercase transition-all ${activeCategoryFilter === cat
                              ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-black'
                              : 'bg-slate-50 dark:bg-[#1a1a24] border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-200 hover:border-slate-300'
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Filter */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 uppercase tracking-widest">
                    <RefreshCw size={12} className="text-emerald-500" />
                    Status
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(showTemplates && !showFlows ? ['All', 'Approved', 'Pending', 'Rejected'] : (!showTemplates && showFlows ? ['All', 'Published', 'Draft', 'Deprecated'] : ['All', 'Approved', 'Pending', 'Published', 'Draft'])).map(status => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`text-center px-2 py-3 rounded-none border text-[10px] font-bold uppercase transition-all ${statusFilter === status
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-slate-50 dark:bg-[#1a1a24] border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-200 hover:border-slate-300'
                          }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Filter - Only for Templates */}
                {showTemplates && (
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 uppercase tracking-widest">
                        <Globe size={12} className="text-blue-400" />
                        Language
                     </h4>
                     <select 
                        value={activeLanguageFilter}
                        onChange={(e) => setActiveLanguageFilter(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-[#1a1a24] border border-slate-100 dark:border-white/5 rounded-none text-xs font-bold uppercase outline-none focus:border-blue-500"
                     >
                        <option value="All">All Languages</option>
                        {LANGUAGES.map(lang => (
                          <option key={lang.code} value={lang.code}>{lang.label}</option>
                        ))}
                     </select>
                  </div>
                )}
                {/* Sort Filter */}
                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 uppercase tracking-widest">
                      <ArrowDownUp size={12} className="text-purple-500" />
                      Sorting
                   </h4>
                   <div className="grid grid-cols-1 gap-2">
                      {[
                        { label: 'Newest First', value: 'newest' },
                        { label: 'Oldest First', value: 'oldest' },
                        { label: 'Alphabetical', value: 'name' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setSortBy(opt.value as any)}
                          className={`w-full text-left px-4 py-3 rounded-none border text-[11px] font-bold uppercase transition-all ${sortBy === opt.value
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'bg-slate-50 dark:bg-[#1a1a24] border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-200 hover:border-slate-300'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#1a1a24]/50">
                <button
                  onClick={() => {
                    setActiveCategoryFilter('All');
                    setStatusFilter('All');
                    setActiveLanguageFilter('All');
                    setShowTemplates(true);
                    setShowFlows(true);
                    setSearchQuery('');
                    setSortBy('newest');
                  }}
                  className="w-full py-4 bg-white dark:bg-[#1a1a24] border border-slate-200 rounded-none text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:text-white transition-colors shadow-none"
                >
                  Reset Defaults
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
