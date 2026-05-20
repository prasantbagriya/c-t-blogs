import { motion } from "motion/react"
import { Shield, DollarSign, CheckCircle2, ArrowRight } from "lucide-react"
import { GlowingEffect } from "./ui/glowing-effect"

export default function ApiShowcase() {
  return (
    <section className="py-32 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative bg-slate-950 rounded-[3rem] border border-white/5 overflow-hidden group p-8 md:p-12 lg:p-16"
        >
          <GlowingEffect
            blur={0}
            borderWidth={1.5}
            spread={120}
            glow={true}
            disabled={false}
            proximity={120}
            inactiveZone={0.01}
          />
          
          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Column: Text & Badges */}
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Automations</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
                  API Integrations
                </h2>
                <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-xl">
                  Connect ChatWizs with Shopify, WooCommerce, and your favorite tools using our robust API infrastructure.
                </p>
              </div>

              {/* Badges */}
              <div className="space-y-4">
                {[
                  { icon: <Shield className="w-4 h-4 text-emerald-400" />, text: "SSL Secured" },
                  { icon: <DollarSign className="w-4 h-4 text-emerald-400" />, text: "No Monthly Fees" },
                  { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, text: "99.9% Uptime" }
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                      {badge.icon}
                    </div>
                    <span className="text-gray-300 font-bold uppercase tracking-widest text-xs">{badge.text}</span>
                  </div>
                ))}
              </div>

              {/* Button */}
              <div className="pt-4">
                <a href="/get-started" className="group/btn inline-block">
                  <div className="relative inline-block rounded-xl overflow-visible" style={{ perspective: '600px' }}>
                    <div className="absolute -inset-0.5 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 bg-[linear-gradient(45deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#4b0082,#9400d3)] bg-[length:400%_400%] animate-rainbow blur-[2px]" />
                    <motion.div 
                      className="relative z-10 rounded-xl bg-white text-black px-10 py-4 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                      whileHover={{ rotateX: 10 }}
                      style={{ transformStyle: 'preserve-3d', transformOrigin: 'center bottom' }}
                    >
                      Learn More
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </motion.div>
                  </div>
                </a>
              </div>
            </div>

            {/* Right Column: Browser Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative hidden lg:block"
            >
              <div className="relative bg-[#0a0a0b] rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden aspect-[4/3]">
                {/* Browser Header */}
                <div className="h-10 border-b border-white/5 bg-white/5 flex items-center px-6 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="mx-auto w-2/3 h-5 bg-black/40 rounded-md border border-white/5" />
                </div>
                
                {/* Mockup Dashboard Content */}
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-white/5 rounded-2xl border border-white/5 animate-pulse" />
                    <div className="h-24 bg-white/5 rounded-2xl border border-white/5 animate-pulse" style={{ animationDelay: '200ms' }} />
                  </div>
                  <div className="h-40 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center">
                    <div className="w-full max-w-[80%] space-y-3">
                      <div className="h-2 bg-white/10 rounded w-1/2" />
                      <div className="h-2 bg-white/10 rounded w-full" />
                      <div className="h-2 bg-white/10 rounded w-3/4" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-white/5 rounded-2xl border border-white/5" />
                    <div className="h-20 bg-white/5 rounded-2xl border border-white/5" />
                    <div className="h-20 bg-white/5 rounded-2xl border border-white/5" />
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 blur-[130px] rounded-full -translate-x-1/2 -translate-y-1/2" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

