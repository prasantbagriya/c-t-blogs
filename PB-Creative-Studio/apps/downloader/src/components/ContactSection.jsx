import React, { useState, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Loader2, Send, CheckCircle, Mail, MessageSquare, ShieldCheck } from "lucide-react"

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({ ...prevState, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulating an API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: "", email: "", message: "" })
    }, 3000)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  return (
    <section id="contact" ref={ref} className="py-16 relative overflow-hidden bg-black">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className="container mx-auto px-4 relative z-10"
      >
        <div className="flex flex-col md:flex-row gap-20 items-stretch">
          <div className="flex-1">
            <motion.div variants={itemVariants}>
              <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium mb-6 tracking-widest uppercase">
                GET IN TOUCH
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-10 tracking-tighter text-white">
                Let's stay connected.
              </h2>
              <div className="space-y-10">
                <div className="flex items-start gap-6 group">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-white/20 transition-all duration-300">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Support Email</h4>
                    <p className="text-zinc-500">support@nextgen-x.tech</p>
                  </div>
                </div>
                <div className="flex items-start gap-6 group">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-white/20 transition-all duration-300">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Live Chat</h4>
                    <p className="text-zinc-500">Available 24/7 for premium members</p>
                  </div>
                </div>
                <div className="flex items-start gap-6 group">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-white/20 transition-all duration-300">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Enterprise Solutions</h4>
                    <p className="text-zinc-500">Direct integration for high-volume needs</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="flex-1 bg-zinc-900/40 backdrop-blur-3xl rounded-3xl p-10 border border-white/10 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1">Message</label>
                <textarea
                  name="message"
                  placeholder="Tell us about your project..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-white text-black py-4 rounded-2xl font-bold text-lg hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group overflow-hidden relative"
                disabled={isSubmitting || isSubmitted}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      PROCESSING
                    </>
                  ) : isSubmitted ? (
                    <>
                      <CheckCircle size={20} />
                      SENT SUCCESSFULLY
                    </>
                  ) : (
                    <>
                      <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      TRANSMIT MESSAGE
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-300 to-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
