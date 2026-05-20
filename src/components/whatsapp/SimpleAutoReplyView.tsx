import React, { useState, useEffect } from 'react';
import { MessageSquare, Zap, Users } from 'lucide-react';
import { updateDoc } from '../../api';

interface SimpleAutoReplyViewProps {
  user: any;
  selectedAccount: any;
}

export const SimpleAutoReplyView = ({ user, selectedAccount }: SimpleAutoReplyViewProps) => {
    const [greeting, setGreeting] = useState("Hello! Welcome to our business. How can we help you today?");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (selectedAccount?.greeting) {
            setGreeting(selectedAccount.greeting);
        }
    }, [selectedAccount?.id]);

    const handleSave = async () => {
        if (!selectedAccount) {
            (window as any).showToast("Please select a WhatsApp account first", "error");
            return;
        }

        setIsSaving(true);
        try {
            await updateDoc(`whatsapp_accounts/${selectedAccount.id}`, {
                greeting: greeting
            });
            (window as any).showToast("Auto-reply updated successfully", "success");
        } catch (error: any) {
            console.error("Save error:", error);
            (window as any).showToast(error.message || "Failed to update auto-reply", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="py-3 sm:py-4 lg:py-6 px-0 w-full space-y-4 sm:space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2 px-4 lg:px-0">
                <h2 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight">Simple Auto-Reply</h2>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-1">Basic greeting for new conversations</p>
            </div>

            <div className="bg-white dark:bg-[#16161d] border border-slate-200 dark:border-white/5 rounded-2xl p-4 sm:p-6 shadow-none space-y-4 sm:space-y-6">
                <div className="space-y-4">
                    <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-200 tracking-wider flex items-center gap-2">
                        <MessageSquare size={12} className="text-blue-500" />
                        Greeting Message
                    </label>
                    <textarea 
                        value={greeting}
                        onChange={(e) => setGreeting(e.target.value)}
                        placeholder="Type your welcome message here..."
                        rows={6}
                        className="w-full bg-slate-50 dark:bg-[#1a1a24] border border-slate-100 dark:border-white/5 rounded-xl p-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                    />
                    <p className="text-[10px] text-slate-700 dark:text-slate-200 italic">This message will be sent automatically when a user first contacts you.</p>
                </div>

                <div className="flex justify-center items-center pt-4 border-t border-slate-100 dark:border-white/5">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save Configuration"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl">
                    <Zap className="text-blue-600 mb-4" size={24} />
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-400 tracking-tight mb-2">Instant Response</h3>
                    <p className="text-xs text-blue-700/70 dark:text-blue-300/60 leading-relaxed">Ensure your customers never wait for a reply, even outside business hours.</p>
                </div>
                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl">
                    <Users className="text-emerald-600 mb-4" size={24} />
                    <h3 className="text-sm font-medium text-emerald-900 dark:text-emerald-400 tracking-tight mb-2">First Impression</h3>
                    <p className="text-xs text-emerald-700/70 dark:text-emerald-300/60 leading-relaxed">Set a professional tone from the very first message your customers send.</p>
                </div>
            </div>
        </div>
    );
};
