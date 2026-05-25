import React, { useState, useEffect } from 'react';
import {
  Globe,
  Zap,
  LayoutDashboard,
  Smartphone,
  Plus,
  Calculator,
  PieChart,
  TrendingUp,
  ExternalLink,
  Video
} from 'lucide-react';
import { motion } from 'motion/react';
import { API_URL, safeJson } from '../api';

interface ToolsViewProps {
  user: any;
  showToast: (msg: string, type: any) => void;
}

export const ToolsView = ({ user, showToast }: ToolsViewProps) => {
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [qrVisible, setQrVisible] = useState(false);



  const handleGenerate = () => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedText = encodeURIComponent(text);
    const link = `https://wa.me/${cleanPhone}${text ? `?text=${encodedText}` : ''}`;
    setGeneratedLink(link);
    setQrVisible(true);
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-8">
      <div className="py-2 sm:py-4 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">Marketing Tools</h2>
        <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-200">Power utilities for growing your WhatsApp audience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
        <div className="bg-white dark:bg-[#16161d] p-5 sm:p-8 rounded-lg border border-slate-200 dark:border-white/5 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">Link Generator</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2 block">WhatsApp Number</label>
              <input
                type="text"
                placeholder="e.g. 1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-lg text-xs sm:text-sm focus:border-blue-500 outline-none transition-colors dark:text-white"
              />
            </div>
            <div>
              <label className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2 block">Pre-filled Message</label>
              <textarea
                rows={3}
                placeholder="Hello! I'm interested..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-lg text-xs sm:text-sm focus:border-blue-500 outline-none transition-colors dark:text-white resize-none"
              />
            </div>
            <button
              onClick={handleGenerate}
              className="w-full py-3 sm:py-4 bg-blue-600 text-white rounded-lg font-medium text-xs sm:text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              Generate <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#16161d] p-5 sm:p-8 rounded-lg border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center">
          {qrVisible ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 sm:space-y-6 w-full"
            >
              <div className="p-3 sm:p-4 bg-white rounded-2xl border-2 border-slate-50 inline-block mx-auto">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(generatedLink)}`}
                  alt="QR Code"
                  className="w-32 h-32 sm:w-48 sm:h-48"
                />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Your Short Link</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    type="text"
                    value={generatedLink}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-lg text-[10px] sm:text-xs text-blue-600 font-medium text-center"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLink);
                      showToast('Link copied!', 'success');
                    }}
                    className="flex-1 py-2 sm:py-2.5 bg-slate-100 dark:bg-[#16161d] text-slate-600 dark:text-slate-200 rounded-lg text-[10px] sm:text-xs font-bold hover:bg-slate-200 border border-slate-200 dark:border-white/5 transition-all"
                  >
                    Copy
                  </button>
                  <a
                    href={generatedLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg text-[10px] sm:text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center"
                  >
                    Test
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto">
                <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
              </div>
              <p className="text-slate-400 text-[10px] sm:text-sm italic px-4">Preview and QR code tracking will appear here.</p>
            </div>
          )}
        </div>
      </div>

      <div className="py-2 sm:py-4 mt-8 text-center sm:text-left border-t border-slate-200 dark:border-white/5 pt-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">Financial Calculators</h2>
        <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-200">Tools to forecast and calculate financial growth.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* SIP Calculator Card */}
        <div 
          onClick={() => {
            window.history.pushState({}, '', '/sip-calculator');
            window.dispatchEvent(new CustomEvent('app-navigate', { detail: '/sip-calculator' }));
          }}
          className="cursor-pointer bg-white dark:bg-[#16161d] p-5 sm:p-6 rounded-lg border border-slate-200 dark:border-white/5 hover:border-blue-500 transition-colors group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                <PieChart className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white mb-2">SIP Forecaster</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Calculate estimated returns on your monthly SIP investments over time.</p>
          </div>
        </div>

        {/* Compound Interest Card */}
        <div 
          onClick={() => {
            window.history.pushState({}, '', '/compound-interest');
            window.dispatchEvent(new CustomEvent('app-navigate', { detail: '/compound-interest' }));
          }}
          className="cursor-pointer bg-white dark:bg-[#16161d] p-5 sm:p-6 rounded-lg border border-slate-200 dark:border-white/5 hover:border-emerald-500 transition-colors group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white mb-2">Compound Interest</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Find out how much your lumpsum investment will grow with compound interest.</p>
          </div>
        </div>

        {/* Prop Firm Card */}
        <div 
          onClick={() => {
            window.history.pushState({}, '', '/prop-firm');
            window.dispatchEvent(new CustomEvent('app-navigate', { detail: '/prop-firm' }));
          }}
          className="cursor-pointer bg-white dark:bg-[#16161d] p-5 sm:p-6 rounded-lg border border-slate-200 dark:border-white/5 hover:border-purple-500 transition-colors group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white mb-2">Prop Firm Calculator</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Calculate trading objectives and drawdown limits for prop firm challenges.</p>
          </div>
        </div>
      </div>

      <div className="py-2 sm:py-4 mt-8 text-center sm:text-left border-t border-slate-200 dark:border-white/5 pt-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">Media Tools</h2>
        <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-200">Tools for media extraction and generation.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* YouTube Downloader Card */}
        <div 
          onClick={() => {
            window.history.pushState({}, '', '/youtube-downloader');
            window.dispatchEvent(new CustomEvent('app-navigate', { detail: '/youtube-downloader' }));
          }}
          className="cursor-pointer bg-white dark:bg-[#16161d] p-5 sm:p-6 rounded-lg border border-slate-200 dark:border-white/5 hover:border-red-500 transition-colors group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                <Video className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white mb-2">YouTube Downloader</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Download high-quality videos and audio from YouTube and other platforms.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
