/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { Navigate } from "react-router-dom";
import { LogIn, ShieldCheck } from "lucide-react";

interface LoginPageProps {
  user: any;
}

export default function LoginPage({ user }: LoginPageProps) {
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-[2rem] shadow-2xl shadow-indigo-500/5 border border-slate-200/60 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />
      
      <div className="relative text-center mb-10">
        <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-slate-900/20 active:scale-95 transition-transform">
          <LogIn className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">System Access</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium tracking-tight uppercase tracking-[0.1em] text-[10px] font-bold">Chatwizs Registry Authentication</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold uppercase tracking-tight mb-6 border border-red-100 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          {error}
        </div>
      )}

      <button
        onClick={handleLogin}
        className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-4 px-6 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 transition-all active:scale-95"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
        Continue with Admin Identity
      </button>

      <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em]">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          Protocol: Google SSO Verified
        </div>
        <p className="text-center text-[10px] text-slate-400 leading-relaxed max-w-[220px] font-medium">
          Access restricted to authorized server administrators only. All sessions are logged and monitored.
        </p>
      </div>
    </div>
  );
}
