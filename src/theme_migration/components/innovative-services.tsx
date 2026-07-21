"use client"

import React from "react"
import { motion } from "motion/react"
import { BarChart3, TrendingUp, Shield, Zap, Globe, Mail } from "lucide-react"
import { GlowingEffect } from "./ui/glowing-effect"

export default function InnovativeServices() {
  return (
    <section className="py-10 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tighter">
            Innovative services for <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">growth</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Custom-tailored solutions to streamline, innovate, and grow your business with automated efficiency.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 lg:gap-8">
          
          {/* Main Service Cards (Paid Social & Google Ads) */}
          {[
            {
              title: "Paid Social",
              desc: "Drive growth and engagement with data-driven paid social media ads, elevating your brand through targeted strategies.",
              color: "indigo",
              content: (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <span>Channels</span>
                    <div className="flex gap-1.5">
                      {['bg-pink-500', 'bg-yellow-400', 'bg-blue-500'].map(c => <span key={c} className={`w-1.5 h-1.5 rounded-full ${c}`} />)}
                    </div>
                  </div>
                  {[['Facebook', 'bg-blue-500', '85%'], ['Instagram', 'bg-pink-500', '70%'], ['TikTok', 'bg-yellow-400', '50%'], ['Snapchat', 'bg-teal-400', '95%']].map(([n, c, w]) => (
                    <div key={n} className={`${c} h-5 rounded flex items-center px-3 text-[10px] font-bold text-white `} style={{ width: w }}>{n}</div>
                  ))}
                  <div className="flex items-end justify-between mt-6">
                    <div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Growth</div>
                      <div className="text-3xl font-bold text-green-400 tracking-tight">+33%</div>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-400/50" />
                  </div>
                </div>
              )
            },
            {
              title: "Google Ads",
              desc: "Reach customers at the right moment with Google Ads, driving traffic and sales through precisely targeted search campaigns.",
              color: "blue",
              content: (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-black text-blue-500 text-lg">G</div>
                    <div>
                      <div className="text-sm font-bold text-white">Google Ads</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">Campaign Analytics</div>
                    </div>
                  </div>
                  {[
                    ['Impressions', '145.2K', 'text-green-400'],
                    ['Clicks', '1.2M', 'text-blue-400'],
                    ['CTR', '8.2%', 'text-white'],
                    ['Quality Score', '9/10', 'text-yellow-400']
                  ].map(([l, v, c]) => (
                    <div key={l} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-400 font-medium">{l}</span>
                      <span className={`${c} font-bold tracking-tight`}>{v}</span>
                    </div>
                  ))}
                </div>
              )
            }
          ].map((s, i) => (
            <div key={i} className="md:col-span-3 group relative bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-8 overflow-hidden hover:border-blue-500/50 flex flex-col justify-between min-h-[420px]">
              <GlowingEffect blur={0} borderWidth={1.5} spread={60} glowproximity={80} inactiveZone={0.01} />
              <div className="relative z-10 flex flex-col h-full">
                <div className="bg-slate-950/50 rounded-xl p-6 border border-white/10 mb-8">
                  {s.content}
                </div>
                <div className="mt-auto">
                  <h3 className={`text-2xl font-bold text-white mb-3 group-hover:text-${s.color}-400 `}>{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Secondary Services */}
          {[
            { 
              title: "Email / SMS", 
              desc: "Reach customers with targeted email and SMS marketing that drives sales, growth, and loyalty.",
              content: (
                <div className="w-full h-full space-y-3">
                   <div className="w-2/3 h-2 bg-white/10 rounded-full" />
                   <div className="w-full h-12 bg-white/5 rounded-lg border border-white/5 relative">
                      <div className="absolute left-3 top-2 w-1/2 h-1.5 bg-white/10 rounded-full" />
                      <div className="absolute right-2 bottom-2 px-3 py-1 bg-blue-600 rounded-md text-[8px] font-bold text-white uppercase tracking-widest ">Send</div>
                   </div>
                </div>
              )
            },
            { 
              title: "SEO", 
              desc: "Enhance your search engine visibility with SEO services, including audits, keyword analysis, and optimization.",
              content: (
                <div className="w-full h-full space-y-4">
                   <div className="flex justify-between items-center text-[8px] font-black uppercase text-gray-500 tracking-widest">
                      <span>SEO Report</span>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                         <div className="text-[7px] text-gray-500 uppercase font-black mb-1">Traffic</div>
                         <div className="text-[10px] font-bold text-green-400 flex items-center gap-1">Growing <TrendingUp className="w-2 h-2" /></div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                         <div className="text-[7px] text-gray-500 uppercase font-black mb-1">Ranking</div>
                         <div className="w-full h-1.5 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full bg-green-500 w-[80%] rounded-full " />
                         </div>
                      </div>
                   </div>
                </div>
              )
            },
            { 
              title: "Analytics", 
              desc: "Track performance and gain insights with comprehensive analytics and reporting solutions for data-driven decisions.",
              content: (
                <div className="w-full h-full space-y-3">
                   <div className="text-[8px] font-black uppercase text-gray-500 tracking-widest">Performance</div>
                   <div className="grid grid-cols-2 gap-2">
                      {[
                        ['Ranking', '#1', 'text-blue-400'],
                        ['Impressions', '56K', 'text-white'],
                        ['Clicks', '3.8K', 'text-blue-400'],
                        ['Visitors', '1.6K', 'text-white']
                      ].map(([l, v, c]) => (
                        <div key={l} className="bg-white/5 p-2 rounded-lg border border-white/5">
                          <div className="text-[6px] text-gray-500 uppercase font-black mb-0.5">{l}</div>
                          <div className={`text-[10px] font-bold ${c}`}>{v}</div>
                        </div>
                      ))}
                   </div>
                </div>
              )
            }
          ].map((s, i) => (
            <div key={i} className="md:col-span-2 group relative bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6 overflow-hidden hover:border-blue-500/50 min-h-[350px] flex flex-col">
              <GlowingEffect blur={0} borderWidth={1.5} spread={60} glowproximity={80} inactiveZone={0.01} />
              <div className="relative z-10 flex flex-col h-full">
                <div className="bg-slate-950/50 rounded-xl p-5 border border-white/10 h-36 flex flex-col justify-center items-center mb-6">
                   {s.content}
                </div>
                <div className="mt-auto">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 ">{s.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Web Development Card */}
          <div className="md:col-span-6 group relative bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-blue-500/50 min-h-[320px]">
            <GlowingEffect blur={0} borderWidth={1.5} spread={60} glowproximity={80} inactiveZone={0.01} />
            <div className="relative z-10 p-8 lg:p-12 flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/3 flex flex-col space-y-6 text-center md:text-left">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-blue-400 tracking-tight">Web Development</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Custom high-performance websites built for scale, performance, and seamless user experiences.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {['SSL Secured', 'High Speed', '99.9% Uptime'].map(t => (
                    <span key={t} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">{t}</span>
                  ))}
                </div>
              </div>
              
              <div className="md:w-2/3 w-full group-hover:scale-[1.02] transition-transform ">
                <div className="bg-slate-950 rounded-xl overflow-hidden border border-white/10">
                   <div className="flex items-center px-4 py-3 bg-slate-900 border-b border-white/5 gap-2">
                      <div className="flex gap-1.5">
                        {[1, 2, 3].map(j => <div key={j} className="w-2.5 h-2.5 rounded-full bg-white/10" />)}
                      </div>
                      <div className="mx-auto bg-black/50 rounded-full px-6 py-1 text-[10px] font-medium text-gray-500 border border-white/5">
                        chatwizs.com
                      </div>
                   </div>
                   <div className="p-6 grid grid-cols-3 gap-4">
                      <div className="h-24 bg-white/5 rounded-lg border border-white/5 col-span-3" />
                      <div className="h-16 bg-white/5 rounded-lg border border-white/5" />
                      <div className="h-16 bg-white/5 rounded-lg border border-white/5" />
                      <div className="h-16 bg-white/5 rounded-lg border border-white/5" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
