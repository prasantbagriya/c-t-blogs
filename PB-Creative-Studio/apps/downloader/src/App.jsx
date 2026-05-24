import React, { useState, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import { 
  Download, Globe, Zap, Shield, Star, CloudDownload, 
  Cpu, Clipboard, X, Link2, CheckCircle2, History,
  Maximize2, Activity, HardDrive, Share2
} from "lucide-react"
import axios from "axios"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import AnimatedGradientBackground from "./components/AnimatedGradientBackground"
import AboutSection from "./components/AboutSection"
import ContactSection from "./components/ContactSection"
import { cn } from "./lib/utils"

function App() {
  const [url, setUrl] = useState("")
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("video")

  const { scrollY, scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroY = useTransform(scrollY, [0, 400], [0, 50])
  const scrollProgress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [8, -8]), { stiffness: 100, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-8, 8]), { stiffness: 100, damping: 30 })

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

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
    } catch {
      setError("Thermal bypass failed. Video data unreachable. Verify URL.")
    }
    setLoading(false)
  }

  const handleDownload = (formatId) => {
    window.open(`download?url=${encodeURIComponent(url)}&format_id=${formatId}`, "_blank")
  }

  const platforms = [
    { name: "YouTube", icon: "▶" },
    { name: "Instagram", icon: "◉" },
    { name: "TikTok", icon: "♫" },
    { name: "Twitter/X", icon: "✦" },
    { name: "Facebook", icon: "f" }
  ]

  return (
    <div className="min-h-screen bg-transparent text-white font-outfit selection:bg-amber-500/30">
      {/* Thermal Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[100] pointer-events-none">
        <motion.div className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400" style={{ width: scrollProgress }} />
      </div>

      <div className="fixed inset-0 pointer-events-none -z-10">
        <AnimatedGradientBackground />
      </div>
      
      <Navbar />

      <main className="relative z-10 pt-12 md:pt-20">
        <section id="downloader" className="relative pt-6 pb-6 md:pt-10 md:pb-10">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">

              {/* Redesigned Hero Branding */}
              <motion.div
                style={{ opacity: heroOpacity, y: heroY, rotateX, rotateY }}
                onMouseMove={handleMouseMove}
                className="text-center relative mb-10"
              >
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-sky-500/10 border border-sky-500/20 rounded-full text-[10px] font-black tracking-[0.4em] text-sky-400 mb-12 animate-float uppercase backdrop-blur-3xl">
                  <Activity size={12} className="animate-pulse" />
                  Stellar Core v7.0.0 Active
                </div>
                <h1 className="text-5xl md:text-[8rem] font-black tracking-[-0.05em] mb-6 md:mb-10 leading-[0.8] uppercase italic text-glow-sharp">
                  Stellar <br />
                  <span className="text-gradient-stellar not-italic">Extractor</span>.
                </h1>
                <p className="text-slate-400 text-lg md:text-2xl max-w-2xl mx-auto mb-10 md:mb-16 font-medium leading-relaxed tracking-tight px-4">
                  Surgical media harvesting across global digital ecosystems. <br className="hidden md:block" />
                  Accelerated. Lossless. Engineering-Grade.
                </p>
              </motion.div>

              {/* Extraction Console */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative max-w-4xl mx-auto mb-10 group"
              >
                {/* Glow effects */}
                <div className="absolute -inset-10 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-all duration-500" />
                
                <div
                  ref={searchContainerRef}
                  onMouseMove={handleSearchMouseMove}
                  className="search-glow-wrapper console-card relative rounded-[2rem] md:rounded-[3rem] p-4 md:p-8"
                >
                  {/* Console Header */}
                  <div className="flex items-center justify-between mb-10 px-6">
                    <div className="flex items-center gap-3 text-sky-400/80">
                      <Cpu size={20} />
                      <span className="console-terminal">Stellar Node_01 Initialized</span>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                      {platforms.map(p => (
                        <span key={p.name} className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">{p.name}</span>
                      ))}
                    </div>
                  </div>

                  {/* Input Matrix */}
                  <div className="relative flex flex-col md:flex-row items-center gap-4 bg-black/40 p-2 md:p-3 rounded-2xl md:rounded-[2rem] border border-white/[0.03]">
                    <div className="flex-1 w-full flex items-center gap-3 md:gap-5 px-4 md:px-6 py-2 md:py-3">
                      <Link2 className="text-sky-400/50" size={24} />
                      <input
                        type="url"
                        className="bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder-slate-700 w-full text-lg font-bold tracking-tight"
                        placeholder="Feed source URL into the Stellar core..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fetchInfo()}
                      />
                      {url && <button onClick={() => setUrl("")} className="p-2 hover:bg-white/5 rounded-full"><X size={16} className="text-slate-500" /></button>}
                    </div>

                    <button
                      onClick={fetchInfo}
                      disabled={loading || !url}
                      className={cn(
                        "w-full md:w-auto px-6 md:px-12 py-4 md:py-6 rounded-xl md:rounded-[1.5rem] btn-stellar flex items-center justify-center gap-4 transition-all hover:scale-105",
                        (loading || !url) && "opacity-50 cursor-not-allowed grayscale"
                      )}
                    >
                      {loading ? <Cpu className="animate-spin" size={20} /> : <Zap size={20} className="fill-current" />}
                      <span className="text-[11px] font-black uppercase tracking-[0.3em]">Engage Capture</span>
                    </button>
                  </div>

                  {/* Operational Status */}
                  <div className="mt-8 px-6 flex flex-wrap justify-between items-center gap-6">
                    <div className="flex gap-8">
                      <div className="flex flex-col">
                        <span className="console-terminal">Integrity</span>
                        <span className="text-xs font-bold text-zinc-400">99.8% Valid</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="console-terminal">Encryption</span>
                        <span className="text-xs font-bold text-zinc-400">AES-256</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-2 bg-sky-400/5 rounded-xl border border-sky-400/10">
                      <History size={14} className="text-sky-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">Live Status: Optimally Operational</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Cinematic Results View */}
              <AnimatePresence mode="wait">
                {info && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="max-w-6xl mx-auto"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      
                      {/* Thumbnail Core */}
                      <div className="lg:col-span-12 relative rounded-[1.5rem] md:rounded-[3rem] overflow-hidden group border border-white/5 shadow-3xl aspect-video md:aspect-[21/9]">
                        <img src={info.thumbnail} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Extracted media" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                        <div className="extraction-scanline" />
                        
                        <div className="absolute top-4 md:top-8 left-4 md:left-8 flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-5 md:py-2 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full">
                          <Activity size={12} className="text-amber-500" />
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none">Yield Captured</span>
                        </div>

                        <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-6">
                          <div className="flex-1">
                            <h2 className="text-lg sm:text-2xl md:text-5xl font-black tracking-tighter text-white leading-tight mb-2 md:mb-3 line-clamp-2 uppercase">
                              {info.title}
                            </h2>
                            <div className="flex flex-wrap gap-2 md:gap-4">
                              <span className="px-2 md:px-3 py-1 bg-amber-500 text-black text-[8px] md:text-[10px] font-black uppercase rounded-lg">4K Available</span>
                              <span className="text-zinc-400 text-[10px] md:text-xs font-bold leading-relaxed">{info.duration} Extracted</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="flex -space-x-3">
                              {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-bold">U{i}</div>)}
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Extracted by Multi-Core Nova</span>
                          </div>
                        </div>
                      </div>

                      {/* Harvesting Options */}
                      <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Video Tier */}
                        <div className="console-card rounded-[2.5rem] p-8">
                          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                            <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-[0.15em]">
                              <Download size={18} className="text-amber-500" /> High-Yield Video
                            </h3>
                            <span className="text-[10px] font-bold text-zinc-600">NVV-EXTRACT-V2</span>
                          </div>
                          <div className="grid gap-3">
                            {(info.formats || []).filter(f => f.vcodec !== "none" && f.quality !== "N/A").slice(0, 5).map((fmt, i) => (
                              <button
                                key={i}
                                onClick={() => handleDownload(fmt.id)}
                                className="group flex items-center justify-between p-5 bg-white/[0.03] hover:bg-amber-500/10 border border-white/[0.05] hover:border-amber-500/30 rounded-2xl transition-all"
                              >
                                <div className="flex flex-col text-left">
                                  <span className="text-sm font-black tracking-tight">{fmt.quality}</span>
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase">{fmt.ext} · {fmt.filesize ? `${(fmt.filesize/1024/1024).toFixed(1)}MB` : 'AUTO'}</span>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-sky-400 flex items-center justify-center transition-all">
                                  <CloudDownload size={16} className="text-slate-400 group-hover:text-black" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Audio Tier */}
                        <div className="console-card rounded-[2.5rem] p-8 border-amber-500/5">
                          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                            <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-[0.15em]">
                              <Zap size={18} className="text-orange-500" /> Sonic Capture
                            </h3>
                            <span className="text-[10px] font-bold text-zinc-600">NVA-CAPTURE-V2</span>
                          </div>
                          <div className="grid gap-3">
                            {(info.formats || []).filter(f => f.vcodec === "none").slice(0, 5).map((fmt, i) => (
                              <button
                                key={i}
                                onClick={() => handleDownload(fmt.id)}
                                className="group flex items-center justify-between p-5 bg-white/[0.03] hover:bg-orange-500/10 border border-white/[0.05] hover:border-orange-500/30 rounded-2xl transition-all"
                              >
                                <div className="flex flex-col text-left">
                                  <span className="text-sm font-black tracking-tight">{fmt.abr ? `${fmt.abr}kbps Audio` : 'HQ Audio'}</span>
                                  <span className="text-[10px] font-bold text-zinc-500 uppercase">{fmt.ext} · Lossless Wave</span>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-orange-500 flex items-center justify-center transition-all">
                                  <Zap size={16} className="text-zinc-600 group-hover:text-white" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="mt-8 flex justify-center gap-6">
                      <button onClick={() => setInfo(null)} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                        <X size={14} /> Clear Active Data
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error State */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="max-w-2xl mx-auto mt-12 p-6 bg-red-500/10 border border-red-500/30 rounded-[2rem] flex items-center gap-4 text-red-500"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                      <X size={20} />
                    </div>
                    <div>
                      <h4 className="font-black uppercase text-xs tracking-widest">Protocol Exception</h4>
                      <p className="text-sm font-bold opacity-80">{error}</p>
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
