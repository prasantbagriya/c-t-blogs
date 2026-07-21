"use client"

import { motion } from "motion/react"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { GlowingEffect } from "./ui/glowing-effect"

export default function Pricing({ onStart, onNavigate }: { onStart?: () => void, onNavigate?: (page: string) => void }) {
  const plans = [
    {
      name: "Lite",
      price: "49",
      description: "Perfect for small teams getting started with messaging.",
      features: ["1k Monthly Messages", "5 Official Channels", "Standard Automation", "Email Support"],
      highlight: false
    },
    {
      name: "Pro",
      price: "149",
      description: "Advanced features for growing businesses.",
      features: ["Unlimited Messages", "20 Official Channels", "Advanced AI Flows", "Priority 24/7 Support", "CRM Integrations"],
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Tailored solutions for large scale operations.",
      features: ["Dedicated Instances", "White-label Portal", "SLA Guarantees", "Custom Engineering", "On-premise Options"],
      highlight: false
    }
  ]

  return (
    <section className="py-10 bg-transparent relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block py-1.5 px-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-6 ">
            Tier Structure
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-white tracking-tighter">
            Fair pricing <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600 font-medium">without hidden payloads.</span>
          </h2>
          <div className="flex items-center justify-center gap-4 mb-8">
             <div className="h-px w-12 bg-blue-500/30"></div>
             <span className="text-blue-400 font-bold uppercase tracking-[0.3em] text-[10px]">Includes 7-Day Free Trial</span>
             <div className="h-px w-12 bg-blue-500/30"></div>
          </div>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium mb-10">
            Transparent infrastructure fees that scale with your volume. Unlimited team members across all tiers.
          </p>
          <button 
            onClick={() => onNavigate?.('contact')}
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 rounded-full font-bold hover:scale-105 active:scale-95 "
          >
            Talk to an Expert
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative group h-full"
            >
              <div className={`relative h-full bg-slate-900/40 backdrop-blur-xl border ${plan.highlight ? 'border-blue-500/50 ' : 'border-white/10'} rounded-[2rem] p-8 flex flex-col hover:border-blue-500/50 overflow-hidden`}>
                <GlowingEffect blur={0} borderWidth={plan.highlight ? 2 : 1.5} spread={plan.highlight ? 80 : 40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
                
                <div className="relative z-10 flex flex-col h-full">
                   <div className="mb-8">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white capitalize">{plan.name}</h3>
                        {plan.highlight && (
                          <span className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full ">Most Popular</span>
                        )}
                     </div>
                     <p className="text-sm text-gray-400 leading-relaxed min-h-[40px]">{plan.description}</p>
                   </div>
                   
                   <div className="mb-8 flex items-end gap-2">
                     {plan.price === "Custom" ? (
                       <span className="text-5xl font-black text-white tracking-tight">Custom</span>
                     ) : (
                       <>
                         <span className="text-5xl font-black text-white tracking-tight">${plan.price}</span>
                         <span className="text-gray-400 font-medium mb-2">/mo</span>
                       </>
                     )}
                   </div>

                   <ul className="space-y-4 mb-10 flex-grow">
                     {plan.features.map((feature, j) => (
                       <li key={j} className="flex items-center gap-3 text-sm font-medium">
                         <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.highlight ? 'text-blue-400' : 'text-gray-600'}`} />
                         <span className={plan.highlight ? 'text-gray-200' : 'text-gray-400'}>{feature}</span>
                       </li>
                     ))}
                   </ul>

                    <button
                      onClick={() => onStart ? onStart() : onNavigate?.('contact')}
                      className={`w-full py-4 rounded-2xl font-bold tracking-widest uppercase text-xs ${ plan.highlight ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10' }`}
                    >
                      {plan.price === "Custom" ? "Contact Sales" : "Get Started Now"}
                    </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
