import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Threads } from '../common/BrandIcons';
import { API_URL, getHeaders } from '../../api/common';

export const ThreadsCallback = ({ user, loading, onComplete }: { user: any, loading?: boolean, onComplete?: () => void }) => {
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
 setErrorMsg('You must be logged in to ChatWizs to link your Threads account.');
 }
 }, [user, loading]);

 const handleCallback = async (code: string) => {
 try {
 const res = await fetch(`${API_URL}/threads/callback`, {
 method: 'POST',
 headers: getHeaders(),
 body: JSON.stringify({
 code,
 uid: user.uid,
 redirectUri: window.location.href.split('?')[0]
 })
 });

 const data = await res.json();
 if (res.ok) {
 setStatus('success');
 setTimeout(() => {
 if (onComplete) onComplete();
 else window.location.href = '/dashboard#integrations';
 }, 2000);
 } else {
 setStatus('error');
 setErrorMsg(data.error || 'Failed to link Threads account');
 }
 } catch (err: any) {
 setStatus('error');
 setErrorMsg(err.message);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0f] p-6">
 <div className="max-w-md w-full bg-white dark:bg-[#16161d] rounded-none p-10 border border-slate-200 dark:border-white/5 text-center">
 <div className="w-20 h-20 bg-black rounded-none flex items-center justify-center mx-auto mb-8 ">
 <Threads size={40} className="text-white" />
 </div>

 {status === 'loading' && (
 <div className="space-y-4">
 <RefreshCw className=" text-black mx-auto" size={32} />
 <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Linking Threads...</h2>
 <p className="text-sm text-slate-500 font-medium">Please wait while we establish a secure connection with Meta.</p>
 </div>
 )}

 {status === 'success' && (
 <div className="space-y-4">
 <CheckCircle2 className="text-emerald-500 mx-auto" size={48} />
 <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Account Linked!</h2>
 <p className="text-sm text-slate-500 font-medium">Your Threads account is now ready. Redirecting you back...</p>
 </div>
 )}

 {status === 'error' && (
 <div className="space-y-4">
 <AlertCircle className="text-rose-500 mx-auto" size={48} />
 <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Connection Failed</h2>
 <p className="text-sm text-slate-500 font-medium">{errorMsg}</p>
 {(errorMsg.includes('[1]') || errorMsg.includes('Failed')) && (
 <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-none text-[10px] text-amber-800 dark:text-amber-200 text-left space-y-2">
 <p className="font-bold uppercase tracking-widest text-center mb-2">Troubleshooting Steps:</p>
 <ul className="list-disc pl-4 space-y-1">
 <li>Ensure <strong>THREADS_APP_ID</strong> and <strong>THREADS_APP_SECRET</strong> in your .env are correct.</li>
 <li>In Meta Dashboard, go to <strong>Threads</strong> {'>'} <strong>Settings</strong> and add: <br/><code className="bg-black/10 px-1 rounded-none">{window.location.origin}/threads-callback</code> to the <strong>Redirect URIs</strong>.</li>
 <li>Check if your Meta App is in <strong>Live Mode</strong>.</li>
 <li>Verify that your account has a public Threads profile.</li>
 </ul>
 </div>
 )}
 <button 
 onClick={() => window.location.href = '/dashboard#integrations'}
 className="mt-6 px-8 py-3 bg-slate-100 dark:bg-white/5 rounded-none text-xs font-black uppercase tracking-widest"
 >
 Back to Integrations
 </button>
 </div>
 )}
 </div>
 </div>
 );
};
