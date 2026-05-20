"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from "lucide-react"
import { Facebook } from "@/src/components/common/BrandIcons"
import { Button } from "@/src/theme_migration/components/ui/button"
import { loginWithEmail, signInWithFacebook } from "@/src/api"
import AuthLayout from "./auth-layout"

interface LoginViewProps {
  onSuccess: (user: any) => void
  onSwitchToSignup: () => void
  onForgotPassword: () => void
}

export default function LoginView({ onSuccess, onSwitchToSignup, onForgotPassword }: LoginViewProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
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
      const user = await loginWithEmail(email, password)
      onSuccess(user)
    } catch (err: any) {
      // Map common errors
      const msg = err.message || ""
      if (msg.includes("401") || msg.includes("Unauthorized")) {
        setError("Invalid email or password. Please try again.")
      } else if (msg.includes("404")) {
        setError("Account not found. Please sign up instead.")
      } else if (msg.includes("network")) {
        setError("Network error. Please check your connection.")
      } else {
        setError(msg || "Authentication failed. Please try again later.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const user = await signInWithFacebook()
      onSuccess(user)
    } catch (err: any) {
      setError(err.message || "Facebook login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your ChatWizs account">
      <motion.form
        onSubmit={handleLogin}
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

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors py-1"
            >
              Forgot password?
            </button>
          </div>
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
          className="w-full bg-white text-black hover:bg-gray-100 h-14 sm:h-16 rounded-2xl font-black text-lg transition-all active:scale-[0.98] mt-2 group"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <span className="flex items-center gap-2">
              Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </Button>
      </motion.form>

      <div className="mt-8 relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
        <div className="relative flex justify-center text-[10px] sm:text-xs uppercase"><span className="bg-black px-4 text-gray-500 font-bold tracking-widest">Or continue with</span></div>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={handleFacebookLogin}
          disabled={loading}
          className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white h-14 sm:h-16 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
        >
          <Facebook className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
          Connect with Facebook
        </button>
      </div>

      <div className="mt-8 sm:mt-10 text-center">
        <p className="text-gray-500 text-sm font-medium">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-white font-black hover:underline underline-offset-4 px-1 py-2"
          >
            Create one today
          </button>
        </p>
      </div>
    </AuthLayout>
  )
}
