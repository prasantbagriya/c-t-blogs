import React from 'react';
import { Trash2, ArrowLeft, Mail, ShieldCheck } from 'lucide-react';

interface DataDeletionProps {
  onBack: () => void;
}

export const DataDeletion: React.FC<DataDeletionProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12 px-4 transition-all">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 font-bold text-sm"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 md:p-10 border border-slate-200 dark:border-slate-200">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-rose-600 rounded flex items-center justify-center text-white">
              <Trash2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data Deletion</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Control your privacy</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck size={16} className="text-emerald-500" /> Information Control
              </h3>
              <p className="text-slate-500 dark:text-slate-200 text-xs font-medium leading-relaxed">
                We respect your privacy. You can request full deletion of your business data and account information at any time through our automated systems or direct contact.
              </p>
            </div>

            <section className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Deletion Steps</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-wide">Facebook Settings</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-200 leading-relaxed">
                      Visit your Facebook Profile Settings {'>'} Apps and Websites. Locate ChatWiz and select Remove to revoke API access and trigger automated data purge.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-wide">Manual Purge</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-200 leading-relaxed">
                      Email our compliance team. We will identify all associated records and permanently remove them from our production servers within 48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-200">
              <div className="bg-slate-900 dark:bg-slate-800 rounded-lg p-8 text-center text-white">
                <Mail className="w-8 h-8 mx-auto mb-4 text-blue-400" />
                <h3 className="text-lg font-bold mb-1 uppercase tracking-tight">Compliance Support</h3>
                <p className="text-slate-400 mb-6 text-xs font-medium">Contact us for any privacy-related queries.</p>
                <a href="mailto:support@chatwiz.com" className="inline-block px-8 py-3 bg-blue-600 text-white rounded font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all">
                  support@chatwiz.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
