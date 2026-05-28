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
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  return (
    <section id="contact" ref={ref} className="py-24 relative overflow-hidden border-t border-zinc-900 bg-[#030303]">
      {/* Decorative Fading Divider Line at top */}
      <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 relative z-10 text-left"
      >
        <div className="flex flex-col md:flex-row gap-16 items-stretch">
          <div className="flex-1">
            <motion.div variants={itemVariants}>
              <div className="mb-8">
                <span className="text-zinc-500 font-mono text-[10px] font-bold tracking-[0.2em] block mb-3 uppercase">
                  // 02 / SECURE COMMUNICATION CHANNEL
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase leading-tight">
                  Establish Secure <br />
                  <span className="text-gradient-stellar">Link</span>.
                </h2>
              </div>

              <div className="space-y-8 mt-10">
                <div className="flex items-start gap-5 group">
                  <div className="w-11 h-11 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-zinc-700 transition-colors">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-200">Support Email</h4>
                    <p className="text-sm text-zinc-500 font-semibold mt-1">support@nextgen-x.tech</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-5 group">
                  <div className="w-11 h-11 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-zinc-700 transition-colors">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-200">Live Chat</h4>
                    <p className="text-sm text-zinc-500 font-semibold mt-1">Available 24/7 for premium members</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-11 h-11 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-zinc-700 transition-colors">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-200">Enterprise Solutions</h4>
                    <p className="text-sm text-zinc-500 font-semibold mt-1">Direct integration for high-volume needs</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="flex-1 console-card rounded-xl p-6 md:p-8 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase ml-0.5 mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-zinc-700 rounded-xl p-3 text-sm text-white placeholder-zinc-700 focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase ml-0.5 mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-zinc-700 rounded-xl p-3 text-sm text-white placeholder-zinc-700 focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase ml-0.5 mb-1.5 block">Message</label>
                <textarea
                  name="message"
                  placeholder="Tell us about your project..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-zinc-700 rounded-xl p-3 text-sm text-white placeholder-zinc-700 focus:outline-none transition-all resize-none"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold flex items-center justify-center gap-2 transition-all duration-200 transform active:scale-95 text-xs uppercase tracking-wider"
                disabled={isSubmitting || isSubmitted}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin text-black" size={16} />
                    <span>Processing</span>
                  </>
                ) : isSubmitted ? (
                  <>
                    <CheckCircle className="text-black" size={16} />
                    <span>Sent Successfully</span>
                  </>
                ) : (
                  <>
                    <Send className="text-black" size={16} />
                    <span>Transmit Message</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
