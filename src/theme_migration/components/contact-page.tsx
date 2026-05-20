"use client"

import React from "react"
import { motion } from "motion/react"
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Loader2 } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/inquiries/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: `Subject: ${formData.subject}\n\nMessage: ${formData.message}`,
          source: "contact_page",
          type: "contact_form"
        })
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        alert("Failed to send message. Please try again.")
      }
    } catch (err) {
      console.error("Error:", err)
      alert("Something went wrong. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <section className="pt-36 pb-24 bg-black relative">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Message Sent!</h2>
            <p className="text-xl text-gray-300">Thank you for reaching out. We will get back to you shortly.</p>
            <button onClick={() => setIsSubmitted(false)} className="mt-8 text-blue-400 hover:underline">Send another message</button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="pt-36 pb-24 bg-black relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tighter">Get In Touch</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto font-medium">
              Ready to transform your brand? Let's start a conversation about your goals and how we can help you achieve them.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5 sm:p-8 backdrop-blur-sm shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
              <div className="space-y-6">
                {[
                  { icon: <Mail className="h-6 w-6 text-blue-400" />, label: "Email", value: "hello@chatwizs.com", color: "bg-blue-500/20" },
                  { icon: <Phone className="h-6 w-6 text-green-400" />, label: "Phone", value: "+91 97727 71388", color: "bg-green-500/20" },
                  { icon: <MapPin className="h-6 w-6 text-purple-400" />, label: "Location", value: "Bangalore, India", color: "bg-purple-500/20" },
                  { icon: <Clock className="h-6 w-6 text-orange-400" />, label: "Business Hours", value: "Mon - Fri: 9AM - 6PM PST", color: "bg-orange-500/20" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-4 group">
                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">{item.label}</p>
                      <p className="text-white font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5 sm:p-8 backdrop-blur-sm shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Why Choose ChatWizs?</h3>
              <ul className="space-y-4">
                {[
                  "Proven track record with 500+ successful campaigns",
                  "98% client satisfaction rate",
                  "$15M+ in revenue generated for clients",
                  "24/7 support and dedicated account management"
                ].map((text, i) => (
                  <li key={i} className="flex items-start space-x-3 group">
                    <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5 group-hover:bg-blue-500/40 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <span className="text-gray-300 font-medium">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-5 sm:p-8 backdrop-blur-sm shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-bold text-gray-300 uppercase tracking-widest px-1">Name</label>
                    <input 
                      id="name" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                      placeholder="Your name" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-bold text-gray-300 uppercase tracking-widest px-1">Email</label>
                    <input 
                      id="email" 
                      required 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                      placeholder="you@example.com" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-bold text-gray-300 uppercase tracking-widest px-1">Subject</label>
                  <input 
                    id="subject" 
                    required 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                    placeholder="How can we help you?" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-bold text-gray-300 uppercase tracking-widest px-1">Message</label>
                  <textarea 
                    id="message" 
                    rows={6} 
                    required 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium resize-none"
                    placeholder="Tell us about your project..."
                  />
                </div>
                
                <button type="submit" disabled={isSubmitting} className="group relative w-full mt-4">
                  <div className="relative inline-block w-full rounded-2xl overflow-visible" style={{ perspective: '600px' }}>
                    <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(45deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#4b0082,#9400d3)] bg-[length:400%_400%] animate-rainbow blur-[2px]" />
                    <motion.div 
                      className="relative z-10 rounded-2xl bg-white text-black px-10 py-5 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 group-hover:bg-gray-50 transition-colors"
                      whileHover={{ rotateX: 10 }}
                      style={{ transformStyle: 'preserve-3d', transformOrigin: 'center bottom' }}
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 text-blue-600" />}
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </motion.div>
                  </div>
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
