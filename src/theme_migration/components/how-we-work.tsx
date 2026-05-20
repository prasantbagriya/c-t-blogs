"use client"

import { motion } from "motion/react"
import { Search, Lightbulb, Rocket } from "lucide-react"
import { GlowingEffect } from "./ui/glowing-effect"
import SectionHeader from "./section-header"
import { STEPS } from "../lib/constants"
import React from 'react'

const ICON_MAP = {
  Search: <Search className="w-8 h-8" />,
  Lightbulb: <Lightbulb className="w-8 h-8" />,
  Rocket: <Rocket className="w-8 h-8" />,
}

export default function HowWeWork() {
  return (
    <section className="py-10 relative overflow-hidden bg-black/40 backdrop-blur-xl border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <SectionHeader 
          title="How We Work"
          description="A simple, effective approach to building your brand with excellence."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, index) => (
            <motion.div 
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`bg-slate-950 rounded-[2.5rem] p-8 backdrop-blur-sm border border-white/5 transition-all duration-500 group relative overflow-hidden h-full`}
            >
              <GlowingEffect
                blur={0}
                borderWidth={1.5}
                spread={100}
                glow={true}
                disabled={false}
                proximity={100}
                inactiveZone={0.01}
              />
              {/* Mockup Area */}
              <div className="aspect-video bg-gray-900 rounded-2xl mb-8 overflow-hidden relative border border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 p-4">
                  {/* Discovery Mockup */}
                  {step.mockup === "discovery" && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-full max-w-[160px] space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center overflow-hidden">
                            <div className="w-3 h-3 bg-blue-500 rounded animate-pulse"></div>
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <div className="bg-gray-700 h-1.5 w-full rounded"></div>
                            <div className="bg-gray-700 h-1.5 w-3/4 rounded"></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-700 h-10 rounded-lg"></div>
                          <div className="bg-gray-700 h-10 rounded-lg"></div>
                        </div>
                        <div className="bg-blue-500/20 h-6 w-full rounded border border-blue-500/30"></div>
                      </div>
                    </div>
                  )}

                  {/* Development Mockup */}
                  {step.mockup === "development" && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-full max-w-[160px] space-y-3">
                        <div className="bg-gray-800 rounded-lg p-3 border border-white/5 shadow-2xl">
                          <div className="flex items-center space-x-1.5 mb-2.5">
                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="bg-gray-700 h-1.5 w-full rounded"></div>
                            <div className="bg-gray-700 h-1.5 w-2/3 rounded"></div>
                            <div className="bg-purple-500 h-1.5 w-1/2 rounded"></div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="bg-gray-700 h-8 flex-1 rounded"></div>
                          <div className="bg-purple-500 h-8 w-12 rounded"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Launch Mockup */}
                  {step.mockup === "launch" && (
                    <div className="w-full h-full flex items-center justify-center text-center">
                      <div className="w-full max-w-[160px] space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">System Status</div>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border border-green-500 border-t-transparent rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                          ></motion.div>
                        </div>
                        <div className="space-y-2">
                          {[
                            { label: "Security", color: "bg-green-500" },
                            { label: "Efficiency", color: "bg-green-500" },
                            { label: "Speed", color: "bg-green-500" },
                            { label: "Updating...", color: "bg-blue-500", pulse: true }
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className={`w-2 h-2 ${item.color} rounded-full ${item.pulse ? 'animate-pulse' : ''} shadow-[0_0_8px] shadow-current`} />
                              <div className="text-[10px] text-gray-400 font-bold">{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-black text-white group-hover:text-opacity-100 text-opacity-30 transition-all duration-300">{step.number}</div>
                  <div className={`${step.accent} group-hover:scale-110 transition-transform`}>
                    {ICON_MAP[step.icon as keyof typeof ICON_MAP]}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm font-medium">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
