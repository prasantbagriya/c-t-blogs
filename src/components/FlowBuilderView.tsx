import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
 ReactFlow,
 MiniMap,
 Controls,
 Background,
 useNodesState,
 useEdgesState,
 addEdge,
 Panel,
 Node,
 Edge,
 Connection,
 Handle,
 Position,
 useReactFlow,
 ReactFlowProvider,
 BaseEdge,
 EdgeLabelRenderer,
 getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
 MessageSquare,
 Zap,
 Clock,
 Split,
 Save,
 Plus,
 Trash2,
 X,
 Play,
 Settings,
 CheckCircle,
 User,
 ArrowLeft,
 BarChart3,
 Edit2,
 Globe,
 ShoppingCart,
 Layout,
 Cpu,
 Webhook as WebhookIcon,
 Filter,
 FileText,
 MousePointer2,
 List,
 HelpCircle,
 Link,
 CheckCircle2,
 UserPlus,
 ChevronLeft,
 ChevronRight,
 Sparkles,
 Layers,
 Maximize2,
 Minimize2,
 Video,
 CreditCard,
 MapPin,
 Database,
 CalendarClock,
 Check,
 ArrowRight
} from 'lucide-react';
import { Instagram, Threads } from './common/BrandIcons';

import {
 addDoc,
 updateDoc,
 deleteDoc,
 onSnapshot,
 query,
 where,
 collection,
 db,
 doc
} from '../api';

import { initialNodes, initialEdges, FLOW_TYPES } from './flow/constants';
import { MessageNode } from './flow/nodes/MessageNode';
import { TriggerNode } from './flow/nodes/TriggerNode';
import { TemplateNode } from './flow/nodes/TemplateNode';
import { FlowFormNode } from './flow/nodes/FlowFormNode';
import { WebhookNode } from './flow/nodes/WebhookNode';
import { WaitNode } from './flow/nodes/WaitNode';
import { VideoNode } from './flow/nodes/VideoNode';
import { ConditionNode } from './flow/nodes/ConditionNode';
import { MCPNode } from './flow/nodes/MCPNode';
import { HandoffNode } from './flow/nodes/HandoffNode';
import { CatalogNode } from './flow/nodes/CatalogNode';
import { PaymentNode } from './flow/nodes/PaymentNode';
import { ListNode } from './flow/nodes/ListNode';
import { GoogleSheetNode } from './flow/nodes/GoogleSheetNode';
import { ExternalApiNode } from './flow/nodes/ExternalApiNode';
import { TimeRoutingNode } from './flow/nodes/TimeRoutingNode';
import { AskLocationNode } from './flow/nodes/AskLocationNode';
import { CRMUpdateNode } from './flow/nodes/CRMUpdateNode';
import { GoogleCalendarNode } from './flow/nodes/GoogleCalendarNode';
import { GoogleDriveNode } from './flow/nodes/GoogleDriveNode';
import { YouTubeNode } from './flow/nodes/YouTubeNode';
import { DeleteButtonEdge } from './flow/edges/DeleteButtonEdge';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

const InfoIcon = ({ text }: { text: string }) => (
 <div className="group relative inline-block ml-1 align-middle">
 <HelpCircle size={10} className="text-slate-400 cursor-help hover:text-blue-500 " />
 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[8px] rounded-none opacity-0 invisible group-hover:opacity-100 group-hover:visible z-100 pointer-events-none">
 <div className="relative">
 {text}
 <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
 </div>
 </div>
 </div>
);


// Nodes and Edges extracted to separate files in src/components/flow/

const nodeTypes = {
 message: MessageNode,
 template: TemplateNode,
 flow_form: FlowFormNode,
 trigger: TriggerNode,
 webhook: WebhookNode,
 wait: WaitNode,
 condition: ConditionNode,
 mcp: MCPNode,
 handoff: HandoffNode,
 catalog: CatalogNode,
 list: ListNode,
 video: VideoNode,
 payment: PaymentNode,
 google_sheets: GoogleSheetNode,
 external_api: ExternalApiNode,
 time_routing: TimeRoutingNode,
 ask_location: AskLocationNode,
 crm_update: CRMUpdateNode,
 google_calendar: GoogleCalendarNode,
 google_drive: GoogleDriveNode,
 youtube: YouTubeNode
};

const edgeTypes = {
 default: DeleteButtonEdge,
};



const FlowBuilderContent = ({ user, platform: propPlatform = 'whatsapp', selectedAccount, onOpenWidgetSettings }: { user: any, platform?: 'whatsapp' | 'instagram' | 'widget' | 'all', selectedAccount?: any, onOpenWidgetSettings?: () => void }) => {
 // Debug: Ensure selectedAccount is captured
 const currentAccount = selectedAccount;

 const { screenToFlowPosition } = useReactFlow();
 
 const [flows, setFlows] = useState<any[]>([]);
 const [selectedFlow, setSelectedFlow] = useState<any>(null);
 const [accountMessages, setAccountMessages] = useState<any[]>([]);
 const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
 const [isToolbarOpen, setIsToolbarOpen] = useState(true);
 
 // H-7/M-9 Optimized: Memoize global analytics to prevent O(n) re-calculations on every render
 const globalStats = useMemo(() => {
 const totalMessages = flows.reduce((acc, f) => acc + (f.analytics?.messagesRecieved || 0), 0);
 const totalReplies = flows.reduce((acc, f) => acc + (f.analytics?.repliesSent || 0), 0);
 const totalHandovers = flows.reduce((acc, f) => acc + (f.analytics?.humanHandoffs || 0), 0);
 const avgCompletion = totalMessages > 0 ? Math.round((totalReplies / totalMessages) * 100) : 0;

 return [
 { label: 'Avg. Success Rate', value: `${avgCompletion}%`, icon: <CheckCircle size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
 { label: 'Total Inbound', value: totalMessages.toLocaleString(), icon: <MessageSquare size={16} />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
 { label: 'Global Handovers', value: totalHandovers.toLocaleString(), icon: <User size={16} />, color: 'text-blue-500', bg: 'bg-blue-500/10' }
 ];
 }, [flows]);
 const [view, setView] = useState<'list' | 'editor' | 'analytics' | 'selection'>('list');
 const [activePlatform, setActivePlatform] = useState<'whatsapp' | 'instagram' | 'threads' | 'website'>(
 (propPlatform as any) === 'threads' ? 'threads' : ((propPlatform as any) === 'instagram' ? 'instagram' : ((propPlatform as any) === 'website' ? 'website' : 'whatsapp'))
 );
 const [flowType, setFlowType] = useState<string | null>(null);
 const [nodes, setNodes, onNodesChange] = useNodesState([]);
 const [edges, setEdges, onEdgesChange] = useEdgesState([]);
 const [isSaving, setIsSaving] = useState(false);
 const [isFullscreen, setIsFullscreen] = useState(false);
 const [confirmDeleteFlow, setConfirmDeleteFlow] = useState<any>(null); // custom delete confirm modal
 const [allAccounts, setAllAccounts] = useState<{whatsapp: any[], instagram: any[], threads: any[], website: any[]}>({whatsapp: [], instagram: [], threads: [], website: []});
 const [tempSelectedAccounts, setTempSelectedAccounts] = useState<any[]>([]);
 const [selectionStep, setSelectionStep] = useState<'account' | 'type'>('account');
 const [showDomainList, setShowDomainList] = useState(false);

 // Sync fullscreen state with actual browser state
 useEffect(() => {
 const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
 document.addEventListener('fullscreenchange', handleFsChange);
 return () => document.removeEventListener('fullscreenchange', handleFsChange);
 }, []);

 const toggleFullscreen = () => {
 if (!document.fullscreenElement) {
 document.documentElement.requestFullscreen();
 } else {
 document.exitFullscreen();
 }
 };

 const createInitialNodes = (type: string, account?: any) => {
 const id = type === 'website_leadgen' || type === 'ecommerce_engine' || type === 'google_sheet_automation' ? 'webhook_root' : 'trigger_root';
 const nodeType = type === 'website_leadgen' || type === 'ecommerce_engine' || type === 'google_sheet_automation' ? 'webhook' : 'trigger';

 return [{
 id,
 type: nodeType,
 position: { x: 250, y: 100 },
 data: {
 id,
 userId: user.uid,
 userRole: user.role,
 parentId: user.parentId,
 whatsappAccountId: account?.platform === 'whatsapp' ? account.id : (activePlatform === 'whatsapp' ? currentAccount?.id : null),
 instagramAccountId: account?.platform === 'instagram' ? account.id : (activePlatform === 'instagram' ? currentAccount?.id : null),
 threadsAccountId: account?.platform === 'threads' ? account.id : (activePlatform === 'threads' ? currentAccount?.id : null),
 label: nodeType === 'trigger' ? 'Inbound Trigger (Logic A)' : 'Outbound Trigger (Logic B)',
 triggerType: 'Any Message',
 webhookEvent: type === 'ecommerce_engine' ? 'order_created' : type === 'google_sheet_automation' ? 'google_sheets_new_row' : 'form_submit',
 onDelete: (nodeId: string) => {
 setNodes((nds) => nds.filter((n) => n.id !== nodeId));
 setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
 },
 onChange: (key: string, val: any) => {
 setNodes((nds) => nds.map((node) => node.id === id ? { ...node, data: { ...node.data, [key]: val } } : node));
 }
 },
 }];
 };

 // Fetch all accounts for selection
 useEffect(() => {
 const constraints = [];
 if (user.role !== 'admin') {
 constraints.push(where('uid', '==', user.parentId || user.uid));
 }

 const waUnsub = onSnapshot(query(collection(db, 'whatsapp_accounts'), ...constraints), (snap) => {
 setAllAccounts(prev => ({ ...prev, whatsapp: snap.docs.map(d => ({ id: d.id, ...d.data(), platform: 'whatsapp' })) }));
 });

 const igUnsub = onSnapshot(query(collection(db, 'instagram_accounts'), ...constraints), (snap) => {
 setAllAccounts(prev => ({ ...prev, instagram: snap.docs.map(d => ({ id: d.id, ...d.data(), platform: 'instagram' })) }));
 });

 const threadsUnsub = onSnapshot(query(collection(db, 'threads_accounts'), ...constraints), (snap) => {
 setAllAccounts(prev => ({ ...prev, threads: snap.docs.map(d => ({ id: d.id, ...d.data(), platform: 'threads' })) }));
 });

 const websiteUnsub = onSnapshot(query(collection(db, 'widget_settings'), ...constraints), (snap) => {
 setAllAccounts(prev => ({ ...prev, website: snap.docs.map(d => ({ id: d.id, ...d.data(), platform: 'website' })) }));
 });

 return () => { waUnsub(); igUnsub(); threadsUnsub(); websiteUnsub(); };
 }, [user.uid, user.parentId]);

 const handleCreateNew = () => {
 setTempSelectedAccounts([]);
 setSelectionStep('account');
 setView('selection');
 };

 const handleToggleAccount = (account: any) => {
 setTempSelectedAccounts(prev => {
 const exists = prev.find(a => a.id === account.id);
 if (exists) return prev.filter(a => a.id !== account.id);
 return [...prev, account];
 });
 };

 const handleSelectType = (typeId: string) => {
 setFlowId(null);
 setSelectedFlow(null);
 setFlowType(typeId);
 setCurrentStatus('Draft');
 
 // Auto-set platform based on selected accounts
 if (tempSelectedAccounts.length > 0) {
 setActivePlatform(tempSelectedAccounts[0].platform);
 }
 
 setNodes(createInitialNodes(typeId, tempSelectedAccounts[0])); // use first for trigger context
 setEdges([]);
 setView('editor');
 };

 // Resolve the correct Firestore collection based on active platform
 const getCollectionForPlatform = (platform: string) => {
 if (platform === 'instagram') return 'chat_flows_instagram';
 if (platform === 'threads') return 'chat_flows_threads';
 if (platform === 'widget' || platform === 'website') return 'chat_flows_widget';
 return 'chat_flows_whatsapp';
 };
 const collectionName = getCollectionForPlatform(activePlatform);
 const [flowId, setFlowId] = useState<string | null>(null);
 const [currentStatus, setCurrentStatus] = useState<'Draft' | 'Active'>('Draft');

 const onConnect = useCallback(
 (params: Connection) => setEdges((eds) => addEdge(params, eds)),
 [setEdges]
 );

 const addNode = (type: string) => {
 const id = `${Date.now()}`;

 // Get center of the screen
 const position = screenToFlowPosition({
 x: window.innerWidth / 2 + 100, // Small offset from sidebar
 y: window.innerHeight / 2
 });

 const newNode: Node = {
 id,
 type,
 position,
 data: {
 id,
 userId: user.uid,
 userRole: user.role,
 parentId: user.parentId,
 whatsappAccountId: tempSelectedAccounts.find(a => a.platform === 'whatsapp')?.id || (activePlatform === 'whatsapp' ? currentAccount?.id : null),
 instagramAccountId: tempSelectedAccounts.find(a => a.platform === 'instagram')?.id || (activePlatform === 'instagram' ? currentAccount?.id : null),
 threadsAccountId: tempSelectedAccounts.find(a => a.platform === 'threads')?.id || (activePlatform === 'threads' ? currentAccount?.id : null),
 label: `${type}`,
 message: '',
 buttons: type === 'message' ? [] : undefined,
 templateName: type === 'template' ? '' : undefined,
 flowId: type === 'flow_form' ? '' : undefined,
 params: type === 'template' ? [] : undefined,
 triggerType: type === 'trigger' ? 'Any Message' : undefined,
 keywords: type === 'trigger' ? [] : undefined,
 webhookEvent: type === 'webhook' ? 'form_submit' : undefined,
 onDelete: (nodeId: string) => {
 setNodes((nds) => nds.filter((n) => n.id !== nodeId));
 setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
 },
 onChange: (key: string, val: any) => {
 setNodes((nds) =>
 nds.map((node) => {
 if (node.id === id) {
 return { ...node, data: { ...node.data, [key]: val } };
 }
 return node;
 })
 );
 },
 allFlows: flows
 },
 };
 setNodes((nds) => [...nds, newNode]);
 if ((window as any).showToast) (window as any).showToast(`Added ${type} node`, "info");
 };

 const handleStatusUpdate = async (status: 'Draft' | 'Active') => {
 setIsSaving(true);

 // Detect platform from trigger nodes
 const triggerNode = nodes.find(n => n.type === 'trigger' || n.type === 'webhook');
 const flowPlatform = triggerNode?.data?.platform || activePlatform || 'whatsapp';
 
 // Determine which collections to update
 let collectionsToUpdate = [];
 if (flowPlatform === 'all') {
 collectionsToUpdate = ['chat_flows_whatsapp', 'chat_flows_instagram', 'chat_flows_widget', 'chat_flows_threads'];
 } else {
 let targetCollection = 'chat_flows_whatsapp';
 if (flowPlatform === 'instagram') targetCollection = 'chat_flows_instagram';
 else if (flowPlatform === 'threads') targetCollection = 'chat_flows_threads';
 else if (flowPlatform === 'website') targetCollection = 'chat_flows_widget';
 collectionsToUpdate = [targetCollection];
 }

 const flowData = {
 nodes: nodes.map(n => {
 const { onDelete, onChange, onTypeChange, allFlows, ...cleanData } = n.data;
 return { ...n, data: cleanData };
 }),
 edges,
 uid: user.parentId || user.uid,
 // For multi-account support
 whatsappAccountIds: tempSelectedAccounts.filter(a => a.platform === 'whatsapp').map(a => a.id),
 instagramAccountIds: tempSelectedAccounts.filter(a => a.platform === 'instagram').map(a => a.id),
 websiteAccountIds: tempSelectedAccounts.filter(a => a.platform === 'website').map(a => a.id),
 // Keep legacy single-id for compatibility
 whatsappAccountId: tempSelectedAccounts.find(a => a.platform === 'whatsapp')?.id || (flowPlatform === 'whatsapp' ? (currentAccount?.id || null) : null),
 instagramAccountId: tempSelectedAccounts.find(a => a.platform === 'instagram')?.id || (flowPlatform === 'instagram' ? (currentAccount?.id || null) : null),
 websiteAccountId: tempSelectedAccounts.find(a => a.platform === 'website')?.id || (flowPlatform === 'website' ? (currentAccount?.id || null) : null),
 name: flowPlatform === 'instagram'
 ? `IG Flow: @${tempSelectedAccounts.find(a => a.platform === 'instagram')?.username || currentAccount?.username || 'Account'} (${flowType || 'Custom'})`
 : `Flow: ${currentAccount?.name || 'Main'} (${flowType || 'Custom'})`,
 platform: flowPlatform,
 status,
 type: flowType,
 updatedAt: new Date().toISOString()
 };

 try {
 // Update all relevant collections
 for (const coll of collectionsToUpdate) {
 if (flowId) {
 await updateDoc(`${coll}/${flowId}`, flowData);
 } else {
 const result = await addDoc(coll, flowData);
 setFlowId(result.id);
 }
 }
 
 setCurrentStatus(status);
 setActivePlatform(flowPlatform === 'all' ? activePlatform : flowPlatform as any);
 if ((window as any).showToast) {
 (window as any).showToast(`Flow ${status === 'Active' ? 'is now LIVE' : 'saved successfully'} across all platforms`, "success");
 }
 } catch (error) {
 console.error("Error updating flow:", error);
 if ((window as any).showToast) {
 (window as any).showToast("Failed to update flow", "error");
 }
 } finally {
 setIsSaving(false);
 }
 };

 // ✅ FIX: Resolve collection from the FLOW's own platform, not the current tab
 const handleDeleteFlow = async (flow: any) => {
 // Show custom modal instead of window.confirm (which auto-dismisses)
 setConfirmDeleteFlow(flow);
 };

 const confirmAndDelete = async () => {
 const flow = confirmDeleteFlow;
 if (!flow) return;
 setConfirmDeleteFlow(null);
 try {
 const targetCollection = getCollectionForPlatform(flow.platform || activePlatform);
 await deleteDoc(`${targetCollection}/${flow.id}`);
 (window as any).showToast?.("Flow deleted successfully", "success");
 } catch (e) {
 console.error(e);
 (window as any).showToast?.("Error deleting flow", "error");
 }
 };

 const startEditing = (flow: any) => {
 setFlowId(flow.id);
 setSelectedFlow(flow);
 setFlowType(flow.type || 'custom_blank');
 setCurrentStatus(flow.status || 'Draft');
 if (flow.platform) setActivePlatform(flow.platform);

 // ✅ FIX: Guard against empty/missing nodes array
 const rawNodes = Array.isArray(flow.nodes) && flow.nodes.length > 0
 ? flow.nodes
 : createInitialNodes(flow.type || 'custom_blank');

 const processedNodes = rawNodes.map((n: Node) => ({
 ...n,
 data: {
 ...n.data,
 userId: user.uid,
 userRole: user.role,
 parentId: user.parentId,
 id: n.id,
 onDelete: (nodeId: string) => {
 setNodes((nds) => nds.filter((node) => node.id !== nodeId));
 setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
 },
 onChange: (key: string, val: any) => {
 setNodes((nds) => nds.map((node) => node.id === n.id ? { ...node, data: { ...node.data, [key]: val } } : node));
 },
 allFlows: flows
 }
 }));

 setNodes(processedNodes);
 setEdges(flow.edges || []);
 setView('editor');
 };

 const openAnalytics = (flow: any) => {
 setSelectedFlow(flow);
 setView('analytics');
 };

 useEffect(() => {
 let q;
 if (activePlatform === 'whatsapp' && currentAccount) {
 q = query(collection(db, 'messages'), where('instagramAccountId', '==', currentAccount.id));
 } else {
 // Fallback: Query by user UID to catch all messages related to this user/parent
 q = query(collection(db, 'messages'), where('uid', '==', user.parentId || user.uid));
 }

 const unsubscribe = onSnapshot(q, (snapshot) => {
 const msgs = snapshot.docs.map(doc => doc.data());
 setAccountMessages(msgs);
 });
 return () => unsubscribe();
 }, [currentAccount, activePlatform, user.uid, user.parentId]);

 useEffect(() => {
 const handleAutoSave = async (e: any) => {
 await handleStatusUpdate('Draft');
 if (e.detail?.target === 'templates') {
 // Here we can trigger a parent navigation change if needed
 // For now, we'll notify the user the draft is safe
 (window as any).showToast("Flow saved as Draft. You can now create templates.", "success");
 }
 };
 window.addEventListener('flow-auto-save', handleAutoSave);
 return () => window.removeEventListener('flow-auto-save', handleAutoSave);
 }, [nodes, edges, user, flowId]);

 const displayFlows = useMemo(() => {
 let filtered = flows;
 if (activePlatform === 'whatsapp' && currentAccount) {
 filtered = filtered.filter(f => !f.whatsappAccountId || f.whatsappAccountId === currentAccount.id);
 } else if (activePlatform === 'instagram' && currentAccount) {
 filtered = filtered.filter(f => f.instagramAccountId === currentAccount.id);
 } else if (activePlatform === 'threads' && currentAccount) {
 filtered = filtered.filter(f => f.threadsAccountId === currentAccount.id);
 } else if (activePlatform === 'website' && currentAccount) {
 filtered = filtered.filter(f => f.websiteAccountId === currentAccount.id);
 }
 return filtered;
 }, [flows, activePlatform, currentAccount]);

 useEffect(() => {
 const constraints = [];
 if (user.role !== 'admin') {
 constraints.push(where('uid', '==', user.parentId || user.uid));
 }
 const q = query(collection(db, collectionName), ...constraints);
 const unsubscribe = onSnapshot(q, (snapshot) => {
 setFlows(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
 });
 return () => unsubscribe();
 }, [user.uid, user.parentId, collectionName]);

 if (view === 'selection') {
 return (
 <div className="py-2 sm:py-12 px-1 sm:px-2 w-full max-w-7xl mx-auto space-y-6 sm:space-y-10 fade-in slide-in-from-bottom-4 ">
 <div className="text-center space-y-2 sm:space-y-4">
 <button
 onClick={() => {
 if (selectionStep === 'type') setSelectionStep('account');
 else setView('list');
 }}
 className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mx-auto text-[10px] sm:text-xs font-bold uppercase tracking-widest"
 >
 <ArrowLeft size={12} /> {selectionStep === 'type' ? 'Back' : 'Cancel'}
 </button>
 
 <div className="flex items-center justify-center gap-1.5 mb-1 sm:mb-2">
 <div className={cn("w-1.5 h-1.5 rounded-none ", selectionStep === 'account' ? "bg-blue-600 w-4" : "bg-blue-200")} />
 <div className={cn("w-1.5 h-1.5 rounded-none ", selectionStep === 'type' ? "bg-blue-600 w-4" : "bg-blue-200")} />
 </div>

 <h2 className="text-xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
 {selectionStep === 'account' ? 'Select Accounts' : 'Choose Blueprint'}
 </h2>
 <p className="text-[10px] sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto px-4">
 {selectionStep === 'account' 
 ? 'Select one or more accounts for this flow.' 
 : `Deploying to ${tempSelectedAccounts.length} account(s)`}
 </p>
 </div>

 {selectionStep === 'account' ? (
 <div className="space-y-10">
 <div className="space-y-6 fade-in px-2">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-5xl mx-auto">
 {/* WhatsApp Accounts */}
 {allAccounts.whatsapp.map(acc => {
 const isSelected = tempSelectedAccounts.some(a => a.id === acc.id);
 return (
 <button
 key={acc.id}
 onClick={() => handleToggleAccount(acc)}
 className={cn(
 "group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-white dark:bg-[#16161d] border rounded-none sm:rounded-none text-left ",
 isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 dark:border-white/5"
 )}
 >
 <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-none sm:rounded-none bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 ">
 <MessageSquare size={20} className="sm:w-7 sm:h-7" />
 </div>
 <div className="min-w-0 pr-6">
 <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{acc.name}</h3>
 <div className="flex items-center gap-1 mt-0.5">
 <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[7px] sm:text-[8px] font-black rounded-none uppercase">WA</span>
 <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">{acc.phoneNumber}</span>
 </div>
 </div>
 {isSelected && (
 <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-none flex items-center justify-center text-white zoom-in-50">
 <Check size={10} className="sm:w-3 sm:h-3" />
 </div>
 )}
 </button>
 );
 })}

 {/* Instagram Accounts */}
 {allAccounts.instagram.map(acc => {
 const isSelected = tempSelectedAccounts.some(a => a.id === acc.id);
 return (
 <button
 key={acc.id}
 onClick={() => handleToggleAccount(acc)}
 className={cn(
 "group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-white dark:bg-[#16161d] border rounded-none sm:rounded-none text-left ",
 isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 dark:border-white/5"
 )}
 >
 <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-none sm:rounded-none bg-pink-500/10 flex items-center justify-center text-pink-500 shrink-0 ">
 <Instagram size={20} className="sm:w-7 sm:h-7" />
 </div>
 <div className="min-w-0 pr-6">
 <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">@{acc.username}</h3>
 <div className="flex items-center gap-1 mt-0.5">
 <span className="px-1.5 py-0.5 bg-linear-to-r from-pink-500 to-purple-600 text-white text-[7px] sm:text-[8px] font-black rounded-none uppercase">IG</span>
 <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">{acc.displayName}</span>
 </div>
 </div>
 {isSelected && (
 <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-none flex items-center justify-center text-white zoom-in-50">
 <Check size={10} className="sm:w-3 sm:h-3" />
 </div>
 )}
 </button>
 );
 })}

 {/* Threads Accounts */}
 {allAccounts.threads.map(acc => {
 const isSelected = tempSelectedAccounts.some(a => a.id === acc.id);
 return (
 <button
 key={acc.id}
 onClick={() => handleToggleAccount(acc)}
 className={cn(
 "group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-white dark:bg-[#16161d] border rounded-none sm:rounded-none text-left ",
 isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 dark:border-white/5"
 )}
 >
 <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-none sm:rounded-none bg-black flex items-center justify-center text-white shrink-0 ">
 <Threads size={20} className="sm:w-7 sm:h-7" />
 </div>
 <div className="min-w-0 pr-6">
 <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">@{acc.username}</h3>
 <div className="flex items-center gap-1 mt-0.5">
 <span className="px-1.5 py-0.5 bg-black text-white text-[7px] sm:text-[8px] font-black rounded-none uppercase">TH</span>
 <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">{acc.displayName}</span>
 </div>
 </div>
 {isSelected && (
 <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-none flex items-center justify-center text-white zoom-in-50">
 <Check size={10} className="sm:w-3 sm:h-3" />
 </div>
 )}
 </button>
 );
 })}

 {/* Website Widgets */}
 {allAccounts.website.map(acc => {
 const isSelected = tempSelectedAccounts.some(a => a.id === acc.id);
 return (
 <button
 key={acc.id}
 onClick={() => handleToggleAccount(acc)}
 className={cn(
 "group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-white dark:bg-[#16161d] border rounded-none sm:rounded-none text-left ",
 isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 dark:border-white/5"
 )}
 >
 <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-none sm:rounded-none bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0 ">
 <Globe size={20} className="sm:w-7 sm:h-7" />
 </div>
 <div className="min-w-0 pr-6">
 <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{acc.name}</h3>
 <div className="flex items-center gap-1 mt-0.5">
 <span className="px-1.5 py-0.5 bg-indigo-500 text-white text-[7px] sm:text-[8px] font-black rounded-none uppercase">Web</span>
 <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">{acc.businessName || 'Website Widget'}</span>
 </div>
 </div>
 {isSelected && (
 <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-none flex items-center justify-center text-white zoom-in-50">
 <Check size={10} className="sm:w-3 sm:h-3" />
 </div>
 )}
 </button>
 );
 })}

 </div>
 </div>

 {tempSelectedAccounts.length > 0 && (
 <div className="flex justify-center pt-4 sm:pt-8 sticky bottom-6 sm:bottom-10 z-10 slide-in-from-bottom-4 px-4">
 <button
 onClick={() => setSelectionStep('type')}
 className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-10 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-none font-bold text-xs sm:text-sm uppercase tracking-widest "
 >
 Proceed ({tempSelectedAccounts.length})
 <ArrowRight size={16} />
 </button>
 </div>
 )}

 {allAccounts.whatsapp.length === 0 && allAccounts.instagram.length === 0 && (
 <div className="col-span-full py-20 text-center space-y-4">
 <p className="text-slate-500">No accounts connected yet.</p>
 <button 
 onClick={() => setView('list')}
 className="px-6 py-2 bg-blue-600 text-white rounded-none text-xs font-bold uppercase tracking-widest"
 >
 Connect Account First
 </button>
 </div>
 )}
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 px-2">
 {FLOW_TYPES.map((type) => (
 <div className="relative group w-full" key={type.id}>
 <button
 onClick={() => handleSelectType(type.id)}
 className="w-full flex items-center justify-between p-3 sm:p-5 bg-slate-50 dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-none sm:rounded-none hover:border-blue-500 "
 >
 <div className="flex items-center gap-3 sm:gap-4">
 <div
 className="w-10 h-10 sm:w-12 sm:h-12 rounded-none flex items-center justify-center text-white "
 style={{ background: type.color }}
 >
 {React.cloneElement(type.icon as React.ReactElement, { size: 20 })}
 </div>
 <div className="text-left">
 <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{type.label}</h3>
 <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{type.desc}</p>
 </div>
 </div>
 <ArrowLeft size={14} className="rotate-180 text-slate-300 group-hover:text-blue-600 " />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 );
 }

 if (view === 'list') {
 return (
 <div className="py-2 sm:py-4 lg:py-6 px-0 sm:px-1 w-full space-y-4 sm:space-y-8 fade-in slide-in-from-bottom-4 pb-24">
 <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-0 px-2 sm:px-0">
 <div className="flex items-center bg-[#1a1a24] border border-white/5 w-full sm:w-auto overflow-hidden rounded-none">
 <button
 onClick={() => setActivePlatform('whatsapp')}
 className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider font-display ${ activePlatform === 'whatsapp' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5" }`}
 >
 WA Flows
 </button>

 <button
 onClick={() => setActivePlatform('instagram')}
 className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider font-display ${ activePlatform === 'instagram' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5" }`}
 >
 IG Flows
 </button>
 <button
 onClick={() => setActivePlatform('threads')}
 className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider font-display ${ activePlatform === 'threads' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5" }`}
 >
 Threads Flows
 </button>
 <button
 onClick={() => setActivePlatform('website')}
 className={`flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider font-display ${ activePlatform === 'website' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-white/5" }`}
 >
 Web Flows
 </button>
 </div>
 <button
 type="button"
 onClick={handleCreateNew}
 className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-10 py-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 font-display -blue-600/20 rounded-none"
 >
 <Plus size={16} /> Create New
 </button>
 </div>

 {/* Analytics Summary */}
 <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 px-2 sm:px-0">
 {globalStats.map((stat, i) => (
 <div key={i} className="p-3 sm:p-4 bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-none hover:border-blue-500/30 group ">
 <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
 <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-none flex items-center justify-center ", stat.bg, stat.color)}>
 {React.cloneElement(stat.icon as React.ReactElement, { size: 12 })}
 </div>
 <span className="text-[7px] sm:text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase truncate">{stat.label}</span>
 </div>
 <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
 </div>
 ))}
 </div>

 {/* Workflow List */}
 <div className="bg-white dark:bg-[#16161d] overflow-hidden">
 <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#1a1a24]/30 flex items-center justify-between">
 <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-widest uppercase">Active Automation List</h3>
 <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-none border border-emerald-500/20">
 <span className="w-1.5 h-1.5 rounded-none bg-emerald-500 " />
 <span className="text-[10px] font-medium uppercase tracking-widest">Real-time Sync</span>
 </div>
 </div>
 <div className="divide-y divide-slate-100 dark:divide-white/5 px-2 py-2">
 {displayFlows.length === 0 ? (
 <div className="p-20 text-center space-y-4">
 <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-none flex items-center justify-center mx-auto text-slate-300">
 <Split size={32} />
 </div>
 <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">No workflows created yet.</p>
 <button onClick={handleCreateNew} className="text-blue-500 text-xs font-bold uppercase hover:underline">Click here to start</button>
 </div>
 ) : (
 displayFlows.map((flow) => (
 <div key={flow.id} className="px-2 py-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50 dark:hover:bg-[#1a1a24] group rounded-none border border-transparent hover:border-slate-200 dark:hover:border-white/10">
 <div className="flex items-center gap-1">
 <div
 className="w-9 h-9 rounded-none flex items-center justify-center text-white "
 style={{ background: FLOW_TYPES.find(t => t.id === flow.type)?.color || '#64748b' }}
 >
 {FLOW_TYPES.find(t => t.id === flow.type)?.icon || <Split size={16} />}
 </div>
 <div>
 <div className="flex items-center gap-2">
 <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{flow.name}</p>
 <span className={`px-2 py-0.5 rounded-none text-[8px] font-medium uppercase tracking-widest ${flow.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
 {flow.status}
 </span>
 {flow.platform === 'instagram' && (flow.instagramAccountId || flow.instagramUsername) && (
 <span className="px-2 py-0.5 rounded-none text-[8px] font-bold uppercase tracking-widest bg-linear-to-r from-pink-500/10 to-purple-500/10 text-pink-500 border border-pink-500/20 flex items-center gap-1">
 <Instagram size={8} />
 {flow.instagramUsername || flow.name.match(/@([\w.]+)/)?.[1] || (flow.instagramAccountId ? flow.instagramAccountId.replace('ig_','').substring(0,8) : 'Account')}
 </span>
 )}
 {flow.platform === 'whatsapp' && flow.whatsappAccountId && (
 <span className="px-2 py-0.5 rounded-none text-[8px] font-bold uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20">
 WA
 </span>
 )}
 </div>
 <div className="flex items-center gap-3 mt-0.5">
 <span className="text-[9px] text-slate-500 font-medium tracking-widest uppercase">Hits: <strong className="text-slate-900 dark:text-white font-medium">{flow.analytics?.messagesRecieved || 0}</strong></span>
 <span className="text-[9px] text-slate-500 font-medium tracking-widest uppercase">Success: <strong className="text-slate-900 dark:text-white font-medium">{flow.analytics?.repliesSent || 0}</strong></span>
 </div>
 </div>
 </div>
 <div className="flex items-center justify-between sm:justify-end gap-2 ">
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={(e) => { e.preventDefault(); openAnalytics(flow); }}
 className="p-3 bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-blue-500 rounded-none "
 >
 <BarChart3 size={18} />
 </button>
 <button
 type="button"
 onClick={(e) => { e.preventDefault(); startEditing(flow); }}
 className="p-3 bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-blue-500 rounded-none "
 >
 <Edit2 size={18} />
 </button>
 </div>
 <button
 type="button"
 onClick={(e) => { e.preventDefault(); handleDeleteFlow(flow); }}
 className="p-3 bg-rose-500/10 text-rose-500 rounded-none "
 >
 <Trash2 size={18} />
 </button>
 </div>
 </div>
 ))
 )}
 </div>
 </div>

 {/* ── CUSTOM DELETE CONFIRMATION MODAL ─────────────────────── */}
 {confirmDeleteFlow && (
 <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in ">
 <div className="bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 rounded-none w-full max-w-sm p-6 zoom-in-95 ">
 <div className="flex items-start gap-4 mb-5">
 <div className="w-10 h-10 rounded-none bg-rose-500/10 flex items-center justify-center shrink-0">
 <Trash2 size={20} className="text-rose-500" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Delete Flow?</h3>
 <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
 <span className="font-semibold text-slate-700 dark:text-slate-300">"{confirmDeleteFlow.name || 'Untitled Flow'}"</span> will be permanently deleted. This action cannot be undone.
 </p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <button
 onClick={() => setConfirmDeleteFlow(null)}
 className="flex-1 px-4 py-2.5 rounded-none border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 "
 >
 Cancel
 </button>
 <button
 onClick={confirmAndDelete}
 className="flex-1 px-4 py-2.5 rounded-none bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-widest "
 >
 Delete
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
 }

 if (view === 'analytics' && selectedFlow) {
 const flowMessages = accountMessages.filter(m => m.handledBy === selectedFlow.id || m.flowId === selectedFlow.id);

 const stats = [
 { label: 'Inbound Requests', value: flowMessages.length, icon: <MessageSquare size={16} />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
 { label: 'AI Responses', value: flowMessages.filter(m => m.type === 'outgoing').length, icon: <Zap size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
 { label: 'Escalations', value: flowMessages.filter(m => m.status === 'handoff').length, icon: <User size={16} />, color: 'text-rose-500', bg: 'bg-rose-500/10' },
 { label: 'Engaged Users', value: new Set(flowMessages.map(m => m.from)).size, icon: <MousePointer2 size={16} />, color: 'text-amber-500', bg: 'bg-amber-500/10' }
 ];

 const hourlyActivity = Array(12).fill(0);
 flowMessages.forEach(m => {
 const hour = new Date(m.timestamp).getHours() % 12;
 hourlyActivity[hour]++;
 });
 const maxActivity = Math.max(...hourlyActivity) || 1;

 return (
 <div className="py-3 sm:py-4 lg:py-6 px-0 w-full space-y-8 fade-in ">
 <div className="flex items-center gap-4">
 <button type="button" onClick={() => setView('list')} className="p-3 bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 text-slate-500 rounded-none hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:text-white ">
 <ArrowLeft size={18} />
 </button>
 <div>
 <h2 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight uppercase">{selectedFlow.name} Insights</h2>
 <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Real-time performance metrics</p>
 </div>
 </div>

 {flowMessages.length === 0 ? (
 <div className="p-20 text-center bg-slate-50 dark:bg-[#1a1a24] rounded-none border border-dashed border-slate-200 dark:border-white/10 space-y-4">
 <BarChart3 className="mx-auto text-slate-300" size={64} />
 <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Waiting for traffic...</h3>
 <p className="text-xs text-slate-500 max-w-[250px] mx-auto italic">This workflow hasn't intercepted any events yet.</p>
 </div>
 ) : (
 <>
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 {stats.map((stat, i) => (
 <div key={i} className="p-6 bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-none group">
 <div className="flex items-center gap-3 mb-4">
 <div className={cn("w-10 h-10 rounded-none flex items-center justify-center group-hover:rotate-12", stat.bg, stat.color)}>
 {stat.icon}
 </div>
 <span className="text-[9px] font-medium text-slate-500 uppercase tracking-widest">{stat.label}</span>
 </div>
 <div className="text-3xl font-medium text-slate-900 dark:text-white">{stat.value.toLocaleString()}</div>
 </div>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 <div className="bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-none p-8">
 <h3 className="text-[10px] font-medium text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
 <div className="w-2 h-2 rounded-none bg-blue-500 " />
 Interaction Density (12h)
 </h3>
 <div className="h-48 flex items-end gap-3 px-2">
 {hourlyActivity.map((count, i) => (
 <div key={i} className="flex-1 bg-blue-500/10 rounded-none group relative cursor-pointer hover:bg-blue-500/40 " style={{ height: `${(count / maxActivity) * 100}%` }}>
 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-3 py-1.5 rounded-none opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 ">
 {count} Events
 </div>
 </div>
 ))}
 </div>
 <div className="flex justify-between mt-6 text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
 <span>Morning</span>
 <span>Afternoon</span>
 <span>Evening</span>
 </div>
 </div>

 <div className="bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-none p-8 flex flex-col">
 <h3 className="text-[10px] font-medium text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
 <Play size={16} className="text-emerald-500" />
 Live Activity Stream
 </h3>
 <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-6 custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
 {flowMessages.slice(-8).reverse().map((msg, i) => (
 <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#1a1a24] border border-slate-100 dark:border-white/5 hover:border-blue-500/30 rounded-none">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-none bg-white dark:bg-[#16161d] flex items-center justify-center font-medium text-xs text-blue-500 border border-slate-100 dark:border-white/5">
 {msg.from?.slice(0, 2).toUpperCase() || 'CU'}
 </div>
 <div>
 <p className="text-[11px] font-medium text-slate-900 dark:text-white">{msg.from || 'End User'}</p>
 <p className="text-[9px] text-slate-500 font-medium uppercase tracking-tight truncate max-w-[150px]">{msg.text || 'Action Triggered'}</p>
 </div>
 </div>
 <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </>
 )}
 </div>
 );
 }

 return (
 <div
 className={cn(
 "flex flex-col bg-[#f8fafc] dark:bg-[#0a0a0f] font-sans ",
 isFullscreen
 ? "fixed inset-0 z-100 m-0 rounded-none w-screen h-screen"
 : "relative"
 )}
 style={{
 height: isFullscreen ? '100vh' : '100%',
 maxHeight: isFullscreen ? '100vh' : '100%',
 overflowY: view === 'builder' ? 'hidden' : 'auto',
 overflowX: 'hidden'
 }}
 >

 {/* ── MOBILE SIDEBAR OVERLAY ───────────────────────────── */}
 {isToolbarOpen && (
 <div
 className="fixed inset-0 bg-black/50 z-40 lg:hidden"
 onClick={() => setIsToolbarOpen(false)}
 />
 )}

 {/* ── TOOLBAR ─────────────────────────────────────────── */}
 <div className={cn(
 "h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#13131a] z-30 shrink-0",
 isFullscreen && "hidden"
 )}>
 <div className="flex items-center gap-2 sm:gap-4 min-w-0">
 <button
 type="button"
 onClick={() => setView('list')}
 className="w-9 h-9 sm:w-10 sm:h-10 rounded-none bg-slate-50 dark:bg-[#1a1a24] flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-[#252533] border border-slate-100 dark:border-white/5 shrink-0"
 >
 <ArrowLeft size={16} />
 </button>
 <div className="flex flex-col min-w-0">
 <div className="flex items-center gap-2">
 <h2 className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white uppercase tracking-wider truncate max-w-[120px] sm:max-w-none">{selectedFlow?.name || 'Untitled'}</h2>
 <span className={`shrink-0 text-[8px] font-medium uppercase px-2 py-0.5 rounded-none border ${currentStatus === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-100 dark:bg-[#1a1a24] text-slate-500 border-slate-200 dark:border-white/10' }`}>
 {currentStatus}
 </span>
 </div>
 <span className="hidden sm:block text-[9px] font-medium text-blue-500 uppercase tracking-widest truncate">
 {FLOW_TYPES.find(t => t.id === flowType)?.label || 'Custom'}
 </span>
 </div>
 </div>

 <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
 {/* Settings icon — opens sidebar on mobile */}
 <button
 type="button"
 onClick={(e) => { e.preventDefault(); setIsToolbarOpen(!isToolbarOpen); }}
 className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-500 bg-slate-50 dark:bg-[#1a1a24] border border-slate-200 dark:border-white/5 rounded-none hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 "
 title="Node Panel"
 >
 <Settings size={16} />
 </button>
 {/* Save Draft — icon only on mobile */}
 <button
 type="button"
 onClick={(e) => { e.preventDefault(); handleStatusUpdate('Draft'); }}
 disabled={isSaving}
 className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white dark:bg-[#1a1a24] text-slate-600 dark:text-slate-200 rounded-none font-medium text-xs hover:bg-slate-50 dark:hover:bg-[#252533] disabled:opacity-50 border border-slate-200 dark:border-white/10"
 >
 <Save size={14} />
 <span className="hidden sm:inline">Save Draft</span>
 </button>
 {/* Deploy — icon only on mobile */}
 <button
 type="button"
 onClick={(e) => { e.preventDefault(); handleStatusUpdate('Active'); }}
 disabled={isSaving}
 className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-none font-medium text-xs hover:bg-blue-700 disabled:opacity-50"
 >
 <Play size={14} />
 <span className="hidden sm:inline">Deploy Live</span>
 </button>
 </div>
 </div>

 <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
 {/* ── SIDEBAR ─────────────────────────────────────────
 Desktop: always visible, collapsible
 Mobile: fixed slide-in drawer from left, triggered by Settings icon
 ──────────────────────────────────────────────────── */}
 <aside
 className={cn(
 "bg-white dark:bg-[#13131a] border-r border-slate-200 dark:border-white/5 flex flex-col shrink-0 overflow-hidden",
 // Desktop styles
 "lg:relative lg:translate-x-0",
 isSidebarCollapsed ? "lg:w-20" : "lg:w-72",
 // Mobile styles — fixed drawer
 "fixed top-0 left-0 h-full z-50 w-[300px] lg:static",
 isToolbarOpen ? "translate-x-0 " : "-translate-x-full lg:translate-x-0"
 )}
 style={{ height: '100%' }}
 >
 {/* Collapse Toggle — Desktop Only */}
 <button
 onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
 className="hidden lg:flex absolute -right-3 top-10 w-6 h-6 bg-white dark:bg-[#1a1a24] border border-slate-200 dark:border-white/10 rounded-none items-center justify-center text-slate-500 hover:text-blue-500 z-50 "
 >
 {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
 </button>

 {/* Mobile Drawer Header */}
 <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5 shrink-0 lg:hidden">
 <div className="flex items-center gap-2">
 <div className="w-7 h-7 bg-blue-600 rounded-none flex items-center justify-center">
 <Settings size={14} className="text-white" />
 </div>
 <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Node Panel</h3>
 </div>
 <button
 type="button"
 onClick={() => setIsToolbarOpen(false)}
 className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-white/5 rounded-none "
 >
 <X size={16} />
 </button>
 </div>

 <div className={cn(
 "flex-1 overflow-y-auto min-h-0 p-6 space-y-8 custom-scrollbar",
 isSidebarCollapsed && "p-4 space-y-6 flex flex-col items-center"
 )} style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', display: 'flex', flexDirection: 'column' }}>
 {/* Category: Triggers */}
 <div className={cn("space-y-3 w-full", isSidebarCollapsed && "flex flex-col items-center")}>
 {!isSidebarCollapsed ? (
 <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
 <Zap size={10} /> Triggers
 </h3>
 ) : (
 <div className="w-8 h-px bg-slate-200 dark:bg-white/10" />
 )}
 <div className="grid grid-cols-1 gap-2">
 {[
 { id: 'trigger', label: 'Inbound Message', sub: 'Keywords/Any', icon: <MessageSquare />, color: 'bg-amber-50 text-amber-600' },
 { id: 'webhook', label: 'External Hook', sub: 'API/Web Events', icon: <WebhookIcon />, color: 'bg-cyan-50 text-cyan-600' }
 ].map(node => (
 <button
 key={node.id}
 onClick={() => addNode(node.id)}
 className={cn(
 "group w-full flex items-center gap-3 p-3 bg-white dark:bg-[#1a1a24] border border-slate-100 dark:border-white/5 rounded-none hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 text-left",
 isSidebarCollapsed && "justify-center p-4"
 )}
 >
 <div className={cn("w-8 h-8 rounded-none flex items-center justify-center shrink-0", node.color)}>
 {React.cloneElement(node.icon as React.ReactElement, { size: 16 })}
 </div>
 {!isSidebarCollapsed && (
 <div className="flex flex-col">
 <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">{node.label}</span>
 <span className="text-[8px] text-slate-400 font-medium truncate w-[140px]">{node.sub}</span>
 </div>
 )}
 </button>
 ))}
 </div>
 </div>

 {/* Category: Actions */}
 <div className={cn("space-y-3 w-full", isSidebarCollapsed && "flex flex-col items-center")}>
 {!isSidebarCollapsed ? (
 <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
 <Play size={10} className="text-blue-500" /> Actions
 </h3>
 ) : (
 <div className="w-8 h-px bg-slate-200 dark:bg-white/10" />
 )}
 <div className="grid grid-cols-1 gap-2 w-full">
 {[
 { id: 'message', label: 'Send Message', sub: 'Buttons/Media', icon: <Plus />, color: 'bg-blue-50 text-blue-600' },
 { id: 'video', label: 'Send Video', sub: 'MP4 / Direct Link', icon: <Video />, color: 'bg-blue-50 text-indigo-500' },
 { id: 'list', label: 'List Options', sub: 'Interactive Menu', icon: <List />, color: 'bg-blue-50 text-blue-400' },
 { id: 'template', label: 'Meta Template', sub: 'Policy Approved', icon: <FileText />, color: 'bg-emerald-50 text-emerald-600' },
 { id: 'flow_form', label: 'Interactive Flow (Omnichannel)', sub: 'Forms for WA & Widget', icon: <Sparkles />, color: 'bg-emerald-50 text-emerald-500' },
 { id: 'catalog', label: 'Product Catalog', sub: 'E-commerce Shop', icon: <ShoppingCart />, color: 'bg-orange-50 text-orange-600' },
 { id: 'ask_location', label: 'Ask Location', sub: 'Capture User Location', icon: <MapPin />, color: 'bg-rose-50 text-rose-500' }
 ].map(node => (
 <button
 key={node.id}
 onClick={() => addNode(node.id)}
 className={cn(
 "group w-full flex items-center gap-3 p-3 bg-white dark:bg-[#1a1a24] border border-slate-100 dark:border-white/5 rounded-none hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 text-left",
 isSidebarCollapsed && "justify-center p-4"
 )}
 >
 <div className={cn("w-8 h-8 rounded-none flex items-center justify-center shrink-0 ", node.color)}>
 {React.cloneElement(node.icon as React.ReactElement, { size: 16 })}
 </div>
 {!isSidebarCollapsed && (
 <div className="flex flex-col overflow-hidden">
 <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight truncate">{node.label}</span>
 <span className="text-[8px] text-slate-400 font-medium truncate w-[140px]">{node.sub}</span>
 </div>
 )}
 </button>
 ))}
 </div>
 </div>

 {/* Category: Payments */}
 <div className={cn("space-y-3 w-full", isSidebarCollapsed && "flex flex-col items-center")}>
 {!isSidebarCollapsed ? (
 <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
 <CreditCard size={10} className="text-blue-500" /> Payments
 </h3>
 ) : (
 <div className="w-8 h-px bg-slate-200 dark:bg-white/10" />
 )}
 <div className="grid grid-cols-1 gap-2 w-full">
 {[
 { id: 'payment', label: 'Razorpay Payment', sub: 'In-chat Checkout', icon: <CreditCard />, color: 'bg-blue-50 text-blue-600' }
 ].map(node => (
 <button
 key={node.id}
 onClick={() => addNode(node.id)}
 className={cn(
 "group w-full flex items-center gap-3 p-3 bg-white dark:bg-[#1a1a24] border border-slate-100 dark:border-white/5 rounded-none hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 text-left",
 isSidebarCollapsed && "justify-center p-4"
 )}
 >
 <div className={cn("w-8 h-8 rounded-none flex items-center justify-center shrink-0 ", node.color)}>
 {React.cloneElement(node.icon as React.ReactElement, { size: 16 })}
 </div>
 {!isSidebarCollapsed && (
 <div className="flex flex-col overflow-hidden">
 <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight truncate">{node.label}</span>
 <span className="text-[8px] text-slate-400 font-medium truncate w-[140px]">{node.sub}</span>
 </div>
 )}
 </button>
 ))}
 </div>
 </div>

 {/* Category: Logic & AI */}
 <div className={cn("space-y-3 w-full", isSidebarCollapsed && "flex flex-col items-center")}>
 {!isSidebarCollapsed ? (
 <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
 <Split size={10} className="text-purple-500" /> Logic & AI
 </h3>
 ) : (
 <div className="w-8 h-px bg-slate-200 dark:bg-white/10" />
 )}
 <div className="grid grid-cols-1 gap-2 w-full">
 {[
 { id: 'condition', label: 'Smart Filter', sub: 'IF / ELSE Branch', icon: <Filter />, color: 'bg-purple-50 text-purple-600' },
 { id: 'time_routing', label: 'Business Hours', sub: 'Time-based Routing', icon: <CalendarClock />, color: 'bg-amber-50 text-amber-600' },
 { id: 'handoff', label: 'Connect Agent', sub: 'Human-in-Loop', icon: <UserPlus />, color: 'bg-rose-50 text-rose-600' },
 { id: 'mcp', label: 'AI Action (MCP)', sub: 'Database/API', icon: <Cpu />, color: 'bg-indigo-50 text-indigo-600' },
 { id: 'wait', label: 'Time Delay', sub: 'Minutes/Hours', icon: <Clock />, color: 'bg-slate-100 text-slate-600' }
 ].map(node => (
 <button
 key={node.id}
 onClick={() => addNode(node.id)}
 className={cn(
 "group w-full flex items-center gap-3 p-3 bg-white dark:bg-[#1a1a24] border border-slate-100 dark:border-white/5 rounded-none hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 text-left",
 isSidebarCollapsed && "justify-center p-4"
 )}
 >
 <div className={cn("w-8 h-8 rounded-none flex items-center justify-center shrink-0 ", node.color)}>
 {React.cloneElement(node.icon as React.ReactElement, { size: 16 })}
 </div>
 {!isSidebarCollapsed && (
 <div className="flex flex-col overflow-hidden">
 <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight truncate">{node.label}</span>
 <span className="text-[8px] text-slate-400 font-medium truncate w-[140px]">{node.sub}</span>
 </div>
 )}
 </button>
 ))}
 </div>
 </div>



 {/* Category: Integrations */}
 <div className={cn("space-y-3 w-full", isSidebarCollapsed && "flex flex-col items-center")}>
 {!isSidebarCollapsed ? (
 <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
 <Database size={10} className="text-cyan-500" /> Integrations
 </h3>
 ) : (
 <div className="w-8 h-px bg-slate-200 dark:bg-white/10" />
 )}
 <div className="grid grid-cols-1 gap-2 w-full">
 {[
 { id: 'external_api', label: 'External API', sub: 'Custom HTTP Request', icon: <Globe />, color: 'bg-cyan-50 text-cyan-600' },
 { id: 'crm_update', label: 'CRM Update', sub: 'Sync to HubSpot/Zoho', icon: <Database />, color: 'bg-purple-50 text-purple-600' }
 ].map(node => (
 <button
 key={node.id}
 onClick={() => addNode(node.id)}
 className={cn(
 "group w-full flex items-center gap-3 p-3 bg-white dark:bg-[#1a1a24] border border-slate-100 dark:border-white/5 rounded-none hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 text-left",
 isSidebarCollapsed && "justify-center p-4"
 )}
 >
 <div className={cn("w-8 h-8 rounded-none flex items-center justify-center shrink-0 ", node.color)}>
 {React.cloneElement(node.icon as React.ReactElement, { size: 16 })}
 </div>
 {!isSidebarCollapsed && (
 <div className="flex flex-col overflow-hidden">
 <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight truncate">{node.label}</span>
 <span className="text-[8px] text-slate-400 font-medium truncate w-[140px]">{node.sub}</span>
 </div>
 )}
 </button>
 ))}
 </div>
 </div>

 {/* Category: Support */}
 <div className={cn("space-y-3 w-full", isSidebarCollapsed && "flex flex-col items-center")}>
 {!isSidebarCollapsed ? (
 <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
 <User size={10} className="text-rose-500" /> Support
 </h3>
 ) : (
 <div className="w-8 h-px bg-slate-200 dark:bg-white/10" />
 )}
 <div className="grid grid-cols-1 gap-2 w-full">
 {[
 { id: 'handoff', label: 'Human Handoff', sub: 'Escalate to Agent', icon: <User />, color: 'bg-rose-50 text-rose-600' }
 ].map(node => (
 <button
 key={node.id}
 onClick={() => addNode(node.id)}
 className={cn(
 "group w-full flex items-center gap-3 p-3 bg-white dark:bg-[#1a1a24] border border-slate-100 dark:border-white/5 rounded-none hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 text-left",
 isSidebarCollapsed && "justify-center p-4"
 )}
 >
 <div className={cn("w-8 h-8 rounded-none flex items-center justify-center shrink-0 ", node.color)}>
 {React.cloneElement(node.icon as React.ReactElement, { size: 16 })}
 </div>
 {!isSidebarCollapsed && (
 <div className="flex flex-col overflow-hidden">
 <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight truncate">{node.label}</span>
 <span className="text-[8px] text-slate-400 font-medium truncate w-[140px]">{node.sub}</span>
 </div>
 )}
 </button>
 ))}
 </div>
 </div>

 {/* Category: Utilities */}
 <div className={cn("space-y-3 w-full", isSidebarCollapsed && "flex flex-col items-center")}>
 {!isSidebarCollapsed ? (
 <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
 <Cpu size={10} className="text-emerald-500" /> Utilities
 </h3>
 ) : (
 <div className="w-8 h-px bg-slate-200 dark:bg-white/10" />
 )}
 <div className="grid grid-cols-1 gap-2 w-full">
 {[
 { id: 'google_sheets', label: 'Google Sheets', sub: 'Append Row to Sheet', icon: <FileText />, color: 'bg-emerald-50 text-emerald-600' },
 { id: 'google_calendar', label: 'Google Calendar', sub: 'Create/Find Events', icon: <CalendarClock />, color: 'bg-blue-50 text-blue-600' },
 { id: 'google_drive', label: 'Google Drive', sub: 'Upload Files', icon: <Database />, color: 'bg-indigo-50 text-indigo-600' },
 { id: 'youtube', label: 'YouTube API', sub: 'Upload Videos', icon: <Video />, color: 'bg-red-50 text-red-600' },
 { id: 'external_api', label: 'External API', sub: 'Notify Their Platform', icon: <Globe />, color: 'bg-cyan-50 text-cyan-600' }
 ].map(node => (
 <button
 key={node.id}
 onClick={() => addNode(node.id)}
 className={cn(
 "group w-full flex items-center gap-3 p-3 bg-white dark:bg-[#1a1a24] border border-slate-100 dark:border-white/5 rounded-none hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 text-left",
 isSidebarCollapsed && "justify-center p-4"
 )}
 >
 <div className={cn("w-8 h-8 rounded-none flex items-center justify-center shrink-0 ", node.color)}>
 {React.cloneElement(node.icon as React.ReactElement, { size: 16 })}
 </div>
 {!isSidebarCollapsed && (
 <div className="flex flex-col overflow-hidden">
 <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight truncate">{node.label}</span>
 <span className="text-[8px] text-slate-400 font-medium truncate w-[140px]">{node.sub}</span>
 </div>
 )}
 </button>
 ))}
 </div>
 </div>
 </div>
 </aside>

 <div className="flex-1 relative w-full h-full min-h-0" style={{
 background: document.documentElement.classList.contains('dark') ? '#07070a' : '#f1f5f9'
 }}>
 <ReactFlow
 style={{ width: '100%', height: '100%' }}
 nodes={nodes}
 edges={edges}
 onNodesChange={onNodesChange}
 onEdgesChange={onEdgesChange}
 onConnect={onConnect}
 nodeTypes={nodeTypes}
 edgeTypes={edgeTypes}
 defaultEdgeOptions={{
 type: 'default',
 animated: true,
 style: {
 stroke: document.documentElement.classList.contains('dark') ? 'rgba(99, 102, 241, 0.4)' : 'rgba(59, 130, 246, 0.4)',
 strokeWidth: 2,
 filter: 'drop-(0 0 5px rgba(99, 102, 241, 0.1))'
 },
 markerEnd: {
 type: 'arrowclosed',
 width: 15,
 height: 15,
 color: document.documentElement.classList.contains('dark') ? 'rgba(99, 102, 241, 0.6)' : 'rgba(59, 130, 246, 0.6)',
 },
 }}
 fitView
 fitViewOptions={{ padding: 0.2 }}
 panOnScroll={false}
 selectionOnDrag={false}
 zoomOnScroll={true}
 zoomOnPinch={true}
 panOnDrag={true}
 >
 <Background
 color={document.documentElement.classList.contains('dark') ? '#1e293b' : '#cbd5e1'}
 gap={25}
 size={2}
 variant="dots"
 className="opacity-50"
 />
 <Controls
 className="bg-white! dark:bg-[#1a1a24]! border-slate-200! dark:border-white/10! rounded-none! overflow-hidden"
 style={{ bottom: '80px' }}
 />
 {/* MiniMap — hidden on mobile to save space */}
 <MiniMap
 className="rounded-none! border-slate-200! dark:border-white/10! bg-white/80! dark:bg-[#13131a]/80! backdrop-blur-xl! hidden sm:block!"
 nodeColor={(n) => {
 if (n.type === 'trigger') return '#f59e0b';
 if (n.type === 'message') return '#3b82f6';
 if (n.type === 'template') return '#10b981';
 if (n.type === 'condition') return '#a855f7';
 if (n.type === 'webhook') return '#06b6d4';
 return '#64748b';
 }}
 maskColor="rgba(0, 0, 0, 0.1)"
 />
 {/* Status panel — moved to top-right */}
 <Panel position="top-right" className="bg-white/70 dark:bg-[#13131a]/70 backdrop-blur-md px-2.5 py-1 rounded-none border border-slate-200/50 dark:border-white/5 flex items-center gap-3 mt-16 mr-2">
 <div className="flex items-center gap-1.5">
 <div className="w-1 h-1 rounded-none bg-blue-500/50" />
 <span className="text-[8px] font-normal text-slate-400 dark:text-slate-500 hidden sm:inline">Editor v2.4</span>
 </div>
 <div className="flex items-center gap-1.5 sm:border-l sm:border-slate-200/30 sm:dark:border-white/5 sm:pl-3">
 <span className="text-[8px] font-normal text-slate-400 dark:text-slate-500">Nodes: {nodes.length}</span>
 </div>
 <button
 onClick={toggleFullscreen}
 className="ml-2 p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-none "
 title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
 >
 {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
 </button>
 </Panel>

 {/* ── MOBILE BOTTOM ACTION BAR ─────────────────────── */}
 <Panel position="bottom-center" className="sm:hidden flex items-center gap-2 bg-white dark:bg-[#13131a] border border-slate-200 dark:border-white/10 rounded-none px-4 py-2 mb-2">
 <button
 type="button"
 onClick={() => setIsToolbarOpen(true)}
 className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 rounded-none text-xs font-medium"
 >
 <Settings size={14} /> Nodes
 </button>
 <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
 <button
 type="button"
 onClick={(e) => { e.preventDefault(); handleStatusUpdate('Draft'); }}
 disabled={isSaving}
 className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-white/10 rounded-none text-xs font-medium text-slate-600 dark:text-slate-300"
 >
 <Save size={14} /> Draft
 </button>
 <button
 type="button"
 onClick={(e) => { e.preventDefault(); handleStatusUpdate('Active'); }}
 disabled={isSaving}
 className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-none text-xs font-bold"
 >
 <Play size={14} /> Deploy
 </button>
 </Panel>
 </ReactFlow>
 </div>
 </div>
 </div>
 );
};

export const FlowBuilderView = (props: any) => (
 <ReactFlowProvider>
 <FlowBuilderContent {...props} />
 </ReactFlowProvider>
);
