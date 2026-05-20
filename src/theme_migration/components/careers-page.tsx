"use client"

import React from "react"
import { motion } from "motion/react"
import { Briefcase, MapPin, Clock, ArrowRight, Star, Users, Brain, Rocket } from "lucide-react"
import { GlowingEffect } from "./ui/glowing-effect"
import SectionHeader from "./section-header"

const jobs = [
  {
    title: "Senior AI Engineer",
    department: "Engineering",
    location: "Bangalore / Remote",
    type: "Full-time",
    description: "Help us build the next generation of AI-powered conversational agents for WhatsApp."
  },
  {
    title: "WhatsApp Marketing Specialist",
    department: "Marketing",
    location: "Bangalore, India",
    type: "Full-time",
    description: "Strategy and execution for high-impact WhatsApp marketing campaigns for global brands."
  },
  {
    title: "Full Stack Developer (React/Node)",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Scale our platform infrastructure and build beautiful, performant user interfaces."
  },
  {
    title: "Customer Success Manager",
    department: "Operations",
    location: "Bangalore, India",
    type: "Full-time",
    description: "Ensure our enterprise clients get the maximum value from our automation tools."
  }
]

export default function CareersPage() {
  return (
    <div className="relative pt-32 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeader 
          level="h1"
          badge="Careers"
          title="Join the Revolution"
          description="We're building the infrastructure for the next generation of conversational commerce. Come help us shape the future of business communication."
        />

        {/* Perks / Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            { 
              icon: <Brain className="w-8 h-8 text-blue-400" />, 
              title: "AI-First Culture", 
              desc: "Work at the cutting edge of LLMs and automation." 
            },
            { 
              icon: <Rocket className="w-8 h-8 text-purple-400" />, 
              title: "Rapid Growth", 
              desc: "Join a fast-scaling startup where your impact is visible." 
            },
            { 
              icon: <Users className="w-8 h-8 text-emerald-400" />, 
              title: "Global Impact", 
              desc: "Our tools power communication for 10k+ businesses worldwide." 
            }
          ].map((perk, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center"
            >
              <div className="inline-flex items-center justify-center mb-6">{perk.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{perk.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{perk.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Job Listings */}
        <div className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 md:mb-12 tracking-tight">Open Positions</h2>
          {jobs.map((job, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] p-6 md:p-10 transition-all hover:bg-white/[0.08] hover:border-blue-500/30 overflow-hidden"
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
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {job.department}
                    </span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {job.type}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-gray-400 font-medium leading-relaxed max-w-2xl">
                    {job.description}
                  </p>
                </div>
                <div className="shrink-0">
                  <button className="bg-white text-black px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all">
                    Apply Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Spontaneous Application */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="mt-20 md:mt-32 p-6 md:p-12 rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 border border-white/10 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Can't find your fit?</h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            We're always looking for brilliant minds. If you think you'd be a great addition to ChatWizs, send us your CV and a brief note.
          </p>
          <a href="mailto:careers@chatwizs.com" className="inline-flex items-center text-blue-400 font-bold hover:text-blue-300 transition-colors gap-2 text-base md:text-lg break-all">
            careers@chatwizs.com
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </div>
  )
}
