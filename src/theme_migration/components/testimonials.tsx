"use client"

import React from "react"
import { motion } from "motion/react"
import { GlowingEffect } from "./ui/glowing-effect"
import SectionHeader from "./section-header"
import { TESTIMONIALS } from "../lib/constants"

export default function Testimonials() {
  return (
    <section className="py-10 bg-transparent overflow-hidden relative">
      <div className="relative z-10">
        <SectionHeader 
          badge="⭐ Customer Reviews"
          title="Trusted by Industry Leaders"
          description="See why thousands of businesses choose ChatWizs for their growth."
        />
      </div>

      <div className="relative flex overflow-hidden">
        <motion.div
          animate={{
            x: [0, -1000],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex space-x-8 whitespace-nowrap py-10 px-4"
        >
          {[...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <motion.div 
              key={i} 
              className="relative w-80 p-8 bg-gray-900/10 backdrop-blur-sm rounded-[2.5rem] border-[1.5px] text-white inline-block whitespace-normal group overflow-hidden"
              animate={{
                borderColor: [
                  "rgba(59, 130, 246, 0.2)",
                  "rgba(147, 51, 234, 0.2)",
                  "rgba(236, 72, 153, 0.2)",
                  "rgba(34, 197, 94, 0.2)",
                  "rgba(59, 130, 246, 0.2)",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <GlowingEffect
                blur={0}
                borderWidth={1.5}
                spread={60}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
              />
              
              <div className="relative z-10">
                <div className="flex gap-1 mb-4 text-yellow-500">
                  {[...Array(t.rating)].map((_, j) => (
                    <span key={j} className="text-sm">★</span>
                  ))}
                </div>
                <p className="text-base italic mb-6 font-medium leading-relaxed opacity-90 text-gray-200">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 backdrop-blur-md border border-white/10">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-base text-white">{t.name}</div>
                    <div className="text-blue-400 text-[10px] font-black uppercase tracking-[0.15em]">{t.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
