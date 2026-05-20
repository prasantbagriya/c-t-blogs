import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Shield, 
  Globe, 
  Brain, 
  Sparkles, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle, 
  Smartphone,
  Monitor,
  Mail,
  Send,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import { Facebook } from '../common/BrandIcons';
import { motion, AnimatePresence } from 'motion/react';
import { 
  db, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  connectWhatsAppWithFacebook,
  createAgent,
  updateAgent,
  syncAgentKnowledge,
  getAgentMetadataFromUrl
} from '../../api';

interface AgentSetupWizardProps {
  user: any;
  onComplete: (agent: any) => void;
}

export const AgentSetupWizard = ({ user, onComplete }: AgentSetupWizardProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [persona, setPersona] = useState('Professional');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (step === 1) {
      const q = query(collection(db, 'whatsapp_accounts'), where('uid', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const accs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAccounts(accs);
        if (accs.length > 0 && !selectedAccountId) {
          setSelectedAccountId(accs[0].id);
        }
      });
      return () => unsubscribe();
    }
  }, [step, user.uid]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      await connectWhatsAppWithFacebook(user.uid);
    } catch (err) {
      console.error('Connection failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIdentifyBusiness = async () => {
    if (!websiteUrl) return;
    setLoading(true);
    try {
      if (!agentId) {
        const newAgent = await createAgent(user.uid, {
          name: 'AI Agent',
          websiteUrl,
          status: 'draft'
        });
        setAgentId(newAgent.id);
      }
      const meta = await getAgentMetadataFromUrl(websiteUrl);
      setBusinessName(meta.businessName || '');
      setDescription(meta.description || '');
      setStep(3);
    } catch (err) {
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!agentId || !selectedAccountId) return;
    setLoading(true);
    try {
      await updateAgent(agentId, {
        name: businessName,
        description,
        persona,
        isActive: true,
        linkedChannels: {
          whatsapp: { accountId: selectedAccountId }
        }
      });
      await syncAgentKnowledge(agentId);
      setStep(4);
    } catch (err) {
      console.error('Setup failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Connect', icon: Smartphone },
    { id: 2, title: 'Website', icon: Globe },
    { id: 3, title: 'Persona', icon: Brain },
    { id: 4, title: 'Finish', icon: Sparkles },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-12">
        {steps.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${step >= s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <s.icon size={18} />
              </div>
              <span className={`text-[8px] font-medium uppercase tracking-widest ${step === s.id ? 'text-blue-600' : 'text-slate-400'}`}>{s.title}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-8 h-[1px] mb-6 ${step > s.id ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Card Wrapper */}
      <motion.div 
        layout
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-lg border border-slate-200 dark:border-slate-200 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-4 sm:p-6"
            >
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl font-medium text-slate-900 dark:text-white mb-2">Connect Account</h2>
                <p className="text-sm text-slate-500 font-medium">Select the messaging account for this AI Agent.</p>
              </div>

              {accounts.length > 0 ? (
                <div className="space-y-3 mb-10">
                  {accounts.map(acc => (
                    <button 
                      key={acc.id}
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`w-full p-4 rounded-lg border-2 flex items-center justify-between transition-colors ${selectedAccountId === acc.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-950' : 'border-slate-100 dark:border-slate-200'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone size={18} className={selectedAccountId === acc.id ? 'text-blue-600' : 'text-slate-400'} />
                        <div className="text-left">
                          <p className="font-medium text-xs">{acc.name || 'Account'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{acc.phoneNumber}</p>
                        </div>
                      </div>
                      {selectedAccountId === acc.id && <CheckCircle size={16} className="text-blue-600" />}
                    </button>
                  ))}
                  <button onClick={handleConnect} className="w-full p-4 rounded-lg border border-dashed border-slate-200 text-[10px] font-medium uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                    <Plus size={14} /> Link New Account
                  </button>
                </div>
              ) : (
                <div className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center mb-10">
                  <Facebook size={32} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-xs font-medium text-slate-500 mb-6">Connect your Meta Business account to begin.</p>
                  <button onClick={handleConnect} className="px-6 py-3 bg-blue-600 text-white rounded font-medium text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-colors">
                    Link with Meta
                  </button>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-200">
                <button 
                  disabled={!selectedAccountId || loading}
                  onClick={() => setStep(2)}
                  className="bg-blue-600 text-white px-8 py-3 rounded font-medium text-[10px] uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                >
                  Continue <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-4 sm:p-6"
            >
              <div className="mb-10">
                <h2 className="text-3xl font-medium text-slate-900 dark:text-white mb-2">Website URL</h2>
                <p className="text-sm text-slate-500 font-medium">Add your website to train the AI on your products.</p>
              </div>

              <div className="space-y-6 mb-10">
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 rounded py-4 pl-12 pr-4 text-sm font-medium focus:border-blue-600 transition-colors outline-none dark:text-white font-mono"
                  />
                </div>

                <div className="p-6 border border-emerald-100 dark:border-emerald-900/40 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 flex items-start gap-4">
                  <Zap size={20} className="text-emerald-500 mt-1" />
                  <div>
                    <h4 className="font-medium text-[10px] uppercase tracking-widest text-emerald-600 mb-1">Instant Training</h4>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Our AI will automatically scan your pages to learn about your business.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-200">
                <button onClick={() => setStep(1)} className="text-slate-400 font-medium text-[10px] uppercase tracking-widest flex items-center gap-2"><ArrowLeft size={14} /> Back</button>
                <button 
                  disabled={!websiteUrl || loading}
                  onClick={handleIdentifyBusiness}
                  className="bg-blue-600 text-white px-8 py-3 rounded font-medium text-[10px] uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
                  {loading ? 'Scanning...' : 'Start Training'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-4 sm:p-6"
            >
              <div className="mb-10">
                <h2 className="text-3xl font-medium text-slate-900 dark:text-white mb-2">Agent Persona</h2>
                <p className="text-sm text-slate-500 font-medium">Set your agent's name and speaking style.</p>
              </div>

              <div className="space-y-6 mb-10">
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-2 block">Agent Name</label>
                    <input 
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 rounded p-3 text-sm font-medium outline-none focus:border-blue-600 transition-colors dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-2 block">Voice Tone</label>
                    <div className="flex flex-wrap gap-2">
                      {['Professional', 'Friendly', 'Energetic', 'Expert'].map(p => (
                        <button 
                          key={p} onClick={() => setPersona(p)}
                          className={`px-4 py-2 rounded text-[9px] font-medium uppercase tracking-wider transition-colors ${persona === p ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-200">
                <button onClick={() => setStep(2)} className="text-slate-400 font-medium text-[10px] uppercase tracking-widest flex items-center gap-2"><ArrowLeft size={14} /> Back</button>
                <button 
                  disabled={loading || !businessName}
                  onClick={handleFinalize}
                  className="bg-blue-600 text-white px-8 py-3 rounded font-medium text-[10px] uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Launch Agent
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4" initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="p-6 sm:p-8 text-center"
            >
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center mx-auto mb-8">
                <Sparkles size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-medium text-slate-900 dark:text-white mb-4">Setup Complete</h2>
              <p className="text-sm text-slate-500 dark:text-slate-200 max-w-xs mx-auto mb-10 font-medium">
                The agent for <span className="text-blue-600 font-medium">{businessName}</span> is now active and ready to handle queries.
              </p>
              
              <button 
                onClick={() => onComplete(agentId)}
                className="w-full bg-slate-900 dark:bg-slate-800 text-white py-4 rounded font-medium text-[10px] uppercase tracking-widest hover:bg-black transition-colors"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
