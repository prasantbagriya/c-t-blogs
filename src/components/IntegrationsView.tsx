import React, { useState, useEffect } from 'react';
import { connectInstagramWithFacebook } from '../api';
import { 
  ShoppingBag, 
  Share2, 
  FileText, 
  Zap,
  CreditCard,
  Layout,
  Search,
  Filter,
  Globe
} from 'lucide-react';
import { Threads } from './common/BrandIcons';
import { db, collection, doc, query, where, onSnapshot, addDoc, updateDoc, API_URL } from '../api';

// Modular Components
import { RazorpayDashboard } from '@/src/components/integrations/RazorpayDashboard';
import { ConnectionsTab } from '@/src/components/integrations/ConnectionsTab';
import { AutomationsTab } from '@/src/components/integrations/AutomationsTab';
import { PaymentsTab } from '@/src/components/integrations/PaymentsTab';
import { IntegrationModals } from '@/src/components/integrations/IntegrationModals';

const PLATFORMS = [
  { id: 'widget', name: 'Website Widget', icon: <Globe />, color: '#6366f1', desc: 'Create a customizable chat widget for your website.' },
  { id: 'shopify', name: 'Shopify', icon: <ShoppingBag />, color: '#95bf47', desc: 'Sync products, orders, and automate notifications.' },
  { id: 'meta', name: 'Meta / Facebook', icon: <Share2 />, color: '#0668E1', desc: 'Link your business pages and ad accounts.' },
  { id: 'threads', name: 'Threads', icon: <Threads size={16} />, color: '#000000', desc: 'Publish threads and analyze engagement.' },
  { id: 'razorpay', name: 'Razorpay', icon: <CreditCard />, color: '#3395FF', desc: 'Accept payments directly in WhatsApp and Widget.' },
  { id: 'google_workspace', name: 'Google Workspace', icon: <Globe />, color: '#4285F4', desc: 'Login with Google to connect Drive, Calendar, YouTube, and Sheets.' },
  { id: 'google_sheets', name: 'Google Sheets', icon: <FileText />, color: '#0F9D58', desc: 'Sync leads and payments to your spreadsheets.' },
  { id: 'google_sheet_automation', name: 'Google Sheet Automation', icon: <FileText />, color: '#0F9D58', desc: 'Trigger flows when a new row is added to your sheet.' },
  { id: 'custom_blank', name: 'Custom (Blank Canvas)', icon: <Layout />, color: '#64748b', desc: 'Full freedom with all nodes and MCP connectivity.' },
  { id: 'custom', name: 'Custom Webhook', icon: <Zap />, color: '#f59e0b', desc: 'Connect any external system via API.' }
];

export function IntegrationsView({ user, showToast, onNavigate }: { user: any, showToast: (m: string, t: any) => void, onNavigate?: (tab: string) => void }) {
  const [activeTab, setActiveTab] = useState<'connections' | 'automations' | 'payments'>('connections');
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [razorpaySettings, setRazorpaySettings] = useState<any>(null);
  const [showRazorpayDashboard, setShowRazorpayDashboard] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  
  const [formData, setFormData] = useState<any>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const uidFilter = user.role === 'admin' ? [] : [where('uid', '==', user.parentId || user.uid)];

    const unsubShopify = onSnapshot(query(collection(db, 'shopify_settings'), ...uidFilter), (snap) => {
      const shopifyCons = snap.docs.map(d => ({ id: d.id, platform: 'shopify', ...d.data() }));
      setConnections(prev => [...prev.filter(c => c.platform !== 'shopify'), ...shopifyCons]);
    });

    const unsubRazorpay = onSnapshot(query(collection(db, 'razorpay_settings'), ...uidFilter), (snap) => {
      const razorpayCons = snap.docs.map(d => ({ id: d.id, platform: 'razorpay', ...d.data() }));
      setConnections(prev => [...prev.filter(c => c.platform !== 'razorpay'), ...razorpayCons]);
      if (!snap.empty) setRazorpaySettings({ id: snap.docs[0].id, ...snap.docs[0].data() });
      else setRazorpaySettings(null);
    });

    const unsubGoogle = onSnapshot(query(collection(db, 'google_settings'), ...uidFilter), (snap) => {
      const googleCons = snap.docs.map(d => ({ id: d.id, platform: 'google_sheets', ...d.data() }));
      setConnections(prev => [...prev.filter(c => c.platform !== 'google_sheets'), ...googleCons]);
    });

    const unsubGoogleWorkspace = onSnapshot(query(collection(db, 'google_workspace_accounts'), ...uidFilter), (snap) => {
      const workspaceCons = snap.docs.map(d => ({ id: d.id, platform: 'google_workspace', ...d.data() }));
      setConnections(prev => [...prev.filter(c => c.platform !== 'google_workspace'), ...workspaceCons]);
    });

    const unsubA = onSnapshot(query(collection(db, 'automations'), ...uidFilter), (snap) => {
      setAutomations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubT = onSnapshot(query(collection(db, 'templates'), ...uidFilter), (snap) => {
      setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubP = onSnapshot(query(collection(db, 'payments'), ...uidFilter), (snap) => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });

    const unsubIG = onSnapshot(query(collection(db, 'instagram_accounts'), ...uidFilter), (snap) => {
      const igCons = snap.docs.map(d => ({ id: d.id, platform: 'meta', ...d.data() }));
      setConnections(prev => [...prev.filter(c => c.platform !== 'meta'), ...igCons]);
    });

    const unsubThreads = onSnapshot(query(collection(db, 'threads_accounts'), ...uidFilter), (snap) => {
      const threadsCons = snap.docs.map(d => ({ id: d.id, platform: 'threads', ...d.data() }));
      setConnections(prev => [...prev.filter(c => c.platform !== 'threads'), ...threadsCons]);
    });

    const unsubWidgets = onSnapshot(query(collection(db, 'widget_settings'), ...uidFilter), (snap) => {
      const widgetCons = snap.docs.map(d => ({ id: d.id, platform: 'widget', ...d.data() }));
      setConnections(prev => [...prev.filter(c => c.platform !== 'widget'), ...widgetCons]);
    });

    return () => { 
      unsubShopify(); unsubRazorpay(); unsubGoogle(); unsubGoogleWorkspace(); unsubA(); unsubT(); unsubP(); unsubIG(); unsubThreads(); unsubWidgets();
    };
  }, [user.uid, user.parentId, user.role]);

  const handleConnect = async () => {
    try {
      if (selectedPlatform.id === 'shopify') {
        let shop = (formData.shopName || '').toLowerCase().replace('https://', '').replace('http://', '').split('/')[0].trim();
        if (!shop) return showToast('Please enter your shop name', 'error');
        if (shop.includes('@')) return showToast('Invalid Shop Name.', 'error');
        if (!shop.includes('.myshopify.com')) shop += '.myshopify.com';

        if (formData.method === 'manual') {
          if (!formData.accessToken) return showToast('Access Token required', 'error');
          const res = await fetch('/shopify-login/manual-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shop, accessToken: formData.accessToken, apiKey: formData.apiKey, uid: user.uid })
          });
          if (res.ok) { showToast('Shopify linked!', 'success'); setSelectedPlatform(null); }
          else throw new Error('Manual link failed');
          return;
        }

        const authUrl = `${window.location.origin}/shopify-login/auth?shop=${shop}&uid=${user.uid}`;
        window.open(authUrl, 'ShopifyAuth', 'width=600,height=800');
        const handleMessage = (event: MessageEvent) => {
          if (event.data === 'shopify-connected') {
            showToast('Shopify connected!', 'success');
            setSelectedPlatform(null);
            window.removeEventListener('message', handleMessage);
          }
        };
        window.addEventListener('message', handleMessage);
      } else if (selectedPlatform.id === 'razorpay') {
        const existing = connections.find(c => c.platform === 'razorpay');
        if (existing) await updateDoc(doc(db, 'razorpay_settings', existing.id), { ...formData, updatedAt: new Date().toISOString() });
        else await addDoc(collection(db, 'razorpay_settings'), { uid: user.parentId || user.uid, platform: 'razorpay', ...formData, createdAt: new Date().toISOString() });
        showToast('Razorpay connected!', 'success');
        setSelectedPlatform(null);
      } else if (selectedPlatform.id === 'google_sheets' || selectedPlatform.id === 'google_sheet_automation') {
        const existing = connections.find(c => c.platform === 'google_sheets');
        const data = { uid: user.parentId || user.uid, platform: 'google_sheets', spreadsheetId: formData.spreadsheetId, sheetName: formData.sheetName || 'Sheet1', updatedAt: new Date().toISOString() };
        if (existing) await updateDoc(doc(db, 'google_settings', existing.id), data);
        else await addDoc(collection(db, 'google_settings'), { ...data, createdAt: new Date().toISOString() });
        showToast('Google Sheets linked!', 'success');
        setSelectedPlatform(null);
      } else if (selectedPlatform.id === 'google_workspace') {
        window.location.href = `${API_URL}/google/auth?uid=${user.parentId || user.uid}`;
      } else if (selectedPlatform.id === 'meta') {
        setIsSyncing(true);
        try {
          const result: any = await connectInstagramWithFacebook(user.parentId || user.uid);
          if (result.success) { showToast('Instagram connected!', 'success'); setSelectedPlatform(null); }
        } catch (e: any) { showToast(e.message, 'error'); }
        finally { setIsSyncing(false); }
      } else if (selectedPlatform.id === 'threads') {
        // Use the backend redirect route to handle mobile browser vs app issues
        const connectUrl = `${API_URL}/threads/connect?origin=${window.location.origin}`;
        window.location.href = connectUrl;
      }
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const triggerSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/shopify-login/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.parentId || user.uid })
      });
      if (response.ok) showToast('Sync complete!', 'success');
      else throw new Error('Sync failed');
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setIsSyncing(false); }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f0f13]">
      {/* Header */}
      <header className="px-6 py-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#16161d] sticky top-0 z-40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Integrations</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Connect nodes and automate interaction flows.</p>
          </div>
          
          <div className="flex bg-slate-50 dark:bg-[#202c33] p-1 rounded-xl border border-slate-200 dark:border-white/5">
            {[
              { id: 'connections', label: 'Connections' },
              { id: 'automations', label: 'Automations' },
              { id: 'payments', label: 'Payments' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-blue-600 shadow-sm text-blue-600 dark:text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-6">
        <div className="w-full">
          {showRazorpayDashboard ? (
            <RazorpayDashboard
              payments={payments}
              razorpaySettings={razorpaySettings}
              setShowRazorpayDashboard={setShowRazorpayDashboard}
              setShowLinkModal={setShowLinkModal}
              API_URL={API_URL}
              showToast={showToast}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              user={user}
            />
          ) : activeTab === 'connections' ? (
            <ConnectionsTab
              PLATFORMS={PLATFORMS}
              connections={connections}
              razorpaySettings={razorpaySettings}
              setShowRazorpayDashboard={setShowRazorpayDashboard}
              triggerSync={triggerSync}
              isSyncing={isSyncing}
              setSelectedPlatform={setSelectedPlatform}
              onNavigate={onNavigate}
            />
          ) : activeTab === 'automations' ? (
            <AutomationsTab
              formData={formData}
              setFormData={setFormData}
              templates={templates}
              automations={automations}
              user={user}
              showToast={showToast}
            />
          ) : (
            <PaymentsTab
              payments={payments}
              connections={connections}
              API_URL={API_URL}
              user={user}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      <IntegrationModals
        selectedPlatform={selectedPlatform}
        setSelectedPlatform={setSelectedPlatform}
        formData={formData}
        setFormData={setFormData}
        handleConnect={handleConnect}
        showLinkModal={showLinkModal}
        setShowLinkModal={setShowLinkModal}
        API_URL={API_URL}
        user={user}
        showToast={showToast}
      />
    </div>
  );
}
