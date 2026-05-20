"use client"

import React from "react"
import { motion } from "framer-motion"
import Navbar from "@/src/theme_migration/components/navbar"
import AnimatedFooter from "@/src/theme_migration/components/animated-footer"
import BackgroundPaths from "@/src/theme_migration/components/background-paths"
import AnimatedBackground from "@/src/theme_migration/components/animated-background"
import BackgroundStripes from "@/src/theme_migration/components/background-stripes"
import { GlowingEffect } from "@/src/theme_migration/components/ui/glowing-effect"

export default function PrivacyPolicy({ onNavigate }: { onNavigate?: (page: string) => void }) {
  return (
    <div className="relative min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      <BackgroundPaths />
      <AnimatedBackground />
      <BackgroundStripes />

      <div className="relative z-10">
        <Navbar onNavigate={onNavigate} />
        
        <main className="py-32 px-1 md:px-2">
          <div className="max-w-full lg:max-w-[98%] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase">Privacy Policy</h1>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Last updated: April 22, 2026</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] p-4 md:p-10 lg:px-8 lg:py-16 border border-white/5 overflow-hidden shadow-2xl"
            >
              <GlowingEffect
                blur={0}
                borderWidth={1.5}
                spread={120}
                glow={true}
                disabled={false}
                proximity={120}
                inactiveZone={0.01}
              />
              
              <div className="relative z-10 space-y-16 prose prose-invert max-w-none prose-p:text-gray-400 prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight prose-li:text-gray-400">
                <section>
                   <p className="text-lg leading-relaxed font-medium">
                     This privacy notice for ChatWizs ("Company," "we," "us," or "our"), describes how and why we might collect, store, use, and/or share ("process") your information when you use our services ("Services"), such as when you visit our website at <a href="https://chatwizs.com/" className="text-blue-400 hover:underline">https://chatwizs.com/</a>, or engage with us in other related ways, including any sales, marketing, or events.
                   </p>
                   <p className="text-lg leading-relaxed font-medium mt-4">
                     Questions or concerns? Reading this privacy notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a href="mailto:hello@chatwizs.com" className="text-blue-400 hover:underline">hello@chatwizs.com</a>.
                   </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-y border-white/5 py-16">
                  <section>
                    <h2 className="text-3xl uppercase tracking-tighter mb-8">Summary of Key Points</h2>
                    <p className="text-gray-400 mb-4">What personal information do we process? We process information based on your interaction with ChatWizs.</p>
                    <p className="text-gray-400 mb-4">Sensitive info? We do not process sensitive personal information.</p>
                    <p className="text-gray-400">Third parties? We may receive info from public databases and marketing partners.</p>
                  </section>
                  <section className="bg-white/5 rounded-3xl p-8 border border-white/10">
                    <h3 className="text-xl font-bold mb-4">Safety First</h3>
                    <p className="text-sm leading-relaxed text-gray-300">
                      We have organizational and technical processes in place to protect your personal information. However, no electronic transmission over the internet can be guaranteed to be 100% secure.
                    </p>
                  </section>
                </div>

                <section>
                  <h2 className="text-4xl uppercase tracking-tighter mb-10">1. WHAT INFORMATION DO WE COLLECT?</h2>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-4">Personal information you disclose to us</h3>
                      <p className="text-gray-400 leading-relaxed text-lg">
                        We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
                      </p>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-8">
                       <h4 className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-4">Categories of Data</h4>
                       <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
                         <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Names</li>
                         <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Phone numbers</li>
                         <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Email addresses</li>
                         <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Job titles</li>
                         <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Usernames / Passwords</li>
                         <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Billing addresses</li>
                       </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-4xl uppercase tracking-tighter mb-10">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
                  <p className="text-gray-400 leading-relaxed text-lg">
                    We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.
                  </p>
                </section>

                <section>
                  <h2 className="text-4xl uppercase tracking-tighter mb-10">3. DATA RETENTION & SAFETY</h2>
                  <p className="text-gray-400 leading-relaxed text-lg">
                    We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law. No purpose in this notice will require us keeping your personal information for longer than thirty six (36) months past the start of the idle period of the user's account.
                  </p>
                </section>

                <section className="bg-gradient-to-br from-blue-500/10 to-transparent p-12 rounded-[2.5rem] border border-blue-500/20">
                  <h2 className="text-4xl uppercase tracking-tighter mb-8">Contact Us</h2>
                  <p className="text-xl text-gray-300 mb-8 font-medium">
                    If you have questions or comments about this notice, you may email us at <a href="mailto:hello@chatwizs.com" className="text-white hover:underline">hello@chatwizs.com</a> or by post to:
                  </p>
                  <address className="not-italic text-gray-400 space-y-2 text-lg font-medium">
                    <p className="text-white font-bold text-2xl mb-4">ChatWizs Official</p>
                    <p className="flex items-center gap-3">
                      <span className="text-blue-400">Email:</span> hello@chatwizs.com
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="text-blue-400">Phone:</span> +91 97727 71388
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="text-blue-400">Address:</span> Bangalore, India
                    </p>
                  </address>
                </section>
              </div>
            </motion.div>
          </div>
        </main>

        <AnimatedFooter onNavigate={onNavigate} />
      </div>
    </div>
  )
}
