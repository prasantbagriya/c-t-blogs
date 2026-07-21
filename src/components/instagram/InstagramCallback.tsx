import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Instagram } from '../common/BrandIcons';
import { connectInstagramWithCode } from '../../api';

export const InstagramCallback = ({ user, loading, onComplete }: { user: any, loading?: boolean, onComplete: () => void }) => {
 const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
 const [errorMsg, setErrorMsg] = useState('');

 const processedRef = React.useRef(false);

 useEffect(() => {
 if (loading || processedRef.current) return;

 const params = new URLSearchParams(window.location.search);
 const code = params.get('code');
 const error = params.get('error');
 const errorDesc = params.get('error_description');

 if (error) {
 processedRef.current = true;
 setStatus('error');
 setErrorMsg(`Meta Error: ${errorDesc || error}`);
 } else if (code && user?.uid) {
 processedRef.current = true;
 handleCallback(code);
 } else if (!code) {
 setStatus('error');
 setErrorMsg('No authorization code found in URL from Meta.');
 } else if (!user?.uid) {
 setStatus('error');
 setErrorMsg('You must be logged in to ChatWizs to link your Instagram account.');
 }
 }, [user, loading]);

 const handleCallback = async (code: string) => {
 try {
 const result: any = await connectInstagramWithCode(user.parentId || user.uid, code);
 if (result.success) {
 setStatus('success');
 setTimeout(() => {
 // Clear URL params and notify app
 window.history.replaceState({}, '', window.location.pathname);
 onComplete();
 }, 2000);
 } else {
 setStatus('error');
 setErrorMsg('Failed to sync Instagram account with server.');
 }
 } catch (err: any) {
 console.error('[IG Callback] Error:', err);
 setStatus('error');
 setErrorMsg(err.message || 'An unexpected error occurred during connection.');
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0f] p-6">
 <div className="max-w-md w-full bg-white dark:bg-[#16161d] rounded-none p-10 border border-slate-200 dark:border-white/5 text-center">
 <div className="w-20 h-20 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-none flex items-center justify-center mx-auto mb-8 ">
 <Instagram size={40} className="text-white" />
 </div>

 {status === 'loading' && (
 <div className="space-y-4">
 <RefreshCw className=" text-slate-400 mx-auto" size={32} />
 <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Syncing Instagram...</h2>
 <p className="text-sm text-slate-500 font-medium">Establishing secure connection with Meta Graph API.</p>
 </div>
 )}

 {status === 'success' && (
 <div className="space-y-4">
 <CheckCircle2 className="text-emerald-500 mx-auto" size={48} />
 <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Account Connected!</h2>
 <p className="text-sm text-slate-500 font-medium">Your Business Profile has been successfully linked. Redirecting...</p>
 </div>
 )}

 {status === 'error' && (
 <div className="space-y-4">
 <AlertCircle className="text-rose-500 mx-auto" size={48} />
 <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Connection Failed</h2>
 <p className="text-sm text-slate-500 font-medium">{errorMsg}</p>
 <button 
 onClick={() => window.location.href = '/dashboard#integrations'}
 className="mt-6 px-8 py-3 bg-black text-white rounded-none text-[10px] font-black uppercase tracking-widest "
 >
 Back to Integrations
 </button>
 </div>
 )}
 </div>
 </div>
 );
};
