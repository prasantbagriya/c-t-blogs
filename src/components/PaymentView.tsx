import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, Zap, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { API_URL, safeJson } from '../api';

const PaymentView = () => {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [paymentData, setPaymentData] = useState<any>(null);

    // Parse URL params
    useEffect(() => {
        const pathParts = window.location.pathname.split('/');
        const flowId = pathParts[2];
        const nodeId = pathParts[3];
        
        const params = new URLSearchParams(window.location.search);
        const rawUid = params.get('uid');
        const rawAmount = params.get('amount');
        const typeParam = params.get('type');
        const type = typeParam && typeParam !== 'undefined' ? typeParam : 'one_time';

        // Log for debugging (User can see this in console)
        console.log('[PaymentView] Raw Params:', { flowId, nodeId, rawUid, rawAmount, type });

        const data = {
            flowId,
            nodeId,
            amount: (rawAmount === 'undefined' || !rawAmount) ? '' : rawAmount,
            currency: params.get('currency') || 'INR',
            uid: (rawUid === 'undefined' || !rawUid) ? '' : rawUid,
            visitorId: params.get('visitorId'),
            type: type,
            planId: params.get('planId') === 'undefined' ? '' : (params.get('planId') || ''),
            description: params.get('description') === 'undefined' ? '' : (params.get('description') || 'ChatWiz Secure Payment')
        };

        if (!data.uid) {
            console.error('[PaymentView] Missing UID in link:', window.location.href);
            setError('Invalid payment link. Missing account identifier (UID).');
            setLoading(false);
            return;
        }

        if (data.type !== 'subscription' && !data.amount) {
            console.error('[PaymentView] Missing Amount in link:', window.location.href);
            setError('Invalid payment link. Missing amount info.');
            setLoading(false);
            return;
        }

        setPaymentData(data);
        setLoading(false);
    }, []);

    const loadScript = (src: string) => {
        return new Promise((resolve) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = () => resolve(true);
            s.onerror = () => resolve(false);
            document.head.appendChild(s);
        });
    };

    const handlePayment = async () => {
        setStatus('processing');
        setError(null);

        try {
            // 1. Ensure Razorpay is loaded
            if (!(window as any).Razorpay) {
                const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
                if (!loaded) throw new Error('Failed to load payment gateway. Check your connection.');
            }

            // 2. Create Order on Backend
            const res = await fetch(`${API_URL}/payments/razorpay/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: paymentData.amount,
                    currency: paymentData.currency,
                    description: paymentData.description,
                    paymentType: paymentData.type,
                    planId: paymentData.planId,
                    uid: paymentData.uid,
                    customerInfo: { 
                        visitorId: paymentData.visitorId,
                        source: 'whatsapp' // Links from WhatsApp
                    }
                })
            });

            const order = await safeJson(res);
            if (!res.ok) throw new Error(order.error || 'Failed to initialize payment');

            // 3. Open Checkout
            const options = {
                key: order.key,
                amount: order.amount,
                currency: order.currency,
                name: "ChatWiz Secure Checkout",
                description: paymentData.description,
                image: "/logo.png",
                order_id: paymentData.type === 'subscription' ? undefined : order.id,
                subscription_id: paymentData.type === 'subscription' ? order.id : undefined,
                handler: async (response: any) => {
                    setStatus('processing');
                    const vRes = await fetch(`${API_URL}/payments/razorpay/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...response,
                            uid: paymentData.uid
                        })
                    });
                    const vData = await vRes.json();
                    if (vData.success) {
                        setStatus('success');
                    } else {
                        throw new Error('Verification failed. Please contact support.');
                    }
                },
                modal: {
                    ondismiss: () => {
                        setStatus('idle');
                    }
                },
                theme: { color: "#3B82F6" }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred during payment.');
            setStatus('error');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-[#0b141a] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 text-center shadow-2xl border border-white/5"
                >
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Payment Successful!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
                        Your transaction was completed successfully. You can close this window and return to your chat.
                    </p>
                    <button 
                        onClick={() => window.close()}
                        className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                    >
                        DONE
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b141a] flex items-center justify-center p-4 sm:p-6 font-sans">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white dark:bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 relative z-10"
            >
                {/* Header */}
                <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/20">
                            <Zap className="w-8 h-8 fill-white text-white" />
                        </div>
                        <h1 className="text-xl font-black tracking-tight uppercase">Secure Checkout</h1>
                        <p className="text-blue-100 text-xs font-bold opacity-80 mt-1 uppercase tracking-widest">Powered by Razorpay</p>
                    </div>
                </div>

                <div className="p-8 sm:p-10">
                    {/* Order Info */}
                    <div className="mb-8 space-y-4">
                        <div className="flex justify-between items-center text-slate-400 text-[10px] uppercase font-black tracking-widest">
                            <span>Description</span>
                            <span>Amount</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg leading-tight">
                                    {paymentData?.description}
                                </h3>
                                <p className="text-slate-500 text-xs mt-1">
                                    {paymentData?.type === 'subscription' ? 'Monthly Subscription' : 'One-time Payment'}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                    {paymentData?.currency} {paymentData?.amount}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-white/5 mb-8" />

                    {/* Features */}
                    <div className="space-y-4 mb-10">
                        <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Encrypted Transaction</p>
                                <p className="text-[10px] text-slate-500 uppercase">256-bit SSL secured payments</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Multiple Options</p>
                                <p className="text-[10px] text-slate-500 uppercase">Cards, UPI, Netbanking & Wallets</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3"
                        >
                            <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs font-bold text-rose-500 leading-relaxed">{error}</p>
                        </motion.div>
                    )}

                    {/* Pay Button */}
                    <button
                        onClick={handlePayment}
                        disabled={status === 'processing'}
                        className={`w-full py-5 rounded-[1.25rem] font-black text-sm uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group
                            ${status === 'processing' 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-slate-900 dark:bg-blue-600 text-white hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-500/20'
                            }`}
                    >
                        {status === 'processing' ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Pay Now
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">
                        Transaction managed by ChatWiz Global Secure Gateway
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentView;
