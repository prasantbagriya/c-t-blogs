/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import {
  MessageSquare,
  Send,
  BarChart3,
  LayoutDashboard,
  TrendingUp,
  Users,
  Settings,
  Brain,
  Zap,
  UserCircle,
  Sparkles
} from 'lucide-react';
import { Instagram, Threads, Facebook } from './components/common/BrandIcons';
import {
  auth,
  db,
  signInWithFacebook,
  signUpWithEmail,
  loginWithEmail,
  loginAnonymously,
  handleDatabaseError,
  OperationType,
  connectWhatsAppWithFacebook,
  connectInstagramWithFacebook,
  connectInstagramWithCode,
  onAuthStateChanged,
  onSnapshot,
  query,
  collection,
  where,
  getDoc,
  doc,
  deleteDoc,
  sendMessage,
  getHeaders,
  getAISuggestion,
  getBlacklist,
  reportIncomingMessage,
  uploadFile,
  orderBy,
  signOut,
  addDoc,
  updateDoc,
  serverTimestamp,
  API_URL,
  safeJson
} from './api';

import ErrorBoundary from './components/ErrorBoundary';

// ── Heavy components loaded lazily to minimize initial JS bundle ─────────
const FlowBuilderView = lazy(() => import('./components/FlowBuilderView').then(m => ({ default: m.FlowBuilderView })));
const AdsManagerView = lazy(() => import('./components/AdsManagerView').then(m => ({ default: m.AdsManagerView })));
const TemplateApproverView = lazy(() => import('./components/TemplateApproverView').then(m => ({ default: m.TemplateApproverView })));
const UserManagementView = lazy(() => import('./components/UserManagementView').then(m => ({ default: m.UserManagementView })));
const WidgetConfigView = lazy(() => import('./components/WidgetConfigView').then(m => ({ default: m.WidgetConfigView })));
const WhatsAppBulkSendView = lazy(() => import('./components/WhatsAppBulkSendView').then(m => ({ default: m.WhatsAppBulkSendView })));
const WhatsAppFlowFormBuilder = lazy(() => import('./components/WhatsAppFlowFormBuilder').then(m => ({ default: m.WhatsAppFlowFormBuilder })));
const ManagePagesView = lazy(() => import('./components/instagram/ManagePagesView').then(m => ({ default: m.ManagePagesView })));

const WhatsAppAccountsView = lazy(() => import('./components/WhatsAppAccountsView').then(m => ({ default: m.WhatsAppAccountsView })));
const InboxView = lazy(() => import('./components/InboxView').then(m => ({ default: m.InboxView })));
const InstagramManager = lazy(() => import('./components/instagram/InstagramManager').then(m => ({ default: m.InstagramManager })));
const WhatsAppView = lazy(() => import('./components/WhatsAppView').then(m => ({ default: m.WhatsAppView })));
const ContactsView = lazy(() => import('./components/ContactsView').then(m => ({ default: m.ContactsView })));
const AgentSetupWizard = lazy(() => import('./components/agent/AgentSetupWizard').then(m => ({ default: m.AgentSetupWizard })));
const ThreadsManager = lazy(() => import('./components/threads/ThreadsManager').then(m => ({ default: m.ThreadsManager })));
const KnowledgeHub = lazy(() => import('./components/agent/KnowledgeHub').then(m => ({ default: m.KnowledgeHub })));
const SalesDashboard = lazy(() => import('./components/agent/SalesDashboard').then(m => ({ default: m.SalesDashboard })));
const ToolsView = lazy(() => import('./components/ToolsView').then(m => ({ default: m.ToolsView })));
const IntegrationsView = lazy(() => import('./components/IntegrationsView').then(m => ({ default: m.IntegrationsView })));
const SettingsView = lazy(() => import('./components/SettingsView').then(m => ({ default: m.SettingsView })));
const ProfileView = lazy(() => import('./components/ProfileView').then(m => ({ default: m.ProfileView })));
const PaymentView = lazy(() => import('./components/PaymentView'));
const ResetPasswordView = lazy(() => import('./components/ResetPasswordView'));
const DataDeletion = lazy(() => import('./components/DataDeletion').then(m => ({ default: m.DataDeletion })));
const ThreadsCallback = lazy(() => import('./components/threads/ThreadsCallback').then(m => ({ default: m.ThreadsCallback })));
const InstagramCallback = lazy(() => import('./components/instagram/InstagramCallback').then(m => ({ default: m.InstagramCallback })));
const PrivacyPolicy = lazy(() => import('./theme_migration/app/privacy-policy/page'));
const TermsOfService = lazy(() => import('./theme_migration/app/terms/page'));

import ThemeHome from './theme_migration/app/page';

const ThemeArtistsPage = lazy(() => import('./theme_migration/app/artists/page'));
const ThemeSuccessStoriesPage = lazy(() => import('./theme_migration/app/success-stories/page'));
const ThemeCareersPage = lazy(() => import('./theme_migration/app/careers/page'));
const ThemedAuthWrapper = lazy(() => import('./theme_migration/components/auth/themed-auth-wrapper'));
const AboutPage = lazy(() => import('./theme_migration/components/about-page'));
const ContactPage = lazy(() => import('./theme_migration/components/contact-page'));
const ServicesPage = lazy(() => import('./theme_migration/components/services-page'));
const PricingPage = lazy(() => import('./theme_migration/components/pricing-page'));


const ThemeDirectMessagePage = lazy(() => import('./theme_migration/components/direct-message'));
const ThemeFormPage = lazy(() => import('./theme_migration/components/form-to-link'));
const ThemeToolsPage = lazy(() => import('./theme_migration/app/tools/page'));
const SIPCalculator = lazy(() => import('./components/tools/SIPCalculator'));
const CompoundInterest = lazy(() => import('./components/tools/CompoundInterest'));
const PropFirm = lazy(() => import('./components/tools/PropFirm'));
const YouTubeDownloader = lazy(() => import('./components/tools/YouTubeDownloader'));

import Navbar from './theme_migration/components/navbar';

const ServiceDetailView = lazy(() => import('./theme_migration/components/service-detail-view'));
const AnimatedFooter = lazy(() => import('./theme_migration/components/animated-footer'));
// FIX: BackgroundPaths converted to static import
// Reason: 7 other files already statically import this — lazy() had no effect
// and caused Vite warning: "dynamically imported but also statically imported"
import BackgroundPaths from './theme_migration/components/background-paths';
const AnimatedBackground = lazy(() => import('./theme_migration/components/animated-background'));
const BackgroundStripes = lazy(() => import('./theme_migration/components/background-stripes'));


import type { DashboardTab } from './components/dashboard/DashboardLayout';
import type { ToastType } from './theme_migration/components/ui/toast';

const DashboardLayout = lazy(() => import('./components/dashboard/DashboardLayout'));
const DashboardOverview = lazy(() => import('./components/dashboard/DashboardOverview'));
const Toast = lazy(() => import('./theme_migration/components/ui/toast'));



type User = any;

// --- Types ---
type Page = 'landing' | 'dashboard' | 'auth' | 'pay' | 'reset-password' | 'services' | 'service-detail' | 'about' | 'success-stories' | 'contact' | 'privacy' | 'terms' | 'deletion' | 'careers' | 'pricing' | 'whatsapp-link-generator' | 'whatsapp-direct-message' | 'whatsapp-form-generator' | 'threads-callback' | 'instagram-callback' | 'artists' | 'sip-calculator' | 'compound-interest' | 'prop-firm' | 'youtubevideodownload';
type UserRole = 'admin' | 'manager' | 'user';
// type DashboardTab = 'overview' | 'accounts' | 'inbox' | 'whatsapp' | 'instagram' | 'flows' | 'bulk-wa-legacy' | 'ads' | 'automations' | 'contacts' | 'agent' | 'leads' | 'knowledge' | 'tools' | 'settings' | 'help' | 'profile';




// --- Dashboard Views ---

// Removed Internal DashboardOverview - now using external component from ./components/dashboard/DashboardOverview.tsx


// InboxView extracted to ./components/InboxView.tsx


// --- Main App ---

export default function App() {
  // Initialize state based on URL path
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '') || 'landing';
    const publicRoutes = ['services', 'service-detail', 'contact', 'about', 'success-stories', 'privacy', 'terms', 'deletion', 'careers', 'pricing', 'whatsapp-link-generator', 'auth', 'dashboard', 'reset-password', 'threads-callback', 'instagram-callback', 'artists', 'youtubevideodownload', 'whatsapp-direct-message', 'whatsapp-form-generator'];
    
    if (path.startsWith('services/')) return 'service-detail';
    if (path === 'get-started') return 'auth';
    if (path === 'about-us') return 'about';
    if (path === 'contact-us') return 'contact';
    if (path === 'privacy-policy') return 'privacy';
    if (path === 'terms-of-service') return 'terms';
    if (path === 'artists') return 'artists';
    if (path === 'instagram' || path === 'instagram-callback') return 'instagram-callback';
    if (path.startsWith('pay/')) return 'pay';
    // Tool sub-routes with /tool/ prefix
    if (path === 'tool/sip-calculator') return 'sip-calculator';
    if (path === 'tool/compound-interest') return 'compound-interest';
    if (path === 'tool/prop-firm') return 'prop-firm';
    return publicRoutes.includes(path) ? path as Page : 'landing';
  });
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    const validTabs = ['overview', 'inbox', 'whatsapp', 'instagram', 'threads', 'flows', 'ads', 'tools', 'settings', 'help', 'users', 'manage-pages', 'widget'];
    return (validTabs.includes(hash) ? hash : 'overview') as DashboardTab;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [hasAccounts, setHasAccounts] = useState<boolean | null>(null);
  const [isChatActive, setIsChatActive] = useState(false);


  const [toasts, setToasts] = useState<Array<{ id: string, message: string, type: ToastType }>>([]);
  // Use useCallback to keep stable function reference (avoids re-creating on each render)
  const showToast = React.useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto-remove after 3 seconds (increased from 1s for better UX)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSetActiveTab = React.useCallback((tab: DashboardTab) => {
    setActiveTab(tab);
    window.location.hash = `#${tab}`;
    setActiveSubTab('overview');
  }, []);

  // FIX: Use useEffect with cleanup to expose global helpers
  // Pattern: assign on mount, cleanup on unmount
  const showToastRef = React.useRef(showToast);
  const setActiveTabRef = React.useRef(handleSetActiveTab);
  React.useEffect(() => { showToastRef.current = showToast; }, [showToast]);
  React.useEffect(() => { setActiveTabRef.current = handleSetActiveTab; }, [handleSetActiveTab]);

  useEffect(() => {
    // Expose via stable proxy functions so window refs never go stale
    (window as any).showToast = (msg: string, type?: ToastType) => showToastRef.current(msg, type);
    (window as any).setActiveTab = (tab: DashboardTab) => setActiveTabRef.current(tab);
    return () => {
      delete (window as any).showToast;
      delete (window as any).setActiveTab;
    };
  }, []);

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
    if (path.startsWith('services/')) {
      setSelectedServiceId(path.split('/').pop() || null);
    }
  }, []);

  const [userRole, setUserRole] = useState<UserRole>('user');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatwiz_account_theme');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const saveAccountTheme = async (dark: boolean) => {
    setIsDarkMode(dark);
    localStorage.setItem('chatwiz_account_theme', dark.toString());

    // Persist to database
    if (currentUser?.uid) {
      try {
        const { updateUserPreferences } = await import('./api/auth');
        await updateUserPreferences({ theme: dark ? 'dark' : 'light' });
        console.log('[Theme Sync] User preference saved to database');
      } catch (err) {
        console.error('[Theme Sync] Failed to save theme to database:', err);
      }
    }
  };

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [globalAccounts, setGlobalAccounts] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([
    { id: '1', title: 'Welcome to ChatWizs!', message: 'Explore our new WhatsApp API features.', time: 'Just now', type: 'info' },
    { id: '2', title: 'Meta SDK Updated', message: 'Popup-based login is now active.', time: '5m ago', type: 'success' }
  ]);

  // Sync window path and hash with state
  useEffect(() => {
    let path = `/${currentPage}`;
    if (currentPage === 'landing') path = '/';
    else if (currentPage === 'service-detail') path = `/services/${selectedServiceId || 'bulk-whatsapp-campaigns'}`;
    else if (currentPage === 'about') path = '/about-us';
    else if (currentPage === 'contact') path = '/contact-us';
    else if (currentPage === 'privacy') path = '/privacy-policy';
    else if (currentPage === 'terms') path = '/terms-of-service';
    else if (currentPage === 'artists') path = '/artists';
    // Tool sub-routes with /tool/ prefix
    else if (currentPage === 'sip-calculator') path = '/tool/sip-calculator';
    else if (currentPage === 'compound-interest') path = '/tool/compound-interest';
    else if (currentPage === 'prop-firm') path = '/tool/prop-firm';

    const hash = currentPage === 'dashboard' ? `#${activeTab}` : '';
    const search = window.location.search; // Preserve query params like ?code=...
    const newPath = path + search + hash;

    if (window.location.pathname + window.location.search + window.location.hash !== newPath) {
      window.history.pushState({}, '', newPath);
    }
  }, [currentPage, activeTab, selectedServiceId]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '') || 'landing';
      const hash = window.location.hash.replace(/^#/, '');

      const validPages = ['landing', 'dashboard', 'auth', 'reset-password', 'services', 'service-detail', 'about', 'success-stories', 'contact', 'privacy', 'terms', 'deletion', 'careers', 'pricing', 'whatsapp-link-generator', 'artists', 'youtubevideodownload', 'whatsapp-direct-message', 'whatsapp-form-generator'];
      if (path.startsWith('services/')) {
        setSelectedServiceId(path.split('/').pop() || null);
        setCurrentPage('service-detail');
      } else if (path === 'get-started') {
        setCurrentPage('auth');
      } else if (path === 'about-us') {
        setCurrentPage('about');
      } else if (path === 'contact-us') {
        setCurrentPage('contact');
      } else if (path === 'privacy-policy') {
        setCurrentPage('privacy');
      } else if (path === 'terms-of-service') {
        setCurrentPage('terms');
      } else if (path === 'artists') {
        setCurrentPage('artists');
      } else if (path === 'tool/sip-calculator') {
        setCurrentPage('sip-calculator');
      } else if (path === 'tool/compound-interest') {
        setCurrentPage('compound-interest');
      } else if (path === 'tool/prop-firm') {
        setCurrentPage('prop-firm');
      } else if (validPages.includes(path)) {
        setCurrentPage(path as Page);
      }

      if (path === 'dashboard' && hash) {
        setActiveTab(hash as DashboardTab);
        setIsChatActive(false); // Reset when navigating
      }
    };
    const handleAppNavigate = (e: any) => {
      const route = e.detail;
      if (route === '/') setCurrentPage('landing');
      else if (route === '/services') setCurrentPage('services');
      else if (route.startsWith('/services/')) {
        const id = route.split('/').pop();
        if (id) {
          setSelectedServiceId(id);
          setCurrentPage('service-detail');
        }
      }
      else if (route === '/artists') setCurrentPage('artists');
      else if (route === '/success-stories') setCurrentPage('success-stories');
      else if (route === '/contact' || route === '/contact-us') setCurrentPage('contact');
      else if (route === '/about' || route === '/about-us') setCurrentPage('about');
      else if (route === '/privacy' || route === '/privacy-policy') setCurrentPage('privacy');
      else if (route === '/terms' || route === '/terms-of-service') setCurrentPage('terms');
      else if (route === '/get-started') setCurrentPage('auth');
      else if (route === '/tool/sip-calculator' || route === '/sip-calculator') setCurrentPage('sip-calculator');
      else if (route === '/tool/compound-interest' || route === '/compound-interest') setCurrentPage('compound-interest');
      else if (route === '/tool/prop-firm' || route === '/prop-firm') setCurrentPage('prop-firm');
      else if (route === '/whatsapp-direct-message') setCurrentPage('whatsapp-direct-message');
      else if (route === '/whatsapp-form-generator') setCurrentPage('whatsapp-form-generator');
      else if (route === '/youtubevideodownload') setCurrentPage('youtubevideodownload');
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('app-navigate', handleAppNavigate);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('app-navigate', handleAppNavigate);
    };
  }, []);


  // Handle window resize for mobile detection
  React.useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth < 768;
      setIsMobile(prev => {
        if (prev !== isNowMobile) {
          setIsSidebarOpen(!isNowMobile);
        }
        return isNowMobile;
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Handle Auth State
  useEffect(() => {
    let unsubscribeAccounts: (() => void) | undefined;
    let unsubscribeGlobalAccs: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Sync theme preference from database
        if (user.theme) {
          const isDark = user.theme === 'dark';
          setIsDarkMode(isDark);
          localStorage.setItem('chatwiz_account_theme', isDark.toString());
          console.log('[Theme Sync] Theme loaded from user profile:', user.theme);
        }

        // Set role directly from user object if available
        if (user.role) {
          setUserRole(user.role);
          console.log('[App] User role identified:', user.role);
        }

        // 1. Sync global accounts (WhatsApp, Threads, Instagram)
        const effectiveUid = user.parentId || user.uid;
        
        // Listen to WhatsApp accounts
        const qWA = query(collection(db, 'whatsapp_accounts'), where('uid', '==', effectiveUid));
        const unsubWA = onSnapshot(qWA, (snapshot) => {
          const accs = snapshot.docs.map(doc => ({ id: doc.id, platform: 'whatsapp', ...doc.data() }));
          setGlobalAccounts(prev => {
            const others = prev.filter(a => a.platform !== 'whatsapp');
            return [...others, ...accs];
          });
        });

        // Listen to Threads accounts
        const qThreads = query(collection(db, 'threads_accounts'), where('uid', '==', effectiveUid));
        const unsubThreads = onSnapshot(qThreads, (snapshot) => {
          const accs = snapshot.docs.map(doc => ({ id: doc.id, platform: 'threads', ...doc.data() }));
          setGlobalAccounts(prev => {
            const others = prev.filter(a => a.platform !== 'threads');
            return [...others, ...accs];
          });
        });

        // Listen to Instagram accounts
        const qInsta = query(collection(db, 'instagram_accounts'), where('uid', '==', effectiveUid));
        const unsubInsta = onSnapshot(qInsta, (snapshot) => {
          const accs = snapshot.docs.map(doc => ({ id: doc.id, platform: 'instagram', ...doc.data() }));
          setGlobalAccounts(prev => {
            const others = prev.filter(a => a.platform !== 'instagram');
            return [...others, ...accs];
          });
        });

        unsubscribeGlobalAccs = () => {
          unsubWA();
          unsubThreads();
          unsubInsta();
        };

        // 2. Fetch user profile as backup/sync
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role || 'user';
            setUserRole(role);

            // Sync parentId and other metadata into currentUser
            setCurrentUser(prev => prev ? { ...prev, ...userData } : userData);
            console.log('[App] Full user profile loaded:', { role, parentId: userData.parentId });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }

        // Check for accounts
        const q = query(collection(db, 'whatsapp_accounts'), where('uid', '==', effectiveUid));
        unsubscribeAccounts = onSnapshot(q, (snapshot) => {
          const count = snapshot.docs.length;
          setHasAccounts(count > 0);
        });

        if (currentPage === 'auth' || currentPage === 'landing') {
          setCurrentPage('dashboard');
        }
      } else {
        setHasAccounts(null);
        if (currentPage === 'dashboard') setCurrentPage('auth');
        if (unsubscribeAccounts) unsubscribeAccounts();
      }
      setAuthLoading(false);
    });
    return () => {
      unsubscribe();
      if (unsubscribeAccounts) unsubscribeAccounts();
      if (unsubscribeGlobalAccs) unsubscribeGlobalAccs(); // H-1 FIX: Clean up global accounts subscription
    };
  // FIX: Remove `currentPage` from deps — it caused re-subscribing to auth on every navigation.
  // Instead, we read currentPage as a snapshot inside the effect (closure is fine here).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Campaigns and Messages
  useEffect(() => {
    if (!currentUser?.uid) {
      setCampaigns([]);
      setMessages([]);
      return;
    }

    // --- Strict Account Isolation for Analytics & Sync ---
    let qCampaigns;
    let qMessages;
    const isUnifiedTab = ['inbox', 'overview', 'leads', 'contacts', 'tools'].includes(activeTab);
    const effectiveUid = currentUser.parentId || currentUser.uid;

    if (selectedAccount?.id && !isUnifiedTab) {
      qCampaigns = query(
        collection(db, 'campaigns'),
        where('uid', '==', effectiveUid),
        where('whatsappAccountId', '==', selectedAccount.id),
        orderBy('timestamp', 'desc')
      );
      qMessages = query(
        collection(db, 'messages'),
        where('uid', '==', effectiveUid),
        orderBy('timestamp', 'desc')
      );
    } else {
      // Fallback for Overview/Global View
      qCampaigns = query(collection(db, 'campaigns'), where('uid', '==', effectiveUid), orderBy('timestamp', 'desc'));
      qMessages = query(collection(db, 'messages'), where('uid', '==', effectiveUid), orderBy('timestamp', 'desc'));
    }

    const unsubCampaigns = onSnapshot(qCampaigns, (snapshot) => {
      setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubCampaigns();
      unsubMessages();
    };
  }, [currentUser?.uid, currentUser?.parentId, selectedAccount?.id, activeTab]);

  // Platform-Aware Account Auto-Selection
  useEffect(() => {
    if (!activeTab || !globalAccounts.length) return;

    // Mapping tabs to platform types
    const platformMap: Record<string, string> = {
      'whatsapp': 'whatsapp',
      'instagram': 'instagram',
      'threads': 'threads'
    };

    const targetPlatform = platformMap[activeTab];
    if (!targetPlatform) return; // Not a platform-specific tab

    // Determine current platform of selectedAccount
    let currentPlatform = null;
    if (selectedAccount) {
      currentPlatform = selectedAccount.platform || 
                       (selectedAccount.phoneNumber ? 'whatsapp' : 
                       (selectedAccount.username && !selectedAccount.threadsId ? 'instagram' : 'threads'));
    }
    
    if (currentPlatform !== targetPlatform) {
      const firstAccForPlatform = globalAccounts.find(acc => {
        const accPlat = acc.platform || 
                       (acc.phoneNumber ? 'whatsapp' : 
                       (acc.username && !acc.threadsId ? 'instagram' : 'threads'));
        return accPlat === targetPlatform;
      });

      if (firstAccForPlatform && selectedAccount?.id !== firstAccForPlatform.id) {
        setSelectedAccount(firstAccForPlatform);
        console.log(`[App] Auto-switched to ${targetPlatform} account:`, firstAccForPlatform.name || firstAccForPlatform.username);
      }
    }
  }, [activeTab, globalAccounts]);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle temporary theme toggles from decoupled components (e.g. Landing Navbar)
  useEffect(() => {
    const handleToggle = (e: any) => {
      if (typeof e.detail === 'boolean') {
        setIsDarkMode(e.detail);
      }
    };
    window.addEventListener('app-theme-toggle', handleToggle);

    const handleFlowAutoSave = (e: any) => {
      console.log('[App] Flow Auto-Save Event Received:', e.detail);
      if (e.detail?.target === 'templates') {
        setActiveTab('whatsapp');
        setActiveSubTab('templates');
        showToast("Progress saved! Redirecting to Template Library.", "success");
      }
    };
    window.addEventListener('flow-auto-save', handleFlowAutoSave);

    return () => {
      window.removeEventListener('app-theme-toggle', handleToggle);
      window.removeEventListener('flow-auto-save', handleFlowAutoSave);
    };
  }, []);

  // --- Dynamic SEO Management ---
  useEffect(() => {
    let title = "ChatWizs | AI-Powered WhatsApp Automation Platform";
    let description = "Empower your business with ChatWizs. The ultimate AI-powered WhatsApp automation platform for marketing, lead generation, and customer support.";
    let canonicalUrl = "https://chatwizs.com/";

    const pageTitles: Record<string, string> = {
      landing: "ChatWizs | Advanced WhatsApp Marketing & AI Automation",
      services: "Our Services | WhatsApp Business API & AI Solutions - ChatWizs",
      'service-detail': `Service Detail | WhatsApp Automation - ChatWizs`,
      'whatsapp-link-generator': "WhatsApp Link & QR Generator | Free Marketing Tools - ChatWizs",
      about: "About Us | Our Story & Vision - ChatWizs",
      contact: "Contact Us | Get Started with WhatsApp API - ChatWizs",
      privacy: "Privacy Policy | ChatWizs Data Protection",
      terms: "Terms of Service | ChatWizs Platform Usage",
      auth: "Login & Sign Up | Access ChatWizs Dashboard",
      dashboard: "Dashboard | Manage Your WhatsApp Campaigns - ChatWizs",
      'sip-calculator': "SIP Calculator | Plan Your Mutual Fund Investment - ChatWizs",
      'compound-interest': "Compound Interest Calculator | Free Financial Tool - ChatWizs",
      'prop-firm': "Prop Firm Calculator | Trading Tool - ChatWizs",
      'youtubevideodownload': "YouTube Video Downloader Free Online – Download MP4 & MP3 | ChatWizs",
    };

    const pageDescriptions: Record<string, string> = {
      landing: "Scale your business with AI-powered WhatsApp automation. Send bulk messages, automate responses, and convert leads with ChatWizs platform.",
      services: "Explore ChatWizs WhatsApp Business API services — bulk messaging, chatbot automation, lead generation, and Meta Business Partner solutions.",
      about: "Learn about ChatWizs — India's leading AI-powered WhatsApp marketing platform trusted by thousands of businesses.",
      contact: "Get in touch with ChatWizs team. Start your WhatsApp Business API integration today and grow your business.",
      privacy: "Read ChatWizs privacy policy. We are committed to protecting your data and ensuring full GDPR & IT Act compliance.",
      terms: "ChatWizs terms of service — understand your rights and responsibilities while using our platform.",
      auth: "Login or sign up to ChatWizs dashboard. Access your WhatsApp campaigns, contacts, and AI automation tools.",
      'youtubevideodownload': "Download YouTube videos free in MP4 & MP3. Fast online YouTube downloader – no software needed. Supports 4K, 1080p, 720p & Shorts.",
      'sip-calculator': "Calculate your SIP returns with our free mutual fund SIP calculator. Plan investments for wealth creation with ChatWizs.",
      'compound-interest': "Calculate compound interest easily with our free online tool. See how your money grows over time.",
    };

    const pageUrls: Record<string, string> = {
      landing: "https://chatwizs.com/",
      services: "https://chatwizs.com/services",
      about: "https://chatwizs.com/about-us",
      contact: "https://chatwizs.com/contact-us",
      privacy: "https://chatwizs.com/privacy-policy",
      terms: "https://chatwizs.com/terms-of-service",
      'auth': "https://chatwizs.com/get-started",
      'youtubevideodownload': "https://chatwizs.com/youtubevideodownload",
      'sip-calculator': "https://chatwizs.com/tool/sip-calculator",
      'compound-interest': "https://chatwizs.com/tool/compound-interest",
      'prop-firm': "https://chatwizs.com/tool/prop-firm",
    };

    const tabTitles: Record<string, string> = {
      overview: "Overview | Marketing Performance Dashboard",
      accounts: "Accounts | Manage WhatsApp & Instagram API",
      whatsapp: "WhatsApp | Official Meta Messaging & Broadcasts",
      instagram: "Instagram | DM Automation & AI Responses",
      inbox: "Unified Inbox | Omnichannel Customer Support",
      flows: "Flow Builder | No-Code AI Automation Sequences",
      ads: "Ads Manager | Click-to-WhatsApp Advertising",
      contacts: "Contacts | Audience Management & Segments",
      agent: "AI Training | Train Your Business Assistant",
      leads: "Leads Hub | Convert Conversations into Sales",
      settings: "Settings | Platform Configuration & Security"
    };

    if (currentPage === 'dashboard') {
      title = tabTitles[activeTab] || pageTitles[currentPage];
      canonicalUrl = "https://chatwizs.com/dashboard";
    } else {
      title = pageTitles[currentPage] || title;
      description = pageDescriptions[currentPage] || description;
      canonicalUrl = pageUrls[currentPage] || canonicalUrl;
    }

    document.title = title;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);

    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);

    // Update Twitter tags
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', title);

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', description);

    // Update canonical link
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', canonicalUrl);
    }

  }, [currentPage, activeTab]);

  // Handle OAuth Redirects (Instagram & WhatsApp)
  useEffect(() => {
    // CRITICAL: Wait for auth to settle before processing codes 
    // to avoid race condition where currentUser is not yet available
    if (authLoading) return;

    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');
    let state = urlParams.get('state');

    // FALLBACK: Read from cookie for Hostinger 403 Bypass (oauth.php)
    let isFromCookie = false;
    if (!code) {
      const getCookie = (name: string) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
      };
      code = getCookie('_oc');
      state = getCookie('_os');
      if (code) {
        isFromCookie = true;
      }
    }
    const isInstagramPath = window.location.pathname.includes('/instagram');

    if (code) {
      const codeToPass = code; // FIX: Always pass the code, even if from cookie
      if (state === 'login') {
        const loginFB = async () => {
          try {
            const { confirmFacebookLogin } = await import('./api/auth');
            const user = await confirmFacebookLogin(codeToPass);

            // Success! Now we can clear cookies if they were used
            if (isFromCookie) {
              document.cookie = "_oc=; Max-Age=0; path=/;";
              document.cookie = "_os=; Max-Age=0; path=/;";
            }

            setCurrentUser(user);
            window.history.replaceState({}, document.title, window.location.pathname);
            setCurrentPage('dashboard');
            showToast("Welcome back! Successfully logged in via Facebook.", "success");
          } catch (error: any) {
            console.error("Facebook login error:", error);
            showToast(error.message || "Failed to login with Facebook", "error");
          }
        };
        loginFB();
      }
      else if (currentUser) {
        if (state?.startsWith('whatsapp_')) {
          const connectWA = async () => {
            console.log('[App] WhatsApp Redirect Detected. State:', state, 'CurrentUser:', currentUser?.uid);
            try {
              const { confirmWhatsAppConnect } = await import('./api/whatsapp');
              const result = await confirmWhatsAppConnect(currentUser.uid, codeToPass); // Use codeToPass

              if (isFromCookie) {
                document.cookie = "_oc=; Max-Age=0; path=/;";
                document.cookie = "_os=; Max-Age=0; path=/;";
              }

              if (result.account) {
                console.log('[App] WhatsApp Account Linked Successfully:', result.account.id);
                setGlobalAccounts(prev => [...prev.filter(a => a.id !== result.account.id), result.account]);
                setHasAccounts(true);
                showToast("WhatsApp Account linked successfully!", "success");
              }
              window.history.replaceState({}, document.title, window.location.pathname + '#whatsapp');
              setActiveTab('whatsapp');
              setSelectedAccount(result.account);
            } catch (error: any) {
              console.error("WhatsApp connect error:", error);
              showToast(error.message || "Failed to connect WhatsApp account", "error");
            }
          };
          connectWA();
        }
        // Instagram connection is now handled by InstagramCallback.tsx
        // Threads connection is handled by ThreadsCallback.tsx
      }
    }

    // Also handle initial tab from hash
    if (window.location.hash === '#instagram') {
      setActiveTab('instagram');
      window.location.hash = '';
    }
  }, [currentUser, window.location.search, window.location.pathname]);

  // Shared Bulk Messaging State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkMessageContent, setBulkMessageContent] = useState('');
  const [bulkCampaignName, setBulkCampaignName] = useState('');

  const handleUseTemplate = (templateName: string, content: string) => {
    setBulkCampaignName(`Campaign: ${templateName}`);
    setBulkMessageContent(content);
    setActiveTab('whatsapp');
    setIsBulkModalOpen(true);
  };

  // Define sidebar items based on role
  const sidebarItems = [
    { id: 'overview', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview', roles: ['admin', 'manager', 'user'] },
    { id: 'inbox', icon: <MessageSquare className="w-5 h-5" />, label: 'Unified Inbox', roles: ['admin', 'manager', 'user'] },
    { id: 'whatsapp', icon: <Send className="w-5 h-5" />, label: 'WhatsApp', roles: ['admin', 'manager', 'user'] },
    { id: 'instagram', icon: <Instagram className="w-5 h-5" />, label: 'Instagram', roles: ['admin', 'manager', 'user'] },
    { id: 'threads', icon: <Threads className="w-5 h-5" />, label: 'Threads', roles: ['admin', 'manager', 'user'] },
    { id: 'contacts', icon: <Users className="w-5 h-5" />, label: 'Contacts', roles: ['admin', 'manager', 'user'] },
    { id: 'ads', icon: <BarChart3 className="w-5 h-5" />, label: 'Ads Manager', roles: ['admin', 'manager', 'user'] },
    { id: 'agent', icon: <Brain className="w-5 h-5" />, label: 'AI Training', roles: ['admin', 'manager', 'user'] },
    { id: 'flows', icon: <Zap className="w-5 h-5" />, label: 'Flows Builder', roles: ['admin', 'manager', 'user'] },
    { id: 'knowledge', icon: <Sparkles className="w-5 h-5" />, label: 'Knowledge Hub', roles: ['admin', 'manager', 'user'] },
    { id: 'leads', icon: <TrendingUp className="w-5 h-5" />, label: 'Leads Hub', roles: ['admin', 'manager', 'user'] },
    { id: 'tools', icon: <Zap className="w-5 h-5" />, label: 'Tools', roles: ['admin', 'manager', 'user'] },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings', roles: ['admin'] },
    { id: 'profile', icon: <UserCircle className="w-5 h-5" />, label: 'Profile', roles: ['admin', 'manager', 'user'] },
    { id: 'users', icon: <Users className="w-5 h-5" />, label: 'Users', roles: ['admin'] }
  ].filter(item => item.roles.includes(userRole));

  // Ensure active tab is valid for current role
  React.useEffect(() => {
    if (!sidebarItems.find(item => item.id === activeTab)) {
      setActiveTab(sidebarItems[0]?.id as DashboardTab || 'inbox');
    }
  }, [userRole]);

  const handleFacebookLogin = async () => {
    try {
      console.log('[App] Starting Facebook Login...');
      const user = await signInWithFacebook();
      console.log('[App] Facebook Login Success, user:', (user as any).uid);
      setCurrentUser(user);
    } catch (err: any) {
      console.error("Facebook Login Error:", err);
      alert(err.message || "Failed to login with Facebook");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentPage('landing');
      setIsChatActive(false);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10" />

        <div className="relative z-10 flex flex-col items-center animate-fade-in">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)] relative">
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-2xl border border-white/20 animate-ping opacity-20" />
            <div className="absolute inset-0 rounded-2xl border border-white/10 animate-ping [animation-delay:0.5s] opacity-10" />

            <Zap className="text-black w-10 h-10 fill-black" />
          </div>

          <div className="mt-8 flex flex-col items-center">
            <span className="text-white font-black tracking-[0.3em] uppercase text-xs">ChatWizs</span>

            {/* Premium Loading Bar */}
            <div className="w-24 h-[3px] bg-white/5 rounded-full mt-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-loading-bar" />
            </div>

            <div className="mt-4 text-[8px] font-bold text-gray-500 uppercase tracking-widest">
              Establishing Secure Connection
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'deletion') {
    return (
      <div className="public-container-scaled">
        <DataDeletion onBack={() => setCurrentPage('landing')} />
      </div>
    );
  }

  if (currentPage === 'privacy') {
    return (
      <div className="public-container-scaled">
        <PrivacyPolicy onNavigate={setCurrentPage} />
      </div>
    );
  }

  if (currentPage === 'terms') {
    return (
      <div className="public-container-scaled">
        <TermsOfService onNavigate={setCurrentPage} />
      </div>
    );
  }

  if (currentPage === 'landing') {
    return <ThemeHome onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'auth') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <ThemedAuthWrapper
          onSuccess={(user: any) => {
            console.log('[App] Auth success triggered for:', user?.uid);
            if (user) setCurrentUser(user);
            setCurrentPage('dashboard');
          }}
        />
      </Suspense>
    );
  }

  if (currentPage === 'service-detail') {
    return (
      <div className="relative min-h-screen bg-black">
        <Suspense fallback={null}><BackgroundPaths /></Suspense>
        <Suspense fallback={null}><AnimatedBackground /></Suspense>
        <Suspense fallback={null}><BackgroundStripes /></Suspense>
        <div className="relative z-10">
          <Navbar onNavigate={setCurrentPage} />
          <Suspense fallback={<LoadingFallback />}>
            <ServiceDetailView
              id={selectedServiceId || 'bulk-whatsapp-campaigns'}
              onBack={() => setCurrentPage('services')}
              onNavigate={setCurrentPage}
            />
          </Suspense>
          <AnimatedFooter />
        </div>
      </div>
    );
  }


  // Premium Loading Fallback
  function LoadingFallback() {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[100]">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const MarketingShell = ({ children }: { children: React.ReactNode }) => (
    <div className="relative min-h-screen bg-black text-white">
      <Suspense fallback={null}><BackgroundPaths /></Suspense>
      <Suspense fallback={null}><AnimatedBackground /></Suspense>
      <Suspense fallback={null}><BackgroundStripes /></Suspense>
      <div className="relative z-10">
        <Navbar onNavigate={setCurrentPage} />
        {children}
        <AnimatedFooter onNavigate={setCurrentPage} />
      </div>
    </div>
  );

  // Minimal shell — only Navbar + Footer, no background (for pages with their own bg like YouTubeDownloader)
  const ToolShell = ({ children }: { children: React.ReactNode }) => (
    <div className="relative min-h-screen">
      <div className="relative z-10">
        <Navbar onNavigate={setCurrentPage} />
        {children}
        <AnimatedFooter onNavigate={setCurrentPage} />
      </div>
    </div>
  );

  const renderContent = () => {
    if (currentPage === 'artists') {
      return <ThemeArtistsPage onNavigate={setCurrentPage} />;
    }

    if (currentPage === 'success-stories') {
      return <ThemeSuccessStoriesPage onNavigate={setCurrentPage} />;
    }

    if (currentPage === 'careers') {
      return <ThemeCareersPage onNavigate={setCurrentPage} />;
    }
    if (currentPage === 'about') {
      return <MarketingShell><AboutPage onNavigate={setCurrentPage} /></MarketingShell>;
    }

    if (currentPage === 'contact') {
      return <MarketingShell><ContactPage /></MarketingShell>;
    }

    if (currentPage === 'services') {
      return <MarketingShell><ServicesPage /></MarketingShell>;
    }

    if (currentPage === 'pricing') {
      return <MarketingShell><PricingPage onNavigate={setCurrentPage} /></MarketingShell>;
    }

    if (currentPage === 'sip-calculator') return <MarketingShell><Suspense fallback={null}><SIPCalculator /></Suspense></MarketingShell>;
    if (currentPage === 'compound-interest') return <MarketingShell><Suspense fallback={null}><CompoundInterest /></Suspense></MarketingShell>;
    if (currentPage === 'prop-firm') return <MarketingShell><Suspense fallback={null}><PropFirm /></Suspense></MarketingShell>;
    
    if (currentPage === 'youtubevideodownload') return <ToolShell><Suspense fallback={null}><YouTubeDownloader /></Suspense></ToolShell>;

    if (currentPage === 'whatsapp-link-generator') return <Suspense fallback={null}><ThemeToolsPage onNavigate={setCurrentPage} /></Suspense>;

    if (currentPage === 'whatsapp-direct-message') return <Suspense fallback={null}><ThemeDirectMessagePage onNavigate={setCurrentPage} /></Suspense>;
    if (currentPage === 'whatsapp-form-generator') return <Suspense fallback={null}><ThemeFormPage onNavigate={setCurrentPage} /></Suspense>;

    if (currentPage === 'privacy') return <Suspense fallback={null}><PrivacyPolicy onNavigate={setCurrentPage} /></Suspense>;
    if (currentPage === 'terms') return <Suspense fallback={null}><TermsOfService onNavigate={setCurrentPage} /></Suspense>;
    if (currentPage === 'deletion') return <Suspense fallback={null}><DataDeletion onBack={() => setCurrentPage('landing')} /></Suspense>;
    if (currentPage === 'reset-password') return <Suspense fallback={null}><ResetPasswordView onBack={() => setCurrentPage('landing')} /></Suspense>;
    if (currentPage === 'pay') return <Suspense fallback={null}><PaymentView /></Suspense>;

    if (currentPage === 'threads-callback') {
      return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]"><div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" /></div>}>
          <ThreadsCallback
            user={currentUser}
            loading={authLoading}
            onComplete={() => {
              setCurrentPage('dashboard');
              setActiveTab('integrations');
            }}
          />
        </Suspense>
      );
    }

    if (currentPage === 'instagram-callback') {
      return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]"><div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" /></div>}>
          <InstagramCallback
            user={currentUser}
            loading={authLoading}
            onComplete={() => {
              setCurrentPage('dashboard');
              setActiveTab('integrations');
            }}
          />
        </Suspense>
      );
    }

    // ... default home
    return <ThemeHome onNavigate={setCurrentPage} />;
  };

  const publicPages = [
    'landing', 'services', 'service-detail', 'about', 'success-stories',
    'contact', 'privacy', 'terms', 'deletion', 'careers', 'pricing', 'pay',
    'whatsapp-link-generator', 'artists',
    'whatsapp-direct-message', 'whatsapp-form-generator', 'threads-callback', 'instagram-callback',
    'sip-calculator', 'compound-interest', 'prop-firm', 'youtubevideodownload'
  ];

  if (publicPages.includes(currentPage)) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <Suspense fallback={<LoadingFallback />}>
          {renderContent()}
        </Suspense>
      </div>
    );
  }

  if (!currentUser && currentPage === 'dashboard') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <ThemedAuthWrapper
          onSuccess={(user: any) => {
            console.log('[App] onAuthSuccess (bypass) triggered for:', user?.uid);
            if (user) setCurrentUser(user);
            setCurrentPage('dashboard');
          }}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <DashboardLayout 
        activeTab={activeTab} 
        setActiveTab={handleSetActiveTab} 
        user={currentUser} 
        userRole={userRole}
        isDarkMode={isDarkMode}
        setIsDarkMode={saveAccountTheme}
        handleLogout={handleLogout}
        notifications={notifications}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        allAccounts={globalAccounts}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        hideMobileNav={isChatActive}
      >
      <ErrorBoundary>
        <div key={activeTab} className="flex-1 min-h-0 flex flex-col animate-fade-in">
            <Suspense fallback={
              <div className="flex-1 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              </div>
            }>
              {activeTab === 'overview' && (
                <DashboardOverview
                  campaigns={campaigns}
                  messages={messages}
                  setActiveTab={setActiveTab}
                  setActiveSubTab={setActiveSubTab}
                />
              )}

              {activeTab === 'inbox' && currentUser && <InboxView user={currentUser} messages={messages} isDarkMode={isDarkMode} onChatToggle={setIsChatActive} />}
              {activeTab === 'instagram' && currentUser && (
                <InstagramManager
                  user={currentUser}
                  messages={messages}
                  isDarkMode={isDarkMode}
                  onChatToggle={setIsChatActive}
                  setActiveTab={setActiveTab}
                  activeSubTab={activeSubTab}
                  setActiveSubTab={setActiveSubTab}
                  selectedAccount={selectedAccount}
                  setSelectedAccount={setSelectedAccount}
                  allAccounts={globalAccounts.filter(a => a.platform === 'instagram')}
                />
              )}
              {activeTab === 'whatsapp' && currentUser && (
                <WhatsAppView
                  user={currentUser}
                  campaigns={campaigns.filter(c => c.whatsappAccountId === selectedAccount?.id)}
                  messages={messages.filter(m => m.whatsappAccountId === selectedAccount?.id || m.source === 'website')}
                  isBulkModalOpen={isBulkModalOpen}
                  setIsBulkModalOpen={setIsBulkModalOpen}
                  bulkMessageContent={bulkMessageContent}
                  setBulkMessageContent={setBulkMessageContent}
                  bulkCampaignName={bulkCampaignName}
                  setBulkCampaignName={setBulkCampaignName}
                  activeSubTab={activeSubTab}
                  setActiveSubTab={setActiveSubTab}
                  selectedAccount={selectedAccount}
                  setSelectedAccount={setSelectedAccount}
                  allAccounts={globalAccounts}
                  onConnectAccount={handleFacebookLogin}
                  isDarkMode={isDarkMode}
                  onChatToggle={setIsChatActive}
                />
              )}
              {activeTab === 'flows' && currentUser && <FlowBuilderView user={currentUser} onOpenWidgetSettings={() => { setActiveTab('whatsapp'); setActiveSubTab('accounts'); }} />}
              {activeTab === 'ads' && currentUser && <AdsManagerView user={currentUser} showToast={showToast} />}
              {activeTab === 'contacts' && currentUser && <ContactsView user={currentUser} showToast={showToast} />}
              {activeTab === 'agent' && currentUser && (
                <div className="space-y-6">
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => setActiveTab('agent')}
                      className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'agent' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-200'}`}
                    >
                      Assistant Setup
                    </button>
                    <button
                      onClick={() => setActiveTab('knowledge')}
                      className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'knowledge' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-200'}`}
                    >
                      Knowledge Intel
                    </button>
                  </div>
                  <AgentSetupWizard
                    user={currentUser}
                    onComplete={() => setActiveTab('leads')}
                  />
                </div>
              )}
              {activeTab === 'threads' && currentUser && (
                <ThreadsManager 
                  user={currentUser} 
                  activeSubTab={activeSubTab} 
                  setActiveSubTab={setActiveSubTab} 
                  setActiveTab={setActiveTab}
                  selectedAccount={selectedAccount}
                  setSelectedAccount={setSelectedAccount}
                  allAccounts={globalAccounts.filter(a => a.platform === 'threads')}
                />
              )}
              {activeTab === 'knowledge' && currentUser && <KnowledgeHub user={currentUser} />}
              {activeTab === 'leads' && currentUser && (
                <SalesDashboard
                  user={currentUser}
                  onChatSelect={(id) => {
                    setActiveTab('inbox');
                    // Optional: Set search or filter in inbox
                  }}
                />
              )}
              {activeTab === 'tools' && currentUser && <ToolsView user={currentUser} showToast={showToast} />}
              {activeTab === 'integrations' && <IntegrationsView user={currentUser} showToast={showToast} onNavigate={(tab) => setActiveTab(tab as any)} />}
              {activeTab === 'settings' && (
                <SettingsView
                  isDarkMode={isDarkMode}
                  setIsDarkMode={saveAccountTheme}
                  currentUser={currentUser}
                  onConnectFacebook={handleFacebookLogin}
                  onOpenUsers={() => setActiveTab('users')}
                />
              )}
              {activeTab === 'profile' && currentUser && <ProfileView user={currentUser} />}
              {activeTab === 'users' && currentUser && (
                <UserManagementView
                  user={currentUser}
                  whatsappAccounts={globalAccounts}
                  onBack={() => setActiveTab('settings')}
                />
              )}
              {activeTab === 'manage-pages' && currentUser && (
                <ManagePagesView user={currentUser} showToast={showToast} setActiveTab={setActiveTab} />
              )}
              {activeTab === 'widget' && currentUser && (
                <WidgetConfigView 
                  user={currentUser} 
                  showToast={showToast} 
                  onNavigate={(tab, payload) => {
                    if (payload) (window as any).inboxPreselect = payload;
                    setActiveTab(tab as any);
                  }}
                />
              )}
            </Suspense>
        </div>
      </ErrorBoundary>

      <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none p-8 flex flex-col items-center gap-4">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Suspense fallback={null}>
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            </Suspense>
          </div>
        ))}
      </div>
      </DashboardLayout>
    </Suspense>
  );

}
