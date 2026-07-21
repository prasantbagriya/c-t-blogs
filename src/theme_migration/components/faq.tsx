"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Plus, Minus } from "lucide-react"
import { GlowingEffect } from "./ui/glowing-effect"
import SectionHeader from "./section-header"
import { FAQS } from "../lib/constants"

interface FAQItemProps {
  q: string;
  a: string;
  index: number;
}

const FAQItem: React.FC<FAQItemProps> = ({ q, a, index }) => {
  const [isOpen, setIsOpen] = useState(index === 0)

  return (
    <motion.div
      className={`relative rounded-2xl border-[1.5px] overflow-hidden group ${ isOpen ? 'bg-blue-900/10 ' : 'bg-white/5' }`}
      animate={{
        borderColor: [
          "rgba(59, 130, 246, 0.2)",
          "rgba(147, 51, 234, 0.2)",
          "rgba(236, 72, 153, 0.2)",
          "rgba(34, 197, 128, 0.2)",
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
        spread={64}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left relative z-10"
      >
        <span className={`font-medium text-lg ${isOpen ? 'text-blue-400' : 'text-gray-200'}`}>{q}</span>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${ isOpen ? 'bg-blue-600/20 text-blue-400 rotate-180' : 'bg-white/5 text-gray-500' }`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative z-10"
          >
            <div className="px-6 pb-6 text-gray-500 leading-relaxed font-normal text-sm">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  return (
    <section id="faq" className="py-10 bg-black relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* FAQ Column */}
          <div>
            <div className="text-left mb-14">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-4 block">Got Questions?</span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-400 font-medium text-lg leading-relaxed">Everything you need to know about scaling with ChatWizs.</p>
            </div>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
              ))}
            </div>
          </div>

          {/* Contact Form Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative bg-white/5 backdrop-blur-md rounded-[2.5rem] p-10 border-[1.5px] group overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 border-[1.5px] rounded-[2.5rem] pointer-events-none"
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
            />
            <GlowingEffect
              blur={0}
              borderWidth={1.5}
              spread={80}
              glow={true}
              disabled={false}
              proximity={80}
              inactiveZone={0.01}
            />
            
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-white mb-2">Can't find an answer?</h3>
              <p className="text-gray-400 mb-8 font-medium">Send us a message and we'll get back to you in under 24 hours.</p>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Work Email</label>
                  <input 
                    type="email" 
                    placeholder="john@company.com"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Your Message</label>
                  <textarea 
                    rows={4}
                    placeholder="Tell us about your project..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 font-medium resize-none"
                  />
                </div>
                <button className="w-full bg-white text-black py-5 rounded-2xl font-bold text-lg hover: flex items-center justify-center gap-2 border-none cursor-pointer">
                  Send Message
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
