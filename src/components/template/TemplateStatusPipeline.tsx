import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const TemplateStatusPipeline = ({ status }: { status: string }) => {
 const stages = [
 { id: 'DRAFT', label: 'Draft', color: 'bg-slate-400' },
 { id: 'PENDING', label: 'Submitted', color: 'bg-amber-500' },
 { id: 'REVIEW', label: 'Review', color: 'bg-blue-500' },
 { id: 'APPROVED', label: 'Live', color: 'bg-emerald-500' }
 ];

 const metaStatus = status?.toUpperCase() || 'DRAFT';
 const isApproved = metaStatus === 'APPROVED';
 const isRejected = metaStatus.includes('REJECTED') || metaStatus === 'DISABLED' || metaStatus === 'PAUSED';
 const isPending = metaStatus === 'PENDING' || metaStatus === 'IN_REVIEW';

 const currentIdx = isApproved ? 3 : (isRejected ? 3 : (isPending ? 2 : (metaStatus !== 'DRAFT' ? 1 : 0)));

 return (
 <div className="w-full py-3">
 <div className="flex items-center justify-between relative">
 <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 dark:bg-[#1a1a24] -translate-y-1/2 z-0" />
 <div
 className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 z-0"
 style={{ width: `${(currentIdx / (stages.length - 1)) * 100}%`, backgroundColor: isRejected ? '#ef4444' : (isApproved ? '#10b981' : '#6366f1') }}
 />

 {stages.map((stage, idx) => {
 const isCompleted = idx <= currentIdx;
 const isCurrent = idx === currentIdx;
 const isStageRejected = isRejected && idx === 3;

 return (
 <div key={stage.id} className="relative z-10 flex flex-col items-center">
 <div className={`w-8 h-8 rounded-none flex items-center justify-center ${isStageRejected ? 'bg-rose-500 text-white ring-4 ring-rose-50 dark:ring-rose-900/40' : (isCompleted ? (idx === 3 ? 'bg-emerald-500 text-white ring-4 ring-emerald-50 dark:ring-emerald-900/40' : 'bg-blue-600 text-white ring-4 ring-blue-50 dark:ring-blue-900/40') : 'bg-white dark:bg-[#16161d] border-2 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-200') }`}>
 {isStageRejected ? <AlertCircle size={14} /> : (isCompleted && !isCurrent ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 rounded-none bg-current" />)}
 </div>
 <span className={`text-[9px] font-medium uppercase tracking-widest mt-2 ${isCurrent ? (isRejected ? 'text-rose-500' : 'text-blue-600 dark:text-blue-400') : 'text-slate-700 dark:text-slate-200'}`}>
 {isStageRejected ? metaStatus.replace('_', ' ') : stage.label}
 </span>
 </div>
 );
 })}
 </div>
 </div>
 );
};
