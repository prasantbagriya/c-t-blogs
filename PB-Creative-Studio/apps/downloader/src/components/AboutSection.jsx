import React, { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Globe, Zap, Shield, Download } from "lucide-react"
import SpotlightCard from "./SpotlightCard"

const achievements = [
  { icon: <Download className="w-5 h-5" />, label: "Media Extracted", value: "1.2M+" },
  { icon: <Globe className="w-5 h-5" />, label: "Platforms Supported", value: "50+" },
  { icon: <Zap className="w-5 h-5" />, label: "Success Rate", value: "99.9%" },
  { icon: <Shield className="w-5 h-5" />, label: "Secure Sessions", value: "100%" },
]

export default function AboutSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [40, -40])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return (
    <section ref={ref} id="about" className="py-24 relative overflow-hidden border-t border-zinc-900 bg-[#030303]">
      {/* Decorative Fading Divider Line at top */}
      <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        <motion.div className="grid md:grid-cols-2 gap-16 items-center" style={{ y, opacity }}>
          
          {/* Showcase visual card */}
          <div className="relative">
            <div className="relative z-10 aspect-video md:aspect-square rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/10 flex items-center justify-center p-12">
               <div className="text-zinc-800 absolute inset-0 flex items-center justify-center opacity-5">
                 <Download size={240} strokeWidth={0.5} />
               </div>
               <div className="relative z-20 text-center">
                 <div className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-2 text-white">4K</div>
                 <div className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">HIGH FIDELITY EXTRACTIONS</div>
               </div>
            </div>
          </div>
          
          {/* Text and stats side */}
          <div className="text-left">
            <div className="mb-8">
              <span className="text-zinc-500 font-mono text-[10px] font-bold tracking-[0.2em] block mb-3 uppercase">
                // 01 / ENGINE DATA METRICS
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase leading-tight">
                Surgical Media <br />
                <span className="text-gradient-stellar">Extraction</span>.
              </h2>
            </div>
            
            <p className="text-sm md:text-base mb-5 text-zinc-400 leading-relaxed font-medium">
              NEXTGEN-X is more than just a downloader; it's a high-performance media extraction engine designed for the modern web. Built with distributed processing and advanced parsing algorithms, we ensure you get the highest quality media with zero compromises.
            </p>
            <p className="text-sm md:text-base mb-8 text-zinc-400 leading-relaxed font-medium">
              Whether you're archiving historical content or gathering assets for your next masterpiece, our platform ensures speed, security, and surgical precision across every bit.
            </p>
            
            <div className="grid grid-cols-2 gap-4 md:gap-5">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <SpotlightCard className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/10 text-left">
                    <div className="flex items-center mb-2">
                      <div className="mr-2 text-zinc-400">
                        {achievement.icon}
                      </div>
                      <div className="text-xl font-bold tracking-tight text-white">{achievement.value}</div>
                    </div>
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{achievement.label}</div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
