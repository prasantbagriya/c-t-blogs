import React, { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Globe, Zap, Shield, Download } from "lucide-react"
import SpotlightCard from "./SpotlightCard"

const achievements = [
  { icon: <Download className="w-6 h-6" />, label: "Media Extracted", value: "1.2M+" },
  { icon: <Globe className="w-6 h-6" />, label: "Platforms Supported", value: "50+" },
  { icon: <Zap className="w-6 h-6" />, label: "Success Rate", value: "99.9%" },
  { icon: <Shield className="w-6 h-6" />, label: "Secure Sessions", value: "100%" },
]

export default function AboutSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return (
    <section ref={ref} id="about" className="py-12 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div className="grid md:grid-cols-2 gap-16 items-center" style={{ y, opacity }}>
          <div className="relative">
            <div className="absolute -inset-4 bg-white/5 blur-3xl rounded-full"></div>
            <div className="relative z-10 aspect-square rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/50 flex items-center justify-center p-12">
               <div className="text-zinc-800 absolute inset-0 flex items-center justify-center opacity-10">
                 <Download size={400} strokeWidth={0.5} />
               </div>
               <div className="relative z-20 text-center">
                 <div className="text-8xl font-black tracking-tighter mb-2 italic">4K</div>
                 <div className="text-xl font-bold tracking-[0.2em] text-zinc-500 uppercase">High Fidelity</div>
               </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tighter">About NEXTGEN-X</h2>
            <p className="text-lg mb-8 text-zinc-400 leading-relaxed">
              NEXTGEN-X is more than just a downloader; it's a high-performance media extraction engine designed for the modern web. Built with distributed processing and advanced parsing algorithms, we ensure you get the highest quality media with zero compromises.
            </p>
            <p className="text-lg mb-10 text-zinc-400 leading-relaxed">
              Whether you're archiving historical content or gathering assets for your next masterpiece, our platform ensures speed, security, and surgical precision across every bit.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.label}
                  className="bg-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center mb-3">
                    <div className="mr-3 text-zinc-400 group-hover:text-white transition-colors">
                      {achievement.icon}
                    </div>
                    <div className="text-2xl font-bold tracking-tight">{achievement.value}</div>
                  </div>
                  <div className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">{achievement.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
