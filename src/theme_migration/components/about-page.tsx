"use client"

import React from "react"
import { motion } from "motion/react"
import { Shield, Zap, Heart, Globe, Users, Target, BarChart, MessageSquare, Brain, Quote } from "lucide-react"
import { GlowingEffect } from "./ui/glowing-effect"
import SectionHeader from "./section-header"

const values = [
  {
    icon: <Shield className="w-8 h-8 text-blue-400" />,
    title: "Security First",
    desc: "We handle sensitive data with enterprise-grade encryption and strict privacy protocols."
  },
  {
    icon: <Zap className="w-8 h-8 text-yellow-400" />,
    title: "Lightning Speed",
    desc: "Our infrastructure is built for scale, delivering messages and AI responses in milliseconds."
  },
  {
    icon: <Heart className="w-8 h-8 text-rose-400" />,
    title: "Customer Obsessed",
    desc: "We don't just build software; we solve real business problems for our partners."
  },
  {
    icon: <Globe className="w-8 h-8 text-emerald-400" />,
    title: "Global Reach",
    desc: "Empowering businesses across 50+ countries to connect with their audience."
  }
]

const milestones = [
  { year: "2024 Q1", title: "The Inception", desc: "Founded with a vision to simplify enterprise communication." },
  { year: "2024 Q2", title: "Meta Partnership", desc: "Officially became a Meta Business Partner for WhatsApp API." },
  { year: "2024 Q3", title: "AI Integration", desc: "Launched our first proprietary LLM-driven automation engine." },
  { year: "2025", title: "Scaling Up", desc: "Reached 10,000+ active businesses using the platform." }
]

export default function AboutPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  return (
    <div className="relative pt-36 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeader 
          level="h1"
          badge="About ChatWizs"
          title="Building the Future of Conversations"
          description="We are a team of engineers, designers, and visionaries dedicated to making conversational AI accessible to every business."
        />

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-40">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-bold text-white tracking-tight">The ChatWizs Story</h2>
            <p className="text-gray-400 text-xl leading-relaxed font-medium">
              <span className="text-blue-400">ChatWizs</span> was founded with a singular mission: to make world-class conversational AI accessible to businesses of all sizes. We are a team of visionaries dedicated to redefining how the world communicates.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">
              We realized that while many platforms offered "messaging," very few offered "intelligence." Our founders set out to build a platform that doesn't just broadcast messages but actually understands customer intent, automates complex workflows, and drives real revenue growth.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">
              Founded in 2024, ChatWizs has quickly grown into the brain for thousands of business communication strategies, turning simple WhatsApp chats into powerful sales and support engines.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-6">
              <div className="p-6 sm:p-8 bg-white/5 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-colors group">
                <p className="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors">99.9%</p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Uptime Guarantee</p>
              </div>
              <div className="p-6 sm:p-8 bg-white/5 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-colors group">
                <p className="text-3xl sm:text-4xl font-black text-white mb-2 group-hover:text-purple-400 transition-colors">10k+</p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Brands</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full" />
            <div className="relative bg-gray-900/60 border border-white/10 rounded-[2.5rem] sm:rounded-[4rem] p-6 sm:p-12 backdrop-blur-2xl">
               <h3 className="text-2xl font-bold text-white mb-10">Our Expertise</h3>
               <div className="space-y-10">
                  {[
                    { icon: <Brain className="w-6 h-6 text-blue-400" />, title: "Proprietary AI Engine", desc: "Custom LLMs trained specifically for business-to-consumer conversations." },
                    { icon: <Zap className="w-6 h-6 text-yellow-400" />, title: "Instant Scaling", desc: "Handle 100k+ simultaneous conversations without breaking a sweat." },
                    { icon: <Shield className="w-6 h-6 text-emerald-400" />, title: "Compliance Mastery", desc: "Built-in Meta policy adherence and data privacy safeguards." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-start">
                       <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                          {item.icon}
                       </div>
                       <div>
                          <h4 className="text-white font-bold mb-1">{item.title}</h4>
                          <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        </div>

        {/* Values Section */}
        <div className="mb-40">
          <div className="text-center mb-20">
            <span className="text-blue-400 font-black tracking-widest uppercase text-xs mb-4 block">The ChatWizs DNA</span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative bg-white/5 border border-white/10 rounded-[2.5rem] p-10 group overflow-hidden"
              >
                <GlowingEffect
                  blur={0}
                  borderWidth={1.5}
                  spread={80}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <div className="relative z-10">
                  <div className="mb-6 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">
                    {value.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-40">
           <div className="text-center mb-20">
              <h2 className="text-4xl font-black text-white tracking-tighter mb-4">Our Evolution</h2>
              <p className="text-gray-400 font-medium max-w-2xl mx-auto">From a bold idea to a global automation powerhouse. Here&apos;s how we built ChatWizs.</p>
           </div>
           <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 hidden md:block" />
              <div className="space-y-20">
                {milestones.map((ms, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`flex flex-col md:flex-row gap-8 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                  >
                    <div className={`flex-1 text-center ${i % 2 === 1 ? 'md:text-left' : 'md:text-right'} md:px-12 order-2 md:order-1`}>
                      <h4 className="text-2xl font-bold text-white mb-2">{ms.title}</h4>
                      <p className="text-gray-400 font-medium leading-relaxed">{ms.desc}</p>
                    </div>
                    <div className="relative z-10 w-14 h-14 bg-black border-4 border-blue-500 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0 order-1 md:order-2 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                       {i + 1}
                    </div>
                    <div className={`flex-1 text-center ${i % 2 === 1 ? 'md:text-right' : 'md:text-left'} md:px-12 order-3`}>
                       <span className="text-blue-400 font-black tracking-[0.3em] uppercase text-xs px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">{ms.year}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
           </div>
        </div>

        {/* Vision Statement */}
        <div className="mb-40 text-center max-w-4xl mx-auto">
           <Quote className="w-12 h-12 text-blue-500 mx-auto mb-8 opacity-50" />
           <h3 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter leading-tight">
             &quot;Our goal is to turn every business message into a <span className="text-blue-400">meaningful relationship</span> and every conversation into <span className="text-purple-400">measurable growth</span>.&quot;
           </h3>
           <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full mb-4 border border-white/10" />
              <p className="font-bold text-white">The ChatWizs Leadership Team</p>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-black">Innovating for you</p>
           </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center p-8 md:p-20 rounded-[2.5rem] md:rounded-[4rem] bg-white text-black relative overflow-hidden mb-20"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <h3 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter">Ready to scale with us?</h3>
          <p className="text-xl font-medium mb-12 opacity-70 max-w-2xl mx-auto">
            Experience the power of AI-driven WhatsApp marketing and join thousands of successful brands.
          </p>
          <button onClick={() => onNavigate?.('contact')} className="bg-black text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform">
            Start Your Journey
          </button>
        </motion.div>
      </div>
    </div>
  )
}
