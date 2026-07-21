"use client"

import React from "react"
import { motion } from "motion/react"
import { Zap, CheckCircle2, ShieldCheck, Zap as ZapIcon } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side: Social Proof & Stats (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 p-12 flex-col justify-between overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <ZapIcon className="text-black w-5 h-5 fill-black" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tighter">ChatWizs</span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-black text-white mb-6 leading-tight">
              Scale your business <br />
              <span className="text-blue-400 font-mono">messaging</span> instantly.
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-sm">
              The world's most powerful WhatsApp Business API platform for modern teams.
            </p>
          </motion.div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-3xl font-black text-white mb-1">50K+</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">Active Users</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-3xl font-black text-white mb-1">99.9%</div>
              <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">Uptime</div>
            </div>
          </div>

          {/* Feature List */}
          <div className="space-y-4">
            {[
              "Official WhatsApp Business API",
              "Multi-agent Shared Inbox",
              "Drag-and-Drop Flow Builder",
              "Advanced Analytics & ROI Tracking"
            ].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 text-gray-300"
              >
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <span className="font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 flex items-center gap-3 text-gray-500 text-sm py-4 grayscale opacity-50">
           <ShieldCheck className="w-5 h-5" />
           <span>Enterprise-grade security. GDPR & SOC2 Compliant.</span>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 relative bg-black flex flex-col items-center justify-center p-5 sm:p-12 overflow-y-auto">
         {/* Mobile Background Gradients (Visible only on mobile/tablet) */}
         <div className="lg:hidden absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
         <div className="lg:hidden absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

         {/* Refined Mobile Header */}
         <div className="lg:hidden absolute top-6 flex items-center justify-center w-full px-6 z-20">
            <div className="flex items-center gap-2.5 backdrop-blur-md bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
               <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center ">
                  <ZapIcon className="text-black w-3.5 h-3.5 fill-black" />
               </div>
               <span className="text-lg font-bold text-white tracking-tighter">ChatWizs</span>
            </div>
         </div>

         <div className="w-full max-w-md relative z-10 pt-16 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 sm:mb-10"
            >
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">{title}</h2>
              <p className="text-gray-500 text-sm sm:text-base font-medium">{subtitle}</p>
            </motion.div>

            {children}
         </div>
         
         {/* Footer Links */}
         <div className="mt-12 text-center relative z-10">
            <p className="text-gray-600 text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} ChatWizs Optimus TM. All rights reserved.
            </p>
         </div>
      </div>
    </div>
  )
}
