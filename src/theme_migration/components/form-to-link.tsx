"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  FileText, 
  Smartphone, 
  Globe, 
  Plus, 
  Trash2, 
  Send, 
  Copy, 
  Check, 
  ArrowRight,
  Zap,
  Shield,
  Layout,
  MessageCircle
} from "lucide-react"
import SectionHeader from "./section-header"
import AnimatedFooter from "./animated-footer"
import PageWrapper from "./page-wrapper"
import BackgroundPaths from "./background-paths"
import SEO from "./seo"
import Navbar from "./navbar"

interface FormField {
  id: string
  label: string
  placeholder: string
}

export default function FormToLink({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [phone, setPhone] = useState('')
  const [fields, setFields] = useState<FormField[]>([
    { id: '1', label: 'Name', placeholder: 'Enter your name' },
    { id: '2', label: 'Service Interested In', placeholder: 'e.g. SEO, Web Design' }
  ])
  const [isCopied, setIsCopied] = useState(false)
  const [generatedLink, setGeneratedLink] = useState('')

  const addField = () => {
    const newField = {
      id: Date.now().toString(),
      label: 'New Field',
      placeholder: 'Enter detail'
    }
    setFields([...fields, newField])
  }

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
  }

  const updateField = (id: string, key: 'label' | 'placeholder', value: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f))
  }

  const generateLink = () => {
    if (!phone) return
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Create a message template that the USER of the link will see
    let message = "Hi! I'm interested in your services.\n\n"
    fields.forEach(f => {
      message += `*${f.label}*: [Your ${f.label}]\n`
    })
    
    const encodedText = encodeURIComponent(message)
    const url = `https://wa.me/${cleanPhone}?text=${encodedText}`
    setGeneratedLink(url)
  }

  const handleCopy = () => {
    if (!generatedLink) generateLink()
    navigator.clipboard.writeText(generatedLink || '')
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <PageWrapper>
      <SEO 
        title="WhatsApp Form-to-Link Generator"
        description="Build custom lead forms that open directly in WhatsApp. Convert form data into professional WhatsApp messages instantly."
        keywords="WhatsApp form generator, WhatsApp lead form, free business tool, ChatWizs"
      />
      <div className="relative">
        <Navbar onNavigate={onNavigate} />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <BackgroundPaths />
        </div>

        <main className="relative pt-28 sm:pt-20 pb-20 font-sans selection:bg-blue-500 selection:text-white">
          {/* SEO Schema */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "ChatWizs WhatsApp Form-to-Link Generator",
              "url": "https://chatwizs.com/whatsapp-form-generator",
              "applicationCategory": "BusinessApplication",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
              "description": "Create professional WhatsApp lead forms. Convert form data into pre-formatted WhatsApp messages instantly."
            })}
          </script>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <header className="mb-12">
              <SectionHeader 
                id="main-title"
                level="h1"
                badge="Lead Magnet Tool"
                title="WhatsApp Form-to-Link Generator"
                description="Build custom lead forms that open directly in WhatsApp. Perfect for service bookings, inquiries, and customer support."
              />
            </header>

            <div className="grid lg:grid-cols-2 gap-8 items-stretch mt-12">
              {/* Form Builder */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between"
              >
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                        <Layout className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-white">Form Builder</h2>
                    </div>
                    <button 
                      type="button"
                      onClick={addField}
                      className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 active:scale-95 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Field
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Phone Number */}
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block px-1">Your WhatsApp Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <Globe className="h-4 w-4 text-blue-500/50" />
                        </div>
                        <input 
                          type="tel" 
                          placeholder="919876543210" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:border-blue-500/50 outline-none placeholder:text-gray-700 font-medium"
                        />
                      </div>
                    </div>

                    {/* Dynamic Fields */}
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      <AnimatePresence initial={false}>
                        {fields.map((field, index) => (
                          <motion.div 
                            key={field.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4 relative group/field"
                          >
                            <button 
                              type="button"
                              onClick={() => removeField(field.id)}
                              className="absolute top-4 right-4 text-gray-600 hover:text-rose-500 opacity-0 group-hover/field:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] font-bold text-gray-600 uppercase mb-2 block">Field Label</label>
                                <input 
                                  type="text" 
                                  value={field.label}
                                  onChange={(e) => updateField(field.id, 'label', e.target.value)}
                                  className="w-full bg-transparent border-b border-white/10 text-white text-xs py-1 outline-none focus:border-blue-500/50 font-medium"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-gray-600 uppercase mb-2 block">Placeholder</label>
                                <input 
                                  type="text" 
                                  value={field.placeholder}
                                  onChange={(e) => updateField(field.id, 'placeholder', e.target.value)}
                                  className="w-full bg-transparent border-b border-white/10 text-white text-xs py-1 outline-none focus:border-blue-500/50 font-medium"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleCopy}
                    className="w-full py-5 bg-white text-black rounded-2xl font-bold text-sm hover:shadow-2xl active:scale-95 flex items-center justify-center gap-3"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {isCopied ? 'Link Copied' : 'Generate Form Link'}
                  </button>
                </div>
              </motion.div>

              {/* Form Preview */}
              <div className="flex flex-col">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-4 relative overflow-hidden h-full flex flex-col"
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500/40" />
                      <div className="bg-white/5 px-6 py-1 rounded-full text-[8px] font-bold text-gray-500 tracking-widest uppercase">Lead Form Preview</div>
                    </div>
                    <div className="text-[8px] font-bold text-blue-400">LIVE PREVIEW</div>
                  </div>

                  <div className="flex-1 bg-slate-900/40 m-2 rounded-3xl p-8 space-y-6 overflow-y-auto">
                    <div className="space-y-2">
                       <h3 className="text-xl font-bold text-white tracking-tight">Contact Us</h3>
                       <p className="text-xs text-gray-500 font-medium">Please fill the details below to chat on WhatsApp.</p>
                    </div>

                    <div className="space-y-5">
                      {fields.map(field => (
                        <div key={field.id} className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{field.label}</label>
                          <div className="w-full h-12 bg-white/5 border border-white/5 rounded-xl flex items-center px-4 text-gray-700 text-xs italic">
                            {field.placeholder}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                       <button className="w-full py-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-xs flex items-center justify-center gap-2 pointer-events-none">
                          <MessageCircle className="w-4 h-4" /> Send to WhatsApp
                       </button>
                    </div>
                  </div>

                  <div className="p-6 text-center">
                    <p className="text-[9px] text-gray-600 font-medium max-w-xs mx-auto">
                      * When users fill this form on your site, it will open WhatsApp with all data pre-filled in a clean message format.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Features Section */}
            {/* How it Works, Features, FAQ */}
            <div className="mt-32 grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-8">How to build your <span className="text-blue-400">Lead Form?</span></h3>
                <div className="space-y-10">
                  {[
                    { step: "01", title: "Add Custom Fields", desc: "Define what information you need. Add fields like Name, Service Type, Location, or Budget." },
                    { step: "02", title: "Set Placeholders", desc: "Give users a hint on what to type to increase completion rates and data accuracy." },
                    { step: "03", title: "Generate & Share", desc: "Get a unique link. When users fill the form, all data is formatted into a clean WA message." }
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
                <div className="relative bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-xl">
                  <div className="aspect-square bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 border-dashed overflow-hidden relative group">
                    <Layout className="w-16 h-16 text-gray-800 transition-transform group-hover:scale-110" />
                    <div className="absolute bottom-4 left-0 right-0 px-6">
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-blue-500" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full " />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Smart Formatting Engine Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Features Section */}
            <div className="mt-32">
              <div className="text-center mb-16">
                <span className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-3 block">Lead Generation</span>
                <h3 className="text-3xl font-bold text-white mb-4">Why use Form-to-Link?</h3>
                <p className="text-xs text-gray-500 font-medium">Capture structured data and convert visitors into customers faster</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { title: "Structured Data", desc: "No more messy 'Hi' messages. Get all client info in one go.", icon: <FileText /> },
                  { title: "Zero Hosting", desc: "No website needed. Use this link on Instagram, FB, or Ads.", icon: <Globe /> },
                  { title: "High Conversion", desc: "Forms pre-fill the message, making it easy for users to send.", icon: <Zap /> },
                  { title: "100% Private", desc: "Data is never stored. It goes straight to your WhatsApp.", icon: <Shield /> }
                ].map((item, i) => (
                  <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 group">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 text-blue-400 group-hover:bg-blue-500 group-hover:text-white ">
                      {item.icon}
                    </div>
                    <h4 className="text-white font-bold text-sm mb-3">{item.title}</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-32 mb-20 max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <span className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-3 block">Help Center</span>
                <h3 className="text-3xl font-bold text-white">Frequently Asked Questions</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { q: "Can I add unlimited fields?", a: "Technically yes, but we recommend 3-5 fields for the best user conversion on mobile." },
                  { q: "Where does the data go?", a: "The data is never stored on our servers. It is formatted into a URL that opens in your WhatsApp." },
                  { q: "Is this tool free?", a: "Yes, our Form-to-Link tool is completely free for all businesses and marketers." },
                  { q: "Does it work with WA Business?", a: "Yes, it works perfectly with both personal WhatsApp and the WhatsApp Business app." }
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

            {/* AI CTA Section */}
            <section className="mt-24 mb-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative p-12 md:p-16 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] text-center overflow-hidden group"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Automation Ready</span>
                  </div>
                  
                  <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tighter leading-[1.1]">
                    Lead Generation <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">on Autopilot.</span>
                  </h3>
                  
                  <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-lg mx-auto">
                    Why handle forms manually? Let ChatWizs AI qualify your leads and book appointments directly from your WhatsApp forms.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button onClick={() => onNavigate?.('contact')} className="bg-white text-black px-10 py-5 rounded-2xl font-bold text-sm hover: active:scale-95 flex items-center gap-3">
                      Boost Your Sales <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </section>
          </div>
        </main>
        <AnimatedFooter onNavigate={onNavigate} />
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </PageWrapper>
  )
}
