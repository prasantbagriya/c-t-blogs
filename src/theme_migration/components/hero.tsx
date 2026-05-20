"use client"

import { Button } from "@/src/theme_migration/components/ui/button"
import { ArrowRight, Zap, Shield, X } from "lucide-react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"

export default function Hero({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden">
      {/* Video Modal Overlay */}
      <AnimatePresence>
        {showVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8"
            onClick={() => setShowVideo(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-md transition-colors"
                onClick={() => setShowVideo(false)}
              >
                <X className="w-6 h-6" />
              </button>
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/F6CHHfyaZuM?autoplay=1"
                title="ChatWizs Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="w-full max-w-7xl mx-auto px-4 relative z-20"
      >
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in shadow-inner">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-sm font-medium text-gray-400">Trusted by 10,000+ Businesses Globally</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
            Scale Your Business <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400">
              With Smart AI
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl leading-relaxed">
            Revolutionize your customer engagement with our advanced WhatsApp API, AI flow builders, and automated messaging tools.
          </p>

          <div className="flex flex-col gap-12 lg:items-start items-center">
            {/* CTA Section */}
            <div className="w-full flex flex-row gap-3 sm:gap-4 items-center justify-center lg:justify-start">
              <button onClick={() => onNavigate?.('auth')} className="group relative">
                <div className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(45deg,#4f46e5,#9333ea,#ec4899,#4f46e5)] bg-[length:200%_200%] animate-rainbow blur-[2px]" />
                <motion.div 
                  className="relative z-10 rounded-xl bg-white text-black px-4 sm:px-8 py-3.5 font-bold flex items-center justify-center gap-2 group-hover:bg-gray-50 transition-colors shadow-xl text-xs sm:text-sm"
                  whileHover={{ rotateX: 10, y: -2 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </button>

              <button onClick={() => setShowVideo(true)} className="group">
                <motion.div 
                  className="rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-white px-4 sm:px-8 py-3.5 font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors shadow-lg text-xs sm:text-sm"
                  whileHover={{ rotateX: 10, y: -2 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  Watch Demo
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 fill-blue-400 group-hover:scale-110 transition-transform" />
                </motion.div>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="w-full pt-4">
              <div className="hidden lg:flex flex-wrap items-center gap-10">
                {[
                  { title: "Google Partner", sub: "Certified", color: "bg-white", icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
                  { title: "Meta Partner", sub: "Official", color: "bg-white", icon: <svg className="w-5 h-5" viewBox="0 0 100 21" fill="#0064E0"><path d="M72.015 11.232c0 2.871-2.227 5.174-4.881 5.174-2.656 0-4.882-2.303-4.882-5.174 0-2.871 2.226-5.174 4.882-5.174 2.654 0 4.881 2.303 4.881 5.174zm4.248.163v-.261c0-1.849-.408-3.414-1.259-4.7C74.07 5.068 72.484 4 70.339 4c-1.956 0-3.565.86-4.636 2.316l-.286-1.933h-3.868s.053 1.255.053 11.884h4.155v-1.12c1.026 1.096 2.518 1.956 4.604 1.956 2.113 0 3.733-1.096 4.707-2.585.836-1.285 1.196-2.84 1.196-4.688v-.438zM57.697 11.232c0 2.871-2.226 5.174-4.88 5.174-2.654 0-4.881-2.303-4.881-5.174 0-2.871 2.227-5.174 4.881-5.174 2.654 0 4.88 2.303 4.88 5.174zm3.896 5.011s-.292-1201-.292-12.18h-3.865l-.337 2.155c-1.071-1.425-2.654-2.218-4.542-2.218-3.951 0-7.7 3.321-7.7 7.215 0 3.894 3.749 7.215 7.7 7.215 1.888 0 3.471-.793 4.542-2.219l.337 2.032h4.157zM36.1 12.837c.307 2.15 2.146 3.513 4.632 3.513 1.902 0 3.468-.813 4.296-1.919l3.067 1.95c-1.656 2.472-4.478 3.719-7.363 3.719-5.184 0-9.264-3.543-9.264-8.08 0-4.538 4.08-8.22 9.019-8.22s8.589 3.414 8.589 7.755v1.282H36.1zm8.314-2.893s.061-3.155-3.957-3.155c-3.374 0-4.11 2.471-4.325 3.155h8.282zM21.926 7.429L19.531 4h-4.477l5.397 7.643v5.189H24.6V11.69L29.998 4H25.52l-2.394 3.429h-1.2zm-7.669-.163c-.859-.715-2.054-1.106-3.454-1.106-1.398 0-2.592.39-3.451 1.106-.856.715-1.286 1.722-1.286 2.955v6.611H1.912V10.22c0-2.113.844-3.837 2.502-5.041 1.656-1.205 3.966-1.823 6.848-1.823 2.88 0 5.19.618 6.848 1.823 1.656 1.204 2.5 2.928 2.5 5.041v6.612H16.45V10.22c0-1.233-.429-2.24-1.286-2.954z"/></svg> },
                  { title: "BBB Accredited", sub: "A+ Rating", color: "bg-blue-600", icon: <Shield className="w-5 h-5 text-white" /> },
                  { title: "Verified Agency", sub: "Trusted", color: "bg-emerald-600", icon: <Zap className="w-5 h-5 text-white" /> }
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-9 h-9 ${badge.color} rounded-lg flex items-center justify-center shadow-lg`}>
                      {badge.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-none">{badge.title}</p>
                      <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-1">{badge.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:hidden w-full overflow-hidden">
                <div className="flex animate-marquee-fast gap-8 whitespace-nowrap">
                  {[1, 2].map((group) => (
                    <div key={group} className="flex gap-8 items-center">
                      {[
                        { title: "Google", sub: "Partner", color: "bg-white", icon: "G" },
                        { title: "Meta", sub: "Partner", color: "bg-blue-600", icon: "M" },
                        { title: "BBB", sub: "A+ Rating", color: "bg-blue-600", icon: "S" },
                        { title: "Agency", sub: "Verified", color: "bg-emerald-600", icon: "V" }
                      ].map((badge, i) => (
                        <div key={i} className="flex items-center gap-2 pr-4">
                          <div className={`w-8 h-8 rounded-lg ${badge.color} flex items-center justify-center text-[10px] font-black text-white`}>
                            {badge.icon}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">{badge.title}</span>
                            <span className="text-[8px] text-gray-500 uppercase tracking-widest">{badge.sub}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 pt-12 border-t border-white/5 w-full text-center sm:text-left">
              {[
                { label: "Successful Campaigns", value: "500+", color: "rgba(59, 130, 246, 0.5)", glow: "bg-blue-500/10" },
                { label: "Client Satisfaction", value: "98%", color: "rgba(168, 85, 247, 0.5)", glow: "bg-purple-500/10" },
                { label: "Revenue Generated", value: "15M+", color: "rgba(236, 72, 153, 0.5)", glow: "bg-pink-500/10" }
              ].map((stat, i) => (
                <div key={i} className="relative group">
                  <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="text-4xl font-black text-white mb-1 relative z-10"
                     style={{ textShadow: `0 0 30px ${stat.color}` }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className={`absolute -inset-4 ${stat.glow} blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity mx-auto sm:mx-0`} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Spline Fallback */}
      <div className="lg:hidden absolute inset-0 w-full h-full pointer-events-none opacity-20 z-0">
         <spline-viewer
          url="https://prod.spline.design/ZxKIijKh056svcM5/scene.splinecode"
          class="w-full h-full"
        ></spline-viewer>
      </div>
    </div>
  )
}
