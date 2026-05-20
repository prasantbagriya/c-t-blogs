"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { MessageCircle, Smartphone, Layout, Palette, Code, Check, Copy, ArrowRight, Zap, Shield, Globe, Send, X } from "lucide-react"
import SectionHeader from "./section-header"
import PageWrapper from "./page-wrapper"
import BackgroundPaths from "./background-paths"
import SEO from "./seo"
import AnimatedFooter from "./animated-footer"
import Navbar from "./navbar"

interface WidgetGeneratorProps {
  onNavigate?: (page: string) => void
}

export default function WidgetGenerator({ onNavigate }: WidgetGeneratorProps) {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('Hi! I have a question.')
  const [ctaText, setCtaText] = useState('Chat with us')
  const [agentName, setAgentName] = useState('ChatWizs Support')
  const [position, setPosition] = useState<'left' | 'right'>('right')
  const [color, setColor] = useState('#25D366') // Primary color
  const [colorEnd, setColorEnd] = useState('#128C7E') // Gradient end
  const [colorType, setColorType] = useState<'solid' | 'gradient'>('gradient')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [isCopied, setIsCopied] = useState(false)
  const [showPreviewBubble, setShowPreviewBubble] = useState(true)

  // Generate the code snippet
  const generateSnippet = () => {
    return `<!-- ChatWizs WhatsApp Widget -->
<script 
  src="https://chatwizs.com/cdn/widget.js" 
  data-phone="${phone.replace(/\D/g, '')}" 
  data-message="${encodeURIComponent(message)}" 
  data-agent="${agentName}"
  data-pos="${position}" 
  data-color="${color}"
  data-color-end="${colorType === 'gradient' ? colorEnd : color}"
  data-theme="${theme}"
></script>
<!-- End ChatWizs WhatsApp Widget -->`
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generateSnippet())
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <PageWrapper>
      <SEO 
        title="Free WhatsApp Chat Widget Generator"
        description="Add a professional floating WhatsApp chat button to your website for free. No coding required. Boost customer engagement instantly."
        keywords="WhatsApp widget, WhatsApp chat button, free website widget, ChatWizs"
      />
      <div className="relative">
        <Navbar onNavigate={onNavigate} />
        {/* Signature Background Paths */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <BackgroundPaths />
        </div>

        <main className="relative pt-28 sm:pt-20 pb-20 font-sans selection:bg-blue-500 selection:text-white" aria-labelledby="main-title">
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "ChatWizs Free WhatsApp Chat Widget Generator",
              "url": "https://chatwizs.com/whatsapp-widget-generator",
              "applicationCategory": "BusinessApplication",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
              "description": "Create a professional floating WhatsApp chat button for your website for free. No coding required."
            })}
          </script>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <header className="mb-12">
              <SectionHeader 
                id="main-title"
                level="h1"
                badge="Growth Tool"
                title="WhatsApp Chat Widget Generator"
                description="Turn your website visitors into customers. Create a custom floating WhatsApp button in seconds and boost your engagement instantly."
              />
            </header>

            <div className="grid lg:grid-cols-2 gap-8 items-stretch mt-12">
              {/* Configuration Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-5 sm:p-10 flex flex-col justify-between"
              >
                <div className="space-y-8">
                  <article>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                        <Palette className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <h2 className="text-xl font-bold text-white">Customize Widget</h2>
                    </div>
                    
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Brand / Brain Name</label>
                            <input 
                              type="text" 
                              placeholder="e.g. ChatWizs Support" 
                              value={agentName}
                              onChange={(e) => setAgentName(e.target.value)}
                              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700 font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Welcome Message</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Chat with us" 
                              value={ctaText}
                              onChange={(e) => setCtaText(e.target.value)}
                              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700 font-medium"
                            />
                          </div>
                        </div>

                        {/* Customization Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Primary Color</label>
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-2xl">
                              <input 
                                type="color" 
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-12 h-12 bg-transparent rounded-lg cursor-pointer"
                              />
                              <input 
                                type="text" 
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="bg-transparent text-white text-sm font-mono flex-1 outline-none uppercase"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Color Mode</label>
                            <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
                                <button 
                                  type="button"
                                  onClick={() => setColorType('solid')}
                                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${colorType === 'solid' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                                >Solid</button>
                                <button 
                                  type="button"
                                  onClick={() => setColorType('gradient')}
                                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${colorType === 'gradient' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                                >Gradient</button>
                            </div>
                          </div>
                        </div>

                        {colorType === 'gradient' && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6"
                          >
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Gradient End Color</label>
                            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-2xl">
                              <input 
                                type="color" 
                                value={colorEnd}
                                onChange={(e) => setColorEnd(e.target.value)}
                                className="w-12 h-12 bg-transparent rounded-lg cursor-pointer"
                              />
                              <input 
                                type="text" 
                                value={colorEnd}
                                onChange={(e) => setColorEnd(e.target.value)}
                                className="bg-transparent text-white text-sm font-mono flex-1 outline-none uppercase"
                              />
                            </div>
                          </motion.div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Position</label>
                            <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
                                <button 
                                  type="button"
                                  onClick={() => setPosition('left')}
                                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${position === 'left' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                                >Left</button>
                                <button 
                                  type="button"
                                  onClick={() => setPosition('right')}
                                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${position === 'right' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                                >Right</button>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Initial Message</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Hi! I have a question." 
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700 font-medium"
                            />
                          </div>
                        </div>
                  </article>

                  <button 
                    type="button"
                    onClick={handleCopy}
                    className="w-full py-5 bg-white text-black rounded-2xl font-bold text-sm hover:-translate-y-1 hover:shadow-2xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Code className="w-4 h-4" />}
                    {isCopied ? 'Code Copied' : 'Get Installation Code'}
                  </button>
                </div>
              </motion.div>

              {/* Live Preview Card */}
              <div className="flex flex-col h-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-4 relative overflow-hidden flex-1 flex flex-col min-h-[500px] lg:min-h-full"
                >
                  {/* Browser UI */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500/60" />
                      <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                    </div>
                    <div className="bg-white/5 px-4 py-1 rounded-full border border-white/5 text-[7px] font-bold text-gray-500 tracking-widest uppercase">Preview Mode</div>
                    <div className="w-8" />
                  </div>

                  {/* Site Content Simulation */}
                  <div className="flex-1 relative bg-slate-900/60 m-2 rounded-3xl overflow-hidden border border-white/5">
                    <div className="p-10 space-y-8 opacity-5 pointer-events-none select-none">
                      <div className="h-10 w-1/3 bg-white rounded-lg" />
                      <div className="space-y-4">
                        <div className="h-4 w-full bg-white rounded" />
                        <div className="h-4 w-full bg-white rounded" />
                        <div className="h-4 w-2/3 bg-white rounded" />
                      </div>
                      <div className="h-48 w-full bg-white rounded-3xl" />
                    </div>

                    {/* The Actual Floating Widget Preview */}
                    <div className={`absolute bottom-8 ${position === 'right' ? 'right-8' : 'left-8'} z-20 flex flex-col items-${position === 'right' ? 'end' : 'start'}`}>
                      <AnimatePresence>
                        {showPreviewBubble && (
                          <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9, x: position === 'right' ? 20 : -20 }}
                            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20, x: position === 'right' ? 20 : -20 }}
                            className={`mb-4 w-72 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 ${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-white text-black'}`}
                          >
                             <div 
                                className="p-4 flex items-center justify-between border-b border-white/5" 
                                style={{ 
                                  background: colorType === 'gradient' 
                                    ? `linear-gradient(135deg, ${color}, ${colorEnd})` 
                                    : color 
                                }}
                              >
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/10">
                                      <MessageCircle className="w-4 h-4 text-white" />
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-bold text-white leading-tight">{agentName}</p>
                                      <p className="text-[8px] text-white/70">Replies in minutes</p>
                                   </div>
                                </div>
                                <button type="button" onClick={() => setShowPreviewBubble(false)} className="text-white/40 hover:text-white transition-colors">
                                   <X className="w-3.5 h-3.5" />
                                </button>
                             </div>
                             <div className="p-5">
                                <div className={`p-3 rounded-2xl rounded-tl-none text-[11px] font-medium leading-relaxed ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
                                   {message || "Hi there! How can we help you?"}
                                </div>
                                <button 
                                  type="button"
                                  className="w-full mt-4 py-3 rounded-xl text-white font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-xl"
                                  style={{ 
                                    background: colorType === 'gradient' 
                                      ? `linear-gradient(90deg, ${color}, ${colorEnd})` 
                                      : color 
                                  }}
                                >
                                   <Send className="w-2.5 h-2.5" /> Start Chat
                                </button>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <button 
                        type="button"
                        onClick={() => setShowPreviewBubble(!showPreviewBubble)}
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all text-white border border-white/10"
                        style={{ 
                          background: colorType === 'gradient' 
                            ? `linear-gradient(135deg, ${color}, ${colorEnd})` 
                            : color 
                        }}
                        aria-label="Toggle WhatsApp Chat"
                      >
                         <MessageCircle className="w-8 h-8" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Features Section */}
            <section className="mt-24" aria-labelledby="features-heading">
              <div className="text-center mb-12">
                 <span className="text-blue-400 font-bold tracking-widest uppercase text-xs mb-3 block">Website Growth</span>
                 <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-white tracking-tighter">Why add a WhatsApp Widget?</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <article className="p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] hover:border-blue-500/50 transition-colors group">
                   <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <Zap className="text-yellow-400 w-5 h-5" aria-hidden="true" />
                   </div>
                   <h3 className="text-lg font-bold text-white mb-3">3x More Leads</h3>
                   <p className="text-gray-500 text-xs leading-relaxed font-medium">WhatsApp is the world's most popular chat app. Users are 70% more likely to message you on WA than fill a form.</p>
                </article>
                <article className="p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] hover:border-blue-500/50 transition-colors group">
                   <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <Shield className="text-emerald-400 w-5 h-5" aria-hidden="true" />
                   </div>
                   <h3 className="text-lg font-bold text-white mb-3">Instant Trust</h3>
                   <p className="text-gray-500 text-xs leading-relaxed font-medium">Seeing a direct WhatsApp chat button builds immediate trust with your website visitors.</p>
                </article>
                <article className="p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] hover:border-blue-500/50 transition-colors group">
                   <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <Smartphone className="text-blue-400 w-5 h-5" aria-hidden="true" />
                   </div>
                   <h3 className="text-lg font-bold text-white mb-3">Mobile Optimized</h3>
                   <p className="text-gray-500 text-xs leading-relaxed font-medium">The widget automatically adapts to mobile screens, ensuring a seamless experience for smartphone users.</p>
                </article>
              </div>
            </section>

            {/* Installation Section */}
            <section className="mt-24 grid lg:grid-cols-2 gap-12 items-center">
               <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-white tracking-tighter">Simple Installation</h2>
                  <div className="space-y-8">
                     {[
                       { step: "01", title: "Configure Your Widget", desc: "Enter your number and style your button to match your brand colors." },
                       { step: "02", title: "Copy The Snippet", desc: "Our generator provides a lightweight, clean JavaScript code for your site." },
                       { step: "03", title: "Go Live Instantly", desc: "Paste the code before the closing body tag of your website." }
                     ].map((s, i) => (
                       <div key={i} className="flex gap-6">
                          <span className="text-4xl font-bold text-white/10" aria-hidden="true">{s.step}</span>
                          <div>
                             <h3 className="text-lg font-bold text-white mb-1">{s.title}</h3>
                             <p className="text-gray-500 text-sm leading-relaxed font-medium">{s.desc}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
               <aside className="relative p-10 bg-white text-black rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <div className="relative z-10 space-y-6">
                     <h3 className="text-2xl font-bold tracking-tight">Code Snippet</h3>
                     <div className="bg-gray-100 p-6 rounded-2xl font-mono text-[10px] text-gray-600 relative group border border-gray-200 overflow-x-auto">
                        {generateSnippet()}
                        <button 
                          type="button"
                          onClick={handleCopy}
                          className="absolute top-3 right-3 bg-black text-white p-2.5 rounded-lg hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                     </div>
                     <p className="text-[11px] font-medium text-gray-400 italic text-center">
                       * Ultra-lightweight script. Won't impact page speed.
                     </p>
                  </div>
               </aside>
            </section>

            {/* Redesigned AI Call to Action */}
            <section className="mt-24 mb-12" aria-labelledby="cta-heading">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative p-6 sm:p-16 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] sm:rounded-[3rem] text-center overflow-hidden group"
              >
                {/* Soft ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">New: AI Automation</span>
                  </div>
                  
                  <h3 id="cta-heading" className="text-4xl md:text-5xl font-bold text-white tracking-tighter leading-[1.1]">
                    Ready for AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Automation?</span>
                  </h3>
                  
                  <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-lg mx-auto">
                    Don't just chat—automate. Connect your widget to ChatWizs AI and let our assistant handle customer queries 24/7.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button type="button" onClick={() => onNavigate?.('contact')} className="bg-white text-black px-10 py-5 rounded-2xl font-bold text-sm hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 transition-all duration-300 flex items-center gap-3">
                      Get Started Free <ArrowRight className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => onNavigate?.('contact')} className="text-white hover:text-blue-400 px-10 py-5 font-bold text-sm transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
              </motion.div>
            </section>
          </div>
        </main>
        <AnimatedFooter onNavigate={onNavigate} />
      </div>
    </PageWrapper>
  )
}
