"use client"

import React, { useState } from "react"
import { motion } from "motion/react"
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from "lucide-react"
import { Button } from "@/src/theme_migration/components/ui/button"
import { signUpWithEmail } from "@/src/api"
import AuthLayout from "./auth-layout"
import { AnimatePresence } from "motion/react"

interface SignupViewProps {
  onSuccess: (user: any) => void
  onSwitchToLogin: () => void
}

export default function SignupView({ onSuccess, onSwitchToLogin }: SignupViewProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (name.length < 2) {
      setError("Please enter your full name")
      return
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const user = await signUpWithEmail(email, password, name)
      onSuccess(user)
    } catch (err: any) {
      const msg = err.message || ""
      if (msg.includes("409") || msg.includes("already exists")) {
        setError("An account with this email already exists.")
      } else {
        setError(msg || "Signup failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create Account" subtitle="Join ChatWizs to scale your messaging">
      <motion.form 
        onSubmit={handleSignup} 
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="space-y-4 sm:space-y-5"
      >
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs sm:text-sm font-medium flex items-center gap-3 overflow-hidden"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-white text-base placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-white text-base placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2 pb-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 sm:py-4 pl-12 pr-12 text-white text-base placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-2"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-white text-black hover:bg-gray-100 h-14 sm:h-16 rounded-2xl font-black text-lg transition-all active:scale-[0.98] group mt-2 sm:mt-4"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <span className="flex items-center gap-2">
              Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
      </motion.form>

      <div className="mt-8 text-center bg-white/5 p-4 rounded-xl border border-white/5 text-[10px] sm:text-xs text-gray-500">
        By continuing, you agree to ChatWizs'{" "}
        <a href="/terms" className="text-gray-400 hover:underline">Terms of Service</a> and{" "}
        <a href="/privacy" className="text-gray-400 hover:underline">Privacy Policy</a>.
      </div>

      <div className="mt-8 sm:mt-10 text-center">
        <p className="text-gray-500 text-sm font-medium">
          Already have an account?{" "}
          <button 
            onClick={onSwitchToLogin}
            className="text-white font-black hover:underline underline-offset-4 px-1 py-2"
          >
            Sign in
          </button>
        </p>
      </div>
    </AuthLayout>
  )
}
