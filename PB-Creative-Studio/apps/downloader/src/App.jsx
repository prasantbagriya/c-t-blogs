import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Download, CloudDownload, Cpu, X, Link2, 
  History, Activity, Shield, Zap
} from "lucide-react"
import axios from "axios"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import AboutSection from "./components/AboutSection"
import ContactSection from "./components/ContactSection"
import { cn } from "./lib/utils"

function App() {
  const [url, setUrl] = useState("")
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchContainerRef = useRef(null)
  const handleSearchMouseMove = (e) => {
    if (!searchContainerRef.current) return
    const rect = searchContainerRef.current.getBoundingClientRect()
    searchContainerRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`)
    searchContainerRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`)
  }

  const fetchInfo = async () => {
    if (!url) return
    setLoading(true)
    setError(null)
    setInfo(null)
    try {
      const res = await axios.post("info", { url })
      setInfo(res.data)
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error)
      } else {
        setError("Thermal bypass failed. Video data unreachable. Verify URL.")
      }
    }
    setLoading(false)
  }

  const handleDownload = (formatId, ext) => {
    window.open(`download?url=${encodeURIComponent(url)}&format_id=${formatId}&ext=${ext}`, "_blank")
  }

  const platforms = [
    { name: "YouTube", icon: "▶" },
    { name: "Instagram", icon: "◉" },
    { name: "TikTok", icon: "♫" },
    { name: "Twitter/X", icon: "✦" },
    { name: "Facebook", icon: "f" }
  ]

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-200 font-outfit selection:bg-white/10 selection:text-white">
      <Navbar />

      <main className="relative z-10 pt-20">
        <section id="downloader" className="relative pt-4 pb-20 md:pt-6 md:pb-24 border-b border-zinc-900 bg-[#030303]">
          
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
            <div className="w-full">

              {/* Clean Minimalist Hero Branding */}
              <div className="text-center relative mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-semibold tracking-wider text-zinc-400 mb-6 uppercase">
                  Stellar Core v8.0 Active
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 uppercase leading-tight">
                  Solar Extractor
                </h1>
                
                <p className="text-zinc-500 text-sm md:text-base max-w-xl mx-auto mb-10 font-medium leading-relaxed px-4">
                  Surgical media extraction across global digital networks. <br />
                  Accelerated. Lossless. Minimalist.
                </p>
              </div>

              {/* Minimalist Extraction Console */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-5xl mx-auto mb-16 group"
              >
                {/* Clean Console Frame */}
                <div 
                  ref={searchContainerRef}
                  onMouseMove={handleSearchMouseMove}
                  className="search-glow-wrapper console-card relative rounded-2xl p-6 md:p-8 border border-zinc-800/80 bg-zinc-900/10"
                >
                  {/* Console Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800/50">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
                        Solar extraction console node_01
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {platforms.map(p => (
                        <span 
                          key={p.name} 
                          className="text-[9px] font-semibold text-zinc-600 uppercase tracking-widest"
                        >
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Input Matrix */}
                  <div className="relative mb-6">
                    <div className="relative flex flex-col sm:flex-row items-center gap-3 bg-zinc-950/80 p-2 rounded-xl border border-zinc-800 focus-within:border-zinc-700 transition-all">
                      <div className="flex-1 w-full flex items-center gap-3 px-3 py-2">
                        <Link2 className="text-zinc-500" size={18} />
                        <input
                          type="url"
                          className="bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder-zinc-700 w-full text-sm font-medium"
                          placeholder="Feed target media URL..."
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && fetchInfo()}
                        />
                        {url && (
                          <button 
                            onClick={() => setUrl("")} 
                            className="p-1 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={fetchInfo}
                        disabled={loading || !url}
                        className={cn(
                          "w-full sm:w-auto px-6 py-3 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs tracking-wider uppercase transition-all duration-200 shrink-0",
                          (loading || !url) && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        {loading ? "Processing..." : "Capture"}
                      </button>
                    </div>
                  </div>

                  {/* Operational Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800/50 text-left">
                    <div>
                      <span className="font-mono text-[9px] tracking-wider text-zinc-600 uppercase block">CORE INTEGRITY</span>
                      <span className="text-xs font-semibold text-zinc-400 block mt-0.5">99.8% STABLE</span>
                    </div>
                    <div>
                      <span className="font-mono text-[9px] tracking-wider text-zinc-600 uppercase block">ENCRYPTION LAYER</span>
                      <span className="text-xs font-semibold text-zinc-400 block mt-0.5">AES-256 SECURE</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <div>
                        <span className="font-mono text-[9px] tracking-wider text-zinc-600 uppercase block">LIVE TELEMETRY</span>
                        <span className="text-xs font-semibold text-emerald-500 block mt-0.5">ONLINE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Minimalist Results View */}
              <AnimatePresence mode="wait">
                {info && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-5xl mx-auto"
                  >
                    <div className="grid grid-cols-1 gap-6">
                      
                      {/* Media Card */}
                      <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/10 p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-full md:w-48 aspect-video rounded-lg overflow-hidden border border-zinc-800 shrink-0">
                          <img src={info.thumbnail} className="w-full h-full object-cover" alt="Captured media" />
                        </div>
                        
                        <div className="flex-1 w-full text-left">
                          <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 text-[9px] font-semibold uppercase rounded-md">
                            Yield Captured
                          </span>
                          <h2 className="text-lg md:text-xl font-bold text-white leading-tight mt-2 mb-3">
                            {info.title}
                          </h2>
                          <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                            <span>Duration: {info.duration}</span>
                            <span>•</span>
                            <span>HQ Extracted</span>
                          </div>
                        </div>
                      </div>

                      {/* Download Formats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Video */}
                        <div className="console-card rounded-xl p-6 border border-zinc-800 bg-zinc-900/10 text-left">
                          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white mb-4 pb-2 border-b border-zinc-800/50">
                            <Download size={14} className="text-zinc-400" /> High-Yield Video
                          </h3>
                          <div className="grid gap-2">
                            {(info.formats || []).filter(f => f.vcodec && f.vcodec !== "none" && f.vcodec !== "null" && f.quality !== "N/A").slice(0, 6).map((fmt, i) => (
                              <button
                                key={i}
                                onClick={() => handleDownload(fmt.id, fmt.ext)}
                                className="group flex items-center justify-between p-3.5 bg-zinc-950/40 hover:bg-zinc-800/30 border border-zinc-800/50 rounded-lg transition-all"
                              >
                                <div className="flex flex-col text-left">
                                  <span className="text-xs font-bold text-zinc-200">{fmt.quality}</span>
                                  <span className="text-[9px] font-semibold text-zinc-500 uppercase">{fmt.ext} · {fmt.filesize ? `${(fmt.filesize/1024/1024).toFixed(1)}MB` : 'AUTO'}</span>
                                </div>
                                <div className="w-8 h-8 rounded bg-zinc-800/80 group-hover:bg-white group-hover:text-black flex items-center justify-center transition-colors">
                                  <CloudDownload size={14} className="text-zinc-400 group-hover:text-black" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Audio */}
                        <div className="console-card rounded-xl p-6 border border-zinc-800 bg-zinc-900/10 text-left">
                          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white mb-4 pb-2 border-b border-zinc-800/50">
                            <Zap size={14} className="text-zinc-400" /> Sonic Capture
                          </h3>
                          <div className="grid gap-2">
                            {(info.formats || []).filter(f => !f.vcodec || f.vcodec === "none" || f.vcodec === "null").slice(0, 6).map((fmt, i) => (
                              <button
                                key={i}
                                onClick={() => handleDownload(fmt.id, fmt.ext)}
                                className="group flex items-center justify-between p-3.5 bg-zinc-950/40 hover:bg-zinc-800/30 border border-zinc-800/50 rounded-lg transition-all"
                              >
                                <div className="flex flex-col text-left">
                                  <span className="text-xs font-bold text-zinc-200">{fmt.abr ? `${Math.round(fmt.abr)}kbps Audio` : 'HQ Audio'}</span>
                                  <span className="text-[9px] font-semibold text-zinc-500 uppercase">{fmt.ext} · Lossless</span>
                                </div>
                                <div className="w-8 h-8 rounded bg-zinc-800/80 group-hover:bg-white group-hover:text-black flex items-center justify-center transition-colors">
                                  <Zap size={14} className="text-zinc-400 group-hover:text-black" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="mt-8 flex justify-center">
                      <button 
                        onClick={() => setInfo(null)} 
                        className="px-6 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg font-bold uppercase text-[10px] tracking-wider transition-colors flex items-center gap-2"
                      >
                        <X size={12} /> Clear Active Data
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Minimalist Error State */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="max-w-xl mx-auto mt-8 p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center gap-4 text-red-400 text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                      <X size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold uppercase text-[10px] tracking-wider">Protocol Exception</h4>
                      <p className="text-xs font-medium opacity-80 mt-0.5">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </section>

        <AboutSection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  )
}

export default App
