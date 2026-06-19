import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Upload, 
  Users, 
  Send, 
  RefreshCw, 
  AlertCircle,
  Search,
  CheckCircle2,
  Layout,
  MessageSquare,
  ChevronRight,
  X,
  Shield,
  CheckCircle,
  Lock,
  Layers,
  FileText,
  Smartphone,
  Paperclip,
  Check,
  Rocket,
  ChevronLeft,
  Settings2,
  Menu,
  Sparkles,
  FileStack,
  KeyRound,
  Eye,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  sendMessage 
} from '../api';

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

interface WhatsAppBulkSendViewProps {
  user: any;
  onSuccess: () => void;
  selectedAccount?: any;
}

export function WhatsAppBulkSendView({ user, onSuccess, selectedAccount }: WhatsAppBulkSendViewProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [recipients, setRecipients] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});
  const [parsedRecipients, setParsedRecipients] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAudienceModalOpen, setIsAudienceModalOpen] = useState(false);
  const [userContacts, setUserContacts] = useState<any[]>([]);
  const [uniqueTags, setUniqueTags] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, 'contacts'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserContacts(docs);
      
      const tags = new Set<string>();
      docs.forEach(c => {
        if (c.tags && Array.isArray(c.tags)) {
          c.tags.forEach(t => tags.add(t));
        }
      });
      setUniqueTags(Array.from(tags));
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleSelectAudience = (tag: string | null) => {
    const contactsToUse = tag ? userContacts.filter(c => c.tags?.includes(tag)) : userContacts;
    if (contactsToUse.length === 0) return;

    const newContent = contactsToUse.map(c => {
      return `${c.phoneNumber},${c.name || ''}`;
    }).join('\n');

    setRecipients(prev => {
      const current = prev.trim();
      return current ? `${current}\n${newContent}` : newContent;
    });
    
    setIsAudienceModalOpen(false);
  };

  useEffect(() => {
    setSelectedTemplate(null); // Reset selection when account changes
    
    const constraints = [where('status', '==', 'APPROVED')];
    
    if (user.role !== 'admin') {
      constraints.push(where('uid', '==', user.parentId || user.uid));
    }
    
    if (selectedAccount) {
      constraints.push(where('whatsappAccountId', '==', selectedAccount.id));
    }

    const q = query(collection(db, 'templates'), ...constraints);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTemplates(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user.uid, user.parentId, user.role, selectedAccount?.id]);

  useEffect(() => {
    if (selectedTemplate) {
      const body = selectedTemplate.components?.find((c: any) => c.type === 'BODY' || c.type === 'body')?.text || '';
      const header = selectedTemplate.components?.find((c: any) => c.type === 'HEADER' || c.type === 'header')?.text || '';
      const combinedText = body + ' ' + header;
      const matches = combinedText.match(/{{(\d+)}}/g);
      const vars: Record<string, string> = {};
      if (matches) {
        matches.forEach(m => {
          const num = m.match(/\d+/)?.[0];
          if (num) vars[num] = '';
        });
      }
      setTemplateVars(vars);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    } else {
      setTemplateVars({});
    }
  }, [selectedTemplate?.id]);

  const filteredTemplates = templates
    .filter(t => 
      (t.name?.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (t.content?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const getTimestamp = (t: any) => {
        const date = t.updatedAt || t.lastUpdated || t.createdAt;
        if (!date) return 0;
        if (typeof date === 'object' && date.seconds) return date.seconds;
        return new Date(date).getTime() / 1000;
      };
      return getTimestamp(b) - getTimestamp(a);
    });

  const formatContent = (text: string) => {
    if (!text) return <span className="text-slate-700 dark:text-slate-200">Your message body will appear here...</span>;
    
    // Process variables {{n}}
    let parts: (string | React.ReactNode)[] = text.split(/(\{\{\d+\}\})/g).map((part, i) => {
      if (part.match(/\{\{\d+\}\}/)) {
        const num = part.replace(/[\{\}]/g, '');
        const val = templateVars[num];
        return <span key={`v-${i}`} className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-1 rounded font-black">{val || part}</span>;
      }
      return part;
    });

    const styleParts = (content: string | React.ReactNode): (string | React.ReactNode)[] => {
      if (typeof content !== 'string') return [content];
      const process = (text: string): (string | React.ReactNode)[] => {
        const boldRegex = /\*([^*]+)\*/g;
        const italicRegex = /_([^_]+)_/g;
        const strikeRegex = /~([^~]+)~/g;
        let res: (string | React.ReactNode)[] = [text];
        const applyStyle = (items: (string | React.ReactNode)[], regex: RegExp, wrapper: (inner: string) => React.ReactNode) => {
          let next: (string | React.ReactNode)[] = [];
          items.forEach(item => {
            if (typeof item !== 'string') { next.push(item); return; }
            const segments = item.split(regex);
            segments.forEach((seg, idx) => {
              if (idx % 2 === 1) next.push(wrapper(seg));
              else if (seg) next.push(seg);
            });
          });
          return next;
        };
        res = applyStyle(res, boldRegex, (s) => <strong key={Math.random()} className="font-bold">{s}</strong>);
        res = applyStyle(res, italicRegex, (s) => <em key={Math.random()} className="italic">{s}</em>);
        res = applyStyle(res, strikeRegex, (s) => <del key={Math.random()} className="line-through">{s}</del>);
        return res;
      };
      return process(content);
    };

    let FinalParts: (string | React.ReactNode)[] = [];
    parts.forEach(p => {
      if (typeof p === 'string') FinalParts.push(...styleParts(p));
      else FinalParts.push(p);
    });
    return FinalParts;
  };

  const getFinalContent = () => {
    let content = selectedTemplate?.content || selectedTemplate?.components?.find((c: any) => c.type === 'BODY' || c.type === 'body')?.text || '';
    Object.keys(templateVars).forEach(num => {
      const val = templateVars[num] || `{{${num}}}`;
      content = content.replace(`{{${num}}}`, val);
    });
    return content;
  };

  const parseInputToRecipients = (text: string) => {
    const rows = text.split(/[\n\r]/).filter(row => row.trim());
    return rows.map(row => {
      // Split by comma or tab
      const parts = row.split(/[,\t]/).map(p => p.trim());
      const phone = parts[0].replace(/\D/g, '');
      const vars = parts.slice(1);
      return { phone, vars, original: row };
    }).filter(r => r.phone.length >= 8);
  };

  useEffect(() => {
    setParsedRecipients(parseInputToRecipients(recipients));
  }, [recipients]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/[\n\r]/).filter(l => l.trim());
      
      // Auto-ignore header if first column has text but second line has numbers
      let startIdx = 0;
      if (lines.length > 1) {
        const firstRowAlpha = /[a-zA-Z]/.test(lines[0].split(/[,\t]/)[0]);
        const secondRowNumeric = /^\d+$/.test(lines[1].split(/[,\t]/)[0].replace(/\D/g, ''));
        if (firstRowAlpha && secondRowNumeric) startIdx = 1;
      }

      const validLines = lines.slice(startIdx);
      if (validLines.length > 0) {
        setRecipients(prev => {
          const current = prev.trim();
          const newContent = validLines.join('\n');
          return current ? `${current}\n${newContent}` : newContent;
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSend = async () => {
    if (!selectedTemplate || !recipients.trim() || !selectedAccount) return;

    // Validate variables
    const templateVarsCount = Object.keys(templateVars).length;
    if (templateVarsCount > 0) {
      const missingVars: string[] = [];
      const varKeys = Object.keys(templateVars).sort((a, b) => parseInt(a) - parseInt(b));
      
      varKeys.forEach((num, idx) => {
        const hasStaticFallback = templateVars[num].trim() !== '';
        const allRecipientsHaveVar = parsedRecipients.every(r => r.vars[idx] && r.vars[idx].trim() !== '');
        
        if (!hasStaticFallback && !allRecipientsHaveVar) {
          missingVars.push(`{{${num}}}`);
        }
      });

      if (missingVars.length > 0) {
        alert(`Missing data for variables: ${missingVars.join(', ')}. \n\nPlease either:\n1. Add these values to your CSV after the phone number.\n2. Or fill the "Static Personalization" boxes to use the same value for everyone.`);
        return;
      }
    }

    setSending(true);
    
    const campaignId = `cmp_${Date.now()}`;
    let successCount = 0;
    let errorCount = 0;
    let lastMetaError = '';
    
    // Validation: Check if any variables are empty
    if (Object.keys(templateVars).length > 0) {
      // Check if any variable is missing both from CSV and from Static Personalization
      const firstRecipient = parsedRecipients[0];
      const hasCsvVars = firstRecipient && firstRecipient.vars && firstRecipient.vars.length > 0;
      
      const emptyStaticVars = Object.entries(templateVars || {}).filter(([_, val]) => typeof val === 'string' && !val.trim());
      
      if (!hasCsvVars && emptyStaticVars.length > 0) {
        alert(`Error: Variable values are missing.\n\nPlease fill the "Static Personalization" boxes for variables like {{1}}, {{2}}, etc.\n\nMeta does not allow sending empty values.`);
        setSending(false);
        return;
      }
    }

    try {
      for (const item of parsedRecipients) {
        try {
          // Use template language code directly from DB
          const langCode = selectedTemplate.language || 'en_US';
          
          // Build personalized components
          const components: any[] = [];
          
          // 1. Handle HEADER (Image, Video, Document, or Text Variables)
          const headerComp = selectedTemplate.components?.find((c: any) => c.type === 'HEADER' || c.type === 'header');
          if (headerComp) {
            const hComp: any = { type: 'header', parameters: [] };
            const format = headerComp.format?.toUpperCase();
            
            if (format === 'IMAGE' || format === 'VIDEO' || format === 'DOCUMENT') {
              const mediaUrl = headerComp.example?.header_handle?.[0] || '';
              if (mediaUrl) {
                const mediaType = format.toLowerCase();
                const mediaObj: any = { link: mediaUrl };
                if (format === 'DOCUMENT') mediaObj.filename = 'document.pdf'; // Default filename
                
                hComp.parameters.push({ type: mediaType, [mediaType]: mediaObj });
                components.push(hComp);
              }
            } else if (format === 'TEXT' && headerComp.text?.includes('{{')) {
              // Handle text header variables
              // Note: Meta usually numbers header vars starting from 1 separately or shares indexing.
              // We'll look for the first variable mapping if available.
              const val = templateVars['1'] || ''; // Assuming header var is often {{1}}
              if (val) {
                hComp.parameters.push({ type: 'text', text: val });
                components.push(hComp);
              }
            }
          }

          // 2. Handle BODY variables
          const templateVarsCount = Object.keys(templateVars).length;
          if (templateVarsCount > 0) {
            components.push({
              type: 'body',
              parameters: Object.keys(templateVars)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((num, idx) => {
                  const val = item.vars[idx] || templateVars[num] || '';
                  return { type: 'text', text: val };
                })
            });
          }

          const finalComponents = components.length > 0 ? components : undefined;

          // Compute personalized content for local display/logging
          let personalizedContent = selectedTemplate?.content || selectedTemplate?.components?.find((c: any) => c.type === 'BODY' || c.type === 'body')?.text || '';
          Object.keys(templateVars).forEach((num, idx) => {
             const val = item.vars[idx] || templateVars[num] || `{{${num}}}`;
             personalizedContent = personalizedContent.replace(`{{${num}}}`, val);
          });

          await sendMessage(item.phone, personalizedContent, 'whatsapp', item.phone, selectedAccount.id, selectedTemplate.name, langCode, finalComponents, campaignId);
          successCount++;
        } catch (err: any) {
          console.error("Personalized send failed:", err);
          const errorMessage = err.message || 'Unknown error';
          lastMetaError = errorMessage; // Capture the actual error
          errorCount++;
        }
      }
      
      await addDoc('campaigns', {
        id: campaignId,
        uid: user.uid,
        whatsappAccountId: selectedAccount.id,
        name: `Campaign: ${selectedTemplate.name}`,
        templateId: selectedTemplate.id,
        templateCategory: selectedTemplate.category, // Added category for cost analysis
        content: getFinalContent(),
        timestamp: serverTimestamp(),
        totalRecipients: parsedRecipients.length,
        successCount: successCount, 
        errorCount: errorCount,
        status: 'Sent', type: 'Broadcast'
      });

      if (errorCount > 0) {
        alert(`Bulk Send Completed with ${errorCount} errors.\n\nLast Error from Meta: "${lastMetaError}"\n\nTip: Verify your Phone Number ID in Meta Dashboard.`);
      } else {
        alert(`Success! All ${successCount} messages were sent successfully.`);
      }
      onSuccess();
    } catch (error: any) {
      alert('Failed: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row bg-white dark:bg-[#16161d] text-slate-900 dark:text-white transition-all">
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0 }} animate={{ width: window.innerWidth < 1024 ? '100%' : 300 }} exit={{ width: 0 }}
            className="h-full z-50 lg:relative lg:inset-auto bg-[#13131a] border-r border-white/5 flex flex-col lg:h-screen lg:sticky lg:top-0 overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Templates</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 dark:text-slate-200" size={14} />
                <input 
                  type="text" placeholder="Search templates..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1a1a24] border border-white/5 rounded py-2 pl-10 pr-4 text-xs outline-none focus:border-blue-500 transition-colors text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1.5">
              {loading ? (
                <div className="py-10 text-center"><RefreshCw size={16} className="animate-spin mx-auto text-slate-300" /></div>
              ) : (
                filteredTemplates.map(t => (
                  <button
                    key={t.id} onClick={() => {
                      setSelectedTemplate(t);
                    }}
                    className={cn(
                      "w-full text-left rounded p-3 border transition-all flex items-center gap-3",
                      selectedTemplate?.id === t.id ? 'bg-blue-600 border-blue-600 text-white shadow-none ring-1 ring-white/10' : 'bg-[#1a1a24] border-white/5 hover:border-slate-700 text-slate-100'
                    )}
                  >
                    <div className={cn(
                        "w-7 h-7 rounded flex items-center justify-center flex-shrink-0",
                        selectedTemplate?.id === t.id ? 'bg-white/20' : (t.category === 'MARKETING' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600')
                    )}>
                        {t.category === 'MARKETING' ? <Sparkles size={12} /> : (t.category === 'AUTHENTICATION' ? <KeyRound size={12} /> : <FileStack size={12} />)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-[11px] font-bold truncate leading-none">{t.name}</h4>
                        <p className={cn("text-[8px] font-bold uppercase tracking-wider mt-1 opacity-60", selectedTemplate?.id === t.id ? 'text-white' : 'text-slate-500')}>
                          {t.category}
                        </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 p-6 lg:p-10 w-full">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => {
                  setSelectedTemplate(null);
                  setIsSidebarOpen(true);
                }}
                className="p-2 border border-slate-200 dark:border-white/5 rounded hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
              >
                <Menu size={20} className="text-slate-600 dark:text-slate-200" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold">Broadcast</h1>
              <p className="text-[10px] font-medium tracking-tight text-slate-700 dark:text-slate-200 mt-1">Send bulk message campaigns</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
            <div className="xl:col-span-7 space-y-6">
              <div className="bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-lg p-6 space-y-6 transition-all">
                 <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">Recipients</h2>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                      {parsedRecipients.length} Set
                    </span>
                 </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded border-dashed cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-400 transition-all group" 
                         onClick={() => setIsAudienceModalOpen(true)}>
                      <Users size={18} className="text-slate-700 dark:text-slate-200 group-hover:text-blue-500" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-200 group-hover:text-blue-600">Select Audience</span>
                    </div>

                    <div className="flex-1 flex items-center gap-3 p-4 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded border-dashed cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-400 transition-all group" 
                         onClick={() => fileInputRef.current?.click()}>
                      <Upload size={18} className="text-slate-700 dark:text-slate-200 group-hover:text-blue-500" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-200 group-hover:text-blue-600">Upload CSV / TXT</span>
                      <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.txt" onChange={handleFileUpload} />
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        const content = "phone,name,var1,var2\n919876543210,Prince,Val1,Val2\n919988776655,Aman,Val1,Val2";
                        const blob = new Blob([content], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'sample_bulk_contacts.csv';
                        a.click();
                        window.URL.revokeObjectURL(url);
                      }}
                      className="px-4 py-4 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded text-slate-600 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:border-emerald-400 transition-all flex items-center justify-center gap-2"
                      title="Download Sample CSV"
                    >
                      <FileText size={18} />
                      <span className="text-[10px] font-medium">Download Sample</span>
                    </button>
                  </div>

                 <textarea 
                   value={recipients} onChange={(e) => setRecipients(e.target.value)}
                   placeholder="Enter numbers (one per line)..."
                   className="w-full h-48 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded p-4 text-xs font-medium outline-none focus:border-blue-500 transition-all resize-none dark:text-white"
                 />
              </div>

              {selectedTemplate && Object.keys(templateVars).length > 0 && (
                <div className="space-y-6">
                  {/* Dynamic Personalization Preview */}
                  {parsedRecipients.length > 0 && parsedRecipients[0].vars.length > 0 && (
                    <div className="bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-lg overflow-hidden flex flex-col">
                      <div className="bg-slate-50 dark:bg-[#1a1a24] p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                         <h2 className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">Personalization Mapping Preview</h2>
                         <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-1">
                           <Check size={10} /> Dynamic Data Detected
                         </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 dark:bg-black/20">
                              <th className="p-3 text-[9px] font-bold text-slate-700 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-white/5">Recipient</th>
                              {Object.keys(templateVars).sort((a,b) => parseInt(a)-parseInt(b)).map(num => (
                                <th key={num} className="p-3 text-[9px] font-bold text-slate-700 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-white/5">Var {'{{'}{num}{'}}'}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {parsedRecipients.slice(0, 3).map((r, i) => (
                              <tr key={i} className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:text-white/50 transition-colors">
                                <td className="p-3 text-[10px] font-medium text-slate-600 dark:text-slate-200">+{r.phone}</td>
                                {Object.keys(templateVars).sort((a,b) => parseInt(a)-parseInt(b)).map((num, idx) => (
                                  <td key={idx} className="p-3 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                    {r.vars[idx] || <span className="text-slate-300 italic">Fallback: {templateVars[num] || '-'}</span>}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {parsedRecipients.length > 3 && (
                        <div className="p-3 bg-slate-50/50 dark:bg-[#1a1a24]/50 text-center border-t border-slate-100 dark:border-white/5">
                           <p className="text-[9px] text-slate-700 dark:text-slate-200 font-bold uppercase tracking-widest">Showing 3 of {parsedRecipients.length} recipients</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-lg p-6 space-y-6">
                    <h2 className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">Static Personalization (Fallback)</h2>
                    <p className="text-[10px] text-slate-500 -mt-4">These values will be used if your uploaded file is missing variables for a specific row.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(templateVars).sort((a,b) => parseInt(a)-parseInt(b)).map(num => (
                          <div key={num} className="space-y-1">
                             <label className="text-[9px] font-bold text-slate-700 dark:text-slate-200 uppercase">Default {'{{'}{num}{'}}'}</label>
                             <input 
                               type="text" value={templateVars[num]}
                               onChange={(e) => setTemplateVars(prev => ({ ...prev, [num]: e.target.value }))}
                               className="w-full border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#1a1a24] rounded py-2 px-3 text-xs font-bold outline-none focus:border-blue-500 transition-colors dark:text-white"
                             />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                disabled={sending || !selectedTemplate || !recipients.trim()}
                onClick={handleSend}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-30 shadow-lg shadow-blue-600/10"
              >
                {sending ? <RefreshCw size={16} className="animate-spin" /> : <Rocket size={16} />}
                {sending ? 'Processing...' : 'Send Campaign'}
              </button>
            </div>

            <div className="xl:col-span-5 lg:sticky lg:top-10 space-y-4">
               <div className="flex items-center justify-between">
                 <h2 className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">Phone Preview</h2>
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                 </div>
               </div>

               <div className="bg-[#e5ddd5] dark:bg-[#0b141a] rounded-[2rem] p-4 border-[8px] border-slate-900 dark:border-[#202c33] shadow-none h-[500px] flex flex-col relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 dark:bg-[#202c33] rounded-b-xl z-20 flex items-center justify-center">
                    <div className="w-8 h-1 bg-slate-800 rounded-full" />
                  </div>

                  <div className="bg-[#075e54] dark:bg-[#202c33] px-3 py-2 flex items-center gap-2 mt-4 -mx-4">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold uppercase text-slate-600">
                       {selectedAccount?.name?.charAt(0) || 'W'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[9px] font-bold flex items-center gap-1 truncate">
                        {selectedAccount?.name || 'WhatsApp Account'}
                        {selectedAccount?.isVerified && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex items-center justify-center border-[0.5px] border-white/20 shadow-none"><Check size={6} className="text-white" strokeWidth={4} /></div>}
                      </p>
                      <p className="text-[#9de1fe] dark:text-[#8696a0] text-[7px] truncate">
                        {selectedTemplate?.name ? `Template: ${selectedTemplate.name}` : 'Online'}
                      </p>
                    </div>
                  </div>

                  <div className="p-1 space-y-3 h-full overflow-y-auto">
                    <div className="bg-white dark:bg-[#202c33] rounded-lg rounded-tl-none border border-slate-100 dark:border-white/5 p-2 max-w-[95%] relative shadow-none">
                      <div className="text-[10px] text-slate-800 dark:text-slate-200 leading-normal whitespace-pre-wrap">
                        {(() => {
                           if (!selectedTemplate) return <span className="text-slate-700 dark:text-slate-200 italic">No template selected...</span>;
                           
                           let text = selectedTemplate.content || selectedTemplate.components?.find((c: any) => c.type === 'BODY' || c.type === 'body')?.text || '';
                           
                           // Use first recipient data for preview if available
                           if (parsedRecipients.length > 0 && parsedRecipients[0].vars.length > 0) {
                              Object.keys(templateVars).sort((a,b)=>parseInt(a)-parseInt(b)).forEach((num, idx) => {
                                 const val = parsedRecipients[0].vars[idx] || templateVars[num] || `{{${num}}}`;
                                 text = text.replace(`{{${num}}}`, val);
                              });
                           } else {
                              Object.keys(templateVars).forEach(num => {
                                const val = templateVars[num] || `{{${num}}}`;
                                text = text.replace(`{{${num}}}`, val);
                              });
                           }
                           
                           return formatContent(text);
                        })()}
                      </div>
                      <div className="flex justify-end mt-1">
                        <span className="text-[6px] text-slate-700 dark:text-slate-200">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
               </div>
               
               <div className="p-4 border border-slate-100 dark:border-white/5 rounded bg-slate-50/50 dark:bg-[#1a1a24]/50 text-emerald-600">
                  <p className="text-[9px] text-slate-700 dark:text-slate-200 font-medium leading-relaxed uppercase tracking-tighter">
                    Broadcast campaigns are processed sequentially to ensure delivery and compliance with Meta's rate limits.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </main>

      {/* Audience Selection Modal */}
      {isAudienceModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#16161d] w-full max-w-md rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Select Audience Segment
              </h3>
              <button onClick={() => setIsAudienceModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              <button
                onClick={() => handleSelectAudience(null)}
                className="w-full text-left p-4 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#1a1a24] hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">All Contacts</h4>
                  <p className="text-xs text-slate-500 mt-1">Send to everyone in your audience</p>
                </div>
                <div className="bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-1 rounded">
                  {userContacts.length}
                </div>
              </button>

              {uniqueTags.length > 0 && (
                <div className="pt-4 pb-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">By Tag / Segment</h4>
                </div>
              )}

              {uniqueTags.map(tag => {
                const count = userContacts.filter(c => c.tags?.includes(tag)).length;
                return (
                  <button
                    key={tag}
                    onClick={() => handleSelectAudience(tag)}
                    className="w-full text-left p-4 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#1a1a24] hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{tag}</h4>
                      <p className="text-xs text-slate-500 mt-1">Send to contacts tagged as {tag}</p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[10px] font-bold px-2 py-1 rounded">
                      {count}
                    </div>
                  </button>
                );
              })}
              
              {uniqueTags.length === 0 && userContacts.length > 0 && (
                 <p className="text-xs text-center text-slate-500 pt-4">No tags created yet. Add tags to contacts to see segments here.</p>
              )}
              {userContacts.length === 0 && (
                 <p className="text-xs text-center text-slate-500 pt-4">No contacts found in your Audience. Please add them first.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
