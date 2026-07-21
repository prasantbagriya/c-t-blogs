/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from "react-router-dom";
import { User, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Crown, LogOut, Search } from "lucide-react";

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 h-16 sticky top-0 z-50 flex items-center justify-between px-8 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center space-x-12">
        <div className="flex items-center space-x-3">
          <Link to="/playbook" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold transition-all group-hover:bg-indigo-600 shadow-xl shadow-slate-900/10 group-hover:shadow-indigo-600/20">C</div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-tight text-slate-900 leading-none">
                Chatwizs <span className="text-indigo-600 font-medium italic">Playbook</span>
              </span>
            </div>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link 
              to="/admin" 
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2"
            >
              <Crown className="w-3.5 h-3.5 text-indigo-500" />
              Manage
            </Link>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <div className="flex items-center gap-3 bg-slate-50 p-1 pr-4 rounded-full border border-slate-200">
              <div className="w-8 h-8 bg-white rounded-full border border-slate-200 overflow-hidden shadow-sm">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={() => signOut(auth)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
