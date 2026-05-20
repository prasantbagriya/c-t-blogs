"use client"

import React from "react"
import { motion } from "framer-motion"
import Navbar from "@/src/theme_migration/components/navbar"
import AnimatedFooter from "@/src/theme_migration/components/animated-footer"
import BackgroundPaths from "@/src/theme_migration/components/background-paths"
import AnimatedBackground from "@/src/theme_migration/components/animated-background"
import BackgroundStripes from "@/src/theme_migration/components/background-stripes"
import { GlowingEffect } from "@/src/theme_migration/components/ui/glowing-effect"

export default function TermsConditions({ onNavigate }: { onNavigate?: (page: string) => void }) {
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
              <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase">Terms of Service</h1>
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
                    Welcome to ChatWizs. These Terms of Service govern your access to and use of our services, including our website, mobile application, and any other software or services provided by ChatWizs (collectively referred to as "Services"). By accessing or using our Services, you agree to be bound by these Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-4xl uppercase tracking-tighter mb-10">1. Acceptance of Terms</h2>
                  <p className="text-lg leading-relaxed font-medium">
                    These Terms and Conditions constitute a legally binding agreement made between you ("you") and ChatWizs ("we", "us", or "our"), concerning your access to and use of the <a href="https://chatwizs.com" className="text-blue-400 hover:underline">https://chatwizs.com</a> website. We are registered in India. You agree that by accessing the Site, you have read, understood, and agree to be bound by all of these Terms and Conditions.
                  </p>
                  <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl mt-8">
                    <p className="text-red-400 font-bold text-sm">
                      IF YOU DO NOT AGREE WITH ALL OF THESE TERMS AND CONDITIONS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.
                    </p>
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                    <h3 className="text-xl font-bold mb-4">Account Safety</h3>
                    <p className="text-sm text-gray-400">You are responsible for maintaining the confidentiality of your account information. Two-factor authentication (2FA) is mandatory for all user accounts.</p>
                  </div>
                  <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                    <h3 className="text-xl font-bold mb-4">Eligibility</h3>
                    <p className="text-sm text-gray-400">To use our Services, you must be at least 18 years old and capable of forming a binding contract.</p>
                  </div>
                  <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                    <h3 className="text-xl font-bold mb-4">Lawful Use</h3>
                    <p className="text-sm text-gray-400">You agree to use our Services only for lawful purposes and in compliance with all applicable laws.</p>
                  </div>
                </div>

                <section>
                  <h2 className="text-4xl uppercase tracking-tighter mb-10">2. Fees and Payment</h2>
                  <p className="text-lg leading-relaxed font-medium mb-6">
                    We accept Visa and Mastercard. All payments shall be in INR/USD. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-blue-500/5 p-8 rounded-3xl border border-blue-500/10">
                      <h3 className="text-xl font-bold mb-4 text-blue-400">FREE Forever Plan</h3>
                      <p className="text-sm text-gray-400">Each user who registers will automatically stay active for lifetime on our FREE forever plan without any charges.</p>
                    </div>
                    <div className="bg-purple-500/5 p-8 rounded-3xl border border-purple-500/10">
                      <h3 className="text-xl font-bold mb-4 text-purple-400">7-Day Free Trial</h3>
                      <p className="text-sm text-gray-400">New users can explore Basic Plan features for 7 days. No credit card required. Cancel anytime before trial ends.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-4xl uppercase tracking-tighter mb-10">3. Strict No-Refund Policy</h2>
                  <p className="text-lg leading-relaxed font-medium mb-6">
                    We process all payments through <strong>Razorpay</strong>. By subscribing to ChatWizs, you acknowledge and agree to our strict no-refund policy:
                  </p>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-8 md:p-12 space-y-8">
                    <div className="flex gap-6 items-start">
                      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                         <span className="text-red-400 font-black">!</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Finality of Payment</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          Once a payment is successfully processed via Razorpay for any subscription plan, it is considered final. No partial or full refunds will be issued under any circumstances, including unused subscription time or account inactivity.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-6 items-start">
                      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                         <span className="text-red-400 font-black">!</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">WhatsApp Conversation Credits (WCC)</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          Charges for WhatsApp Conversation Credits (WCCs), Add-ons, and third-party API costs are strictly non-refundable. These are direct infrastructure costs incurred at the moment of purchase.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-6 items-start">
                      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                         <span className="text-red-400 font-black">!</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Trial Period Evaluation</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          We provide a <strong>7-Day Free Trial</strong> specifically to allow users to evaluate our services before making a financial commitment. It is the user's responsibility to cancel the trial if they do not wish to be charged.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-gradient-to-br from-blue-500/10 to-transparent p-12 rounded-[2.5rem] border border-blue-500/20">
                  <h2 className="text-4xl uppercase tracking-tighter mb-8">Contact Us</h2>
                  <p className="text-xl text-gray-300 mb-8 font-medium">
                    For any questions or refund-related queries, please contact our support team:
                  </p>
                  <address className="not-italic text-gray-400 space-y-4 text-lg font-medium">
                    <p className="text-white font-bold text-2xl mb-4">ChatWizs Official</p>
                    <p className="flex items-center gap-3">
                      <span className="text-blue-400">Email:</span> hello@chatwizs.com
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="text-blue-400">Phone:</span> +91 97727 71388
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="text-blue-400">Location:</span> Bangalore, India
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
