"use client"

import React, { useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"

export type ToastType = "success" | "error" | "info"

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = "info", onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  }

  const styles = {
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    error: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl min-w-[320px] max-w-[90vw] ${styles[type]}`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm font-medium leading-tight">{message}</p>
      <button 
        onClick={onClose}
        className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg "
      >
        <X className="w-4 h-4 opacity-50" />
      </button>
      
      {/* Progress bar */}
      <motion.div 
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-0.5 rounded-full ${ type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-rose-500' : 'bg-blue-500' }`}
      />
    </motion.div>
  )
}
