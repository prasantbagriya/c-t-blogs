"use client"

import React, { useState } from "react"
import { motion } from "motion/react"
import { Mail, Loader2, ArrowLeft, Send, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/src/theme_migration/components/ui/button"
import { forgotPassword } from "@/src/api"
import AuthLayout from "./auth-layout"

interface ForgotPasswordViewProps {
  onBackToLogin: () => void
}

export default function ForgotPasswordView({ onBackToLogin }: ForgotPasswordViewProps) {
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [channels, setChannels] = useState<string[]>([])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await forgotPassword(email, phone)
      setChannels(res.channels || ['Email'])
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to send reset link. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      title={success ? "Recovery Sent" : "Reset Password"} 
      subtitle={success ? "Check your chosen channel for the reset link." : "Choose your preferred recovery method"}
    >
      {!success ? (
        <form onSubmit={handleReset} className="space-y-6">
          <div className="flex p-1.5 bg-white/5 border border-white/10 rounded-2xl mb-2">
            <button
              type="button"
              onClick={() => setMethod('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold ${method === 'email' ? 'bg-white text-black ' : 'text-gray-500 hover:text-white'}`}
            >
              <Mail className="w-4 h-4" /> Email
            </button>
            <button
              type="button"
              onClick={() => setMethod('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold ${method === 'phone' ? 'bg-white text-black ' : 'text-gray-500 hover:text-white'}`}
            >
              <Phone className="w-4 h-4" /> Phone (SMS)
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            {method === 'email' ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 " />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 "
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 " />
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 "
                  />
                </div>
                <p className="text-[10px] text-gray-500 ml-1">Include country code for international delivery.</p>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black hover:bg-gray-100 h-14 rounded-2xl font-black text-lg active:scale-[0.98] group "
          >
            {loading ? <Loader2 className="w-6 h-6 " /> : (
              <span className="flex items-center gap-2">
                Send Recovery <Send className="w-5 h-5" />
              </span>
            )}
          </Button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-white font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </button>
        </form>
      ) : (
        <div className="space-y-8">
           <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-center">
              <div className="flex justify-center gap-4 mb-4">
                {channels.includes('Email') && <Mail className="w-8 h-8 opacity-50" />}
                {channels.includes('SMS') && <MessageSquare className="w-8 h-8 opacity-50" />}
              </div>
              A recovery link has been sent to your <strong>{channels.join(' & ')}</strong>. Please check and follow the instructions.
           </div>
           <Button 
              onClick={onBackToLogin}
              className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 h-14 rounded-2xl font-black text-lg active:scale-[0.98]"
           >
              Return to Login
           </Button>
        </div>
      )}
    </AuthLayout>
  )
}
