import React, { useState, useEffect } from 'react';
import { createWhatsAppFlow, updateWhatsAppFlowAsset } from '../api/whatsapp';
import { 
  Smartphone, 
  Plus, 
  Trash2, 
  X, 
  Layout, 
  Check,
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Type, 
  Hash, 
  List, 
  CheckSquare, 
  Save, 
  Play,
  Settings,
  ChevronRight,
  ChevronDown,
  Eye,
  FileCode,
  Sparkles,
  ArrowLeft,
  Mail,
  Image as ImageIcon,
  FileText,
  AlertCircle,
  Maximize2,
  Minimize2,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, collection, addDoc, serverTimestamp, doc, updateDoc } from '../api';

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

type FieldType = 'text' | 'number' | 'email' | 'radio' | 'dropdown' | 'checkbox' | 'text_content' | 'image' | 'video' | 'document';

interface FlowScreen {
  id: string;
  title: string;
  type: 'form' | 'success';
  fields: FlowField[];
  content?: string; // For success screens
}

interface FlowField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For radio, checkbox, dropdown
  content?: string; // For text_content
  url?: string;     // For media types
  name?: string;    // System name for mapping
}

interface WhatsAppFlowFormBuilderProps {
  user: any;
  selectedAccount: any;
  editingFlow?: any;
  onBack: () => void;
  onSave: (flowData: any) => void;
}

export const WhatsAppFlowFormBuilder = ({ user, selectedAccount, editingFlow, onBack, onSave }: WhatsAppFlowFormBuilderProps) => {
  const [screens, setScreens] = useState<FlowScreen[]>(
    editingFlow?.screens || [
      { id: 'screen_1', title: 'Welcome Screen', type: 'form', fields: [] }
    ]
  );
  const [activeScreenId, setActiveScreenId] = useState(editingFlow?.screens?.[0]?.id || 'screen_1');
  const [flowName, setFlowName] = useState(editingFlow?.name || 'My New WhatsApp Flow');
  const [isSaving, setIsSaving] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [isFullscreenJson, setIsFullscreenJson] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoTicket, setAutoTicket] = useState(editingFlow?.autoTicket || false);

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [jsonInput, setJsonInput] = useState('');
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isElementsExpanded, setIsElementsExpanded] = useState(false);
  const [isScreensExpanded, setIsScreensExpanded] = useState(true);

  useEffect(() => {
    setJsonInput(JSON.stringify(generateFlowJson(), null, 2));
  }, [screens, flowName]);

  const handleJsonInputChange = (val: string) => {
    setJsonInput(val);
    try {
      const parsed = JSON.parse(val);
    } catch (e) {
    }
  };

  const activeScreen = screens.find(s => s.id === activeScreenId) || screens[0];

  const addScreen = (type: 'form' | 'success' = 'form') => {
    const newId = `screen_${Date.now()}`;
    setScreens([...screens, { 
      id: newId, 
      title: type === 'success' ? 'Completion Screen' : `Screen ${screens.length + 1}`, 
      type,
      fields: [],
      content: type === 'success' ? 'Thank you for your submission!' : undefined
    }]);
    setActiveScreenId(newId);
  };

  const removeScreen = (id: string) => {
    if (screens.length === 1) return;
    const newScreens = screens.filter(s => s.id !== id);
    setScreens(newScreens);
    if (activeScreenId === id) setActiveScreenId(newScreens[0].id);
  };

  const addField = (type: FieldType) => {
    const newField: FlowField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${(type || 'text').charAt(0).toUpperCase() + (type || 'text').slice(1)} Field`,
      placeholder: `Enter ${type}...`,
      required: false,
      options: ['Option 1', 'Option 2'],
      name: `field_${Date.now()}`
    };
    
    setScreens(screens.map(s => 
      s.id === activeScreenId ? { ...s, fields: [...s.fields, newField] } : s
    ));
  };

  const updateField = (fieldId: string, updates: Partial<FlowField>) => {
    setScreens(screens.map(s => 
      s.id === activeScreenId 
        ? { ...s, fields: s.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f) } 
        : s
    ));
  };

  const removeField = (fieldId: string) => {
    setScreens(screens.map(s => 
      s.id === activeScreenId 
        ? { ...s, fields: s.fields.filter(f => f.id !== fieldId) } 
        : s
    ));
  };

  const generateFlowJson = () => {
    const screenIdMap = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    return {
      version: "7.3",
      screens: screens.map((s, idx) => {
        const isLastScreen = idx === screens.length - 1;
        const isTerminal = s.type === 'success' || isLastScreen;
        const nextScreen = isLastScreen ? null : screens[idx + 1];
        const currentId = `screen_${screenIdMap[idx] || idx}`;
        const nextId = nextScreen ? `screen_${screenIdMap[idx + 1] || idx + 1}` : null;

        const footerAction = isTerminal ? {
          name: "complete",
          payload: {}
        } : {
          name: "navigate",
          next: {
            type: "screen",
            name: nextId
          },
          payload: {}
        };

        return {
          id: currentId,
          title: s.title,
          terminal: isTerminal,
          success: isTerminal ? true : undefined,
          data: {},
          layout: {
            type: "SingleColumnLayout",
            children: s.type === 'success' ? [
              { type: "TextBody", text: s.content || "Thank you for your submission!" },
              { type: "Footer", label: "Done", "on-click-action": footerAction }
            ] : [
              {
                type: "Form",
                name: "flow_form",
                children: [
                  ...s.fields.map(f => {
                    if (f.type === 'text_content') {
                      return { type: "TextBody", text: f.content || "Text Body" };
                    }
                    if (f.type === 'image') {
                      return { type: "Image", src: f.url || "" };
                    }
                    const base: any = {
                      type: f.type === 'text' || f.type === 'email' || f.type === 'number' ? 'TextInput' : 
                            f.type === 'radio' ? 'RadioButtonsGroup' :
                            f.type === 'checkbox' ? 'CheckboxGroup' : 'Dropdown',
                      label: f.label || "Label",
                      name: f.name || f.id,
                      required: f.required
                    };
                    if (f.placeholder && base.type === 'TextInput') {
                      base["helper-text"] = f.placeholder;
                    }
                    if (f.options && f.options.length > 0 && ['RadioButtonsGroup', 'CheckboxGroup', 'Dropdown'].includes(base.type)) {
                      base.options = f.options.map(opt => ({ 
                        id: opt.toLowerCase().replace(/[^a-z0-9_]/g, '_').substring(0, 30) || "opt", 
                        title: opt || "Option" 
                      }));
                    }
                    return base;
                  }),
                  {
                    type: "Footer",
                    label: isTerminal ? "Submit" : "Continue",
                    "on-click-action": footerAction
                  }
                ]
              }
            ]
          }
        };
      })
    };
  };

  const handleSaveFlow = async () => {
    setIsSaving(true);
    try {
      const flowData = {
        name: flowName,
        uid: user.parentId || user.uid,
        whatsappAccountId: selectedAccount?.id,
        structure: generateFlowJson(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'DRAFT',
        autoTicket: autoTicket
      };
      
      await addDoc(collection(db, 'whatsapp_flows'), flowData);
      (window as any).showToast("Flow draft saved successfully!", "success");
    } catch (err: any) {
      alert("Error saving flow: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitToMeta = async () => {
    if (!selectedAccount) {
      (window as any).showToast("Please select a WhatsApp account first.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const flowStructure = generateFlowJson();
      
      let metaFlowId = editingFlow?.metaFlowId;
      
      if (editingFlow?.id && metaFlowId) {
        // 1a. Update existing Flow on Meta via Backend
        await updateWhatsAppFlowAsset(metaFlowId, selectedAccount.id, flowStructure);
        
        // 2a. Update locally
        const flowData = {
          name: flowName,
          structure: flowStructure,
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(doc(db, 'whatsapp_flows', editingFlow.id), flowData);
        (window as any).showToast(`Flow "${flowName}" updated on Meta!`, "success");
        onSave(flowData);
      } else {
        // 1b. Create new Flow on Meta via Backend
        const metaResponse = await createWhatsAppFlow(selectedAccount.id, {
          name: flowName,
          categories: ["LEAD_GENERATION"],
          structure: flowStructure
        });

        metaFlowId = metaResponse.id;
        
        // 2b. Save locally with the real Meta ID
        const flowData = {
          name: flowName,
          uid: user.parentId || user.uid,
          whatsappAccountId: selectedAccount.id,
          structure: flowStructure,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'PENDING_APPROVAL',
          metaFlowId: metaFlowId,
          autoTicket: autoTicket
        };
        
        await addDoc(collection(db, 'whatsapp_flows'), flowData);
        (window as any).showToast(`Flow "${flowName}" submitted to Meta! ID: ${metaFlowId}`, "success");
        onSave(flowData);
      }
      onBack(); // Go back after successful submission
    } catch (err: any) {
      console.error("Meta Submission Error:", err);
      (window as any).showToast("Error submitting to Meta: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn(
      "flex flex-col bg-slate-50 dark:bg-[#0f0f13] overflow-hidden transition-all duration-300",
      isFullscreenJson ? "absolute inset-0 z-50 border-0" : "h-[calc(100vh-85px)] md:h-[calc(100vh-110px)] rounded-none border-0 md:border border-slate-200 dark:border-white/5"
    )}>
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 md:px-6 py-4 bg-white dark:bg-[#13131a] border-b border-slate-200 dark:border-white/5 gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-none transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-200" />
          </button>
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/5 mx-1 md:mx-2" />
          <div className="flex flex-col min-w-0">
            <input 
              type="text" 
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="bg-transparent text-base md:text-lg font-semibold text-slate-900 dark:text-white outline-none border-b border-transparent focus:border-blue-500 transition-colors truncate"
            />
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">WhatsApp Lead Flow Builder</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <button 
            onClick={() => { 
              if (showJsonPreview && isFullscreenJson) {
                setIsFullscreenJson(false);
              }
              setShowJsonPreview(!showJsonPreview); 
              setActiveTab('edit'); 
            }}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#1a1a24] text-slate-200 border border-white/5 rounded-none text-xs font-medium hover:bg-[#252533] transition-all"
          >
            <FileCode size={14} />
            <span className="hidden sm:inline">{showJsonPreview ? "Visual View" : "JSON Preview"}</span>
            <span className="sm:hidden">{showJsonPreview ? "Visual" : "JSON"}</span>
          </button>
          <button 
            onClick={handleSaveFlow}
            disabled={isSaving || isSubmitting}
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#1a1a24] text-slate-200 border border-white/5 rounded-none text-xs font-medium hover:bg-[#252533] transition-all disabled:opacity-50"
          >
            {isSaving ? <Plus size={14} className="animate-spin" /> : <Save size={14} />}
            <span className="hidden sm:inline">Save Draft</span>
            <span className="sm:hidden">Save</span>
          </button>
          <button 
            onClick={() => setIsPreviewVisible(!isPreviewVisible)}
            className={cn(
              "flex-shrink-0 p-2.5 rounded-none border border-white/5 transition-all hidden md:flex",
              isPreviewVisible ? "bg-blue-600 text-white" : "bg-[#1a1a24] text-slate-400"
            )}
            title={isPreviewVisible ? "Hide Preview" : "Show Preview"}
          >
            <Eye size={18} />
          </button>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-none ml-2">
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Auto Ticket</span>
            <button 
              onClick={() => setAutoTicket(!autoTicket)}
              className={cn("w-8 h-4 rounded-full relative transition-all", autoTicket ? "bg-emerald-600" : "bg-slate-300 dark:bg-white/10")}
            >
              <div className={cn("absolute top-1 w-2 h-2 bg-white rounded-full transition-all", autoTicket ? "right-1" : "left-1")} />
            </button>
          </div>
          <div className="w-px h-6 bg-white/5 mx-1 hidden md:block" />
          <button 
            onClick={handleSubmitToMeta}
            disabled={isSaving || isSubmitting}
            className="flex-shrink-0 flex items-center gap-2 px-4 md:px-6 py-2.5 bg-blue-600 text-white rounded-none text-xs font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {isSubmitting ? <Plus size={14} className="animate-spin" /> : <Play size={14} />}
            Submit
          </button>
        </div>
      </div>

      <div className={cn("flex md:hidden bg-white dark:bg-[#13131a] border-b border-slate-200 dark:border-white/5 p-2 gap-2", isFullscreenJson ? "!hidden" : "")}>
         <button 
           onClick={() => setActiveTab('edit')}
           className={cn(
             "flex-1 py-2 rounded-none text-xs font-medium transition-all",
             activeTab === 'edit' ? "bg-blue-600 text-white shadow-md" : "bg-[#1a1a24] text-slate-400 border border-white/5"
           )}
         >
           Edit Flow
         </button>
         <button 
           onClick={() => setActiveTab('preview')}
           className={cn(
             "flex-1 py-2 rounded-none text-xs font-medium transition-all",
             activeTab === 'preview' ? "bg-blue-600 text-white shadow-md" : "bg-[#1a1a24] text-slate-400 border border-white/5"
           )}
         >
           Mobile Preview
         </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        <div className={cn(
          "w-full md:w-72 shrink-0 bg-white dark:bg-[#13131a] border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 flex-col overflow-y-auto custom-scrollbar z-20 max-h-[40vh] md:max-h-none",
          activeTab === 'edit' ? "flex" : "hidden md:flex",
          isFullscreenJson ? "!hidden" : ""
        )}>
          <div className="p-4 md:p-6 space-y-6 md:space-y-8">
            {activeScreen.type === 'form' ? (
              <div>
                <button 
                  onClick={() => setIsElementsExpanded(!isElementsExpanded)}
                  className="w-full flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-2 py-2 hover:text-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Plus size={12} className="text-blue-500" />
                    <span className="uppercase tracking-widest">Add Form Elements</span>
                  </div>
                  {isElementsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <AnimatePresence>
                  {isElementsExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-4"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-2 pt-2">
                        {[
                          { type: 'text', label: 'Text Input', icon: <Type size={14} /> },
                          { type: 'number', label: 'Number Input', icon: <Hash size={14} /> },
                          { type: 'radio', label: 'Radio Buttons', icon: <CheckCircle2 size={14} /> },
                          { type: 'dropdown', label: 'Select Menu', icon: <List size={14} /> },
                          { type: 'checkbox', label: 'Checkboxes', icon: <CheckSquare size={14} /> },
                          { type: 'text_content', label: 'Plain Text', icon: <Type size={14} /> },
                          { type: 'image', label: 'Image', icon: <ImageIcon size={14} /> },
                          { type: 'video', label: 'Video', icon: <Play size={14} /> },
                          { type: 'document', label: 'Document/PDF', icon: <FileText size={14} /> },
                        ].map(el => (
                          <button 
                            key={el.type}
                            onClick={() => addField(el.type as any)}
                            className="flex flex-col md:flex-row items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded-none hover:bg-slate-100 dark:hover:bg-[#252533] transition-all group text-center md:text-left"
                          >
                            <div className="w-8 h-8 shrink-0 rounded-none bg-white dark:bg-[#13131a] flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors border border-slate-200 dark:border-white/5 shadow-sm">
                              {el.icon}
                            </div>
                            <span className="text-[10px] md:text-[11px] font-medium text-slate-700 dark:text-slate-200 leading-tight">{el.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-none">
                 <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">This is a Completion Screen. It will end the flow and show a final message to the user.</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <button 
                  onClick={() => setIsScreensExpanded(!isScreensExpanded)}
                  className="flex-1 flex items-center justify-between text-[10px] font-semibold text-slate-400 py-2 hover:text-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Layers size={12} className="text-emerald-500" />
                    <span className="uppercase tracking-widest">Flow Screens</span>
                  </div>
                  <div className="mr-4">
                    {isScreensExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </div>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => addScreen('form')}
                    title="Add Form Screen"
                    className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-none transition-colors text-blue-500"
                  >
                    <Plus size={16} />
                  </button>
                  <button 
                    onClick={() => addScreen('success')}
                    title="Add Completion Screen"
                    className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-none transition-colors text-emerald-500"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {isScreensExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-2"
                  >
                    {screens.map((screen, idx) => (
                      <button 
                        key={screen.id}
                        onClick={() => setActiveScreenId(screen.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-none transition-all group",
                          activeScreenId === screen.id 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                            : "bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                        )}
                      >
                        <span className="text-[10px] font-bold opacity-50">{idx + 1}</span>
                        <div className="flex-1 flex flex-col items-start min-w-0">
                          <span className="text-xs font-medium truncate w-full text-left">{screen.title}</span>
                          <span className="text-[8px] opacity-60 uppercase">{screen.type}</span>
                        </div>
                        <X 
                          size={14} 
                          className={cn("opacity-0 group-hover:opacity-100 transition-opacity", activeScreenId === screen.id ? "hover:text-blue-200" : "hover:text-rose-500")}
                          onClick={(e) => { e.stopPropagation(); removeScreen(screen.id); }}
                        />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className={cn(
          "flex-1 flex flex-col overflow-y-auto p-0.5 bg-slate-50 dark:bg-[#0f0f13] custom-scrollbar z-10 transition-all",
          activeTab === 'edit' ? "opacity-100" : "hidden md:flex opacity-100"
        )}>
          <AnimatePresence mode="wait">
            {showJsonPreview ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={cn(
                  "flex flex-col transition-all duration-300 h-full",
                  isFullscreenJson ? "min-h-[100%] w-full bg-[#0f0f13]" : "min-h-[60vh] md:min-h-full"
                )}
              >
                <div className="flex-1 bg-[#1e1e2d] rounded-none border border-white/5 shadow-2xl font-mono text-[11px] md:text-xs text-blue-300 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-white/5">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Flow Structure (JSON)</span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => { 
                          setShowJsonPreview(false); 
                          setIsFullscreenJson(false); 
                          setActiveTab('edit'); 
                        }} 
                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-1" 
                        title="Visual Editor"
                      >
                        <Layout size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">Visual</span>
                      </button>
                      <button className="text-blue-400 flex items-center gap-1" title="JSON View">
                        <Code size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">JSON</span>
                      </button>
                      <div className="w-[1px] h-4 bg-white/10 mx-1" />
                      <button onClick={() => setIsFullscreenJson(!isFullscreenJson)} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1" title="Toggle Fullscreen">
                        {isFullscreenJson ? <><Minimize2 size={14} /><span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">Exit</span></> : <Maximize2 size={14} />}
                      </button>
                    </div>
                  </div>
                  <textarea 
                    value={jsonInput}
                    onChange={(e) => handleJsonInputChange(e.target.value)}
                    className="flex-1 w-full p-2 bg-transparent outline-none resize-none custom-scrollbar text-emerald-400 selection:bg-emerald-500/20"
                    spellCheck={false}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={activeScreenId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full px-2 space-y-2 md:space-y-3"
              >
                <div className="bg-white dark:bg-[#13131a] p-2 md:p-4 rounded-none border border-slate-200 dark:border-white/5 shadow-sm">
                   <p className="text-[9px] font-semibold text-slate-400 mb-2">Screen Settings ({activeScreen.type})</p>
                   <input 
                      type="text" 
                      value={activeScreen.title}
                      onChange={(e) => setScreens(screens.map(s => s.id === activeScreenId ? { ...s, title: e.target.value } : s))}
                      className="text-lg md:text-xl font-bold bg-transparent outline-none border-b border-transparent focus:border-blue-500 transition-all w-full dark:text-white"
                      placeholder="Screen Title"
                   />
                </div>

                {activeScreen.type === 'form' ? (
                  <div className="space-y-3 md:space-y-4">
                    {activeScreen.fields.length === 0 ? (
                      <div className="py-12 md:py-20 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-none">
                         <Layout className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-4" />
                         <h4 className="text-xs md:text-sm font-semibold text-slate-400">No fields added to this screen</h4>
                         <p className="text-[10px] text-slate-500 mt-2 px-4">Click elements in the sidebar to start building your form.</p>
                      </div>
                    ) : (
                      activeScreen.fields.map((field) => (
                        <div key={field.id} className="bg-white dark:bg-[#13131a] p-2 md:p-4 rounded-none border border-slate-200 dark:border-white/5 shadow-sm group relative">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-3 w-full md:w-auto">
                              <div className="w-8 h-8 rounded-none bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                                {field.type === 'text' && <Type size={16} />}
                                {field.type === 'number' && <Hash size={16} />}
                                {field.type === 'email' && <Mail size={16} />}
                                {field.type === 'radio' && <CheckCircle2 size={16} />}
                                {field.type === 'dropdown' && <List size={16} />}
                                {field.type === 'checkbox' && <CheckSquare size={16} />}
                                {field.type === 'text_content' && <Type size={16} />}
                                {(field.type === 'image' || field.type === 'video' || field.type === 'document') && <ImageIcon size={16} />}
                              </div>
                              <input 
                                type="text" 
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                className="font-semibold text-sm bg-transparent outline-none border-b border-transparent focus:border-blue-500 transition-all dark:text-white w-full"
                              />
                            </div>
                            <div className="flex-1 max-w-[120px]">
                               <input 
                                 type="text" 
                                 value={field.name || ''}
                                 placeholder="System Name"
                                 onChange={(e) => updateField(field.id, { name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                 className="text-[10px] font-mono bg-slate-100 dark:bg-white/5 px-2 py-1 rounded w-full outline-none text-slate-500"
                                 title="This key will be used to save lead data (e.g. name, email, phone)"
                               />
                            </div>
                            <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
                               {field.type !== 'text_content' && field.type !== 'image' && field.type !== 'video' && field.type !== 'document' && (
                                 <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0f0f13] px-3 py-1.5 rounded-none border border-slate-100 dark:border-white/5">
                                    <span className="text-[9px] font-semibold text-slate-400">Required</span>
                                    <button 
                                      onClick={() => updateField(field.id, { required: !field.required })}
                                      className={cn("w-8 h-4 rounded-full relative transition-all", field.required ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800")}
                                    >
                                      <div className={cn("absolute top-1 w-2 h-2 bg-white rounded-full transition-all", field.required ? "right-1" : "left-1")} />
                                    </button>
                                 </div>
                               )}
                               <button 
                                  onClick={() => removeField(field.id)}
                                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-none transition-all"
                               >
                                 <Trash2 size={16} />
                               </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {(field.type === 'text' || field.type === 'number' || field.type === 'email') && (
                              <input 
                                type="text" 
                                placeholder="Placeholder text..."
                                value={field.placeholder}
                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                className="w-full p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-none text-xs outline-none focus:border-blue-500/50 dark:text-white transition-all"
                              />
                            )}

                            {field.type === 'text_content' && (
                              <textarea 
                                placeholder="Enter your text content here..."
                                value={field.content || ''}
                                onChange={(e) => updateField(field.id, { content: e.target.value })}
                                className="w-full h-24 p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-none text-xs outline-none focus:border-blue-500/50 dark:text-white transition-all resize-none"
                              />
                            )}

                            {(field.type === 'image' || field.type === 'video' || field.type === 'document') && (
                              <input 
                                type="text" 
                                placeholder={`${field.type.toUpperCase()} URL (e.g. https://example.com/image.png)`}
                                value={field.url || ''}
                                onChange={(e) => updateField(field.id, { url: e.target.value })}
                                className="w-full p-2 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-none text-xs outline-none focus:border-blue-500/50 dark:text-white transition-all"
                              />
                            )}
                            {(field.type === 'radio' || field.type === 'dropdown' || field.type === 'checkbox') && (
                              <div className="space-y-2">
                                <p className="text-[9px] font-semibold text-slate-400">Options</p>
                                <div className="flex flex-wrap gap-2">
                                  {field.options?.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-[#0f0f13] rounded-none border border-slate-100 dark:border-white/5 group/opt">
                                      <input 
                                        type="text" 
                                        value={opt}
                                        onChange={(e) => {
                                          const newOpts = [...(field.options || [])];
                                          newOpts[idx] = e.target.value;
                                          updateField(field.id, { options: newOpts });
                                        }}
                                        className="bg-transparent text-[11px] font-medium outline-none dark:text-white w-20"
                                      />
                                      <X 
                                        size={12} 
                                        className="text-slate-300 hover:text-rose-500 cursor-pointer" 
                                        onClick={() => updateField(field.id, { options: field.options?.filter((_, i) => i !== idx) })}
                                      />
                                    </div>
                                  ))}
                                  <button 
                                    onClick={() => updateField(field.id, { options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] })}
                                    className="px-3 py-2 border border-dashed border-blue-500/30 text-blue-500 rounded-none text-[11px] font-semibold hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                                  >
                                    + Add Option
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#13131a] p-6 rounded-none border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
                     <p className="text-[10px] font-semibold text-slate-400">Completion Message</p>
                     <textarea 
                        value={activeScreen.content || ''}
                        onChange={(e) => setScreens(screens.map(s => s.id === activeScreenId ? { ...s, content: e.target.value } : s))}
                        className="w-full h-32 p-4 bg-slate-50 dark:bg-[#0f0f13] border border-slate-100 dark:border-white/5 rounded-none text-sm outline-none focus:border-blue-500/50 dark:text-white transition-all resize-none"
                        placeholder="E.g. Thank you! We will get back to you soon."
                     />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => addScreen('form')}
                    className="flex-1 py-4 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-none text-slate-400 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-50/10 transition-all font-semibold text-xs flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Add Form Screen
                  </button>
                  <button 
                    onClick={() => addScreen('success')}
                    className="flex-1 py-4 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-none text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-50/10 transition-all font-semibold text-xs flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Add Success Screen
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar: Live Preview (Mobile) */}
        {isPreviewVisible && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={cn(
              "w-full md:w-[360px] bg-white dark:bg-[#13131a] border-l border-slate-200 dark:border-white/5 flex flex-col items-center justify-start px-0.5 py-2 md:px-1 md:py-4 overflow-y-auto custom-scrollbar absolute inset-0 md:relative z-30 transition-transform duration-300 md:translate-x-0",
              activeTab === 'preview' ? "translate-x-0" : "translate-x-full md:translate-x-0 hidden md:flex"
            )}
          >
               <div className="w-full py-2 mb-1 text-center hidden md:block">
                  <h3 className="text-[10px] font-semibold text-slate-400 flex items-center justify-center gap-2 uppercase tracking-[0.2em]">
                    <Smartphone size={12} className="text-emerald-500" />
                    Live Preview
                  </h3>
               </div>
               
               {/* Mock Phone Frame (Exact Style from User Snippet) */}
               <div className="w-full max-w-[280px] bg-[#e5ddd5] dark:bg-[#0b141a] rounded-[2rem] p-0 border-[8px] border-slate-900 dark:border-[#202c33] shadow-none h-fit min-h-[500px] flex flex-col relative scale-[1.18] origin-top mb-2">
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 dark:bg-[#202c33] rounded-b-xl z-20 flex items-center justify-center">
                    <div className="w-8 h-1 bg-slate-800 rounded-full"></div>
                  </div>
                  
                  {/* WhatsApp Header */}
                  <div className="bg-[#075e54] dark:bg-[#202c33] px-3 py-2 flex items-center gap-2 mt-4 relative z-10 shadow-md">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold uppercase text-slate-600">
                      {selectedAccount?.name?.charAt(0) || 'M'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[9px] font-bold flex items-center gap-1 truncate">
                        {selectedAccount?.name || 'Moorvika Jewels'}
                      </p>
                      <p className="text-[#9de1fe] dark:text-[#8696a0] text-[7px] truncate">Online</p>
                    </div>
                  </div>

                  {/* Screen Content */}
                  <div className="p-1 space-y-2 h-full overflow-y-auto bg-[url('https://chatwizs.com/assets/wa-bg-light.png')] dark:bg-none bg-repeat pt-2 pb-4 min-h-[350px]">
                     <div className="bg-white dark:bg-[#202c33] rounded-lg rounded-tl-none border border-slate-100 dark:border-white/5 p-2 max-w-[95%] relative shadow-none animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="space-y-2">
                          <h2 className="text-[12px] font-bold text-slate-800 dark:text-slate-200 leading-tight px-1">
                            {activeScreen.title}
                          </h2>
                          
                          {activeScreen.type === 'form' ? (
                            <div className="space-y-2 px-1">
                               {activeScreen.fields.map(f => (
                                 <div key={f.id} className="space-y-1">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                                      {f.label} {f.required && <span className="text-rose-500">*</span>}
                                    </label>
                                    {f.type === 'image' && (
                                    <div className="w-full aspect-video bg-slate-100 dark:bg-[#13131a] rounded-md overflow-hidden mb-2">
                                      {f.url ? (
                                        <img src={f.url} alt="Flow media" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                          <ImageIcon size={24} />
                                          <span className="text-[8px] mt-1 uppercase font-bold">Image Preview</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {f.type === 'video' && (
                                    <div className="w-full aspect-video bg-slate-900 rounded-md overflow-hidden mb-2 flex items-center justify-center text-white/50 relative">
                                      <Play size={24} />
                                      <div className="absolute bottom-2 left-2 px-1 bg-black/50 rounded text-[7px]">0:45</div>
                                    </div>
                                  )}
                                  {f.type === 'document' && (
                                    <div className="w-full p-3 bg-slate-50 dark:bg-[#13131a] border border-slate-100 dark:border-white/5 rounded-md flex items-center gap-3 mb-2">
                                      <div className="w-8 h-8 bg-rose-100 text-rose-500 rounded flex items-center justify-center">
                                        <FileText size={16} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">{f.label || 'Document.pdf'}</p>
                                        <p className="text-[8px] text-slate-500 uppercase">2.4 MB • PDF</p>
                                      </div>
                                    </div>
                                  )}
                                  {f.type === 'text_content' && (
                                    <p className="text-[10px] text-slate-700 dark:text-slate-200 leading-relaxed py-1">
                                      {f.content || 'Sample text content goes here...'}
                                    </p>
                                  )}
                                  {(f.type === 'text' || f.type === 'number' || f.type === 'email') && (
                                      <div className="w-full h-8 bg-slate-50 dark:bg-[#202c33] border border-slate-100 dark:border-white/5 rounded-none flex items-center px-2">
                                         <span className="text-[9px] text-slate-400 italic">{f.placeholder}</span>
                                      </div>
                                    )}
                                    {f.type === 'radio' && (
                                      <div className="space-y-1 py-1">
                                         {f.options?.map((opt, i) => (
                                           <div key={i} className="flex items-center gap-2">
                                              <div className="w-3 h-3 rounded-full border border-slate-200 dark:border-white/10 shrink-0" />
                                              <span className="text-[9px] text-slate-600 dark:text-slate-300">{opt}</span>
                                           </div>
                                         ))}
                                      </div>
                                    )}
                                    {f.type === 'dropdown' && (
                                      <div className="w-full h-8 bg-slate-50 dark:bg-[#202c33] border border-slate-100 dark:border-white/5 rounded-none flex items-center justify-between px-2">
                                         <span className="text-[9px] text-slate-600 dark:text-slate-300">Select...</span>
                                         <ChevronRight size={10} className="rotate-90 text-slate-400" />
                                      </div>
                                    )}
                                 </div>
                               ))}
                            </div>
                          ) : (
                            <div className="py-4 text-center space-y-2 px-1">
                               <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                  <CheckCircle2 size={20} />
                               </div>
                               <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                  {activeScreen.content || 'Your submission has been received.'}
                                </p>
                            </div>
                          )}

                          <div className="flex justify-end mt-1 items-center gap-1">
                            <span className="text-[6px] text-slate-700 dark:text-slate-200">
                              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <Check size={8} className="text-blue-500" />
                          </div>
                        </div>

                        {/* Footer Button */}
                        <div className="mt-4 pt-3 border-t border-slate-50 dark:border-white/5">
                          <button className="w-full py-2 bg-[#00a884] text-white rounded-none font-bold text-[9px] flex items-center justify-center gap-2 shadow-sm">
                              {activeScreen.type === 'success' ? 'Close' : 'Continue'}
                              <ArrowRight size={10} />
                          </button>
                        </div>
                     </div>
                  </div>

                  {/* Phone Bottom Bar */}
                  <div className="h-6 bg-slate-900 dark:bg-[#202c33] flex items-center justify-center mt-auto">
                     <div className="w-12 h-1 bg-slate-800 rounded-full" />
                  </div>
               </div>
            </motion.div>
        )}
      </div>
    </div>
  );
};
