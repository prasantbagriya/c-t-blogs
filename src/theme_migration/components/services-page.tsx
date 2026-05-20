"use client"

import React, { useState } from "react"
import { motion } from "motion/react"
import { GlowingEffect } from "./ui/glowing-effect"
import { Link } from "@/src/theme_migration/components/ui/shim"
import SectionHeader from "./section-header"
import { SERVICES } from "../lib/constants"

export default function ServicesPage() {
  return (
    <div className="relative pt-36 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeader 
          level="h1"
          badge="Our Full Suite"
          title="Premium Solutions"
          description="Everything you need to transform your customer communication into a high-performance growth engine."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative bg-white/5 border-[1.5px] rounded-[2.5rem] p-10 backdrop-blur-xl transition-all duration-500 group overflow-hidden"
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
                  transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: index * 0.2 }}
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
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
                  <div className="text-blue-400 group-hover:scale-110 transition-transform">{service.icon}</div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors tracking-tight">
                  {service.title}
                </h3>
                <p className="text-gray-400 font-medium mb-8 leading-relaxed">
                  {service.description}
                </p>

                <ul className="space-y-4 mb-10">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-gray-400 font-bold text-sm uppercase tracking-widest">
                       <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 shrink-0" />
                       {feature}
                    </li>
                  ))}
                </ul>

                <Link href={`/services/${service.id}`}>
                  <button className="bg-white text-black w-full py-4 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(129,140,248,0.4)] transition-all cursor-pointer">
                    Explore Details
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
