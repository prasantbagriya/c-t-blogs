"use client"

import React from "react"
import { motion } from "motion/react"
import { MessageSquare, Zap, Globe, TrendingUp, ArrowRight, Shield, CheckCircle2 } from "lucide-react"
import { GlowingEffect } from "./ui/glowing-effect"
import SectionHeader from "./section-header"
import { SERVICES } from "../lib/constants"

export default function ServiceGridHome({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const openService = (serviceId: string) => {
    window.dispatchEvent(new CustomEvent('app-navigate', {
      detail: `/services/${serviceId}`,
    }));
    onNavigate?.('service-detail');
  };

  return (
    <section className="py-10 bg-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <SectionHeader 
          badge="End-to-End Solutions"
          title="Master Every Channel"
          description="Our core services are designed to help you dominate your industry through official Meta integrations and AI automation."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => openService(service.id)}
              className="group relative bg-slate-900/20 backdrop-blur-sm border border-white/5 rounded-3xl p-8 hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden"
            >
              <GlowingEffect blur={0} borderWidth={1.5} spread={60} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                  <div className="text-indigo-400">{service.icon}</div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors tracking-tight">
                  {service.title}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
                  {service.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <CheckCircle2 className="w-3 h-3 text-indigo-500 mr-2 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center text-xs font-black text-indigo-400 uppercase tracking-[0.2em] group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hidden SEO List for Google Sitelinks */}
        <nav className="sr-only" aria-label="Core Services Navigation">
          <ul>
            <li><a href="/services/whatsapp-business-api">WhatsApp Business API</a></li>
            <li><a href="/services/ai-chatbot-automation">AI Chatbot Automation</a></li>
            <li><a href="/services/omnichannel-marketing">Omnichannel Marketing Hub</a></li>
            <li><a href="/services/meta-verified-campaigns">Meta-Verified Campaigns</a></li>
          </ul>
        </nav>
      </div>
    </section>
  )
}
