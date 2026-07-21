"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  MessageCircle, 
  Smartphone, 
  Globe, 
  Send, 
  Zap, 
  Shield, 
  ArrowRight, 
  UserPlus, 
  Copy, 
  Check, 
  QrCode,
  Share2,
  Download,
  Layout
} from "lucide-react"
import SectionHeader from "./section-header"
import PageWrapper from "./page-wrapper"
import BackgroundPaths from "./background-paths"
import SEO from "./seo"

interface FreeToolsProps {
  onNavigate?: (page: string) => void
}

export default function FreeTools({ onNavigate }: FreeToolsProps) {
  const [phone, setPhone] = useState('')
  const [text, setText] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [qrVisible, setQrVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    if (!phone) return
    const cleanPhone = phone.replace(/\D/g, '')
    const encodedText = encodeURIComponent(text)
    const link = `https://wa.me/${cleanPhone}${text ? `?text=${encodedText}` : ''}`
    setGeneratedLink(link)
    setQrVisible(true)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareTool = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ChatWizs - Free WhatsApp QR & Link Generator',
        text: 'Generate professional WhatsApp links and QR codes for your business instantly.',
        url: window.location.href,
      }).catch(console.error);
    } else {
      const shareUrl = `https://wa.me/?text=${encodeURIComponent("Check out this awesome WhatsApp tool: " + window.location.href)}`
      window.open(shareUrl, '_blank')
    }
  }

  const downloadQR = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(generatedLink)}`
    fetch(qrUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chatwizs-wa-qr-${phone}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(() => window.open(qrUrl, '_blank'));
  }

  return (
    <PageWrapper>
      <SEO 
        title="Free WhatsApp Link & QR Generator"
        description="Create custom WhatsApp links and high-resolution QR codes in seconds. Boost your business with pre-filled messages. 100% Free."
        keywords="WhatsApp link generator, WhatsApp QR code, free WhatsApp tool, ChatWizs"
      />
      <div className="relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <BackgroundPaths />
        </div>

        <main className="relative pt-28 sm:pt-20 pb-20 font-sans selection:bg-blue-500 selection:text-white" aria-labelledby="main-title">
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "ChatWizs WhatsApp Link & QR Generator",
              "url": "https://chatwizs.com/whatsapp-link-generator",
              "applicationCategory": "BusinessApplication",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
              "description": "Create professional WhatsApp links and QR codes instantly. Boost your marketing with custom messages and high-res downloads."
            })}
          </script>
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <header className="mb-12">
              <SectionHeader 
                id="main-title"
                level="h1"
                badge="Marketing Tool"
                title="WhatsApp Link & QR Generator"
                description="Create high-converting WhatsApp links and QR codes for your business. Let customers reach you with a single click."
              />
            </header>

            <section className="grid lg:grid-cols-2 gap-8 items-stretch mt-12" aria-label="Tool interface">
              {/* Input Section - Clean Design */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between"
              >
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Configuration</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">WhatsApp Number</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Globe className="h-4 w-4 text-blue-500/50" />
                          </div>
                          <input 
                            type="text" 
                            placeholder="91 98765 43210" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-blue-500/50 outline-none placeholder:text-gray-700 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Custom Message</label>
                        <textarea 
                          rows={4}
                          placeholder="Hi! I want to inquire about..." 
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-blue-500/50 outline-none placeholder:text-gray-700 font-medium resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerate}
                    className="w-full py-5 bg-white text-black rounded-2xl font-bold text-sm hover:shadow-2xl active:scale-95 flex items-center justify-center gap-3"
                  >
                    Generate assets <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>

              {/* Output Section */}
              <div className="flex flex-col">
                <AnimatePresence mode="wait">
                  {qrVisible ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 text-center h-full flex flex-col justify-between"
                    >
                      <div>
                        <div className="bg-white p-4 rounded-3xl inline-block mb-6">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(generatedLink)}`}
                            alt="Generated WhatsApp QR Code for Business"
                            className="w-44 h-44 md:w-48 md:h-48"
                          />
                        </div>

                        <div className="space-y-6">
                          <div className="max-w-sm mx-auto">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Your link</p>
                            <div className="relative flex items-center">
                              <input 
                                readOnly
                                type="text" 
                                value={generatedLink}
                                className="w-full pl-4 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-blue-400 text-center outline-none truncate"
                              />
                              <button 
                                onClick={handleCopy}
                                className="absolute right-3 p-2 text-gray-400 hover:text-white "
                              >
                                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                              onClick={handleCopy}
                              className="flex-1 items-center justify-center gap-2 py-4 bg-white text-black rounded-xl font-bold text-[11px] hover:shadow-xl active:scale-95 flex uppercase tracking-wider"
                            >
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {copied ? 'Copied' : 'Copy Link'}
                            </button>
                            <button 
                              onClick={downloadQR}
                              className="flex-1 items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-[11px] hover:bg-white/10 active:scale-95 flex uppercase tracking-wider"
                            >
                              <Download className="w-4 h-4" />
                              Download PNG
                            </button>
                          </div>

                          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            <button 
                              onClick={handleShareTool}
                              className="flex items-center gap-2 text-gray-600 hover:text-white text-[9px] font-bold uppercase tracking-widest"
                            >
                               <Share2 className="w-3 h-3" /> Share Tool
                            </button>
                            <a 
                              href={generatedLink} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-[9px] font-bold uppercase tracking-widest group"
                            >
                              Live Test 
                              <ArrowRight className="w-3 h-3 group- transition-transform" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-black/20 border border-white/5 border-dashed rounded-[2.5rem] p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]"
                    >
                      <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <QrCode className="w-7 h-7 text-gray-800" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Generate to Preview</h3>
                      <p className="text-gray-600 max-w-[200px] mx-auto leading-relaxed text-[11px] font-medium">
                        Input your details to generate your custom link and QR code.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* Features Section */}
            <section className="mt-24" aria-labelledby="features-heading">
              <div className="text-center mb-12">
                 <span className="text-blue-400 font-bold tracking-widest uppercase text-xs mb-3 block">Professional Grade</span>
                 <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-white tracking-tighter">Why Use Our Generator?</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: <Zap className="text-yellow-400 w-5 h-5" />, title: "Instant Access", desc: "No registration required. Generate and download in under 10 seconds." },
                  { icon: <Shield className="text-emerald-400 w-5 h-5" />, title: "Data Privacy", desc: "We don't store your numbers or messages. Everything happens in your browser." },
                  { icon: <Smartphone className="text-blue-400 w-5 h-5" />, title: "Fully Optimized", desc: "Our links work perfectly across Android, iOS, and WhatsApp Web globally." }
                ].map((f, i) => (
                  <div key={i} className="p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] hover:border-blue-500/50 group text-center">
                     <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                       {f.icon}
                     </div>
                     <h4 className="text-lg font-bold text-white mb-3">{f.title}</h4>
                     <p className="text-gray-500 text-xs leading-relaxed font-medium">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Step by Step Guide - NEW SECTION */}
            <div className="mt-32 grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-8">How to use the <span className="text-blue-400">QR Generator?</span></h3>
                <div className="space-y-10">
                  {[
                    { step: "01", title: "Enter Your Number", desc: "Type your WhatsApp number with country code. Example: 919876543210 (without the + sign)." },
                    { step: "02", title: "Add a Message", desc: "Optional: Write a pre-filled message like 'I want to know more about your service' for your customers." },
                    { step: "03", title: "Generate & Download", desc: "Click generate to create your unique link and high-resolution QR code instantly. Download as PNG for printing." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="text-4xl font-black text-white/5 group-hover:text-blue-500/10 w-16">{item.step}</div>
                      <div>
                        <h4 className="text-white font-bold mb-2">{item.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full" />
                <div className="relative bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl text-center">
                  <div className="aspect-square bg-black/40 rounded-3xl flex items-center justify-center border border-white/5 border-dashed relative group overflow-hidden">
                    <QrCode className="w-24 h-24 text-gray-800 transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-3">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full " />
                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ready for High-Res Print (300 DPI)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Use Cases Section - NEW SECTION */}
            <div className="mt-32">
              <div className="text-center mb-16">
                <span className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-3 block">Infinite Possibilities</span>
                <h3 className="text-3xl font-bold text-white mb-4">Where can you use your QR Code?</h3>
                <p className="text-xs text-gray-500 font-medium">Professional ways to grow your business using WhatsApp QRs</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { title: "Product Packaging", desc: "For instant customer support & feedback", icon: <Layout /> },
                  { title: "Restaurant Tables", desc: "Digital menu, ordering & waiter calls", icon: <Globe /> },
                  { title: "Business Cards", desc: "Let people contact you without typing", icon: <Smartphone /> },
                  { title: "Social Media", desc: "Link in bio, stories & digital ads", icon: <Send /> }
                ].map((item, i) => (
                  <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 group">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 text-blue-400 group-hover:bg-blue-500 group-hover:text-white ">
                      {item.icon}
                    </div>
                    <h4 className="text-white font-bold text-sm mb-3">{item.title}</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section - NEW SECTION */}
            <div className="mt-32 mb-20 max-w-4xl mx-auto">
              <div className="text-center mb-16">
                 <span className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-3 block">Help Center</span>
                 <h3 className="text-3xl font-bold text-white">Frequently Asked Questions</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { q: "Is this tool completely free?", a: "Yes, ChatWizs tools are 100% free to use for both personal and commercial purposes. No hidden costs." },
                  { q: "Will the QR code expire?", a: "No, our generated links and QR codes are static. Once generated, they will work forever as long as your phone number stays the same." },
                  { q: "Can I track the clicks?", a: "Static QR codes don't track clicks. However, our AI platform provides dynamic links with detailed dashboard insights." },
                  { q: "Is it safe to use?", a: "Absolutely. We don't store your personal data or phone numbers. All generation happens locally in your browser session." }
                ].map((faq, i) => (
                  <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:border-blue-500/30 ">
                    <h4 className="text-sm font-bold text-white mb-4 flex gap-3">
                       <span className="text-blue-500">Q.</span> {faq.q}
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                       <span className="text-emerald-500 font-bold">A.</span> {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Redesigned AI Call to Action */}
            <section className="mt-24 mb-12" aria-labelledby="cta-heading">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative p-12 md:p-16 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] text-center overflow-hidden group"
              >
                {/* Soft ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">New: AI Automation</span>
                  </div>
                  
                  <h3 id="cta-heading" className="text-4xl md:text-5xl font-bold text-white tracking-tighter leading-[1.1]">
                    Ready to scale your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Automation?</span>
                  </h3>
                  
                  <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-lg mx-auto">
                    Links are just the beginning. Connect your WA links to ChatWizs AI and convert every click into a customer automatically.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button className="bg-white text-black px-10 py-5 rounded-2xl font-bold text-sm hover: active:scale-95 flex items-center gap-3">
                      Get Started Free <ArrowRight className="w-4 h-4" />
                    </button>
                    <button className="text-white hover:text-blue-400 px-10 py-5 font-bold text-sm ">
                      Learn More
                    </button>
                  </div>
                </div>
              </motion.div>
            </section>
          </div>
        </main>
      </div>
    </PageWrapper>
  )
}
