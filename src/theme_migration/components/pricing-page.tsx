"use client"

import React from "react"
import { motion } from "motion/react"
import { Check, X, Shield, Zap, Heart, MessageSquare, BarChart, Users, ArrowRight, Brain, Globe } from "lucide-react"
import { GlowingEffect } from "./ui/glowing-effect"
import SectionHeader from "./section-header"
import Pricing from "./pricing"

export default function PricingPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  return (
    <div className="relative pt-36 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeader 
          level="h1"
          badge="Plans & Pricing"
          title="Transparent Pricing for Every Stage"
          description="Scale your business with our flexible plans. No hidden fees, no complex contracts. Just pure growth."
        />

        {/* Existing Pricing Section (Main Plans) */}
        <div className="mb-32">
           <Pricing onNavigate={onNavigate} />
        </div>

        {/* Detailed Comparison Table */}
        <div className="mb-40 overflow-x-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Detailed Comparison</h2>
            <p className="text-gray-400">Every feature explained, so you can choose the right fit.</p>
          </div>

          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-6 px-8 text-gray-500 font-bold uppercase tracking-widest text-xs">Features</th>
                <th className="py-6 px-8 text-white font-bold">Starter</th>
                <th className="py-6 px-8 text-blue-400 font-bold">Pro</th>
                <th className="py-6 px-8 text-purple-400 font-bold">Enterprise</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              {[
                { name: "Monthly Messages", s: "Unlimited", p: "Unlimited", e: "Unlimited" },
                { name: "Contacts", s: "10,000", p: "50,000", e: "Unlimited" },
                { name: "AI Chatbot Agents", s: "1", p: "5", e: "Custom" },
                { name: "API Rate Limit", s: "10 req/s", p: "50 req/s", e: "Unlimited" },
                { name: "Team Members", s: "2", p: "10", e: "Unlimited" },
                { name: "Priority Support", s: false, p: true, e: true },
                { name: "Custom Domain", s: false, p: true, e: true },
                { name: "White-label Dashboard", s: false, p: false, e: true },
              ].map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] ">
                  <td className="py-6 px-8 font-medium text-white">{row.name}</td>
                  <td className="py-6 px-8">{typeof row.s === 'boolean' ? (row.s ? <Check className="text-emerald-500 w-5 h-5" /> : <X className="text-rose-500 w-5 h-5" />) : row.s}</td>
                  <td className="py-6 px-8">{typeof row.p === 'boolean' ? (row.p ? <Check className="text-emerald-500 w-5 h-5" /> : <X className="text-rose-500 w-5 h-5" />) : row.p}</td>
                  <td className="py-6 px-8">{typeof row.e === 'boolean' ? (row.e ? <Check className="text-emerald-500 w-5 h-5" /> : <X className="text-rose-500 w-5 h-5" />) : row.e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQs for Pricing */}
        <div className="mb-40">
           <div className="max-w-4xl mx-auto">
             <h2 className="text-3xl font-bold text-white mb-12 text-center">Pricing FAQ</h2>
             <div className="space-y-8">
                {[
                  { q: "Is there a free trial?", a: "Yes! We offer a full 7-day free trial for our Pro plan. No credit card required to start." },
                  { q: "Can I upgrade or downgrade later?", a: "Absolutely. You can change your plan at any time through your dashboard. Changes take effect immediately." },
                  { q: "What are WhatsApp conversation credits (WCC)?", a: "WCC are used for outgoing messages. They are billed separately based on Meta's official pricing." },
                  { q: "Is there a setup fee?", a: "No, we do not charge any setup fees. You only pay for your subscription and your WCC." }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 rounded-3xl p-8 border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-3">{item.q}</h4>
                    <p className="text-gray-400 leading-relaxed">{item.a}</p>
                  </div>
                ))}
             </div>
           </div>
        </div>

        {/* Custom Solution Section - Redesigned */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-white text-black p-6 md:p-16 lg:p-24 "
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -ml-48 -mb-48" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Enterprise Grade</span>
            </div>
            
            <h3 className="text-3xl md:text-5xl lg:text-6xl font-black mb-8 tracking-tighter">Need a Custom Solution?</h3>
            <p className="text-lg md:text-xl font-medium mb-12 md:mb-16 opacity-70 max-w-3xl mx-auto leading-relaxed">
              For large-scale organizations requiring advanced security, custom training, and dedicated infrastructure. Our enterprise team is ready to build your perfect communications engine.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16 text-left">
               {[
                 { icon: <Brain className="w-6 h-6 text-blue-600" />, title: "Custom AI Models", desc: "Train specialized models on your unique business data and brand voice." },
                 { icon: <Shield className="w-6 h-6 text-emerald-600" />, title: "Enhanced Security", desc: "SSO, custom data retention policies, and dedicated security audits." },
                 { icon: <Users className="w-6 h-6 text-purple-600" />, title: "Dedicated Manager", desc: "A personal account manager and 24/7 technical priority support." },
                 { icon: <Zap className="w-6 h-6 text-amber-600" />, title: "High-Throughput API", desc: "Uncapped rate limits and dedicated server instances for peak loads." },
                 { icon: <Globe className="w-6 h-6 text-blue-600" />, title: "SLA Guarantees", desc: "Contractually guaranteed 99.99% uptime and response times." },
                 { icon: <MessageSquare className="w-6 h-6 text-rose-600" />, title: "Whitelabeling", desc: "Fully branded dashboard and client-facing interfaces for your agency." }
               ].map((feature, i) => (
                 <div key={i} className="flex gap-6 items-start p-2">
                    <div className="shrink-0 w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center">
                       {feature.icon}
                    </div>
                    <div>
                       <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                       <p className="text-sm opacity-60 leading-relaxed font-medium">{feature.desc}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button onClick={() => onNavigate?.('contact')} className="bg-black text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm hover:scale-105 transition-transform flex items-center justify-center gap-3">
                Request Enterprise Demo
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => onNavigate?.('contact')} className="bg-white border-2 border-black/10 text-black px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm hover:bg-black/5 ">
                Speak to Sales
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
